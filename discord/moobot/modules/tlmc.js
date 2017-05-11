const _ = require('lodash');
const messageError = require('../../messageError');

const TLMCPlayer = require('../classes/TLMCPlayer');

module.exports = {
  defaults: {
    command: 'tlmc'
  },

  init(bot, options) {
    options = _.defaults(options, module.exports.defaults);
    const command = `${bot.config.prefix}${options.command}`;

    const TLMCPlayers = {};

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
          message.channel
            .sendCode('',
              `${command}\n` +
              'See http://tlmc.pf-n.co for all songs available\n' +
              '  help   Print this message\n' +
              '  start  Join voice channel and initialize player'
            )
            .catch(messageError('send'));
          break;
        }

        case 'start': {
          if (!message.member.voiceChannel) {
            return message.channel
              .sendMessage(`You must be in a voice channel. See \`${command} help\` for more information.`)
              .catch(messageError('send'));
          }

          if (TLMCPlayers[message.guild.id]) {
            return message.channel
              .sendMessage('Already joined a voice channel.')
              .catch(messageError('send'));
          }

          message.member.voiceChannel.join()
            .then(connection => {
              const player = new TLMCPlayer(connection);
              TLMCPlayers[message.guild.id] = player;
            });

          break;
        }

        case 'skip': {
          const player = TLMCPlayers[message.guild.id];
          if (!player) {
            return message.channel
              .sendMessage(`No TLMCPlayer object found for this guild. See \`${command} help\` for more information.`)
              .catch(messageError('send'));
          }

          player.playNextTrack();
        }
      }
    });
  }
};
