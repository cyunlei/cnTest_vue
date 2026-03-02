/**
 * Auth 核心层
 * 职责: Token 管理、权限守卫
 * 遵循手册: 二.文件组织 - @core/auth
 */

// ======== 常量 ========
export const TOKEN_KEY = 'token'
export const REFRESH_TOKEN_KEY = 'refresh'

// ======== Token 管理 ========

/**
 * 获取 Token
 * @returns {string}
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

/**
 * 设置 Token
 * @param {string} token
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 清除 Token
 */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 获取刷新 Token
 * @returns {string}
 */
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || ''
}

/**
 * 设置刷新 Token
 * @param {string} token
 */
export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

/**
 * 清除刷新 Token
 */
export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * 清除所有认证信息
 */
export function clearAuth() {
  clearToken()
  clearRefreshToken()
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getToken()
}

// ======== 用户信息缓存（内存） ========
let cachedUserInfo = null

/**
 * 设置缓存的用户信息
 * @param {import('@/domains/auth/types').UserEntity|null} info
 */
export function setCachedUserInfo(info) {
  cachedUserInfo = info
}

/**
 * 获取缓存的用户信息
 * @returns {import('@/domains/auth/types').UserEntity|null}
 */
export function getCachedUserInfo() {
  return cachedUserInfo
}

/**
 * 清除缓存的用户信息
 */
export function clearCachedUserInfo() {
  cachedUserInfo = null
}
