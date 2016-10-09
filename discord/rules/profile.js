const database = require('../../shared/database');

const test = RegExp.prototype.test.bind(/^[!/\\](moo-)?profile($|\s)/);

module.exports = function slots(message) {
  if (message.author.bot || !test(message.content))
    return;

  database.getById('Discord', message.author.id, (error, result) => {
    if (error) {
      message.reply('ERROR: Could not load profile.');
      return;
    }

    message.channel.sendMessage(`**${message.author.username}**'s profile:\n` +
      `Points: ${result.currency}\n` +
      `Moos: ${result.totalMoos}\n` +
      `Moos Triggered: ${result.totalMoosTriggered}\n` +
      `MOOs Triggered: ${result.totalBigMoosTriggered}`);
  });

};
