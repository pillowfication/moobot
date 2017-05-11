const _ = require('lodash');
const path = require('path');
const persist = require('../../../utils/persist');
const messageError = require('../../messageError');

const TLMCPlayer = require('../classes/TLMCPlayer');

module.exports = {
  defaults: {
    command: 'tlmc',
    dataPath: path.join(__dirname, 'osu-data.json')
  },

  init(bot, options) {
    options = _.defaults(options, module.exports.defaults);
    const command = `${bot.config.prefix}${options.command}`;
    const data = persist(options.dataPath);
    const TLMCPlayers = {};

    function bindChannel(guildId, channelId) {
      return data.set([guildId], channelId);
    }

    const test = RegExp.prototype.test.bind(new RegExp(`^${command}\\s`));

    bot.on('message', message => {
      if (message.author.bot
        || !message.content.startsWith(bot.config.prefix)
        || !test(message.content)
      ) {
        return;
      }

      data.get(message.guild.id)
        .then(channel => {
          if (channel !== message.channel.id && !bot.config.admins.includes(message.author.id)) {
            return;
          }

          const tokens = message.content.split(/\s+/);
          switch (tokens[1]) {
            case 'help': {
              message.channel
                .sendCode('',
                  `${command}\n` +
                  'See http://tlmc.pf-n.co for all songs available\n' +
                  '  help     Print this message\n' +
                  '  start    Join voice channel and initialize player\n' +
                  '  skip     Skip the current song\n' +
                  '  info     Display info about the current song\n' +
                  '  destroy  Disconnect and cleanup\n' +
                  '  bind     Use the current channel for bot commands'
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
                  return connection;
                })
                .then(connection => `Joined \`${connection.channel.name}\`.`)
                .catch(err => `Error establishing connection. ${err.message}.`)
                .then(msg => message.channel.sendMessage(msg))
                .catch(messageError('send'));

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

              break;
            }

            case 'info': {
              const player = TLMCPlayers[message.guild.id];
              if (!player) {
                return message.channel
                  .sendMessage(`No TLMCPlayer object found for this guild. See \`${command} help\` for more information.`)
                  .catch(messageError('send'));
              }

              const {currentTrack} = player;
              if (!currentTrack) {
                return message.channel
                  .sendMessage('No track playing.')
                  .catch(messageError('send'));
              }

              message.channel
                .sendMessage(`\`\`\`${JSON.stringify(currentTrack.info, null, 2)}\`\`\``)
                .catch(messageError('send'));

              break;
            }

            case 'destroy': {
              const player = TLMCPlayers[message.guild.id];
              if (!player) {
                return message.channel
                  .sendMessage(`No TLMCPlayer object found for this guild. See \`${command} help\` for more information.`)
                  .catch(messageError('send'));
              }

              player.destroy();
              TLMCPlayers[message.guild.id] = null;

              message.channel
                .sendMessage('Disconnected.')
                .catch(messageError('send'));

              break;
            }

            case 'bind': {
              const guildId = message.guild.id;
              const channelId = message.channel.id;

              bindChannel(guildId, channelId)
                .then(channelId => `Bound channel \`${channelId}\``)
                .catch(err => `Error binding channel \`${channelId}\`. ${err.message}.`)
                .then(msg => message.channel.sendMessage(msg))
                .catch(messageError('send'));

              break;
            }

            default: {
              return message.channel
                .sendMessage(`Unknown command. See \`${command} help\` for more information.`)
                .catch(messageError('send'));
            }
          }
        });
    });
  }
};
