<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Setting, Box, Bell, ArrowDown } from '@element-plus/icons-vue'
import AppHeader from '@/shared/ui/organisms/AppHeader.vue'
import { useModuleSettingsStore } from '../stores/useModuleSettingsStore.js'

const route = useRoute()
const router = useRouter()
const store = useModuleSettingsStore()

const menuGroups = [
  {
    id: 'general',
    name: '通用设置',
    icon: Setting,
    children: [
      { id: 'basic-info', name: '基本信息' },
      { id: 'member-mgmt', name: '人员管理' },
      { id: 'personal-config', name: '个性化配置' },
      { id: 'tag-mgmt', name: '标签管理' },
      { id: 'whitelist-mgmt', name: '白名单管理' }
    ]
  },
  {
    id: 'resource',
    name: '模块资源',
    icon: Box,
    children: [
      { id: 'variable-template', name: '变量模板' },
      { id: 'function-template', name: '函数模板' },
      { id: 'framework-template', name: '框架模板' },
      { id: 'account-auth', name: '账号认证' },
      { id: 'file-mgmt', name: '文件管理' },
      { id: 'env-mgmt', name: '环境管理' },
      { id: 'recycle-bin', name: '回收站' }
    ]
  },
  {
    id: 'notify',
    name: '通知消息',
    icon: Bell,
    children: [
      { id: 'api-change', name: 'API变更' }
    ]
  }
]

const activePath = computed(() => {
  return route.path.replace('/module-settings/', '') || 'basic-info'
})

function handleMenuClick(path) {
  router.push(`/module-settings/${path}`)
}
</script>

<template>
  <div class="modulesettings-page">
    <AppHeader />
    <div class="page-body">
      <aside class="sidebar">
        <div class="module-select-wrap">
          <el-select v-model="store.selectedModule" class="module-select" popper-class="module-select-popper">
            <el-option label="门店&用户测试用例" value="门店&用户测试用例" />
            <el-option label="商家开放" value="商家开放" />
            <el-option label="服务市场" value="服务市场" />
            <el-option label="POP订单" value="POP订单" />
            <el-option label="开放平台" value="开放平台" />
          </el-select>
        </div>
        <nav class="menu">
          <div v-for="group in menuGroups" :key="group.id" class="menu-group">
            <div class="menu-title">
              <el-icon><component :is="group.icon" /></el-icon>
              <span>{{ group.name }}</span>
            </div>
            <div class="menu-items">
              <a
                v-for="item in group.children"
                :key="item.id"
                :class="['menu-item', { active: activePath === item.id }]"
                href="javascript:;"
                @click="handleMenuClick(item.id)"
              >
                {{ item.name }}
              </a>
            </div>
          </div>
        </nav>
      </aside>
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.modulesettings-page {
  min-height: 100vh;
  background: #f5f7fa;
}
.page-body {
  display: flex;
  min-height: calc(100vh - 56px);
}
.sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  flex-shrink: 0;
  padding: 16px 0;
  overflow-y: auto;
}
.module-select-wrap {
  padding: 0 12px 12px;
}
.module-select {
  width: 100%;
}
.menu-group {
  margin-bottom: 4px;
}
.menu-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.menu-items {
  padding-left: 8px;
}
.menu-item {
  display: block;
  padding: 8px 12px 8px 32px;
  font-size: 13px;
  color: #666;
  text-decoration: none;
  border-radius: 4px;
  margin-right: 8px;
  cursor: pointer;
}
.menu-item:hover {
  background: #f5f5f5;
  color: #1890ff;
}
.menu-item.active {
  background: #e6f7ff;
  color: #1890ff;
}
.main-content {
  flex: 1;
  padding: 16px 20px 20px;
  overflow: auto;
}
</style>
