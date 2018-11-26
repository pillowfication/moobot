/* eslint-disable */
class Game {
  clone () {
    let c = new Game()
    c.player0 = Object.assign({}, this.player0)
    c.player1 = Object.assign({}, this.player1)
    c.placedWalls = Object.assign({}, this.placedWalls)
    c.turnCounter = this.turnCounter
    return c
  }
  hasWall (o, r, c) {
    const wall = this.placedWalls[r + ',' + c]
    return wall === undefined ? false : wall === o
  }
  hasEdge (r1, c1, r2, c2) {
    if (r2 < 0 || r2 > 8 || c2 < 0 || c2 > 8)
      return false
    if (r1 === r2) {
      const c = c1 < c2 ? c1 : c2
      return !this.hasWall(11, r1, c) && !this.hasWall(11, r1 - 1, c)
    } else {
      const r = r1 < r2 ? r1 : r2
      return !this.hasWall(10, r, c1) && !this.hasWall(10, r, c1 - 1)
    }
  }
  getNeighbors (r, c) {
    const valid = []
    if (this.hasEdge(r, c, r - 1, c))
      valid.push({ r: r - 1, c: c })
    if (this.hasEdge(r, c, r, c + 1))
      valid.push({ r: r, c: c + 1 })
    if (this.hasEdge(r, c, r + 1, c))
      valid.push({ r: r + 1, c: c })
    if (this.hasEdge(r, c, r, c - 1))
      valid.push({ r: r, c: c - 1 })
    return valid
  }
  canPlaceWall (o, r, c) {
    if (
      (r < 0 || r > 7 || c < 0 || c > 7) ||
      (this.hasWall(10, r, c) || this.hasWall(11, r, c)) ||
      (o === 10 && (this.hasWall(10, r, c - 1) || this.hasWall(10, r, c + 1))) ||
      (o === 11 && (this.hasWall(11, r - 1, c) || this.hasWall(11, r + 1, c)))
    ) {
      return false
    }
    
    const _key = r + ',' + c
    this.placedWalls[_key] = o
    
    let p0 = this.player0, p0m = p0.r
    const p0b = []
    const p0v = { [ p0.r + ',' + p0.c ]: true }
    flood: for (let cell = { r: p0.r, c: p0.c }; cell; cell = p0b.pop()) {
      const neighbors = this.getNeighbors(cell.r, cell.c)
      for (const neighbor of neighbors) {
        const key = neighbor.r + ',' + neighbor.c
        if (!p0v[key]) {
          p0v[key] = true
          p0b.push(neighbor)
          p0m = neighbor.r < p0m ? neighbor.r : p0m
          if (p0m === 0) {
            break flood
          }
        }
      }
    }
    if (p0m !== 0) {
      delete this.placedWalls[_key]
      return false
    }
    
    let p1 = this.player1, p1m = p1.r
    const p1b = []
    const p1v = { [ p1.r + ',' + p1.c ]: true }
    flood: for (let cell = { r: p1.r, c: p1.c }; cell; cell = p1b.pop()) {
      const neighbors = this.getNeighbors(cell.r, cell.c)
      for (const neighbor of neighbors) {
        const key = neighbor.r + ',' + neighbor.c
        if (!p1v[key]) {
          p1v[key] = true
          p1b.push(neighbor)
          p1m = neighbor.r > p1m ? neighbor.r : p1m
          if (p1m === 8) {
            break flood
          }
        }
      }
    }
    if (p1m !== 8) {
      delete this.placedWalls[_key]
      return false
    }

    delete this.placedWalls[_key]
    return true
  }
  getValidMoves (p) {
    const { r: selfR, c: selfC } = p === 0 ? this.player0 : this.player1
    const other = p === 0 ? this.player1 : this.player0
    const validMoves = []

    if (this.hasEdge(selfR, selfC, selfR - 1, selfC)) {
      if (selfR - 1 === other.r && selfC === other.c) {
        if (this.hasEdge(selfR - 1, selfC, selfR - 2, selfC)) {
          validMoves.push({ r: selfR - 2, c: selfC })
        } else {
          if (this.hasEdge(selfR - 1, selfC, selfR - 1, selfC - 1)) {
            validMoves.push({ r: selfR - 1, c: selfC - 1 })
          }
          if (this.hasEdge(selfR - 1, selfC, selfR - 1, selfC + 1)) {
            validMoves.push({ r: selfR - 1, c: selfC + 1 })
          }
        }
      } else {
        validMoves.push({ r: selfR - 1, c: selfC })
      }
    }
    if (this.hasEdge(selfR, selfC, selfR, selfC + 1)) {
      if (selfR === other.r && selfC + 1 === other.c) {
        if (this.hasEdge(selfR, selfC + 1, selfR, selfC + 2)) {
          validMoves.push({ r: selfR, c: selfC + 2 })
        } else {
          if (this.hasEdge(selfR, selfC + 1, selfR - 1, selfC + 1)) {
            validMoves.push({ r: selfR - 1, c: selfC - 1 })
          }
          if (this.hasEdge(selfR, selfC + 1, selfR + 1, selfC + 1)) {
            validMoves.push({ r: selfR + 1, c: selfC + 1 })
          }
        }
      } else {
        validMoves.push({ r: selfR, c: selfC + 1 })
      }
    }
    if (this.hasEdge(selfR, selfC, selfR + 1, selfC)) {
      if (selfR + 1 === other.r && selfC === other.c) {
        if (this.hasEdge(selfR + 1, selfC, selfR + 2, selfC)) {
          validMoves.push({ r: selfR + 2, c: selfC })
        } else {
          if (this.hasEdge(selfR + 1, selfC, selfR + 1, selfC + 1)) {
            validMoves.push({ r: selfR + 1, c: selfC + 1 })
          }
          if (this.hasEdge(selfR + 1, selfC, selfR + 1, selfC - 1)) {
            validMoves.push({ r: selfR + 1, c: selfC - 1 })
          }
        }
      } else {
        validMoves.push({ r: selfR + 1, c: selfC })
      }
    }
    if (this.hasEdge(selfR, selfC, selfR, selfC - 1)) {
      if (selfR === other.r && selfC - 1 === other.c) {
        if (this.hasEdge(selfR, selfC - 1, selfR, selfC - 2)) {
          validMoves.push({ r: selfR, c: selfC - 2 })
        } else {
          if (this.hasEdge(selfR, selfC - 1, selfR + 1, selfC - 1)) {
            validMoves.push({ r: selfR + 1, c: selfC - 1 })
          }
          if (this.hasEdge(selfR, selfC - 1, selfR - 1, selfC - 1)) {
            validMoves.push({ r: selfR - 1, c: selfC - 1 })
          }
        }
      } else {
        validMoves.push({ r: selfR, c: selfC - 1 })
      }
    }

    return validMoves
  }
  
