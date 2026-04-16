<script setup>
/**
 * 用例管理页面
 * 位置: domains/casemgmt/views/
 */
import { ref, computed, nextTick, watch, onActivated, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElPopconfirm } from 'element-plus'
import { Setting, ArrowDown } from '@element-plus/icons-vue'
import AppHeader from '@/shared/ui/organisms/AppHeader.vue'
import AppPagination from '@/shared/ui/organisms/AppPagination.vue'
import DateRangeInput from '@/shared/ui/molecules/DateRangeInput.vue'
import CaseSidebar from '../components/CaseSidebar.vue'
import AddSuiteModal from '../components/suite/AddSuiteModal.vue'
import AddEditCaseModal from '../components/case/AddEditCaseModal.vue'
import StepExecuteDrawer from '../components/StepExecuteDrawer.vue'
import PrePostStepDialog from '../components/common/PrePostStepDialog.vue'
import PresetVariableDialog from '../components/common/PresetVariableDialog.vue'
import MoveStepDialog from '../components/steps/MoveStepDialog.vue'
import MoveCaseDialog from '../components/case/MoveCaseDialog.vue'
import {
  createSuite,
  updateSuite,
  deleteSuite,
  fetchTestcaseList,
  sortTestcase,
  createTestcase,
  updateTestcase,
  executeTestcase,
  deleteTestcase,
  fetchStepList,
  createStep,
  deleteStep,
  updateStep
} from '../api'
import { useMessage } from '@/shared/ui'
import { useProjectStore } from '@/domains/project/stores/useProjectStore'
import { useCaseMgmtStore } from '../stores/useCaseMgmtStore'
import { getCaseTypeLabel, getPriorityLabel } from '../types'
import { withGlobalLoading } from '@/shared/composables'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()
const caseMgmtStore = useCaseMgmtStore()
const { showSuccess, showWarning, showError } = useMessage()

const activeTab = ref('scenario')
const searchKeyword = ref('')
const showAddCaseModal = ref(false)
const caseModalMode = ref('create')
const editingCase = ref(null)
const showAddSuiteModal = ref(false)

// 工具栏弹窗/抽屉状态
const showSyncCaseModal = ref(false)
const showBatchExecModal = ref(false)
const showExecResultDrawer = ref(false)
const showBatchOperationDropdown = ref(false)
const batchOpTriggerRef = ref(null)
const batchOpDropdownStyle = ref({})
const hoveringBatchOpDropdown = ref(false)
const showCustomHeaderModal = ref(false)

// 选中的用例
const selectedCases = ref([])
const isBatchOperationDisabled = computed(() => selectedCases.value.length === 0)
const draggingCaseId = ref('')
const dragOverCaseId = ref('')
const dropFlashCaseId = ref('')
const caseListInCurrentSuiteScope = ref(false)

const canDragCaseSort = computed(() => {
  return caseListInCurrentSuiteScope.value && caseData.value.length > 1
})

function flashCaseRow(caseId) {
  dropFlashCaseId.value = String(caseId || '')
  setTimeout(() => {
    if (dropFlashCaseId.value === String(caseId || '')) {
      dropFlashCaseId.value = ''
    }
  }, 300)
}

// 同步用例表单
const syncCaseForm = ref({
  platform: ''
})
const platformOptions = [
  { label: 'JOS平台', value: 'jos' },
  { label: '开放平台', value: 'open' },
  { label: '内部平台', value: 'internal' }
]

// 批量执行表单
const batchExecForm = ref({
  notifyType: 'email',
  emailNotify: '',
  notifyStrategy: 'all',
  execInterval: '',
  execOrder: 'parallel',
  breakStrategy: 'ignore',
  hostConfig: '',
  execEnv: 'test',
  featureEnv: '',
  execCommand: '',
  variable1: '',
  variable2: '',
  relatedDemand: '',
  testStage: ''
})

// 自定义表头配置
const defaultHeaders = [
  { key: 'id', label: '用例编号', checked: true, group: '基本信息' },
  { key: 'name', label: '用例名称', checked: true, group: '基本信息' },
  { key: 'type', label: '类型', checked: true, group: '基本信息' },
  { key: 'caseSet', label: '所属用例集', checked: true, group: '基本信息' },
  { key: 'app', label: '关联项目', checked: true, group: '基本信息' },
  { key: 'tag', label: '标签', checked: true, group: '基本信息' },
  { key: 'priority', label: '优先级', checked: true, group: '基本信息' },
  { key: 'steps', label: '步骤数', checked: true, group: '执行信息' },
  { key: 'tasks', label: '任务数', checked: true, group: '执行信息' },
  { key: 'execCount', label: '执行次数', checked: true, group: '执行信息' },
  { key: 'result', label: '结果', checked: true, group: '执行信息' },
  { key: 'creator', label: '创建人', checked: true, group: '更新信息' },
  { key: 'createTime', label: '创建时间', checked: true, group: '更新信息' },
  { key: 'updateTime', label: '更新时间', checked: true, group: '更新信息' }
]
const customHeaders = computed(() => caseMgmtStore.customHeaders)
const draftCustomHeaders = ref([])

// 新增用例表单数据
const addCaseForm = ref({
  name: '',
  arrangeMode: 'list', // list, graph, code
  type: '',
  caseSet: '',
  priority: '',
  preCondition: '',
  description: '',
  tags: []
})

// 用例类型选项
const caseTypeOptions = [
  { label: '冒烟用例', value: 'smoke' },
  { label: '功能用例', value: 'functional' },
  { label: '回归用例', value: 'regression' },
  { label: '性能用例', value: 'performance' }
]

// 优先级选项
const priorityOptions = [
  { label: 'P0', value: 'P0' },
  { label: 'P1', value: 'P1' },
  { label: 'P2', value: 'P2' },
  { label: 'P3', value: 'P3' },
  { label: 'P4', value: 'P4' }
]

// 用例集选项
const caseSetOptions = [
  { label: 'product-jos-...', value: 'product-jos' },
  { label: 'JosAuthPack...', value: 'jos-auth' },
  { label: 'open-rest-api', value: 'open-rest' },
  { label: '回归', value: 'regression' }
]

const caseData = ref([])
const caseTotal = ref(0)
const casePage = ref(1)
const casePageSize = ref(50)
const pageSizeOptions = [20, 50, 100]
const navigatingCaseId = ref('')

const showMoreFilters = ref(false)

const filterForm = ref({
  keyword: '',
  creator: '',
  api: '',
  tags: '',
  updater: '',
  method: '',
  createdAtStart: '',
  createdAtEnd: ''
})

function formatTags(tags) {
  if (Array.isArray(tags)) {
    return tags.filter(Boolean).join(',')
  }
  if (typeof tags === 'string') return tags
  return ''
}

function toNumberOrZero(val) {
  const num = typeof val === 'number' ? val : Number(val)
  return Number.isFinite(num) ? num : 0
}

function toggleMoreFilters() {
  showMoreFilters.value = !showMoreFilters.value
  localStorage.setItem('casemgmt.caseList.showMoreFilters', showMoreFilters.value ? '1' : '0')
}

function resetFilters() {
  filterForm.value = {
    keyword: '',
    creator: '',
    api: '',
    tags: '',
    updater: '',
    method: '',
    createdAtStart: '',
    createdAtEnd: ''
  }
}

