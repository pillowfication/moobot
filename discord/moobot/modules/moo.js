const winston = require('winston');

module.exports = {
  defaults: {
    probability: .2,
    regex: /\bmoo+\b/i
  },

  init(bot, options) {
    options = Object.assign({}, module.exports.defaults, options);
    const test = RegExp.prototype.test.bind(options.regex);

    bot.on('message', message => {
      if (message.author.bot)
        return;

      if (Math.random() < options.probability && test(message.content))
        message.channel
          .sendMessage('moo')
          .catch(err =>
            winston.error('Cannot send message.', err)
          );
    });
  }
};
