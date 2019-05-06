const Discord = require('discord.js')
const typeset = require('./typeset')

module.exports = function eorzean (client) {
  const commandRegex = /^~\/eorzean\b/
  const textRegex = /^~\/eorzean\s+(.*)\s*$/

  client.on('message', message => {
    if (message.author.bot || !commandRegex.test(message.content)) {
      return
    }

    let text = message.content.match(textRegex)
    if (!text || !(text = text[1])) {
      return message.channel.send('No text found to typeset. Use `~/eorzean Your text here`.')
    }

    typeset(text)
      .then(buffer =>
        message.channel.send(new Discord.Attachment(buffer))
      )
      .catch(err => {
        message.channel.send(`\`\`\`${err.message}\`\`\``)
      })
  })
}
