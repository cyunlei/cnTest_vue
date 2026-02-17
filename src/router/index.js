// src/router/index.js - 修复版（避免提前引用）
import { createRouter, createWebHistory } from 'vue-router'

// 登录页使用懒加载，避免 api -> router -> LoginView -> api 循环依赖
const LoginView = () => import('@/views/login/LoginView.vue')

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  }
]

// 创建路由实例（最后创建，避免提前使用）
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router