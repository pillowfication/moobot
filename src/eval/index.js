const { DiscordVM } = require('discord-plugins').eval
const isAdmin = require('../isAdmin')

const MAX_RESPONSE_LENGTH = 250
const GLOBALS = {
  console,
  process,
  Buffer,
  clearImmediate,
  clearInterval,
  clearTimeout,
  setImmediate,
  setInterval,
  setTimeout,
  module,
  require
}

function _eval (client) {
  const commandRegex = /^~\/eval\b/
  const resetRegex = /^~\/eval\s+reset\b/
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

    const context = getContext(message.channel.id)
    const code = match[1] || match[2] || match[3]
    const result = context.eval(code, isAdmin(message.author) ? { ...GLOBALS, message } : {})
    const prettyOutput = result.prettyOutput.replace(new RegExp(client.token, 'g'), 'moo')

    return message.channel.send(
      prettyOutput.length > MAX_RESPONSE_LENGTH
        ? prettyOutput.substring(0, MAX_RESPONSE_LENGTH) + '...'
        : prettyOutput,
      { code: 'js' }
    )
  })
}

module.exports = _eval
