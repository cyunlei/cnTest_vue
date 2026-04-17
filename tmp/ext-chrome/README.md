# cnTest API Recorder 浏览器扩展

用于跨标签页实时录制浏览器 HTTP 请求，并将数据同步到 cnTest 用例配置页。

## 安装方式

### Google Chrome

1. 打开 Chrome 地址栏输入 `chrome://extensions/`
2. 右上角打开 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择本目录 (`browser-extension`)，目录下已包含默认的 `manifest.json`（Chrome MV3）
5. 安装成功后扩展图标会出现在工具栏

### Mozilla Firefox

1. 打开 Firefox 地址栏输入 `about:debugging#/runtime/this-firefox`
2. 点击 **临时载入附加组件**
3. 选择本目录下的 `manifest-firefox.json`（无需重命名）
4. 扩展安装成功后即可使用

## 工作原理

- `background.js` / `bridge-firefox.js` 通过 `webRequest` API 监听浏览器所有标签页的网络请求
- `content.js` 在 cnTest 页面注入，与 Vue 应用通过 `postMessage` 实时通信
- 点击"开始录制"后，扩展会将所有标签页的新请求实时推送到左侧录制抽屉列表中

## 通信协议

Vue 应用与扩展通过 `window.postMessage` 交互：

- **Vue → 扩展**: `{ source: 'cnTest-webapp', action: 'START_RECORDING' | 'STOP_RECORDING' | 'GET_RECORDINGS' | 'CLEAR_RECORDING' }`
- **扩展 → Vue**: `{ source: 'cnTest-extension', action: 'EXTENSION_READY' | 'RECORDED_REQUEST' | 'ALL_RECORDINGS', payload: ... }`

## 注意事项

- 扩展需要 **webRequest** 和 **所有网站** 权限才能跨标签页抓包
- 录制过程中请勿关闭扩展或刷新 cnTest 页面，否则录制会中断
- 扩展不会上传任何数据，所有请求仅保存在本地浏览器内存中
