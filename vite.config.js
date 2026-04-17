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
  optimizeDeps: {
    include: [
      '@element-plus/icons-vue',
      'element-plus',
      'element-plus/dist/index.css'
    ],
    force: true,
    esbuildOptions: {
      target: 'es2020'
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  esbuild: {
    target: 'es2020'
  },
  server: {
    host: '0.0.0.0',
    port: 8085,
    open: false,
    hmr: {
      overlay: false
    },
    proxy: {
      '/accounts/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern'
      }
    }
  }
})
