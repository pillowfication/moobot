const { createCanvas } = require('canvas')

module.exports = {
  drawBoard (game) {
    const canvas = createCanvas(400, 400)
    const ctx = canvas.getContext('2d')

    ctx.font = '20px Georgia'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, 400, 400)
    ctx.strokeStyle = '#888888'
    ctx.strokeRect(30, 10, 360, 360)
    for (let i = 0; i < 8; ++i) {
      ctx.moveTo(70 + 40 * i, 10)
      ctx.lineTo(70 + 40 * i, 370)
      ctx.stroke()
      ctx.moveTo(30, 50 + 40 * i)
      ctx.lineTo(390, 50 + 40 * i)
      ctx.stroke()
    }

    ctx.fillStyle = '#888888'
    for (let i = 0; i < 9; ++i) {
      const row = '' + (i + 1)
      const col = String.fromCharCode(97 + i)
      ctx.fillText(row, 9, 359 - 40 * i)
      ctx.fillText(col, 50 + 40 * i - (ctx.measureText(col).width / 2), 392)
    }

    ctx.fillStyle = '#663300'
    for (const wall of game.placedWalls.values()) {
      if (wall.orientation === 0) {
        ctx.fillRect(39 + 40 * wall.c, 47 + 40 * wall.r, 62, 6)
      } else {
        ctx.fillRect(67 + 40 * wall.c, 19 + 40 * wall.r, 6, 62)
      }
    }

    const p0x = 50 + game.player0.c * 40
    const p0y = 30 + game.player0.r * 40
    ctx.fillStyle = '#FF0000'
    ctx.beginPath()
    ctx.moveTo(p0x - 15, p0y + 15)
    ctx.lineTo(p0x, p0y - 15)
    ctx.lineTo(p0x + 15, p0y + 15)
    ctx.lineTo(p0x, p0y + 8)
    ctx.fill()

    const p1x = 50 + game.player1.c * 40
    const p1y = 30 + game.player1.r * 40
    ctx.fillStyle = '#0000FF'
    ctx.beginPath()
    ctx.moveTo(p1x - 15, p1y - 15)
    ctx.lineTo(p1x, p1y + 15)
    ctx.lineTo(p1x + 15, p1y - 15)
    ctx.lineTo(p1x, p1y - 8)
    ctx.fill()

    return canvas.createPNGStream()
  }
}
