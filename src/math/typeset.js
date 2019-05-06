const mathjax = require('mathjax-node')
const sharp = require('sharp')

const EX = 12
const PADDING = 5

module.exports = function typeset (math) {
  return new Promise((resolve, reject) => {
    mathjax.typeset({
      math: math,
      ex: EX,
      svg: true
    }, result => {
      if (result.errors) {
        reject(new Error(result.errors.join('\n')))
      } else {
        resolve(result.svg)
      }
    })
  }).then(svg =>
    sharp(Buffer.from(svg), { density: EX * 12 })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .extend({ top: PADDING, left: PADDING, right: PADDING, bottom: PADDING, background: { r: 255, g: 255, b: 255 } })
      .png()
      .toBuffer()
  )
}
