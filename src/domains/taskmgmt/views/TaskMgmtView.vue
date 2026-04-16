<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/shared/ui/organisms/AppHeader.vue'
import { useTaskMgmtStore } from '../stores/useTaskMgmtStore.js'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskMgmtStore()

const activeTab = computed(() => {
  if (route.path.startsWith('/task-mgmt/monitor')) {
    return 'monitor'
  }
  return 'list'
})

function handleTabClick(tab) {
  if (tab === 'list') {
    router.push('/task-mgmt/list')
  } else if (tab === 'monitor') {
    router.push('/task-mgmt/monitor')
  }
}

function handleAdd() {
  router.push('/task-mgmt/create')
}
</script>

<template>
  <div class="taskmgmt-page">
    <AppHeader />
    <div class="page-body">
      <aside class="module-sidebar">
        <div class="module-select-wrap">
          <el-select v-model="taskStore.selectedModule" class="module-select" popper-class="module-select-popper">
            <el-option
              v-for="m in taskStore.modules"
              :key="m"
              :label="m"
              :value="m"
            />
          </el-select>
        </div>
      </aside>
      <main class="main-content">
        <div class="content-tabs">
          <div
            :class="['tab-item', { active: activeTab === 'list' }]"
            @click="handleTabClick('list')"
          >
            任务列表
          </div>
          <div
            :class="['tab-item', { active: activeTab === 'monitor' }]"
            @click="handleTabClick('monitor')"
          >
            任务监控
          </div>
        </div>
        <div class="tab-panel">
          <router-view @add="handleAdd" />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.taskmgmt-page {
  min-height: 100vh;
  background: #f5f7fa;
}
.page-body {
  display: flex;
  min-height: calc(100vh - 56px);
}
.module-sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  flex-shrink: 0;
  padding: 16px 12px;
}
.module-select-wrap {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 8px 12px;
}
.module-select {
  width: 100%;
}
.module-select :deep(.el-input__wrapper) {
  background: transparent;
  box-shadow: none !important;
  padding: 0;
}
.module-select :deep(.el-input__inner) {
  color: #333;
  font-size: 14px;
}
.main-content {
  flex: 1;
  padding: 16px 20px 20px;
  overflow: auto;
}
.content-tabs {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 12px;
  padding-left: 4px;
}
.tab-item {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  padding-bottom: 8px;
  position: relative;
  transition: color 0.2s;
}
.tab-item:hover {
  color: #1890ff;
}
.tab-item.active {
  color: #1890ff;
  font-weight: 500;
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #1890ff;
  border-radius: 1px;
}
.tab-panel {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  min-height: 600px;
}
</style>
