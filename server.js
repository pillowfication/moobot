const express = require('express')

const PORT = process.argv[2] || process.env.MOOBOT_PORT || 80

const app = express()
app.use(require('cors')())

app.get('/scores', (_, response) => {
  response.json({
    scores: [
      { username: 'Foo', score: 723 },
      { username: 'Bar', score: 47 },
      { username: 'Quux', score: 1 }
    ]
  })
})

app.get('/stats', (_, response) => {
  response.json({
    totalMoos: require('./database').get(),
    numberOfServers: Math.random() * 100 | 0
  })
})

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
