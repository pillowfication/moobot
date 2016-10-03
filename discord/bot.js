const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../shared/config.json');

const rules = [
  require('./rules/moo')
  // require('./rules/remi')
  // require('./rules/talk')
];

client.on('ready', () => {
  console.log('moo (Discord) is online!');
  client.user.setStatus('online', 'pf-n.co/moo');
});

client.on('message', (message) => {
  for (let rule of rules)
    rule(message);
});

module.exports = {
  start: () => {
    client.login(config.discordToken);
  }
};

if (require.main === module) {
  module.exports.start();
}
