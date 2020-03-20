/* eslint-disable no-new */
const Upload = require('../src')
const path = require('path')

new Upload({
  isRemote: true, // 远端上传是否启用 -> 优先级最高
  remoteAddress: '', // 上传远端地址
  filePath: path.resolve(__dirname, '../dist'), // 本地路径
  remoteFilePath: '', // 上传服务器路径
  openConfirm: true, // 是否打开上传前的提示
  /**
   * 第三方部署模式
   */
  deploy: {
    type: 'UPYUN', // 部署类型 => 远端OSS, 目前支持又拍云
    serviceName: '', // 服务(仓库)名
    operatorName: '', // 操作员(用户名)
    operatorPassword: '' // 操作员密码(用户密码)
  },
  /**
   * 上传成功回调
   * @param {array} files [成功文件列表]
   */
  success: function (files) {},
  /**
   * 上传失败回调
   * @param {array} files [失败文件列表]
   */
  error: function (files) {}
})
