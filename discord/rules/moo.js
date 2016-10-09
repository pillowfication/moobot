const baseMoo = require('../../shared/moo');

// TODO: Unicode support for 🐮 and 🐄?
const test = RegExp.prototype.test.bind(/\b(moo+(s|ers?|ed|'d|ings?)?|cow(s|like)?)\b/i);

module.exports = function moo(message) {
  if (message.author.bot || !test(message.content))
    return;

  let response = baseMoo('Discord', message.author.id);
  if (response)
    message.channel.sendMessage(response);
};
