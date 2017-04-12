const Discord = require('discord.js');
const winston = require('winston');
const config = require('../../config.json');
const botConfig = require('./config');

const bot = new Discord.Client();
bot.config = botConfig;

// Plug in modules
require('./modules/moo').init(bot);
require('./modules/osu').init(bot);
require('./modules/userbot').init(bot);

bot.on('ready', () => {
  winston.info('moobot online');
});

bot.login(config.discordToken)
  .then(() =>
    winston.info('moobot logged in.')
  )
  .catch(err => {
    winston.error('Could not log in', err);
    process.exit(1);
  });
