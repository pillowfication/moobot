const { CronJob } = require('cron')
const construe = require('cronstrue')
const db = require('./db')
const parseArgs = require('../parseArgs')

function cron (client) {
  const command = '~/cron'
  const jobs = {}

  function startJob (channelId, jobId, job) {
    const channelJobs = jobs[channelId] || (jobs[channelId] = {})
    channelJobs[jobId] = new CronJob(job.cronPattern, () => {
      (async () => {
        const channel = await client.channels.fetch(channelId)
        channel.send(job.message)
      })()
        .catch(err => { console.error(err) })
    }, null, true, 'America/Los_Angeles')
  }

  function stopJob (channelId, jobId) {
    const channelJobs = jobs[channelId]
    if (!channelJobs) return
    const job = channelJobs[jobId]
    if (!job) return

    job.stop()
    delete channelJobs[jobId]
  }

  // Start all jobs
  ;(async () => {
    const data = await db._getData()
    for (const channelId in data.channels) {
      const jobs = data.channels[channelId].jobs
      for (const jobId in jobs) {
        const job = jobs[jobId]
        startJob(channelId, jobId, job)
      }
    }
  })()

  client.on('message', async message => {
    if (message.author.bot) return

    const args = parseArgs(message.content)
    if (args[0] !== command) return

    const { channel } = message

    ;(async () => {
      switch (args[1]) {
        case 'parse': {
          const [,, cronPattern] = args
          let cronString
          try {
            cronString = construe.toString(cronPattern)
          } catch (err) {
            cronString = `\`\`\`${err}\`\`\``
          }
          channel.send(cronString)
          break
        }
        case 'add': {
          const [,, cronPattern, cronMessage] = args
          let cronString
          try {
            cronString = construe.toString(cronPattern)
          } catch (err) {
            return channel.send(`\`\`\`${err}\`\`\``)
          }

          if (cronMessage) {
            const job = await db.addJob(channel.id, {
              cronPattern,
              message: cronMessage
            })
            startJob(channel.id, job.id, job)
            channel.send(`Job created with timer: ${cronString}`)
          } else {
            channel.send('No message provided.')
          }
          break
        }
        case 'delete': {
          const [,, jobId] = args
          const jobs = await db.getAllJobs(channel.id)
          const job = jobs.find(job => job.id === +jobId)
          console.log(jobId, jobs)
          if (job) {
            await db.deleteJob(channel.id, jobId)
            stopJob(channel.id, jobId)
            channel.send('Job deleted.')
          } else {
            channel.send(`No job found with ID: \`${jobId}\`.`)
          }
          break
        }
        case 'ls': {
          const jobs = await db.getAllJobs(channel.id)
          channel.send(`\`\`\`\n${jobs.map(job =>
            `${job.id}: ${job.cronPattern} - ${job.message.length > 40 ? job.message.substr(0, 40) + '...' : job.message}`
          ).join('\n')}\n\`\`\``)
          break
        }
      }
    })().catch(err => {
      channel
        .send(`Something bad has happened\n\`\`\`diff\n - ${err.message}\n\`\`\``)
        .catch(() => {})
      console.error(err)
    })
  })
}

module.exports = cron
