const winston = require('winston');
const userbot = require('../../userbot');

module.exports = {
  init(bot) {
    const test = RegExp.prototype.test.bind(new RegExp(`^${bot.config.prefix}user\\s+`));
    let isStarted = false;

    bot.on('message', message => {
      if (message.author.bot || !bot.config.admins.includes(message.author.id))
        return;

      if (message.content.startsWith(bot.config.prefix) && test(message.content)) {
        const tokens = message.content.split(/\s+/);
        switch (tokens[1]) {
          case 'help':
          case 'h': {
            break;
          }

          case 'start': {
            if (isStarted)
              return message.channel
                .sendMessage('Userbot already started.')
                .catch(err =>
                  winston.error('Could not send message.', err)
                );

            userbot.start()
              .then(() => {
                isStarted = true;
                message.channel
                  .sendMessage('Userbot started.')
                  .catch(err =>
                    winston.error('Could not send message.', err)
                  );
              })
              .catch(err => {
                winston.error('Could not start userbot.', err);
                message.channel
                  .sendMessage('Could not start userbot.')
                  .catch(err =>
                    winston.error('Could not send message.', err)
                  );
              });
            break;
          }

          case 'stop': {
            if (!isStarted)
              return message.channel
                .sendMessage('Userbot already stopped.')
                .catch(err =>
                  winston.error('Could not send message.', err)
                );

            userbot.destroy()
              .then(() => {
                isStarted = false;
                message.channel
                  .sendMessage('Userbot stopped.')
                  .catch(err =>
                    winston.error('Could not send message.', err)
                  );
              })
              .catch(err => {
                winston.error('Could not stop userbot.', err);
                message.channel
                  .sendMessage('Could not stop userbot.')
                  .catch(err =>
                    winston.error('Could not send message.', err)
                  );
              });
            break;
          }
        }
      }
    });
  }
};
