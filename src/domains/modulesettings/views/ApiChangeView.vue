<script setup>
import { ref } from 'vue'

const tableData = ref([])
</script>

<template>
  <div class="api-change-view">
    <h2 class="page-title">API变更</h2>
    <el-table :data="tableData" style="width: 100%" empty-text="暂无数据">
      <el-table-column prop="apiName" label="API名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="changeType" label="变更类型" min-width="120" />
      <el-table-column prop="version" label="版本" min-width="100" />
      <el-table-column prop="creator" label="创建人" min-width="120" />
      <el-table-column prop="createdAt" label="创建时间" min-width="150" />
      <el-table-column label="操作" min-width="120" fixed="right" />
    </el-table>
  </div>
</template>

<style scoped>
.api-change-view {
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
</style>
