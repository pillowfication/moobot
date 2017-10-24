const Discord = require('discord.js')
const plugins = require('discord-plugins')
const winston = require('winston')
const client = new Discord.Client()

plugins.setup(client, {
  prefix: '~/'
})


client.on('ready', () => {
  winston.info('moobot online')
})

client.login(config.discordToken)
  .then(() =>
    winston.info('moobot logged in.')
  )
  .catch(err => {
    winston.error('Could not log in', err)
    process.exit(1)
  })
