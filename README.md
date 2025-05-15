# 说明

个人用于测试electron的项目

* npm ci 安装依赖
* npm start 启动
* 支持在vscode中调试

## 问题

### 如何调试preload.js

* 创建`BrowserWindow`时，必须将`nodeIntegration`设置为true
* 初始化代码会因为调试器attach的延迟而无法断点，解决办法为刷新页面，重新触发加载preload.js
