<script setup>
/**
 * 快捷调用页面
 * 位置: domains/quickcall/views/
 */
import { ref } from 'vue'
import AppHeader from '@/shared/ui/organisms/AppHeader.vue'

const activeTab = ref('group')
const selectedModule = ref('商家开放')

const modules = ['商家开放', '服务市场', 'POP订单', '开放平台']

const apiTypes = [
  { name: 'HTTP', icon: 'http', color: '#faad14' },
  { name: 'JSF', icon: 'jsf', color: '#1890ff' },
  { name: 'JIMDB', icon: 'jimdb', color: '#13c2c2' },
  { name: 'MYSQL', icon: 'mysql', color: '#eb2f96' },
  { name: 'HTTP轮询', icon: 'http-poll', color: '#faad14' },
  { name: 'JSF轮询', icon: 'jsf-poll', color: '#1890ff' },
  { name: 'JMQ', icon: 'jmq', color: '#52c41a' },
  { name: 'SHELL', icon: 'shell', color: '#722ed1' }
]

const groups = [
  { id: 1, name: '默认分组', count: 0 }
]

function handleTypeClick(type) {
  console.log('Selected type:', type)
}

function handleNav(path) {
  console.log('Navigate to:', path)
}
</script>

<template>
  <div class="quickcall-page">
    <AppHeader @navigate="handleNav" />
    
    <div class="page-container">
      <!-- 左侧分组树 -->
      <aside class="sidebar">
        <div class="module-select">
          <select v-model="selectedModule">
            <option v-for="m in modules" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <div class="search-box">
          <input type="text" placeholder="请输入" />
          <button class="search-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          <button class="add-btn">+</button>
        </div>
        <div class="group-list">
          <div v-for="group in groups" :key="group.id" class="group-item">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
            </svg>
            <span>{{ group.name }}</span>
          </div>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <!-- Tabs -->
        <div class="content-tabs">
          <button
            :class="['tab-btn', { active: activeTab === 'group' }]"
            @click="activeTab = 'group'"
          >
            接口分组
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'my' }]"
            @click="activeTab = 'my'"
          >
            我的接口
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'all' }]"
            @click="activeTab = 'all'"
          >
            全部接口
          </button>
        </div>

        <!-- 新建按钮 -->
        <div class="toolbar">
          <button class="new-btn">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            新建
          </button>
          <button class="history-btn">历史记录</button>
        </div>

        <!-- API类型网格 -->
        <div class="api-grid">
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
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.quickcall-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-container {
  display: flex;
  height: calc(100vh - 56px);
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

  select {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 13px;
    background: #fff;
  }
}

.search-box {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;

  input {
    flex: 1;
    padding: 6px 8px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 12px;

    &::placeholder {
      color: #999;
    }
  }

  .search-btn, .add-btn {
    padding: 6px 8px;
    border: 1px solid #d9d9d9;
    background: #fff;
    border-radius: 4px;
    cursor: pointer;
    color: #666;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }
  }
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

    svg {
      color: #999;
      flex-shrink: 0;
    }
  }
}

/* 主内容区 */
.main-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  min-width: 0;
}

.content-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    color: #1890ff;
  }

  &.active {
    background: #e6f7ff;
    color: #1890ff;
    font-weight: 500;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.new-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #fff;
  color: #333;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
}

.history-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    color: #1890ff;
  }
}

/* API类型网格 */
.api-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  max-width: 700px;
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

  .main-content {
    padding: 12px;
  }

  .api-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .api-type-card {
    padding: 24px 12px;
  }
}

@media (max-width: 600px) {
  .sidebar {
    display: none;
  }

  .api-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 高DPI缩放适配 */
@media (-webkit-min-device-pixel-ratio: 1.25), (min-resolution: 120dpi) {
  .sidebar {
    width: 200px;
  }

  .api-grid {
    gap: 12px;
  }

  .api-type-card {
    padding: 28px 14px;
  }
}
</style>
