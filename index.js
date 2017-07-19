const Discord = require('discord.js')
const client = new Discord.Client()

require('./src/moo')(client)

client.on('ready', () => console.log('moobot ready'))
client.login(require('../config').discordToken)
