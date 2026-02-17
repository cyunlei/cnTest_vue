// vite.config.js - 极简可运行版（去掉按需导入配置）
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  },
  server: {
    host: '0.0.0.0',
    port: 8085,
    open: false
  },
  // 新增 Sass 配置，消除 legacy-js-api 警告
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler' // 使用新版 Sass API
      }
    }
  },
  proxy: {
    // 匹配以 /accounts/api 开头的请求
    '/accounts/api': {
      target: 'http://127.0.0.1:8080', // 后端接口地址
      changeOrigin: true, // 开启跨域
      rewrite: (path) => path.replace(/^\/accounts\/api/, '/accounts/api') // 路径重写（无需修改）
    }
  }
})