async function handleResetTestcases() {
  resetFilters()
  casePage.value = 1
  await withGlobalLoading(
    () => loadTestcases({ withParentId: Boolean(currentSuite.value?.id) }),
    '加载用例列表...'
  )
}

function buildFilterParams() {
  const form = filterForm.value
  const params = {}
  if (form.keyword?.trim()) params.name_or_id = form.keyword.trim()
  if (form.creator?.trim()) params.creator = form.creator.trim()
  if (form.api?.trim()) params.api_url = form.api.trim()
  if (form.tags?.trim()) params.tags = form.tags.trim()
  if (form.updater?.trim()) params.updater = form.updater.trim()
  if (form.method?.trim()) {
    const rawMethod = form.method.trim()
    const upperMethod = rawMethod.toUpperCase()
    const methodMap = {
      GET: 0,
      POST: 1,
      PUT: 2,
      DELETE: 3,
      PATCH: 4
    }
    if (/^\d+$/.test(rawMethod)) {
      params.method = Number(rawMethod)
    } else if (upperMethod in methodMap) {
      params.method = methodMap[upperMethod]
    }
  }
  if (form.createdAtStart?.trim()) params.created_at_start = form.createdAtStart.trim()
  if (form.createdAtEnd?.trim()) params.created_at_end = form.createdAtEnd.trim()
  return params
}

async function handleQueryTestcases() {
  casePage.value = 1
  await withGlobalLoading(
    () => loadTestcases({ withParentId: Boolean(currentSuite.value?.id) }),
    '加载用例列表...'
  )
}

function handleNav(path) {
  void path
}

async function reloadCurrentTestcases() {
  await loadTestcases({ withParentId: Boolean(currentSuite.value?.id) })
}

async function handleCasePageChange(page) {
  casePage.value = page
  await reloadCurrentTestcases()
}

async function handleCasePageSizeChange(nextSize) {
  casePageSize.value = nextSize
  casePage.value = 1
  await reloadCurrentTestcases()
}

// 打开新增用例弹窗（可从左侧树或工具栏触发）
function openAddCaseModal(targetSuite = null) {
  caseModalMode.value = 'create'
  // 记录当前选中的用例集，后续可用于默认所属用例集
  if (targetSuite) {
    currentSuite.value = targetSuite
  }
  editingCase.value = null
  showAddCaseModal.value = true
}

function closeAddCaseModal() {
  showAddCaseModal.value = false
}

async function handleSaveCase(payload) {
  try {
    const isEdit = caseModalMode.value === 'edit' && editingCase.value?.id

    const baseData = {
      name: payload.name,
      case_type: Number(payload.caseType ?? 0),
      parent_id: currentSuite.value?.id ?? null,
      priority: Number(payload.priority ?? 0),
      precondition: payload.precondition || '',
      description: payload.note || '',
      tags: '', // 标签区域暂未真正实现输入，这里先传空字符串
      project_id: projectStore.currentProjectId
    }

    const apiData = isEdit
      ? { ...baseData, testcase_id: editingCase.value.id }
      : baseData

    const resp = isEdit ? await updateTestcase(apiData) : await createTestcase(apiData)
    const code = resp?.data?.code
    const msg = resp?.data?.msg

    if (code !== 0 && code !== 200) {
      showError(msg || (isEdit ? '编辑用例失败' : '新增用例失败'))
      return
    }

    showSuccess(msg || (isEdit ? '编辑用例成功' : '新增用例成功'))
    showAddCaseModal.value = false
    // 新增/编辑成功后刷新当前用例列表
    await loadTestcases()

    // 保存并前往：新增成功后进入用例明细页
    if (!isEdit && payload.action === 'saveAndGo') {
      const createdId =
        resp?.data?.data?.id ??
        resp?.data?.data?.testcase_id ??
        resp?.data?.data?.testcaseId
      if (createdId) {
        goToCaseConfig(String(createdId))
      }
    }
  } catch (error) {
    void error
    showError('保存用例异常')
  }
}

const currentProjectId = ref(null)
const suiteModalMode = ref('create') // 'create' | 'edit'
const editingSuite = ref(null)
const defaultParentSuiteId = ref(null)
const defaultParentSuite = ref(null)
const currentSuite = ref(null)
const sidebarRefreshKey = ref(0)
const suiteUpsertSignal = ref(null)

// 新增用例集弹窗
function openAddSuiteModal(parentSuite) {
  suiteModalMode.value = 'create'
  editingSuite.value = null
  defaultParentSuiteId.value = parentSuite?.id ?? null
  defaultParentSuite.value = parentSuite ?? null
  currentProjectId.value = projectStore.currentProjectId
  showAddSuiteModal.value = true
}

// 编辑用例集弹窗
function openEditSuiteModal(suite) {
  suiteModalMode.value = 'edit'
  editingSuite.value = suite
  defaultParentSuiteId.value = null
  defaultParentSuite.value = null
  currentProjectId.value = projectStore.currentProjectId
  showAddSuiteModal.value = true
}

function closeAddSuiteModal() {
  showAddSuiteModal.value = false
}

async function createSuiteFromModal(payload) {
  try {
    const isEdit = Boolean(payload.suite_id)
    // 乐观更新：编辑时先改本地节点，再调接口
    if (isEdit && editingSuite.value) {
      editingSuite.value.name = payload.name
      editingSuite.value.parent_id = payload.parent_id
      editingSuite.value.remark = payload.remark
      editingSuite.value.tags = payload.tags
      editingSuite.value.group = payload.group
    }

    const resp = isEdit ? await updateSuite(payload) : await createSuite(payload)
    const code = resp?.data?.code
    const msg = resp?.data?.msg
    if (code !== 0 && code !== 200) {
      showError(msg || (isEdit ? '编辑用例集失败' : '新增用例集失败'))
      return
    }
    showSuccess(msg || (isEdit ? '编辑用例集成功' : '新增用例集成功'))
    closeAddSuiteModal()
    if (isEdit) {
      suiteUpsertSignal.value = {
        type: 'edit',
        suite: {
          id: payload.suite_id,
          name: payload.name,
          parent_id: payload.parent_id ?? null,
          remark: payload.remark || '',
          tags: payload.tags || '',
          group: payload.group || ''
        },
        ts: Date.now()
      }
      return
    }

    const createdId = Number(
      resp?.data?.data?.id ??
      resp?.data?.data?.suite_id ??
      resp?.data?.data?.suiteId
    )
    if (Number.isFinite(createdId) && createdId > 0) {
      suiteUpsertSignal.value = {
        type: 'create',
        suite: {
          id: createdId,
          name: payload.name,
          parent_id: payload.parent_id ?? null,
          remark: payload.remark || '',
          tags: payload.tags || '',
          group: payload.group || '',
          testcase_count: 0,
          step_count: 0
        },
        ts: Date.now()
      }
    } else {
      // 仅在后端未返回新ID时兜底刷新
      sidebarRefreshKey.value += 1
    }
  } catch (error) {
    void error
    showError('新增用例集异常')
  }
}

// 删除用例集
async function deleteSuiteFromSidebar(suite) {
  try {
    const resp = await deleteSuite({ suite_id: suite.id })
    const code = resp?.data?.code
    const msg = resp?.data?.msg
    if (code !== 0 && code !== 200) {
      showError(msg || '删除用例集失败')
      return
    }
    showSuccess(msg || '删除用例集成功')
    sidebarRefreshKey.value += 1
  } catch (error) {
    void error
    showError('删除用例集异常')
  }
}

