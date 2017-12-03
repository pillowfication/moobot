let moos = 764

const scores = {}
function s (username) {
  scores[username] = (scores[username] || 0) + 1
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
  }
}
