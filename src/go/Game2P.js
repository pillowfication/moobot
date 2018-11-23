const WALL_HORIZONTAL = 0
const WALL_VERTICAL = 1
const MOVE_PLAYER = 2
const MOVE_WALL = 3

class Game2P {
  constructor (rows = 9, cols = 9, walls = 10) {
    Object.assign(this, { rows, cols, walls })

    this.player0 = { r: rows - 1, c: cols >> 1, walls: this.walls }
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
      const c = Math.min(c1, c2)
      return !this._hasWall(WALL_VERTICAL, r1, c) && !this._hasWall(WALL_VERTICAL, r1 - 1, c)
    } else /* if (c1 === c2) */ {
      const r = Math.min(r1, r2)
      return !this._hasWall(WALL_HORIZONTAL, r, c1) && !this._hasWall(WALL_HORIZONTAL, r, c1 - 1)
    }
  }

  _canPlaceWall (orientation, r, c) {
    // Check collision
    if (r < 0 || r > this.rows - 2 || c < 0 || c > this.cols - 2) {
      return false
    }
    if (this._hasWall(WALL_HORIZONTAL, r, c) || this._hasWall(WALL_VERTICAL, r, c)) {
      return false
    }
    if (orientation === WALL_HORIZONTAL &&
      (this._hasWall(WALL_HORIZONTAL, r, c - 1) || this._hasWall(WALL_HORIZONTAL, r, c + 1))
    ) {
      return false
    }
    if (orientation === WALL_VERTICAL &&
      (this._hasWall(WALL_VERTICAL, r - 1, c) || this._hasWall(WALL_VERTICAL, r + 1, c))
    ) {
      return false
    }

    // Check pathing
    const key = `${r},${c}`
    this.placedWalls.set(key, { r, c, orientation })

    const getValidNeighbors = function getValidNeighbors (r, c) {
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
    }.bind(this)

    let p0max = this.player0.r
    const player0Boundary = []
    const player0Visited = { [`${this.player0.r},${this.player0.c}`]: true }
    for (let cell = { r: this.player0.r, c: this.player0.c }; cell; cell = player0Boundary.pop()) {
      const neighbors = getValidNeighbors(cell.r, cell.c)
      for (const neighbor of neighbors) {
        const key = `${neighbor.r},${neighbor.c}`
        if (!player0Visited[key]) {
          player0Visited[key] = true
          player0Boundary.push(neighbor)
          p0max = Math.min(p0max, neighbor.r)
        }
      }
    }
    if (p0max !== 0) {
      this.placedWalls.delete(key)
      return false
    }

    let p1max = this.player1.r
    const player1Boundary = []
    const player1Visited = { [`${this.player1.r},${this.player1.c}`]: true }
    for (let cell = { r: this.player1.r, c: this.player1.c }; cell; cell = player1Boundary.pop()) {
      const neighbors = getValidNeighbors(cell.r, cell.c)
      for (const neighbor of neighbors) {
        const key = `${neighbor.r},${neighbor.c}`
        if (!player1Visited[key]) {
          player1Visited[key] = true
          player1Boundary.push(neighbor)
          p1max = Math.max(p1max, neighbor.r)
        }
      }
    }
    if (p1max !== this.rows - 1) {
      this.placedWalls.delete(key)
      return false
    }

    this.placedWalls.delete(key)
    return true
  }

  _getValidMoves (player) {
    const { r: selfR, c: selfC } = player === 0 ? this.player0 : this.player1
    const other = player === 0 ? this.player1 : this.player0
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
    if ((this.turnCounter & 1) !== player) {
      throw new Error('It is not your turn.')
    }
    if (move.type === MOVE_PLAYER) {
      const validMoves = this._getValidMoves(player)
      const valid = validMoves.find(m => m.r === move.r && m.c === move.c)
      if (valid) {
        const self = player === 0 ? this.player0 : this.player1
        self.r = move.r
        self.c = move.c
        this.turnCounter += 2
      } else {
        throw new Error('You cannot move there.')
      }
    } else /* if (move.type === MOVE_WALL) */ {
      const self = player === 0 ? this.player0 : this.player1
      if (self.walls === 0) {
        throw new Error('You have no more walls.')
      }
      if (this._canPlaceWall(move.orientation, move.r, move.c)) {
        this.placedWalls.set(`${move.r},${move.c}`, { r: move.r, c: move.c, orientation: move.orientation })
        --self.walls
        this.turnCounter += 2
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
