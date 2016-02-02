'use strict';

module.exports = {
  test: /^[!/\\]?help$/,
  handler: function(respond) {
    respond('https://github.com/pillowfication/moo/tree/master/src/rules');
  }
};
