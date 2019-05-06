module.exports = function moo (client) {
  const mooRegex = /\b(?:moo+|cows?)\b/i
  const probability = 0.2

  client.on('message', message => {
    if (message.author.bot || !mooRegex.test(message.content)) {
      return
    }

    if (Math.random() < probability) {
      message.channel.send('moo')
    }
  })
}
