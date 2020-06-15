/**
 * @description 阿里云OSS操作
 * @author codeTom97
 */

const OSS = require('ali-oss');
const FsExtends = require('../core/fs-extend')


class AliOss extends FsExtends {
    constructor(options) {
        super({ filePath: options.filePath || '' }); // 继承文件系统的操作

        this.accessKeyId = options.access || '';
        this.accessKeySecret = options.password || '';
        this.bucket = options.bucket || '';
        this.region = options.region || 'oss-cn-hangzhou';

        this.fileList = []; // 待上传目录

        // 初始化OSS SDK
        this.client = new OSS({
            accessKeyId: this.accessKeyId,
            accessKeySecret: this.accessKeySecret,
            bucket: this.bucket,
            region: this.region
        });

    }

    async init() {
        this.fileList = this.getFileList(); // 获取文件列表
        // const bucketInfo = await this.getBucketInfo()
        // console.log('bucketInfo: ', bucketInfo.Name)
        // if (!bucketInfo) {
        //     console.log('创建')
        //         // this.create()
        // } else {
        //     console.log('执行上传')
        // }

        // 遍历循环执行上传
        this.fileList.forEach(async(item) => {
            const { name = '', url = '' } = await this.upload(item.key, item.localFile);
            if (name) {

            }
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
            console.log(error);

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
    async upload(fileName, filePath) {
        try {
            const result = await this.client.put(fileName, filePath);

            if (result.res && result.res.statusCode === 200) {
                return { name: result.name, url: result.url }
            }

        } catch (error) {
            console.log(error)
        }
    }
}


module.exports = AliOss