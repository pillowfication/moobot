const _ = require('lodash');
const messageError = require('../../messageError');

module.exports = {
  defaults: {
    command: 'ping'
  },

  init(me, options) {
    options = _.defaults(options, module.exports.defaults);
    const command = `${me.config.prefix}${options.command}`;

    me.on('message', message => {
      if (message.author.id !== me.config.id || !message.content.startsWith(me.config.prefix)) {
        return;
      }

      if (message.content === command) {
        message.edit(`${message.content} pong`)
          .then(({content, editedTimestamp, createdTimestamp}) =>
            message.edit(`${content} (${editedTimestamp - createdTimestamp}ms)`)
          )
          .catch(messageError('edit'));
      }
    });
  }
};
