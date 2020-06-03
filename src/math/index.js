const Discord = require('discord.js')
const typeset = require('./typeset')

const MAX_MATCHES = 5

function math (client) {
  const commandRegex = /^~\/math\b/

  client.on('message', async message => {
    if (message.author.bot || !commandRegex.test(message.content)) {
      return
    }

    let count = 0
    let match
    const mathRegex = /`([\s\S]*?[^`])`(?:[^`]|$)|``([\s\S]*?[^`])``(?:[^`]|$)|```(?:\S+\n(?=[\s\S]))?([\s\S]*?[^`])```/g

    while (count++ < MAX_MATCHES && (match = mathRegex.exec(message.content))) {
      const math = match[1] || match[2] || match[3]
      await typeset(math)
        .then(buffer => message.channel.send(new Discord.MessageAttachment(buffer)))
        .catch(err => message.channel.send(`\`\`\`${err.message}\`\`\``))
    }

    if (count === 0) {
      return message.channel.send('No math found to render. Wrap math expressions in a `code block`.')
    }
  })
}

module.exports = math
