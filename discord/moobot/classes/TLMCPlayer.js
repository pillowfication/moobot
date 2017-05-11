const EventEmitter = require('events');
const request = require('request');

const TLMC_URL = 'http://tlmc.pf-n.co';
const COUNT = 49207; // TODO: AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH

function getInfoById(id) {
  id = String(id).replace(/[^0-9]/g, '');

  return new Promise((resolve, reject) => {
    request({url: `${TLMC_URL}/tlmc/info/${id}`, json: true}, (err, res, body) => {
      if (err) {
        return reject(err);
      }

      if (res.statusCode !== 200) {
        return new Error(body);
      }

      resolve({
        id: id,
        url: `${TLMC_URL}/tlmc/id/${id}`,
        info: body
      });
    });
  });
}

function getInfoRandom() {
  const index = COUNT * Math.random() | 0;
  return getInfoById(index + 1);
}

class TLMCPlayer extends EventEmitter {
  constructor(connection) {
    super();

    if (!connection) {
      throw new TypeError('Parameter `connection` is required');
    }

    this.connection = connection;
    this.queue = [];
    this.currentTrack = null;

    this.on('trackEnd', () => {
      if (this.connection) {
        this.playNextTrack(true);
      }
    });

    this.playNextTrack(true);
  }

  queueTrack(identifier) {
    return this.constructor.resolveTrack(identifier)
      .then(info => this.queue.push(info));
  }

  playNextTrack(auto) {
    const {dispatcher} = this.connection;
    if (dispatcher && !dispatcher.destroyed) {
      dispatcher.end();
    }

    if (!auto) {
      return;
    }

    let queuedTrack = this.queue.shift();
    return (queuedTrack
      ? Promise.resolve(queuedTrack)
      : this.constructor.resolveTrackRandom())
      .then(track => {
        this.currentTrack = track;
        const dispatcher = this.connection.playArbitraryInput(track.url);
        dispatcher.on('end', () => {
          this.emit('trackEnd', track.url);
        });
      });
  }

  destroy() {
    const connection = this.connection;
    this.connection = null;
    connection.disconnect();
  }

  static resolveTrack(identifier) {
    if (Number.isInteger(Number(identifier))) {
      return getInfoById(identifier);
    }
  }

  static resolveTrackRandom() {
    return getInfoRandom();
  }
}

TLMCPlayer.TLMC_URL = TLMC_URL;

module.exports = TLMCPlayer;
