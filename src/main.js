// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
// 1. 导入 Element Plus 核心库和样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import router from './router' // 导入路由

// 2. 创建应用并注册 Element Plus
const app = createApp(App)
const pinia = createPinia()
app.use(router)
app.use(pinia)
app.use(ElementPlus) // 全局注册所有 Element Plus 组件
app.mount('#app')