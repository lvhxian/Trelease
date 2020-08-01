/**
 * @description 文件处理 - 模块
 * @author codeTom97
 */

const fs = require('fs')
const path = require('path')

class FsExtends {
    constructor({ filePath = "" }) {
        this.filePath = filePath // 文件路径
    }

    /**
     * 获取文件列表
     * @param {*} callback 回调
     */
    getFileList(callback) {
        let filesList = []
        this.getFileByDir(this.filePath, filesList)
        return filesList
    }

    /**
     * 检查是否存在下级目录
     * @param {*} dirPath 目录路径
     * @param {*} list 需要上传的列表
     */
    getFileByDir(dirPath, list) {
        fs.readdirSync(dirPath).map(url => {
            let file = dirPath + '/' + url
                // fs.existsSync 检查是否存在的路径
            if (url.charAt(0) !== '.' && fs.existsSync(file)) {
                // 如果存在目录， 继续遍历
                if (fs.statSync(file).isDirectory()) {
                    this.getFileByDir(file, list)
                } else {
                    const fileKey = file.slice(this.filePath.length + 1); // 过滤文件开头/

                    list.push({
                        key: fileKey, 
                        localFile: file,
                        resource: this.createResource(fileKey)
                    })
                }
            }
        })
    }

    /**
     * 根据目录地址生成目录结构
     * @param {*} fileKey 刨除文件根路径后的文件目录
     */
    createResource(fileKey) {
        let resourceArr = fileKey.split('/');
        let resourceStr = "";

        // 一级目录
        if (resourceArr.length > 1) {
            resourceArr.pop(); // 推出最后一项 一般为文件名
            resourceStr = resourceArr.join('/')
        } else {
            resourceStr = '.'
        }

        return resourceStr
    }

    /**
     * 获取本地目录文件(单层)
     */
    getDirList() {
        let dirList = []
        dirList = fs.readdirSync(this.filePath)
        return dirList
    }

    /**
     * 文件地址转换为文件流
     * @param {*} localFile 
     */
    getFileStream (localFile) {
        return fs.createReadStream(localFile)
    }

    /**
     * 写入配置项
     * @param {*} options 
     */
    saveOptions (options) {
        const packageFile = path.resolve('package.json');
        let packageOptions = JSON.parse(fs.readFileSync(packageFile));
        const { treleaseOptions = [] } = packageOptions;
        
        let _filterOptions = {};

        if (options.type === 'Remote') {
            // 自定义服务器则需要全拦截
            _filterOptions = treleaseOptions.filter(item => item.url !== options.url && item.bucket !== options.bucket)
        } else {
            // OSS 一般判断bucket, access
            _filterOptions = treleaseOptions.filter(item => item.access !== options.access && item.bucket !== options.bucket);
        }

        delete options['isSave'] // 删除保存配置
        
        // 追加字段后 合并packageOptions并转义
        _filterOptions.push({ ...options });
        packageOptions = JSON.stringify({ ...packageOptions, "treleaseOptions": _filterOptions }, null, "\t");

        fs.writeFileSync(packageFile, packageOptions, (err) => {
            console.log(err)
        })
    }
}

module.exports = FsExtends