<script setup>
/**
 * 顶部导航栏组件
 * 位置: shared/ui/organisms/ (全局有机体组件层)
 * 用途: 应用顶部导航，包含Logo、菜单、用户信息
 */
import { useAuthStore } from '@/domains/auth/stores/useAuthStore'
import { useRoute, useRouter } from 'vue-router'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const navItems = [
  { name: '工作台', path: '/dashboard' },
  { name: '快捷调用', path: '/quick-call' },
  { name: '用例管理', path: '/case-mgmt' },
  { name: '任务管理', path: '/task-mgmt' },
  { name: 'Mock管理', path: '/mock-mgmt' },
  { name: '模块设置', path: '/module-settings' }
]

function isActive(path) {
  return route.path === path
}

function handleNav(item) {
  router.push(item.path)
}

function handleLogout() {
  authStore.logout()
  window.location.href = '/login'
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <div class="brand">
        <img src="@/assets/icons/DeepTest.png" alt="DeepTest" class="brand-logo" />
        <span class="brand-text">DeepTest</span>
      </div>
      <nav class="main-nav">
        <a
          v-for="item in navItems"
          :key="item.name"
          :class="['nav-item', { active: isActive(item.path) }]"
          href="javascript:;"
          @click="handleNav(item)"
        >
          {{ item.name }}
        </a>
      </nav>
    </div>
    <div class="header-right">
      <button class="icon-btn">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
        </svg>
      </button>
      <div class="badge-btn">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>
        </svg>
        <span class="badge">测试站</span>
      </div>
      <div class="user-badge">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
        <span>JoyCode</span>
      </div>
      <button class="icon-btn help-btn">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
        </svg>
        <span>帮助与反馈</span>
      </button>
      <div class="avatar" @click="handleLogout">
        <img src="@/assets/icons/coding.png" alt="avatar" />
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;

  .brand-logo {
    width: 28px;
    height: 28px;
    object-fit: contain;
  }

  .brand-text {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
  }
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  padding: 8px 16px;
  font-size: 14px;
  color: #666;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    color: #1890ff;
    background: #f5f5f5;
  }

  &.active {
    color: #1890ff;
    font-weight: 500;
    background: #e6f7ff;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    color: #1890ff;
  }
}

.badge-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #f0f5ff;
  border-radius: 12px;
  color: #1890ff;
  font-size: 12px;
  cursor: pointer;

  .badge {
    font-weight: 500;
  }
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #722ed1;
  border-radius: 12px;
  color: #fff;
  font-size: 12px;

  span {
    font-weight: 500;
  }
}

.help-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  width: auto;
  padding: 4px 8px;
  font-size: 13px;

  span {
    display: inline;
  }
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e8e8e8;
  transition: border-color 0.2s;

  &:hover {
    border-color: #1890ff;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
