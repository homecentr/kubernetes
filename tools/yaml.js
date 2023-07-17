const fs = require("fs")
const yaml = require("js-yaml")

const { sopsDecrypt } = require("sops-wrapper")

const validateValuesFile = (fileName) => {
    if (!fs.existsSync(fileName)) {
        console.log(`❌ ${fileName} does not exist`)
        return
    } else {
        try {
            yaml.load(fs.readFileSync(fileName))

            console.log(`✔️  ${fileName} is a valid yaml`)
        } catch (err) {
            console.log(`❌ ${fileName} is not a valid yaml (${err})`)
            return
        }
    }
}

const validateSecretFile = (fileName) => {
    if (!fs.existsSync(fileName)) {
        console.log(`❌ ${fileName} does not exist`)
        return
    } else {
        try {
            sopsDecrypt(fileName)

            console.log(`✔️  ${fileName} is a valid yaml`)
        } catch (err) {
            console.log(`❌ ${fileName} is not a valid sops file (${err})`)
            return
        }
    }
}

module.exports = {
    validateValuesFile,
    validateSecretFile
}