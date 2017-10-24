const _ = require('lodash');
const winston = require('winston');

const messageError = require('../../messageError');

module.exports = {
  defaults: {
    command: 'user',
    userbotPath: '../../userbot'
    // cacheLimit: 100
  },

  init(bot, options) {
    options = _.defaults(options, module.exports.defaults);
    const command = `${bot.config.prefix}${options.command}`;
    const userbot = require(options.userbotPath);
    const test = RegExp.prototype.test.bind(new RegExp(`^${command}\\s`));
    let status = 'STOP';

    bot.on('message', message => {
      if (message.author.bot
        || !bot.config.admins.includes(message.author.id)
        || !message.content.startsWith(bot.config.prefix)
        || !test(message.content)
      ) {
        return;
      }

      const tokens = message.content.split(/\s+/);
      switch (tokens[1]) {
        case 'help': {
          message.channel
            .sendCode('',
              `${command}\n` +
              '  help             Print this message\n' +
              '  start [<cache>]  Start the userbot with the specified cache limit\n' +
              '  stop             Stop the userbot'
            )
            .catch(messageError('send'));

          break;
        }

        case 'start': {
          // const cacheLimit = tokens[2] || options.cacheLimit;

          if (status !== 'STOP') {
            return message.channel
              .sendMessage(status === 'START'
                ? 'Error starting userbot. Userbot already started.'
                : 'Error starting userbot. Userbot already starting.'
              )
              .catch(messageError('send'));
          }

          message.channel
            .sendMessage('Starting userbot...')
            .then(message => {
              status = 'LOAD';
              userbot.start()
                // Could not fetch messages. Error: Forbidden
                // .then(me => Promise.all(_.map([...me.channels], ([, channel]) =>
                //   channel && channel.fetchMessages && channel
                //     .fetchMessages({limit: cacheLimit})
                //     .catch(err => winston.error('Could not fetch messages.', err)))
                // ))
                .then(() => {
                  status = 'START';
                  return 'Userbot started';
                })
                .catch(err => {
                  status = 'STOP';
                  winston.error('Could not start userbot.', err);
                  return `Error starting userbot. ${err.message}.`;
                })
                .then(msg => message.edit(msg))
                .catch(messageError('edit'));
            })
            .catch(messageError('send'));

          break;
        }

        case 'stop': {
          if (status === 'STOP') {
            return message.channel
              .sendMessage('Error stopping userbot. Userbot already stopped.')
              .catch(messageError('send'));
          }

          message.channel
            .sendMessage('Starting userbot...')
            .then(message => {
              userbot.destroy()
                .then(() => {
                  status = 'STOP';
                  return 'Userbot stopped.';
                })
                .catch(err => {
                  winston.error('Could not stop userbot.', err);
                  return `Error stopping userbot. ${err.message}.`;
                })
                .then(msg => message.edit(msg))
                .catch(messageError('edit'));
            })
            .catch(messageError('send'));

          break;
        }
      }
    });
  }
};
