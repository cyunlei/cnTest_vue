<script setup>
import { computed, ref, watch } from 'vue'
import AppPagination from '@/shared/ui/organisms/AppPagination.vue'
import DateRangeInput from '@/shared/ui/molecules/DateRangeInput.vue'
import { fetchExecutionList, fetchExecutionDetail } from '../api'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  step: {
    type: Object,
    default: null
  },
  testcaseId: {
    type: [Number, String],
    default: ''
  },
  testcaseName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'close'])

const localVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value)
})

const filterForm = ref({
  keyword: '',
  type: '',
  executor: '',
  startDate: '',
  endDate: ''
})
const autoRefresh = ref(false)
const recordPage = ref(1)
const recordPageSize = ref(20)
const recordTotal = ref(0)
const recordPageSizeOptions = [20, 50, 100]
const loading = ref(false)
const batchRows = ref([])
const expandedRows = ref(new Set())
const stepListMap = ref(new Map())
const stepListLoading = ref(new Set())
const expandedStepDetails = ref(new Set())

// 步骤详情标签页状态
const stepDetailTabs = ref(new Map())

function getStepTabKey(rowId, stepId) {
  return `${rowId}-${stepId}`
}

function getActiveRequestTab(rowId, stepId) {
  return stepDetailTabs.value.get(`req-${getStepTabKey(rowId, stepId)}`) || 'body'
}

function setActiveRequestTab(rowId, stepId, tab) {
  stepDetailTabs.value.set(`req-${getStepTabKey(rowId, stepId)}`, tab)
}

function getActiveResponseTab(rowId, stepId) {
  return stepDetailTabs.value.get(`resp-${getStepTabKey(rowId, stepId)}`) || 'body'
}

function setActiveResponseTab(rowId, stepId, tab) {
  stepDetailTabs.value.set(`resp-${getStepTabKey(rowId, stepId)}`, tab)
}

// 步骤列表筛选和搜索状态
const stepSearchKeyword = ref('')
const stepFilterIncorrect = ref(false)
const stepExpandedAll = ref(false)
const selectedSteps = ref(new Set())

// 失败原因标注
const failureReasonOptions = [
  { label: '工具平台问题', value: 'platform' },
  { label: '环境问题', value: 'environment' },
  { label: '物料问题', value: 'material' },
  { label: '数据问题', value: 'data' },
  { label: '其他', value: 'other' }
]
const showFailureReasonPopover = ref(false)
const selectedFailureReason = ref('')
const failureReasonNote = ref('')

function toggleStepSelection(rowId, stepId) {
  const key = `${rowId}-${stepId}`
  if (selectedSteps.value.has(key)) {
    selectedSteps.value.delete(key)
  } else {
    selectedSteps.value.add(key)
  }
}

function toggleExpandAllSteps(rowId) {
  const steps = stepListMap.value.get(rowId) || []
  const allExpanded = steps.every(step => expandedStepDetails.value.has(`${rowId}-${step.id || step.step_id}`))

  if (allExpanded) {
    // 全部收起
    steps.forEach(step => {
      expandedStepDetails.value.delete(`${rowId}-${step.id || step.step_id}`)
    })
    stepExpandedAll.value = false
  } else {
    // 全部展开
    steps.forEach(step => {
      expandedStepDetails.value.add(`${rowId}-${step.id || step.step_id}`)
    })
    stepExpandedAll.value = true
  }
}

function handleStepSearch() {
  // 搜索功能触发重新渲染
  stepExpandedAll.value = false
}

function handleStepReset() {
  stepSearchKeyword.value = ''
  stepFilterIncorrect.value = false
  stepExpandedAll.value = false
}

function submitFailureReason() {
  // 提交失败原因标注
  showFailureReasonPopover.value = false
  selectedFailureReason.value = ''
  failureReasonNote.value = ''
}

function openFullscreen(step) {
  // 全屏展示步骤详情
  console.log('Fullscreen:', step)
}

function openLogWindow(step) {
  // 新窗口打开执行日志
  console.log('Log:', step)
}

function retryStep(step) {
  // 步骤重试
  console.log('Retry:', step)
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fillDefaultRecent7Days() {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - 6)
  filterForm.value.startDate = formatDate(start)
  filterForm.value.endDate = formatDate(today)
}

watch(
  () => props.visible,
  visible => {
    if (!visible) return
    fillDefaultRecent7Days()
    void loadExecutionBatches()
  },
  { immediate: true }
)

function handleClose() {
  localVisible.value = false
  emit('close')
}

function handleReset() {
  filterForm.value.keyword = ''
  filterForm.value.type = ''
  filterForm.value.executor = ''
  fillDefaultRecent7Days()
  recordPage.value = 1
  void loadExecutionBatches()
}

function handleQuery() {
  recordPage.value = 1
  void loadExecutionBatches()
}

function handleRecordPageChange(page) {
  recordPage.value = page
  void loadExecutionBatches()
}

function handleRecordPageSizeChange(size) {
  recordPageSize.value = size
  recordPage.value = 1
  void loadExecutionBatches()
}

const tableRef = ref(null)
const resizingCol = ref(null)
const startX = ref(0)
const startWidth = ref(0)

