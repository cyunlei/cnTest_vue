/**
 * 路由配置
 * 遵循手册: 二.文件组织 - app/router
 * 路由级懒加载
 */
import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/@core/auth'

/** 路由配置 */
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    // 路由级懒加载，避免循环依赖
    component: () => import('@/domains/auth/views/LoginView.vue'),
    meta: { 
      public: true,
      title: '登录'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/domains/auth/views/RegisterView.vue'),
    meta: { 
      public: true,
      title: '注册'
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/domains/auth/views/HomeView.vue'),
    meta: { 
      requiresAuth: true,
      title: '首页'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/domains/dashboard/views/DashboardView.vue'),
    meta: { 
      requiresAuth: true,
      title: '工作台'
    }
  },
  {
    path: '/quick-call',
    name: 'QuickCall',
    component: () => import('@/domains/quickcall/views/QuickCallView.vue'),
    meta: { 
      requiresAuth: true,
      title: '快捷调用'
    }
  },
  {
    path: '/case-mgmt',
    name: 'CaseMgmt',
    component: () => import('@/domains/casemgmt/views/CaseMgmtView.vue'),
    meta: { 
      requiresAuth: true,
      title: '用例管理'
    }
  },
  {
    path: '/task-mgmt',
    name: 'TaskMgmt',
    component: () => import('@/domains/taskmgmt/views/TaskMgmtView.vue'),
    meta: { 
      requiresAuth: true,
      title: '任务管理'
    }
  },
  {
    path: '/mock-mgmt',
    name: 'MockMgmt',
    component: () => import('@/domains/mockmgmt/views/MockMgmtView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Mock管理'
    }
  },
  {
    path: '/module-settings',
    name: 'ModuleSettings',
    component: () => import('@/domains/modulesettings/views/ModuleSettingsView.vue'),
    meta: { 
      requiresAuth: true,
      title: '模块设置'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// ======== 路由守卫 ========

/**
 * 全局前置守卫
 * 处理认证和权限
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - cnTest`
  }

  // 公开页面直接放行
  if (to.meta.public) {
    next()
    return
  }

  // 需要认证的页面检查登录状态
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  next()
})

/**
 * 全局后置钩子
 * 处理页面滚动等
 */
router.afterEach(() => {
  // 页面切换后滚动到顶部
  window.scrollTo(0, 0)
})

export default router
