'use strict';

var Steam = require('steam');
var config = require('./config');
var username = process.argv[2] || config.username;
var password = process.argv[3] || config.password;

var steamClient = new Steam.SteamClient();
var steamUser = new Steam.SteamUser(steamClient);
var steamFriends = new Steam.SteamFriends(steamClient);

steamClient.connect();
steamClient.on('connected', function() {
  steamUser.logOn({
    account_name: username,
    password: password
  });
});

steamClient.on('logOnResponse', function(logonRes) {
  if (logonRes.eresult === Steam.EResult.OK) {
    console.log('Successfully logged on ' + username);
    steamFriends.setPersonaState(Steam.EPersonaState.Online);
  }
});

steamFriends.on('chatInvite', function(chatRoomID, chatRoomName, patronID) {
  console.log('Invited to ' + chatRoomName + ' from ' + steamFriends.personaStates[patronID].player_name);
  steamFriends.joinChat(chatRoomID);
});

steamFriends.on('message', function(source, message, type, chatter) {
  console.log('Received message: ' + message);
  if (message === 'moo') {
    steamFriends.sendMessage(source, 'moo', Steam.EChatEntryType.ChatMsg);
  }
});
