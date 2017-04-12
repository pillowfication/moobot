const Discord = require('discord.js');
const Constants = require('discord.js/src/util/Constants');
const winston = require('winston');
const config = require('../../config.json');

const me = new Discord.Client();
me.id = '144761456645242880';
me.prefix = '~/';

// Plug in modules
require('./modules/eval').init(me);
require('./modules/mathjax').init(me);
require('./modules/ping').init(me);
require('./modules/pinyin').init(me);
require('./modules/simjang').init(me);

me.loginEmailPassword = function(email, password) {
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

me.start = me.loginEmailPassword.bind(me, config.email, config.password);

if (require.main === module) {
  me.on('ready', () => {
    winston.info('Userbot ready.');
  });

  me.start()
    .then(() =>
      winston.info('Userbot logged in.')
    )
    .catch(() =>
      winston.info('Userbot could not log in.')
    );
}

module.exports = me;
