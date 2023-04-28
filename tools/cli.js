const {
    program,
    Argument
} = require('commander');

const path = require("path")

const {
    getAllApps
} = require("./applications")

const {
    exec
} = require("./process")

const environments = ["lab", "prod"]
const getCurrentDirName = () => path.basename(process.env.INIT_CWD)

const getAppByName = appName => {
    const app = getAllApps().find(app => app.name == appName)

    if (!app) {
        console.error(`Application '${appName}' could not be found in the index.`)
        process.exit(1)
    }

    return app
}

const getHelmAppByName = appName => {
    const app = getAppByName(appName)

    if (app.type != "helm") {
        console.error(`Only apps of type 'helm' may be used with this command. The app '${appName}' is of type '${app.type}'.`)
        process.exit(2)
    }

    return app
}

const environmentArg = new Argument("<environment>", `Environment name (valid values ${environments.join(', ')})`)
    .choices(environments)

const appNameArg = new Argument("[appName]", "Application name")
    .default(getCurrentDirName())

program
    .command("lint")
    .addArgument(environmentArg)
    .addArgument(appNameArg)
    .action(async (environment, appName) => {
        const app = getHelmAppByName(appName)

        await app.lint(environment)
    })

program
    .command("lint:all")
    .addArgument(environmentArg)
    .action(async (environment) => {
        const allApps = getAllApps().filter(app => app.type == "helm")

        await allApps.forEach(async (app) => {
            const success = await app.lint(environment)

            if (!success) {
                process.exitCode = 2
            }
        })
    })

program
    .command("render")
    .addArgument(environmentArg)
    .addArgument(appNameArg)
    .option("-d, --debug", "Passed the flag to helm which is useful for debugging failing templates")
    .option("-o, --output", "Shows rendered yaml in case of both success and failure")
    .action(async (environment, appName, options) => {
        const app = getHelmAppByName(appName)

        await app.render(environment, {
            debug: options.debug,
            showYaml: options.output
        })
    })

program
    .command("render:all")
    .addArgument(environmentArg)
    .action(async (environment) => {
        const allApps = getAllApps().filter(app => app.type == "helm")

        await allApps.forEach(async (app) => {
            const success = await app.render(environment)

            if (!success) {
                process.exitCode = 2
            }
        })
    })

program
    .command("scan")
    .addArgument(environmentArg)
    .addArgument(appNameArg)
    .option("-o, --output", "Shows rendered yaml in case of both success and failure")
    .option("-d, --debug", "Shows the executed kubescape command")
    .option("--html", "Shows scan report as an html for better readability")
    .action(async (environment, appName, options) => {
        const app = getAppByName(appName)

        await app.scan(environment, {
            showResults: options.output,
            htmlOutput: options.html,
            debug: options.debug
        })
    })

program
    .command("scan:all")
    .addArgument(environmentArg)
    .action(async (environment) => {
        const allApps = getAllApps()

        await allApps.forEach(async (app) => {
            const success = await app.scan(environment)

            if (!success) {
                process.exitCode = 2
            }
        })
    })

program
    .command("dependencies")
    .alias("deps")
    .addArgument(appNameArg)
    .action(async (appName) => {
        const app = getHelmAppByName(appName)

        await app.installDependencies()
    })

program
    .command("dependencies:all")
    .alias("deps:all")
    .action(async () => {
        const allApps = getAllApps().filter(app => app.type == "helm")
        const processedDirectories = []

        await allApps.forEach(async (app) => {
            if (!processedDirectories.includes(app.getAppDirectory())) {
                await app.installDependencies()

                processedDirectories.push(app.getAppDirectory())
            }
        })
    })

program
    .command("validate-values")
    .addArgument(appNameArg)
    .action(async (appName) => {
        const app = getHelmAppByName(appName)

        const success = await app.validateValues()

        if (!success) {
            process.exitCode = 2
        }
    })

program
    .command("validate-values:all")
    .action(async () => {
        const allApps = getAllApps().filter(app => app.type == "helm")

        await allApps.forEach(async (app) => {
            const success = await app.validateValues()

            if (!success) {
                process.exitCode = 2
            }
        })
    })


program
    .command("test:open")
    .addArgument(environmentArg)
    .action(async (environment) => {
        const command = `cypress open --config-file ./cypress/${environment}.config.js`
        const result = await exec(command)

        if (result.exitCode != 0) {
            console.log(result.stdcombined.getIndented())
        }

        // const cypress = require('cypress')

        // cypress.run({
        //     reporter: 'junit',
        //     browser: 'chrome',
        //     configFile: `./cypress/${environment}.config.js`
        // })
    })

program
    .command("test:all")
    .addArgument(environmentArg)
    .action(async () => {
        // Run all tests, pass the right config
    })

const argv = JSON.parse(process.env.npm_config_argv)

const args = [
    "", // Executable (node)
    "", // Name of the script
    ...(argv.original[0] == "run" ? argv.original.slice(1) : argv.original)
]

program.parse(args)