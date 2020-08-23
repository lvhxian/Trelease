/**
 * @description 文件处理 - 模块
 * @author codeTom97
 */

const fs = require('fs')
const path = require('path');

class FsExtends {
    constructor(options) {
        if (options && options.filePath) {
            this.filePath = filePath // 文件路径
        }
    }

    /**
     * 检查文件路径是否真实
     * @param {*} filePath 
     */
    isExist(filePath) {
        return fs.existsSync(filePath);
    }

    /**
     * 获取文件列表
     * @param {*} filePath 文件地址, 可通过外部传递
     */
    getFileList(filePath) {
        if (filePath) {
            this.filePath = filePath;
        }

        let filesList = [];
        const isDir = fs.statSync(this.filePath).isDirectory();

        // 判断地址是否文件夹
        if (isDir) {
            this.getFileByDir(this.filePath, filesList);
        } else {
            const fileInfo = this.getFileByInfo(this.filePath, false);
            filesList.push(fileInfo);
        }


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
                    const fileInfo = this.getFileByInfo(file, true); // 获取单文件基本信息
                    list.push(fileInfo);
                }
            }
        })
    }

    /**
     * 组装单文件数据结构
     * @param {*} filePath  文件地址
     * @param {*} loop 是否循环 => 区分单文件与目录文件
     */
    getFileByInfo(filePath, loop = false) {
        let fileKey;

        if (loop) {
            fileKey = filePath.slice(this.filePath.length + 1); // 过滤文件开头/
        } else {
            const _fileKeyArr = filePath.split('/');
            fileKey = _fileKeyArr[_fileKeyArr.length - 1]; // 获取地址最后的文件名
        }

        const fileInfo = Object.create({});
        
        // 组装文件信息
        fileInfo.key = fileKey;
        fileInfo.localFile = filePath;
        fileInfo.resource = this.createResource(fileKey); // 获取文件所在的目录结构

        return fileInfo;
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
        delete options['filesList'] // 删除文件列表
        
        // 追加字段后 合并packageOptions并转义
        _filterOptions.push({ ...options });
        packageOptions = JSON.stringify({ ...packageOptions, "treleaseOptions": _filterOptions }, null, "\t");

        fs.writeFileSync(packageFile, packageOptions, (err) => {
            console.log(err)
        })
    }
}

module.exports = FsExtends