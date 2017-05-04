const _ = require('lodash');
const messageError = require('../../messageError');

const TLMC_URL = 'http://tlmc.pf-n.co';

module.exports = {
  defaults: {
    command: 'tlmc'
  },

  init(bot, options) {
    options = _.defaults(options, module.exports.defaults);
    const command = `${bot.config.prefix}${options.command}`;

    const test = RegExp.prototype.test.bind(new RegExp(`^${command}\\s`));

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
          break;
        }

        case 'play': {
          const id = tokens[2];

          if (!id) {
            return message.channel
              .sendMessage(`No \`id\` specified. See \`${command} help\` for more information.`)
              .catch(messageError('send'));
          }

          if (!message.member.voiceChannel) {
            return message.channel
              .sendMessage(`You must be in a voice channel. See \`${command} help\` for more information.`)
              .catch(messageError('send'));
          }

          message.member.voiceChannel.join()
            .then(connection => {
              connection.playArbitraryInput(`${TLMC_URL}/tlmc/id/${id}`);
            })
            .catch(() => {
              console.log('wtf did I do')
            });

          break;
        }
      }
    });
  }
};
