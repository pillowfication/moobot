const FLAG_EDGE_UP = 1 << 0
const FLAG_EDGE_LT = 1 << 1
const FLAG_EDGE_RT = 1 << 2
const FLAG_EDGE_DN = 1 << 3

const WALL_ORIENTATION_HORIZONTAL = 1 << 8
const WALL_ORIENTATION_VERTICAL = 1 << 9

function shuffle (array) {
  let m = array.length
  let t, i
  while (m) {
    i = m-- * Math.random() | 0
    t = array[m]
    array[m] = array[i]
    array[i] = t
  }
  return array
}

function getDistP0 (game) {
  const { player0, cells } = game
  if ((player0 & 0b00001111) === 0) {
    return 0
  }

  const visited = {}
  let boundary = []
  for (let col = 0; col < 9; ++col) {
    const coord = (0 << 0) | (col << 4)
    visited[coord] = true
    boundary[col] = coord
  }
  let dist = 1

  while (boundary.length) {
    const newBoundary = []
    for (let i = 0, l = boundary.length; i < l; ++i) {
      const coord = boundary[i]
      const edges = cells[coord]
      if (edges & FLAG_EDGE_UP) {
        const neighbor = coord - (1 << 0) + (0 << 4)
        if (!visited[neighbor]) {
          if (neighbor === player0) return dist
          newBoundary.push(neighbor)
          visited[neighbor] = true
        }
      }
      if (edges & FLAG_EDGE_LT) {
        const neighbor = coord + (0 << 0) - (1 << 4)
        if (!visited[neighbor]) {
          if (neighbor === player0) return dist
          newBoundary.push(neighbor)
          visited[neighbor] = true
        }
      }
      if (edges & FLAG_EDGE_RT) {
        const neighbor = coord + (0 << 0) + (1 << 4)
        if (!visited[neighbor]) {
          if (neighbor === player0) return dist
          newBoundary.push(neighbor)
          visited[neighbor] = true
        }
      }
      if (edges & FLAG_EDGE_DN) {
        const neighbor = coord + (1 << 0) + (0 << 4)
        if (!visited[neighbor]) {
          if (neighbor === player0) return dist
          newBoundary.push(neighbor)
          visited[neighbor] = true
        }
      }
    }
    ++dist
    boundary = newBoundary
  }

  return -1
}

function getDistP1 (game) {
  const { player1, cells } = game
  if ((player1 & 0b00001111) === 8) {
    return 0
  }

  const visited = {}
  let boundary = []
  for (let col = 0; col < 9; ++col) {
    const coord = (8 << 0) | (col << 4)
    visited[coord] = true
    boundary[col] = coord
  }
  let dist = 1

  while (boundary.length) {
    const newBoundary = []
    for (let i = 0, l = boundary.length; i < l; ++i) {
      const coord = boundary[i]
      const edges = cells[coord]
      if (edges & FLAG_EDGE_UP) {
        const neighbor = coord - (1 << 0) + (0 << 4)
        if (!visited[neighbor]) {
          if (neighbor === player1) return dist
          newBoundary.push(neighbor)
          visited[neighbor] = true
        }
      }
      if (edges & FLAG_EDGE_LT) {
        const neighbor = coord + (0 << 0) - (1 << 4)
        if (!visited[neighbor]) {
          if (neighbor === player1) return dist
          newBoundary.push(neighbor)
          visited[neighbor] = true
        }
      }
      if (edges & FLAG_EDGE_RT) {
        const neighbor = coord + (0 << 0) + (1 << 4)
        if (!visited[neighbor]) {
          if (neighbor === player1) return dist
          newBoundary.push(neighbor)
          visited[neighbor] = true
        }
      }
      if (edges & FLAG_EDGE_DN) {
        const neighbor = coord + (1 << 0) + (0 << 4)
        if (!visited[neighbor]) {
          if (neighbor === player1) return dist
          newBoundary.push(neighbor)
          visited[neighbor] = true
        }
      }
    }
    ++dist
    boundary = newBoundary
  }

  return -1
}

