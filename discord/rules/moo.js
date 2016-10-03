const database = require('../../shared/database');

// TODO: Unicode support for 🐮 and 🐄?
const test = RegExp.prototype.test.bind(/\b(moo+(s|ed|ing)?|cow(s|like)?|kine|bovin(e|ely|ity))\b/i);
const prob = .2;
const MOOprob = .01;

module.exports = function moo(message) {
  if (message.author.bot || !test(message.content))
    return;

  if (Math.random() < prob)
    if (Math.random() < MOOprob) {
      message.channel.sendMessage('MOO');
      database.incrementById('Discord', message.author.id, 500, (err) => { /* what errors */ });
    } else {
      message.channel.sendMessage('moo');
      database.incrementById('Discord', message.author.id, 2, (err) => { /* what errors */ });
    }

  else
    database.incrementById('Discord', message.author.id, 1, (err) => { /* what errors */ });
};
