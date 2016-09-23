const prompt = require('prompt');
const jsonfile = require('jsonfile');

const fileLocation = 'shared/config.json';

let schema = [{
  name: 'steamUsername',
  description: 'Steam Username'
}, {
  name: 'steamPassword',
  description: 'Steam Password',
  hidden: true,
  replace: '*'
}, {
  name: 'discordToken',
  description: 'Discord Bot Token'
}, {
  name: 'cleverbotUsername',
  description: 'Cleverbot Username (This is for cleverbot integration)'
}, {
  name: 'cleverbotApi',
  description: 'Cleverbot API Key  (This is for cleverbot integration)'
}, {
  name: 'danbooruUsername',
  description: 'Danbooru Username (This is for the `!remi` command)'
}, {
  name: 'danbooruApi',
  description: 'Danbooru API Key  (This is for the `!remi` command)'
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