function getScore (game) {
  return (-getDistP0(game) + getDistP1(game)) * 1000000 +
    (game.player0Walls - game.player1Walls)
}

function canPlaceWall (game, wall) {
  const { cells } = game
  const wallCoord = wall & 0b11111111
  if (game.walls[wallCoord]) return false

  if (wall & WALL_ORIENTATION_HORIZONTAL && (
    !(cells[wallCoord + (0 << 4)] & FLAG_EDGE_DN) ||
    !(cells[wallCoord + (1 << 4)] & FLAG_EDGE_DN))) {
    return false
  }
  if (wall & WALL_ORIENTATION_VERTICAL && (
    !(cells[wallCoord + (0 << 0)] & FLAG_EDGE_RT) ||
    !(cells[wallCoord + (1 << 0)] & FLAG_EDGE_RT))) {
    return false
  }

  let result = true

  if (wall & WALL_ORIENTATION_HORIZONTAL) {
    cells[wallCoord + (0 << 0) + (0 << 4)] ^= FLAG_EDGE_DN
    cells[wallCoord + (0 << 0) + (1 << 4)] ^= FLAG_EDGE_DN
    cells[wallCoord + (1 << 0) + (0 << 4)] ^= FLAG_EDGE_UP
    cells[wallCoord + (1 << 0) + (1 << 4)] ^= FLAG_EDGE_UP
    if (getDistP0(game) === -1 || getDistP1(game) === -1) {
      result = false
    }
    cells[wallCoord + (0 << 0) + (0 << 4)] ^= FLAG_EDGE_DN
    cells[wallCoord + (0 << 0) + (1 << 4)] ^= FLAG_EDGE_DN
    cells[wallCoord + (1 << 0) + (0 << 4)] ^= FLAG_EDGE_UP
    cells[wallCoord + (1 << 0) + (1 << 4)] ^= FLAG_EDGE_UP
  }
  if (wall & WALL_ORIENTATION_VERTICAL) {
    cells[wallCoord + (0 << 0) + (0 << 4)] ^= FLAG_EDGE_RT
    cells[wallCoord + (1 << 0) + (0 << 4)] ^= FLAG_EDGE_RT
    cells[wallCoord + (0 << 0) + (1 << 4)] ^= FLAG_EDGE_LT
    cells[wallCoord + (1 << 0) + (1 << 4)] ^= FLAG_EDGE_LT
    if (getDistP0(game) === -1 || getDistP1(game) === -1) {
      result = false
    }
    cells[wallCoord + (0 << 0) + (0 << 4)] ^= FLAG_EDGE_RT
    cells[wallCoord + (1 << 0) + (0 << 4)] ^= FLAG_EDGE_RT
    cells[wallCoord + (0 << 0) + (1 << 4)] ^= FLAG_EDGE_LT
    cells[wallCoord + (1 << 0) + (1 << 4)] ^= FLAG_EDGE_LT
  }

  return result
}

