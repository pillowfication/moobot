const prompt = require('prompt');
const jsonfile = require('jsonfile');

const fileLocation = 'shared/config.json';

let schema = [{
  name: 'steamUsername',
  description: 'Steam Username'
}, {
  name: 'steamPassword',
  description: 'Steam Password'
}, {
  name: 'steamApi',
  description: 'Steam API Key (For web leaderboards)'
}, {
  name: 'discordToken',
  description: 'Discord Bot Token'
}, {
  name: 'cleverbotUsername',
  description: 'Cleverbot Username (For cleverbot integration)'
}, {
  name: 'cleverbotApi',
  description: 'Cleverbot API Key  (For cleverbot integration)'
}, {
  name: 'danbooruUsername',
  description: 'Danbooru Username (For the `!remi` command)'
}, {
  name: 'danbooruApi',
  description: 'Danbooru API Key  (For the `!remi` command)'
}];

prompt.start();

prompt.get(schema, (err, result) => {
  jsonfile.writeFile(fileLocation, result, {spaces: 2}, (err) => {
    if (err) {
      console.log(`Error creating '${fileLocation}'. Please try again.`);
      console.log(err);
    }
  });
});
