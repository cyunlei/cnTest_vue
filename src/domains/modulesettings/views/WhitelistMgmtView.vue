<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Download } from '@element-plus/icons-vue'
import { fetchWhitelistList } from '../api/index.js'

const activeTab = ref('method')
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const searchForm = ref({ keyword: '', apiType: '', status: '', creator: '' })

async function loadData() {
  loading.value = true
  try {
    const resp = await fetchWhitelistList({ tab: activeTab.value, ...searchForm.value })
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
  searchForm.value = { keyword: '', apiType: '', status: '', creator: '' }
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
  <div class="whitelist-mgmt-view">
    <h2 class="page-title">白名单管理</h2>
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="方法" name="method" />
      <el-tab-pane label="入参" name="param" />
    </el-tabs>
    <div class="search-bar">
      <el-form inline>
        <el-form-item label="关键字：">
          <el-input v-model="searchForm.keyword" placeholder="关键字" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="接口类型：">
          <el-select v-model="searchForm.apiType" placeholder="类型" clearable style="width: 120px">
            <el-option label="HTTP" value="HTTP" />
            <el-option label="JSF" value="JSF" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态：">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="已过期" value="已过期" />
            <el-option label="已生效" value="已生效" />
            <el-option label="审批中" value="审批中" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建人：">
          <el-select v-model="searchForm.creator" placeholder="请输入ERP,支持自动补全" clearable style="width: 200px">
            <el-option label="tianhuiying1" value="tianhuiying1" />
            <el-option label="ext.qinbo9" value="ext.qinbo9" />
            <el-option label="fengyiao.1" value="fengyiao.1" />
            <el-option label="ext.guowujie6" value="ext.guowujie6" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="toolbar">
      <el-button type="primary" :icon="Plus">新增</el-button>
      <el-button :icon="Download">批量导入</el-button>
    </div>
    <el-table :data="tableData" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="编号" min-width="80" />
      <el-table-column prop="type" label="类型" min-width="80" />
      <el-table-column prop="apiName" label="接口名称" min-width="240" show-overflow-tooltip />
      <el-table-column prop="methodName" label="方法名称" min-width="120" />
      <el-table-column prop="expireTime" label="过期时间" min-width="110" />
      <el-table-column prop="status" label="状态" min-width="90">
        <template #default="{ row }">
          <el-tag v-if="row.status === '已生效'" type="success" size="small">{{ row.status }}</el-tag>
          <el-tag v-else-if="row.status === '已过期'" type="danger" size="small">{{ row.status }}</el-tag>
          <el-tag v-else type="warning" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="creator" label="创建人" min-width="120" />
      <el-table-column prop="createdAt" label="创建时间" min-width="150" />
      <el-table-column label="操作" min-width="120" fixed="right">
        <template #default="{ row }">
          <div class="action-btns">
            <a v-if="row.status === '审批中'" class="action-link" href="javascript:;">审批</a>
            <a v-if="row.status === '已过期'" class="action-link" href="javascript:;">延期</a>
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
.whitelist-mgmt-view {
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
