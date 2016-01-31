'use strict';

var Steam = require('Steam');
var steamClient = new Steam.SteamClient();

module.exports.steamClient = steamClient;
module.exports.steamUser = new Steam.SteamUser(steamClient);
module.exports.steamFriends = new Steam.SteamFriends(steamClient);
