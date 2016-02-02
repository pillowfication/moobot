'use strict';

var _ = require('lodash');
var Steam = require('steam');
var logger = require('../logger');
var parser = require('./parser');

var variables = require('./variables');
var steamFriends = require('../steam-client').steamFriends;

var Pillowfication = '76561198037007595';
var admins = [
  Pillowfication
];

function isAdmin(steamID) {
  return admins.indexOf(steamID) !== -1;
}

module.exports = [
  {
    // Change the name of bot
    level: 'admin',
    test: /^[!/\\]name($|\s)/,
    handler: function(respond, sender, message) {
      var args = parser(message);
      if (!args[1]) {
        respond('Invalid use of !name');
        return;
      }

      var name = args[1];
      steamFriends.setPersonaName(name);
      logger.warn('Name changed to: ' + name);
    }
  }, {
    // Send a message to player
    level: 'admin',
    test: /^[!/\\]send($|\s)/,
    handler: function(respond, sender, _message) {
      var args = parser(_message);
      if (!args[1] || !args[2]) {
        respond('Invalid use of !send');
        return;
      }

      var recipient = args[1], message = args[2];
      var recipientName = _.get(steamFriends, 'personaStates['+recipient+'].player_name', '<'+recipient+'>');
      steamFriends.sendMessage(recipient, message, Steam.EChatEntryType.ChatMsg);
      respond('To '+recipientName+': '+message);
      logger.chats(recipient).info('To %s: %s', recipientName, message, {
        direction: 'sent',
        chatType: 'friend',
        to: recipient
      });
    }
  }, {
    // Send a message to group
    level: 'admin',
    test: /^[!/\\]send-group($|\s)/,
    handler: function(respond, sender, _message) {
      var args = parser(_message);
      if (!args[1] || !args[2]) {
        respond('Invalid use of !sendGroup');
        return;
      }

      var recipient = args[1], message = args[2];
      steamFriends.sendMessage(recipient, message, Steam.EChatEntryType.ChatMsg);
      respond('To '+recipient+': '+message);
      logger.chats(recipient).info('(%s) moo: %s', recipient, message, {
        direction: 'sent',
        chatType: 'group',
        to: recipient
      });
    }
  }, {
    // Temporarily pause the bot
    level: 'admin',
    test: /^[!/\\]sleep$/i,
    handler: function() {
      logger.warn('Going to sleep...');
      variables.set('isSleeping', true);
    }
  }, {
    // Unpause the bot
    level: 'admin',
    test: /^[!/\\]wake-up$/i,
    handler: function() {
      logger.warn('Waking up...');
      variables.set('isSleeping', false);
    }
  }, {
    // Kill the bot
    level: 'pillow',
    test: /^[!/\\]die$/i,
    handler: function() {
      logger.warn('Logging off...');
      process.exit();
    }
  }
];

module.exports.admins = admins;
module.exports.Pillowfication = Pillowfication;
module.exports.isAdmin = isAdmin;
