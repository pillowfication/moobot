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
  if (request.body.username) {
    let username = request.body.username
    let servers = client.guilds
    for (const server of servers) {
      let members = server[1].members
      for (const member of members) {
        if (member[1].user.username === username) {
          member[1].user.send(message)
        }
      }
    }
  } 
  else {
    let channels = client.channels    
    for (const channel of channels) {
      if (channel[1].type === 'text') {
        channel[1].send(message)
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
  let score = request.body.score
  require('./database').changeScore(username, score)
  response.json({
    hi: 'hi'
  })
})

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
