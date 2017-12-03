let moos = 0

let scores = {}
let serverScores = {}
function s (username) {
  scores[username] = (scores[username] || 0) + 1
}

function t (serverName) {
  serverScores[serverName] = (serverScores[serverName] || 0) + 1
}

module.exports = {
  get () {
    return moos
  },
  inc () {
    moos++
  },

  getScores () {
    const p = []
    for (const a in scores) {
      p.push({username: a, score: scores[a]})
    }
    return p.sort((a, b) => a.score > b.score ? -1 : 1)
  },

  incScore (username) {
    s(username)
  },

  reset (username) {
    if (scores[username])
      delete scores[username]
  },

  changeScore (username, score) {
  	if (scores[username])
  		scores[username] = score
  },

  getServerScores() {
    const p = []
    for (const a in serverScores) {
      p.push({serverName: a, score: serverScores[a]})
    }
    return p.sort((a, b) => a.score > b.score ? -1 : 1)    
  },

  incServerScore(serverName) {
    t(serverName)
  }
}
