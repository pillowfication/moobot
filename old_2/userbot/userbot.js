const Discord = require('discord.js')
const Constants = require('discord.js/src/util/Constants')
const client = new Discord.Client()

require('./eorzean')(client)

client.loginEmailPassword = function loginEmailPassword (email, password) {
  return new Promise((resolve, reject) => {
    this.rest.client.email = email
    this.rest.client.password = password
    this.rest.makeRequest('post', Constants.Endpoints.login, false, { email, password })
      .then(data => {
        this.rest.client.manager.connectToWebSocket(data.token, resolve, reject)
      })
      .catch(reject)
  })
}

client.start = async function start (id, email, password) {
  await client.loginEmailPassword(email, password)
  client.id = id
  return client
}

if (require.main === module) {
  client.on('ready', () => console.log('userbot ready'))
  client.start(process.argv[2], process.argv[3])
}

module.exports = client
