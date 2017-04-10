const request = require('request');
const config = require('./config.json');

module.exports = function remilia(rating, callback) {
  request({
    url: 'https://danbooru.donmai.us/posts.json',
    auth: {
      user: config.danbooruUsername,
      pass: config.danbooruApi
    },
    qs: {
      tags: 'remilia_scarlet' + (rating ? `+rating:${rating}` : ''),
      random: true,
      limit: 1
    },
    qsStringifyOptions: {
      encode: false
    }
  }, (error, response, body) => {
    if (error)
      setImmediate(callback, error, undefined);

    let data = JSON.parse(body)[0];
    setImmediate(callback, null, {
      rating: data.rating,
      url: `https://danbooru.donmai.us/posts/${data.id}?tags=remilia_scarlet`
    });
  });
};
