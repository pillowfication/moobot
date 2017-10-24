const path = require('path')
const ttf = path.join(__dirname, '../eorzean/EorzeaExtended.ttf')
const textToSvg = require('text-to-svg').loadSync(ttf)
const svgToPng = require('svg2png')

const options = { fontSize: '48', anchor: 'top', attributes: { stroke: 'black', fill: 'white' } }
async function textToPng (text) {
  const svg = textToSvg.getSVG(text, options)
  const png = await svgToPng(svg)
  return png
}

module.exports = function eorzean (client) {
  client.on('message', message => {
    if (message.author.id === client.id && message.content.startsWith('~/eorzean ')) {
      const text = message.content.slice(10).trim()
      textToPng(text)
        .then(buffer => message.channel.send(undefined, { files: [ { attachment: buffer } ] }))
    }
  })
}
