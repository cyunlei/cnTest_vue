<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Upload } from '@element-plus/icons-vue'
import { fetchFileList } from '../api/index.js'

const activeTab = ref('jar')
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const searchForm = ref({ fileName: '', creator: '' })

async function loadData() {
  loading.value = true
  try {
    const resp = await fetchFileList({ type: activeTab.value, ...searchForm.value })
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

function handleTabChange() {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="file-mgmt-view">
    <h2 class="page-title">文件管理</h2>
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="Jar包" name="jar" />
      <el-tab-pane label="普通文件" name="normal" />
    </el-tabs>
    <div class="search-bar">
      <el-form inline>
        <el-form-item label="文件名：">
          <el-input v-model="searchForm.fileName" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="创建人：">
          <el-select v-model="searchForm.creator" placeholder="请输入ERP,支持自动补全" clearable style="width: 200px">
            <el-option label="全部" value="" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="toolbar">
      <el-button :icon="Upload">Jar包上传</el-button>
      <el-button>POM加载</el-button>
    </div>
    <el-table :data="tableData" v-loading="loading" style="width: 100%" empty-text="暂无数据">
      <el-table-column prop="name" label="文件名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="desc" label="描述" min-width="160" show-overflow-tooltip />
      <el-table-column prop="relatedSteps" label="关联步骤数" min-width="110" />
      <el-table-column prop="creator" label="创建人" min-width="120" />
      <el-table-column prop="createdAt" label="创建时间" min-width="150" />
      <el-table-column label="操作" min-width="120" fixed="right" />
    </el-table>
  </div>
</template>

<style scoped>
.file-mgmt-view {
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
