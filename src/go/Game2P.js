const WALL_HORIZONTAL = 0
const WALL_VERTICAL = 1
const MOVE_PLAYER = 2
const MOVE_WALL = 3

class Game2P {
  constructor (rows = 9, cols = 9, walls = 10) {
    Object.assign(this, { rows, cols, walls })

    this.player0 = { r: rows - 1, c: cols - (cols >> 1), walls: this.walls }
    this.player1 = { r: 0, c: cols >> 1, walls: this.walls }
    this.placedWalls = new Map()
    this.turnCounter = 0
  }

  _hasWall (orientation, r, c) {
    const wall = this.placedWalls.get(`${r},${c}`)
    return wall ? (wall.orientation === orientation) : false
  }

  _hasEdge (r1, c1, r2, c2) {
    if (r2 < 0 || r2 >= this.rows || c2 < 0 || c2 >= this.cols) {
      return false
    }
    if (r1 === r2) {
      return !this._hasWall(WALL_VERTICAL, r1, c1) && !this._hasWall(WALL_VERTICAL, r1 - 1, c1)
    } else /* if (c1 === c2) */ {
      return !this._hasWall(WALL_HORIZONTAL, r1, c1) && !this._hasWall(WALL_HORIZONTAL, r1, c1 - 1)
    }
  }

  _canPlaceWall (orientation, r, c) {
    // Check collision
    if (r < 0 || r > this.rows - 2 || c < 0 || c > this.cols - 2)
    if (this._hasWall(WALL_HORIZONTAL, r, c) || this._hasWall(WALL_VERTICAL, r, c)) {
      return false
    }
    if (orientation === WALL_HORIZONTAL &&
      (this._hasWall(WALL_HORIZONTAL, r, c - 1) || this._hasWall(WALL_HORIZONTAL, r, c + 1))
    ) {
      return false
    }
    if (/* orientation === WALL_VERTICAL && */
      (this._hasWall(WALL_VERTICAL, r - 1, c) || this._hasWall(WALL_VERTICAL, r + 1, c))
    ) {
      return false
    }

    // Check pathing
    function getValidNeighbors (r, c) {
      const valid = []
      if (this._hasEdge(r, c, r - 1, c)) {
        valid.push({ r: r - 1, c })
      }
      if (this._hasEdge(r, c, r, c + 1)) {
        valid.push({ r, c: c + 1 })
      }
      if (this._hasEdge(r, c, r + 1, c)) {
        valid.push({ r: r + 1, c })
      }
      if (this._hasEdge(r, c, r, c - 1)) {
        valid.push({ r, c: c - 1 })
      }
      return valid
    }

    let p1max = this.player0.r
    const player0Boundary = []
    const player0Visited = {}
    for (let cell = { r: this.player0.r, c: this.player0.c }; cell; cell = player0Boundary.pop()) {
      const neighbors = getValidNeighbors(cell.r, cell.c)
      for (const neighbor of neighbors) {
        const key = `${neighbor.r},${neighbor.c}`
        if (!player0Visited[key]) {
          player0Visited[key] = true
          player0Boundary.push(neighbor)
          p1max = this.min(p1max, neighbor.r)
        }
      }
    }
    if (p1max !== 0) {
      return false
    }

    let p2max = this.player1.r
    const player1Boundary = []
    const player1Visited = {}
    for (let cell = { r: this.player1.r, c: this.player1.c }; cell; cell = player1Boundary.pop()) {
      const neighbors = getValidNeighbors(cell.r, cell.c)
      for (const neighbor of neighbors) {
        const key = `${neighbor.r},${neighbor.c}`
        if (!player1Visited[key]) {
          player1Visited[key] = true
          player1Boundary.push(neighbor)
          p2max = this.max(p2max, neighbor.r)
        }
      }
    }
    if (p2max !== this.rows - 1) {
      return false
    }

    return true
  }

