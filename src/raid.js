const CronJob = require('cron').CronJob

module.exports = function raid (client) {
  const raidTime = new CronJob('30 21 * * TUE', () => {
    const squadSpam = client.channels.get('464421227713527808')
    if (!squadSpam) {
      console.error('yo wtf')
    } else {
      squadSpam.send('<@&496728329395765266> raid time yo')
    }
  })

  raidTime.start()
}
