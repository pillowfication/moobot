const _ = require('lodash');
const remilia = require('../../shared/remilia');

const test = RegExp.prototype.test.bind(/^[!/\\][Rr]emi(lia(_[Ss]carlet)?)?($|\s)/);
const ratingsMap = _.cond([
  [RegExp.prototype.test.bind(/^[Ss](afe)?$/),         () => 'safe'],
  [RegExp.prototype.test.bind(/^[Qq](uestionable)?$/), () => 'questionable'],
  [RegExp.prototype.test.bind(/^[Ee](xplicit)?$/),     () => 'explicit']
]);

module.exports = function remi(message) {
  if (message.author.bot || !test(message.content))
    return;

  let rating = ratingsMap(message.content.split(/\s+/, 2)[1]);
  remilia(rating, (err, data) => {
    if (err)
      console.log('OOPS');

    rating = _.upperFirst(ratingsMap(data.rating));
    message.reply(`(${rating}) ${data.url}`);
  });
};
