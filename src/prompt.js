/**
 * @description 交互式发布工具
 */

const path = require('path');
const fs = require('fs');
const spin = require('io-spin');
const spinner = spin('等待上传中');

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
            type: 'checkbox',
            name: 'index',
            message: "请选择你本地配置的仓库项",
            choices: choicesList
        }
    ];

    return new Promise((reslove, reject) => {
        inquirer.prompt(list).then(async ({ index }) => {
            for (let i = 0, len = index.length; i < len; i++) {
                await SwitchOss(treleaseOptions[index[i]]) // 调用OSS选择器 进行匹配
            }
            process.exit() // 遍历结束后 关闭终端
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
            name: 'access',
            message: '请输入OSS账号',
            when: (options) => {
                return !['Remote', 'Exit'].includes(options.type)
            }
        },
        {
            type: 'password',
            name: 'password',
            message: '请输入OSS密码',
            when: (options) => {
                return !['Remote', 'Exit'].includes(options.type)
            }
        },
        {
            type: 'input',
            name: 'bucket',
            message: '请输入OSS仓库',
            when: (options) => {
                return !['Remote', 'Exit'].includes(options.type)
            }
        },
        {
            type: 'input',
            name: 'region',
            message: '请输入OSS所在区域(默认使用杭州)',
            Exit: 'oss-cn-hangzhou',
            when: (options) => {
                return options.type == 'AliYun'
            }
        },
        {
            type: 'input',
            name: 'filePath',
            message: '请输入你要上传目录的完整地址',
            when: (options) => {
                return !['Exit'].includes(options.type)
            }
        },
        {
            type: 'confirm',
            name: 'isSave',
            message: '上传成功后是否保存配置',
            when: (options) => {
                return !['Exit'].includes(options.type)
            }
        }
    ]

    return new Promise((reslove, reject) => {
        inquirer.prompt(promptList).then(options => {
            if (options.type === 'Exit') {
                process.exit();
            } else if (options.type === 'Remote') {
                log('red', '自定义服务器需要再等一丢丢')
            } else {
                SwitchOss(options)
            }
        })
    })
}

/**
 * OSS仓库选择
 * @param {*} option 
 */
const SwitchOss = async (option) => {
    let result;
    spinner.update(`开始上传至${option.type}........`).start()

    switch (option.type) {
        case ('AliYun'):
            const AliOss = require('./oss/Ali.oss') // 调用OSS包
            result = await new AliOss(option).upload() // 实例化后执行上传
            spinner.stop(); // 先停止加载
            log('blue', `${option.bucket}已执行完成, 信息如下：\n ✔️  ${result.finishLen}个\n ❌ ${result.unfinishLen}个`);
            break;
        case ('TxYun'):
            break;
        case ('QiniuYun'):
            const Qiniu = require('./oss/Qiniu.oss') // 调用OSS包
            result = await new Qiniu(option).upload() // 实例化后执行上传
            spinner.stop(); // 先停止加载
            log('blue', `${option.bucket}已执行完成, 信息如下：\n ✔️  ${result.finishLen}个\n ❌ ${result.unfinishLen}个`);
            break;
        case ('UPYun'):
            const UPYunOSS = require('./oss/UPYun.oss'); // 调用OSS包
            result = await new UPYunOSS(option).upload();
            spinner.stop(); // 先停止加载
            log('blue', ` ${option.bucket}已执行完成, 信息如下：\n ✔️  ${result.finishLen}个\n ❌ ${result.unfinishLen}个`);
            break;
        default:
            log('red', 'ERROR: 你填写的服务商尚未添加, 请联系作者添加')
            break;
    }
}

module.exports = check()