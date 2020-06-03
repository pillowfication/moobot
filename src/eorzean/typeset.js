const path = require('path')
const textToSvg = require('text-to-svg').loadSync(path.resolve(__dirname, './EorzeaExtended.ttf'))
const sharp = require('sharp')

const options = {
  fontSize: '48',
  anchor: 'top',
  attributes: {
    stroke: 'black',
    fill: 'white'
  }
}

function typeset (text) {
  return sharp(Buffer.from(textToSvg.getSVG(text, options)))
    .png()
    .toBuffer()
}

module.exports = typeset
