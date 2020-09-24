/**
 * @description 主函数, 处理上传分发, 读取文件列表
 * @author codeTom97
 */

const logSymbols = require("log-symbols");
const chalk = require("chalk");
const FsExtends = require("./core/fs-extend");
const { Ali, Qiniu, UPYun, Remote } = require("./oss");
const { log } = require("./utils/log");

class Main extends FsExtends {
    // 1. 读取prompt配置好的相关数据
    // 2. 判断filePath是否上传过，如上传过则使用之前缓存部分
    // 3. 执行对应OSS上传
    constructor(optionsList) {
        super();

        this.choiceList = optionsList || [];

        this.cacheFilePath = {}; // 缓存路径

        this.init();
    }

    async init() {
        for (let i = 0, len = this.choiceList.length; i < len; i++) {
            const choiceItem = this.choiceList[i];

            // 检查文件路径是否存在
            if (!this.isExist(choiceItem.filePath)) {
                log("red", "ERROR: 文件路径不存在, 请重新填写");
                process.exit();
            }

            let cacheFile = this.cacheFilePath[choiceItem.filePath];

            // 判断是否已缓存文件列表
            if (!cacheFile) {
                this.cacheFilePath[choiceItem.filePath] = this.getFileList(choiceItem.filePath);
            }

            choiceItem.filesList = this.cacheFilePath[choiceItem.filePath];

            choiceItem.type == "Remote" ? await this.putRemote(choiceItem) : await this.putOSS(choiceItem);
        }
    }

    /**
     * 上传至OSS
     * @param {*} options OSS相关配置
     */
    async putOSS(options) {
        switch (options.type) {
            case "AliYun":
                const { finishLen: AliFinishLen, unfinishLen: AliUnfinishLen } = await new Ali(options).upload();

                this.renderFinishInfo({ bucket: options.bucket, finish: AliFinishLen, unfinish: AliUnfinishLen }); // 生成上传信息

                break;
            case "TxYun":
                break;
            case "QiniuYun":
                const { finishLen: QiniuFinishLen, unfinishLen: QiniuUnfinishLen } = await new Qiniu(options).upload();

                this.renderFinishInfo({ bucket: options.bucket, finish: QiniuFinishLen, unfinish: QiniuUnfinishLen }); // 生成上传信息

                break;
            case "UPYun":
                const { finishLen: UPYunFinishLen, unfinishLen: UPYunUnfinishLen } = await new UPYun(options).upload();

                this.renderFinishInfo({ bucket: options.bucket, finish: UPYunFinishLen, unfinish: UPYunUnfinishLen }); // 生成上传信息

                break;
            default:
                log("red", "ERROR: 你填写的服务商尚未添加, 请联系作者添加");
                break;
        }
    }

    /**
     * 自定义服务器上传
     * @param {*} options 自定义服务器配置
     */
    async putRemote(options) {
        const { finishLen: RemoteFinishLen, unfinishLen: RemoteUnfinishLen } = await new Remote(options).upload();

        this.renderFinishInfo({ bucket: options.bucket, finish: RemoteFinishLen, unfinish: RemoteUnfinishLen }); // 生成上传信息
    }

    /**
     * 成功提示
     * @param {*} param { 仓库名, 完成数, 未完成数 }
     */
    renderFinishInfo({ bucket, finish, unfinish }) {
        console.log(logSymbols.info, chalk.white(`${bucket}已执行完成, 信息如下: `));
        console.log(logSymbols.success, chalk.green(`success: ${finish}个`));
        console.log(logSymbols.error, chalk.red(`fail: ${unfinish}个`));
    }

    /**
     * 错误提示
     * @param {*} errText
     */
    renderFailInfo(errText) {
        console.log(logSymbols.error, chalk.red(`Error: ${errText}`));
    }
}

module.exports = Main;