// ========== 工具栏功能 ==========

// 打开同步用例弹窗
function openSyncCaseModal() {
  showSyncCaseModal.value = true
}

// 关闭同步用例弹窗
function closeSyncCaseModal() {
  showSyncCaseModal.value = false
  syncCaseForm.value = { platform: '' }
}

// 提交同步用例
function submitSyncCase() {
  void syncCaseForm.value
  closeSyncCaseModal()
}

// 打开批量执行弹窗
function openBatchExecModal() {
  showBatchExecModal.value = true
}

// 关闭批量执行弹窗
function closeBatchExecModal() {
  showBatchExecModal.value = false
}

// 确认执行
function confirmBatchExec() {
  void batchExecForm.value
  closeBatchExecModal()
}

// 打开执行结果抽屉
function openExecResultDrawer() {
  showExecResultDrawer.value = true
}

// 关闭执行结果抽屉
function closeExecResultDrawer() {
  showExecResultDrawer.value = false
}

// 切换批量操作下拉框
function toggleBatchOperation() {
  if (isBatchOperationDisabled.value) return
  showBatchOperationDropdown.value = !showBatchOperationDropdown.value
}

// 关闭批量操作下拉框
function closeBatchOperation() {
  if (hoveringBatchOpDropdown.value) return
  showBatchOperationDropdown.value = false
}

function openBatchOperation() {
  if (isBatchOperationDisabled.value) return
  showBatchOperationDropdown.value = true
}

function onBatchOpDropdownEnter() {
  hoveringBatchOpDropdown.value = true
  openBatchOperation()
}

function onBatchOpDropdownLeave() {
  hoveringBatchOpDropdown.value = false
  closeBatchOperation()
}

function updateBatchOpDropdownPosition() {
  const trigger = batchOpTriggerRef.value
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  batchOpDropdownStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    minWidth: `${rect.width}px`,
    zIndex: 99999
  }
}

watch(showBatchOperationDropdown, (val) => {
  if (val) {
    nextTick(() => updateBatchOpDropdownPosition())
  }
})

watch(selectedCases, (val) => {
  if (!Array.isArray(val) || val.length === 0) {
    showBatchOperationDropdown.value = false
  }
})

// 批量操作
function batchDelete() {
  void selectedCases.value
  closeBatchOperation()
}
function batchMove() {
  void selectedCases.value
  closeBatchOperation()
}
function batchEdit() {
  void selectedCases.value
  closeBatchOperation()
}
function batchCopy() {
  void selectedCases.value
  closeBatchOperation()
}

// 打开自定义表头弹窗
function openCustomHeaderModal() {
  const source = customHeaders.value.length > 0 ? customHeaders.value : defaultHeaders.map(h => ({ ...h }))
  draftCustomHeaders.value = source.map(h => ({ ...h }))
  showCustomHeaderModal.value = true
}

// 关闭自定义表头弹窗
function closeCustomHeaderModal() {
  showCustomHeaderModal.value = false
}

// 确认自定义表头
function confirmCustomHeader() {
  caseMgmtStore.setCustomHeaders(draftCustomHeaders.value.map(h => ({ ...h })))
  closeCustomHeaderModal()
}

// ========= 测试用例列表加载 =========

async function loadTestcases(options = { withParentId: true }) {
  try {
    caseListInCurrentSuiteScope.value = Boolean(options.withParentId && currentSuite.value?.id)
    const currentProjectId = projectStore.currentProjectId
    const params = {
      project_id: currentProjectId,
      page: casePage.value,
      page_size: casePageSize.value,
      ...buildFilterParams()
    }
    if (options.withParentId && currentSuite.value?.id) {
      // 仅在明确选中用例集后传 parent_id
      params.parent_id = currentSuite.value.id
    }

    const resp = await fetchTestcaseList(params)
    const data = resp?.data?.data
    const list = data?.list || []
    caseTotal.value = data?.total || 0
    casePage.value = Number(data?.page) || casePage.value
    casePageSize.value = Number(data?.page_size) || casePageSize.value
    caseData.value = list.map(item => ({
      id: String(item.id),
      name: item.name,
      type: getCaseTypeLabel(item.case_type ?? item.caseType ?? item.type),
      caseSet:
        item.suite_name ??
        item.suiteName ??
        item.parent_name ??
        item.parentName ??
        currentSuite.value?.name ??
        '',
      app:
        item.project_name ??
        item.projectName ??
        projectStore.currentProject?.name ??
        item.app_code ??
        '',
      tag: formatTags(
        item.tags ??
        item.tag ??
        item.labels
      ),
      steps: toNumberOrZero(
        item.step_count ??
        item.stepCount ??
        item.steps_count ??
        item.stepsCount
      ),
      tasks: toNumberOrZero(
        item.task_count ??
        item.taskCount
      ),
      execCount: toNumberOrZero(
        item.exec_count ??
        item.execCount ??
        item.execution_count ??
        item.executionCount
      ),
      result:
        item.last_result ||
        '-',
      creator: item.creator || '',
      createTime: item.created_at || '',
      updateTime: item.updated_at || '',
      priority: getPriorityLabel(item.priority)
    }))
  } catch (error) {
    void error
    caseData.value = []
    caseListInCurrentSuiteScope.value = false
  }
}

async function handleSelectSuite(suite) {
  currentSuite.value = suite || null
  casePage.value = 1
  await withGlobalLoading(
    () => loadTestcases({ withParentId: Boolean(suite?.id) }),
    '加载用例列表...'
  )
}

async function handleProjectChanged() {
  // 进入页面与切换项目时，默认列表查询不传 parent_id
  currentSuite.value = null
  casePage.value = 1
  await withGlobalLoading(
    () => loadTestcases({ withParentId: false }),
    '加载用例列表...'
  )
}

async function refreshListFromRoute() {
  const suiteId = Number(route.query.suite_id)
  if (Number.isFinite(suiteId) && suiteId > 0) {
    currentSuite.value = {
      ...(currentSuite.value || {}),
      id: suiteId,
      name: currentSuite.value?.name || ''
    }
    casePage.value = 1
    await withGlobalLoading(
      () => loadTestcases({ withParentId: true }),
      '加载用例列表...'
    )
    return
  }
  // 默认列表：不传 parent_id
  currentSuite.value = null
  casePage.value = 1
  await withGlobalLoading(
    () => loadTestcases({ withParentId: false }),
    '加载用例列表...'
  )
}

onActivated(() => {
  void refreshListFromRoute()
})

onMounted(() => {
  // 初始化自定义表头（首次加载时使用默认值并持久化）
  if (!caseMgmtStore.customHeaders || caseMgmtStore.customHeaders.length === 0) {
    caseMgmtStore.setCustomHeaders(defaultHeaders.map(h => ({ ...h })))
  }
  void refreshListFromRoute()
})

// 全选/取消全选某组
function toggleGroup(group, checked) {
  draftCustomHeaders.value.forEach(header => {
    if (header.group === group) {
      header.checked = checked
    }
  })
}

// 判断是否组内全选
function isGroupChecked(group) {
  const groupHeaders = draftCustomHeaders.value.filter(h => h.group === group)
  return groupHeaders.every(h => h.checked)
}

// 获取已选字段
const selectedHeaders = computed(() => {
  return draftCustomHeaders.value.filter(h => h.checked)
})

// 判断表头是否可见
function isHeaderVisible(key) {
  const header = customHeaders.value.find(h => h.key === key)
  return header ? header.checked : true
}

