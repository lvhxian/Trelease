const log = require('single-line-log').stdout

/**
 * 生成进度条
 */
class ProgressBar {
    constructor (description) {
      this.description = description || 'Upload Progress'
      this.length = 30
    }

    /**
     * 渲染字符串
     * @param {*} options 
     */
    render ({ completed, total }) {
        let percent = (completed / total).toFixed(4);      // 已完成的进度(四舍五入)
        let cell_num = Math.floor(percent * this.length);  // 向下取整
        
        let cell = '' // 白色进度条    
        let empty = '' // 拼接灰色条

        for (let i = 0; i < cell_num; i++) {
          cell += '█'
        }

        for (let i = 0; i < this.length - cell_num; i++) {
          empty += '░'
        }

        // 生成终端文本
        let cmdText = `${this.description}: [  ${completed}/${total} ${cell +''+ empty} ${(100 * percent).toFixed(2)}%  ] \n`
        
        log(cmdText);
    }
}

module.exports = ProgressBar
