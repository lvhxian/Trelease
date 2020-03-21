# Trelease :seedling:
:octocat: 终端自动发布器, 面向自动化发布, 解放双手 :muscle:

:star: :star: 搭配 :dart: [Trelease-Node](https://github.com/codeTom97/Trelease-Node)食用效果更佳 :star: :star:

具体操作如下

安装
```
npm i trelease -D
```

新建upload文件 并且添加如下配置
```
// upload.js
const Upload = require('Trelease')

new Upload({
  /**
   * 上传远端地址 一旦选用优先级最大
   */
  remoteAddress: '',
  /**
   * 本地路径 一般是你的dist
   */
  filePath: "",
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