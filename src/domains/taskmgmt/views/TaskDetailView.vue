<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { InfoFilled, Share, DocumentCopy } from '@element-plus/icons-vue'
import TaskDetailBaseInfo from '../components/TaskDetailBaseInfo.vue'
import TaskDetailCaseTable from '../components/TaskDetailCaseTable.vue'
import TaskDetailStrategy from '../components/TaskDetailStrategy.vue'
import { fetchTaskDetail } from '../api/index.js'

const route = useRoute()

const taskId = route.params.id
const detail = ref(null)
const loading = ref(false)
const activeNames = ref(['base', 'cases', 'strategy', 'notify', 'retry'])

async function loadDetail() {
  loading.value = true
  try {
    const resp = await fetchTaskDetail({ id: taskId })
    detail.value = resp?.data?.data || null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<template>
  <div v-loading="loading" class="task-detail-inner">
    <template v-if="detail">
      <div class="page-header">
        <div class="header-left">
          <el-button text>
            <el-icon><InfoFilled /></el-icon>
            <span>查看详情</span>
          </el-button>
          <el-button text>
            <el-icon><Share /></el-icon>
            <span>分享</span>
          </el-button>
          <el-button text>
            <el-icon><DocumentCopy /></el-icon>
            <span>另存为</span>
          </el-button>
        </div>
      </div>

      <TaskDetailBaseInfo :data="detail" />

      <el-collapse v-model="activeNames" class="detail-collapse">
        <el-collapse-item name="cases">
          <template #title>
            <div class="collapse-title">用例明细</div>
          </template>
          <TaskDetailCaseTable :cases="detail.cases" />
        </el-collapse-item>

        <el-collapse-item name="strategy">
          <template #title>
            <div class="collapse-title">执行策略</div>
          </template>
          <TaskDetailStrategy :data="detail" type="strategy" />
        </el-collapse-item>

        <el-collapse-item name="notify">
          <template #title>
            <div class="collapse-title">通知配置</div>
          </template>
          <TaskDetailStrategy :data="detail" type="notify" />
        </el-collapse-item>

        <el-collapse-item name="retry">
          <template #title>
            <div class="collapse-title">重试策略</div>
          </template>
          <TaskDetailStrategy :data="detail" type="retry" />
        </el-collapse-item>
      </el-collapse>

      <div class="detail-actions">
        <el-button type="primary">编辑</el-button>
        <el-button type="primary">执行</el-button>
        <el-button>设置</el-button>
        <el-button>执行结果</el-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.task-detail-inner {
  /* 嵌套在 tab-panel 中，不需要额外的 padding/背景/min-height */
}
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 4px;
}
.detail-collapse {
  background: #fff;
  border-radius: 4px;
  margin-bottom: 12px;
}
.detail-collapse :deep(.el-collapse-item__header) {
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  background: #fafafa;
}
.collapse-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.detail-actions {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
