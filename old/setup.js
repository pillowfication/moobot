const prompt = require('prompt');
const jsonfile = require('jsonfile');

const FILE_LOCATION = 'shared/config.json';

let currSettings;
try {
  currSettings = jsonfile.readFileSync(FILE_LOCATION);
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
}, {
  name: 'databaseUrl',
  description: 'Database URL (For moo stats)',
  default: currSettings.databaseUrl || 'mongodb://localhost/moo'
}];

prompt.start();

prompt.get(schema, (error, result) => {
  try {
    jsonfile.writeFileSync(FILE_LOCATION, result, {spaces: 2});
  } catch (error) {
    console.log(`Error creating '${FILE_LOCATION}'. Please try again.`);
    console.log(error);
  }
});
