# Trelease 2.1.3 :seedling:
:octocat: 终端自动发布器, 面向自动化发布, 解放双手 :muscle:

:star: 2.1.3 更新如下:  :star:

:heavy_check_mark: 新增批量选择上传, 解决2.X只能单次上传的问题
:heavy_check_mark: 优化选择器, 让过程更为简单
:heavy_check_mark: 新增阿里云仓库区域填写

:x: 针对OSS文件, 抽离业务代码减少重复

------------------------------------------------------------

:star: :star: 搭配 :dart: [Trelease-Node](https://github.com/codeTom97/Trelease-Node)食用效果更佳(即将来袭, 需要再稍等一会) :star: :star:


具体操作如下

全局安装
```
npm i trelease -g
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
            "type": "AliYun|QiniuYun|UPYun", // 仓库类型，支持阿里云(AliYun), 七牛云, 又拍云, 腾讯云(未实现)
            "access": "", // AccessKey 账户
            "password": "", // AccessKeySecret 秘钥
            "bucket": "", // 目标仓库
            "region": "oss-cn-hongkong", // 仓库所属区域(目前只有阿里云需必填)
            "filePath": "C:/Users/codeTom97/Desktop" // 本地路径, 建议使用终端命令 pwd 获取
        }
    ]

}

```