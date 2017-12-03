const express = require('express')

const PORT = process.argv[2] || process.env.MOOBOT_PORT || 80

const app = express()
app.use(require('cors')())

let client = require('./index.js')

app.get('/scores', (_, response) => {
  let p = require('./database.js').getScores()
  response.json({
    scores: p
  })
})

app.get('/stats', (_, response) => {
  response.json({
    totalMoos: require('./database').get(),
    numberOfServers: Math.random() * 100 | 0
  })
})

app.post('/moo', (_, response) => {
  let channels = client.channels
  for (const channel of channels) {
    if (channel[1].type === 'text') {
      channel[1].send('moo')
    }
  }
  response.json({
    hi: 'hi'
  })
})

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
