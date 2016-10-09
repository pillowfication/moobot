const Steam = require('steam');
const baseMoo = require('../../shared/moo');

const test = RegExp.prototype.test.bind(/\b(moo+(s|ers?|ed|'d|ings?)?|cow(s|like)?)\b/i);

module.exports = function moo(steamEnv, source, message, type, chatter) {
  if (!test(message))
    return;

  let response = baseMoo('Steam', chatter || source);
  if (response)
    steamEnv.friends.sendMessage(source, response, Steam.EChatEntryType.ChatMsg);
};
