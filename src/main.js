/**
 * 应用入口文件
 * 遵循手册: 二.文件组织 - app 层
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './app/router'

// 创建应用实例
const app = createApp(App)

// 注册插件
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 挂载应用
app.mount('#app')
