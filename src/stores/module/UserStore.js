// src/stores/module/UserStore.js
import { defineStore } from 'pinia'

// 定义并导出用户状态仓库（核心）
export const UserStore = defineStore('user', {
  // 状态：存储用户token、信息等
  state: () => ({
    token: localStorage.getItem('token') || '', // 优先从本地存储读取
    userInfo: {} // 存储用户基本信息
  }),
  
  // 操作：修改状态的方法
  actions: {
    // 设置token（登录成功后调用）
    setToken(newToken) {
      this.token = newToken
      // 同步存储到本地（防止页面刷新丢失）
      localStorage.setItem('token', newToken)
    },
    
    // 清除token（退出登录时调用）
    clearToken() {
      this.token = ''
      localStorage.removeItem('token')
    },
    
    // 设置用户信息
    setUserInfo(info) {
      this.userInfo = info
    }
  }
})