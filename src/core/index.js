'use strict'
const FormData = require('form-data')
const axios = require('axios')
const request = require('request')
const fs = require('fs')
const fontColor = require('./style')
const ProgressBar = require('./progress')

class Upload {
  constructor (options) {
    this.isRemote = options.isRemote || false // 远端上传模式
    this.remoteAddress = options.remoteAddress || '' // 远端上传地址
    this.filePath = options.filePath || '' // 本地路径
    this.remoteFilePath = options.remoteFilePath || '' // 远端服务器地址
    this.UploadSuccess = options.success || (() => {}) // 成功回调
    this.UploadError = options.error || (() => {}) // 失败回调
    this.filesList = [] // 待上传文件列表
    this.uploadFiles = [] // 上传成功 => 文件列表
    this.errorFiles = [] // 上传失败 => 文件列表
    if (typeof options.openConfirm === 'boolean') {
      this.openConfirm = options.openConfirm
    } else {
      this.openConfirm = true
    }
    this.openConfirm ? this.confirm() : this.init()
  }
  /**
   * 面板模式
   */
  confirm () {
    process.stdin.setEncoding('utf8')
    console.log(fontColor.grey, `请确认发布信息：`)
    console.log(
      fontColor.yellow,
      `---是否启用远端上传：${this.isRemote ? '是' : '否'}`
    )
    console.log(
      this.remoteFilePath ? fontColor.yellow : fontColor.red,
      `---远端仓库：${this.remoteFilePath.replace('/dist', '')}`
    )
    console.log(fontColor.yellow, `---本地文件夹路径：${this.filePath}`)
    console.log(fontColor.red, `确认开始上传吗(N/y)？`)
    process.stdin.on('data', input => {
      if (this.uploading) return false
      input = input.toString().trim()
      if (['Y', 'y', 'YES', 'yes'].indexOf(input) > -1) {
        this.uploading = true
        if (!this.remoteFilePath) {
          console.log(fontColor.red, '请填写需要保存的远端文件夹')
          process.exit()
        } else {
          this.init(() => {
            this.uploading = false
            process.exit()
          })
        }
      } else {
        process.exit()
      }
    })
  }
  /**
   * 初始化函数
   * @param {*} exit
   */
  init (exit) {
    this.getFileList(list => {
      this.filesList = list
      if (!this.filesList.length) {
        console.log(fontColor.yellow, '未找到可以上传的文件')
        return false
      }
      console.log(fontColor.blue, '开始上传...')
      let pb = new ProgressBar('上传进度')
      this.filesList.map(file => {
        this.uploadFile(file, response => {
          this.uploadFiles.push(file)
          !response && this.errorFiles.push(file)
          // 生成进度条
          pb.render({
            completed: this.uploadFiles.length,
            total: this.filesList.length
          })
          if (this.uploadFiles.length === this.filesList.length) {
            console.log(fontColor.green, '上传完成！开始刷新缓存')
            if (this.errorFiles.length) {
              console.log(
                fontColor.red,
                this.errorFiles
                  .map(res => `上传失败: ${res.localFile}`)
                  .join('\n')
              )
              this.UploadError(this.errorFiles)
              exit && exit()
            } else {
              this.UploadSuccess(this.uploadFiles, this.client)
            }
          }
        })
      })
    })
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
   * 获取文件列表
   * @param {*} callback 回调
   */
  getFileList (callback) {
    let filesList = []
    if (this.isZip()) {
      filesList = [
        {
          key: 'dist.zip',
          localFile: this.filePath
        }
      ]
    } else {
      this.getFileByDir(this.filePath, filesList)
    }
    callback && callback(filesList)
  }
  // 上传模块
  uploadFile (file, callBack) {
    const _resource = file.key
      .replace(this.remoteFilePath + '/', '')
      .split('/')
    const form = new FormData()
    form.append('file', fs.createReadStream(file.localFile), file.key)
    form.append('remoteFilePath', this.remoteFilePath)
    // 仅支持二级目录
    _resource[0].indexOf('.') === -1 && form.append('resource', _resource[0])
    // 提交模块
    form.submit(this.remoteAddress, function (err, response) {
      if (err) {
        callBack(false)
        console.log(fontColor.red, `上传失败: ${file.localFile}`)
      } else {
        callBack(response.statusCode === 200)
      }
    })
  }
  /**
   * 获取目录下的文件
   * @param {*} dirName 目录名
   * @param {*} callback 回调函数
   */
  getListDirByFiles (dirName, callback) {
    this.client.listDir(dirName).then(response => {
      callback(response)
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
   * 移除远端文件
   * @param {*} file 远端文件名, 通过getListDirByFiles()获取
   * @param {*} callBack 回调函数
   */
  deleteFile (file, callBack) {
    this.client
      .deleteFile(file)
      .then(response => {
        callBack(response)
      })
      .catch(error => {
        callBack(new Error(error))
      })
  }
  /**
   * 移除目录
   * @param {*} path 移除目录
   * @param {*} callback 回调函数
   */
  deleteDir (path = '', callback) {
    this.client
      .deleteDir(path || this.remoteFilePath)
      .then(response => {
        callback(response)
      })
      .catch(error => {
        callback(new Error(error))
      })
  }
  isZip () {
    return this.filePath.indexOf('.zip') > -1
  }
}

module.exports = Upload
