const _ = require('lodash')
const fs = require('fs')
const util = require('util')
const jsonfile = require('jsonfile')

const readFile = util.promisify(jsonfile.readFile)
const writeFile = util.promisify(jsonfile.writeFile)
const cache = {}

module.exports = _.memoize(function persist (dataPath) {
  try {
    fs.writeFileSync(dataPath, '{}\n', { flag: 'wx' })
  } catch (err) {
    /* Do nothing */
  }

  return {
    async get (path, def) {
      let data = cache[path] || (cache[path] = await readFile(dataPath))
      return path ? _.get(data, path, def) : data
    },

    async set (path, val) {
      let data = cache[path] || await readFile(dataPath)
      path ? _.set(data, path, val) : (data = val)
      await writeFile(dataPath, data, { spaces: 2 })
      cache[path] = undefined
    }
  }
})
