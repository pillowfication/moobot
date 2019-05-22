const Discord = require('discord.js')
const client = new Discord.Client()

require('./src/cron')(client)
require('./src/eorzean')(client)
require('./src/eval')(client)
// require('./src/qd')(client)
require('./src/math')(client)
require('./src/moo')(client)
require('./src/secret-hitler')(client)

client.on('ready', () => console.log('moobot ready'))
client.login(require('./config').discordToken)

module.exports = client
