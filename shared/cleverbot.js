const cleverbot = require('cleverbot.io');
const config = require('./config.json');

const bot = new cleverbot(config.cleverbotUsername, config.cleverbotApi);

let ask = function(message, cb) {
  setImmediate(cb, 'Cleverbot is still being initialized.', undefined);
};

bot.create((err) => {
  ask = err ? function(message, cb) {
    setImmediate(cb, 'Cleverbot creation failed.', undefined);
  } : bot.ask.bind(bot);
});

module.exports = function cleverbot(message, cb) {
  ask(message, cb);
};
