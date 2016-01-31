'use strict';

var request = require('superagent');
var config = require('../config');
var logger = require('../logger');

var url = 'http://danbooru.donmai.us/posts.json?login='+config.danbooru.username+'&api_key='+config.danbooru.api_key+'&random=true&limit=1&tags=remilia_scarlet';
var ratings = {
  's': 'Safe',
  'q': 'Questionable',
  'e': 'Explicit'
};

module.exports = function(respond) {
  request.get(url, function(err, res) {
    if (err) {
      logger.error(err.toString(), err);
      respond('Something went wrong...');
    } else {
      var data = JSON.parse(res.text)[0];
      respond('('+ratings[data.rating]+') https://danbooru.donmai.us/posts/'+data.id+'?tags=remilia_scarlet');
    }
  });
};
