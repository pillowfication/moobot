module.exports = function moo (client) {
  const mooRegex = /\b(?:moo+|cows?)\b/i
  const probability = 0.2

  client.on('message', message => {
    if (!message.author.bot && Math.random() < probability && mooRegex.test(message.content)) {
      message.channel.send('moo')
    }
  })
}
