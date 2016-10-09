const _ = require('lodash');
const database = require('../../shared/database');

const slotTest = RegExp.prototype.test.bind(/^[!/\\](moo-)?slots($|\s)/);
const jackpotTest = RegExp.prototype.test.bind(/^[!/\\](moo-)?slots-jackpot($|\s)/);

const defaultBet = 5;
const minimumBet = 1;
const wheel = [
  'cow',
  'green_apple',
  'apple',
  'pear',
  'tangerine',
  'lemon',
  'banana',
  'watermelon',
  'grapes',
  'strawberry',
  'melon',
  'cherries',
  'peach',
  'pineapple',
  'tomato',
  'eggplant'
];

const jackpotMultiplier = .8;
let TEMP_JACKPOT_VAR = 0;

function getJackpot() {
  return jackpotMultiplier * TEMP_JACKPOT_VAR | 0;
}

module.exports = function slots(message) {
  if (message.author.bot)
    return;

  if (jackpotTest(message.content)) {
    message.channel.sendMessage(`The current jackpot is ${getJackpot().toLocaleString()}.`);
    return;
  }

  if (!slotTest(message.content))
    return;

  let bet = message.content.split(/\s+/, 2)[1];
  bet = bet && _.isFinite(bet | 0) ? bet | 0 : defaultBet;

  if (bet < minimumBet) {
    message.reply(`The minimum bet allowed is ${minimumBet.toLocaleString()}.`);
    return;
  }

  database.getById('Discord', message.author.id, (error, result) => {
    if (error) {
      message.reply('ERROR: Could not load your current points.');
      return;
    }

    if (result.currency < bet) {
      message.reply(`You do not have enough points to bet ${bet.toLocaleString()} (you have ${result.currency}).`);
      return;
    }

    let slot1 = wheel[Math.random() * wheel.length | 0];
    let slot2 = wheel[Math.random() * wheel.length | 0];
    let slot3 = wheel[Math.random() * wheel.length | 0];

    let slotString = `**${message.author.username}** spun the slots...\n` +
      `| :${slot1}: :${slot2}: :${slot3}: |\n`;

    if (slot1 === slot2 && slots2 === slot3) {
      if (slot1 === 'cow') {
        let winnings = getJackpot();
        message.channel.sendMessage(slotString + `...and won ${winnings.toLocaleString()} points!`);
        database.addCurrencyById('Discord', message.author.id, winnings, () => { /* what errors */ });
        return;
      }
      else {
        let winnings = 100 * bet;
        message.channel.sendMessage(slotString + `...and won ${winnings.toLocaleString()} points!`);
        database.addCurrencyById('Discord', message.author.id, winnings, () => { /* what errors */ });
        return;
      }
    }

    let cowCount = 0;
    if (slot1 === 'cow') ++cowCount;
    if (slot2 === 'cow') ++cowCount;
    if (slot3 === 'cow') ++cowCount;

    let hasPair = slot1 === slot2 || slot1 === slot3 || slot2 === slot3;

    if (cowCount === 1) {
      let winnings = hasPair ? 8 * bet : 3 * bet;
      message.channel.sendMessage(slotString + `...and won ${winnings.toLocaleString()} points!`);
      database.addCurrencyById('Discord', message.author.id, winnings, () => { /* what errors */ });
      return;
    } else if (cowCount === 2) {
      let winnings = 10 * bet;
      message.channel.sendMessage(slotString + `...and won ${winnings.toLocaleString()} points!`);
      database.addCurrencyById('Discord', message.author.id, winnings, () => { /* what errors */ });
      return;
    }

    if (hasPair) {
      let winnings = 4 * bet;
      message.channel.sendMessage(slotString + `...and won ${winnings.toLocaleString()} points!`);
      database.addCurrencyById('Discord', message.author.id, winnings, () => { /* what errors */ });
      return;
    }

    message.channel.sendMessage(slotString + `...and lost :(`);
    database.addCurrencyById('Discord', message.author.id, -bet, () => { /* what errors */ });
    TEMP_JACKPOT_VAR += bet;
  });
};
