<script setup>
import { ref, onMounted } from 'vue'
import { EditPen } from '@element-plus/icons-vue'
import { fetchBasicInfo } from '../api/index.js'

const info = ref(null)
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const resp = await fetchBasicInfo()
    info.value = resp?.data?.data || null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div v-loading="loading" class="basic-info-view">
    <h2 class="page-title">基本信息</h2>
    <div v-if="info" class="info-card">
      <div class="info-row">
        <div class="info-label">模块名称</div>
        <div class="info-value">
          <span>{{ info.moduleName }}</span>
          <el-icon class="edit-icon"><EditPen /></el-icon>
        </div>
      </div>
      <div class="info-row">
        <div class="info-label">模块ID</div>
        <div class="info-value">{{ info.moduleId }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">创建人</div>
        <div class="info-value user-cell">
          <el-avatar :size="20" src="" style="background: #1890ff; font-size: 12px">{{ info.creator?.[0] }}</el-avatar>
          <span>{{ info.creator }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="info-label">创建时间</div>
        <div class="info-value">{{ info.createdAt }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">更新时间</div>
        <div class="info-value">{{ info.updatedAt }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">描述</div>
        <div class="info-value">
          <span class="empty">{{ info.description || '' }}</span>
          <el-icon class="edit-icon"><EditPen /></el-icon>
        </div>
      </div>
      <div class="info-row">
        <div class="info-label">审批人</div>
        <div class="info-value">
          <span class="empty">{{ info.approver || '' }}</span>
          <el-icon class="edit-icon"><EditPen /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.basic-info-view {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  min-height: 600px;
}
.page-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 16px 0;
}
.info-card {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}
.info-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}
.info-row:last-child {
  border-bottom: none;
}
.info-label {
  width: 140px;
  background: #fafafa;
  padding: 14px 16px;
  font-size: 13px;
  color: #666;
  text-align: right;
  flex-shrink: 0;
}
.info-value {
  flex: 1;
  padding: 14px 16px;
  font-size: 13px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-cell {
  gap: 6px;
}
.edit-icon {
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;
}
.empty {
  color: #999;
}
</style>
