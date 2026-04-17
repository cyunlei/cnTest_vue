<script setup>
/**
 * 快捷调用页面 - 重构版
 */
import { ref } from 'vue'
import { Search, Folder, Grid, List } from '@element-plus/icons-vue'
import AppHeader from '@/shared/ui/organisms/AppHeader.vue'
import QuickCallWorkspace from '../components/QuickCallWorkspace.vue'
import InterfaceCallHistoryDrawer from '../components/InterfaceCallHistoryDrawer.vue'
import MyInterfaceTable from '../components/MyInterfaceTable.vue'

const activeMainTab = ref('group')
const selectedModule = ref('商家开放')
const modules = ['商家开放', '服务市场', 'POP订单', '开放平台']

const groups = [
  { id: 1, name: '默认分组' },
  { id: 2, name: 'ext.chenyunlei1' }
]

const apiTypes = [
  { name: 'HTTP', icon: 'http', color: '#faad14', key: 'http' },
  { name: 'JSF', icon: 'jsf', color: '#1890ff', key: 'jsf' },
  { name: 'JIMDB', icon: 'jimdb', color: '#13c2c2', key: 'redis' },
  { name: 'MYSQL', icon: 'mysql', color: '#eb2f96', key: 'mysql' },
  { name: 'HTTP轮询', icon: 'http-poll', color: '#faad14', key: 'http-poll' },
  { name: 'JSF轮询', icon: 'jsf-poll', color: '#1890ff', key: 'jsf-poll' },
  { name: 'JMQ', icon: 'jmq', color: '#52c41a', key: 'jmq' },
  { name: 'SHELL', icon: 'shell', color: '#722ed1', key: 'shell' }
]

const showHistoryDrawer = ref(false)
const workspaceRef = ref(null)

function handleTypeClick(type) {
  if (!workspaceRef.value) return
  workspaceRef.value.addTab(type.key)
}

function handleNav(path) {
  // navigate
}
</script>

<template>
  <div class="quickcall-page">
    <AppHeader @navigate="handleNav" />

    <div class="page-container">
      <!-- 左侧分组树 -->
      <aside class="sidebar">
        <div class="module-select">
          <el-select v-model="selectedModule" placeholder="选择模块">
            <el-option v-for="m in modules" :key="m" :label="m" :value="m" />
          </el-select>
        </div>
        <div class="search-box">
          <el-input placeholder="请输入" size="small">
            <template #suffix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button size="small" class="add-btn">+</el-button>
        </div>
        <div class="group-list">
          <div v-for="group in groups" :key="group.id" class="group-item">
            <el-icon class="folder-icon"><Folder /></el-icon>
            <span>{{ group.name }}</span>
          </div>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <!-- 顶部 Tabs -->
        <div class="content-tabs">
          <button
            :class="['tab-btn', { active: activeMainTab === 'group' }]"
            @click="activeMainTab = 'group'"
          >
            接口分组
          </button>
          <button
            :class="['tab-btn', { active: activeMainTab === 'my' }]"
            @click="activeMainTab = 'my'"
          >
            我的接口
          </button>
          <button
            :class="['tab-btn', { active: activeMainTab === 'all' }]"
            @click="activeMainTab = 'all'"
          >
            全部接口
          </button>
        </div>

        <!-- 接口分组 -->
        <template v-if="activeMainTab === 'group'">
          <div class="group-toolbar">
            <div class="layout-icons">
              <el-icon class="layout-icon"><Grid /></el-icon>
              <el-icon class="layout-icon"><List /></el-icon>
            </div>
            <el-button link class="history-link" @click="showHistoryDrawer = true">历史记录</el-button>
          </div>

          <div class="group-body">
            <!-- 快捷调用工作区（含 tab 栏） -->
            <QuickCallWorkspace ref="workspaceRef" class="workspace" />

            <!-- API 类型网格（当没有打开任何 tab 时显示） -->
            <div v-if="!workspaceRef?.tabs?.length" class="api-grid-wrapper">
              <div
                v-for="type in apiTypes"
                :key="type.name"
                class="api-type-card"
                @click="handleTypeClick(type)"
              >
                <div class="type-icon" :style="{ color: type.color }">
                  <svg v-if="type.icon === 'http'" viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  <svg v-else-if="type.icon === 'jsf'" viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
                <span class="type-name">{{ type.name }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- 我的接口 -->
        <template v-else-if="activeMainTab === 'my'">
          <MyInterfaceTable mode="my" />
        </template>

        <!-- 全部接口 -->
        <template v-else-if="activeMainTab === 'all'">
          <MyInterfaceTable mode="all" />
        </template>
      </main>
    </div>

    <InterfaceCallHistoryDrawer v-model="showHistoryDrawer" />
  </div>
</template>

<style lang="scss" scoped>
.quickcall-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.page-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧边栏 */
.sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 12px;
  flex-shrink: 0;
  overflow-y: auto;
}

.module-select {
  margin-bottom: 10px;
}

.search-box {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.add-btn {
  padding: 0 10px;
}

.group-list {
  .group-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    color: #333;

    &:hover {
      background: #f5f5f5;
    }
  }
}

.folder-icon {
  color: #faad14;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  background: #fff;
}

.content-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 16px 0;
  border-bottom: 1px solid #e8e8e8;
  background: #fff;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    color: #1890ff;
  }

  &.active {
    color: #1890ff;
    font-weight: 500;
    border-bottom: 2px solid #1890ff;
  }
}

.group-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
}

.layout-icons {
  display: flex;
  gap: 8px;
}

.layout-icon {
  font-size: 16px;
  color: #999;
  cursor: pointer;

  &:hover {
    color: #1890ff;
  }
}

.history-link {
  font-size: 13px;
  color: #1890ff;
}

.group-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workspace {
  flex: 1;
  overflow: hidden;
}

/* API 类型网格 */
.api-grid-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  max-width: 700px;
  padding: 16px;
  margin: 0 auto;
}

.api-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .type-icon {
    margin-bottom: 10px;
  }

  .type-name {
    font-size: 13px;
    color: #333;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .sidebar {
    width: 180px;
    padding: 8px;
  }

  .api-grid-wrapper {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .api-type-card {
    padding: 24px 12px;
  }
}
</style>
