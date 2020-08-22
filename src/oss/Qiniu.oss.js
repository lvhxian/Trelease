/**
 * @description 七牛云OSS操作
 * @author codeTom97
 */

const OSS = require('qiniu');
const FsExtends = require('../core/fs-extend');
const { log } = require('../utils/log');
const Slog = require('../core/progress');


class QiniuOss extends FsExtends {
    constructor(options) {
        super(); // 继承文件系统的操作

        this.accessKeyId = options.access || '';
        this.accessKeySecret = options.password || '';
        this.bucket = options.bucket || '';

        this.isSave = options.isSave || false; // 是否写入package.json
        this.options = options || {}; // 原始配置

        this.fileList = options.filesList; // 待上传目录 => main函数
        this.finishList = []; // 上传成功
        this.unfinishList = []; // 上传失败

        this.pb = new Slog(`正在上传至${options.bucket}`, this.fileList.length); // 初始化进度条

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

    }

    /**
     * 上传OSS仓库
     */
    async upload() {
        for (let i = 0, len = this.fileList.length; i < len; i++) {
            try {
                const fileItem = this.fileList[i];
    
                const { body, info } = await this.putFile(fileItem);
    
                info.statusCode === 200 ? this.finishList.push(body) : this.unfinishList.push(fileItem);

                this.pb.render({ completed: this.finishList.length, total: len }); // 进度条记录

            } catch (err) {
                log('red', JSON.stringify(err));
                process.exit();
            }

        }
        
        if (this.isSave) {
            this.saveOptions(this.options)
        }

        return {
            finish: this.finishList, 
            finishLen: this.finishList.length,
            unfinish: this.unfinishList,
            unfinishLen: this.unfinishList.length,
        }
            
    }

    /**
     * 封装上传组件
     * @param {*} fileItem 文件格式 来自FsExtend
     */
    putFile (fileItem) {
        return new Promise((reslove, reject) => {
            this.client.putFile(this.token, fileItem.key, fileItem.localFile, this.putExtra, (err, body, info) => {
                if (err) {
                    reject(new Error(err))
                }
                
                reslove({ body, info })
            })
        })
    }
}


module.exports = QiniuOss