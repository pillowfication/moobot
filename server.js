const express = require('express')

const PORT = process.argv[2] || process.env.MOOBOT_PORT || 80

const app = express()
app.use(require('cors')())
app.use(require('body-parser').json())

let client = require('./index')

app.get('/scores', (_, response) => {
  let p = require('./database').getScores()
  response.json({
    scores: p
  })
})

app.get('/stats', (_, response) => {
  response.json({
    totalMoos: require('./database').get(),
    numberOfServers: client.guilds.size
  })
})

app.post('/moo', (request, response) => {
  let message = request.body.message
  let channels = client.channels
  for (const channel of channels) {
    if (channel[1].type === 'text') {
      channel[1].send(message)
    }
  }
  response.json({
    hi: 'hi'
  })
})

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
