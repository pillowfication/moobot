const cleverbot = require('../../shared/cleverbot');

var ME = '223864853465399296'

const mentionString = `<@${ME}>`;

module.exports = function talk(message) {
  if (message.author.bot || message.content.indexOf(mentionString) !== 0)
    return;

  let content = message.content.substring(mentionString.length).trim();
  cleverbot(content, (err, response) => {
    if (err)
      console.log('OOPS');

    message.channel.sendMessage(`:cow2: - ${response}`);
  });
};
