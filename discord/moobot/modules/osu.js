const EventEmitter = require('events');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment-timezone');
const winston = require('winston');
const persist = require('../../../utils/persist');

const OSU_USER_URL = 'https://osu.ppy.sh/u/';

function sendMessageError(err) {
  winston.error('Could not send message.', err);
}

function getLastActive(id) {
  return new Promise((resolve, reject) => {
    request.get(`${OSU_USER_URL}${id}`, (err, res, body) => {
      if (err || !body) {
        return reject(err || new Error('No response found'));
      }

      const now = Date.now();
      const $ = cheerio.load(body);

      // <h2>
      //   The user you are looking for was not found!
      // </h2>
      const notFound = /the user you are looking for was not found/i.test($('h2').text());
      if (notFound) {
        return reject(new Error(`User \`${id}\` does not exist`));
      }


      // <div class="profile-username">
      //   Pillowfication
      // </div>
      const username = $('.profile-username').text().trim();

      // <div title='Last Active'>
      //   <i class='icon-signout'></i>
      //   <div>
      //     <time class='timeago' datetime='2017-03-18T16:04:32Z'>2017-03-18 16:04:32 UTC</time>
      //   </div>                            ^^^^^^^^^^^^^^^^^^^^
      // </div>
      const date = $('div[title="Last Active"] time').attr('datetime');

      if (!username || !date) {
        return reject(new Error('Error parsing response'));
      }

      resolve({
        username,
        date: moment(date).valueOf(),
        timestamp: now
      });
    });
  });
}

