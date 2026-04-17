<script setup>
import { ref, computed } from 'vue'
import { RefreshRight, Folder, Search } from '@element-plus/icons-vue'
import { fetchMyInterfaces, fetchAllInterfaces } from '../api'

const props = defineProps({
  mode: { type: String, default: 'my' } // 'my' | 'all'
})

const filters = ref({
  keyword: '',
  module: '',
  type: '全部',
  owner: ''
})

const appList = ref([
  { name: '全部', count: 5212, percent: 57.9, color: '#faad14' },
  { name: '无应用', count: 4587, percent: 0, color: '#f5222d' },
  { name: 'cf-coupon', count: 1, percent: 0, color: '#f5222d' },
  { name: 'advisory-center', count: 2, percent: 100, color: '#52c41a' },
  { name: 'afsfp.afs-new', count: 1, percent: 100, color: '#52c41a' }
])
const selectedApp = ref('全部')

const tableData = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(50)
const total = ref(0)

async function loadData() {
  loading.value = true
  try {
    const api = props.mode === 'my' ? fetchMyInterfaces : fetchAllInterfaces
    const resp = await api({
      page: page.value,
      page_size: pageSize.value,
      ...filters.value,
      app: selectedApp.value === '全部' ? '' : selectedApp.value
    })
    const data = resp?.data?.data ?? {}
    tableData.value = data.list || []
    total.value = data.total || 0
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handleReset() {
  filters.value = { keyword: '', module: '', type: '全部', owner: '' }
  selectedApp.value = '全部'
  handleSearch()
}

function handleAppClick(app) {
  selectedApp.value = app.name
  handleSearch()
}

const typeTagColor = {
  HTTP: '#faad14',
  JSF: '#1890ff'
}
</script>

<template>
  <div class="my-interface-table">
    <!-- 左侧应用树 -->
    <aside class="app-tree">
      <div class="tree-header">
        <span>应用列表</span>
        <el-icon class="refresh-icon"><RefreshRight /></el-icon>
      </div>
      <div class="tree-list">
        <div
          v-for="app in appList"
          :key="app.name"
          class="tree-item"
          :class="{ active: selectedApp === app.name }"
          @click="handleAppClick(app)"
        >
          <el-icon class="folder-icon"><Folder /></el-icon>
          <span class="app-name">{{ app.name }} ({{ app.count }})</span>
          <el-tag :type="app.percent >= 80 ? 'success' : app.percent > 0 ? 'warning' : 'danger'" size="small" class="percent-tag">
            {{ app.percent }}%
          </el-tag>
        </div>
      </div>
    </aside>

    <!-- 右侧内容 -->
    <div class="table-area">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">关键字:</span>
          <el-input v-model="filters.keyword" placeholder="支持模糊查询" clearable style="width: 160px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">模块:</span>
          <el-select v-model="filters.module" placeholder="请选择模块" clearable style="width: 160px">
            <el-option label="公共模块" value="公共模块" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">类型:</span>
          <el-select v-model="filters.type" placeholder="全部" style="width: 120px">
            <el-option label="全部" value="全部" />
            <el-option label="HTTP" value="HTTP" />
            <el-option label="JSF" value="JSF" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">负责人:</span>
          <el-input v-model="filters.owner" placeholder="请输入ERP,支持自动补全" clearable style="width: 180px" />
        </div>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button>批量修改</el-button>
        <el-button>删除</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" size="small" stripe style="width: 100%">
        <el-table-column type="expand" width="40" />
        <el-table-column type="selection" width="40" />
        <el-table-column label="接口地址" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.url || row.address || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="接口名称" min-width="160" show-overflow-tooltip />
        <el-table-column label="接口类型" width="90">
          <template #default="{ row }">
            <el-tag :color="typeTagColor[row.type] || '#999'" effect="dark" size="small">
              {{ row.type || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="app" label="应用" width="100" />
        <el-table-column prop="refCount" label="引用数" width="80" />
        <el-table-column prop="owner" label="负责人" width="100" />
        <el-table-column prop="tags" label="标签" width="80" />
        <el-table-column prop="updateTime" label="更新时间" width="140" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default>
            <el-link type="primary" :underline="false" class="op-link">调用</el-link>
            <el-link type="primary" :underline="false" class="op-link">编辑</el-link>
            <el-link type="primary" :underline="false" class="op-link">删除</el-link>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, prev, pager, next, sizes"
          @change="loadData"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-interface-table {
  display: flex;
  height: 100%;
  gap: 12px;
}
.app-tree {
  width: 220px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 12px;
  overflow-y: auto;
}
.tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}
.refresh-icon {
  font-size: 14px;
  color: #999;
  cursor: pointer;
}
.tree-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.tree-item:hover,
.tree-item.active {
  background: #e6f7ff;
}
.folder-icon {
  color: #faad14;
  font-size: 14px;
}
.app-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.percent-tag {
  font-size: 11px;
  height: 18px;
  line-height: 16px;
  padding: 0 4px;
}
.table-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fff;
  padding: 12px;
}
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.filter-label {
  font-size: 13px;
  color: #606266;
}
.toolbar {
  display: flex;
  gap: 8px;
}
.op-link {
  margin-right: 8px;
  font-size: 12px;
}
.pagination-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}
</style>
