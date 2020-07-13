/**
 * @description 交互式发布工具
 */

const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer'); // 交互式命令行

const { log } = require('./utils/log');

/**
 * 初始化 优先检查package.json
 */
const check = () => {
    const packageOptions = fs.readFileSync(path.resolve('package.json'))
    let { treleaseOptions = "" } = JSON.parse(packageOptions)

    // 如果未配置, 跳过检查开始创建
    if (!treleaseOptions) {
        create();
    } else {
        const confirm = [
            {
                type: 'confirm',
                name: 'confirm',
                message: '检查到你package.json已配置相关仓库, 是否选用',
            }
        ];
    
        return new Promise((reslove, reject) => {
            inquirer.prompt(confirm).then(({ confirm }) => {
                if (!confirm) {
                    create() // 调用初始化函数
                } else {
                    init(treleaseOptions)
                }
            })
        })
    }
}

// 初始化
const init = (treleaseOptions) => {
    // 组装格式
    let choicesList = treleaseOptions.map((item, index) => ({ 
        name: `${index + 1}: 服务商:${item.type} - 仓库名:${item.bucket} - 本地路径:${item.filePath}`,
        value: index 
    }));

    const list = [
        {
            type: 'list',
            name: 'index',
            message: "请选择你本地配置的仓库项",
            choices: choicesList
        }
    ];

    return new Promise((reslove, reject) => {
        inquirer.prompt(list).then(({ index }) => {
            SwitchOss(treleaseOptions[index]) // 调用OSS选择器 进行匹配
        })
    })
}

/**
 * 执行交互命令行
 */
const create = () => {
    // 配置选择-输入列表
    const promptList = [
        {
            type: 'list',
            name: 'type',
            message: '选择云厂商',
            choices: [
                {
                    name: '阿里云',
                    value: 'AliYun'
                },
                {
                    name: '腾讯云',
                    value: 'TxYun'
                },
                {
                    name: '七牛云',
                    value: 'QiniuYun'
                },
                {
                    name: '又拍云',
                    value: 'UPYun'
                },
                {
                    name: '自定义服务器',
                    value: 'Remote'
                },
                {
                    name: '待考虑',
                    value: 'Default'
                }
            ]
        },
        {
            type: 'input',
            name: 'access',
            message: '请输入OSS账号(自定义服务器非必填)',
        },
        {
            type: 'password',
            name: 'password',
            message: '请输入OSS密码(自定义服务器非必填)',
        },
        {
            type: 'input',
            name: 'bucket',
            message: '请输入OSS仓库(自定义服务器非必填)',
        },
        {
            type: 'input',
            name: 'filePath',
            message: '请输入你要上传目录的完整地址',
        },
        {
            type: 'confirm',
            name: 'isSave',
            message: '上传成功后是否保存配置',
        }
    ]

    return new Promise((reslove, reject) => {
        inquirer.prompt(promptList).then(options => {
            // 处理结果
            SwitchOss(options)
        })
    })
}

/**
 * OSS仓库选择
 * @param {*} option 
 */
const SwitchOss = (option) => {
    switch (option.type) {
        case ('AliYun'):
            const AliOss = require('./oss/Ali.oss') // 调用OSS包
            new AliOss(option).upload() // 实例化后执行上传
            break;
        case ('TxYun'):
            break;
        case ('QiniuYun'):
            const Qiniu = require('./oss/Qiniu.oss') // 调用OSS包
            new Qiniu(option).upload() // 实例化后执行上传
            break;
        case ('UPYun'):
            const UPYun = require('./oss/UPYun.oss') // 调用OSS包
            new UPYun(option).upload() // 实例化后执行上传
            break;
        case ('Remote'):
            log('blue', 'NOT FIND: 自定义服务器尚未开放, 敬请期待')
            break;
        default:
            log('red', 'ERROR: 你填写的服务商尚未添加, 请联系作者添加')
            break;
    }
}

module.exports = check()