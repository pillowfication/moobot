'use strict';

module.exports = {
  level: 'friend',
  test: /^[!/\\]?ping$/,
  handler: function(respond) {
    respond('pong');
  }
};
