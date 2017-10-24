const _ = require('lodash');
const winston = require('winston');

module.exports = _.memoize(method => {
  return function messageError(err) {
    winston.error(`Could not ${method} message.`, err);
  };
});
