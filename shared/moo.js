const database = require('./database');

const mooProb = .2;
const bigMooProb = .01;

module.exports = function moo(domain, userId) {
  if (Math.random() < mooProb) {
    if (Math.random() < bigMooProb) {
      database.mooById(domain, userId, 2, () => {});
      return 'MOO';
    }
    database.mooById(domain, userId, 1, () => {});
    return 'moo';
  }
  database.mooById(domain, userId, 0, () => {});
};
