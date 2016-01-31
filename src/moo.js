'use strict';

var Steam = require('steam');
var config = require('./config');
var username = process.argv[2] || config.username;
var password = process.argv[3] || config.password;
var logger = require('./logger');

var steamClient = new Steam.SteamClient();
var steamUser = new Steam.SteamUser(steamClient);
var steamFriends = new Steam.SteamFriends(steamClient);

var chatRules = require('./rules');

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
    logger.success('Logged on ' + username);
    steamFriends.setPersonaState(Steam.EPersonaState.Online);
  }
});

steamFriends.on('chatInvite', function(chatRoomID, chatRoomName, patronID) {
  logger.info('Invited to ' + chatRoomName + ' by ' + steamFriends.personaStates[patronID].player_name);
  steamFriends.joinChat(chatRoomID);
});

steamFriends.on('message', function(source, message, type, chatter) {
  if (type === Steam.EChatEntryType.ChatMsg) {
    var sender = chatter || source;
    logger.chats(source).info('%s: %s', steamFriends.personaStates[sender].player_name, message);

    // Loop the rules
    chatRules.forEach(function(rule) {
      if (chatRules.verify(rule, sender, message, chatter ? 'group' : 'friend')) {
        rule.handler(function(message) {
          steamFriends.sendMessage(source, message, Steam.EChatEntryType.ChatMsg);
          logger.chats(source).info('moo: %s', message);
        }, sender, message);
      }
    });
  }
});
