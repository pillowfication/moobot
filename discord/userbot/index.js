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

me.on('ready', () => {
  winston.info('Userbot ready.');
});

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

me.loginEmailPassword(config.email, config.password)
  .then(() =>
    winston.info('Userbot logged in.')
  )
  .catch(err => {
    winston.error('Could not log in', err);
    process.exit(1);
  });
