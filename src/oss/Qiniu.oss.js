/**
 * @description 七牛云OSS操作
 * @author codeTom97
 */

const OSS = require('qiniu');
const spin = require('io-spin')
const FsExtends = require('../core/fs-extend');
const { log } = require('../utils/log')

const spinner = spin('等待上传中');


class QiniuOss extends FsExtends {
    constructor(options) {
        super({ filePath: options.filePath || '' }); // 继承文件系统的操作

        this.accessKeyId = options.access || '';
        this.accessKeySecret = options.password || '';
        this.bucket = options.bucket || '';

        this.isSave = options.isSave || false; // 是否写入package.json
        this.options = options || {}; // 原始配置

        this.fileList = []; // 待上传目录
        this.finishList = []; // 上传成功
        this.errorList = []; // 上传失败

        // 初始化七牛云所需要的全部凭证
        this.init();

    }

    async init() {
        const mac = new OSS.auth.digest.Mac(this.accessKeyId, this.accessKeySecret) // 初始化账户
        const putPolicy = new OSS.rs.PutPolicy({ scope: this.bucket }); // 绑定上传空间
        this.token = putPolicy.uploadToken(mac); // 生成上传token

        // 初始化上传所需要的内容
        const config = new OSS.conf.Config();
        config.zone = OSS.zone.Zone_z2; // 默认使用华南

        this.client = new OSS.form_up.FormUploader(config);
        this.putExtra = new OSS.form_up.PutExtra();
        this.fileList = this.getFileList(); // 获取目标文件
    }

    /**
     * 上传OSS仓库
     * @param {*} fileName 
     * @param {*} filePath 
     */
    upload() {
        spinner.update('开始上传....').start();

        this.fileList.forEach((item) => {
            this.client.putFile(this.token, item.key, item.localFile, this.putExtra, (err, body, info) => {
                if (err) {
                    throw err
                }

                info.statusCode == 200 ? this.finishList.push(body) : this.errorList.push(item.name)
                
                // 成功 + 失败等于上传目录既可以关闭进度
                if (this.finishList.length + this.errorList.length === this.fileList.length) {
                    spinner.stop(); // 关闭进度条
                    log('green', `上传完成: ${this.finishList.length}个`);
                    log('red', `上传失败: ${this.errorList.join(',') || 0}个`);
                    
                    // 如开启保存, 则自动写入package.json
                    if (this.isSave) {
                        this.saveOptions(this.options)
                    }
                }
            })
        });
    }
}


module.exports = QiniuOss