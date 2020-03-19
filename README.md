# Trelease
终端自动发布器v0.1.0版本

具体操作如下

安装
```
npm i trelease -D
```

新建upload文件 并且添加如下配置
```
// upload.js
const Upload = require('Trelease')
const path = require('path')

new Upload({
  /**
   * 远端上传是否启用 -> 优先级最高
   */
  isRemote: true,
  /**
   * 上传远端地址
   */
  remoteAddress: '',
  /**
   * 本地路径
   */
  filePath: path.resolve(__dirname, '../dist'),
  /**
   * 上传服务器路径
   */
  remoteFilePath: '',
  /**
   * 是否打开上传前的提示
   */
  openConfirm: true,
  /**
   * 部署模式 暂未更新
   */
  deploy: {
    /**
     * 部署类型 => 远端仓库, 支持又拍云, 七牛云, 后续更新腾讯, 阿里OSS
     */
    type: 'UPYUN',
    /**
     * 服务(仓库)名
     */
    serviceName: '',
    /**
     * 操作员
     */
    operatorName: '',
    /**
     * 操作员密码
     */
    operatorPassword: ''
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
```