module.exports = {
  defaults: {
    command: 'osu',
    dataPath: path.join(__dirname, 'osu-data.json'),
    timezone: 'America/Los_Angeles',
    delay: 60 * 1000
  },

  init(bot, options) {
    options = Object.assign({}, module.exports.defaults, options);
    const command = `${bot.config.prefix}${options.command}`;
    const data = persist(options.dataPath);

    function format(date, fromNow) {
      return fromNow
        ? moment.tz(date, options.timezone).format('MM/DD HH:mm') + ' - ' + moment(date).fromNow()
        : moment.tz(date, options.timezone).format('MM/DD HH:mm');
    }

    function addUser(id) {
      return data.get(['users', id])
        .then(info => info === undefined
          ? id
          : Promise.reject(new Error(`User \`${id}\` already exists`))
        )
        .then(id => getLastActive(id))
        .then(info => data.set(['users', id], info));
    }

    function deleteUser(id) {
      return data.get(['users', id])
        .then(info => info === undefined
          ? Promise.reject(new Error(`User \`${id}\` does not exist`))
          : id
        )
        .then(id => data.set(['users', id], undefined))
        .then(() => id);
    }

    function listUsers() {
      return data.get('users', {})
        .then(users => Object.keys(users));
    }

    function getUser(id) {
      return data.get(['users', id])
        .then(info => info === undefined
          ? Promise.reject(new Error(`User \`${id}\` is not being tracked`))
          : info
        );
    }

    function addChannel(id) {
      return bot.channels.get(id)
        ? data.get(['channels', id])
          .then(bound => bound === undefined
            ? id
            : Promise.reject(new Error(`Channel \`${id}\` already bound`))
          )
          .then(id => data.set(['channels', id], true))
          .then(() => id)
        : Promise.reject(new Error(`Channel \`${id}\` was not found`));
    }

    function deleteChannel(id) {
      return data.get(['channels', id])
        .then(bound => bound === undefined
          ? Promise.reject(new Error(`Channel \`${id}\` is not bound`))
          : id
        )
        .then(id => data.set(['channels', id], undefined))
        .then(() => id);
    }

    function listChannels() {
      return data.get('channels', {})
        .then(channels => Object.keys(channels));
    }

    function updateAllUsers() {
      return data.get('users', {})
        .then(users =>
          Promise.all(Object.keys(users).map(id =>
            getLastActive(id)
              .catch(err => ({id, err}))
              .then(info => ({id, info}))
          ))
          .then(results => {
            const newUsers = {};
            results.forEach(({id, info, err}) => {
              newUsers[id] = err ? {err} : info;
            });
            return {oldUsers: users, newUsers};
          })
        )
        .then(({oldUsers, newUsers}) => {
          const changes = [];
          const errors = [];
          for (const id in oldUsers) {
            const [oldUser, newUser] = [oldUsers[id], newUsers[id]];
            if (newUser.err) {
              errors.push(newUser.err);
            }
            else {
              if (newUser.date > oldUser.date) {
                changes.push({id, date: newUser.date});
              }
              oldUsers[id] = newUser;
            }
          }
          return data.set('users', oldUsers)
            .then(() => ({changes, errors}));
        });
    }

    const osuEmitter = new EventEmitter();
    osuEmitter.timer = null;
    osuEmitter.status = 'STOP';

    osuEmitter.startInterval = function startInterval(delay) {
      if (osuEmitter.status !== 'STOP') {
        return;
      }

      osuEmitter.status = 'START';
      (function _startInterval() {
        osuEmitter.timer = setTimeout(() => {
          osuEmitter.status = 'LOAD';
          updateAllUsers()
            .then(({changes, errors}) => {
              if (osuEmitter.status === 'LOAD') {
                osuEmitter.status = 'START';
                osuEmitter.emit('change', changes, errors);
                _startInterval();
              }
            });
        }, delay);
      })();
    };

    osuEmitter.stopInterval = function stopInterval() {
      if (osuEmitter.status === 'STOP') {
        return;
      }

      clearTimeout(osuEmitter.timer);
      osuEmitter.timer = null;
      osuEmitter.status = 'STOP';
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
              '  help            Print this message\n' +
              '  add <id>        Add a user for tracking\n' +
              '  delete <id>     Remove a user from tracking\n' +
              '  list            List all tracked users\n' +
              '  get <id>        Get a user\'s last tracked data\n' +
              '  bind [<id>]     Bind the current channel to receive updates\n' +
              '  unbind [<id>]   Unbind the current channel\n' +
              '  channels        List all bound channels\n' +
              '  start [<time>]  Start polling data with the specified interval\n' +
              '  stop            Stop polling data\n' +
              '  update          Immediately invoke polling'
            )
            .catch(sendMessageError);
          break;
        }

        case 'add': {
          const id = tokens[2];

          if (!id) {
            return message.channel
              .sendMessage(`No \`id\` specified. See \`${command} help\` for more information.`)
              .catch(sendMessageError);
          }

          addUser(id)
            .then(info => `Added \`${info.username}\` (${format(info.date, true)}).`)
            .catch(err => `Error adding user \`${id}\`. ${err.message}.`)
            .then(msg => message.channel.sendMessage(msg))
            .catch(sendMessageError);

          break;
        }

        case 'delete': {
          const id = tokens[2];

          if (!id) {
            return message.channel
              .sendMessage(`No \`id\` specified. See \`${command} help\` for more information.`)
              .catch(sendMessageError);
          }

          deleteUser(id)
            .then(id => `Deleted \`${id}\`.`)
            .catch(err => `Error deleting user \`${id}\`. ${err.message}.`)
            .then(msg => message.channel.sendMessage(msg))
            .catch(sendMessageError);

          break;
        }

        case 'list': {
          listUsers()
            .then(users => users.length
              ? 'Users: ' + users.map(user => `\`${user}\``).join(', ')
              : 'Users: (none)'
            )
            .catch(err => `Error listing users. ${err.message}.`)
            .then(msg => message.channel.sendMessage(msg))
            .catch(sendMessageError);

          break;
        }

        case 'get': {
          const id = tokens[2];

          if (!id) {
            return message.channel
              .sendMessage(`No \`id\` specified. See \`${command} help\` for more information.`)
              .catch(sendMessageError);
          }

          getUser(id)
            .then(info => `User \`${id}\` (${format(info.date, true)}) (Last checked ${moment(info.timestamp).fromNow()}).`)
            .catch(err => `Error getting user \`${id}\`. ${err.message}.`)
            .then(msg => message.channel.sendMessage(msg))
            .catch(sendMessageError);

          break;
        }

        case 'bind': {
          const id = tokens[2] || message.channel.id;

          addChannel(id)
            .then(id => `Bound channel \`${id}\``)
            .catch(err => `Error binding channel \`${id}\`. ${err.message}.`)
            .then(msg => message.channel.sendMessage(msg))
            .catch(sendMessageError);

          break;
        }

        case 'unbind': {
          const id = tokens[2] || message.channel.id;

          deleteChannel(id)
            .then(id => `Unbound channel \`${id}\``)
            .catch(err => `Error unbinding channel \`${id}\`. ${err.message}.`)
            .then(msg => message.channel.sendMessage(msg))
            .catch(sendMessageError);

          break;
        }

        case 'channels': {
          listChannels()
            .then(channels => channels.length
              ? 'Channels: ' + channels.map(channel => `\`${channel}\``).join(', ')
              : 'Channels: (none)'
            )
            .catch(err => `Error listing channels. ${err.message}.`)
            .then(msg => message.channel.sendMessage(msg))
            .catch(sendMessageError);

          break;
        }

        case 'start': {
          const delay = +tokens[2] || options.delay;

          if (osuEmitter.status !== 'STOP') {
            return message.channel
              .sendMessage('Error starting interval. Interval already started.')
              .catch(sendMessageError);
          }

          osuEmitter.startInterval(delay);
          message.channel
            .sendMessage(`Interval started with delay \`${delay}ms\`.`)
            .catch(sendMessageError);

          break;
        }

        case 'stop': {
          if (osuEmitter.status === 'STOP') {
            return message.channel
              .sendMessage('Error stopping interval. Interval already stopped.')
              .catch(sendMessageError);
          }

          osuEmitter.stopInterval();
          message.channel
            .sendMessage('Interval stopped.')
            .catch(sendMessageError);

          break;
        }

        // TODO
        case 'update': {
          updateAllUsers()
            .then(({changes}) => changes.length
              ? 'Changes: ' + changes.map(change => `\`${change.id}\` (${format(change.date, true)})`).join(', ')
              : 'Changes: (none)'
            )
            .catch(err => `Error updating users. ${err.message}.`)
            .then(msg => message.channel.sendMessage(msg))
            .catch(sendMessageError);

          break;
        }
      }
    });

    osuEmitter.on('change', (changes, errors) => {
      for (const err of errors) {
        winston.error('Could not fetch.', err);
      }

      if (changes.length) {
        listChannels()
          .then(channels => channels.forEach(id => {
            const channel = bot.channels.get(id);
            if (!channel) {
              return winston.error(`Channel \`${id}\` not found.`);
            }
            for (const change of changes) {
              channel
                .sendMessage(`User \`${change.id}\` has come online (${format(change.date)}).`)
                .catch(sendMessageError);
            }
          }));
      }
    });

    osuEmitter.startInterval(options.delay);
  }
};
