const _userbot = require('./userbot')
const { prompt } = require('discord-plugins')
const schemas = [{
  name: 'email',
  description: 'Email:'
}, {
  name: 'password',
  description: 'Password:'
}]

module.exports = function userbot (client) {
  client.prompt = prompt
  client.on('message', message => {
    if (message.content === '~/userbot') {
      client.prompt(message.channel, message.author, schemas)
        .then(({ email, password }) => {
          _userbot.start(message.author.id, email, password)
        })
    }
  })
}
