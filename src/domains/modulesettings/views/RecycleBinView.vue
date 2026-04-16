<script setup>
import { ref, reactive } from 'vue'
import { RefreshRight, Calendar } from '@element-plus/icons-vue'

const activeTab = ref('case') // 'case' | 'task'

const searchForm = reactive({
  keyword: '',
  owner: '',
  deleteStart: '2026-04-09',
  deleteEnd: '2026-04-16'
})

const caseData = ref([])
const taskData = ref([])

const caseColumns = [
  { prop: 'id', label: '编号', width: 100 },
  { prop: 'name', label: '名称', minWidth: 200 },
  { prop: 'caseSet', label: '所属用例集', minWidth: 180 },
  { prop: 'arrange', label: '编排', width: 100 },
  { prop: 'owner', label: '负责人', width: 120 },
  { prop: 'operator', label: '操作人', width: 120 },
  { prop: 'deletedAt', label: '删除时间', width: 160 },
  { prop: 'action', label: '操作', width: 100, fixed: 'right' }
]

const taskColumns = [
  { prop: 'id', label: '编号', width: 100 },
  { prop: 'name', label: '名称', minWidth: 200 },
  { prop: 'owner', label: '负责人', width: 120 },
  { prop: 'operator', label: '操作人', width: 120 },
  { prop: 'deletedAt', label: '删除时间', width: 160 },
  { prop: 'action', label: '操作', width: 100, fixed: 'right' }
]

function handleQuery() {}
function handleReset() {
  searchForm.keyword = ''
  searchForm.owner = ''
  searchForm.deleteStart = ''
  searchForm.deleteEnd = ''
}
function batchRecover() {}
</script>

<template>
  <div class="recycle-bin-view">
    <h2 class="page-title">回收站</h2>

    <!-- Tabs -->
    <div class="bin-tabs">
      <div
        :class="['bin-tab-item', { active: activeTab === 'case' }]"
        @click="activeTab = 'case'"
      >
        用例
      </div>
      <div
        :class="['bin-tab-item', { active: activeTab === 'task' }]"
        @click="activeTab = 'task'"
      >
        任务
      </div>
    </div>

    <!-- 搜索区 -->
    <div class="search-bar">
      <div class="search-item">
        <label>关键字:</label>
        <el-input v-model="searchForm.keyword" placeholder="关键字" style="width: 200px" />
      </div>
      <div class="search-item">
        <label>负责人:</label>
        <el-select v-model="searchForm.owner" placeholder="请输入 ERP, 支持自动补全" style="width: 240px">
          <el-option label="全部" value="" />
        </el-select>
      </div>
      <div class="search-item">
        <label>删除时间:</label>
        <el-date-picker
          v-model="searchForm.deleteStart"
          type="date"
          placeholder="开始日期"
          style="width: 130px"
          value-format="YYYY-MM-DD"
        />
        <span class="date-sep">→</span>
        <el-date-picker
          v-model="searchForm.deleteEnd"
          type="date"
          placeholder="结束日期"
          style="width: 130px"
          value-format="YYYY-MM-DD"
        />
        <el-icon class="calendar-icon"><Calendar /></el-icon>
      </div>
      <div class="search-actions">
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button link type="primary" @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 批量操作 -->
    <div class="batch-bar">
      <el-button :icon="RefreshRight" disabled>批量恢复</el-button>
    </div>

    <!-- 用例表格 -->
    <el-table
      v-if="activeTab === 'case'"
      :data="caseData"
      style="width: 100%"
      empty-text="暂无数据"
      class="bin-table"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column
        v-for="col in caseColumns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :fixed="col.fixed"
      />
    </el-table>

    <!-- 任务表格 -->
    <el-table
      v-else
      :data="taskData"
      style="width: 100%"
      empty-text="暂无数据"
      class="bin-table"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column
        v-for="col in taskColumns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :fixed="col.fixed"
      />
    </el-table>
  </div>
</template>

<style scoped>
.recycle-bin-view {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  min-height: 600px;
}

.page-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 12px 0;
}

.bin-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
}

.bin-tab-item {
  padding: 6px 16px;
  font-size: 14px;
  color: #606266;
  background: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.bin-tab-item:hover {
  color: #409eff;
}

.bin-tab-item.active {
  background: #fff;
  color: #333;
  font-weight: 500;
  border: 1px solid #e4e7ed;
}

.search-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.search-item label {
  white-space: nowrap;
}

.date-sep {
  color: #c0c4cc;
  font-size: 12px;
}

.calendar-icon {
  font-size: 14px;
  color: #909399;
  margin-left: 4px;
}

.search-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-bar {
  margin-bottom: 12px;
}

.bin-table {
  --el-table-header-bg-color: #fafafa;
}
</style>
