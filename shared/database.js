const _ = require('lodash');
const mongoose = require('mongoose');
const config = require('./config.json');

mongoose.Promise = global.Promise;
mongoose.connect(config.databaseUrl);

mongoose.connection.on('error', () => {
  console.log(`Failed to connect to ${config.databaseUrl}. Please ensure MongoDB is running.`);
});

const Cow = mongoose.model('Cow', new mongoose.Schema({
  domain: String,
  userId: String,
  displayName: String,
  totalMoos: Number,
  totalMoosTriggered: Number,
  totalBigMoosTriggered: Number,
  currency: Number
}));

const CURR_MOO = 1;
const CURR_BIG_MOO = 500;

// botResponse = 0 -> no response
//             = 1 -> moo
//             = 2 -> MOO
function mooById(domain, userId, botResponse, callback) {
  let delta = {
    totalMoos: 1,
    totalMoosTriggered: botResponse === 1 ? 1 : 0,
    totalBigMoosTriggered: botResponse === 2 ? 1 : 0,
    currency:
      botResponse === 1 ? CURR_MOO + CURR_MOO :
      botResponse === 2 ? CURR_MOO + CURR_BIG_MOO :
      CURR_MOO
  };

  Cow.findOneAndUpdate({
    domain: domain,
    userId: userId
  }, {
    $inc: delta
  }, (error, result) => {
    if (error)
      setImmediate(callback, error);

    if (!result)
      result = new Cow(_.assign(delta, {
        domain: domain,
        userId: userId
      }));

    result.save(callback);
  });
}

function addCurrencyById(domain, userId, count, callback) {
  Cow.findOneAndUpdate({
    domain: domain,
    userId: userId
  }, {
    $inc: {
      currency: count
    }
  }, (error, result) => {
    if (error)
      setImmediate(callback, error);
    if (!result)
      setImmediate(callback, new Error(`userId: ${domain}|${userId} not found.`));

    result.save(callback);
  });
}

function getById(domain, userId, callback) {
  Cow.findOne({
    domain: domain,
    userId: userId
  }, callback);
}

function getTopCows(domain, limit, callback) {
  Cow
    .find({domain: domain})
    .sort({totalMoos: -1})
    .limit(limit)
    .exec(callback);
}

function getTotalMoos(callback) {
  Cow
    .aggregate({
      $group: {
        _id: null,
        totalMoos: {
          $sum: '$totalMoos'
        },
        totalMoosTriggered: {
          $sum: '$totalMoosTriggered'
        },
        totalBigMoosTriggered: {
          $sum: '$totalBigMoosTriggered'
        }
      }
    })
    .exec((error, result) => {
      if (error)
        setImmediate(callback, error);
      else
        setImmediate(callback, null, {
          totalMoos: _.get(result[0], 'totalMoos', 0),
          totalMoosTriggered: _.get(result[0], 'totalMoosTriggered', 0),
          totalBigMoosTriggered: _.get(result[0], 'totalBigMoosTriggered', 0)
        });
    });
}

module.exports = {
  mooById: mooById,
  addCurrencyById: addCurrencyById,
  getById: getById,
  getTopCows: getTopCows,
  getTotalMoos: getTotalMoos
};
