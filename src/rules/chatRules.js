'use strict';

var _ = require('lodash');
var logger = require('../logger');
var admins = require('./admins');
var parser = require('./parser');

var steamFriends = require('../steam-client').steamFriends;

// Levels
// <none>   - Applies anywhere and for all players
// 'group'  - Inside a group chat
// 'friend' - Inside a private chat
// 'admin'  - Only for users specified in './admins.js'

module.exports = [
  {
    test: 'moo',
    handler: function(respond, sender) {
      respond(sender === '76561198003461754' && Math.random() < 0.5 ? '/bullies Moritsune' : 'moo');
    }
  }, {
    level: 'friend',
    test: /^[!/\\]?ping$/,
    handler: function(respond) {
      respond('pong');
    }
  }, {
    test: /^[!/\\]note($|\s)/,
    handler: require('./notes')
  }, {
    level: 'admin',
    test: /^[!/\\]name($|\s)/,
    handler: function(respond, sender, message) {
      var args = parser(message);
      if (!args[1]) {
        respond('Invalid use of !note');
        return;
      }

      var name = args[1];

      steamFriends.setPersonaName(name);
      logger.warn('Name changed to: ' + name);
    }
  }, {
    level: 'admin',
    test: /^[!/\\]die$/i,
    handler: function() {
      logger.warn('Logging off...');
      process.exit();
    }
  }
];

module.exports.verify = function(rule, sender, message, chatType) {
  // First check permissions
  if (rule.level) {
    if (rule.level === 'group' && chatType !== rule.level)
      return false;
    if (rule.level === 'friend' && chatType !== rule.level)
      return false;
    if (rule.level === 'admin' && admins.indexOf(sender) === -1)
      return false;
  }

  // Then check the test parameter
  if (_.isString(rule.test))
    return message === rule.test;
  if (_.isRegExp(rule.test))
    return rule.test.test(message);
  if (_.isFunction(rule.test))
    return rule.test(sender, message, chatType);

  return false;
};
