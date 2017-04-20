const _ = require('lodash');
const fs = require('fs');
const jsonfile = require('jsonfile');

module.exports = function persist(dataPath) {
  try {
    fs.writeFileSync(dataPath, '{}\n', {flag: 'wx'});
  }
  catch (err) {
    /* Do nothing */
  }

  return {
    get(path, def) {
      return new Promise((resolve, reject) => {
        try {
          const data = jsonfile.readFileSync(dataPath);
          resolve(_.get(data, path, def));
        }
        catch (err) {
          reject(err);
        }
      });
    },
    set(path, value) {
      return new Promise((resolve, reject) => {
        try {
          const data = jsonfile.readFileSync(dataPath);
          _.set(data, path, value);
          jsonfile.writeFileSync(dataPath, data, {spaces: 2});
          resolve(value);
        }
        catch (err) {
          reject(err);
        }
      });
    }
  };
};
