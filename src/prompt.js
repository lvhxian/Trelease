/**
 * @description 交互式发布工具
 */

const path = require('path');
const fs = require('fs');

const inquirer = require('inquirer'); // 交互式命令行

const Main = require('./main'); // 主函数

const { log } = require('./utils/log');

/**
 * 初始化 优先检查package.json
 */
const check = () => {
    const packageFilePath = path.resolve('package.json');
    const hasPackageFile = fs.existsSync(packageFilePath);
    
    if (!hasPackageFile) {
        log('red', '请先执行npm init命令创建package.json');
        process.exit();
    }

    const packageOptions = fs.readFileSync(packageFilePath);
    let { treleaseOptions = "" } = JSON.parse(packageOptions);

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
    let choicesList = treleaseOptions.map((item, index) => {
        return item.type === 'Remote'
            ?
                {
                    name: `${index + 1}: 服务商:${item.type} - 远端地址:${item.url} - 项目名:${item.bucket} - 本地路径:${item.filePath}`,
                    value: index
                }
            :
                {
                    name: `${index + 1}: 服务商:${item.type} - 仓库名:${item.bucket} - 本地路径:${item.filePath}`,
                    value: index
                }
    });

    const list = [
        {
            type: 'checkbox',
            name: 'index',
            message: "请选择你本地配置的仓库项",
            choices: choicesList,
            pageSize: 10 // 展示10项
        }
    ];

    return new Promise((reslove, reject) => {
        inquirer.prompt(list).then(async ({ index }) => {
            const choiceList = [];

            // 遍历获取配置项
            index.forEach(num => {
                choiceList.push(treleaseOptions[num]);
            })

            await new Main(choiceList); // 调用主函数
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
                    name: '退出',
                    value: 'Exit'
                }
            ]
        },
        {
            type: 'input',
            name: 'url',
            message: '请输入远端上传的接口或者地址',
            when: ({ type }) => {
                return type == 'Remote'
            }
        },
        {
            type: 'input',
            name: 'bucket',
            message: '请输入生成在远端项目名',
            default: 'Trelease_Project',
            when: ({ type }) => {
                return type == 'Remote'
            }
        },
        {
            type: 'input',
            name: 'access',
            message: '请输入OSS账号',
            when: ({ type }) => {
                return !['Remote', 'Exit'].includes(type)
            }
        },
        {
            type: 'password',
            name: 'password',
            message: '请输入OSS密码',
            when: ({ type }) => {
                return !['Remote', 'Exit'].includes(type)
            }
        },
        {
            type: 'input',
            name: 'bucket',
            message: '请输入OSS仓库',
            when: ({ type }) => {
                return !['Remote', 'Exit'].includes(type)
            }
        },
        {
            type: 'input',
            name: 'region',
            message: '请输入OSS所在区域(默认使用杭州)',
            default: 'oss-cn-hangzhou',
            when: ({ type }) => {
                return type == 'AliYun'
            }
        },
        {
            type: 'input',
            name: 'filePath',
            message: '请输入你要上传目录的完整地址',
            when: ({ type }) => {
                return !['Exit'].includes(type)
            }
        },
        {
            type: 'confirm',
            name: 'isSave',
            message: '上传成功后是否保存配置',
            when: ({ type }) => {
                return !['Exit'].includes(type)
            }
        }
    ]

    return new Promise((reslove, reject) => {
        inquirer.prompt(promptList).then(async options => {
            options.type  !== 'Exit' ? await new Main([options]) : process.exit();
        })
    })
}

module.exports = check();