<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { fetchCallHistory } from '../api'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const filters = ref({
  executor: 'ext.chenyunlei1',
  requestType: 'HTTP',
  address: '',
  methodName: '',
  dateRange: [],
  fuzzyMatch: false
})

const tableData = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

async function loadData() {
  loading.value = true
  try {
    const resp = await fetchCallHistory({
      page: page.value,
      page_size: pageSize.value,
      ...filters.value
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
  filters.value = {
    executor: '',
    requestType: 'HTTP',
    address: '',
    methodName: '',
    dateRange: [],
    fuzzyMatch: false
  }
  handleSearch()
}

function handleClose() {
  visible.value = false
}

const methodColorMap = {
  GET: '#52c41a',
  POST: '#faad14',
  PUT: '#722ed1',
  PATCH: '#a0522d',
  DELETE: '#f5222d'
}

function methodColor(m) {
  return methodColorMap[m?.toUpperCase()] || '#333'
}
</script>

<template>
  <el-drawer v-model="visible" title="接口调用记录" size="85%" @open="loadData">
    <div class="history-drawer-body">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-input v-model="filters.executor" placeholder="执行人" clearable style="width: 140px" />
        <el-select v-model="filters.requestType" placeholder="请求类型" style="width: 120px">
          <el-option label="HTTP" value="HTTP" />
          <el-option label="JSF" value="JSF" />
          <el-option label="MYSQL" value="MYSQL" />
        </el-select>
        <el-input v-model="filters.address" placeholder="支持接口地址的关键字查询" clearable style="width: 200px" />
        <el-input v-model="filters.methodName" placeholder="方法名模糊查询" clearable style="width: 160px" />
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="→"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 220px"
        />
        <el-checkbox v-model="filters.fuzzyMatch">模糊匹配</el-checkbox>
        <el-button type="primary" :loading="loading" @click="handleSearch">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" size="small" stripe style="width: 100%">
        <el-table-column prop="id" label="调用ID" width="80" />
        <el-table-column label="接口地址" min-width="240">
          <template #default="{ row }">
            <span :style="{ color: methodColor(row.method), fontWeight: 600 }">{{ row.method }}</span>
            <span style="margin-left: 6px">{{ row.url }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ipPort" label="Ip:Port" width="120" />
        <el-table-column prop="executor" label="执行人" width="120" />
        <el-table-column prop="executeTime" label="执行时间" width="140" />
        <el-table-column prop="duration" label="耗时" width="80" />
        <el-table-column prop="params" label="入参" min-width="140" show-overflow-tooltip />
        <el-table-column prop="response" label="响应" min-width="140" show-overflow-tooltip />
        <el-table-column prop="compareResult" label="比对结果" width="90" />
        <el-table-column prop="assertion" label="断言" width="70" />
        <el-table-column label="操作" width="70" fixed="right">
          <template #default>
            <el-link type="primary" :underline="false">回调</el-link>
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
  </el-drawer>
</template>

<style scoped>
.history-drawer-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.pagination-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}
</style>
