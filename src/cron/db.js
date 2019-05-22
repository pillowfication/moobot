const path = require('path')
const jsonfile = require('jsonfile')

const CRON_PATH = path.resolve(__dirname, '../../data/cron.json')

// Check existence
try {
  jsonfile.readFileSync(CRON_PATH)
} catch (err) {
  if (err.code === 'ENOENT') {
    jsonfile.writeFileSync(CRON_PATH, {
      channels: {}
    })
  } else {
    throw err
  }
}

let cache = null
async function read (channelId) {
  const data = cache || await jsonfile.readFile(CRON_PATH)
  cache = data
  return data.channels[channelId] || { jobs: {}, nextId: 0 }
}
async function write (channelId, channelData) {
  const data = cache || await jsonfile.readFile(CRON_PATH)
  cache = null
  data.channels[channelId] = channelData
  await jsonfile.writeFile(CRON_PATH, data)
}

module.exports = {
  async _getData () {
    return cache || jsonfile.readFile(CRON_PATH)
  },
  async getAllJobs (channelId) {
    const data = await read(channelId)
    return Object.keys(data.jobs).sort((a, b) => a - b).map(id => data.jobs[id])
  },
  async addJob (channelId, job) {
    const data = await read(channelId)
    job.id = data.nextId++
    data.jobs[job.id] = job
    await write(channelId, data)
    return job
  },
  async deleteJob (channelId, jobId) {
    const data = await read(channelId)
    delete data.jobs[jobId]
    await write(channelId, data)
  }
}
