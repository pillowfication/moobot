const _ = require('lodash');
const request = require('request');
const messageError = require('../../messageError');
const winston = require('winston');

const TLMC_URL = 'http://tlmc.pf-n.co';
const COUNT = 49207; // TODO: AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH

function playError(err) {
  winston.error('An error occurred trying to stream audio.', err);
}

module.exports = {
  defaults: {
    command: 'tlmc'
  },

  init(bot, options) {
    options = _.defaults(options, module.exports.defaults);
    const command = `${bot.config.prefix}${options.command}`;

    const player = {
      currentSong: {
        id: 0,
        url: null,
        info: null
      },
      queue: [],
      setCurrentSong: function setCurrentSong(id) {
        return new Promise((resolve, reject) => {
          const index = id ? parseInt(id, 10) - 1 : COUNT * Math.random()|0;
          id = index + 1;

          request.get(`${TLMC_URL}/tlmc/info/${id}`, (err, res, body) => {
            if (err || res.statusCode !== 200 || !body) {
              return reject(err || new Error(res.statusMessage));
            }
            const song = JSON.parse(body);

            player.currentSong.id = id;
            player.currentSong.url = `${TLMC_URL}/tlmc/id/${id}`;
            player.currentSong.info = song;

            resolve(player.currentSong);
          });
        });
      }
    };

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
              `See ${TLMC_URL} for all songs available\n` +
              '  help            Print this message\n' +
              '  play <id>       Play a song\n' +
              '  info            Information about the current song\n' +
              '  search <query>  TODO\n' +
              '  queue <id>      TODO\n' +
              '  skip            TODO'
            )
            .catch(messageError('send'));
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
              player.setCurrentSong(id)
                .then(currentSong => {
                  connection.playArbitraryInput(currentSong.url);
                  return `Playing #${id} - ${currentSong.info.title}`;
                })
                .catch(err => {
                  playError(err);
                  return `Error playing \`${id}\`. ${err.message}.`;
                })
                .then(msg => message.channel.sendMessage(msg))
                .catch(messageError('send'));
            });

          break;
        }

        case 'info': {
          message.channel
            .sendCode('', JSON.stringify(player.currentSong, null, 2))
            .catch(messageError('send'));

          break;
        }
      }
    });
  }
};
