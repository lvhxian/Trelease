# Trelease 2.0 :seedling:
:octocat: 终端自动发布器, 面向自动化发布, 解放双手 :muscle:

:star: 2.0版本相比上一版本, 抽离引入配置文件, 全终端操作 :star:

:star: :star: 搭配 :dart: [Trelease-Node](https://github.com/codeTom97/Trelease-Node)食用效果更佳(2.0需要再稍等一会) :star: :star:

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
            "type": "Alibaba", // 仓库类型，支持阿里云, 七牛云, 又拍云, 腾讯云(未实现)
            "access": "", // AccessKey 账户
            "password": "", // AccessKeySecret 秘钥
            "bucket": "", // 目标仓库
            "filePath": "" // 本地路径, 建议使用pwd获取
        }
    ]

}

```