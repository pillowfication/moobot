const dumbCounter = require('../../shared/dumbCounter');

// TODO: Unicode support for 🐮 and 🐄?
const test = RegExp.prototype.test.bind(/\b(moo+(s|ed|ing)?|cow(s|like)?|kine|bovin(e|ely|ity))\b/i);
const prob = .2;
const MOOprob = .01;

module.exports = function moo(message) {
  if (message.author.bot || !test(message.content))
    return;

  dumbCounter.moo();

  if (Math.random() < prob) {
    message.channel.sendMessage(Math.random() < MOOprob ? 'MOO' : 'moo');
    dumbCounter.moo();
  }
};
