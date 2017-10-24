const EventEmitter = require('events')
const persist = require('./persist')

const Status = {
  STOP: 'STOP',
  WAIT: 'WAIT',
  LOAD: 'LOAD'
}

module.exports = class Scrape extends EventEmitter {
  constructor (scraper, dataPath, cb) {
    super()
    this.scraper = scraper
    this.data = persist(dataPath)
    this.timer = null
    this.status = Status.STOP
  }

  async refresh () {
    const previousStatus = this.status
    if (previousStatus === Status.LOAD) {
      throw new Error('Scrape already in progress')
    }

    this.status = Status.LOAD
    const newData = await this.scraper()
    await this.data.set(null, newData)
    this.status = previousStatus
  }

  async scrape () {
    const previousStatus = this.status
    if (previousStatus === Status.LOAD) {
      throw new Error('Scrape already in progress')
    }

    this.status = Status.LOAD
    const oldData = await this.data.get(null)
    const newData = await this.scraper()
    await this.data.set(null, newData)
    this.status = previousStatus
    return { oldData, newData }
  }

  // TODO: Better interval timing...
  start (interval = 12000) {
    if (this.timer) {
      throw new Error('Already started')
    }
    this.status = Status.START

    this.timer = setInterval(() => {
      this.scrape()
        .then(delta => this.emit('scrape', delta))
        .catch(error => this.emit('error', error))
    }, interval)
  }

  stop () {
    if (!this.timer) {
      throw new Error('Already stopped')
    }
    this.status = Status.STOP

    clearInterval(this.timer)
    this.timer = null
  }
}
