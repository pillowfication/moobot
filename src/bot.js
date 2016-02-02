'use strict';

var _ = require('lodash');
var Steam = require('steam');
var SteamClient = require('./steam-client');
var config = require('./config');
var username = process.argv[2] || config.username;
var password = process.argv[3] || config.password;
var logger = require('./logger');

var steamClient = SteamClient.steamClient;
var steamUser = SteamClient.steamUser;
var steamFriends = SteamClient.steamFriends;
var sendMessage = SteamClient.sendMessage;

var chatRules = require('./rules/chatRules');

module.exports.start = function() {
  logger.info('Logging on...');
  steamClient.connect();
  steamClient.on('connected', function() {
    steamUser.logOn({
      account_name: username,
      password: password
    });
  });

  steamClient.on('logOnResponse', function(logonRes) {
    if (logonRes.eresult === Steam.EResult.OK) {
      steamFriends.setPersonaState(Steam.EPersonaState.Online);
      logger.success('Logged on ' + username);
    }
  });

  steamFriends.on('chatInvite', function(chatRoomID, chatRoomName, patronID) {
    logger.warn('Invited to ' + chatRoomName + ' by ' + steamFriends.personaStates[patronID].player_name);
    steamFriends.joinChat(chatRoomID);
  });

  steamFriends.on('message', function(source, message, type, chatter) {
    if (type === Steam.EChatEntryType.ChatMsg) {
      var sender = chatter || source;
      var chatType = chatter ? 'group' : 'friend';
      var playerName = _.get(steamFriends, 'personaStates['+sender+'].player_name', '<'+sender+'>');

      if (chatType === 'group')
        logger.chats(source).info('(%s) %s: %s', source, playerName, message, {
          direction: 'received',
          chatType: chatType,
          from: sender,
          from_group: source
        });
      else
        logger.chats(source).info('%s: %s', playerName, message, {
          direction: 'received',
          chatType: chatType,
          from: sender
        });

      // Loop the rules
      chatRules.forEach(function(rule) {
        if (chatRules.verify(rule, sender, message, chatType)) {
          rule.handler(function(message) {
            sendMessage(source, message, chatType, playerName);
          }, sender, message, chatType);
        }
      });
    }
  });
};
