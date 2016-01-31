'use strict';

var path = require('path');
var winston = require('winston');

var userLoggers = {};

// Main logger
module.exports = new winston.Logger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/_moo.log')
    })
  ]
});

// Loggers for individual chats
module.exports.chats = function(steamID) {
  return userLoggers[steamID] || (userLoggers.steamID =
    new winston.Logger({
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: path.join(__dirname, '../logs/' + steamID + '.log')
        })
      ]
    })
  );
};
