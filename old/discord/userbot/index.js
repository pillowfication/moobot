const Discord = require('discord.js');
const Constants = require('discord.js/src/util/Constants');
const winston = require('winston');
const config = require('../../config.json');
const meConfig = require('./config.js');

const me = new Discord.Client();
me.config = meConfig;

// Plug in modules
require('./modules/eval').init(me);
require('./modules/mathjax').init(me);
require('./modules/ping').init(me);
require('./modules/pinyin').init(me);
require('./modules/simjang').init(me);

me.loginEmailPassword = function loginEmailPassword(email, password) {
  return new Promise((resolve, reject) => {
    this.rest.client.email = email;
    this.rest.client.password = password;
    this.rest.makeRequest('post', Constants.Endpoints.login, false, {email, password})
      .then(data => {
        this.rest.client.manager.connectToWebSocket(data.token, resolve, reject);
      })
      .catch(reject);
  });
};

me.start = function start() {
  return me
    .loginEmailPassword(config.email, config.password)
    .then(() => me);
};

if (require.main === module) {
  me.on('ready', () => winston.info('Userbot ready.'));

  me.start()
    .then(() => winston.info('Userbot logged in.'))
    .catch(() => winston.info('Userbot could not log in.'));
}

module.exports = me;
