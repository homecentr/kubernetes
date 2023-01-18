const fs = require("fs")
const path = require("path")
const yaml = require("js-yaml")
const readline = require('readline');

const {
    execSync,
    exec
} = require("child_process");

// const util = require('util');
// const exec = util.promisify(require('child_process').exec);

const environments = [
    'lab',
    'prod'
]

const getApps = () => {
    const index = yaml.load(fs.readFileSync("apps/_index/values-apps.yml"))

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

class App {
    lint(environmentName) {
        const helmArgs = this.getHelmArgs(environmentName)

        this.executeHelmCommand("lint", helmArgs, "stdout")
    }

    render(environmentName) {
        const helmArgs = this.getHelmArgs(environmentName)

        this.executeHelmCommand("template", helmArgs, "stderr")
    }

    installDependencies() {
        this.executeHelmCommand("dependency update", "", "stderr")
    }

    async executeHelmCommand(commandName, args, failureOutput = 'stdout') {
        const command = `helm ${commandName} ${this.getChartDirectory()} ${args}`

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
            } else {
                console.log(`❌ ${this.getChartDirectory()} has failed:`)

                if (failureOutput) {
                    buffer.forEach(entry =>{
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
    "render": () => getCurrentDirApp().render(getEnvironmentFromArgs()),

    "lint:all": () => {
        const environmentName = getEnvironmentFromArgs()
        getApps().forEach(app => app.lint(environmentName))
    },
    "render:all": () => {
        const environmentName = getEnvironmentFromArgs()
        getApps().forEach(app => app.render(environmentName))
    },

    "deps": () => getCurrentDirApp().installDependencies(),
    "deps:all": () => getApps().forEach(app => app.installDependencies()),
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




















// /*
// renderCurrentDir
//     -> findApp(dirName)
//     -> getHelmArgs(app)
//     -> renderHelmChart(app, args)         _index won't be found !!!
// lintCurrentDir
//     -> findApp(dirName)
//     -> getHelmArgs(app)
//     -> lintHelmChart(app, args)
// */

// const findApp = (appName) => {
//     const app = getAllApps().find(app => app.name == dirName)

//     if (!app) {
//         console.error(`App '${dirName}' could not be found in the _index app.`)
//         process.exit(1)
//     }
// }






// exports.renderCurrentDirectory = (environmentName) => {
//     const currentPath = process.env.INIT_CWD
//     const dirName = path.basename(currentPath)

//     if (dirName === "_index") {
//         renderAppIndex(environmentName)
//     } else {
//         const app = findApp(dirName)

//         renderApp(app, environmentName)
//     }
// }

// exports.lintCurrentDirectory = (environmentName) => {
//     const appName = path.basename(process.env.INIT_CWD)

//     lintHelmChart(`apps/${appName}`, environmentName)
// }

// exports.renderAll = (environmentName) => {
//     renderAppIndex(environmentName)

//     getAllApps().forEach(app => {
//         renderApp(app, getAppHelmArgs(app, environmentName))
//     })
// }

// exports.lintAll = (environmentName) => {
//     lintHelmChart("apps/_index")

//     getAllApps().forEach(app => {
//         lintHelmChart(`apps/${app.name}`, getAppHelmArgs(app, environmentName))
//     })
// }

// exports.installDependenciesCurrentDirectory = () => {
//     installHelmChartDependencies(process.env.INIT_CWD)
// }

// exports.installDependenciesAll = () => {
//     getAllApps().forEach(app => {
//         installHelmChartDependencies(`apps/${app.name}`)
//     })
// }


// const getAppHelmArgs = (appName, environmentName) => {
//     if(appName == "_index") {

//     }
//     else {

//     }
// }

// const renderApp = (app, environmentName) => {
//     const valueFiles = []

//     if (app.valueFiles) {
//         app.valueFiles.forEach(valueFile => {
//             valueFiles.push(valueFile.replace("$env", environmentName))
//         })
//     }

//     return renderHelmChart(`apps/${app.name}`, valueFiles, null)
// }

// const renderAppIndex = (environmentName) => {
//     const values = {
//         "source.repoUrl": "https://github.com/some-repo",
//         "source.targetRevision": "some-branch",
//         "environmentName": "lab"
//     }

//     const valueFiles = [
//         `values-${environmentName}.yml`,
//         "values-apps.yml"
//     ]

//     renderHelmChart("apps/_index", valueFiles, values)
// }

// const lintHelmChart = (chartDirectory) => {
//     const command = `helm lint ${chartDirectory}`

//     try {
//         execSync(command, {
//             stdio: 'pipe'
//         })

//         console.log(`✔️  ${chartDirectory} linted successfully`)
//     } catch (err) {
//         console.log(`❌ Linting ${chartDirectory} has failed:`)

//         const outputLines = err.stdout.toString().split('\n')
//         outputLines.forEach(line => console.log(`   ${line}`));

//         process.exitCode = 2
//     }
// }

// const renderHelmChart = (chartDirectory, valueFiles, values) => {
//     let command = `helm template ${chartDirectory}`

//     if (valueFiles) {
//         valueFiles.forEach(valueFile => {
//             command += ` -f \"${chartDirectory}/${valueFile}\"`
//         })
//     }

//     if (values) {
//         Object.keys(values).forEach(key => {
//             command += ` --set \"${key}=${values[key]}\"`
//         })
//     }

//     try {
//         execSync(command, {
//             stdio: 'pipe'
//         })

//         console.log(`✔️  ${chartDirectory} rendered successfully`)
//     } catch (err) {
//         console.log(`❌ Rendering ${chartDirectory} has failed:`)

//         const outputLines = err.stderr.toString().split('\n')
//         outputLines.forEach(line => console.log(`   ${line}`));

//         process.exitCode = 2
//     }
// }

// const installHelmChartDependencies = (chartDirectory) => {
//     execSync(`helm dependency update ${chartDirectory}`)

//     console.log(`✔️  ${chartDirectory} dependencies installed`)
// }

// const getAllApps = () => {
//     const appIndex = yaml.load(fs.readFileSync("apps/_index/values-apps.yml"))

//     return appIndex.applications
// }