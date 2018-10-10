const { DiscordVM } = require('discord-plugins').eval

module.exports = function _eval (client) {
  const contexts = {}
  function getContext (channelId) {
    let context = contexts[channelId]
    if (context) {
      return context
    } else {
      context = new DiscordVM()
      contexts[channelId] = context
      return context
    }
  }

  client.on('message', message => {
    if (message.content === '~/eval reset') {
      getContext(message.channel.id).reset()
      message.channel.send('Context reset.')
    } else if (message.content.startsWith('~/eval')) {
      try {
        const match = message.content.match(/```(?:(js|javascript)\n)?([\s\S]*)```/)
        if (match) {
          const context = getContext(message.channel.id)
          const code = match[1]
          const result = context.eval(code, { require, message })
          message.channel.send(result.prettyOutput.substring(0, 100), { code: 'js' })
        } else {
          message.channel.send('No code block found to eval.')
        }
      } catch (error) {
        message.channel.send('Something bad happened. Check logs.')
        console.error(error)
      }
    }
  })
}
