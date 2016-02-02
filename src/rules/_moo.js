'use strict';

var _ = require('lodash');

var groupLimit = {};
var maximum = 2;
var time = 30*1000;

function createInterval(limit) {
  return limit.timer || setInterval(function() {
    if (limit.count < maximum)
      ++limit.count;
    if (limit.count >= maximum) {
      clearInterval(limit.timer);
      limit.timer = null;
    }
  }, time);
}

module.exports = {
  test: 'moo',
  handler: function(respond, sender, message, chatType, group) {
    if (chatType === 'group') {
      var limit = groupLimit[group];
      if (_.isUndefined(limit)) {
        limit = groupLimit[group] = {};
        limit.count = maximum;
        limit.timer = createInterval(limit);
      }
      if (limit.count > 0) {
        --limit.count;
        limit.timer = createInterval(limit);
      }
      else
        return;
    }
    respond(sender === '76561198003461754' && Math.random() < 0.5 ? '/bullies Moritsune' : 'moo');
  }
};
