/**
 * @description 交互式发布工具
 */

const inquirer = require('inquirer') // 交互式命令行
const {} = require('./core'); // 调用核心库


/**
 * 初始化
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
                let option = {
                    type: 'Alibaba',
                    access: 'LTAI4GGLDah2Kqbzz3Bjo3Ww',
                    password: 'kzHJSJarDB8BGfH95YAdixCNX1k5AU',
                    bucket: 'lq-luodiye',
                    filePath: 'C:/Users/Administrator/Desktop/Trelease/dist',
                    region: 'oss-cn-hongkong'
                };

                const AliOss = require('./oss/Ali.oss') // 调用OSS包
                new AliOss(option).init() // 实例化后执行初始化
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
        inquirer.prompt(promptList).then(option => {
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

            // 处理结果
            console.log(`您输入的配置: `, option)
        })
    })
}

module.exports = init()