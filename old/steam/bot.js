const Steam = require('steam');
const steamClient = new Steam.SteamClient();
const steamUser = new Steam.SteamUser(steamClient);
const steamFriends = new Steam.SteamFriends(steamClient);
const config = require('../shared/config.json');

const steamEnv = {
  client: steamClient,
  user: steamUser,
  friends: steamFriends
};
const rules = [
  require('./rules/moo')
  // require('./rules/remi')
];

steamClient.on('connected', () => {
  steamUser.logOn({
    account_name: config.steamUsername,
    password: config.steamPassword
  });
});

steamClient.on('logOnResponse', function(logonRes) {
  if (logonRes.eresult === Steam.EResult.OK) {
    console.log('moo (Steam) is online!');
    steamFriends.setPersonaState(Steam.EPersonaState.Online);
  }
});

steamFriends.on('chatInvite', (chatRoomID, chatRoomName, patronID) => {
  steamFriends.joinChat(chatRoomID);
});

steamFriends.on('message', (source, message, type, chatter) => {
  if (type === Steam.EChatEntryType.ChatMsg)
    for (let rule of rules)
      rule(steamEnv, source, message, type, chatter);
});

module.exports = {
  start: () => {
    steamClient.connect();
  }
};

if (require.main === module) {
  module.exports.start();
}
