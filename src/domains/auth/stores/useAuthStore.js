/**
 * Auth Store
 * 遵循手册: 四.状态管理 - 分层 Store 模式
 * 命名规范: use + Domain + Store
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getToken,
  setToken as setAuthToken,
  clearAuth as clearAuthTokens,
  setRefreshToken as setAuthRefreshToken,
  getRefreshToken,
  setCachedUserInfo,
  clearCachedUserInfo
} from '@/@core/auth'

/**
 * Store 名称: useAuthStore
 * 命名规范: use + Domain + Store
 */
export const useAuthStore = defineStore('auth', () => {
  // ======== State ========
  /** @type {import('vue').Ref<string>} */
  const token = ref(getToken())
  
  /** @type {import('vue').Ref<string>} */
  const refreshToken = ref(getRefreshToken())
  
  /** @type {import('vue').Ref<import('../types').UserEntity|null>} */
  const userInfo = ref(null)

  // ======== Getters ========
  /** 是否已登录 */
  const isLoggedIn = computed(() => !!token.value)
  
  /** 用户名 */
  const username = computed(() => userInfo.value?.username || '')
  
  /** 用户邮箱 */
  const email = computed(() => userInfo.value?.email || '')

  // ======== Actions ========
  
  /**
   * 设置 Token
   * @param {string} newToken
   */
  function setToken(newToken) {
    token.value = newToken
    setAuthToken(newToken)
  }

  /**
   * 设置刷新 Token
   * @param {string} newRefreshToken
   */
  function setRefreshToken(newRefreshToken) {
    refreshToken.value = newRefreshToken
    setAuthRefreshToken(newRefreshToken)
  }

  /**
   * 设置用户信息
   * @param {import('../types').UserEntity|null} info
   */
  function setUserInfo(info) {
    userInfo.value = info
    if (info) {
      setCachedUserInfo(info)
    }
  }

  /**
   * 登录成功处理
   * @param {{ token: string; refresh?: string; user?: import('../types').UserEntity }} authData
   */
  function loginSuccess(authData) {
    setToken(authData.token)
    if (authData.refresh) {
      setRefreshToken(authData.refresh)
    }
    if (authData.user) {
      setUserInfo(authData.user)
    }
  }

  /**
   * 退出登录
   */
  function logout() {
    token.value = ''
    refreshToken.value = ''
    userInfo.value = null
    clearAuthTokens()
    clearCachedUserInfo()
  }

  /**
   * 重置 Store 到初始状态
   * Store 必含方法: $reset
   */
  function $reset() {
    token.value = ''
    refreshToken.value = ''
    userInfo.value = null
  }

  return {
    // State
    token,
    refreshToken,
    userInfo,
    // Getters
    isLoggedIn,
    username,
    email,
    // Actions
    setToken,
    setRefreshToken,
    setUserInfo,
    loginSuccess,
    logout,
    $reset
  }
})
