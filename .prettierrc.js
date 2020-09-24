/**
 * @description 代码格式化
 * @author codeTom97
 */

module.exports = {
    // 一行最多 100 字符
    printWidth: 120,
    // 使用 4 个空格缩进
    tabWidth: 4,
    // 不使用缩进符，而使用空格
    useTabs: false,
    // 行尾需要有分号
    semi: true,
    // 使用单引号
    singleQuote: false,
    // 对象的 key 仅在必要时用引号
    quoteProps: "as-needed",
    // 末尾不需要逗号
    trailingComma: "none",
    // 大括号内的首尾需要空格
    bracketSpacing: true,
    // 箭头函数，只有一个参数的时候，也需要括号
    arrowParens: "always",
    // 使用默认的折行标准
    proseWrap: "preserve"
};
