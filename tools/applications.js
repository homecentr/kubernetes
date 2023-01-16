const fs = require("fs")
const path = require("path")
const yaml = require("js-yaml")

const {
    execSync
} = require("child_process");

exports.renderCurrentDirectory = (environmentName) => {
    const currentPath = process.env.INIT_CWD
    const dirName = path.basename(currentPath)

    if (dirName === "_index") {
        renderAppIndex(environmentName)
    } else {
        const app = getAllApps().find(app => app.name == dirName)

        if (!app) {
            console.error(`App '${dirName}' could not be found in the _index app.`)
            process.exit(1)
        }

        renderApp(app, environmentName)
    }
}

exports.lintCurrentDirectory = () => {
    const appName = path.basename(process.env.INIT_CWD)

    lintHelmChart(`apps/${appName}`)
}

exports.renderAll = (environmentName) => {
    renderAppIndex(environmentName)

    getAllApps().forEach(app => {
        renderApp(app, environmentName)
    })
}

exports.lintAll = () => {
    lintHelmChart("apps/_index")

    getAllApps().forEach(app => {
        lintHelmChart(`apps/${app.name}`)
    })
}

exports.installDependenciesCurrentDirectory = () => {
    installHelmChartDependencies(process.env.INIT_CWD)
}

exports.installDependenciesAll = () => {
    getAllApps().forEach(app => {
        installHelmChartDependencies(`apps/${app.name}`)
    })
}

const renderApp = (app, environmentName) => {
    const valueFiles = []

    if (app.valueFiles) {
        app.valueFiles.forEach(valueFile => {
            valueFiles.push(valueFile.replace("$env", environmentName))
        })
    }

    return renderHelmChart(`apps/${app.name}`, valueFiles, null)
}

const renderAppIndex = (environmentName) => {
    const values = {
        "source.repoUrl": "https://github.com/some-repo",
        "source.targetRevision": "some-branch",
        "environmentName": "lab"
    }

    const valueFiles = [
        `values-${environmentName}.yml`,
        "values-apps.yml"
    ]

    renderHelmChart("apps/_index", valueFiles, values)
}

const lintHelmChart = (chartDirectory) => {
    const command = `helm lint ${chartDirectory}`

    try {
        execSync(command, {
            stdio: 'pipe'
        })

        console.log(`✔️  ${chartDirectory} linted successfully`)
    } catch (err) {
        console.log(`❌ Linting ${chartDirectory} has failed:`)

        const outputLines = err.stdout.toString().split('\n')
        outputLines.forEach(line => console.log(`   ${line}`));

        process.exitCode = 2
    }
}

const renderHelmChart = (chartDirectory, valueFiles, values) => {
    let command = `helm template ${chartDirectory}`

    if (valueFiles) {
        valueFiles.forEach(valueFile => {
            command += ` -f \"${chartDirectory}/${valueFile}\"`
        })
    }

    if (values) {
        Object.keys(values).forEach(key => {
            command += ` --set \"${key}=${values[key]}\"`
        })
    }

    try {
        execSync(command, {
            stdio: 'pipe'
        })

        console.log(`✔️  ${chartDirectory} rendered successfully`)
    } catch (err) {
        console.log(`❌ Rendering ${chartDirectory} has failed:`)

        const outputLines = err.stderr.toString().split('\n')
        outputLines.forEach(line => console.log(`   ${line}`));

        process.exitCode = 2
    }
}

const installHelmChartDependencies = (chartDirectory) => {
    execSync(`helm dependency update ${chartDirectory}`)

    console.log(`✔️  ${chartDirectory} dependencies installed`)
}

const getAllApps = () => {
    const appIndex = yaml.load(fs.readFileSync("apps/_index/values-apps.yml"))

    return appIndex.applications
}