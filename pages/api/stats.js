import fs from 'fs'
import path from 'path'

const MOO_PATH = path.resolve(process.cwd(), './data/moo.json')

function getTopMoos (count) {
  const data = JSON.parse(fs.readFileSync(MOO_PATH).toString())
  const blobs = []
  for (const key in data) {
    const val = data[key]
    if (val.moos > 0) {
      blobs.push(val)
    }
  }

  const sorter = (a, b) => {
    if (a.moosTriggered > b.moosTriggered) {
      return -1
    } else if (a.moosTriggered < b.moosTriggered) {
      return 1
    } else {
      return b.moos - a.moos
    }
  }

  return blobs.sort(sorter).slice(0, count)
}

export default (req, res) => {
  const data = getTopMoos(10)

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}
