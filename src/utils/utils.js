
const FontColor = require('./style.js')

/**
 * 彩色控制台打印
 * @param {*} text 
 * @param {*} color 
 */
function log(text, color) {
  console.log(FontColor[color], text)
}

module.exports = {
  log
}