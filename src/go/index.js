const matches = {}

module.exports = function go (client) {
  client.on('message', message => {
    if (!message.author.bot && message.content.startsWith('~/go')) {
      const [ cmd, ...args ] = message.content.substr('~/go'.length).trim().split(/\s+/)
      switch (cmd) {
        case 'start':
          let [ p1, p2 ] = args
          if (!p1 || !p2) {
            message.channel.send('Error: Specify two players to play.\n```~/go start <p1> <p2>```')
          } else {
            message.channel.send('Confirm the match with `~/go join`.')
            matches[channel.id] = {
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
              if (matches[channel.id].status === 'PENDING') {
                message.channel.send('Match not confirmed. Deleting match.')
                matches[channel.id] = undefined
              }
            }, 5 * 60 * 1000)
          }
          break

        case 'join':
          if (!matches[channel.id]) {
            message.channel.send('A match has not been started in this channel.')
          } else if (matches[channel.id].status === 'ACTIVE') {
            message.channel.send('A match has already started in this channel.')
          } else {
            const player = matches[channel.id].players.find(p => p.id === message.author.id)
            if (!player) {
              message.channel.send('You are not invited to play this match.')
            } else if (player.status === 'ACTIVE') {
              message.channel.send('You have already confirmed the match.')
            } else {
              message.channel.send('You have confirmed participation in the match.')
              player.status = 'ACTIVE'
              
              let status = 'ACTIVE'
              for (const player of matches[channel.id]) {
                if (player.status === 'PENDING') {
                  status = 'PENDING'
                }
              }
              if (status === 'ACTIVE') {
                message.channel.send('All participants have confirmed participation. Match is starting.')
                matches[channel.id].status = 'ACTIVE'
              }
            }
          }
          break
          
        case 'move':
          break
      }
    }
  })
}
