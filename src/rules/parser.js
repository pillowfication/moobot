'use strict';

var regex = /"([^\\"]*(?:\\.[^\\"]*)*)"|'([^\\']*(?:\\.[^\\']*)*)'|(\S+)/g;

module.exports = function(command) {
  var args = [];
  command.replace(regex, function(a, b, c, d){
    args.push(b || c || d || '');
  });
  return args;
};