// 选中/取消选中单个
function toggleSelect(id) {
  const index = selectedCases.value.indexOf(id)
  if (index > -1) {
    selectedCases.value.splice(index, 1)
  } else {
    selectedCases.value.push(id)
  }
}

// 全选/取消全选
function toggleSelectAll(event) {
  if (event.target.checked) {
    selectedCases.value = caseData.value.map(row => row.id)
  } else {
    selectedCases.value = []
  }
}

function handleCaseRowDragStart(row) {
  if (!canDragCaseSort.value) return
  draggingCaseId.value = String(row.id)
}

function handleCaseRowDragOver(row) {
  if (!canDragCaseSort.value) return
  if (!draggingCaseId.value) return
  const toId = String(row.id)
  if (toId === draggingCaseId.value) return
  dragOverCaseId.value = toId
}

function handleCaseRowDragEnd() {
  draggingCaseId.value = ''
  dragOverCaseId.value = ''
}

function handleCaseRowDrop(targetRow) {
  if (!canDragCaseSort.value) {
    handleCaseRowDragEnd()
    return
  }
  const fromId = draggingCaseId.value
  const toId = String(targetRow.id)
  if (!fromId || !toId || fromId === toId) {
    handleCaseRowDragEnd()
    return
  }
  const fromIndex = caseData.value.findIndex(row => String(row.id) === fromId)
  const toIndex = caseData.value.findIndex(row => String(row.id) === toId)
  if (fromIndex < 0 || toIndex < 0) {
    handleCaseRowDragEnd()
    return
  }
  const newList = [...caseData.value]
  const [moved] = newList.splice(fromIndex, 1)
  newList.splice(toIndex, 0, moved)
  caseData.value = newList
  const movedCase = caseData.value[toIndex]
  flashCaseRow(movedCase?.id)
  const targetSortOrder = toIndex + 1
  sortTestcase({
    testcase_id: Number(movedCase.id),
    sort_order: targetSortOrder
  })
    .catch(() => {})
    .finally(async () => {
      await reloadCurrentTestcases()
      handleCaseRowDragEnd()
    })
}

// 跳转到用例配置页面（增加过渡态，避免生硬跳转和重复点击）
async function goToCaseConfig(id) {
  if (!id || navigatingCaseId.value === id) return
  navigatingCaseId.value = id
  try {
    await router.push({
      path: `/case-config/${id}`,
      query: {
        project_id: projectStore.currentProjectId ? String(projectStore.currentProjectId) : undefined
      }
    })
  } finally {
    setTimeout(() => {
      if (navigatingCaseId.value === id) {
        navigatingCaseId.value = ''
      }
    }, 200)
  }
}
</script>

