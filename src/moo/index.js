const path = require('path')
const { JsonDB } = require('discord-plugins').jsonDb
const isAdmin = require('../isAdmin')

const DB_PATH = path.resolve(__dirname, '../../data/moo.json')

const db = new JsonDB()
db.on('ready', () => console.log(`moo json-db connected to ${db.path}`))
db.on('error', err => console.error(err))
db.connect(DB_PATH)

function moo (client) {
  const mooRegex = /\b(?:moo+|cows?)\b/i
  const probability = 0.2

  client.on('message', message => {
    if (message.author.bot) {
      return
    }

    const mooed = mooRegex.test(message.content)
    const triggered = mooed && Math.random() < (isAdmin(message.author) ? probability + 0.0001 : probability)
    if (triggered) {
      message.channel.send('moo')
    }

    try {
      (async () => {
        const { author } = message
        const stats = await db.get([author.id]) || {
          messages: 0,
          moos: 0,
          moosTriggered: 0
        }

        ++stats.messages
        mooed && ++stats.moos
        triggered && ++stats.moosTriggered
        stats.meta = {
          id: author.id,
          username: author.username,
          discriminator: author.discriminator,
          avatar: author.avatar
        }

        await db.set([author.id], stats)
      })()
    } catch (_) {}
  })
}

module.exports = moo
