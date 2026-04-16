<script setup>
import { ref, onMounted } from 'vue'
import { Plus, QuestionFilled } from '@element-plus/icons-vue'
import { fetchMemberList } from '../api/index.js'

const members = ref([])
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const resp = await fetchMemberList()
    members.value = resp?.data?.data?.list || []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div v-loading="loading" class="member-mgmt-view">
    <h2 class="page-title">人员管理</h2>
    <div class="owner-line">
      <span>模块负责人</span>
      <el-icon class="tip-icon"><QuestionFilled /></el-icon>
      <span>：</span>
      <span class="owner-tag">卢波（lubo24）</span>
    </div>
    <div class="toolbar">
      <el-button :icon="Plus">新增成员</el-button>
    </div>
    <el-table :data="members" style="width: 100%">
      <el-table-column type="selection" width="48" align="center" />
      <el-table-column type="index" label="序号" width="70" align="center" />
      <el-table-column prop="name" label="名称" min-width="140">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="20" style="background: #1890ff; font-size: 12px">{{ row.name?.[0] }}</el-avatar>
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" min-width="100" />
      <el-table-column prop="role" label="角色" min-width="100" />
      <el-table-column label="操作" min-width="100" fixed="right">
        <template #default="{ row }">
          <span v-if="row.role === '管理员'" class="na-text">N/A</span>
          <a v-else class="action-link" href="javascript:;">移除</a>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.member-mgmt-view {
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
.owner-line {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
}
.tip-icon {
  margin: 0 4px;
  color: #999;
  font-size: 14px;
}
.owner-tag {
  display: inline-block;
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
}
.toolbar {
  margin-bottom: 12px;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
.action-link {
  color: #1890ff;
  font-size: 13px;
  text-decoration: none;
}
.na-text {
  color: #999;
  font-size: 13px;
}
</style>
