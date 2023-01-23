const fs = require("fs")
const path = require("path")
const yaml = require("js-yaml")

const {
    exec
} = require("child_process");

const environments = [
    'lab',
    'prod'
]

const getApps = () => {
    const index = yaml.load(fs.readFileSync("apps/_index/values.apps.yml"))

    index.applications.push({
        name: "_index",
        values: {
            "source.repoUrl": "https://github.com/some-repo",
            "source.targetRevision": "some-branch",
            "environmentName": "lab"
        },
        valueFiles: [
            "values-$env.yml",
            "values-apps.yml"
        ]
    })

    const apps = index.applications.map(appData => {
        const app = new App()
        Object.assign(app, appData)

        return app
    })

    return apps
}

const getHelmApps = () => {
    return getApps().filter(app => app.type == "helm")
}

class App {
    lint(environmentName) {
        const helmArgs = this.getHelmArgs(environmentName)

        this.executeHelmCommand("lint", helmArgs)
    }

    render(environmentName, showYaml, showCommand) {
        let helmArgs = this.getHelmArgs(environmentName)

        this.executeHelmCommand("template", helmArgs, showYaml, true, showCommand)
    }

    installDependencies() {
        this.executeHelmCommand("dependency update", "")
    }

    async executeHelmCommand(commandName, args, showOutputOnSuccess = false, showOutputOnFailure = true, showCommand = false) {
        const command = `helm ${commandName} ${this.getChartDirectory()} ${args}`

        if (showCommand) {
            console.log(command)
        }

        const buffer = []

        const execution = exec(command, {
            stdio: ['pipe']
        })

        execution.stdout.on('data', (data) => {
            buffer.push(data)
        })

        execution.stderr.on('data', (data) => {
            buffer.push(data)
        })

        execution.on('exit', (exitCode) => {
            process.exitCode = exitCode

            if (exitCode == 0) {
                console.log(`✔️  ${this.getChartDirectory()}`)

                if (showOutputOnSuccess) {
                    buffer.forEach(entry => {
                        entry.split('\n').forEach(line => console.log(`     ${line}`))
                    });
                }
            } else {
                console.log(`❌ ${this.getChartDirectory()} has failed:`)

                if (showOutputOnFailure) {
                    buffer.forEach(entry => {
                        entry.split('\n').forEach(line => console.log(`     ${line}`))
                    });
                }
            }
        })
    }

    getChartDirectory() {
        return `apps/${this.name}`
    }

    getHelmArgs(environmentName) {
        let args = ""

        if (this.valueFiles) {
            this.valueFiles.forEach(valueFile => {
                const resolveValueFile = valueFile.replace("$env", environmentName)

                args += ` -f \"${this.getChartDirectory()}/${resolveValueFile}\"`
            })
        }

        if (this.secretValueFiles) {
            this.secretValueFiles.forEach(valueFile => {
                const resolveValueFile = valueFile.replace("$env", environmentName)

                args += ` -f \"secrets://${this.getChartDirectory()}/${resolveValueFile}\"`
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

const commands = {
    "lint": () => getCurrentDirApp().lint(getEnvironmentFromArgs()),
    "render": () => getCurrentDirApp().render(getEnvironmentFromArgs(), false, true),
    "render:debug": () => getCurrentDirApp().render(getEnvironmentFromArgs(), true, true),

    "lint:all": () => {
        const environmentName = getEnvironmentFromArgs()
        getHelmApps().forEach(app => app.lint(environmentName))
    },
    "render:all": () => {
        const environmentName = getEnvironmentFromArgs()
        getHelmApps().forEach(app => app.render(environmentName))
    },

    "deps": () => getCurrentDirApp().installDependencies(),
    "deps:all": () => getHelmApps().forEach(app => app.installDependencies()),
}


const getCurrentDirApp = () => {
    const currentPath = process.env.INIT_CWD
    const dirName = path.basename(currentPath)

    const app = getApps().find(app => app.name == dirName)

    if (!app) {
        console.error(`Directory ${dirName} is not an app or it's not registered in _index app.`)

        process.exit(1)
    }

    return app
}

const getEnvironmentFromArgs = () => {
    if (!process.argv ||
        process.argv.length < 3 ||
        !environments.includes(process.argv[2])) {

        console.error(`Missing argument - please specify one of the following environments: ${environments.join(',')}`)
        process.exit(1)
    }

    return process.argv[2]
}

const commandName = process.env.npm_lifecycle_event

if (commandName in commands) {
    commands[commandName]()
} else {
    console.error(`Command ${command} does not exist`)
    process.exit(1)
}