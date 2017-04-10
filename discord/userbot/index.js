const Discord = require('discord.js');
const Constants = require('discord.js/src/util/Constants');
const config = require('./config.json');
const winston = require('winston');

const me = new Discord.Client();
me.id = '144761456645242880';
me.prefix = '~/';

[
  require('./modules/eval'),
  require('./modules/exit'),
  require('./modules/mathjax'),
  require('./modules/ping'),
  require('./modules/pinyin'),
  require('./modules/simjang')
]
.forEach(mod => mod.init(me));

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
