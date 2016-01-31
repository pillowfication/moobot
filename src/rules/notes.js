'use strict';

var parser = require('./parser');

module.exports = function(respond, sender, message) {
  var args = parser(message.trim());
  if (!args[1])
    respond('Invalid use of !note');
  args.forEach(respond);
};
