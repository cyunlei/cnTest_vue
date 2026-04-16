<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { fetchFunctionList } from '../api/index.js'

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const searchForm = ref({ functionName: '', creator: '', onlyMine: false })

async function loadData() {
  loading.value = true
  try {
    const resp = await fetchFunctionList(searchForm.value)
    const data = resp?.data?.data || {}
    tableData.value = data.list || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  loadData()
}

function handleReset() {
  searchForm.value = { functionName: '', creator: '', onlyMine: false }
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="function-template-view">
    <h2 class="page-title">函数模板</h2>
    <div class="search-bar">
      <el-form inline>
        <el-form-item label="函数名称：">
          <el-input v-model="searchForm.functionName" placeholder="支持模糊查询" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="创建人：">
          <el-select v-model="searchForm.creator" placeholder="请输入ERP,支持自动补全" clearable style="width: 200px">
            <el-option label="ext.chenyunlei1" value="ext.chenyunlei1" />
          </el-select>
        </el-form-item>
        <el-form-item label="只看自己：">
          <el-checkbox v-model="searchForm.onlyMine" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="toolbar">
      <el-button type="primary" :icon="Plus">新增模板</el-button>
    </div>
    <el-table :data="tableData" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="编号" min-width="80" />
      <el-table-column prop="name" label="函数名称" min-width="160" show-overflow-tooltip />
      <el-table-column prop="params" label="入参" min-width="120" />
      <el-table-column prop="creator" label="创建人" min-width="140">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="20" style="background: #1890ff; font-size: 12px">{{ row.creator?.[4] }}</el-avatar>
            <span>{{ row.creator }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" min-width="150" />
      <el-table-column label="操作" min-width="160" fixed="right">
        <template #default>
          <div class="action-btns">
            <a class="action-link" href="javascript:;">被引用情况</a>
            <a class="action-link" href="javascript:;">复制</a>
            <a class="action-link" href="javascript:;">删除</a>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <el-pagination
        layout="total, prev, pager, next, sizes"
        :total="total"
        :page-sizes="[20, 50, 100]"
        :page-size="50"
      />
    </div>
  </div>
</template>

<style scoped>
.function-template-view {
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
.search-bar :deep(.el-form-item) {
  margin-bottom: 12px;
  margin-right: 16px;
}
.toolbar {
  margin-bottom: 12px;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
.action-btns {
  display: flex;
  align-items: center;
  gap: 8px;
}
.action-link {
  color: #1890ff;
  font-size: 13px;
  text-decoration: none;
}
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
