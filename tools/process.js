const { exec } = require("child_process")

class Output {
    constructor() {
        this.buffer = []
    }

    push(value) {
        this.buffer.push(value)
    }

    getRaw() {
        let result = ""

        this.buffer.forEach(part => result += part)

        return result
    }

    getIndented() {
        const result = []

        this.buffer.forEach(entry => {
            entry.split('\n').forEach(line => result.push(`     ${line}`))
        });

        return result.join("\n")
    }
}

exports.exec = (command) => {
    const promise = new Promise((resolve, reject) => {
        const result = {
            stdcombined: new Output(),
            stdout: new Output(),
            stderr: new Output()
        }

        const execution = exec(command, {
            stdio: ['pipe']
        })

        execution.stdout.on('data', (data) => {
            result.stdcombined.push(data)
            result.stdout.push(data)
        })

        execution.stderr.on('data', (data) => {
            result.stdcombined.push(data)
            result.stderr.push(data)
        })

        execution.on('exit', (exitCode) => {
            result.exitCode = exitCode

            resolve(result)
        })
    })

    return promise
}