const winston = require('winston');

module.exports = {
  init(me) {
    me.on('message', message => {
      if (message.author.id !== me.id)
        return;

      winston.info(message.content);

      if (message.content === `${me.prefix}exit`)
        process.exit(0);
    });
  }
};
