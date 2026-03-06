<script setup>
/**
 * 顶部导航栏组件 - Element Plus 重构版
 * 位置: shared/ui/organisms/ (全局有机体组件层)
 */
import { useAuthStore } from '@/domains/auth/stores/useAuthStore'
import { useRoute, useRouter } from 'vue-router'
import { Bell, ChatDotSquare, QuestionFilled, ArrowDown } from '@element-plus/icons-vue'

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

function handleCommand(command) {
  if (command === 'logout') {
    handleLogout()
  } else if (command === 'profile') {
    // 处理个人中心
  } else if (command === 'settings') {
    // 处理设置
  }
}
</script>

<template>
  <el-header class="app-header">
    <div class="header-left">
      <!-- Logo -->
      <div class="brand" @click="router.push('/dashboard')">
        <img src="@/assets/icons/DeepTest.png" alt="DeepTest" class="brand-logo" />
        <span class="brand-text">cnTest</span>
      </div>
      
      <!-- 导航菜单 -->
      <el-menu
        :default-active="route.path"
        mode="horizontal"
        class="nav-menu"
        :ellipsis="false"
      >
        <el-menu-item
          v-for="item in navItems"
          :key="item.path"
          :index="item.path"
          @click="handleNav(item)"
        >
          {{ item.name }}
        </el-menu-item>
      </el-menu>
    </div>

    <div class="header-right">
      <!-- 通知图标 -->
      <el-badge :value="3" class="header-icon">
        <el-icon :size="20"><Bell /></el-icon>
      </el-badge>

      <!-- 消息图标 -->
      <el-badge value="测试环境" type="primary" class="header-icon">
        <el-icon :size="20"><ChatDotSquare /></el-icon>
      </el-badge>

      <!-- 帮助 -->
      <div class="header-icon help-btn">
        <el-icon :size="20"><QuestionFilled /></el-icon>
        <span>帮助</span>
      </div>

      <!-- 用户下拉菜单 -->
      <el-dropdown @command="handleCommand" trigger="click">
        <div class="user-dropdown">
          <el-avatar :size="32" src="@/assets/icons/coding.png" />
          <span class="username">cnTest</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="settings">系统设置</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<style scoped>
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
  cursor: pointer;
}

.brand-logo {
  width: 32px;
  height: 32px;
}

.brand-text {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
}

.nav-menu {
  border-bottom: none;
  background: transparent;
}

.nav-menu :deep(.el-menu-item) {
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
}

.nav-menu :deep(.el-menu-item:hover) {
  color: #1890ff;
  background: transparent;
}

.nav-menu :deep(.el-menu-item.is-active) {
  color: #1890ff;
  border-bottom-color: #1890ff;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.header-icon:hover {
  color: #1890ff;
}

.help-btn {
  gap: 4px;
  font-size: 14px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.user-dropdown:hover {
  background: #f5f5f5;
}

.username {
  font-size: 14px;
  color: #333;
}
</style>
