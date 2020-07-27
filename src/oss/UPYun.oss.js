/**
 * @description 又拍云OSS操作
 * @author codeTom97
 */

const OSS = require('upyun');
const FsExtends = require('../core/fs-extend');
const { log } = require('../utils/log');


class UPYunOss extends FsExtends {
    constructor(options) {
        super({ filePath: options.filePath || '' }); // 继承文件系统的操作

        this.accessKeyId = options.access || '';
        this.accessKeySecret = options.password || '';
        this.bucket = options.bucket || '';

        this.isSave = options.isSave || false; // 是否写入package.json
        this.options = options || {}; // 原始配置

        this.fileList = []; // 待上传目录
        this.finishList = []; // 上传成功
        this.unfinishList = []; // 上传失败

        // 初始化七牛云所需要的全部凭证
        this.init();

    }

    async init() {
        const service = new OSS.Service(this.bucket, this.accessKeyId, this.accessKeySecret);
        this.client = new OSS.Client(service);

        this.fileList = this.getFileList(); // 获取目标文件
    }

    /**
     * 上传OSS仓库
     * @param {*} fileName 
     * @param {*} filePath 
     */
    async upload() {
        for(let i = 0; i < this.fileList.length; i++) {
            const item = this.fileList[i];

            try {
                const result =  await this.client.putFile(item.key, this.getFileStream(item.localFile)) // 又拍云需要把文件路径转换为Stream流

                result ? this.finishList.push(item) : this.unfinishList.push(item);
    
            } catch (err) {
                log('red', err);
                process.exit(); // 强制退出终端
            }
        }
                    
        // 如开启保存, 则自动写入package.json
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
}


module.exports = UPYunOss