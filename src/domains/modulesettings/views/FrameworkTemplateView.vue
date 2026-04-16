<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { fetchFrameworkList } from '../api/index.js'

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const searchForm = ref({ keyword: '', creator: '', frameworkType: '', onlyMine: false })

async function loadData() {
  loading.value = true
  try {
    const resp = await fetchFrameworkList(searchForm.value)
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
  searchForm.value = { keyword: '', creator: '', frameworkType: '', onlyMine: false }
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="framework-template-view">
    <h2 class="page-title">框架模板</h2>
    <div class="search-bar">
      <el-form inline>
        <el-form-item label="关键字：">
          <el-input v-model="searchForm.keyword" placeholder="支持模糊查询" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="创建人：">
          <el-select v-model="searchForm.creator" placeholder="请输入ERP,支持自动补全" clearable style="width: 200px">
            <el-option label="全部" value="" />
          </el-select>
        </el-form-item>
        <el-form-item label="框架类型：">
          <el-select v-model="searchForm.frameworkType" placeholder="请选择" clearable style="width: 140px">
            <el-option label="Spring" value="spring" />
            <el-option label="Dubbo" value="dubbo" />
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
    <el-table :data="tableData" v-loading="loading" style="width: 100%" empty-text="暂无数据">
      <el-table-column prop="id" label="编号" min-width="80" />
      <el-table-column prop="name" label="名称" min-width="160" show-overflow-tooltip />
      <el-table-column prop="framework" label="框架" min-width="120" />
      <el-table-column prop="codeUrl" label="代码地址" min-width="200" show-overflow-tooltip />
      <el-table-column prop="branch" label="分支" min-width="120" />
      <el-table-column prop="execCommand" label="执行命令" min-width="160" show-overflow-tooltip />
      <el-table-column prop="creator" label="创建人" min-width="120" />
      <el-table-column prop="desc" label="描述" min-width="140" show-overflow-tooltip />
      <el-table-column label="操作" min-width="120" fixed="right" />
    </el-table>
  </div>
</template>

<style scoped>
.framework-template-view {
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
</style>
