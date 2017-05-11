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

class TLMCPlayer {
  constructor(connection) {
    if (!connection) {
      throw new TypeError('Parameter `connection` is required');
    }

    this.connection = connection;
    this.queue = [];
    this.currentTrack = null;

    this.playNextTrack()
      // .then(dispatcher => {
      //   this._dispatcher = dispatcher;
      //   dispatcher.on('end', this.playNextTrack.bind(this));
      // });
  }

  queueTrack(identifier) {
    return this.constructor.resolveTrack(identifier)
      .then(info => this.queue.push(info));
  }

  playNextTrack() {
    console.log('PLAY NEXT TRACK')
    let queuedTrack = this.queue.shift();
    return (queuedTrack
      ? Promise.resolve(queuedTrack)
      : this.constructor.resolveTrackRandom())
      .then(track => this.currentTrack = track)
      .then(track => {console.log(track); return track})
      .then(track => this._playTrackUrl(track.url))
  }

  _playTrackUrl(url) {
    return this.connection.playArbitraryInput(url);
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
