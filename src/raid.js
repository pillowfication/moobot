const CronJob = require('cron').CronJob

module.exports = function raid (client) {
  const raidTime = new CronJob('0 30 21 * * 2,4', () => {
    const squadSpam = client.channels.get('464421227713527808')
    if (!squadSpam) {
      console.error('yo wtf')
    } else {
      squadSpam.send('<@&496728329395765266> Raid starting in 30 minutes. Join the party finder. Password is 6969.')
    }
  }, null, false, 'America/Los_Angeles')

  raidTime.start()
}