<template>
  <div class="casemgmt-page">
    <AppHeader @navigate="handleNav" />
    
    <div class="page-container">
      <!-- 左侧树 -->
      <CaseSidebar
        :refresh-token="sidebarRefreshKey"
        :suite-upsert-signal="suiteUpsertSignal"
        @openAddSuiteModal="openAddSuiteModal"
        @openAddCaseModal="openAddCaseModal"
        @editSuite="openEditSuiteModal"
        @deleteSuite="deleteSuiteFromSidebar"
        @project-changed="handleProjectChanged"
        @selectSuite="handleSelectSuite"
      />

      <!-- 主内容 -->
      <main class="main-content">
        <!-- 标题栏 - Tabs 和 页面标题 -->
        <div class="title-bar">
          <!-- Tabs -->
          <div class="content-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'scenario' }]"
              @click="activeTab = 'scenario'"
            >
              场景用例
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'atomic' }]"
              @click="activeTab = 'atomic'"
            >
              原子用例
            </button>
          </div>
          
          <h3 class="page-title">用例列表</h3>
        </div>

        <!-- 搜索栏 -->
        <div class="search-filter">
          <!-- 第一排：始终显示 -->
          <div class="filter-row">
            <div class="filter-item filter-item--keyword">
            <label>关键字:</label>
              <input v-model="filterForm.keyword" type="text" placeholder="输入名称/编号查询" />
          </div>
            <div class="filter-item filter-item--creator">
            <label>创建人:</label>
              <input v-model="filterForm.creator" type="text" placeholder="输入erp" />
          </div>
            <div class="filter-item filter-item--api">
            <label>接口:</label>
              <input v-model="filterForm.api" type="text" placeholder="输入接口地址/topic" />
          </div>
            <div class="filter-actions">
              <button type="button" class="advanced-link-btn" @click="toggleMoreFilters">
                {{ showMoreFilters ? '隐藏筛选' : '高级筛选' }}
              </button>
              <button class="query-btn" @click="handleQueryTestcases">查询</button>
              <button class="reset-btn" @click="handleResetTestcases">重置</button>
            </div>
          </div>

          <!-- 第二排：展开后显示（100% 参考“更多信息/隐藏信息”） -->
          <div v-if="showMoreFilters" class="filter-row filter-row--more">
            <div class="filter-item filter-item--tags">
              <label>标签:</label>
              <input v-model="filterForm.tags" type="text" placeholder="请选择" />
            </div>
            <div class="filter-item filter-item--updater">
              <label>修改人:</label>
              <input v-model="filterForm.updater" type="text" placeholder="输入erp" />
            </div>
            <div class="filter-item filter-item--method">
              <label>方法:</label>
              <input v-model="filterForm.method" type="text" placeholder="输入HTTP方法名" />
            </div>
            <div class="filter-item filter-item--range">
              <label>创建时间:</label>
              <div class="range-inputs range-inputs--picker">
                <DateRangeInput
                  :start-date="filterForm.createdAtStart"
                  :end-date="filterForm.createdAtEnd"
                  @update:start-date="value => (filterForm.createdAtStart = value)"
                  @update:end-date="value => (filterForm.createdAtEnd = value)"
                />
              </div>
            </div>
          </div>

        </div>

        <!-- 操作栏 -->
        <div class="toolbar">
          <!-- 新增按钮带下拉 -->
          <div class="tool-btn-wrapper">
            <button class="tool-btn primary" @click="openAddCaseModal">+ 新增</button>
          </div>
          <button class="tool-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            设置
          </button>
          <button class="tool-btn" @click="openSyncCaseModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
            </svg>
            同步用例
          </button>
          <button class="tool-btn" @click="openBatchExecModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            批量执行
          </button>
          <button class="tool-btn" @click="openExecResultDrawer">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            执行结果
          </button>
          <!-- 批量操作带下拉 -->
          <div
            class="tool-btn-wrapper"
            style="position: relative;"
            @mouseenter="openBatchOperation"
            @mouseleave="() => setTimeout(closeBatchOperation, 80)"
          >
            <button 
              class="tool-btn" 
              :class="{ disabled: selectedCases.length === 0 }"
              ref="batchOpTriggerRef"
              @click="toggleBatchOperation"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M10 9v6l5-3-5-3zm0 10c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-16C5.58 3 2 6.58 2 11s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z"/>
              </svg>
              批量操作
            </button>
            <!-- 批量操作下拉（Teleport 到 body，避免被容器遮挡） -->
            <teleport to="body">
              <div
                v-if="showBatchOperationDropdown && !isBatchOperationDisabled"
                class="batch-operation-dropdown"
                :style="batchOpDropdownStyle"
                @mouseenter="onBatchOpDropdownEnter"
                @mouseleave="onBatchOpDropdownLeave"
              >
              <div class="dropdown-item" @click="batchDelete">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                删除
              </div>
              <div class="dropdown-item" @click="batchMove">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M10 9v6l5-3-5-3zm0 10c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-16C5.58 3 2 6.58 2 11s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z"/>
                </svg>
                移动
              </div>
              <div class="dropdown-item" @click="batchEdit">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                编辑
              </div>
              <div class="dropdown-item" @click="batchCopy">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                复制
              </div>
            </div>
            </teleport>
          </div>
          <button class="tool-btn" @click="openCustomHeaderModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/>
            </svg>
            自定义表头
          </button>
        </div>

        <!-- 表格 -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="col-checkbox">
                  <input 
                    type="checkbox" 
                    :checked="selectedCases.length === caseData.length && caseData.length > 0"
                    @change="toggleSelectAll"
                  />
                </th>
                <th v-if="isHeaderVisible('id')" class="col-id">用例编号</th>
                <th v-if="isHeaderVisible('name')" class="col-name">用例名称</th>
                <th v-if="isHeaderVisible('type')" class="col-type">类型</th>
                <th v-if="isHeaderVisible('caseSet')" class="col-set">所属用例集</th>
                <th v-if="isHeaderVisible('app')" class="col-app">关联项目</th>
                <th v-if="isHeaderVisible('tag')" class="col-tag">标签</th>
                <th v-if="isHeaderVisible('steps')" class="col-steps">步骤数</th>
                <th v-if="isHeaderVisible('tasks')" class="col-tasks">任务数</th>
                <th v-if="isHeaderVisible('execCount')" class="col-exec">执行次数</th>
                <th v-if="isHeaderVisible('result')" class="col-result">结果</th>
                <th v-if="isHeaderVisible('creator')" class="col-creator">创建人</th>
                <th v-if="isHeaderVisible('createTime')" class="col-time">创建时间</th>
                <th v-if="isHeaderVisible('updateTime')" class="col-update">更新时间</th>
                <th v-if="isHeaderVisible('priority')" class="col-priority">优先级</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in caseData"
                :key="row.id"
                :draggable="canDragCaseSort"
                :class="{
                  'is-dragging': draggingCaseId === String(row.id),
                  'is-drag-over': dragOverCaseId === String(row.id),
                  'is-drop-flash': dropFlashCaseId === String(row.id),
                  'is-drag-disabled': !canDragCaseSort
                }"
                @dragstart="handleCaseRowDragStart(row)"
                @dragover.prevent="handleCaseRowDragOver(row)"
                @drop.prevent="handleCaseRowDrop(row)"
                @dragend="handleCaseRowDragEnd"
              >
                <td class="col-checkbox">
                  <input 
                    type="checkbox" 
                    :checked="selectedCases.includes(row.id)"
                    @change="toggleSelect(row.id)"
                  />
                </td>
                <td v-if="isHeaderVisible('id')" class="col-id">{{ row.id }}</td>
                <td v-if="isHeaderVisible('name')" class="col-name">
                  <a
                    href="javascript:;"
                    class="link"
                    :class="{ 'link--routing': navigatingCaseId === row.id }"
                    @click="goToCaseConfig(row.id)"
                  >
                    {{ row.name }}
                  </a>
                </td>
                <td v-if="isHeaderVisible('type')" class="col-type">{{ row.type }}</td>
                <td v-if="isHeaderVisible('caseSet')" class="col-set">{{ row.caseSet }}</td>
                <td v-if="isHeaderVisible('app')" class="col-app">{{ row.app }}</td>
                <td v-if="isHeaderVisible('tag')" class="col-tag">{{ row.tag || 'NA' }}</td>
                <td v-if="isHeaderVisible('steps')" class="col-steps">{{ row.steps }}</td>
                <td v-if="isHeaderVisible('tasks')" class="col-tasks">{{ row.tasks }}</td>
                <td v-if="isHeaderVisible('execCount')" class="col-exec">{{ row.execCount }}</td>
                <td v-if="isHeaderVisible('result')" class="col-result">
                  <span :class="['result-tag', row.result === '正确' ? 'success' : row.result === '-' ? 'none' : 'fail']">
                    {{ row.result }}
                  </span>
                </td>
                <td v-if="isHeaderVisible('creator')" class="col-creator">{{ row.creator }}</td>
                <td v-if="isHeaderVisible('createTime')" class="col-time">{{ row.createTime }}</td>
                <td v-if="isHeaderVisible('updateTime')" class="col-update">{{ row.updateTime }}</td>
                <td v-if="isHeaderVisible('priority')" class="col-priority">{{ row.priority }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <AppPagination
            :current-page="casePage"
            :page-size="casePageSize"
            :total="caseTotal"
            :page-size-options="pageSizeOptions"
            @page-change="handleCasePageChange"
            @page-size-change="handleCasePageSizeChange"
          />
        </div>
      </main>
    </div>

    <!-- 新增/编辑用例弹窗（AntD 风格组件，Teleport 到 body，避免被外层容器影响） -->
    <teleport to="body">
      <AddEditCaseModal
        v-model:visible="showAddCaseModal"
        v-model:modelValue="editingCase"
        :mode="caseModalMode"
        :default-suite="currentSuite"
        @close="closeAddCaseModal"
        @save="handleSaveCase"
      />
    </teleport>

    <!-- 新增用例集弹窗 -->
    <AddSuiteModal
      :visible="showAddSuiteModal"
      :project-id="currentProjectId"
      :mode="suiteModalMode"
      :suite="editingSuite"
      :default-parent-id="defaultParentSuiteId"
      :default-parent-suite="defaultParentSuite"
      @close="closeAddSuiteModal"
      @saved="createSuiteFromModal"
    />

    <!-- 同步用例弹窗 -->
    <div v-if="showSyncCaseModal" class="modal-overlay" @click.self="closeSyncCaseModal">
      <div class="modal-container sync-case-modal">
        <div class="modal-header">
          <h3 class="modal-title">同步用例</h3>
          <button class="modal-close" @click="closeSyncCaseModal">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-item required">
            <label class="form-label">
              <span class="required-star">*</span>
              平台选择:
            </label>
            <select v-model="syncCaseForm.platform" class="form-select">
              <option value="">请选择</option>
              <option v-for="opt in platformOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeSyncCaseModal">取消</button>
          <button class="btn-save-go" @click="submitSyncCase">提交</button>
        </div>
      </div>
    </div>

    <!-- 批量执行弹窗 -->
    <div v-if="showBatchExecModal" class="modal-overlay" @click.self="closeBatchExecModal">
      <div class="modal-container batch-exec-modal">
        <div class="modal-header">
          <h3 class="modal-title">批量执行</h3>
          <button class="modal-close" @click="closeBatchExecModal">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form class="case-form">
            <!-- 通知方式 -->
            <div class="form-item">
              <label class="form-label">通知方式:</label>
              <div class="radio-group">
                <label class="radio-item">
                  <input type="radio" v-model="batchExecForm.notifyType" value="email" />
                  <span class="radio-text">发送邮件</span>
                </label>
                <label class="radio-item">
                  <input type="radio" v-model="batchExecForm.notifyType" value="dd" />
                  <span class="radio-text">咚咚消息</span>
                </label>
                <label class="radio-item">
                  <input type="radio" v-model="batchExecForm.notifyType" value="both" />
                  <span class="radio-text">咚咚+邮件</span>
                </label>
              </div>
            </div>

            <!-- 邮件通知 -->
            <div class="form-item">
              <label class="form-label">邮件通知:</label>
              <input 
                v-model="batchExecForm.emailNotify" 
                type="text" 
                class="form-input" 
                placeholder="请填写完整邮箱地址，多个以;分隔"
              />
            </div>

            <!-- 通知策略 -->
            <div class="form-item">
              <label class="form-label">通知策略:</label>
              <select v-model="batchExecForm.notifyStrategy" class="form-select">
                <option value="all">全部发送结果通知</option>
                <option value="fail">仅失败时通知</option>
                <option value="success">仅成功时通知</option>
              </select>
            </div>

            <!-- 执行间隔 -->
            <div class="form-item">
              <label class="form-label">执行间隔:</label>
              <div class="input-with-suffix">
                <input 
                  v-model="batchExecForm.execInterval" 
                  type="number" 
                  class="form-input" 
                  placeholder=""
                />
                <span class="input-suffix">秒</span>
              </div>
            </div>

            <!-- 执行顺序 -->
            <div class="form-item">
              <label class="form-label">执行顺序:</label>
              <select v-model="batchExecForm.execOrder" class="form-select">
                <option value="parallel">并行</option>
                <option value="serial">串行</option>
              </select>
            </div>

            <!-- 中断策略 -->
            <div class="form-item">
              <label class="form-label">中断策略:</label>
              <select v-model="batchExecForm.breakStrategy" class="form-select">
                <option value="ignore">忽略错误继续执行</option>
                <option value="stop">遇到错误停止执行</option>
              </select>
            </div>

            <!-- HOST配置 -->
            <div class="form-item">
              <label class="form-label">HOST配置:</label>
              <input 
                v-model="batchExecForm.hostConfig" 
                type="text" 
                class="form-input" 
                placeholder="请填写需要配置的host配置，多个host以;分隔"
              />
            </div>

            <!-- 执行环境 -->
            <div class="form-item">
              <label class="form-label">执行环境:</label>
              <div class="input-with-icon">
                <select v-model="batchExecForm.execEnv" class="form-select">
                  <option value="test">测试站</option>
                  <option value="uat">UAT环境</option>
                  <option value="prod">生产环境</option>
                </select>
                <svg class="input-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>

            <!-- 特性环境 -->
            <div class="form-item">
              <label class="form-label">特性环境:</label>
              <input 
                v-model="batchExecForm.featureEnv" 
                type="text" 
                class="form-input" 
                placeholder="请选择环境，可输入"
              />
            </div>

            <!-- 执行命令 -->
            <div class="form-item">
              <label class="form-label">执行命令:</label>
              <input 
                v-model="batchExecForm.execCommand" 
                type="text" 
                class="form-input" 
                placeholder="仅自定义框架代码用例生效,不填写默认使用用例命..."
              />
            </div>

            <!-- 变量选择 -->
            <div class="form-item">
              <label class="form-label">变量选择:</label>
              <div class="double-select">
                <select v-model="batchExecForm.variable1" class="form-select">
                  <option value="">请选择</option>
                </select>
                <select v-model="batchExecForm.variable2" class="form-select">
                  <option value="">请选择</option>
                </select>
              </div>
            </div>

            <!-- 关联行云需求 -->
            <div class="form-item">
              <label class="form-label">关联行云需求:</label>
              <button type="button" class="add-btn">+</button>
            </div>

            <!-- 测试阶段 -->
            <div class="form-item">
              <label class="form-label">测试阶段:</label>
              <select v-model="batchExecForm.testStage" class="form-select">
                <option value="">请选择</option>
                <option value="unit">单元测试</option>
                <option value="integration">集成测试</option>
                <option value="system">系统测试</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn-save" @click="confirmBatchExec">确认并执行</button>
        </div>
      </div>
    </div>

    <!-- 执行结果抽屉 -->
    <div v-if="showExecResultDrawer" class="drawer-overlay" @click.self="closeExecResultDrawer">
      <div class="drawer-container">
        <div class="drawer-header">
          <h3 class="drawer-title">用例集执行记录</h3>
          <div class="drawer-info">
            <span>用例集ID: 851847</span>
            <span>名称: <a href="javascript:;" class="link">授权管理/取消授权</a></span>
            <label class="checkbox-item">
              <input type="checkbox" />
              新标签页打开执行结果
            </label>
            <input type="text" class="filter-input" placeholder="关联行云需求" />
          </div>
          <button class="drawer-close" @click="closeExecResultDrawer">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="drawer-body">
          <!-- 搜索栏 -->
          <div class="drawer-search">
            <div class="search-item">
              <span>关键字:</span>
              <input type="text" placeholder="支持编号/名称等关键字查询" />
            </div>
            <div class="search-item">
              <span>执行人:</span>
              <select>
                <option>请输入 ERP,支...</option>
              </select>
            </div>
            <div class="search-item">
              <span>日期:</span>
              <input type="date" value="2026-02-25" />
              <span>→</span>
              <input type="date" value="2026-03-03" />
            </div>
            <button class="btn-query">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              查询
            </button>
            <button class="btn-reset">重置</button>
            <label class="auto-refresh">
              <input type="checkbox" />
              自动刷新
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            </label>
          </div>
          <!-- 表格 -->
          <div class="drawer-table">
            <table>
              <thead>
                <tr>
                  <th class="col-checkbox"><input type="checkbox" /></th>
                  <th>编号</th>
                  <th>状态</th>
                  <th>名称</th>
                  <th>环境</th>
                  <th>执行人</th>
                  <th>来源</th>
                  <th>耗时(秒)</th>
                  <th>执行时间</th>
                  <th>用例结果 <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg></th>
                  <th>步骤结果 <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg></th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="11" class="empty-cell">
                    <div class="empty-state">
                      <svg viewBox="0 0 24 24" width="48" height="48" fill="#ddd">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                      <p>暂无数据</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义表头弹窗 -->
    <div v-if="showCustomHeaderModal" class="modal-overlay" @click.self="closeCustomHeaderModal">
      <div class="modal-container custom-header-modal">
        <div class="modal-header">
          <h3 class="modal-title">设置显示的列</h3>
          <button class="modal-close" @click="closeCustomHeaderModal">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="header-config">
            <!-- 左侧选择区 -->
            <div class="header-select-area">
              <!-- 基本信息组 -->
              <div class="header-group">
                <label class="group-title">
                  <input 
                    type="checkbox" 
                    :checked="isGroupChecked('基本信息')"
                    @change="e => toggleGroup('基本信息', e.target.checked)"
                  />
                  <span>基本信息</span>
                </label>
                <div class="group-items">
                  <label v-for="header in draftCustomHeaders.filter(h => h.group === '基本信息')" :key="header.key" class="header-item">
                    <input type="checkbox" v-model="header.checked" />
                    <span>{{ header.label }}</span>
                  </label>
                </div>
              </div>

              <!-- 执行信息组 -->
              <div class="header-group">
                <label class="group-title">
                  <input 
                    type="checkbox" 
                    :checked="isGroupChecked('执行信息')"
                    @change="e => toggleGroup('执行信息', e.target.checked)"
                  />
                  <span>执行信息</span>
                </label>
                <div class="group-items">
                  <label v-for="header in draftCustomHeaders.filter(h => h.group === '执行信息')" :key="header.key" class="header-item">
                    <input type="checkbox" v-model="header.checked" />
                    <span>{{ header.label }}</span>
                  </label>
                </div>
              </div>

              <!-- 更新信息组 -->
              <div class="header-group">
                <label class="group-title">
                  <input 
                    type="checkbox" 
                    :checked="isGroupChecked('更新信息')"
                    @change="e => toggleGroup('更新信息', e.target.checked)"
                  />
                  <span>更新信息</span>
                </label>
                <div class="group-items">
                  <label v-for="header in draftCustomHeaders.filter(h => h.group === '更新信息')" :key="header.key" class="header-item">
                    <input type="checkbox" v-model="header.checked" />
                    <span>{{ header.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- 右侧已选字段 -->
            <div class="selected-headers-area">
              <h4>已选择字段</h4>
              <div class="selected-list">
                <div v-for="header in selectedHeaders" :key="header.key" class="selected-item">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
                  </svg>
                  <span>{{ header.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeCustomHeaderModal">取消</button>
          <button class="btn-save-go" @click="confirmCustomHeader">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.casemgmt-page {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

.page-container {
  display: flex;
  height: calc(100vh - 56px);
}

/* 左侧边栏 */
.sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 12px;
  overflow-y: auto;
  position: relative;
  z-index: 100;
}

/* 模块选择下拉 - 圆角样式 */
.module-select-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.module-select-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s;

  &:hover {
    border-color: #1890ff;
  }

  .module-icon {
    color: #666;
  }

  .selected-text {
    flex: 1;
    font-size: 14px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .arrow-icon {
    color: #999;
    transition: transform 0.2s;

    &.open {
      transform: rotate(180deg);
    }
  }
}

/* 下拉菜单 - 圆角 */
.module-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  /* 提高层级，避免被右侧主容器遮挡 */
  z-index: 10000;
  overflow: hidden;
}

.site-tabs {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.site-tab {
  flex: 1;
  padding: 6px 12px;
  border: none;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background: #e6f7ff;
    color: #1890ff;
    font-weight: 500;
  }

  &:hover:not(.active) {
    background: #e8e8e8;
  }
}

.dropdown-search {
  display: flex;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;

  input {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    font-size: 14px;

    &::placeholder {
      color: #999;
    }
  }

  .search-btn, .filter-btn {
    padding: 6px 8px;
    border: 1px solid #d9d9d9;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;
    color: #666;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }
  }
}

.module-list {
  max-height: 280px;
  overflow-y: auto;
}

.module-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }

  &.active {
    background: #e6f7ff;
    color: #1890ff;
  }

  .expand-icon {
    color: #999;
    flex-shrink: 0;
  }

  .module-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.dropdown-footer {
  padding: 10px 12px;
  text-align: center;
  font-size: 14px;
  color: #999;
  border-top: 1px solid #f0f0f0;
}

/* 筛选栏 - 只看自己和菜单按钮一排 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

/* 菜单按钮和下拉 */
.action-menu-wrapper {
  position: relative;
}

.menu-trigger-btn {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  height: 36px;
  width: 36px;
  box-sizing: border-box;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
}

.action-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 200px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 99999;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  background: #fafafa;
}

.dropdown-divider {
  height: 1px;
  background: #f0f0f0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: #f5f5f5;
  }

  .icon {
    font-size: 16px;
    color: #999;
  }

  .icon-svg {
    color: #999;
  }

  .arrow {
    margin-left: auto;
    color: #999;
  }

  .help-icon {
    color: #1890ff;
    margin-left: 4px;
  }
}

.menu-item.has-submenu {
  position: relative;
}

.submenu {
  position: absolute;
  left: calc(100% + 4px);
  top: 0;
  min-width: 140px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 101;
}

.submenu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }

  .check-icon {
    color: #52c41a;
  }
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;

  input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    font-size: 14px;
    height: 36px;
    box-sizing: border-box;

    &::placeholder {
      color: #999;
    }
  }

  .search-btn {
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;
    color: #666;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }
  }

  .reset-link {
    padding: 0 8px;
    font-size: 14px;
    color: #1890ff;
    cursor: pointer;
    background: none;
    border: none;

    &:hover {
      color: #40a9ff;
    }
  }

  .filter-icon-btn {
    padding: 8px;
    border: 1px solid #d9d9d9;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;
    color: #666;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }
  }
}

