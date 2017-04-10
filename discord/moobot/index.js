const Discord = require('discord.js');
const winston = require('winston');
const config = require('../config.json');

const bot = new Discord.Client();

// Plug in modules
require('./modules/osu').init(bot);

bot.on('ready', () => {
  winston.info('pillow-bot online');
});

bot.login(config.discordToken)
  .then(() =>
    winston.info('pillow-bot logged in.')
  )
  .catch(err => {
    winston.error('Could not log in', err);
    process.exit(1);
  });
