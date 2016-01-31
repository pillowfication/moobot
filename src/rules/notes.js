'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var jsonfile = require('jsonfile');
var parser = require('./parser');
var logger = require('../logger');

var fileName = path.join(__dirname, '../../data/notes.json');

// Create the file if it does not exist
fs.writeFileSync(fileName, '{}', {flags: 'wx'});

function writeNote(name, note, cb) {
  jsonfile.readFile(fileName, function(err, data) {
    if (err)
      setImmediate(cb, err);
    else {
      data[name] = note;
      jsonfile.writeFile(fileName, data, {spaces: 2}, function(err) {
        setImmediate(cb, err);
      });
    }
  });
}

function readNote(name, cb) {
  jsonfile.readFile(fileName, function(err, obj) {
    setImmediate(cb, err, obj && obj[name] || '<undefined>');
  });
}

module.exports = function(respond, sender, message) {
  var args = parser(message.trim());
  if (!args[1]) {
    respond('Invalid use of !note');
    return;
  }

  var name = args[1], note = args[2];

  if (_.isUndefined(note)) {
    // Read the specified note
    readNote(name, function(err, note) {
      if (err) {
        logger.error(err.toString(), err);
        respond('Something went wrong...');
      } else {
        respond(note);
      }
    });
  } else {
    // Write to the specified note
    writeNote(name, note, function(err) {
      if (err) {
        logger.error(err.toString(), err);
        respond('Something went wrong...');
      } else {
        respond('Note saved! (' + name + ': ' + note + ')');
      }
    });
  }
};