function getValidMovesPlayer (game, player, oppPlayer) {
  const cell = game.cells[player]
  const oppCell = game.cells[oppPlayer]
  const validMoves = []

  if (cell & FLAG_EDGE_UP) {
    if (player - (1 << 0) === oppPlayer) {
      if (oppCell & FLAG_EDGE_UP) {
        validMoves.push(oppPlayer - (1 << 0))
      } else {
        if (oppCell & FLAG_EDGE_RT) validMoves.push(oppPlayer + (1 << 4))
        if (oppCell & FLAG_EDGE_LT) validMoves.push(oppPlayer - (1 << 4))
      }
    } else {
      validMoves.push(player - (1 << 0))
    }
  }
  if (cell & FLAG_EDGE_RT) {
    if (player + (1 << 4) === oppPlayer) {
      if (oppCell & FLAG_EDGE_RT) {
        validMoves.push(oppPlayer + (1 << 4))
      } else {
        if (oppCell & FLAG_EDGE_UP) validMoves.push(oppPlayer - (1 << 0))
        if (oppCell & FLAG_EDGE_DN) validMoves.push(oppPlayer + (1 << 0))
      }
    } else {
      validMoves.push(player + (1 << 4))
    }
  }
  if (cell & FLAG_EDGE_LT) {
    if (player - (1 << 4) === oppPlayer) {
      if (oppCell & FLAG_EDGE_LT) {
        validMoves.push(oppPlayer - (1 << 4))
      } else {
        if (oppCell & FLAG_EDGE_UP) validMoves.push(oppPlayer - (1 << 0))
        if (oppCell & FLAG_EDGE_DN) validMoves.push(oppPlayer + (1 << 0))
      }
    } else {
      validMoves.push(player - (1 << 4))
    }
  }
  if (cell & FLAG_EDGE_DN) {
    if (player + (1 << 0) === oppPlayer) {
      if (oppCell & FLAG_EDGE_DN) {
        validMoves.push(oppPlayer + (1 << 0))
      } else {
        if (oppCell & FLAG_EDGE_RT) validMoves.push(oppPlayer + (1 << 4))
        if (oppCell & FLAG_EDGE_LT) validMoves.push(oppPlayer - (1 << 4))
      }
    } else {
      validMoves.push(player + (1 << 0))
    }
  }

  return validMoves
}

function getValidMovesWall (game) {
  const validMoves = []

  for (let row = 0; row < 8; ++row) {
    for (let col = 0; col < 8; ++col) {
      const coord = (row << 0) | (col << 4)
      if (canPlaceWall(game, coord | WALL_ORIENTATION_HORIZONTAL)) validMoves.push(coord | WALL_ORIENTATION_HORIZONTAL)
      if (canPlaceWall(game, coord | WALL_ORIENTATION_VERTICAL)) validMoves.push(coord | WALL_ORIENTATION_VERTICAL)
    }
  }

  return validMoves
}

function executeMove (game, move) {
  if (move & (WALL_ORIENTATION_HORIZONTAL | WALL_ORIENTATION_VERTICAL)) {
    const wallCoord = move & 0b11111111
    game.walls[wallCoord] = true
    const cells = game.cells
    if (move & WALL_ORIENTATION_HORIZONTAL) {
      cells[wallCoord + (0 << 0) + (0 << 4)] ^= FLAG_EDGE_DN
      cells[wallCoord + (0 << 0) + (1 << 4)] ^= FLAG_EDGE_DN
      cells[wallCoord + (1 << 0) + (0 << 4)] ^= FLAG_EDGE_UP
      cells[wallCoord + (1 << 0) + (1 << 4)] ^= FLAG_EDGE_UP
    }
    if (move & WALL_ORIENTATION_VERTICAL) {
      cells[wallCoord + (0 << 0) + (0 << 4)] ^= FLAG_EDGE_RT
      cells[wallCoord + (1 << 0) + (0 << 4)] ^= FLAG_EDGE_RT
      cells[wallCoord + (0 << 0) + (1 << 4)] ^= FLAG_EDGE_LT
      cells[wallCoord + (1 << 0) + (1 << 4)] ^= FLAG_EDGE_LT
    }
    if ((game.turnCounter & 1) === 0) --game.player0Walls
    else --game.player1Walls
  } else {
    if ((game.turnCounter & 1) === 0) game.player0 = move
    else game.player1 = move
  }
  ++game.turnCounter
}

function cloneGame (game) {
  return {
    cells: Object.assign({}, game.cells),
    player0: game.player0,
    player1: game.player1,
    walls: Object.assign({}, game.walls),
    player0Walls: game.player0Walls,
    player1Walls: game.player1Walls,
    turnCounter: game.turnCounter
  }
}

