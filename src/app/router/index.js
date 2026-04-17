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
      title: '用例管理',
      keepAlive: true
    }
  },
  {
    path: '/case-config/:id',
    name: 'CaseConfig',
    component: () => import('@/domains/casemgmt/views/CaseConfigView.vue'),
    meta: { 
      requiresAuth: true,
      title: '用例配置',
      keepAlive: true
    }
  },
  {
    path: '/task-mgmt',
    name: 'TaskMgmt',
    component: () => import('@/domains/taskmgmt/views/TaskMgmtView.vue'),
    redirect: '/task-mgmt/list',
    meta: { 
      requiresAuth: true,
      title: '任务管理'
    },
    children: [
      {
        path: 'list',
        name: 'TaskList',
        component: () => import('@/domains/taskmgmt/views/TaskListView.vue'),
        meta: { requiresAuth: true, title: '任务列表' }
      },
      {
        path: 'monitor',
        name: 'TaskMonitor',
        component: () => import('@/domains/taskmgmt/views/TaskMonitorView.vue'),
        meta: { requiresAuth: true, title: '任务监控' }
      },
      {
        path: 'detail/:id',
        name: 'TaskDetail',
        component: () => import('@/domains/taskmgmt/views/TaskDetailView.vue'),
        meta: { requiresAuth: true, title: '任务详情' }
      },
      {
        path: 'create',
        name: 'TaskCreate',
        component: () => import('@/domains/taskmgmt/views/TaskCreateView.vue'),
        meta: { requiresAuth: true, title: '新增任务' }
      }
    ]
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
    redirect: '/module-settings/basic-info',
    meta: { 
      requiresAuth: true,
      title: '模块设置'
    },
    children: [
      { path: 'basic-info', name: 'BasicInfo', component: () => import('@/domains/modulesettings/views/BasicInfoView.vue'), meta: { requiresAuth: true, title: '基本信息' } },
      { path: 'member-mgmt', name: 'MemberMgmt', component: () => import('@/domains/modulesettings/views/MemberMgmtView.vue'), meta: { requiresAuth: true, title: '人员管理' } },
      { path: 'personal-config', name: 'PersonalConfig', component: () => import('@/domains/modulesettings/views/PersonalConfigView.vue'), meta: { requiresAuth: true, title: '个性化配置' } },
      { path: 'tag-mgmt', name: 'TagMgmt', component: () => import('@/domains/modulesettings/views/TagMgmtView.vue'), meta: { requiresAuth: true, title: '标签管理' } },
      { path: 'whitelist-mgmt', name: 'WhitelistMgmt', component: () => import('@/domains/modulesettings/views/WhitelistMgmtView.vue'), meta: { requiresAuth: true, title: '白名单管理' } },
      { path: 'variable-template', name: 'VariableTemplate', component: () => import('@/domains/modulesettings/views/VariableTemplateView.vue'), meta: { requiresAuth: true, title: '变量模板' } },
      { path: 'function-template', name: 'FunctionTemplate', component: () => import('@/domains/modulesettings/views/FunctionTemplateView.vue'), meta: { requiresAuth: true, title: '函数模板' } },
      { path: 'framework-template', name: 'FrameworkTemplate', component: () => import('@/domains/modulesettings/views/FrameworkTemplateView.vue'), meta: { requiresAuth: true, title: '框架模板' } },
      { path: 'account-auth', name: 'AccountAuth', component: () => import('@/domains/modulesettings/views/AccountAuthView.vue'), meta: { requiresAuth: true, title: '账号认证' } },
      { path: 'file-mgmt', name: 'FileMgmt', component: () => import('@/domains/modulesettings/views/FileMgmtView.vue'), meta: { requiresAuth: true, title: '文件管理' } },
      { path: 'env-mgmt', name: 'EnvMgmt', component: () => import('@/domains/modulesettings/views/EnvMgmtView.vue'), meta: { requiresAuth: true, title: '环境管理' } },
      { path: 'recycle-bin', name: 'RecycleBin', component: () => import('@/domains/modulesettings/views/RecycleBinView.vue'), meta: { requiresAuth: true, title: '回收站' } },
      { path: 'api-change', name: 'ApiChange', component: () => import('@/domains/modulesettings/views/ApiChangeView.vue'), meta: { requiresAuth: true, title: 'API变更' } }
    ]
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

  // 调试期间暂时禁用登录限制
  // if (to.meta.requiresAuth && !isAuthenticated()) {
  //   next({ name: 'Login', query: { redirect: to.fullPath } })
  //   return
  // }

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
