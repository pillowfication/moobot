const winston = require('winston');

const REGEX = /(^|\s)moo+($|\s)/i;
const PROB = .2;

const test = RegExp.prototype.test.bind(REGEX);

module.exports = {
  init(bot) {
    bot.on('message', message => {
      if (message.author.bot)
        return;

      if (Math.random() < PROB && test(message.content))
        message.channel
          .sendMessage('moo')
          .catch(err =>
            winston.error('Cannot send message.', err)
          );
    });
  }
};
