/**
 * @description 阿里云OSS操作
 * @author codeTom97
 */

const OSS = require('ali-oss');
const spin = require('io-spin');
const FsExtends = require('../core/fs-extend');
const { log } = require('../utils/log');

const spinner = spin('等待上传中');

class AliOss extends FsExtends {
    constructor(options) {
        super({ filePath: options.filePath || '' }); // 继承文件系统的操作

        this.accessKeyId = options.access || '';
        this.accessKeySecret = options.password || '';
        this.bucket = options.bucket || '';
        this.region = ""; // 仓库归属区域, 用getBucketInfo获取

        this.isSave = options.isSave || false; // 是否写入package.json
        this.options = options; // 全部配置文件

        this.fileList = []; // 待上传目录
        this.finishList = []; // 上传成功
        this.errorList = []; // 上传失败

        this.init();
    }

    /**
     * 实例化仓库
     */
    async init() {
        // 获取文件列表
        this.fileList = this.getFileList();

        // 初始化OSS SDK
        this.client = new OSS({
            accessKeyId: this.accessKeyId,
            accessKeySecret: this.accessKeySecret,
            bucket: this.bucket,
        });

    }

    /**
     * 获取仓库信息
     */
    async getBucketInfo() {
        try {
            const result = await this.client.getBucketInfo(this.bucket)
            return result.bucket
        } catch (error) {
            log('red', error.toString());

            // 指定的存储空间不存在。
            if (error.name === 'NoSuchBucketError') {
                return {}
            }
        }
    }

    async create() {
        // try {
        //     const result = await this.client.putBucket(this.bucket)
        //     console.log('bucketInfo: ', result.bucket)
        // } catch (error) {
        //     // 指定的存储空间不存在。
        //     if (error.name === 'NoSuchBucketError') {
        //         console.log
        //     } else {
        //         console.log(error)
        //     }
        // }
    }

    /**
     * 上传OSS仓库
     * @param {*} fileName 
     * @param {*} filePath 
     */
    async upload() {
        const bucketInfo = await this.getBucketInfo() // 通过OSS实例获取仓库地址

        if (!bucketInfo) {
            log('red', 'ERROR: 仓库不存在, 请查看')
            process.exit(); // 强制退出终端
        }

        // 重新实例化 添加仓库归属
        this.client = new OSS({
            accessKeyId: this.accessKeyId,
            accessKeySecret: this.accessKeySecret,
            bucket: this.bucket,
            region: bucketInfo.Location
        });
        
        spinner.update('开始上传....').start();

        this.fileList.forEach(async (item) => {
            try {
                const { res } = await this.client.put(item.key, item.localFile);
    
                res.statusCode === 200 ? this.finishList.push(item) : this.errorList.push(item);

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

            } catch (error) {
                log('red', error);
                this.errorList.push(item);
            }
        });
        
    }
}


module.exports = AliOss