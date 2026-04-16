<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const tableData = ref([])
</script>

<template>
  <div class="account-auth-view">
    <h2 class="page-title">账号认证</h2>
    <div class="toolbar">
      <el-button type="primary" :icon="Plus">新增认证</el-button>
    </div>
    <el-table :data="tableData" style="width: 100%" empty-text="暂无数据">
      <el-table-column prop="id" label="编号" min-width="80" />
      <el-table-column prop="name" label="认证名称" min-width="160" />
      <el-table-column prop="type" label="认证类型" min-width="120" />
      <el-table-column prop="account" label="账号" min-width="160" />
      <el-table-column prop="creator" label="创建人" min-width="120" />
      <el-table-column prop="createdAt" label="创建时间" min-width="150" />
      <el-table-column label="操作" min-width="120" fixed="right" />
    </el-table>
  </div>
</template>

<style scoped>
.account-auth-view {
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
.toolbar {
  margin-bottom: 12px;
}
</style>
