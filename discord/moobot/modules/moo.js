const _ = require('lodash');
const messageError = require('../../messageError');

module.exports = {
  defaults: {
    probability: .2,
    regex: /\bmoo+\b/i
  },

  init(bot, options) {
    options = _.defaults(options, module.exports.defaults);
    const test = RegExp.prototype.test.bind(options.regex);

    bot.on('message', message => {
      if (message.author.bot) {
        return;
      }

      if (Math.random() < options.probability && test(message.content)) {
        message.channel
          .sendMessage('moo')
          .catch(messageError('send'));
      }
    });
  }
};