/* 树形菜单 */
.tree-menu {
  .tree-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 6px 8px;
    cursor: pointer;
    font-size: 14px;
    border-radius: 4px;

    &:hover {
      background: #f5f5f5;
    }

    &.child {
      padding-left: 24px;
    }
  }

  .tree-main {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  .tree-actions {
    display: none;
    align-items: center;
    gap: 4px;
  }

  .tree-item:hover .tree-actions {
    display: inline-flex;
  }

  .tree-action-btn {
    border: none;
    background: transparent;
    padding: 0 4px;
    font-size: 12px;
    color: #999;
    cursor: pointer;

    &:hover {
      color: #1890ff;
    }
  }

  .tree-arrow {
    color: #999;
    transition: transform 0.2s;

    &.expanded {
      transform: rotate(90deg);
    }
  }

  .tree-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tree-count {
    font-size: 13px;
    color: #999;
  }
}

/* 主内容 */
.main-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  position: relative;
  padding-bottom: 84px;
}

/* 标题栏 */
.title-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.content-tabs {
  display: flex;
  gap: 4px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    color: #1890ff;
  }

  &.active {
    color: #1890ff;
    font-weight: 500;
    background: #e6f7ff;
  }
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

/* 搜索筛选 */
.search-filter {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: 14px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
}

