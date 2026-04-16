<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import TaskListTable from '../components/TaskListTable.vue'
import { useTaskMgmtStore } from '../stores/useTaskMgmtStore.js'
import { fetchTaskList } from '../api/index.js'

const emit = defineEmits(['add'])

const taskStore = useTaskMgmtStore()

const searchForm = reactive({
  keyword: '',
  execType: '',
  onlyMine: false,
  tempTaskHidden: true
})

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(50)
const selectedRows = ref([])

async function loadData() {
  loading.value = true
  try {
    const resp = await fetchTaskList({
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
  searchForm.keyword = ''
  searchForm.execType = ''
  searchForm.onlyMine = false
  searchForm.tempTaskHidden = true
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

function handleSelectionChange(val) {
  selectedRows.value = val
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="task-list-view">
    <el-form inline class="search-form">
      <el-form-item label="关键字：">
        <el-input
          v-model="searchForm.keyword"
          placeholder="支持名称/erp模糊查询"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="执行方式：">
        <el-select v-model="searchForm.execType" placeholder="请选择" clearable style="width: 140px">
          <el-option label="手动执行" value="手动执行" />
          <el-option label="周期执行" value="周期执行" />
        </el-select>
      </el-form-item>
      <el-form-item label="只看自己：">
        <el-checkbox v-model="searchForm.onlyMine" />
      </el-form-item>
      <el-form-item label="临时任务：">
        <el-switch
          v-model="searchForm.tempTaskHidden"
          inline-prompt
          active-text="隐藏"
          inactive-text="显示"
          style="--el-switch-on-color: #1890ff; --el-switch-off-color: #d9d9d9"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="emit('add')">新增</el-button>
      <el-button>批量操作</el-button>
    </div>

    <TaskListTable
      :data="tableData"
      :loading="loading"
      @selection-change="handleSelectionChange"
    />

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
.task-list-view {
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
