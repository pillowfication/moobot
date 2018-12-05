const { createCanvas } = require('canvas')
const Game2P = require('./Game2P')
const { suggest } = require('./ai')

const matches = {}

function sendBoard (channel) {
  const game = matches[channel.id].game
  const canvas = createCanvas(200, 200)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, 200, 200)
  ctx.strokeStyle = '#BBBBBB'
  ctx.strokeRect(10, 10, 180, 180)

  channel.send(`\`\`\`\nPlayer ${(game.turnCounter & 1) + 1}'s turn.\n\nP1 Walls: ${game.player0.walls}\nP2 Walls: ${game.player1.walls}\n\`\`\``, canvas.createPNGStream())

  setTimeout(() => doAIStuff(channel), 0)
}

function doAIStuff (channel) {
  const game = matches[channel.id]

  if (game._ai.bot && (game.game.turnCounter & 1) === game._ai.bot - 1) {
    suggest(game.game, game._ai.difficulty).then(bestMove => {
      if (bestMove & (0b11 << 8)) {
        const orientation = (bestMove & (1 << 8)) ? 'h' : 'v'
        const row = 8 - (bestMove & 0b00001111)
        const col = String.fromCharCode(97 + ((bestMove & 0b11110000) >> 4))
        channel.send(`~/go move W${col}${row}${orientation}`)
      } else {
        const row = 9 - (bestMove & 0b00001111)
        const col = String.fromCharCode(97 + ((bestMove & 0b11110000) >> 4))
        channel.send(`~/go move ${col}${row}`)
      }
    })
  }
}

module.exports = function go (client) {
  client.on('message', message => {
    if (message.content.startsWith('~/go')) {
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
            let bot
            let difficulty = args[2]
            if (p1 === '223864853465399296') {
              bot = 1
            } else if (p2 === '223864853465399296') {
              bot = 2
            }
            if (bot) {
              if (!difficulty) {
                return message.channel.send('No difficulty specified.')
              } else {
                difficulty = Math.min(Math.max(Number(difficulty || 1), 0), 5 * 60 * 1000)
                message.channel.send(`Starting match against AI with difficulty = ${difficulty}.`)
              }
            }
            message.channel.send('Confirm the match with `~/go join`.')
            matches[message.channel.id] = {
              status: 'PENDING',
              players: [{
                id: p1,
                status: bot === 1 ? 'ACTIVE' : 'PENDING'
              }, {
                id: p2,
                status: bot === 2 ? 'ACTIVE' : 'PENDING'
              }],
              _ai: {
                bot,
                difficulty
              }
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
                let success = false
                try {
                  matches[message.channel.id].game.makeMove(
                    player,
                    { type: Game2P.MOVE_PLAYER, r, c }
                  )
                  success = true
                } catch (error) {
                  message.channel.send(error.message)
                }
                if (success) {
                  sendBoard(message.channel)

                  const game = matches[message.channel.id].game
                  let winner
                  if (game.player0.r === 0) {
                    winner = 'Player 1'
                  } else if (game.player1.r === 8) {
                    winner = 'Player 2'
                  }
                  if (winner) {
                    message.channel.send(`${winner} wins!`)
                    delete matches[message.channel.id]
                  }
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

        case 'stop':
          const player = matches[message.channel.id].players.findIndex(p => p.id === message.author.id)
          if (player === -1) {
            message.channel.send('You are not participating in this match.')
          } else {
            message.channel.send('Game cancelled.')
            delete matches[message.channel.id]
          }
          break
      }
    }
  })
}
