'use strict';

var _ = require('lodash');
var Steam = require('steam');
var config = require('./config');
var username = process.argv[2] || config.username;
var password = process.argv[3] || config.password;
var logger = require('./logger');

var steamClient = new Steam.SteamClient();
var steamUser = new Steam.SteamUser(steamClient);
var steamFriends = new Steam.SteamFriends(steamClient);

var chatRules = require('./chatRules');

steamClient.connect();
steamClient.on('connected', function() {
  steamUser.logOn({
    account_name: username,
    password: password
  });
});

steamClient.on('logOnResponse', function(logonRes) {
  if (logonRes.eresult === Steam.EResult.OK) {
    logger.log('info', 'Successfully logged on ' + username);
    steamFriends.setPersonaState(Steam.EPersonaState.Online);
  }
});

steamFriends.on('chatInvite', function(chatRoomID, chatRoomName, patronID) {
  logger.log('info', 'Invited to ' + chatRoomName + ' from ' + steamFriends.personaStates[patronID].player_name);
  steamFriends.joinChat(chatRoomID);
});

steamFriends.on('message', function(source, message, type, chatter) {
  if (type === Steam.EChatEntryType.ChatMsg) {
    var sender = _.get(steamFriends.personaStates, (chatter || source)+'.player_name', '('+source+')');
    logger.chats(source).log('info', '%s: %s', sender, message);
    chatRules.forEach(function(rule) {
      if (!rule.level || rule.level === 'friend' && !chatter || rule.level === 'group' && chatter)
        if (rule.test.test(message)) {
          var response = _.isFunction(rule.handler) ? rule.handler() : rule.handler;
          steamFriends.sendMessage(source, response, Steam.EChatEntryType.ChatMsg);
          logger.chats(source).log('info', 'moo: %s', response);
        }
    });
  }
});

// console.log(Steam.EChatEntryType);
