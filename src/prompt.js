/**
 * @description 交互式发布工具
 */

const inquirer = require('inquirer') // 交互式命令行


/**
 * 初始化 优先检查package.json
 */
const init = () => {
    const confirm = [{
        type: 'confirm',
        name: 'confirm',
        message: '检查到你package.json已配置相关仓库, 是否选用'
    }];

    return new Promise((reslove, reject) => {
        inquirer.prompt(confirm).then(({ confirm }) => {
            if (!confirm) {
                create() // 调用初始化函数
            } else {
                SwitchOss(options)
            }
        })
    })
}

/**
 * 执行交互命令行
 */
const create = () => {
    // 配置选择-输入列表
    const promptList = [{
            type: 'list',
            name: 'type',
            message: '选择云厂商',
            choices: [{
                    name: '阿里云',
                    value: 'Alibaba'
                }, {
                    name: '腾讯云',
                    value: 'Tencent'
                },
                {
                    name: '七牛云',
                    value: 'Qiniu'
                },
            ]
        },
        {
            type: 'input',
            name: 'access',
            message: '请输入OSS账号',
        },
        {
            type: 'password',
            name: 'password',
            message: '请输入OSS密码',
        },
        {
            type: 'input',
            name: 'bucket',
            message: '请输入OSS仓库',
        },
        {
            type: 'input',
            name: 'filePath',
            message: '请输入你要上传目录的完整地址',
        }
    ]

    return new Promise((reslove, reject) => {
        inquirer.prompt(promptList).then(options => {
            // 处理结果
            console.log(`您输入的配置: `, options)
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
        case ('Alibaba'):
            const AliOss = require('./oss/Ali.oss') // 调用OSS包
            new AliOss(option).upload() // 实例化后执行上传
            break;
        case ('Tencent'):
            break;
        case ('Qiniu'):
            break;
        default:
            break;
    }
}

module.exports = init()