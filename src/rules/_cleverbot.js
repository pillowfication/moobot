'use strict';

var cleverbot = require('cleverbot.io');
var logger = require('../logger');
var config = require('../config');

var ask = function(str, cb) {
  cb(null, 'Cleverbot is still being initialized...');
};

var bot = new cleverbot(config.cleverbot.username, config.cleverbot.api_key);
bot.setNick('pillowfication');
bot.create(function(err) {
  if (err) {
    logger.error(err.toString(), err);
    ask = function(str, cb) {
      cb(null, 'Something went wrong creating cleverbot...');
    };
  } else {
    logger.success('Cleverbot created');
    ask = bot.ask.bind(bot);
  }
});

module.exports = {
  test: /^moo, /,
  handler: function(respond, sender, message) {
    ask(message.substring(5), function(err, response) {
      if (err) {
        logger.error(response);
        respond('Something went wrong...');
      } else {
        respond(response);
      }
    });
  }
};