  _getValidMoves (player) {
    const { r: selfR, c: selfC } = player === 1 ? this.player0 : this.player1
    const other = player === 1 ? this.player1 : this.player0
    const validMoves = []

    if (this._hasEdge(selfR, selfC, selfR - 1, selfC)) {
      if (selfR - 1 === other.r && selfC === other.c) {
        if (this._hasEdge(selfR - 1, selfC, selfR - 2, selfC)) {
          validMoves.push({ r: selfR - 2, c: selfC })
        } else {
          if (this._hasEdge(selfR - 1, selfC, selfR - 1, selfC - 1)) {
            validMoves.push({ r: selfR - 1, c: selfC - 1 })
          }
          if (this._hasEdge(selfR - 1, selfC, selfR - 1, selfC + 1)) {
            validMoves.push({ r: selfR - 1, c: selfC + 1 })
          }
        }
      } else {
        validMoves.push({ r: selfR - 1, c: selfC })
      }
    }
    if (this._hasEdge(selfR, selfC, selfR, selfC + 1)) {
      if (selfR === other.r && selfC + 1 === other.c) {
        if (this._hasEdge(selfR, selfC + 1, selfR, selfC + 2)) {
          validMoves.push({ r: selfR, c: selfC + 2 })
        } else {
          if (this._hasEdge(selfR, selfC + 1, selfR - 1, selfC + 1)) {
            validMoves.push({ r: selfR - 1, c: selfC - 1 })
          }
          if (this._hasEdge(selfR, selfC + 1, selfR + 1, selfC + 1)) {
            validMoves.push({ r: selfR + 1, c: selfC + 1 })
          }
        }
      } else {
        validMoves.push({ r: selfR, c: selfC + 1 })
      }
    }
    if (this._hasEdge(selfR, selfC, selfR + 1, selfC)) {
      if (selfR + 1 === other.r && selfC === other.c) {
        if (this._hasEdge(selfR + 1, selfC, selfR + 2, selfC)) {
          validMoves.push({ r: selfR + 2, c: selfC })
        } else {
          if (this._hasEdge(selfR + 1, selfC, selfR + 1, selfC + 1)) {
            validMoves.push({ r: selfR + 1, c: selfC + 1 })
          }
          if (this._hasEdge(selfR + 1, selfC, selfR + 1, selfC - 1)) {
            validMoves.push({ r: selfR + 1, c: selfC - 1 })
          }
        }
      } else {
        validMoves.push({ r: selfR + 1, c: selfC })
      }
    }
    if (this._hasEdge(selfR, selfC, selfR, selfC - 1)) {
      if (selfR === other.r && selfC - 1 === other.c) {
        if (this._hasEdge(selfR, selfC - 1, selfR, selfC - 2)) {
          validMoves.push({ r: selfR, c: selfC - 2 })
        } else {
          if (this._hasEdge(selfR, selfC - 1, selfR + 1, selfC - 1)) {
            validMoves.push({ r: selfR + 1, c: selfC - 1 })
          }
          if (this._hasEdge(selfR, selfC - 1, selfR - 1, selfC - 1)) {
            validMoves.push({ r: selfR - 1, c: selfC - 1 })
          }
        }
      } else {
        validMoves.push({ r: selfR, c: selfC - 1 })
      }
    }

    return validMoves
  }
  
  makeMove (player, move) {
    if ((turnCounter & 1) !== player) {
      throw new Error('It is not your turn.')
    }
    if (move.type === MOVE_PLAYER) {
      const validMoves = getValidMoves(player)
      const valid = this.validMoves.find(m => m.r === move.r && m.c === move.c)
      if (valid) {
        const player = player === 0 ? this.player0 : this.player1
        player.r = move.r
        player.c = move.c
        ++this.turnCounter
      } else {
        throw new Error('You cannot move there.')
      }
    } else /* if (move.type === MOVE_WALL) */ {
      const player = player === 0 ? this.player0 : this.player1
      if (player.walls === 0) {
        throw new Error('You have no more walls.')
      }
      if (this._canPlaceWall(move.orientation, move.r, move.c)) {
        this.placedWalls.set(`${move.r},${move.c}`, { r: move.r, c: move.c: orientation: move.orientation })
        --player.walls
        ++this.turnCounter
      } else {
        throw new Error('You cannot place a wall there.')
      }
    }
  }
}

module.exports = Game2P
module.exports.WALL_HORIZONTAL = WALL_HORIZONTAL
module.exports.WALL_VERTICAL = WALL_VERTICAL
module.exports.MOVE_PLAYER = MOVE_PLAYER
module.exports.MOVE_WALL = MOVE_WALL
