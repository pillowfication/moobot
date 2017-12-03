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
      let members = channel[1].members
      for (const member of members) {
        if (member.user.username === 'Pillowfication') {
          channel[1].send(member + message)
        }
      }
    }
  }
  response.json({
    hi: 'hi'
  })
})

app.delete('/scores', (request, response) => {
  let username = request.body.username
  require('./database').reset(username)
  response.json({
    hi: 'hi'
  })
})

app.patch('/scores', (request, response) => {
  let username = request.body.username
  let scores = request.body.scores
  require('./database').changeScore(username, score)
  response.json({
    hi: 'hi'
  })
})

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
