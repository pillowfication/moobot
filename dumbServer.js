const express = require('express');
const app = express();

const bots = require('.');
bots.mooSteam.start();
bots.mooDiscord.start();

const _ = require('lodash');
const request = require('request');
const discordClient = require('./discord/bot').client;

const config = require('./shared/config.json');
const database = require('./shared/database');

app.get('/moo', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/api/total', (req, res) => {
  database.getTotalMoos((err, moos) => {
    if (err)
      return res.send('ERROR');

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({total: moos.total}));
  });
});

app.get('/api/steamLeaderboards', (req, res) => {
  database.getTopCows('Steam', 100, (err, cows) => {
    if (err)
      return res.send('ERROR');

    request({
      url: 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/',
      qs: {
        key: config.steamApi,
        steamids: _.map(cows, 'userId').join(',')
      }
    }, (error, response, body) => {
      if (error)
        return res.send('ERROR');

      let data = JSON.parse(body);
      let playersById = _.keyBy(data.response.players, 'steamid');

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({cows: _.map(cows, (cow) => {
        let steamProfile = playersById[cow.userId];
        return {
          // userId: cow.userId,
          username: steamProfile.personaname,
          // steamUrl: steamProfile.profileurl,
          moos: cow.total
        };
      })}));
    });
  });
});

app.get('/api/discordLeaderboards', (req, res) => {
  database.getTopCows('Discord', 100, (err, cows) => {
    if (err)
      return res.send('ERROR');

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({cows: _.map(cows, (cow) => {
      return {
        userId: cow.userId,
        moos: cow.total
      };
    })}));
  });
});

app.listen(process.argv[2] || 80, () => {});
