const os = require("os");
const fs = require("fs")
const path = require("path")
const yaml = require("js-yaml")
const {
    diffFiles,
    diffSopsFiles
} = require("@homecentr/yaml-diff")

const {
    execSync
} = require("child_process")

const {
    exec
} = require("./process")

const {
    validateValuesFile,
    validateSecretFile
} = require("./yaml")

exports.getAllApps = () => {
    const index = yaml.load(fs.readFileSync("apps/_index/values.apps.yml"))

    index.applications.push({
        name: "_index",
        type: "helm",
        values: {
            "source.repoUrl": "https://github.com/some-repo",
            "source.targetRevision": "some-branch",
            "environmentName": "lab"
        },
        valueFiles: [
            "values.$env.yml",
            "values.apps.yml"
        ]
    })

    const apps = index.applications.map(appData => {
        const app = new App()
        Object.assign(app, appData)

        return app
    })

    return apps
}

class App {
    async lint(environmentName) {
        const args = this.getHelmArgs(environmentName)
        const command = `helm lint ${this.getAppDirectory()} ${args}`

        const result = await exec(command)

        if (result.exitCode == 0) {
            console.log(`✔️  ${this.getAppDirectory()}`)
        } else {
            console.log(`❌ ${this.getAppDirectory()} has following errors:`)
            console.log(result.stdcombined.getIndented())
        }

        return result.exitCode == 0
    }

    async render(environmentName, options = {
        debug: false,
        showYaml: false,
        outputDir: undefined
    }) {
        let args = this.getHelmArgs(environmentName)

        if (options.debug) {
            args += " --debug"
        }

        if (options.outputDir) {
            args += ` --output-dir \"${options.outputDir}\"`
        }

        const command = `helm template ${this.getAppDirectory()} ${args}`

        if (options.debug) {
            console.log(`"Helm command: '${command}'`)
        }

        const result = await exec(command)

        if (result.exitCode == 0) {
            console.log(`✔️  ${this.getAppDirectory()} (helm render)`)

            if (options.showYaml) {
                console.log(result.stdout.getIndented())
            }
        } else {
            console.log(`❌ ${this.getAppDirectory()} (helm render) has failed:`)
            console.log(result.stdcombined.getIndented())
        }

        return result.exitCode == 0
    }

    async scan(environmentName, options = {
        showResults: false,
        htmlOutput: false,
        debug: false
    }) {
        let scanDirectory

        const appTmpDir = this.createAppTempDir(environmentName)
        const exceptionsFile = path.join(this.getAppDirectory(), ".kubescape-exceptions.json")

        if (this.type == "helm") {
            // Render helm chart
            await this.render(environmentName, {
                outputDir: appTmpDir
            })

            const chartNameSubdir = fs.readdirSync(appTmpDir)[0];

            scanDirectory = path.join(appTmpDir, chartNameSubdir, "templates")

        } else {
            scanDirectory = this.getAppDirectory()
        }

        let kubescapeArgs = "--keep-local --fail-threshold 0 --controls-config \"./kubescape.inputs.json\""

        const reportFile = path.join(appTmpDir, "report.html")

        if (options.htmlOutput) {
            kubescapeArgs += ` --format html --output ${reportFile}`
        }

        if (fs.existsSync(exceptionsFile)) {
            kubescapeArgs += ` --exceptions \"${exceptionsFile}\"`
        }

        const command = `kubescape scan ${scanDirectory} ${kubescapeArgs}`

        if (options.debug) {
            console.log(command)
        }

        const result = await exec(command)

        if (result.exitCode == 0) {
            console.log(`✔️  ${this.getAppDirectory()} (kubescape)`)

            if (options.showResults) {
                console.log(result.stdout.getRaw())
            }
        } else {
            if (options.htmlOutput) {
                console.log(`❌ ${this.getAppDirectory()} has failed, see the opened html file for details`)
                execSync(reportFile)
            } else {
                console.log(`❌ ${this.getAppDirectory()} has following errors:`)
                console.log(result.stdout.getRaw())
            }
        }

        return result.exitCode == 0
    }

    async installDependencies() {
        const command = `helm dependency update ${this.getAppDirectory()}`

        const result = await exec(command)

        if (result.exitCode == 0) {
            console.log(`✔️  ${this.getAppDirectory()}`)
        } else {
            console.log(`❌ ${this.getAppDirectory()} has following errors:`)
            console.log(result.stdcombined.getIndented())
        }
    }

    async validateValues() {
        let success = true

        const validateFiles = (fileName, validateOrdinaryFileFunc, diffEnvironmentFilesFunc) => {
            if (!fileName.includes("$env")) {
                // Ordinary file name
                validateOrdinaryFileFunc(path.join(this.getAppDirectory(), fileName))
            } else {
                const labFileName = path.join(this.getAppDirectory(), fileName.replace("$env", "lab"))
                const prodFileName = path.join(this.getAppDirectory(), fileName.replace("$env", "prod"))

                // TODO: Get ignore list from app files
                const differences = diffEnvironmentFilesFunc(labFileName, prodFileName)

                if (differences.length == 0) {
                    console.log(`✔️  ${path.join(this.getAppDirectory(), fileName)} have matching structures`)
                } else {
                    success = false

                    differences.forEach(diff => {
                        console.log(`❌ ${diff.message}`)
                    })
                }
            }
        }

        if (this.valueFiles) {
            this.valueFiles.forEach(valueFile => {
                return validateFiles(valueFile, validateValuesFile, diffFiles)
            })
        }

        if (this.secretValueFiles) {
            this.secretValueFiles.forEach(secretFile => {
                return validateFiles(secretFile, validateSecretFile, diffSopsFiles)
            })
        }

        return success
    }

    getAppDirectory() {
        if (this.path) {
            return this.path
        }

        return `apps/${this.name}`
    }

    getHelmArgs(environmentName) {
        let args = ` -f \"apps/common/values.${environmentName}.yml\"`

        if (this.valueFiles) {
            this.valueFiles.forEach(valueFile => {
                const resolveValueFile = valueFile.replace("$env", environmentName)

                args += ` -f \"${this.getAppDirectory()}/${resolveValueFile}\"`
            })
        }

        if (this.secretValueFiles) {
            this.secretValueFiles.forEach(valueFile => {
                const resolveValueFile = valueFile.replace("$env", environmentName)

                args += ` -f \"secrets://${this.getAppDirectory()}/${resolveValueFile}\"`
            })
        }

        if (this.values) {
            Object.keys(this.values).forEach(key => {
                args += ` --set \"${key}=${this.values[key]}\"`
            })
        }

        args += ` -n ${this.namespace}`

        return args
    }

    createAppTempDir(environmentName) {
        const dirPath = path.join(os.tmpdir(), `app-${this.name}-${environmentName}`)

        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, {
                recursive: true,
                force: true
            });
        }

        fs.mkdirSync(dirPath);

        return dirPath
    }
}