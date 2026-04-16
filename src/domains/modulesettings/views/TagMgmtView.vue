<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Search, Folder } from '@element-plus/icons-vue'
import { fetchTagCategories, fetchTagList } from '../api/index.js'

const categories = ref([])
const tagData = ref([])
const loading = ref(false)
const searchForm = ref({ tagName: '', globalSearch: false })

async function loadData() {
  loading.value = true
  try {
    const [catResp, tagResp] = await Promise.all([
      fetchTagCategories(),
      fetchTagList(searchForm.value)
    ])
    categories.value = catResp?.data?.data?.list || []
    tagData.value = tagResp?.data?.data?.list || []
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  loadData()
}

function handleReset() {
  searchForm.value.tagName = ''
  searchForm.value.globalSearch = false
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div v-loading="loading" class="tag-mgmt-view">
    <div class="layout">
      <aside class="category-sidebar">
        <div class="cat-header">
          <span class="cat-title">分类列表</span>
          <el-icon class="add-icon"><Plus /></el-icon>
        </div>
        <div class="cat-search">
          <el-input placeholder="" :prefix-icon="Search" />
        </div>
        <div class="cat-list">
          <div v-for="c in categories" :key="c.id" class="cat-item">
            <el-icon><Folder /></el-icon>
            <span>{{ c.name }}</span>
          </div>
        </div>
      </aside>
      <main class="tag-main">
        <h2 class="page-title">标签管理</h2>
        <div class="search-bar">
          <el-form inline>
            <el-form-item label="标签名称：">
              <el-input v-model="searchForm.tagName" placeholder="支持模糊查询" clearable style="width: 180px" />
            </el-form-item>
            <el-form-item label="全局搜索：">
              <el-switch v-model="searchForm.globalSearch" inline-prompt active-text="开" inactive-text="关" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="toolbar">
          <el-button :icon="Plus">新增</el-button>
        </div>
        <el-table :data="tagData" style="width: 100%" empty-text="暂无数据">
          <el-table-column prop="id" label="编号" min-width="80" />
          <el-table-column prop="name" label="标签名称" min-width="140" show-overflow-tooltip />
          <el-table-column prop="category" label="标签分类" min-width="120" />
          <el-table-column prop="desc" label="描述" min-width="140" show-overflow-tooltip />
          <el-table-column prop="relatedCases" label="关联用例" min-width="100" />
          <el-table-column prop="creator" label="创建人" min-width="120" />
          <el-table-column prop="createdAt" label="创建时间" min-width="150" />
          <el-table-column label="操作" min-width="120" fixed="right" />
        </el-table>
      </main>
    </div>
  </div>
</template>

<style scoped>
.tag-mgmt-view {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  min-height: 600px;
}
.layout {
  display: flex;
  gap: 16px;
}
.category-sidebar {
  width: 180px;
  flex-shrink: 0;
  border-right: 1px solid #f0f0f0;
  padding-right: 12px;
}
.cat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.cat-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.add-icon {
  font-size: 16px;
  color: #666;
  cursor: pointer;
}
.cat-search {
  margin-bottom: 8px;
}
.cat-list {
  font-size: 13px;
}
.cat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
}
.cat-item:hover {
  background: #f5f5f5;
}
.tag-main {
  flex: 1;
  min-width: 0;
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
