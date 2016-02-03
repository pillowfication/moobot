'use strict';

var _ = require('lodash');
var parser = require('./parser');
var request = require('superagent');
var config = require('../config');
var logger = require('../logger');

var url = 'http://danbooru.donmai.us/posts.json?login='+config.danbooru.username+'&api_key='+config.danbooru.api_key +
          '&random=true&limit=1&tags=remilia_scarlet';
var ratings = {
  's': 'Safe',
  'q': 'Questionable',
  'e': 'Explicit',
  'safe': 'Safe',
  'questionable': 'Questionable',
  'explicit': 'Explicit'
};

module.exports = {
  test: /^[!/\\][Rr]emi(lia(_[Ss]carlet)?)?($|\s)/,
  handler: function(respond, sender, message) {
    var args = parser(message);
    var rating = args[1];
    if (!_.isUndefined(rating)) {
      if (/^[Ss](afe)?$/.test(rating))
        rating = 'safe';
      else if (/^[Qq](uestionable)?$/.test(rating))
        rating = 'questionable';
      else if (/^[Ee](xplicit)?$/.test(rating))
        rating = 'explicit';
      else {
        respond('Invalid rating provided: '+rating);
        return;
      }
    }

    request.get(url + (rating ? '+rating:'+rating : ''), function(err, res) {
      if (err) {
        logger.error(err.toString(), err);
        respond('Something went wrong...');
      } else {
        var data = JSON.parse(res.text)[0];
        respond('('+ratings[data.rating]+') https://danbooru.donmai.us/posts/'+data.id+'?tags=remilia_scarlet');
      }
    });
  }
};
