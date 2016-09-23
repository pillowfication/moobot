const Steam = require('steam');
const dumbCounter = require('../../shared/dumbCounter');

const test = RegExp.prototype.test.bind(/\b(moo+(s|ed|ing)?|cow(s|like)?|kine|bovin(e|ely|ity))\b/i);
const prob = .2;
const MOOprob = .01;

module.exports = function moo(steamEnv, source, message, type, chatter) {
  if (!test(message))
    return;

  dumbCounter.moo();

  if (Math.random() < prob) {
    steamEnv.friends.sendMessage(source, Math.random() < MOOprob ? 'MOO' : 'moo', Steam.EChatEntryType.ChatMsg);
    dumbCounter.moo();
  }
};
