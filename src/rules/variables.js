'use strict';

var variables = {
  isSleeping: false
};

module.exports = {
  get: function(variable) {
    return variables[variable];
  },
  set: function(variable, value) {
    return variables[variable] = value;
  }
};
