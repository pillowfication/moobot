module.exports = {
  mooSteam: require('./steam/bot'),
  mooDiscord: require('./discord/bot')
};

if (require.main === module) {
  module.exports.mooSteam.start();
  module.exports.mooDiscord.start();
}
