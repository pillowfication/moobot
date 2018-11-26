const Game2P = require('./Game2P')

const matches = {}

function sendBoard (channel) {
  const game = matches[channel.id].game
  const board = []
  for (let r = 0; r < 9; ++r) {
    let row = (board[r << 1] = [])
    for (let c = 0; c < 9; ++c) {
      row[c << 1] =
        (game.player0.r === r && game.player0.c === c) ? '1'
          : (game.player1.r === r && game.player1.c === c) ? '2' : '·'
    }
  }
  for (let r = 0; r < 8; ++r) {
    board[(r << 1) | 1] = []
  }
  for (const wall of game.placedWalls.values()) {
    let r = (wall.r << 1) | 1
    let c = (wall.c << 1) | 1
    if (wall.orientation === Game2P.WALL_HORIZONTAL) {
      board[r][c - 1] = '―'
      board[r][c] = '―'
      board[r][c + 1] = '―'
    } else /* if (wall.orientation === Game2P.WALL_VERTICAL) */ {
      board[r - 1][c] = '|'
      board[r][c] = '|'
      board[r + 1][c] = '|'
    }
  }
  const boardString = board.map((row, r) => {
    let str = (r & 1) === 0 ? (9 - (r >> 1)) + ' ' : '  '
    for (let i = 0; i < 17; ++i) {
      str += row[i] || ' '
    }
    return str
  }).join('\n') + '\n\n  a b c d e f g h i'

  channel.send(`\`\`\`\nPlayer ${(game.turnCounter & 1) + 1}'s turn.\n\nP1 Walls: ${game.player0.walls}\nP2 Walls: ${game.player1.walls}\n\n${boardString}\n\`\`\``)
}

module.exports = function go (client) {
  client.on('message', message => {
    if (!message.author.bot && message.content.startsWith('~/go')) {
      const [ cmd, ...args ] = message.content.substr('~/go'.length).trim().split(/\s+/)
      switch (cmd) {
        case 'start':
          if (matches[message.channel.id]) {
            message.channel.send('A match has already been started in this channel')
            break
          }

          let [ p1, p2 ] = args.slice(0, 2).map(p => {
            let match = p.match(/^<@([0-9]+)>$/)
            return match ? match[1] : undefined
          })
          if (!p1 || !p2) {
            message.channel.send('Specify two players to play.\n```~/go start <p1> <p2>```')
          } else {
            message.channel.send('Confirm the match with `~/go join`.')
            matches[message.channel.id] = {
              status: 'PENDING',
              players: [{
                id: p1,
                status: 'PENDING'
              }, {
                id: p2,
                status: 'PENDING'
              }]
            }
            setTimeout(() => {
              if (matches[message.channel.id].status === 'PENDING') {
                message.channel.send('Match not confirmed. Deleting match.')
                matches[message.channel.id] = undefined
              }
            }, 60 * 1000)
          }
          break

        case 'join':
          if (!matches[message.channel.id]) {
            message.channel.send('A match has not been started in this channel.')
          } else if (matches[message.channel.id].status === 'ACTIVE') {
            message.channel.send('A match has already started in this channel.')
          } else {
            const player = matches[message.channel.id].players.find(p => p.id === message.author.id)
            if (!player) {
              message.channel.send('You are not invited to play this match.')
            } else if (player.status === 'ACTIVE') {
              message.channel.send('You have already confirmed participation in the match.')
            } else {
              message.channel.send('You have confirmed participation in the match.')
              player.status = 'ACTIVE'

              let status = 'ACTIVE'
              for (const player of matches[message.channel.id].players) {
                if (player.status === 'PENDING') {
                  status = 'PENDING'
                }
              }
              if (status === 'ACTIVE') {
                message.channel.send('All participants have confirmed participation. Match is starting.')
                matches[message.channel.id].status = 'ACTIVE'
                matches[message.channel.id].game = new Game2P(9, 9, 10)
                sendBoard(message.channel)
              }
            }
          }
          break

        case 'move':
          if (!matches[message.channel.id]) {
            message.channel.send('A match has not been started in this channel.')
          } else if (matches[message.channel.id].status === 'PENDING') {
            message.channel.send('A match is currently pending in this channel.')
          } else {
            const player = matches[message.channel.id].players.findIndex(p => p.id === message.author.id)
            if (player === -1) {
              message.channel.send('You are not participating in this match.')
            } else if (!args[0]) {
              message.channel.send('No move specified.')
            } else {
              const matchMovePlayer = args[0].match(/^([a-z])([0-9])$/)
              if (matchMovePlayer) {
                const c = matchMovePlayer[1].charCodeAt(0) - 97
                const r = 9 - Number(matchMovePlayer[2])
                try {
                  matches[message.channel.id].game.makeMove(
                    player,
                    { type: Game2P.MOVE_PLAYER, r, c }
                  )
                  sendBoard(message.channel)
                } catch (error) {
                  message.channel.send(error.message)
                }
              }

              const matchMoveWall = args[0].match(/^W([a-z])([0-9])(h|v)$/)
              if (matchMoveWall) {
                const c = matchMoveWall[1].charCodeAt(0) - 97
                const r = 8 - Number(matchMoveWall[2])
                const orientation = matchMoveWall[3] === 'h' ? Game2P.WALL_HORIZONTAL : Game2P.WALL_VERTICAL
                try {
                  matches[message.channel.id].game.makeMove(
                    player,
                    { type: Game2P.MOVE_WALL, r, c, orientation }
                  )
                  sendBoard(message.channel)
                } catch (error) {
                  message.channel.send(error.message)
                }
              }

              if (!matchMovePlayer && !matchMoveWall) {
                message.channel.send('Could not parse your move')
              }
            }
          }
          break
      }
    }
  })
}
