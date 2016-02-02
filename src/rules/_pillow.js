'use strict';

var _ = require('lodash');
var parser = require('./parser');
var SteamClient = require('../steam-client');
var steamFriends = SteamClient.steamFriends;
var sendMessage = SteamClient.sendMessage;
var Pillowfication = require('./adminRules').Pillowfication;

module.exports = {
  test: /^[!/\\]pillow($|\s)/,
  handler: function(respond, sender, _message) {
    var args = parser(_message);
    var message = args[1];
    if (_.isUndefined(message)) {
      respond('Invalid use of !pillow');
      return;
    }

    var senderName = _.get(steamFriends, 'personaStates['+sender+'].player_name', '<'+sender+'>');
    var recipientName = _.get(steamFriends, 'personaStates['+Pillowfication+'].player_name', '<Pillowfication>');

    sendMessage(Pillowfication, 'From '+senderName+': '+message, 'friend', '<Pillowfication>');
    respond('To '+recipientName+': '+message);
  }
};
