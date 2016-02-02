'use strict';

module.exports = {
  test: 'moo',
  handler: function(respond, sender) {
    respond(sender === '76561198003461754' && Math.random() < 0.5 ? '/bullies Moritsune' : 'moo');
  }
};
