const request = require('request');
const config = require('./config.json');

module.exports = function remilia(rating, cb) {
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
      setImmediate(cb, err, undefined);

    let data = JSON.parse(body)[0];
    setImmediate(cb, null, {
      rating: data.rating,
      url: `https://danbooru.donmai.us/posts/${data.id}?tags=remilia_scarlet`
    });
  });
};
