'use strict';

var path = require('path');
var winston = require('winston');

var mainLog = path.join(__dirname, '../logs/_moo.log');
var userLoggers = {};

// Main logger
module.exports = new winston.Logger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: mainLog
    })
  ],
  levels: {
    success: 0,
    info: 0,
    warn: 0,
    error: 0
  },
  colors: {
    success: 'green',
    info: 'white',
    warn: 'yellow',
    error: 'red'
  }
});

// Loggers for individual chats
module.exports.chats = function(steamID) {
  return userLoggers[steamID] || (userLoggers.steamID =
    new winston.Logger({
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          name: 'main',
          filename: mainLog
        }),
        new winston.transports.File({
          name: 'chat',
          filename: path.join(__dirname, '../logs/' + steamID + '.log')
        })
      ]
    })
  );
};
