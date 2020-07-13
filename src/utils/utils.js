/**
 * @description 工具方法
 * @author codeTom97 
 */

const FontColor = require('./style.js')
const path = require('path')

/**
 * 彩色控制台打印
 * @param {*} text 
 * @param {*} color 
 */
function log(text, color) {
    console.log(FontColor[color], text)
}

function reslovePath(file) {
    return path.resolve(__dirname, file)
}

module.exports = {
    log,
    reslovePath
}