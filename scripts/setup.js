const path = require('path');
const prompt = require('prompt');
const jsonfile = require('jsonfile');

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

let currSettings;
try {
  currSettings = jsonfile.readFileSync(CONFIG_PATH);
} catch (err) {
  currSettings = {};
}

const schema = [{
  name: 'discordToken',
  description: '(moobot) Discord Bot Token',
  default: currSettings.discordToken
}, {
  name: 'email',
  description: '(userbot) Email Address',
  default: currSettings.email,
  required: true
}, {
  name: 'password',
  description: '(userbot) Password',
  default: currSettings.password,
  required: true
}];

prompt.start();

/* eslint-disable no-console */
prompt.get(schema, (err, result) => {
  try {
    jsonfile.writeFileSync(CONFIG_PATH, result, {spaces: 2});
    console.log(`Config created at '${CONFIG_PATH}'`);
  } catch (err) {
    console.log(`Error creating '${CONFIG_PATH}'. Please try again.`);
    console.log(err);
  }
});
/* eslint-enable no-console */
