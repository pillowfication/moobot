const express = require('express');
const app = express();

const bots = require('.');
bots.mooSteam.start();
bots.mooDiscord.start();

const dumbCounter = require('./shared/dumbCounter')

app.get('/moo', (req, res) => {
  res.send(`<h1 style="text-align:center">There have been ${dumbCounter.count()} moos</h1>`);
});

app.listen(80, () => {});
