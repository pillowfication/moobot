'use strict';

var Steam = require('steam');
var config = require('./config');
var username = process.argv[2] || config.username;
var password = process.argv[3] || config.password;
var logger = require('./logger');

var steamClient = new Steam.SteamClient();
var steamUser = new Steam.SteamUser(steamClient);
var steamFriends = new Steam.SteamFriends(steamClient);

var chatRules = require('./rules/chatRules');

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
    var chatType = chatter ? 'group' : 'friend';
    var playerName = steamFriends.personaStates[sender].player_name;

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
          steamFriends.sendMessage(source, message, Steam.EChatEntryType.ChatMsg);
          if (chatType === 'group')
            logger.chats(source).info('(%s) moo: %s', source, message, {
              direction: 'sent',
              chatType: chatType,
              to: source
            });
          else
            logger.chats(source).info('To %s: %s', playerName, message, {
              direction: 'received',
              chatType: chatType,
              to: source
            });
        }, sender, message, chatType);
      }
    });
  }
});
