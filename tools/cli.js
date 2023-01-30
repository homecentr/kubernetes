const {
    program,
    Argument
} = require('commander');

const path = require("path")

const {
    getAllApps
} = require("./applications")

const environments = ["lab", "prog"]
const getCurrentDirName = () => path.basename(process.env.INIT_CWD)

const getHelmAppByName = appName => {
    const app = getAllApps().find(app => app.name == appName)

    if (!app) {
        console.error(`Application '${appName}' could not be found in the index.`)
        process.exit(1)
    }

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
            await app.lint(environment)
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
            await app.render(environment)
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

const argv = JSON.parse(process.env.npm_config_argv)

const args = [
    "", // Executable (node)
    "", // Name of the script
    ...(argv.original[0] == "run" ? argv.original.slice(1) : argv.original)
]

program.parse(args)