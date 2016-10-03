const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test');

const Cow = mongoose.model('Cow', new mongoose.Schema({
  domain: String,
  userId: String,
  total:  Number,
  points: Number
}));

module.exports = {
  incrementById: function incrementById(domain, userId, count, cb) {
    Cow.findOneAndUpdate({
      domain: domain,
      userId: userId
    }, {
      $inc: {
        total: count,
        points: count
      }
    }, (err, res) => {
      if (err)
        setImmediate(cb, err);
      if (!res)
        res = new Cow({
          domain: domain,
          userId: userId,
          total: count,
          points: count
        });

      res.save(cb);
    })
  },
  getById: function getById(domain, userId, cb) {
    Cow.findOne({
      domain: domain,
      userId: userId
    }, cb);
  },
  getTopCows: function getTopCows(domain, limit, cb) {
    Cow
      .find({domain: domain})
      .sort({total: -1})
      .limit(limit)
      .exec(cb);
  },
  getTotalMoos: function getTotalMoos(cb) {
    Cow
      .aggregate({
        $group: {
          _id: null,
          total: {$sum: '$total'}
        }
      })
      .exec((err, res) => {
        if (err)
          setImmediate(cb, err);
        else
          setImmediate(cb, null, {total: res[0].total});
      });
  }
};
