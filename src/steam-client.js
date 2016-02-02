'use strict';

var _ = require('lodash');
var logger = require('./logger');
var Steam = require('steam');
var steamClient = new Steam.SteamClient();
var steamUser = new Steam.SteamUser(steamClient);
var steamFriends = new Steam.SteamFriends(steamClient);

function sendMessage(recipient, message, chatType, recipientName) {
  recipientName = _.get(steamFriends, 'personaStates['+recipient+'].player_name', recipientName || '<'+recipient+'>');
  steamFriends.sendMessage(recipient, message, Steam.EChatEntryType.ChatMsg);
  if (chatType === 'group')
    logger.chats(recipient).info('(%s) moo: %s', recipient, message, {
      direction: 'sent',
      chatType: chatType,
      to: recipient
    });
  else
    logger.chats(recipient).info('To %s: %s', recipientName, message, {
      direction: 'sent',
      chatType: chatType,
      to: recipient
    });
}

module.exports.steamClient = steamClient;
module.exports.steamUser = steamUser;
module.exports.steamFriends = steamFriends;
module.exports.sendMessage = sendMessage;
