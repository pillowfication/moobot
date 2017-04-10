const _ = require('lodash');
const express = require('express');
const database = require('../shared/database');

const router = express.Router();

router.get('/', (request, response) => {
  response.sendFile(__dirname + '/index.html');
});

router.get('/api/total', (request, response) => {
  database.getTotalMoos((err, moos) => {
    if (err)
      return response.status(500).send('ERROR');

    response.header('Content-Type', 'application/json');
    response.send(JSON.stringify(moos));
  });
});

router.get('/api/steamLeaderboards', (request, response) => {
  let count = _.clamp(request.query.count, 0, 100);
  if (isNaN(count))
    count = 100;

  database.getTopCows('Steam', count, (err, result) => {
    if (err)
      return response.status(500).send('ERROR');

    response.header('Content-Type', 'application/json');
    response.send(JSON.stringify(result));
  });
});

router.get('/api/discordLeaderboards', (request, response) => {
  let count = _.clamp(request.query.count, 0, 100);
  if (isNaN(count))
    count = 100;

  database.getTopCows('Discord', count, (error, result) => {
    if (error)
      return response.status(500).send('ERROR');

    response.header('Content-Type', 'application/json');
    response.send(JSON.stringify(result));
  });
});

module.exports = router;

if (require.main === module) {
  const app = express();
  app.use('/', router);
  app.listen(process.argv[2] || 80, () => {
    console.log('Server started!');
  });
}
