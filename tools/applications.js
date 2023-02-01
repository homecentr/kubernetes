const os = require("os");
const fs = require("fs")
const path = require("path")
const yaml = require("js-yaml")

const {
    exec
} = require("./process")

const {
    execSync
} = require("child_process")

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
    }

    async render(environmentName, options = {
        debug: false,
        showYaml: false
    }) {
        let args = this.getHelmArgs(environmentName)

        if (options.debug) {
            args += " --debug"
        }

        const command = `helm template ${this.getAppDirectory()} ${args}`

        if(options.debug) {
            console.log(`"Helm command: '${command}'`)
        }

        const result = await exec(command)

        if (result.exitCode == 0) {
            console.log(`✔️  ${this.getAppDirectory()}`)

            if (options.showYaml) {
                console.log(result.stdout.getIndented())
            }
        } else {
            console.log(`❌ ${this.getAppDirectory()} has following errors:`)
            console.log(result.stdcombined.getIndented())
        }
    }

    async scan(environmentName, options = {
        showResults: false,
        htmlOutput: false
    }) {
        let scanDirectory

        const appTmpDir = this.createAppTempDir(environmentName)

        if (this.type == "helm") {
            // Render helm chart
            const helmArgs = this.getHelmArgs(environmentName) + ` --output-dir \"${appTmpDir}\"`
            const command = `helm template ${this.getAppDirectory()} ${helmArgs}`
            const result = await exec(command)

            if (result.exitCode != 0) {
                console.log(`❌ Rendering app '${this.name}' has failed. Fix rendering before scanning for security vulnerabilities.`)
                console.log(result.stdcombined.getIndented())
                process.exit(3)
            }

            const chartName = fs.readdirSync(appTmpDir)[0];

            scanDirectory = path.join(appTmpDir, chartName, "templates")

        } else {
            scanDirectory = this.getAppDirectory()
        }

        let kubescapeArgs = "--keep-local --fail-threshold 0 --controls-config \"./kubescape.inputs.json\""

        const reportFile = path.join(appTmpDir, "report.html")
        
        if(options.htmlOutput) {
            kubescapeArgs += ` --format html --output ${reportFile}`
        }

        const command = `kubescape scan ${scanDirectory} ${kubescapeArgs}`
        console.log(command)

        const result = await exec(command)

        if (result.exitCode == 0) {
            console.log(`✔️  ${this.getAppDirectory()}`)

            if (options.showResults) {
                console.log(result.stdout.getRaw())
            }
        } else {
            if(options.htmlOutput) {
                console.log(`❌ ${this.getAppDirectory()} has failed, see the opened html file for details`)
                execSync(reportFile)
            }
            else {
                console.log(`❌ ${this.getAppDirectory()} has following errors:`)
                console.log(result.stdout.getRaw())
            }
        }
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

    getAppDirectory() {
        if (this.path) {
            return this.path
        }

        return `apps/${this.name}`
    }

    getHelmArgs(environmentName) {
        let args = ""

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