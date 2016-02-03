'use strict';

var _ = require('lodash');

var variables = require('./variables');
var adminRules = require('./adminRules');

// Levels
// <none>   - Applies anywhere and for all players
// 'group'  - Inside a group chat
// 'friend' - Inside a private chat
// 'admin'  - Only for users specified in './adminsRules.js'
// 'pillow' - Only for Pillowfication

module.exports = adminRules.concat([
  require('./_moo'),
  require('./_ping'),
  require('./_help'),
  require('./_cleverbot'),
  require('./_note'),
  require('./_remi'),
  require('./_pillow')
]);

module.exports.verify = function(rule, sender, message, chatType) {
  if (variables.get('isSleeping') && rule.level !== 'admin' && rule.level !== 'pillow')
    return false;

  // First check permissions
  if (rule.level) {
    if (rule.level === 'group' && chatType !== rule.level)
      return false;
    if (rule.level === 'friend' && chatType !== rule.level)
      return false;
    if (rule.level === 'admin' && !adminRules.isAdmin(sender))
      return false;
    if (rule.level === 'pillow' && sender !== adminRules.Pillowfication)
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
