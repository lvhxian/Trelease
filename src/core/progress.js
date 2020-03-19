/* eslint-disable camelcase */
const slog = require('single-line-log').stdout

class ProgressBar {
  constructor (description, barLength) {
    this.description = description || 'Progress'
    this.length = barLength || 25
  }
  render (options) {
    let percent = (options.completed / options.total).toFixed(4) // 四舍五入
    let cell_num = Math.floor(percent * this.length)
    let cell = ''
    for (let i = 0; i < cell_num; i++) {
      cell += '█'
    }
    // 拼接灰色条
    let empty = ''
    for (let i = 0; i < this.length - cell_num; i++) {
      empty += '░'
    }
    let cmdText = this.description + ': ' + (100 * percent).toFixed(2) + '% ' + cell + empty + ' ' + options.completed + '/' + options.total + '\n'
    slog(cmdText)
  }
}

module.exports = ProgressBar
