/**
 * HTTP 核心层
 * 职责: axios 实例配置、拦截器、错误处理
 * 遵循手册: 二.文件组织 - @core/http
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 懒加载 router，避免循环依赖
const getRouter = () => import('@/app/router').then(m => m.default)

// ======== 常量定义 ========
export const API_BASE_URL = 'http://127.0.0.1:8080'
export const API_TIMEOUT = 30000

/** 不需要认证的 URL 列表 */
export const NO_AUTH_URLS = [
  '/accounts/login',
  '/accounts/check_account_exist',
  '/accounts/register',
  '/accounts/email_code_login',
  '/verification/email/send',
  '/verification/captcha',
  '/verification/captcha/verify'
]

// ======== axios 实例 ========
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
  validateStatus: () => true // 所有状态码都进入 response 拦截器
})

// ======== 请求拦截器 ========
httpClient.interceptors.request.use(
  (config) => {
    // 检查是否需要添加认证头
    const url = config.url || ''
    const needsAuth = !NO_AUTH_URLS.some(u => url.includes(u))
    
    if (needsAuth) {
      // 动态导入避免循环依赖
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ======== 响应拦截器 ========
httpClient.interceptors.response.use(
  (response) => {
    const { status, data } = response
    
    // 2xx 状态码直接返回
    if (status >= 200 && status < 300) {
      return response
    }
    
    // 处理各种错误状态码
    switch (status) {
      case 401:
        ElMessage.warning({
          message: '您的登录已过期，请重新登录！',
          type: 'warning',
          duration: 3000
        })
        // 清除 token 并跳转登录页
        localStorage.removeItem('token')
        localStorage.removeItem('refresh')
        getRouter().then(router => router.push({ name: 'Login' }))
        break
        
      case 400:
        ElMessage.warning({
          message: data?.msg || '请求参数错误',
          type: 'warning',
          duration: 1000
        })
        break
        
      case 500:
        ElMessage.warning({
          message: '【code:500】服务端异常！',
          type: 'warning',
          duration: 1000
        })
        break
        
      default:
        ElMessage.warning({
          message: data?.detail || data?.msg || `请求失败 (${status})`,
          type: 'warning',
          duration: 1000
        })
    }
    
    return response
  },
  (error) => {
    ElMessage.error({
      message: error.message || '网络请求失败',
      type: 'error',
      duration: 3000
    })
    return Promise.reject(error)
  }
)

// ======== 导出 HTTP 方法 ========

/**
 * GET 请求
 * 命名规范: fetchXxx (查询)
 * @param {string} url
 * @param {Record<string, unknown>} [params]
 */
export function fetch(url, params) {
  return httpClient.get(url, { params })
}

/**
 * POST 请求
 * 命名规范: createXxx (创建)
 * @param {string} url
 * @param {unknown} [data]
 */
export function create(url, data) {
  return httpClient.post(url, data)
}

/**
 * PUT 请求
 * 命名规范: updateXxx (更新)
 * @param {string} url
 * @param {unknown} [data]
 */
export function update(url, data) {
  return httpClient.put(url, data)
}

/**
 * DELETE 请求
 * 命名规范: deleteXxx (删除)
 * @param {string} url
 * @param {Record<string, unknown>} [params]
 */
export function remove(url, params) {
  return httpClient.delete(url, { params })
}

/**
 * PATCH 请求
 * 命名规范: patchXxx (部分更新)
 * @param {string} url
 * @param {unknown} [data]
 */
export function patch(url, data) {
  return httpClient.patch(url, data)
}

export default httpClient