function createGame () {
  const game = {}

  game.cells = {}
  for (let row = 0; row < 9; ++row) {
    for (let col = 0; col < 9; ++col) {
      let cell = 0
      if (row > 0) cell ^= FLAG_EDGE_UP
      if (col < 8) cell ^= FLAG_EDGE_RT
      if (row < 8) cell ^= FLAG_EDGE_DN
      if (col > 0) cell ^= FLAG_EDGE_LT
      game.cells[(row << 0) | (col << 4)] = cell
    }
  }

  game.player0 = (8 << 0) | (4 << 4)
  game.player1 = (0 << 0) | (4 << 4)

  game.walls = {}

  game.player0Walls = 10
  game.player1Walls = 10

  game.turnCounter = 0

  return game
}

function playGame (timeout) {
  const game = createGame()

  function growLeaves (tree, depth, depthIndex) {
    const node = tree[depth][depthIndex]
    const game = cloneGame(tree[0][0].game)
    const parents = []
    let currNode = node
    while (currNode.parent) {
      parents.push(currNode)
      currNode = currNode.parent
    }
    for (let i = parents.length - 1; i >= 0; --i) executeMove(game, parents[i].move)

    if ((game.player0 & 0b1111) === (0 << 0) ||
        (game.player1 & 0b1111) === (8 << 0)) return

    let validMoves
    if ((game.turnCounter & 1) === 0) {
      validMoves = getValidMovesPlayer(game, game.player0, game.player1)
      if (game.player0Walls > 0) validMoves = validMoves.concat(getValidMovesWall(game))
    } else {
      validMoves = getValidMovesPlayer(game, game.player1, game.player0)
      if (game.player1Walls > 0) validMoves = validMoves.concat(getValidMovesWall(game))
    }

    for (let i = 0, l = validMoves.length; i < l; ++i) {
      const move = validMoves[i]
      const nextGame = cloneGame(game)
      executeMove(nextGame, move)
      const nextNode = {
        move,
        score: getScore(nextGame),
        children: [],
        parent: node
      }
      node.children.push(nextNode)
      tree[depth + 1].push(nextNode)
    }
  }

  function getNodeCumScore (node, depth) {
    if (node.children.length === 0) return node.score

    const childrenScores = node.children.map(child => getNodeCumScore(child, depth + 1))
    const incentiveFunc = (depth & 1) === 0 ? Math.max : Math.min
    return incentiveFunc(...childrenScores)
  }

  while ((game.player0 & 0b1111) !== (0 << 0) &&
         (game.player1 & 0b1111) !== (8 << 0)) {
    const start = Date.now()
    const tree = [ [ { game, score: getScore(game), children: [] } ], [] ]
    let depth = 0
    let depthIndex = 0

    do {
      growLeaves(tree, depth, depthIndex)
      ++depthIndex
      if (depthIndex === tree[depth].length) {
        depthIndex = 0
        ++depth
        shuffle(tree[depth])
        tree[depth + 1] = []
      }
    } while (Date.now() - start < timeout)
    // } while (depth < 5)

    const root = tree[0][0]
    const childrenScores = root.children.map(child => getNodeCumScore(child, (root.game.turnCounter & 1) + 1))
    const incentiveFunc = (root.game.turnCounter & 1) === 0 ? Math.max : Math.min
    const bestScore = incentiveFunc(...childrenScores)
    const bestMoves = root.children.reduce((acc, child, i) => {
      if (childrenScores[i] === bestScore) acc.push(child.move)
      return acc
    }, [])
    const bestMove = bestMoves[bestMoves.length * Math.random() | 0]

    console.log(bestMove)
    executeMove(game, bestMove)
  }
}

