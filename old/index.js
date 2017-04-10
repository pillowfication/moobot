module.exports = {
  server: require('./server/server'),
  mooSteam: require('./steam/bot'),
  mooDiscord: require('./discord/bot')
};

if (require.main === module) {
  console.log('Please run each process separately instead!');

  const app = require('express')();
  app.use('/', module.exports.server);
  app.listen(process.argv[2] || 80, () => {
    console.log('Server started!');
  });

  module.exports.mooSteam.start();
  module.exports.mooDiscord.start();
}
