'use strict';

var path = require('path');
var winston = require('winston');
var winstonConfig = require('winston/lib/winston/config');
var moment = require('moment');

var mainLog = path.join(__dirname, '../logs/_moo.log');
var userLoggers = {};

// Main logger
module.exports = new winston.Logger({
  transports: [
    new winston.transports.Console({
      formatter: function(options) {
        return '[' + moment().format('MM-DD-YY/hh:mm:ss') + '] ' + winstonConfig.colorize(options.level) + ': ' + (options.message || '');
      }
    }),
    new winston.transports.File({
      timestamp: true,
      filename: mainLog
    })
  ],
  levels: {
    error: 0,
    warn: 1,
    success: 2,
    info: 3
  }
});
winston.addColors({
  error: 'red',
  warn: 'yellow',
  success: 'green',
  info: 'white'
});

// Loggers for individual chats
module.exports.chats = function(steamID) {
  return userLoggers[steamID] || (userLoggers[steamID] =
    new winston.Logger({
      transports: [
        new winston.transports.Console({
          formatter: function(options) {
            return '[' + moment().format('MM-DD-YY/hh:mm:ss') + '] info: ' + (options.message || '');
          }
        }),
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