  getScore () {
    let asdf = 0
    if (this.player0.r === 0) {
      asdf = 999999
    }
    if (this.player1.r === 8) {
      asdf = -999999
    }

    let p0b = []
    const p0v = {}
    for (let c = 0; c < 9; ++c) {
      p0b.push({ r: 0, c: c })
      p0v['0,' + c] = true
    }
    let p0dist = 1
    flood: while (p0b.length) {
      const front = []
      for (const cell of p0b) {
        for (const neighbor of this.getNeighbors(cell.r, cell.c)) {
          const key = neighbor.r + ',' + neighbor.c
          if (!p0v[key]) {
            if (neighbor.r === this.player0.r && neighbor.c === this.player0.c) {
              break flood
            }
            p0v[key] = true
            front.push(neighbor)
          }
        }
      }
      p0b = front
      ++p0dist
    }
    
    let p1b = []
    const p1v = {}
    for (let c = 0; c < 9; ++c) {
      p1b.push({ r: 8, c: c })
      p1v['8,' + c] = true
    }
    let p1dist = 1
    flood: while (p1b.length) {
      const front = []
      for (const cell of p1b) {
        for (const neighbor of this.getNeighbors(cell.r, cell.c)) {
          const key = neighbor.r + ',' + neighbor.c
          if (!p1v[key]) {
            if (neighbor.r === this.player1.r && neighbor.c === this.player1.c) {
              break flood
            }
            p1v[key] = true
            front.push(neighbor)
          }
        }
      }
      p1b = front
      ++p1dist
    }
    
    return asdf + (p1dist - p0dist) * 100 + (this.player0.walls - this.player1.walls)
  }
  exec (m) {
    if (!m)
      return
    const self = (this.turnCounter & 1) === 0 ? this.player0 : this.player1
    if (m.type === 2) {
      self.r = m.r
      self.c = m.c
    } else {
      this.placedWalls[m.r + ',' + m.c] = m.o
      --self.walls
    }
    ++this.turnCounter
  }
}
/* eslint-enable */

const cache = {}

module.exports = function suggest (game2p) {
  let _game = new Game()
  _game.player0 = Object.assign({}, game2p.player0)
  _game.player1 = Object.assign({}, game2p.player1)
  _game.placedWalls = [...game2p.placedWalls.keys()].reduce((acc, key) =>
    (acc[key] = game2p.placedWalls.get(key).orientation, acc)
  , {})
  _game.turnCounter = game2p.turnCounter

  function getHighestMove (game, depth) {
    const g = 'S'
      + game.player0.r + ',' + game.player0.c + ',' + game.player1.r + ',' + game.player1.c + ','
      + game.player0.walls + ',' + game.player1.walls + ',' + game.turnCounter + ','
      + Object.keys(game.placedWalls).sort().map(k => k + ',' + game.placedWalls[k]).join(',')
    if (cache[depth + g])
      return cache[depth + g][cache[depth + g].length * Math.random() | 0]
    if (game.player0.r === 0 || game.player1.r === 8)
      return null

    const self = (game.turnCounter & 1) === 0 ? game.player0 : game.player1
    let moves = []
    for (const move of game.getValidMoves(game.turnCounter & 1)) {
      moves.push({ type: 2, r: move.r, c: move.c })
    }
    if (self.walls) {
      for (let r = 0; r < 8; ++r) {
        for (let c = 0; c < 8; ++c) {
          if (game.canPlaceWall(10, r, c))
            moves.push({ type: 3, r: r, c: c, o: 10 })
          if (game.canPlaceWall(11, r, c))
            moves.push({ type: 3, r: r, c: c, o: 11 })
        }
      }
    }

    const scores = moves.map(move => {
      const next = game.clone()
      next.exec(move)
      for (let i = 0; i < depth; ++i) {
        next.exec(getHighestMove(next, depth - 1))
      }
      return next.getScore()
    })
    const max = ((game.turnCounter & 1) === 0 ? Math.max : Math.min)(...scores)
    const bests = []
    scores.forEach((s, i) => {
      if (s === max)
        bests.push(moves[i])
    })

    cache[depth + g] = bests
    return bests[bests.length * Math.random() | 0]
  }
  
  // return getHighestMove(_game, 1)

  while (Math.abs(_game.getScore()) < 90000) {
    let m = getHighestMove(_game, 3)
    console.log(m)
    _game.exec(m)
  }
}
