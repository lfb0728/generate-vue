const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const templateOptions = require('./template-options');
const resolve = (...file) => path.resolve(__dirname, ...file);
const log = message => console.log(chalk.yellow(`${message}`));
const successLog = message => console.log(chalk.blue(`${message}`));
const errorLog = error => console.log(chalk.red(`${error}`));

// 导入模板
const {
    vueTemplate,
    vueApi
} = require('./template')
// 生成文件
const generateFile = (path, data) => {
    if (fs.existsSync(path)) {
        errorLog(`${path}文件已存在`)
        return
    }
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, 'utf8', err => {
            if (err) {
                errorLog(err.message)
                reject(err)
            } else {
                resolve(true)
            }
        })
    })
}
log('请输入要生成的页面文件夹名称、会生成在 views/目录下');

let componentName = ''
process.stdin.on('data', async chunk => {
    // views 名称
    const inputName = String(chunk).trim().toString();
    // 生成Vue文件的上层 以功能区分的文件夹名
    const componentPath = resolve('../src/views', inputName)
    // vue文件
    const vueFile = resolve(componentPath, 'index.vue')
    // 判断组件文件夹是否存在
    const hasComponentExists = fs.existsSync(componentPath)
    if (hasComponentExists) {
        errorLog(`${inputName}文件夹已存在，请重新输入`)
        return
    } else {
        log(`正在生成文件夹 ${componentPath}`)
        await dotExistDirectoryCreate(componentPath)

        // 生成接口文件路径
        const servicesPath = resolve('../services', `${inputName}-api.js`);
        const hasServicesExists = fs.existsSync(servicesPath);
        if(!hasServicesExists) {
            log(`正在生成接口文件 位于services/目录下`)
            await generateFile(servicesPath, vueApi())
        }
    }
    try {
        // 获取文件夹路径
        if (inputName.includes('/')) {
            const inputArr = inputName.split('/')
            componentName = inputArr[inputArr.length - 1]
        } else {
            componentName = inputName
        }
        log(`正在生成 vue 文件 ${vueFile}`)
        await generateFile(vueFile, vueTemplate(componentName, templateOptions))
        successLog('生成成功')
    } catch (e) {
        errorLog(e.message)
    }

    process.stdin.emit('end')
})
process.stdin.on('end', () => {
    log('exit')
    process.exit()
})


function dotExistDirectoryCreate(directory) {
    return new Promise((resolve) => {
        mkdir(directory, function() {
            resolve(true)
        })
    })
}
// 递归创建目录
function mkdir(directory, callback) {
    var exists = fs.existsSync(directory)
    if (exists) {
        callback()
    } else {
        mkdir(path.dirname(directory), function() {
            fs.mkdirSync(directory)
            callback()
        })
    }
}
