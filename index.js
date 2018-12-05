const Discord = require('discord.js')
const client = new Discord.Client()

require('./src/eorzean')(client)
require('./src/eval')(client)
require('./src/go')(client)
require('./src/moo')(client)
// require('./src/raid')(client)

client.on('ready', () => console.log('moobot ready'))
client.login(require('./config').discordToken)

module.exports = client