function suggest (game2p, timeout) {
  return new Promise((resolve, reject) => {
    const game = createGame()
    for (const wall of game2p.placedWalls.values()) {
      const wallCoord = (wall.r << 0) | (wall.c << 4)
      if (wall.orientation === 0) {
        game.cells[wallCoord + (0 << 0) + (0 << 4)] ^= FLAG_EDGE_DN
        game.cells[wallCoord + (0 << 0) + (1 << 4)] ^= FLAG_EDGE_DN
        game.cells[wallCoord + (1 << 0) + (0 << 4)] ^= FLAG_EDGE_UP
        game.cells[wallCoord + (1 << 0) + (1 << 4)] ^= FLAG_EDGE_UP
      }
      if (wall.orientation === 1) {
        game.cells[wallCoord + (0 << 0) + (0 << 4)] ^= FLAG_EDGE_RT
        game.cells[wallCoord + (1 << 0) + (0 << 4)] ^= FLAG_EDGE_RT
        game.cells[wallCoord + (0 << 0) + (1 << 4)] ^= FLAG_EDGE_LT
        game.cells[wallCoord + (1 << 0) + (1 << 4)] ^= FLAG_EDGE_LT
      }
      game.walls[wallCoord] = true
    }
    game.player0 = (game2p.player0.r << 0) | (game2p.player0.c << 4)
    game.player1 = (game2p.player1.r << 0) | (game2p.player1.c << 4)
    game.player0Walls = game2p.player0.walls
    game.player1Walls = game2p.player1.walls
    game.turnCounter = game2p.turnCounter

    function growLeaves (tree, depth, depthIndex) {
      const node = tree[depth][depthIndex]
      const game = cloneGame(tree[0][0].game)
      const parents = []
      let currNode = node
      while (currNode.parent) {
        parents.push(currNode)
        currNode = currNode.parent
      }
      for (let i = parents.length - 1; i >= 0; --i) executeMove(game, parents[i].move)

      if ((game.player0 & 0b1111) === (0 << 0) ||
          (game.player1 & 0b1111) === (8 << 0)) return

      let validMoves
      if ((game.turnCounter & 1) === 0) {
        validMoves = getValidMovesPlayer(game, game.player0, game.player1)
        if (game.player0Walls > 0) validMoves = validMoves.concat(getValidMovesWall(game))
      } else {
        validMoves = getValidMovesPlayer(game, game.player1, game.player0)
        if (game.player1Walls > 0) validMoves = validMoves.concat(getValidMovesWall(game))
      }

      for (let i = 0, l = validMoves.length; i < l; ++i) {
        const move = validMoves[i]
        const nextGame = cloneGame(game)
        executeMove(nextGame, move)
        const nextNode = {
          move,
          score: getScore(nextGame),
          children: [],
          parent: node
        }
        node.children.push(nextNode)
        tree[depth + 1].push(nextNode)
      }
    }

    function getNodeCumScore (node, depth) {
      if (node.children.length === 0) return node.score

      const childrenScores = node.children.map(child => getNodeCumScore(child, depth + 1))
      const incentiveFunc = (depth & 1) === 0 ? Math.max : Math.min
      return incentiveFunc(...childrenScores)
    }

    const start = Date.now()
    const tree = [ [ { game, score: getScore(game), children: [] } ], [] ]
    let depth = 0
    let depthIndex = 0

    ;(function looper () {
      setTimeout(() => {
        growLeaves(tree, depth, depthIndex)
        ++depthIndex
        if (depthIndex === tree[depth].length) {
          depthIndex = 0
          ++depth
          shuffle(tree[depth])
          tree[depth + 1] = []
        }
        if (Date.now() - start < timeout) {
          looper()
        } else {
          const root = tree[0][0]
          const childrenScores = root.children.map(child => getNodeCumScore(child, (root.game.turnCounter & 1) + 1))
          const incentiveFunc = (root.game.turnCounter & 1) === 0 ? Math.max : Math.min
          const bestScore = incentiveFunc(...childrenScores)
          const bestMoves = root.children.reduce((acc, child, i) => {
            if (childrenScores[i] === bestScore) acc.push(child.move)
            return acc
          }, [])
          const bestMove = bestMoves[bestMoves.length * Math.random() | 0]

          resolve(bestMove)
        }
      }, 0)
    })()
  })
}

module.exports = {
  playGame,
  suggest
}
