'use strict';

var _ = require('lodash');
var logger = require('../logger');
var admins = require('./admins');

// Levels
// <none>   - Applies anywhere and for all players
// 'group'  - Inside a group chat
// 'friend' - Inside a private chat
// 'admin'  - Only for users specified in './admins.js'

var rules = [
  {
    test: 'moo',
    handler: function(respond) {
      respond('moo');
    }
  }, {
    level: 'friend',
    test: /^[!/\\]ping$/,
    handler: function(respond) {
      respond('pong');
    }
  }, {
    test: /^[!/\\]note/,
    handler: require('./notes')
  }, {
    level: 'admin',
    test: /^[!/\\]die$/,
    handler: function() {
      logger.warn('Logging off...');
      process.exit();
    }
  }
];

function verify(rule, sender, message, chatType) {
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
    return rule.test(message);

  return false;
}

module.exports = rules;
module.exports.verify = verify;
