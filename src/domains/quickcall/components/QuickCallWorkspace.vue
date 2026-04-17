<script setup>
import { ref, computed } from 'vue'
import { Edit, Close, Plus } from '@element-plus/icons-vue'
import QuickCallHttpPanel from './panels/QuickCallHttpPanel.vue'
import QuickCallMysqlPanel from './panels/QuickCallMysqlPanel.vue'
import QuickCallRedisPanel from './panels/QuickCallRedisPanel.vue'
import QuickCallShellPanel from './panels/QuickCallShellPanel.vue'
import QuickCallHttpPollPanel from './panels/QuickCallHttpPollPanel.vue'

const props = defineProps({
  initialType: { type: String, default: '' }
})

const tabIdSeed = ref(1)
const tabs = ref([])
const activeTabId = ref(null)

const tabTypeMap = {
  http: { label: '新建HTTP', component: QuickCallHttpPanel },
  mysql: { label: '新建MYSQL', component: QuickCallMysqlPanel },
  redis: { label: '新建JIMDB', component: QuickCallRedisPanel },
  shell: { label: '新建SHELL', component: QuickCallShellPanel },
  'http-poll': { label: '新建HTTP轮询', component: QuickCallHttpPollPanel }
}

const activeTab = computed(() => tabs.value.find(t => t.id === activeTabId.value))

defineExpose({ tabs, addTab })

function addTab(type) {
  const config = tabTypeMap[type] || tabTypeMap.http
  const id = tabIdSeed.value++
  tabs.value.push({ id, type, label: config.label, component: config.component })
  activeTabId.value = id
}

function closeTab(id) {
  const index = tabs.value.findIndex(t => t.id === id)
  if (index === -1) return
  tabs.value.splice(index, 1)
  if (activeTabId.value === id) {
    activeTabId.value = tabs.value.length
      ? tabs.value[Math.min(index, tabs.value.length - 1)].id
      : null
  }
}

function handleTypeClick(type) {
  addTab(type)
}

if (props.initialType) {
  addTab(props.initialType)
}
</script>

<template>
  <div class="quick-call-workspace">
    <!-- Tab 栏 -->
    <div v-if="tabs.length" class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{ active: activeTabId === tab.id }"
        @click="activeTabId = tab.id"
      >
        <el-icon class="tab-icon"><Edit /></el-icon>
        <span class="tab-label">{{ tab.label }}</span>
        <el-icon class="tab-close" @click.stop="closeTab(tab.id)"><Close /></el-icon>
      </div>
      <el-dropdown trigger="click" @command="handleTypeClick">
        <div class="tab-add">
          <el-icon><Plus /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="http">HTTP</el-dropdown-item>
            <el-dropdown-item command="mysql">MYSQL</el-dropdown-item>
            <el-dropdown-item command="redis">JIMDB/REDIS</el-dropdown-item>
            <el-dropdown-item command="shell">SHELL</el-dropdown-item>
            <el-dropdown-item command="http-poll">HTTP轮询</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 内容区 -->
    <div class="workspace-content">
      <template v-if="activeTab">
        <component :is="activeTab.component" :key="activeTab.id" />
      </template>
      <template v-else>
        <div class="empty-workspace">
          <p>请选择左侧类型卡片或点击 + 新建快捷调用</p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.quick-call-workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.tab-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 8px;
  background: #fff;
}
.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  user-select: none;
  transition: all 0.2s;
}
.tab-item:hover {
  color: #1890ff;
}
.tab-item.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  background: #e6f7ff;
}
.tab-icon {
  font-size: 12px;
}
.tab-close {
  font-size: 12px;
  margin-left: 4px;
  color: #999;
}
.tab-close:hover {
  color: #f56c6c;
}
.tab-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  cursor: pointer;
  color: #606266;
  border-radius: 4px;
}
.tab-add:hover {
  background: #f5f5f5;
  color: #1890ff;
}
.workspace-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #fff;
}
.empty-workspace {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}
</style>
