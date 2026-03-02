/**
 * Vite 配置文件
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/@core', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 8085,
    open: false,
    proxy: {
      // 匹配以 /accounts/api 开头的请求
      '/accounts/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  }
})