function initResize(e) {
  const th = e.target.closest('th')
  if (!th) return

  resizingCol.value = th
  startX.value = e.clientX
  startWidth.value = th.offsetWidth

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

function handleResize(e) {
  if (!resizingCol.value) return
  const diff = e.clientX - startX.value
  const newWidth = Math.max(60, startWidth.value + diff)
  resizingCol.value.style.width = `${newWidth}px`
  resizingCol.value.style.minWidth = `${newWidth}px`
}

function stopResize() {
  resizingCol.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// 步骤表格列宽调整
const stepTableRef = ref(null)
const stepResizingCol = ref(null)
const stepStartX = ref(0)
const stepStartWidth = ref(0)

function initStepResize(e, colIndex) {
  const th = e.target.closest('th')
  if (!th) return

  stepResizingCol.value = th
  stepStartX.value = e.clientX
  stepStartWidth.value = th.offsetWidth

  document.addEventListener('mousemove', handleStepResize)
  document.addEventListener('mouseup', stopStepResize)
}

function handleStepResize(e) {
  if (!stepResizingCol.value) return
  const diff = e.clientX - stepStartX.value
  const newWidth = Math.max(40, stepStartWidth.value + diff)
  stepResizingCol.value.style.width = `${newWidth}px`
  stepResizingCol.value.style.minWidth = `${newWidth}px`
}

function stopStepResize() {
  stepResizingCol.value = null
  document.removeEventListener('mousemove', handleStepResize)
  document.removeEventListener('mouseup', stopStepResize)
}

function toggleStepDetail(stepKey) {
  if (expandedStepDetails.value.has(stepKey)) {
    expandedStepDetails.value.delete(stepKey)
  } else {
    expandedStepDetails.value.add(stepKey)
  }
}

function formatJson(obj) {
  if (!obj) return ''
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

/**
 * 获取步骤的期望值
 * 支持多种可能的字段名：expected_response / expect_result / expected_result / expectResult
 */
function getStepExpectedResponse(step) {
  if (!step) return ''
  return step.expected_response ?? step.expect_result ?? step.expected_result ?? step.expectResult ?? ''
}

/**
 * 获取步骤的实际入参
 * 支持多种可能的字段名：actual_input / request_body / actual_request / input_params
 */
function getStepActualInput(step) {
  if (!step) return ''
  return step.actual_input ?? step.request_body ?? step.actual_request ?? step.input_params ?? ''
}

async function toggleExpand(rowId, batchId) {
  if (expandedRows.value.has(rowId)) {
    expandedRows.value.delete(rowId)
    return
  }
  expandedRows.value.add(rowId)

  // 如果已经有缓存的步骤数据，不再请求
  if (stepListMap.value.has(rowId)) return

  // 使用 batch_id 查询执行详情
  if (!batchId) return

  stepListLoading.value.add(rowId)
  try {
    const resp = await fetchExecutionDetail({ batch_id: batchId })
    const data = resp?.data?.data || {}
    const steps = Array.isArray(data?.steps) ? data.steps : []
    stepListMap.value.set(rowId, steps)
  } catch (error) {
    void error
    stepListMap.value.set(rowId, [])
  } finally {
    stepListLoading.value.delete(rowId)
  }
}

async function loadExecutionBatches() {
  const testcaseIdNum = Number(props.testcaseId || props.step?.testcaseId || props.step?.testcase_id)
  if (!Number.isFinite(testcaseIdNum) || testcaseIdNum <= 0) {
    batchRows.value = []
    recordTotal.value = 0
    return
  }
  const requestParams = {
    testcase_id: testcaseIdNum,
    page: recordPage.value,
    page_size: recordPageSize.value
  }
  loading.value = true
  try {
    const resp = await fetchExecutionList(requestParams)
    const data = resp?.data?.data || {}
    const list = Array.isArray(data?.list) ? data.list : []
    batchRows.value = list.map((item) => {
      // 执行类型：execution_type（0=手动，1=自动）
      const typeMap = { 0: '手动', 1: '自动' }
      // 环境：env_code（0=测试，1=预发，2=生产）
      const envMap = { 0: '测试站', 1: '预发站', 2: '生产站' }
      return {
        id: item.id,
        batchId: item.batch_id || '-',
        testcaseId: item.testcase_id || testcaseIdNum,
        status: item.status ?? 2,
        statusLabel: item.status_label || '完成',
        testcaseName: item.testcase_name || '-',
        type: typeMap[item.execution_type] ?? '手动',
        environment: envMap[item.env_code] ?? '测试站',
        executor: item.user_name || 'ext.chenyunlei1',
        source: item.source || '系统',
        durationSec: Math.round(Number(item.total_duration_ms ?? 0) / 1000) || 0,
        createdAt: item.created_at || '-',
        stepResult: `${Number(item.total_steps ?? 1) || 1} [${Number(item.passed_steps ?? 0) || 0}/${Number(item.total_steps ?? 1) || 1}]`
      }
    })
    recordTotal.value = Number(data?.total ?? list.length ?? 0) || 0
    recordPage.value = Number(data?.page ?? recordPage.value) || 1
    recordPageSize.value = Number(data?.page_size ?? recordPageSize.value) || recordPageSize.value
  } catch (error) {
    void error
    batchRows.value = []
    recordTotal.value = 0
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <teleport to="body">
    <Transition name="drawer-slide">
      <div v-if="localVisible" class="drawer-mask" @click.self="handleClose">
        <div class="drawer-panel">
        <div class="drawer-head">
          <div class="drawer-title-wrap">
            <div class="drawer-title">用例执行记录</div>
            <span class="v-divider" />
            <span class="header-item">用例ID: <mark>{{ testcaseId || '-' }}</mark></span>
            <span class="header-item">名称: <a href="javascript:;" class="name-link">{{ testcaseName || '-' }}</a></span>
            <span class="v-divider" />
            <label class="auto-open-tab">
              <input type="checkbox" />
              新标签页打开执行结果
            </label>
            <button class="header-mini-btn" type="button" disabled>关联行云需求</button>
          </div>
          <div class="drawer-head-right">
            <label class="auto-refresh">
              <input v-model="autoRefresh" type="checkbox" />
              自动刷新
            </label>
            <span class="refresh-icon" :class="{ 'is-spinning': loading }" @click="loadExecutionBatches">
              <svg viewBox="0 0 1024 1024" width="14" height="14">
                <path fill="currentColor" d="M832 512a32 32 0 0 0-32 32c0 158.784-129.216 288-288 288s-288-129.216-288-288 129.216-288 288-288c66.208 0 127.264 22.688 176.128 60.672L544 448h224V224l-73.6 73.6C629.856 241.472 545.152 192 448 192 264.96 192 128 328.96 128 512s136.96 320 320 320 320-136.96 320-320a32 32 0 0 0-32-32z"/>
              </svg>
            </span>
          </div>
        </div>
        <div class="step-exec-drawer">
      <div class="step-exec-toolbar">
        <div class="toolbar-left">
          <div class="filter-item">
            <label>关键字:</label>
            <input v-model="filterForm.keyword" type="text" placeholder="支持编号/名称等关键字查询" />
          </div>
          <div class="filter-item filter-item--select">
            <label>执行类型:</label>
            <select v-model="filterForm.type" class="execute-type-select">
              <option value="">全部</option>
              <option value="manual">手动</option>
              <option value="auto">自动</option>
              <option value="schedule">定时</option>
            </select>
          </div>
          <div class="filter-item">
            <label>执行人:</label>
            <input v-model="filterForm.executor" type="text" placeholder="请输入 ERP,支持自动补全" />
          </div>
          <div class="filter-item filter-item--date">
            <label>日期:</label>
            <DateRangeInput
              :start-date="filterForm.startDate"
              :end-date="filterForm.endDate"
              @update:start-date="value => (filterForm.startDate = value)"
              @update:end-date="value => (filterForm.endDate = value)"
            />
          </div>
        </div>
        <div class="toolbar-right">
          <button class="btn btn--primary" type="button" @click="handleQuery">
            <svg class="btn-icon" viewBox="0 0 1024 1024" width="14" height="14">
              <path fill="currentColor" d="M909.6 854.5L649.5 594.4C691.8 542.3 704 480.3 704 416c0-158.8-129.2-288-288-288S128 257.2 128 416s129.2 288 288 288c64.3 0 126.3-12.1 178.4-54.4l260.1 260.1c9.2 9.2 24.1 9.2 33.3 0l29.8-29.8c9.2-9.2 9.2-24.1 0-33.4zM416 640c-123.7 0-224-100.3-224-224S292.3 192 416 192s224 100.3 224 224-100.3 224-224 224z"/>
            </svg>
            查询
          </button>
          <button class="btn" type="button" @click="handleReset">重置</button>
        </div>
      </div>

      <div class="step-exec-table">
        <table>
          <thead>
            <tr>
              <th class="col-expand"></th>
              <th class="col-checkbox"><input type="checkbox" /></th>
              <th class="col-id resizable">
                <span class="th-content">编号</span>
                <span class="resize-handle" @mousedown="initResize($event, 2)"></span>
              </th>
              <th class="col-status resizable">
                <span class="th-content">状态</span>
                <span class="resize-handle" @mousedown="initResize($event, 3)"></span>
              </th>
              <th class="col-name resizable">
                <span class="th-content">名称</span>
                <span class="resize-handle" @mousedown="initResize($event, 4)"></span>
              </th>
              <th class="col-type resizable">
                <span class="th-content">类型</span>
                <span class="resize-handle" @mousedown="initResize($event, 5)"></span>
              </th>
              <th class="col-env resizable">
                <span class="th-content">环境</span>
                <span class="resize-handle" @mousedown="initResize($event, 6)"></span>
              </th>
              <th class="col-executor resizable">
                <span class="th-content">执行人</span>
                <span class="resize-handle" @mousedown="initResize($event, 7)"></span>
              </th>
              <th class="col-source resizable">
                <span class="th-content">来源</span>
                <span class="resize-handle" @mousedown="initResize($event, 8)"></span>
              </th>
              <th class="col-duration resizable">
                <span class="th-content">耗时(秒)</span>
                <span class="resize-handle" @mousedown="initResize($event, 9)"></span>
              </th>
              <th class="col-time resizable">
                <span class="th-content">执行时间</span>
                <span class="resize-handle" @mousedown="initResize($event, 10)"></span>
              </th>
              <th class="col-result resizable">
                <span class="th-content">步骤结果 <span class="hint-icon">?</span></span>
                <span class="resize-handle" @mousedown="initResize($event, 11)"></span>
              </th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr>
                <td colspan="13" class="empty-cell">加载中...</td>
              </tr>
            </template>
            <template v-else-if="batchRows.length === 0">
              <tr>
                <td colspan="13" class="empty-cell">暂无执行记录</td>
              </tr>
            </template>
            <template v-else v-for="row in batchRows" :key="row.id">
              <!-- 主行 -->
              <tr class="data-row">
                <td class="col-expand">
                  <span
                    class="expand-icon"
                    :class="{ 'is-expanded': expandedRows.has(row.id) }"
                    @click="toggleExpand(row.id, row.batchId)"
                  >
                    <svg v-if="!expandedRows.has(row.id)" viewBox="0 0 1024 1024" width="17.5" height="17.5">
                      <path fill="currentColor" d="M512 128C300.8 128 128 300.8 128 512s172.8 384 384 384 384-172.8 384-384S723.2 128 512 128z m0 64c176.8 0 320 143.2 320 320S688.8 832 512 832 192 688.8 192 512s143.2-320 320-320z M512 320a32 32 0 0 1 32 32v128h128a32 32 0 1 1 0 64h-128v128a32 32 0 1 1-64 0v-128h-128a32 32 0 1 1 0-64h128v-128a32 32 0 0 1 32-32z"/>
                    </svg>
                    <svg v-else viewBox="0 0 1024 1024" width="17.5" height="17.5">
                      <path fill="currentColor" d="M512 128C300.8 128 128 300.8 128 512s172.8 384 384 384 384-172.8 384-384S723.2 128 512 128z m0 64c176.8 0 320 143.2 320 320S688.8 832 512 832 192 688.8 192 512s143.2-320 320-320z M320 512a32 32 0 0 1 32-32h320a32 32 0 1 1 0 64h-320a32 32 0 0 1-32-32z"/>
                    </svg>
                  </span>
                </td>
                <td class="col-checkbox"><input type="checkbox" /></td>
                <td class="col-id">{{ row.batchId }}</td>
                <td class="col-status">
                  <span class="status-tag status-success">
                    <span class="status-dot"></span>
                    {{ row.statusLabel }}
                  </span>
                </td>
                <td class="col-name">
                  <a href="javascript:;" class="name-link">{{ row.testcaseName }}</a>
                </td>
                <td class="col-type">{{ row.type }}</td>
                <td class="col-env">{{ row.environment }}</td>
                <td class="col-executor">{{ row.executor }}</td>
                <td class="col-source">{{ row.source }}</td>
                <td class="col-duration">{{ row.durationSec }}</td>
                <td class="col-time">{{ row.createdAt }}</td>
                <td class="col-result">{{ row.stepResult }}</td>
                <td class="col-actions">
                  <div class="action-links">
                    <a href="javascript:;" class="action-link">报告</a>
                    <a href="javascript:;" class="action-link">日志</a>
                    <a href="javascript:;" class="action-link">只看错误</a>
                    <a href="javascript:;" class="action-link">失败重试</a>
                    <a href="javascript:;" class="action-link">提缺陷</a>
                  </div>
                </td>
              </tr>
              <!-- 展开行 - 步骤列表 -->
              <tr v-if="expandedRows.has(row.id)" class="expand-row">
                <td colspan="13" class="expand-cell">
                  <div class="step-list-container">
                    <div v-if="stepListLoading.has(row.id)" class="step-loading">加载步骤中...</div>
                    <div v-else-if="(stepListMap.get(row.id) || []).length === 0" class="step-empty">暂无步骤</div>
                    <div v-else class="step-list-wrapper">
                      <!-- 第一行：工具栏 -->
                      <div class="step-toolbar">
                        <div class="step-toolbar-left">
                          <input
                            v-model="stepSearchKeyword"
                            type="text"
                            class="step-search-input"
                            placeholder="搜索步骤"
                            @keyup.enter="handleStepSearch"
                          />
                          <button class="step-btn step-btn--primary" @click="handleStepSearch">搜索</button>
                          <button class="step-btn" @click="handleStepReset">重置</button>
                          <label class="step-checkbox-label">
                            <input v-model="stepFilterIncorrect" type="checkbox" />
                            不正确
                          </label>
                          <button class="step-btn" @click="toggleExpandAllSteps(row.id)">展开全部</button>
                        </div>
                        <div class="step-toolbar-right">
                          <span class="step-toolbar-icon" title="全屏" @click="openFullscreen">
                            <svg viewBox="0 0 1024 1024" width="16" height="16">
                              <path fill="currentColor" d="M160 96h192a32 32 0 0 1 0 64H192v128a32 32 0 0 1-64 0V128a32 32 0 0 1 32-32z m576 0h128a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V192h-128a32 32 0 0 1 0-64zM160 608a32 32 0 0 1 32 32v128h128a32 32 0 0 1 0 64H160a32 32 0 0 1-32-32v-192a32 32 0 0 1 32-32z m704 0a32 32 0 0 1 32 32v192a32 32 0 0 1-32 32h-192a32 32 0 0 1 0-64h128v-128a32 32 0 0 1 32-32z"/>
                            </svg>
                          </span>
                          <span class="step-toolbar-icon" title="日志" @click="openLogWindow">
                            <svg viewBox="0 0 1024 1024" width="16" height="16">
                              <path fill="currentColor" d="M832 192v640H192V192h640z m-64 64H256v512h512V256z M384 384h256v64H384v-64z M384 512h256v64H384v-64z M384 640h128v64H384v-64z"/>
                            </svg>
                          </span>
                          <span class="step-toolbar-icon" title="步骤重试" @click="retryStep">
                            <svg viewBox="0 0 1024 1024" width="16" height="16">
                              <path fill="currentColor" d="M832 512a32 32 0 0 0-32 32c0 158.784-129.216 288-288 288s-288-129.216-288-288 129.216-288 288-288c66.208 0 127.264 22.688 176.128 60.672L544 448h224V224l-73.6 73.6C629.856 241.472 545.152 192 448 192 264.96 192 128 328.96 128 512s136.96 320 320 320 320-136.96 320-320a32 32 0 0 0-32-32z"/>
                            </svg>
                          </span>
                          <div class="step-failure-reason">
                            <select v-model="selectedFailureReason" class="step-failure-select">
                              <option value="">失败原因标注</option>
                              <option v-for="option in failureReasonOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                            </select>
                            <div v-if="selectedFailureReason === 'other'" class="failure-reason-popover">
                              <textarea v-model="failureReasonNote" placeholder="详细原因描述" class="failure-reason-textarea"></textarea>
                              <div class="failure-reason-actions">
                                <button class="step-btn" @click="selectedFailureReason = ''">关闭</button>
                                <button class="step-btn step-btn--primary" @click="submitFailureReason">提交</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- 步骤列表表格 -->
                      <table class="step-list-table" ref="stepTableRef">
                        <thead>
                          <tr>
                            <th class="step-col-checkbox resizable">
                              <span class="th-content"><input type="checkbox" /></span>
                              <span class="resize-handle" @mousedown="initStepResize($event, 0)"></span>
                            </th>
                            <th class="step-col-name resizable">
                              <span class="th-content">步骤名称</span>
                              <span class="resize-handle" @mousedown="initStepResize($event, 1)"></span>
                            </th>
                            <th class="step-col-params resizable">
                              <span class="th-content">入参组</span>
                              <span class="resize-handle" @mousedown="initStepResize($event, 2)"></span>
                            </th>
                            <th class="step-col-content resizable">
                              <span class="th-content">执行内容</span>
                              <span class="resize-handle" @mousedown="initStepResize($event, 3)"></span>
                            </th>
                            <th class="step-col-time resizable">
                              <span class="th-content">执行时间</span>
                              <span class="resize-handle" @mousedown="initStepResize($event, 4)"></span>
                            </th>
                            <th class="step-col-compare-type resizable">
                              <span class="th-content">比对类型</span>
                              <span class="resize-handle" @mousedown="initStepResize($event, 5)"></span>
                            </th>
                            <th class="step-col-compare-result resizable">
                              <span class="th-content">比对结果</span>
                              <span class="resize-handle" @mousedown="initStepResize($event, 6)"></span>
                            </th>
                            <th class="step-col-fail-reason resizable">
                              <span class="th-content">失败原因</span>
                              <span class="resize-handle" @mousedown="initStepResize($event, 7)"></span>
                            </th>
                            <th class="step-col-duration resizable">
                              <span class="th-content">耗时(ms)</span>
                              <span class="resize-handle" @mousedown="initStepResize($event, 8)"></span>
                            </th>
                            <th class="step-col-actions resizable">
                              <span class="th-content">操作</span>
                              <span class="resize-handle" @mousedown="initStepResize($event, 9)"></span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <template v-for="step in stepListMap.get(row.id) || []" :key="step.id || step.step_id">
                            <!-- 步骤主行 -->
                            <tr class="step-row">
                              <td class="step-col-checkbox">
                                <input
                                  type="checkbox"
                                  :checked="selectedSteps.has(`${row.id}-${step.id || step.step_id}`)"
                                  @change="toggleStepSelection(row.id, step.id || step.step_id)"
                                />
                              </td>
                              <td class="step-col-name">
                                <span class="step-expand-icon-wrapper" @click="toggleStepDetail(`${row.id}-${step.id || step.step_id}`)">
                                  <svg
                                    v-if="!expandedStepDetails.has(`${row.id}-${step.id || step.step_id}`)"
                                    viewBox="0 0 1024 1024"
                                    width="14"
                                    height="14"
                                    class="step-expand-icon"
                                  >
                                    <path fill="currentColor" d="M512 128C300.8 128 128 300.8 128 512s172.8 384 384 384 384-172.8 384-384S723.2 128 512 128z m0 64c176.8 0 320 143.2 320 320S688.8 832 512 832 192 688.8 192 512s143.2-320 320-320z M512 320a32 32 0 0 1 32 32v128h128a32 32 0 1 1 0 64h-128v128a32 32 0 1 1-64 0v-128h-128a32 32 0 1 1 0-64h128v-128a32 32 0 0 1 32-32z"/>
                                  </svg>
                                  <svg
                                    v-else
                                    viewBox="0 0 1024 1024"
                                    width="14"
                                    height="14"
                                    class="step-expand-icon"
                                  >
                                    <path fill="currentColor" d="M512 128C300.8 128 128 300.8 128 512s172.8 384 384 384 384-172.8 384-384S723.2 128 512 128z m0 64c176.8 0 320 143.2 320 320S688.8 832 512 832 192 688.8 192 512s143.2-320 320-320z M320 512a32 32 0 0 1 32-32h320a32 32 0 1 1 0 64h-320a32 32 0 0 1-32-32z"/>
                                  </svg>
                                </span>
                                <a href="javascript:;" class="name-link">{{ step.step_name || '-' }}</a>
                              </td>
                              <td class="step-col-params">
                                <span v-if="step.input_params_groups && step.input_params_groups.length > 0" class="param-group-tag">
                                  {{ step.input_params_groups[0].group_name || '第1组' }}
                                </span>
                                <span v-else>-</span>
                              </td>
                              <td class="step-col-content">
                                <span class="http-method">{{ step.request_method || 'POST' }}</span>
                                <span class="http-url" :title="step.request_url">{{ step.request_url || '-' }}</span>
                              </td>
                              <td class="step-col-time">{{ step.start_time || '-' }}</td>
                              <td class="step-col-compare-type">
                                <span class="compare-type-tag" :class="{ 'ab-test': step.compare_type === 1 }">
                                  {{ step.compare_type === 1 ? 'A/B测试' : '正常比对' }}
                                </span>
                              </td>
                              <td class="step-col-compare-result">
                                <span
                                  class="compare-result-tag"
                                  :class="{
                                    'result-pass': step.status === 'success',
                                    'result-fail': step.status === 'failed' || step.status === 'error',
                                    'result-pending': step.status === 'pending' || step.status === 'running'
                                  }"
                                >
                                  {{ step.status === 'success' ? '通过' : step.status === 'failed' ? '失败' : step.status === 'error' ? '错误' : step.status === 'running' ? '执行中' : '待执行' }}
                                </span>
                              </td>
                              <td class="step-col-fail-reason">{{ step.failure_reason || '-' }}</td>
                              <td class="step-col-duration">{{ step.duration_ms ?? step.response_time_ms ?? '-' }}</td>
                              <td class="step-col-actions">
                                <a href="javascript:;" class="action-link" @click="toggleStepDetail(`${row.id}-${step.id || step.step_id}`)">查看结果</a>
                              </td>
                            </tr>
                            <!-- 步骤详情展开行 -->
                            <tr v-if="expandedStepDetails.has(`${row.id}-${step.id || step.step_id}`)" class="step-detail-row">
                              <td colspan="10" class="step-detail-cell">
                                <div class="step-detail-panel">
                                  <!-- 第4行：执行内容（土黄色背景） -->
                                  <div class="step-execution-content">
                                    <span class="execution-content-label">执行内容：</span>
                                    <span class="execution-content-value" :title="`${step.request_method} ${step.request_url}`">{{ step.request_method }} {{ step.request_url }}</span>
                                  </div>

                                  <!-- 第5行：断言规则 -->
                                  <div v-if="step.assertion_rules && step.assertion_rules.length > 0" class="step-assertion-rules">
                                    <div class="assertion-rules-header">断言规则：</div>
                                    <div class="assertion-rules-list">
                                      <div
                                        v-for="(rule, idx) in step.assertion_rules"
                                        :key="idx"
                                        class="assertion-rule-item"
                                        :class="{ 'rule-pass': rule.passed, 'rule-fail': !rule.passed }"
                                      >
                                        <span class="rule-path">{{ rule.path }}</span>
                                        <span class="rule-operator">{{ rule.operator }}</span>
                                        <span class="rule-expected">{{ rule.expected }}</span>
                                        <span v-if="rule.actual !== undefined" class="rule-actual">实际: {{ rule.actual }}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <!-- 第6行：前置/后置提取变量结果 -->
                                  <div v-if="step.extracted_variables && Object.keys(step.extracted_variables).length > 0" class="step-extracted-vars">
                                    <div class="extracted-vars-header">前置/后置提取变量结果：</div>
                                    <pre class="json-code vars-code"><code>{{ formatJson(step.extracted_variables) }}</code></pre>
                                  </div>

                                  <!-- 第7行：响应值、期望值、实际入参三列对比 -->
                                  <div class="step-comparison-section">
                                    <div class="comparison-header">
                                      <div class="comparison-col">
                                        <span>响应值</span>
                                        <span class="comparison-actions">
                                          <a href="javascript:;" class="comparison-link" @click="openFullscreen(step)">全屏</a>
                                          <span class="comparison-divider">|</span>
                                          <a href="javascript:;" class="comparison-link">DIFF结果</a>
                                        </span>
                                      </div>
                                      <div class="comparison-col">期望值</div>
                                      <div class="comparison-col">实际入参</div>
                                    </div>
                                    <div class="comparison-content">
                                      <div class="comparison-col">
                                        <pre class="json-code"><code>{{ formatJson(step.response_body) }}</code></pre>
                                      </div>
                                      <div class="comparison-col">
                                        <pre class="json-code expected-code"><code>{{ formatJson(getStepExpectedResponse(step)) }}</code></pre>
                                      </div>
                                      <div class="comparison-col">
                                        <pre class="json-code actual-code"><code>{{ formatJson(getStepActualInput(step)) }}</code></pre>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </template>
                        </tbody>
                      </table>

                      <!-- 分页 -->
                      <div class="step-pagination">
                        <AppPagination
                          :current-page="1"
                          :page-size="20"
                          :total="(stepListMap.get(row.id) || []).length"
                          :page-size-options="[20, 50, 100]"
                        />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="step-exec-pagination">
        <AppPagination
          :current-page="recordPage"
          :page-size="recordPageSize"
          :total="recordTotal"
          :page-size-options="recordPageSizeOptions"
          @page-change="handleRecordPageChange"
          @page-size-change="handleRecordPageSizeChange"
        />
      </div>

        </div>
        </div>
      </div>
    </Transition>
  </teleport>
</template>

<style scoped>
.drawer-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 2100;
}

.drawer-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 90%;
  height: 100%;
  background: #fff;
  box-shadow: rgba(0, 0, 0, 0.08) -6px 0 16px -8px, rgba(0, 0, 0, 0.05) -9px 0 28px 0, rgba(0, 0, 0, 0.03) -12px 0 48px 16px;
  display: flex;
  flex-direction: column;
}

.drawer-head {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 16px;
  border-bottom: 1px solid var(--ux-border-color-lighter, #ebeef5);
  font-size: 12px;
  background: #fff;
}

.drawer-head-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.refresh-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ux-text-color-secondary, #909399);
  cursor: pointer;
  transition: color 0.2s;
}

.refresh-icon:hover {
  color: var(--color--primary, #2695F1);
}

.refresh-icon.is-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.drawer-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.drawer-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
}

.v-divider {
  width: 1px;
  height: 16px;
  background: var(--ux-border-color-lighter, #ebeef5);
}

.header-item {
  color: #606266;
  white-space: nowrap;
}

.step-exec-drawer {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--ux-text-color-primary, #303133);
  height: 100%;
  min-height: 0;
  padding: 8px 12px 10px;
  flex: 1;
  box-sizing: border-box;
  overflow: hidden;
}

.header-item mark {
  background: #fffbe6;
  color: inherit;
  padding: 0 4px;
}

.name-link {
  color: var(--deeptest-primary-color, #1890ff);
  text-decoration: none;
}

.auto-open-tab,
.auto-refresh {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--ux-text-color-secondary, #909399);
  white-space: nowrap;
}

.header-mini-btn {
  height: 24px;
  border: 1px solid var(--ux-border-color, #dcdfe6);
  background: #f5f7fa;
  border-radius: 2px;
  padding: 0 8px;
  color: #b1b3b8;
  font-size: 12px;
}

.step-exec-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 4px 2px 6px;
  border-bottom: 1px solid var(--ux-border-color-lighter, #ebeef5);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  white-space: nowrap;
}

.filter-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  white-space: nowrap;
}

.filter-item input,
.filter-item select {
  height: 28px;
  border: 1px solid var(--ux-border-color, #dcdfe6);
  border-radius: var(--radius--small, 4px);
  padding: 0 8px;
  font-size: 12px;
  outline: none;
  box-shadow: none;
}

.filter-item input:focus,
.filter-item select:focus {
  border-color: #1677ff;
  outline: none;
  box-shadow: none;
}

/* 关键字输入框 */
.filter-item:nth-child(1) input { width: 180px; }
/* 执行类型下拉 */
.filter-item:nth-child(2) select { width: 120px; }
/* 执行人输入框 */
.filter-item:nth-child(3) input { width: 160px; }

.filter-item--select {
  gap: 6px;
}

/* 执行类型：原生下拉（还原） */
.filter-item--select .execute-type-select {
  border: 1px solid var(--ux-border-color, #dcdfe6);
  border-radius: 4px;
  padding: 0 8px;
  height: 28px;
  width: 88px;
  background-color: #fff;
  outline: none;
  box-shadow: none;
}

.filter-item--select .execute-type-select:focus {
  border-color: #1677ff;
}

.filter-item--date :deep(.el-date-editor) { width: 260px; }
.filter-item--date :deep(.el-input__wrapper) { height: 28px; }

.btn {
  height: 28px;
  border: 1px solid var(--ux-border-color, #dcdfe6);
  background: #fff;
  border-radius: var(--ux-border-radius-base, 4px);
  padding: 0 12px;
  font-size: 12px;
  cursor: pointer;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #606266;
}

.btn:hover {
  border-color: #c0c4cc;
  color: #409eff;
}

.btn--primary {
  border-color: var(--color--primary, #2695F1);
  background: var(--color--primary, #2695F1);
  color: #fff;
}

.btn--primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
  color: #fff;
}

.btn-icon {
  display: inline-flex;
}

.step-exec-table {
  border: 1px solid var(--ux-border-color-lighter, #ebeef5);
  border-radius: 0;
  overflow: auto;
  flex: 1;
  min-height: 0;
  margin-top: 2px;
}

.step-exec-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.step-exec-table th,
.step-exec-table td {
  height: 40px;
  padding: 0 8px;
  border-bottom: 1px solid var(--ux-border-color-lighter, #ebeef5);
  text-align: left;
  white-space: nowrap;
  font-size: 12px;
}

.step-exec-table th {
  background: var(--color--base--table-header, #f7f8f9);
  font-weight: 400;
  color: #606265;
  font-size: 12px;
}

/* 表格列宽定义 */
.col-expand {
  width: 32px;
  text-align: center !important;
  padding: 0 !important;
}

.col-checkbox {
  width: 32px;
  text-align: center !important;
  padding: 0 !important;
}

.col-checkbox input[type="checkbox"] {
  margin: 0;
}

.col-id {
  width: 90px;
}

.col-status {
  width: 80px;
}

.col-name {
  min-width: 140px;
}

.col-type {
  width: 60px;
}

.col-env {
  width: 80px;
}

.col-executor {
  width: 120px;
}

.col-source {
  width: 60px;
}

.col-duration {
  width: 70px;
}

.col-time {
  width: 200px;
}

.col-result {
  width: 90px;
}

.col-actions {
  width: 220px;
}

/* 展开图标 */
.expand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #909399;
  cursor: pointer;
  transition: transform 0.2s, color 0.2s;
}

.expand-icon:hover {
  color: #1677ff;
}

.expand-icon.is-expanded {
  transform: rotate(0deg);
}

/* 状态标签 */
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-success {
  color: #52c41a;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* 操作链接 */
.action-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-link {
  color: var(--deeptest-primary-color, #1890ff);
  text-decoration: none;
  font-size: 12px;
}

.action-link:hover {
  text-decoration: underline;
}

/* 数据行样式 */
.data-row:hover {
  background: #f5f7fa;
}

/* 问号提示图标 */
.hint-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-left: 4px;
  border: 1px solid #91a3b5;
  border-radius: 50%;
  color: #91a3b5;
  font-size: 10px;
  cursor: help;
}

.empty-cell {
  text-align: center;
  color: var(--ux-text-color-secondary, #909399);
  height: 44px;
}

.step-exec-pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 6px;
}

/* 可调整列宽 */
.step-exec-table th.resizable {
  position: relative;
  padding-right: 6px !important;
}

.step-exec-table .th-content {
  display: inline-flex;
  align-items: center;
}

.step-exec-table .resize-handle {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  cursor: col-resize;
  background: transparent;
  transition: background 0.2s;
}

.step-exec-table .resize-handle:hover {
  background: #1677ff;
}

/* 展开行样式 */
.expand-row {
  background: #fafafa;
}

.expand-cell {
  padding: 0 !important;
}

.step-list-container {
  padding: 12px 16px;
}

.step-loading,
.step-empty {
  padding: 20px;
  text-align: center;
  color: #909399;
  font-size: 12px;
}

.step-list-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  border: 1px solid #ebeef5;
}

.step-list-table th,
.step-list-table td {
  height: 36px;
  padding: 0 8px;
  border-bottom: 1px solid #ebeef5;
  text-align: left;
  white-space: nowrap;
}

.step-list-table th {
  background: #f5f7fa;
  color: #606266;
  font-weight: 500;
  position: relative;
  padding-right: 6px !important;
}

.step-list-table th.resizable .th-content {
  display: inline-flex;
  align-items: center;
}

.step-list-table th .resize-handle {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  cursor: col-resize;
  background: transparent;
  transition: background 0.2s;
}

.step-list-table th .resize-handle:hover {
  background: #1677ff;
}

.step-row:hover {
  background: #f0f2f5;
}

.step-col-expand {
  width: 32px;
  text-align: center !important;
}

.step-col-checkbox {
  width: 32px;
  text-align: center !important;
}

.step-col-name {
  min-width: 140px;
}

.step-col-params {
  width: 80px;
  text-align: center !important;
}

.step-col-content {
  min-width: 280px;
  max-width: 400px;
}

.step-col-content .http-url {
  display: inline-block;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.step-col-compare-type {
  width: 80px;
  text-align: center !important;
}

.step-col-compare-result {
  width: 70px;
  text-align: center !important;
}

.step-col-duration {
  width: 80px;
  text-align: center !important;
}

.step-col-actions {
  width: 80px;
}

/* 入参组标签 */
.param-group-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f0f0;
  color: #595959;
  border-radius: 4px;
  font-size: 11px;
}

/* 比对类型标签 */
.compare-type-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  font-size: 11px;
}

.compare-type-tag.ab-test {
  background: #f9f0ff;
  color: #722ed1;
  border-color: #d3adf7;
}

/* 比对结果标签 */
.compare-result-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.compare-result-tag.result-pass {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.compare-result-tag.result-fail {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.compare-result-tag.result-pending {
  background: #fffbe6;
  color: #faad14;
  border: 1px solid #ffe58f;
}

/* 状态码 */
.status-code {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.status-code.status-success {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-code.status-error {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

/* 展开图标交互 */
.step-expand-icon {
  color: #909399;
  cursor: pointer;
  transition: transform 0.2s, color 0.2s;
}

.step-expand-icon:hover {
  color: #1677ff;
}

.step-expand-icon.is-expanded {
  transform: rotate(0deg);
}

.step-expand-icon {
  color: #909399;
  cursor: pointer;
}

.step-expand-icon:hover {
  color: #1677ff;
}

.http-method {
  color: #1890ff;
  font-weight: 500;
  margin-right: 4px;
}

.http-url {
  color: #606266;
}

.compare-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  font-size: 11px;
}

.result-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  font-size: 11px;
}

.result-tag.result-fail {
  background: #fff2f0;
  color: #ff4d4f;
  border-color: #ffccc7;
}

/* 步骤详情展开行 */
.step-detail-row {
  background: #fafafa;
}

.step-detail-cell {
  padding: 0 !important;
}

.step-detail-panel {
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
}

/* 详情信息栏 */
.detail-info-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-label {
  font-size: 12px;
  color: #8c8c8c;
}

.info-label.error {
  color: #ff4d4f;
}

.info-value {
  font-size: 12px;
  color: #262626;
}

.info-value.error-text {
  color: #ff4d4f;
}

/* 详情区块 */
.detail-section {
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

.detail-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
}

.detail-section-url {
  font-size: 12px;
  color: #8c8c8c;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

/* Tab切换 */
.detail-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.detail-tab {
  padding: 8px 16px;
  font-size: 12px;
  color: #595959;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.detail-tab:hover {
  color: #1890ff;
}

.detail-tab.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  background: #fff;
}

/* JSON代码块 */
.json-code {
  margin: 0;
  padding: 12px;
  background: #f6ffed;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 11px;
  line-height: 1.6;
  color: #262626;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

.json-code.request-code {
  background: #e6f7ff;
}

.json-code.response-code {
  background: #f6ffed;
}

.json-code.vars-code {
  background: #fffbe6;
}

.json-code.headers-code {
  background: #f0f5ff;
}

.json-code.params-code {
  background: #fff2e8;
}

.json-code code {
  font-family: inherit;
}

/* 断言列表 */
.assertion-list {
  padding: 12px;
}

.assertion-item {
  margin-bottom: 10px;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.assertion-item:last-child {
  margin-bottom: 0;
}

.assertion-item.assertion-pass {
  background: #f6ffed;
  border-color: #b7eb8f;
}

.assertion-item.assertion-fail {
  background: #fff2f0;
  border-color: #ffccc7;
}

.assertion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.assertion-type {
  font-size: 12px;
  font-weight: 500;
  color: #262626;
}

.assertion-status {
  font-size: 11px;
}

.assertion-item.assertion-pass .assertion-status {
  color: #52c41a;
}

.assertion-item.assertion-fail .assertion-status {
  color: #ff4d4f;
}

.assertion-error {
  font-size: 11px;
  color: #ff4d4f;
  margin-bottom: 6px;
  padding: 6px 8px;
  background: #fff;
  border-radius: 3px;
}

.assertion-logs {
  padding: 6px 8px;
  background: #fff;
  border-radius: 3px;
}

.log-item {
  font-size: 11px;
  color: #595959;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  white-space: pre-wrap;
  word-break: break-all;
  margin-bottom: 4px;
}

.log-item:last-child {
  margin-bottom: 0;
}

/* 步骤列表包装器 */
.step-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 步骤工具栏 */
.step-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.step-toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.step-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-search-input {
  height: 28px;
  width: 150px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 12px;
}

.step-search-input:focus {
  border-color: #40a9ff;
  outline: none;
}

.step-btn {
  height: 28px;
  padding: 0 12px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.step-btn:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.step-btn--primary {
  background: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.step-btn--primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
  color: #fff;
}

.step-checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #595959;
  cursor: pointer;
}

.step-toolbar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #595959;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.step-toolbar-icon:hover {
  background: #e6f7ff;
  color: #1890ff;
}

/* 失败原因标注 */
.step-failure-reason {
  position: relative;
}

.step-failure-select {
  height: 28px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  background: #fff;
  cursor: pointer;
}

.step-failure-select:focus {
  border-color: #40a9ff;
  outline: none;
}

.failure-reason-popover {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  width: 240px;
}

.failure-reason-textarea {
  width: 100%;
  height: 80px;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  resize: none;
  box-sizing: border-box;
}

.failure-reason-textarea:focus {
  border-color: #40a9ff;
  outline: none;
}

.failure-reason-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

/* 步骤表格列宽调整 */
.step-col-checkbox {
  width: 40px;
  text-align: center !important;
}

.step-col-name {
  min-width: 120px;
}

.step-col-params {
  width: 70px;
  text-align: center !important;
}

.step-col-content {
  min-width: 200px;
  max-width: 300px;
}

.step-col-time {
  width: 150px;
}

.step-col-compare-type {
  width: 80px;
  text-align: center !important;
}

.step-col-compare-result {
  width: 70px;
  text-align: center !important;
}

.step-col-fail-reason {
  width: 100px;
}

.step-col-duration {
  width: 70px;
  text-align: center !important;
}

.step-col-actions {
  width: 80px;
  text-align: center !important;
}

/* 步骤展开图标 */
.step-expand-icon-wrapper {
  display: inline-flex;
  align-items: center;
  margin-right: 6px;
  cursor: pointer;
  color: #8c8c8c;
}

.step-expand-icon-wrapper:hover {
  color: #1890ff;
}

.step-expand-icon {
  transition: transform 0.2s;
}

/* 步骤执行内容（土黄色背景） */
.step-execution-content {
  padding: 8px 12px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  margin-bottom: 12px;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.execution-content-label {
  color: #8c8c8c;
  margin-right: 4px;
}

.execution-content-value {
  color: #262626;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

/* 断言规则 */
.step-assertion-rules {
  margin-bottom: 12px;
}

.assertion-rules-header {
  font-size: 12px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
}

.assertion-rules-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.assertion-rule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 12px;
}

.assertion-rule-item.rule-pass {
  background: #f6ffed;
  border-color: #b7eb8f;
}

.assertion-rule-item.rule-fail {
  background: #fff2f0;
  border-color: #ffccc7;
}

.rule-path {
  color: #1890ff;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

.rule-operator {
  color: #8c8c8c;
}

.rule-expected {
  color: #52c41a;
}

.rule-actual {
  color: #ff4d4f;
  margin-left: auto;
}

/* 提取变量 */
.step-extracted-vars {
  margin-bottom: 12px;
}

.extracted-vars-header {
  font-size: 12px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
}

/* 三列对比区域 */
.step-comparison-section {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.comparison-header {
  display: flex;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

.comparison-header .comparison-col {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #262626;
  border-right: 1px solid #e8e8e8;
}

.comparison-header .comparison-col:last-child {
  border-right: none;
}

.comparison-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.comparison-link {
  color: #1890ff;
  font-size: 11px;
  text-decoration: none;
}

.comparison-link:hover {
  text-decoration: underline;
}

.comparison-divider {
  color: #d9d9d9;
  font-size: 11px;
}

.comparison-content {
  display: flex;
}

.comparison-content .comparison-col {
  flex: 1;
  border-right: 1px solid #e8e8e8;
}

.comparison-content .comparison-col:last-child {
  border-right: none;
}

.comparison-content .json-code {
  max-height: 400px;
  min-height: 150px;
  background: #f6ffed;
}

.comparison-content .expected-code {
  background: #e6f7ff;
}

.comparison-content .actual-code {
  background: #fff2e8;
}

/* 步骤分页 */
.step-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
}
</style>

