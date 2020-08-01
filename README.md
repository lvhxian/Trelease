# Trelease 2.1.4 :seedling:
:octocat: 终端自动发布器, 一键推送多个仓库, 面向自动化, 解放双手 :muscle:

:star: 2.1.4 更新如下:  :star:

- [x] **加入自定义服务器, 完美兼容[Trelease-Node](https://github.com/codeTom97/Trelease-Node)** :heavy_check_mark:
- [x] **新增初始化时监听配置文件是否创建** :heavy_check_mark:
- [x] **优化log转义** :heavy_check_mark:
- [x] **剔除原自定义服务器上传的配置文件** :x:
- [ ] 加入GUI操作界面 :construction:



------------------------------------------------------------

:star: :star: 搭配 :dart: [Trelease-Node](https://github.com/codeTom97/Trelease-Node)可实现自动以服务器部署 :star: :star:


具体操作如下

全局安装
```
npm i trelease -g

&
yarn add trelease -g
```

直接运行
```
tre

&

trelease
```

或填写配置文件(默认读取package.json), 让Trelease自动读取
```
# package.json
{
    ....
    "treleaseOptions": [
        {
            "type": "AliYun|QiniuYun|UPYun",                        // 仓库类型，支持阿里云, 七牛云, 又拍云, 腾讯云(未实现)
            "access": "",                                           // AccessKey 账户
            "password": "",                                         // AccessKeySecret 秘钥
            "bucket": "",                                           // 目标仓库
            "region": "oss-cn-hongkong",                            // 仓库所属区域(目前只有阿里云需必填)
            "filePath": "C:/Users/codeTom97/Desktop"                // 本地路径, 建议使用终端命令 pwd 获取
        }, 
        {
            "type": "Remote",                                       // 自定义服务器上传配置
            "url": "http://127.0.0.1:12305/upload/save",            // 上传地址(Tip: 用例使用是trelease_node的上传地址)
            "bucket": "Trelease_Project",                           // 生成的目录文件
            "filePath": "C:/Users/codeTom97/Desktop"                // 本地路径, 建议使用终端命令 pwd 获取
        }
    ]

}

```