.filter-row--more {
  margin-top: 2px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 14px;
    color: #666;
    white-space: nowrap;
    width: 48px;
    text-align: right;
  }

  input {
    padding: 4px 10px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;
    height: 30px;
    line-height: 20px;
    box-sizing: border-box;
    background-color: #fff;
  }
}

.filter-item--keyword input { width: 180px; }
.filter-item--creator input { width: 180px; }
.filter-item--api input { width: 220px; }
.filter-item--tags input { width: 180px; }
.filter-item--updater input { width: 180px; }
.filter-item--method input { width: 200px; }

.filter-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-items: center;
}

.filter-item--range {
  margin-left: 4px;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-inputs input {
  width: 100px;
}

.range-inputs--picker :deep(.el-date-editor) {
  width: 260px;
}

.range-inputs--picker :deep(.el-input__wrapper) {
  height: 30px;
}

.range-sep {
  color: #999;
  user-select: none;
}

.filter-btn, .reset-btn {
  padding: 0 12px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  height: 30px;
  line-height: 28px;
  box-sizing: border-box;
}

.query-btn {
  padding: 0 14px;
  border: none;
  background: #1890ff;
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  height: 30px;
  line-height: 30px;
  box-sizing: border-box;
}

.advanced-link-btn {
  padding: 0 2px;
  border: none;
  background: transparent;
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.advanced-link-btn:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 工具栏 */
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.tool-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  height: 36px;
  box-sizing: border-box;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }

  &.primary {
    background: #1890ff;
    color: #fff;
    border-color: #1890ff;

    &:hover {
      background: #40a9ff;
    }
  }
}

/* 表格 */
.table-container {
  background: #fff;
  border-radius: 8px;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

th, td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

/* 对齐参考站字体（排除：用例名称、任务数、执行次数、结果这四列） */
th:not(.col-name):not(.col-tasks):not(.col-exec):not(.col-result),
td:not(.col-name):not(.col-tasks):not(.col-exec):not(.col-result) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  padding: 12px 8px;
}

