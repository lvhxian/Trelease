/**
 * @description 终端打印美化
 */

const chalk = require('chalk');

/**
 * 单一终端色
 * @param {*} colors 颜色, 一般常用red, green, yellow, blue, magenta, cyan, white, gray
 * @param {*} text 文本
 */
const log = (color, text) => {
    console.log(chalk[color](`---------------------------------------------------------\n ${text} \n--------------------------------------------------------- `))
}

/**
 * 带背景的终端色
 * @param {*} color 颜色，与log一致
 * @param {*} bgColor 背景色, 一般常用bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite, bgBlack
 * @param {*} text 文本
 */
const logByBg = (color = "white", bgColor, text) => {
    console.log(chalk[bgColor](`---------------------------------------------------------\n ${chalk[color](text)} \n--------------------------------------------------------- `))
}

module.exports = {
    log,
    logByBg
}
    