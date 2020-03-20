'use strict'
const FormData = require('form-data')
const fs = require('fs')
const { log } = require('../utils/utils')
const ProgressBar = require('./progress')
const FsExtend = require('./fs-extend')

class Upload extends FsExtend {
  constructor (options) {
    super(options)
    this.pb = undefined
    this.remoteAddress = options.remoteAddress || '' // 远端上传地址
    this.remoteFilePath = options.remoteFilePath || '' // 远端服务器地址
    this.UploadSuccess = options.success || (() => {}) // 成功回调
    this.UploadError = options.error || (() => {}) // 失败回调
    this.filesList = [] // 待上传文件列表
    this.finishList = [] // 上传成功列表
    this.errorList = [] // 上传失败列表
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
    log(`请确认发布信息：`, 'grey')
    log(`---是否启用远端上传：${this.isRemote ? '是' : '否'}`, 'yellow')
    log(`---远端仓库：${this.remoteFilePath.replace('/dist', '')}`, this.remoteFilePath ? 'yellow' : 'red')
    log(`---本地文件夹路径：${this.filePath}`, 'yellow')
    log(`确认开始上传吗(N/y)？`, 'red')
    process.stdin.on('data', input => {
      if (this.uploading) return false
      input = input.toString().trim()
      if (['Y', 'y', 'YES', 'yes'].indexOf(input) > -1) {
        this.uploading = true
        if (!this.remoteFilePath) {
          log('ERROR: ---- 请填写需要部署的远端文件夹名 ----', 'red')
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
    const filesList = this.getFileList()
    if (!filesList.length) {
      log(fontColor.yellow, '未找到可上传的文件')
      exit && exit()
    }
    this.filesList = filesList
    log("开始上传.....", "blue")
    this.pb = new ProgressBar('上传进度')
    this.createUpload(this.filesList, (errorNum, finishNum) => {
      if (errorNum > 0) {
        let errorListStr = this.errorFiles.map(res => `上传失败: ${res.localFile}`).join('\n')
        log(errorListStr, 'red')
        this.UploadError(this.errorFiles)
      } else {
        this.UploadSuccess(this.uploadFiles, this.client)
        log(`上传完成, 共计文件数: ${finishNum}`, 'green')
      }
      exit && exit()
    })
    
  }
  /**
   * 创建上传处理
   * @param {*} filesList 
   */
  createUpload (filesList, cb) {
    filesList.map(file => {
      this.uploadFile(file, ({ err, response }) => {
        // 区分上传成功与失败列表, 用于后期
        err ? this.errorList.push(file) :this.finishList.push(file)
        const finishLen = this.finishList.length
        const errorLen =  this.errorList.length
        const totalLen = this.filesList.length
        // 生成进度条
        this.pb.render({
          completed: finishLen,
          total: totalLen
        })
        // 计算成功列表与失败列表总和， 调用回调函数
        if (finishLen + errorLen === totalLen) {
          cb & cb(errorLen, finishLen)
        }
      })
    })
  }
  // 上传模块
  uploadFile (file, cb) {
    const _resource = file.key
      .replace(this.remoteFilePath + '/', '')
      .split('/')
    const form = new FormData()
    form.append('file', fs.createReadStream(file.localFile), file.key)
    form.append('remoteFilePath', this.remoteFilePath)
    // 仅支持二级目录
    _resource[0].indexOf('.') === -1 && form.append('resource', _resource[0])
    // 提交模块 => 判断是否使用远端上传
    if (this.isRemote) {
      form.submit(this.remoteAddress, function (err, response) {
        if (err) {
          log(`上传失败: ${file.localFile}`, "red")
          cb({ err: true })
        } else {
          cb({ err: false, response: response.statusCode === 200 })
        }
      })
    }
  }
}

module.exports = Upload
