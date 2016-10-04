const prompt = require('prompt');
const jsonfile = require('jsonfile');

const fileLocation = 'shared/config.json';

let currSettings;
try {
  currSettings = jsonfile.readFileSync(fileLocation);
} catch (err) {
  currSettings = {};
}

let schema = [{
  name: 'steamUsername',
  description: 'Steam Username',
  default: currSettings.steamUsername
}, {
  name: 'steamPassword',
  description: 'Steam Password',
  default: currSettings.steamPassword
}, {
  name: 'steamApi',
  description: 'Steam API Key (For web leaderboards)',
  default: currSettings.steamApi
}, {
  name: 'discordToken',
  description: 'Discord Bot Token',
  default: currSettings.discordToken
}, {
  name: 'cleverbotUsername',
  description: 'Cleverbot Username (For cleverbot integration)',
  default: currSettings.cleverbotUsername
}, {
  name: 'cleverbotApi',
  description: 'Cleverbot API Key  (For cleverbot integration)',
  default: currSettings.cleverbotApi
}, {
  name: 'danbooruUsername',
  description: 'Danbooru Username (For the `!remi` command)',
  default: currSettings.danbooruUsername
}, {
  name: 'danbooruApi',
  description: 'Danbooru API Key  (For the `!remi` command)',
  default: currSettings.danbooruApi
}];

prompt.start();

prompt.get(schema, (err, result) => {
  try {
    jsonfile.writeFileSync(fileLocation, result, {spaces: 2});
  } catch (err) {
    console.log(`Error creating '${fileLocation}'. Please try again.`);
    console.log(err);
  }
});
