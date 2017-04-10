const winston = require('winston');

module.exports = {
  init(me) {
    me.on('message', message => {
      if (message.author.id !== me.id || !message.content.startsWith(me.prefix))
        return;

      if (message.content !== `${me.prefix}ping`)
        return;

      message.edit(`${message.content} pong`)
        .then(message =>
          message.edit(`${message.content} (${message.editedTimestamp - message.createdTimestamp}ms)`)
        )
        .catch(err =>
          winston.error('Could not edit message.', err)
        );
    });
  }
};
