const fs = require("fs")
const yaml = require("js-yaml")

const {
    exec
} = require("./process")

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

        return args
    }
}