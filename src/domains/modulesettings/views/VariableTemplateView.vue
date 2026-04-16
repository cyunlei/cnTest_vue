<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { fetchVariableList } from '../api/index.js'

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const searchForm = ref({ keyword: '', creator: '', onlyMine: false })
const selectedRows = ref([])

async function loadData() {
  loading.value = true
  try {
    const resp = await fetchVariableList(searchForm.value)
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
  searchForm.value = { keyword: '', creator: '', onlyMine: false }
  loadData()
}

function handleSelectionChange(val) {
  selectedRows.value = val
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="variable-template-view">
    <h2 class="page-title">变量模板</h2>
    <div class="search-bar">
      <el-form inline>
        <el-form-item label="关键字：">
          <el-input v-model="searchForm.keyword" placeholder="支持模糊查询" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="创建人：">
          <el-select v-model="searchForm.creator" placeholder="请输入ERP,支持自动补全" clearable style="width: 200px">
            <el-option label="fengyiao.1" value="fengyiao.1" />
            <el-option label="tianhuiying1" value="tianhuiying1" />
            <el-option label="cenglingming1" value="cenglingming1" />
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
      <el-button>删除</el-button>
    </div>
    <el-table
      :data="tableData"
      v-loading="loading"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="48" align="center" />
      <el-table-column prop="id" label="编号" min-width="90" />
      <el-table-column prop="name" label="名称" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <a class="link-name" href="javascript:;">{{ row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="scope" label="作用域" min-width="180" show-overflow-tooltip />
      <el-table-column prop="creator" label="创建人" min-width="130" />
      <el-table-column prop="desc" label="描述" min-width="140" show-overflow-tooltip />
      <el-table-column label="操作" min-width="160" fixed="right">
        <template #default>
          <div class="action-btns">
            <a class="action-link" href="javascript:;">引用</a>
            <a class="action-link" href="javascript:;">复制</a>
            <a class="action-link" href="javascript:;">移动</a>
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
.variable-template-view {
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
.link-name {
  color: #1890ff;
  text-decoration: none;
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