th {
  background: #fafafa;
  font-weight: 500;
  color: #666;
  white-space: nowrap;
  font-size: 14px;
}

td {
  font-size: 14px;
}

tbody tr {
  cursor: move;
}

tbody tr.is-drag-disabled {
  cursor: default;
}

tbody tr.is-dragging {
  opacity: 0.55;
}

tbody tr.is-drag-over {
  background: #e6f7ff;
}

tbody tr.is-drop-flash {
  animation: case-drop-flash 0.3s ease-out;
}

@keyframes case-drop-flash {
  0% { background: #d9f7be; }
  100% { background: transparent; }
}

.link {
  color: #1890ff;
  text-decoration: none;
  transition: opacity 0.2s ease, color 0.2s ease;

  &:hover {
    text-decoration: underline;
  }
}

.link--routing {
  opacity: 0.6;
  pointer-events: none;
}

.result-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;

  &.success {
    background: #f6ffed;
    color: #52c41a;
  }

  &.fail {
    background: #fff1f0;
    color: #f5222d;
  }

  &.none {
    color: #999;
  }
}

/* 分页 */
.pagination {
  position: absolute;
  right: 16px;
  bottom: 12px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 0;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.page-btns {
  display: flex;
  gap: 4px;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;

  &.active {
    background: #1890ff;
    color: #fff;
    border-color: #1890ff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.page-ellipsis {
  display: inline-flex;
  align-items: center;
  padding: 0 4px;
  color: #999;
}

.page-size {
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

/* 工具栏按钮样式 */
.tool-btn-wrapper {
  position: relative;
}

.tool-btn {
  svg {
    margin-right: 4px;
    vertical-align: middle;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f5f5f5;
    border-color: #d9d9d9;
    color: #999;
  }
}

/* 批量操作下拉 */
.batch-operation-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 120px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 99999;
  overflow: hidden;

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #f5f5f5;
    }

    svg {
      color: #999;
    }
  }
}

/* 同步用例弹窗 */
.sync-case-modal {
  width: 500px;
}

/* 批量执行弹窗 */
.batch-exec-modal {
  width: 700px;
  max-height: 85vh;
  overflow-y: auto;

  .input-with-suffix {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;

    .form-input {
      flex: 1;
      padding-right: 30px;
    }

    .input-suffix {
      margin-left: 8px;
      color: #666;
      font-size: 14px;
    }
  }

  .input-with-icon {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;

    .form-select {
      flex: 1;
    }

    .input-icon {
      margin-left: 8px;
      color: #1890ff;
    }
  }

  .double-select {
    flex: 1;
    display: flex;
    gap: 12px;

    .form-select {
      flex: 1;
    }
  }

  .add-btn {
    padding: 6px 12px;
    border: 1px solid #d9d9d9;
    background: #fff;
    border-radius: 4px;
    font-size: 14px;
    color: #666;
    cursor: pointer;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }
  }
}

/* 执行结果抽屉 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 20000;
}

.drawer-container {
  position: fixed;
  top: 0;
  right: 0;
  width: 90%;
  height: 100%;
  background: #fff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.drawer-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  font-size: 14px;
  color: #666;

  .link {
    color: #1890ff;
    text-decoration: none;
  }

  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }

  .filter-input {
    padding: 6px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;
    width: 120px;
  }
}

.drawer-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #666;
  }
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.drawer-search {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  .search-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #666;

    input, select {
      padding: 6px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 14px;
    }
  }

  .btn-query {
    padding: 6px 16px;
    border: none;
    background: #1890ff;
    color: #fff;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover {
      background: #40a9ff;
    }
  }

  .btn-reset {
    padding: 6px 16px;
    border: 1px solid #d9d9d9;
    background: #fff;
    border-radius: 4px;
    font-size: 14px;
    color: #666;
    cursor: pointer;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }
  }

  .auto-refresh {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    margin-left: auto;

    svg {
      color: #1890ff;
    }
  }
}

.drawer-table {
  background: #fff;
  border-radius: 8px;
  overflow: auto;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
    }

    th {
      background: #fafafa;
      font-weight: 500;
      color: #666;
      white-space: nowrap;

      svg {
        color: #999;
        vertical-align: middle;
        margin-left: 4px;
      }
    }
  }

  .empty-cell {
    text-align: center;
    padding: 60px 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #999;
  }
}

/* 自定义表头弹窗 */
.custom-header-modal {
  width: 800px;
}

.header-config {
  display: flex;
  gap: 24px;
}

.header-select-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-group {
  .group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    cursor: pointer;

    input[type="checkbox"] {
      width: 16px;
      height: 16px;
    }
  }

  .group-items {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding-left: 24px;
  }
}

.header-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
  }

  &:has(input:checked) {
    color: #1890ff;
  }
}

.selected-headers-area {
  width: 200px;
  border-left: 1px solid #e8e8e8;
  padding-left: 24px;

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin: 0 0 16px 0;
  }
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;

  svg {
    color: #999;
  }
}

/* 响应式 */
@media (max-width: 1100px) {
  .sidebar {
    width: 200px;
    padding: 12px;
  }

  .search-filter {
    flex-wrap: wrap;
    padding: 12px;
  }

  .filter-item input {
    width: 120px;
  }
}

@media (max-width: 900px) {
  .sidebar {
    display: none;
  }

  .main-content {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-wrap: wrap;
  }

  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* 高DPI缩放适配 */
@media (-webkit-min-device-pixel-ratio: 1.25), (min-resolution: 120dpi) {
  .sidebar {
    width: 220px;
    padding: 12px;
  }

  .main-content {
    padding: 16px;
  }

  th, td {
    padding: 8px 6px;
  }
}

/* 新增用例弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
}

.modal-container {
  background: #fff;
  border-radius: 8px;
  width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #666;
  }
}

.modal-body {
  padding: 24px;
}

.case-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  &.required {
    .form-label {
      color: #333;
    }
  }
}

.form-label {
  width: 100px;
  font-size: 14px;
  color: #666;
  padding-top: 8px;
  flex-shrink: 0;

  .required-star {
    color: #f5222d;
    margin-right: 4px;
  }

  .help-icon {
    color: #1890ff;
    margin-left: 4px;
    cursor: help;
  }
}

.form-input,
.form-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  height: 36px;
  box-sizing: border-box;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: #1890ff;
  }
}

.form-textarea {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: #1890ff;
  }
}

.radio-group {
  display: flex;
  gap: 24px;
  padding-top: 6px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;

  input[type="radio"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
}

.tag-section {
  flex: 1;
  padding-top: 6px;
}

.add-tag-btn {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
  cursor: pointer;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  background: #fafafa;
}

.btn-cancel {
  padding: 8px 20px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  height: 36px;
  box-sizing: border-box;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
}

.btn-save {
  padding: 8px 20px;
  border: 1px solid #1890ff;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  color: #1890ff;
  cursor: pointer;
  height: 36px;
  box-sizing: border-box;

  &:hover {
    background: #e6f7ff;
  }
}

.btn-save-go {
  padding: 8px 20px;
  border: none;
  background: #1890ff;
  border-radius: 4px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  height: 36px;
  box-sizing: border-box;

  &:hover {
    background: #40a9ff;
  }
}
</style>
