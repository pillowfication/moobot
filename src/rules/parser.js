'use strict';

var regex = /"([^\\"]*(?:\\.[^\\"]*)*)"|'([^\\']*(?:\\.[^\\']*)*)'|(\S+)/g;

module.exports = function(command) {
  command = command.trim();
  var args = [];
  command.replace(regex, function(a, b, c, d){
    args.push(b || c || d || '');
  });
  return args;
};
