<script setup>
import { ref, reactive, onMounted } from 'vue'
import DateRangeInput from '@/shared/ui/molecules/DateRangeInput.vue'
import TaskMonitorTable from '../components/TaskMonitorTable.vue'
import { fetchTaskMonitorList } from '../api/index.js'

const searchForm = reactive({
  taskName: '',
  dateRange: ['', ''],
  stepName: '',
  caseName: '',
  owner: '',
  status: '',
  reason: '',
  correctRateMin: '',
  correctRateMax: '',
  onlyMine: false
})

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(50)

async function loadData() {
  loading.value = true
  try {
    const resp = await fetchTaskMonitorList({
      page: page.value,
      page_size: pageSize.value,
      ...searchForm
    })
    const data = resp?.data?.data || {}
    tableData.value = data.list || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handleReset() {
  searchForm.taskName = ''
  searchForm.dateRange = ['', '']
  searchForm.stepName = ''
  searchForm.caseName = ''
  searchForm.owner = ''
  searchForm.status = ''
  searchForm.reason = ''
  searchForm.correctRateMin = ''
  searchForm.correctRateMax = ''
  searchForm.onlyMine = false
  page.value = 1
  loadData()
}

function handlePageChange(val) {
  page.value = val
  loadData()
}

function handlePageSizeChange(val) {
  pageSize.value = val
  page.value = 1
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="task-monitor-view">
    <el-form inline class="search-form">
      <el-form-item label="任务名称：">
        <el-input v-model="searchForm.taskName" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="日期：">
        <DateRangeInput v-model="searchForm.dateRange" />
      </el-form-item>
      <el-form-item label="步骤名称：">
        <el-input v-model="searchForm.stepName" clearable style="width: 160px" />
      </el-form-item>
      <el-form-item label="用例名称：">
        <el-input v-model="searchForm.caseName" clearable style="width: 160px" />
      </el-form-item>
      <el-form-item label="责任人：">
        <el-select v-model="searchForm.owner" placeholder="请输入 ERP,支持自动补全" clearable style="width: 180px">
          <el-option label="lubo24" value="lubo24" />
          <el-option label="bjkeqinqin" value="bjkeqinqin" />
          <el-option label="ext.lizhigang10" value="ext.lizhigang10" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态：">
        <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
          <el-option label="未处理" value="未处理" />
          <el-option label="已处理" value="已处理" />
        </el-select>
      </el-form-item>
      <el-form-item label="异常原因：">
        <el-input v-model="searchForm.reason" clearable style="width: 160px" />
      </el-form-item>
      <el-form-item label="正确率：">
        <div class="rate-inputs">
          <el-input v-model="searchForm.correctRateMin" style="width: 60px" />
          <span class="rate-sep">%</span>
          <span class="rate-dash">~</span>
          <el-input v-model="searchForm.correctRateMax" style="width: 60px" />
          <span class="rate-sep">%</span>
        </div>
      </el-form-item>
      <el-form-item label="只看自己：">
        <el-checkbox v-model="searchForm.onlyMine" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="toolbar">
      <el-button>批量重标注</el-button>
      <el-button>明细导出</el-button>
    </div>

    <TaskMonitorTable :data="tableData" :loading="loading" />

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.task-monitor-view {
  background: #fff;
}
.search-form {
  margin-bottom: 12px;
}
.search-form :deep(.el-form-item) {
  margin-bottom: 12px;
  margin-right: 16px;
}
.search-form :deep(.el-form-item__label) {
  font-size: 13px;
  color: #666;
}
.rate-inputs {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.rate-sep {
  font-size: 13px;
  color: #666;
}
.rate-dash {
  font-size: 13px;
  color: #999;
  margin: 0 4px;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
