const path = require('path')
const prompt = require('prompt')
const jsonfile = require('jsonfile')

const CONFIG_PATH = path.join(__dirname, '..', 'config.json')

let currSettings
try {
  currSettings = jsonfile.readFileSync(CONFIG_PATH)
} catch (error) {
  currSettings = {}
}

const schema = [{
  name: 'discordToken',
  description: '(moobot) Discord Bot Token',
  default: currSettings.discordToken
}]

prompt.start()

prompt.get(schema, (error, result) => {
  if (error) {
    console.error('Error resolving schemas.')
    return
  }

  try {
    jsonfile.writeFileSync(CONFIG_PATH, { ...result, admins: [] }, { spaces: 2 })
    console.log(`Config created at '${CONFIG_PATH}'.`)
  } catch (error) {
    console.log(`Error creating '${CONFIG_PATH}'. Please try again.`)
    throw error
  }
})
