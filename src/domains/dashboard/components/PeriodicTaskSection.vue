<script setup>
/**
 * 周期任务组件
 * 位置: domains/dashboard/components/
 */
import { ref } from 'vue'

const activeTab = ref('task')

const tasks = ref([
  { id: 1, name: '定时任务-接口健康检查', schedule: '0 0 * * *', lastRun: '2026-02-09 00:00:00', status: 'success' },
  { id: 2, name: '定时任务-数据同步', schedule: '0 2 * * *', lastRun: '2026-02-09 02:00:00', status: 'success' }
])

const cases = ref([
  { id: 1, name: '周期用例-授权检查', schedule: '0 */6 * * *', lastRun: '2026-02-09 12:00:00', status: 'pending' }
])

const emit = defineEmits(['tabChange'])

function switchTab(tab) {
  activeTab.value = tab
  emit('tabChange', tab)
}
</script>

<template>
  <div class="periodic-section">
    <h3 class="section-title">周期任务</h3>
    
    <div class="tab-bar">
      <button 
        :class="['tab-btn', { active: activeTab === 'task' }]"
        @click="switchTab('task')"
      >
        任务
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'case' }]"
        @click="switchTab('case')"
      >
        用例
      </button>
    </div>

    <div class="task-list">
      <div v-if="activeTab === 'task'">
        <div v-for="task in tasks" :key="task.id" class="task-item">
          <div class="task-info">
            <span class="task-name">{{ task.name }}</span>
            <span class="task-schedule">{{ task.schedule }}</span>
          </div>
          <div class="task-meta">
            <span class="task-time">{{ task.lastRun }}</span>
            <span :class="['task-status', task.status]">
              {{ task.status === 'success' ? '成功' : '待执行' }}
            </span>
          </div>
        </div>
      </div>
      <div v-else>
        <div v-for="c in cases" :key="c.id" class="task-item">
          <div class="task-info">
            <span class="task-name">{{ c.name }}</span>
            <span class="task-schedule">{{ c.schedule }}</span>
          </div>
          <div class="task-meta">
            <span class="task-time">{{ c.lastRun }}</span>
            <span :class="['task-status', c.status]">
              {{ c.status === 'success' ? '成功' : '待执行' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.periodic-section {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  padding: 20px;
  margin-top: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.tab-btn {
  padding: 6px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }

  &.active {
    color: #1890ff;
    background: #e6f7ff;
    font-weight: 500;
  }
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.task-schedule {
  font-size: 12px;
  color: #666;
  font-family: monospace;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-time {
  font-size: 12px;
  color: #999;
}

.task-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;

  &.success {
    background: #f6ffed;
    color: #52c41a;
  }

  &.pending {
    background: #fff7e6;
    color: #fa8c16;
  }
}
</style>
