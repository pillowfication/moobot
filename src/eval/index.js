const { DiscordVM } = require('discord-plugins').eval

const MAX_RESPONSE_LENGTH = 250

module.exports = function _eval (client) {
  const commandRegex = /^~\/eval\b/
  const resetRegex = /^~\/eval\s+reset/
  const evalRegex = /`([\s\S]*?[^`])`(?:[^`]|$)|``([\s\S]*?[^`])``(?:[^`]|$)|```(?:\S+\n(?=[\s\S]))?([\s\S]*?[^`])```/

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
    if (message.author.bot || !commandRegex.test(message.content)) {
      return
    }

    if (resetRegex.test(message.content)) {
      getContext(message.channel.id).reset()
      return message.channel.send('Context reset.')
    }

    const match = message.content.match(evalRegex)
    if (!match) {
      return message.channel.send('No code found to eval. Wrap expressions in a `code block`.')
    }

    const isAdmin = message.author.id === '144761456645242880'
    const context = getContext(message.channel.id)
    const code = match[1] || match[2] || match[3]
    const result = context.eval(code, isAdmin ? { ...global, message } : {})

    return message.channel.send(
      result.prettyOutput.length > MAX_RESPONSE_LENGTH
        ? result.prettyOutput.substring(0, MAX_RESPONSE_LENGTH) + '...'
        : result.prettyOutput,
      { code: 'js' }
    )
  })
}
