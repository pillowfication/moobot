const Steam = require('steam');
const database = require('../../shared/database');

const test = RegExp.prototype.test.bind(/\b(moo+(s|ed|ing)?|cow(s|like)?|kine|bovin(e|ely|ity))\b/i);
const prob = .2;
const MOOprob = .01;

module.exports = function moo(steamEnv, source, message, type, chatter) {
  if (!test(message))
    return;

  if (Math.random() < prob)
    if (Math.random() < MOOprob) {
      steamEnv.friends.sendMessage(source, 'MOO', Steam.EChatEntryType.ChatMsg);
      database.incrementById('Steam', chatter, 500, (err) => { /* what errors */ });
    } else {
      steamEnv.friends.sendMessage(source, 'moo', Steam.EChatEntryType.ChatMsg);
      database.incrementById('Steam', chatter, 2, (err) => { /* what errors */ });
    }

  else
    database.incrementById('Steam', chatter, 1, (err) => { /* what errors */ });
};
