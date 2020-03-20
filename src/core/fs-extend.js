/**
 * @description 文件处理 - 模块
 * @author codeTom97
 */

const fs = require('fs')

class FsExtends {
  constructor({ filePath = "" }) {
    this.filePath = filePath // 文件路径
  }
  /**
   * 获取文件列表
   * @param {*} callback 回调
   */
  getFileList (callback) {
    let filesList = []
    this.getFileByDir(this.filePath, filesList)
    return filesList
  }
  /**
   * 检查是否存在下级目录
   * @param {*} dirPath 目录路径
   * @param {*} list 需要上传的列表
   */
  getFileByDir (dirPath, list) {
    fs.readdirSync(dirPath).map(url => {
      let file = dirPath + '/' + url
      // fs.existsSync 检查是否存在的路径
      if (url.charAt(0) !== '.' && fs.existsSync(file)) {
        // 如果存在目录， 继续遍历
        if (fs.statSync(file).isDirectory()) {
          this.getFileByDir(file, list)
        } else {
          list.push({
            key: this.remoteFilePath + file.slice(this.filePath.length),
            localFile: file
          })
        }
      }
    })
  }
  /**
   * 获取本地目录文件(单层)
   */
  getDirList () {
    let dirList = []
    dirList = fs.readdirSync(this.filePath)
    return dirList
  }
  /**
   * 判断是否为ZIP
   */
  isZip () {
    return this.filePath.indexOf('.zip') > -1
  }
}

module.exports = FsExtends