<script setup>
/**
 * HTTP 测试步骤抽屉 - 参考界面重构版
 */
import { ref, computed, watch, onUnmounted } from 'vue'
import { fetchProjectList } from '@/domains/project/api'
import { Close, Plus, Delete, ArrowRight, More, ArrowDown, ArrowUp, QuestionFilled, Link, EditPen, Right, CopyDocument } from '@element-plus/icons-vue'
import JsonAddDialog from './common/JsonAddDialog.vue'
import BatchEditDialog from './common/BatchEditDialog.vue'
import CurlParser from './CurlParser.vue'
import BodyContent from './BodyContent.vue'
import PresetVariablesTable from './preset/PresetVariablesTable.vue'
import PresetTemplateDialog from './preset/PresetTemplateDialog.vue'
import HttpSettingsPanel from './settings/HttpSettingsPanel.vue'
import GatewayLoginPanel from './settings/GatewayLoginPanel.vue'
import NormalAssert from './Assert/NormalAssert.vue'
import JsonPathAssert from './Assert/JsonPathAssert.vue'
import CompareGroupSettings from './Assert/CompareGroupSettings.vue'
import MysqlStepDrawer from './steps/MysqlStepDrawer.vue'
import DuccStepDrawer from './steps/DuccStepDrawer.vue'
import RedisStepDrawer from './steps/RedisStepDrawer.vue'
import ScriptStepDrawer from './steps/ScriptStepDrawer.vue'
import DelayStepDrawer from './steps/DelayStepDrawer.vue'
import ExtractVarStepDrawer from './steps/ExtractVarStepDrawer.vue'
import ResponseBodyView from './response/ResponseBodyView.vue'
import ResponseHeaderView from './response/ResponseHeaderView.vue'
import ResponseExpectedView from './response/ResponseExpectedView.vue'
import ResponseActualInputView from './response/ResponseActualInputView.vue'
import { usePresetVariablesStore } from '../stores/usePresetVariablesStore'
import { usePresetTemplateStore } from '../stores/usePresetTemplateStore'
import { executeStep } from '../api'

const props = defineProps({
  visible: { type: Boolean, default: false },
  step: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save', 'update:visible'])

const innerVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

// ========== 响应式数据定义（必须在 watch 和 resetForm 之前）==========

// 折叠面板状态
const basicExpanded = ref(true)
const showMoreInfo = ref(false)
const detailExpanded = ref(true)

// 响应区域显示状态
const showResponse = ref(false)

// 响应区域数据
const responseBody = ref('')
const responseHeaders = ref([])
const responseExpected = ref('')
const responseActualInput = ref('')
const responseSuccess = ref(true)
const responseTimeMs = ref(0)
const responseStatusCode = ref(0)
const assertSuccessCount = ref(0)
const assertTotalCount = ref(0)
const responseSummary = ref('')
const responseSummaryDetail = ref('')
const responseSummaryType = ref('success')
const responseSummaryExpanded = ref(false)
const executionResultItems = ref([])
const executionResultExpanded = ref(false)

// 详细信息Tab
const activeDetailTab = ref('input')

// 入参/断言子Tab
const activeInputTab = ref('params')

// 响应Tab
const activeResponseTab = ref('body')

// 基础信息表单数据
const basicForm = ref({
  name: '',
  projectId: null,
  method: 'GET',
  url: '',
  env: '',
  stepDesc: '',
  expectedResult: '',
  jdosApp: '',
  pfinderEnabled: false,
  forcebotEnabled: false
})

// 模块选项（接口所属模块 = 项目列表）
const moduleOptions = ref([])
const moduleLoading = ref(false)

async function loadProjectOptions() {
  if (moduleLoading.value) return
  moduleLoading.value = true
  try {
    const resp = await fetchProjectList({
      project_id: '',
      page: 1,
      page_size: 100
    })
    const list = resp?.data?.data?.list || []
    moduleOptions.value = list.map((item) => ({
      label: item.name,
      value: item.id
    }))
    // 新增模式下如果未选择项目，默认选中第一个项目ID
    if (basicForm.value.projectId == null && moduleOptions.value.length > 0) {
      basicForm.value.projectId = moduleOptions.value[0].value
    }
  } catch (error) {
    void error
  } finally {
    moduleLoading.value = false
  }
}

// HTTP方法选项
const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' }
]

// 断言表单数据
const assertForm = ref({
  compareType: '1',
  compareRule: 'key',
  ruleFormat: 'jsonpath',
  textContent: '',
  ignoreNull: '0',
  ignoreOrder: '0'
})

// 断言表格数据（JSONPath 断言列表）
const assertTableData = ref([])

// A/B 对比组设置
const compareGroupVisible = ref(false)
const compareGroups = ref([
  { id: 1, name: '对比组1', enabled: true }
])

// 多组参数
const paramGroups = ref([
  {
    id: 1,
    name: '第1组',
    checked: true,
    params: [],
    headers: [],
    body: '',
    ipport: '',
    encrypt: '',
    bodyData: {
      contentType: 'raw',
      formData: [],
      urlencoded: [],
      raw: '',
      rawType: 'json',
      binary: null
    }
  }
])
const currentGroupId = ref(1)

// 预设变量（持久化）
const presetVariablesStore = usePresetVariablesStore()
const presetVariables = computed({
  get: () => presetVariablesStore.rows,
  set: (v) => presetVariablesStore.setRows(v)
})

const presetTemplateDialogVisible = ref(false)
const presetTemplateStore = usePresetTemplateStore()

// ===== 前置/后置操作 - 步骤展示（支持多步骤 + 展开/收起全部） =====
const preSteps = ref([])
const postSteps = ref([])

const preCollapseKey = ref(0)
const preAllCollapsed = ref(false)
const postCollapseKey = ref(0)
const postAllCollapsed = ref(false)

// 历史版本对比弹窗（DUCC 使用）
const duccDiffVisible = ref(false)
const dummyLeft = ref('v20260302204818')
const dummyRight = ref('v20260302204843')

// 提取变量步骤的 ref 管理（避免使用函数式 ref）
const extractStepRefs = ref(new Map())

// 计算当前组
const currentGroup = computed(() => {
  return paramGroups.value.find(g => g.id === currentGroupId.value) || paramGroups.value[0]
})

// 重命名弹窗状态
const renameDialogVisible = ref(false)
const renameForm = ref({ id: null, name: '' })

// JSON 添加弹窗状态（参数 / 头 / JSONPATH 通用）
const jsonDialogVisible = ref(false)
const jsonDialogType = ref('params')
const jsonDialogTitle = ref('Json添加Param')
const jsonDialogInitialContent = ref('')
const currentExtractStepId = ref(null)

// 批量编辑弹窗状态
const batchEditVisible = ref(false)

// ========== 函数定义 ==========

const ASSERT_RULE_LABEL_TO_VALUE = {
  等于: 0,
  字符串等于: 1,
  不等于: 2,
  大于: 3,
  大于等于: 4,
  小于: 5,
  小于等于: 6,
  包含: 7,
  不包含: 8,
  被包含: 11,
  长度等于: 12,
  包含键: 13,
  为空: 14,
  非空: 15,
  为空或字符串为空: 18,
  开头是: 19,
  正则匹配: 20,
  表达式为真: 21,
  类型为: 22
}
const ASSERT_TYPE_TO_BACKEND = {
  JSON: 0,
  REGEX: 1,
  HEADER: 2,
  STATUS: 3
}

// 重置表单
function resetForm() {
  basicForm.value = {
    name: '',
    projectId: null,
    method: 'GET',
    url: '',
    env: '',
    stepDesc: '',
    expectedResult: '',
    jdosApp: '',
    pfinderEnabled: false,
    forcebotEnabled: false
  }
  currentGroupId.value = 1
  paramGroups.value = [{
    id: 1,
    name: '第1组',
    checked: true,
    params: [],
    headers: [],
    body: '',
    ipport: '',
    encrypt: '',
    bodyData: {
      contentType: 'raw',
      formData: [],
      urlencoded: [],
      raw: '',
      rawType: 'json',
      binary: null
    }
  }]
  assertForm.value = {
    compareType: '1',
    compareRule: 'key',
    ruleFormat: 'jsonpath',
    textContent: '',
    ignoreNull: '0',
    ignoreOrder: '0'
  }
  assertTableData.value = []
  preSteps.value = []
  postSteps.value = []
}

// 设置提取变量步骤的 ref（避免在模板中使用函数式 ref）
function setExtractStepRef(el, stepId) {
  if (el && stepId) {
    extractStepRefs.value.set(stepId, el)
  }
}

// 移除提取变量步骤的 ref
function removeExtractStepRef(stepId) {
  if (stepId) {
    extractStepRefs.value.delete(stepId)
  }
}

// ========== Watch 定义（在数据定义之后）==========

watch(
  () => props.step,
  (val) => {
    if (!val) {
      // 重置表单
      resetForm()
      return
    }

    // 先确保 paramGroups 已初始化
    if (!paramGroups.value || paramGroups.value.length === 0) {
      resetForm()
    }

    // 获取当前组（必须在 resetForm 之后获取）
    const group = currentGroup.value
    if (!group) {
      console.warn('[HttpStepDrawer] currentGroup is not available')
      return
    }

    // 回填基础信息
    basicForm.value.name = val.name || ''
    basicForm.value.method = val.method || 'GET'
    basicForm.value.url = val.url || ''
    basicForm.value.projectId = val.projectId || null
    basicForm.value.expectedResult = val.expectedResult || ''

    // 回填入参配置
    if (val.inputParams) {
      const inputParams = val.inputParams

      // 处理 params (对象转数组)
      if (inputParams.params && Object.keys(inputParams.params).length > 0) {
        group.params = Object.entries(inputParams.params).map(([key, value]) => ({
          key,
          value: String(value)
        }))
      } else {
        group.params = []
      }

      // 处理 headers (对象转数组)
      if (inputParams.header && Object.keys(inputParams.header).length > 0) {
        group.headers = Object.entries(inputParams.header).map(([key, value]) => ({
          key,
          value: String(value)
        }))
      } else {
        group.headers = []
      }

      // 处理 body
      if (inputParams.body) {
        const body = inputParams.body
        if (body.raw && body.raw.raw_context) {
          try {
            // 尝试解析并格式化 JSON
            const parsed = JSON.parse(body.raw.raw_context)
            group.bodyData.raw = JSON.stringify(parsed, null, 2)
          } catch {
            // 如果不是 JSON，直接显示原始内容
            group.bodyData.raw = body.raw.raw_context
          }
          group.bodyData.contentType = 'raw'
        }
      }
    }

    // 回填断言配置
    if (val.assertion) {
      const backendCompareType = Number(val.assertion.compareType ?? 0)
      assertForm.value.compareType = backendCompareType === 1 ? '2' : '1'
      assertForm.value.compareRule =
        val.assertion.compareRule === 0
          ? 'overall'
          : val.assertion.compareRule === 1
            ? 'key'
            : 'script'
      assertForm.value.ruleFormat = val.assertion.ruleFormat === 0 ? 'text' : 'jsonpath'
      assertForm.value.ignoreNull = String(val.assertion.excludeEmpty ?? 0)
      assertForm.value.ignoreOrder = String(val.assertion.ignoreOrder ?? 0)
      if (Array.isArray(val.assertion.ruleContext)) {
        assertTableData.value = val.assertion.ruleContext.map((item) => ({
          type:
            Number(item?.json_path_assert_type) === 1 ? 'REGEX'
              : Number(item?.json_path_assert_type) === 2 ? 'HEADER'
                : Number(item?.json_path_assert_type) === 3 ? 'STATUS'
                  : (item?.type || 'JSON'),
          field: item?.field || '',
          rule: item?.rule ?? item?.compare_rule ?? '等于',
          expected: item?.expected_value ?? item?.expected ?? '',
          remark: item?.remark || '',
          extractVar: item?.extract_variable ?? item?.extractVar ?? item?.extract_var ?? ''
        }))
      } else {
        assertTableData.value = []
      }

      // 如果有脚本代码，可以在这里处理
      if (val.assertion.scriptCode) {
        // TODO: 脚本断言回填
      }
    }

    // 回填预设变量
    if (val.presetVariables && Object.keys(val.presetVariables).length > 0) {
      const presetVars = Object.entries(val.presetVariables).map(([key, value]) => ({
        name: key,
        value: String(value)
      }))
      // 添加到预设变量 store
      presetVariablesStore.setRows(presetVars)
    }

    // 回填前置操作
    if (val.preOperations && Array.isArray(val.preOperations)) {
      preSteps.value = val.preOperations.map(op => {
        const typeMap = {
          0: 'mysql',
          2: 'redis',
          1: 'ducc', // DUCC 类型
          3: 'script',
          4: 'delay'
        }
        return {
          id: op.id || Date.now() + Math.random(),
          type: typeMap[op.operationType] || 'mysql',
          name: op.name || '前置操作',
          config: op.mysqlConfig || op.redisConfig || op.duccConfig || op.scriptConfig || op.delayConfig
        }
      })
    }

    // 回填后置操作
    if (val.postOperations && Array.isArray(val.postOperations)) {
      postSteps.value = val.postOperations.map(op => {
        const typeMap = {
          0: 'mysql',
          2: 'redis',
          1: 'ducc',
          3: 'script',
          4: 'delay',
          5: 'extract'
        }
        return {
          id: op.id || Date.now() + Math.random(),
          type: typeMap[op.operationType] || 'extract',
          name: op.name || '后置操作',
          config: op.extractConfig || op.mysqlConfig || op.redisConfig || op.duccConfig || op.scriptConfig || op.delayConfig
        }
      })
    }
  },
  { immediate: true }
)

// 每次打开抽屉都拉一次项目列表，展示 name，并持有 id 供保存时传 project_id
watch(
  () => innerVisible.value,
  (visible) => {
    if (visible) {
      void loadProjectOptions()
      ensureParamsEditableRow(currentGroup.value)
      ensureHeadersEditableRow(currentGroup.value)
    }
  }
)

watch(
  () => [currentGroupId.value, activeInputTab.value, paramGroups.value.length],
  () => {
    if (activeInputTab.value === 'params') {
      ensureParamsEditableRow(currentGroup.value)
    } else if (activeInputTab.value === 'headers') {
      ensureHeadersEditableRow(currentGroup.value)
    }
  },
  { immediate: true }
)

function openAssertJsonAdd() {
  // JSON 添加用于断言时，使用专用类型，避免误加到入参
  openJsonDialog('assert-jsonpath')
}

function handleAssertBatchDelete() {
  // 批量删除：可结合表格多选状态实现
  assertTableData.value = []
}

function handlePresetSaveTemplate() {
  // 保存模板时不再清空持久化数据，保持当前 store 内容
}

function handleOpenNewTemplate() {
  presetTemplateDialogVisible.value = true
}

function handleTemplateSave(payload) {
  presetTemplateStore.addTemplate(payload)
}

// 前置/后置操作添加下拉：根据 command 新增步骤
function handlePreActionCommand(command) {
  const index = preSteps.value.length + 1
  preSteps.value.push({
    id: Date.now(),
    type: command,
    name: `操作步骤${index}`
  })
}

function handlePostActionCommand(command) {
  const index = postSteps.value.length + 1
  postSteps.value.push({
    id: Date.now(),
    type: command,
    name: `操作步骤${index}`
  })
}

// 提取变量步骤里的“快捷添加 JSONPATH”
function handleExtractQuickAdd(stepId) {
  currentExtractStepId.value = stepId
  jsonDialogType.value = 'jsonpath'
  jsonDialogTitle.value = '快捷添加 JSONPATH'
  jsonDialogVisible.value = true
}

function togglePreCollapseAll() {
  preAllCollapsed.value = !preAllCollapsed.value
  preCollapseKey.value++
}

function togglePostCollapseAll() {
  postAllCollapsed.value = !postAllCollapsed.value
  postCollapseKey.value++
}

function handlePreStepDelete(id) {
  const idx = preSteps.value.findIndex((s) => s && s.id === id)
  if (idx !== -1) {
    preSteps.value.splice(idx, 1)
  }
}

function handlePreStepCopy(id) {
  const idx = preSteps.value.findIndex((s) => s && s.id === id)
  if (idx !== -1) {
    const step = preSteps.value[idx]
    preSteps.value.splice(idx + 1, 0, {
      ...step,
      id: Date.now(),
      name: (step && step.name ? step.name : `操作步骤${idx + 1}`) + '-copy'
    })
  }
}

function handlePostStepDelete(id) {
  const idx = postSteps.value.findIndex((s) => s && s.id === id)
  if (idx !== -1) {
    postSteps.value.splice(idx, 1)
  }
}

function handlePostStepCopy(id) {
  const idx = postSteps.value.findIndex((s) => s && s.id === id)
  if (idx !== -1) {
    const step = postSteps.value[idx]
    postSteps.value.splice(idx + 1, 0, {
      ...step,
      id: Date.now(),
      name: (step && step.name ? step.name : `操作步骤${idx + 1}`) + '-copy'
    })
  }
}

function openDuccDiff() {
  duccDiffVisible.value = true
}


// 打开 JSON 添加弹窗
function openJsonDialog(type = 'params') {
  if (type === 'jsonpath' || type === 'assert-jsonpath') {
    const bodyText = String(responseBody.value || '').trim()
    if (bodyText) {
      try {
        jsonDialogInitialContent.value = JSON.stringify(JSON.parse(bodyText), null, 2)
      } catch (e) {
        void e
        jsonDialogInitialContent.value = bodyText
      }
    } else {
      jsonDialogInitialContent.value = ''
    }
  } else {
    jsonDialogInitialContent.value = ''
  }
  jsonDialogType.value = type
  jsonDialogTitle.value =
    type === 'jsonpath' || type === 'assert-jsonpath'
      ? '快捷添加 JSONPATH'
      : 'Json添加Param'
  jsonDialogVisible.value = true
}

// 处理 JSON / JSONPATH 保存
function handleJsonSave(selectedItems) {
  if (jsonDialogType.value === 'jsonpath') {
    // 将选中的 JSONPath 填充到当前提取变量步骤中
    const stepId = currentExtractStepId.value
    const comp = stepId && extractStepRefs.value.get(stepId)
    if (comp && typeof comp.addRowsFromJsonpaths === 'function') {
      const paths = (selectedItems || []).map((item) => item.key)
      comp.addRowsFromJsonpaths(paths)
    }
    jsonDialogVisible.value = false
    return
  }

  if (jsonDialogType.value === 'assert-jsonpath') {
    // 将选中的 JSON 字段快速添加为 JSONPath 断言行
    const rows = (selectedItems || []).map((item) => ({
      // JSON 添加后默认：类型=JSON，规则=等于
      type: 'JSON',
      field: item.key?.startsWith('$.') ? item.key : `$.${item.key || ''}`,
      rule: '等于',
      expected: item.value,
      remark: '',
      extractVar: ''
    }))
    if (!Array.isArray(assertTableData.value)) {
      assertTableData.value = []
    }
    assertTableData.value = assertTableData.value.concat(rows)
    jsonDialogVisible.value = false
    return
  }

  const group = currentGroup.value
  if (!group) return

  if (jsonDialogType.value === 'params') {
    selectedItems.forEach((item) => {
      group.params.push(item)
    })
  } else if (jsonDialogType.value === 'headers') {
    selectedItems.forEach((item) => {
      group.headers.push(item)
    })
  }

  // 关闭弹窗
  jsonDialogVisible.value = false
}


// 打开批量编辑弹窗
function openBatchEdit() {
  batchEditVisible.value = true
}

// 处理批量编辑保存
function handleBatchEditSave(selectedItems) {
  const group = currentGroup.value
  if (!group) return
  
  // 根据当前 tab 决定添加到 params 还是 headers
  if (activeInputTab.value === 'params') {
    selectedItems.forEach(item => {
      group.params.push(item)
    })
  } else if (activeInputTab.value === 'headers') {
    selectedItems.forEach(item => {
      group.headers.push(item)
    })
  }
  
  // 关闭弹窗
  batchEditVisible.value = false
}

// 打开重命名弹窗
function openRenameDialog(group) {
  renameForm.value.id = group.id
  renameForm.value.name = group.name
  renameDialogVisible.value = true
}

// 关闭重命名弹窗
function closeRenameDialog() {
  renameDialogVisible.value = false
  renameForm.value = { id: null, name: '' }
}

// 确认重命名
function confirmRename() {
  const group = paramGroups.value.find(g => g.id === renameForm.value.id)
  if (group && renameForm.value.name.trim()) {
    group.name = renameForm.value.name.trim()
  }
  closeRenameDialog()
}

// 复制参数组
function copyGroup(group) {
  const newId = paramGroups.value.length + 1
  const newName = `${group.name}-copy`
  paramGroups.value.push({
    id: newId,
    name: newName,
    checked: group.checked,
    params: JSON.parse(JSON.stringify(group.params || [])),
    headers: JSON.parse(JSON.stringify(group.headers || [])),
    body: group.body || '',
    ipport: group.ipport || '',
    encrypt: group.encrypt || '',
    // Body 数据（使用新的统一结构）
    bodyData: {
      contentType: group.bodyData?.contentType || 'raw',
      formData: JSON.parse(JSON.stringify(group.bodyData?.formData || [])),
      urlencoded: JSON.parse(JSON.stringify(group.bodyData?.urlencoded || [])),
      raw: group.bodyData?.raw || '',
      rawType: group.bodyData?.rawType || 'json',
      binary: group.bodyData?.binary || null
    }
  })
  ensureParamsEditableRow(paramGroups.value[paramGroups.value.length - 1])
}

// 删除参数组
function deleteGroup(groupId) {
  const index = paramGroups.value.findIndex(g => g.id === groupId)
  if (index > -1 && paramGroups.value.length > 1) {
    paramGroups.value.splice(index, 1)
    // 如果删除的是当前选中的组，切换到第一个组
    if (currentGroupId.value === groupId) {
      currentGroupId.value = paramGroups.value[0]?.id || 1
    }
  }
}

function ensureParamsEditableRow(group) {
  if (!group) return
  if (!Array.isArray(group.params)) {
    group.params = []
  }
  if (group.params.length === 0) {
    group.params.push({ key: '', value: '' })
  }
}

function rowHasContent(row) {
  const key = String(row?.key ?? '').trim()
  const value = String(row?.value ?? '').trim()
  return Boolean(key || value)
}

function ensureTrailingEmptyRow(rows) {
  if (!Array.isArray(rows)) return
  if (rows.length === 0) {
    rows.push({ key: '', value: '' })
    return
  }
  const last = rows[rows.length - 1]
  if (rowHasContent(last)) {
    rows.push({ key: '', value: '' })
    return
  }
  // 防止出现多个连续空行
  while (rows.length > 1) {
    const tail = rows[rows.length - 1]
    const prev = rows[rows.length - 2]
    if (!rowHasContent(tail) && !rowHasContent(prev)) {
      rows.splice(rows.length - 1, 1)
    } else {
      break
    }
  }
}

function handleParamRowInput() {
  const group = currentGroup.value
  if (!group || !Array.isArray(group.params)) return
  ensureTrailingEmptyRow(group.params)
}

function handleHeaderRowInput() {
  const group = currentGroup.value
  if (!group || !Array.isArray(group.headers)) return
  ensureTrailingEmptyRow(group.headers)
}

function ensureHeadersEditableRow(group) {
  if (!group) return
  if (!Array.isArray(group.headers)) {
    group.headers = []
  }
  if (group.headers.length === 0) {
    group.headers.push({ key: '', value: '' })
  }
}

function removeParamRow(index) {
  const group = currentGroup.value
  if (!group || !Array.isArray(group.params)) return
  group.params.splice(index, 1)
  ensureTrailingEmptyRow(group.params)
}

function removeHeaderRow(index) {
  const group = currentGroup.value
  if (!group || !Array.isArray(group.headers)) return
  group.headers.splice(index, 1)
  ensureTrailingEmptyRow(group.headers)
}

// 关闭抽屉
function handleClose() {
  emit('update:visible', false)
  emit('close')
}

// 组件卸载时清理 refs
onUnmounted(() => {
  extractStepRefs.value.clear()
})

function normalizePairsToObject(rows = []) {
  const obj = {}
  rows.forEach((row) => {
    const key = row?.key
    if (!key) return
    obj[key] = row?.value ?? ''
  })
  return obj
}

function normalizeAssertion() {
  const compareTypeMap = { '1': 0, '2': 1 }
  const compareRuleMap = { overall: 0, key: 1, script: 2 }
  const ruleFormatMap = { text: 0, jsonpath: 1 }
  const normalizeRuleValue = (rule) => {
    if (typeof rule === 'number' && Number.isFinite(rule)) return rule
    if (typeof rule === 'string') return ASSERT_RULE_LABEL_TO_VALUE[rule] ?? rule
    return 0
  }
  const normalizeRuleContext = (rows = []) =>
    rows
      .map((row) => ({
        json_path_assert_type: ASSERT_TYPE_TO_BACKEND[row?.type] ?? 0,
        field: row?.field || '',
        rule: normalizeRuleValue(row?.rule),
        expected_value: row?.expected ?? '',
        remark: row?.remark || '',
        extract_variable: row?.extractVar ?? row?.extract_variable ?? row?.extract_var ?? ''
      }))
      .filter((row) => row.field)

  return {
    compare_type: compareTypeMap[assertForm.value.compareType] ?? 0,
    compare_rule: compareRuleMap[assertForm.value.compareRule] ?? 2,
    rule_format: ruleFormatMap[assertForm.value.ruleFormat] ?? 1,
    exclude_empty: Number(assertForm.value.ignoreNull ?? 0),
    ignore_order: Number(assertForm.value.ignoreOrder ?? 0),
    rule_text: assertForm.value.textContent || '',
    rule_context: normalizeRuleContext(Array.isArray(assertTableData.value) ? assertTableData.value : []),
    script_code: ''
  }
}

function normalizeInputParams(group) {
  const bodyData = group?.bodyData || {}
  // 后端 ApiInputParams.RAW_TYPE_CHOICES:
  // 0=Json, 1=Text, 2=Xml, 3=Html
  const rawTypeMap = { json: 0, text: 1, xml: 2, html: 3 }
  const contentType = bodyData?.contentType || 'raw'
  const rawType = rawTypeMap[String(bodyData?.rawType || 'json').toLowerCase()] ?? 0
  const isEncrypted =
    group?.encrypt === true ||
    group?.encrypt === 1 ||
    group?.encrypt === '1' ||
    String(group?.encrypt || '').toLowerCase() === 'true'

  let body = {}
  if (contentType === 'raw') {
    body = {
      raw: {
        raw_type: rawType,
        raw_context: bodyData.raw || ''
      }
    }
  } else if (contentType === 'formData' || contentType === 'form-data') {
    body = {
      form_data: Array.isArray(bodyData.formData) ? bodyData.formData : []
    }
  } else if (contentType === 'x-www-form-urlencoded') {
    body = {
      urlencoded: Array.isArray(bodyData.urlencoded) ? bodyData.urlencoded : []
    }
  } else if (contentType === 'none') {
    body = { none: true }
  } else if (contentType === 'binary') {
    body = { binary: bodyData.binary || null }
  }

  return {
    params: normalizePairsToObject(group?.params || []),
    header: normalizePairsToObject(group?.headers || []),
    body,
    raw_type: rawType,
    ip_port: group?.ipport || '',
    is_encrypted: isEncrypted
  }
}

function getSelectedTemplateIds() {
  const single = presetVariablesStore.templateSingle
  if (single !== '' && single != null && Number(single) > 0) {
    return [Number(single)]
  }
  const multi = Array.isArray(presetVariablesStore.templateMulti)
    ? presetVariablesStore.templateMulti
    : []
  const last = multi[multi.length - 1]
  if (last !== '' && last != null && Number(last) > 0) {
    return [Number(last)]
  }
  const fromStep = Number(props.step?.assertion?.templateId)
  if (Number.isFinite(fromStep) && fromStep > 0) {
    return [fromStep]
  }
  return []
}

function collectOperationIds(steps = []) {
  return (Array.isArray(steps) ? steps : [])
    .map((step) => Number(step?.id))
    .filter((id) => Number.isFinite(id) && id > 0)
}

// 保存
function handleSave(action = 'save') {
  const group = currentGroup.value || paramGroups.value[0] || {}
  const payload = {
    id: props.step?.id || null,
    name: basicForm.value.name,
    projectId: basicForm.value.projectId,
    method: basicForm.value.method,
    url: basicForm.value.url,
    expectedResult: basicForm.value.expectedResult,
    environmentId: Number(props.step?.environmentId || props.step?.environment_id || 1),
    maxWaitTime: Number(props.step?.maxWaitTime ?? props.step?.max_wait_time ?? 30),
    retryCount: Number(props.step?.retryCount ?? props.step?.retry_count ?? 0),
    sleepTime: Number(props.step?.sleepTime ?? props.step?.sleep_time ?? 0),
    sortOrder: Number(props.step?.sortOrder ?? props.step?.sort_order ?? 1),
    apiInputParams: normalizeInputParams(group),
    apiAssertion: normalizeAssertion(),
    presetVariables: Object.fromEntries(
      (presetVariables.value || []).map((item) => [item?.name, item?.value ?? '']).filter(([k]) => !!k)
    ),
    preOperations: preSteps.value || [],
    postOperations: postSteps.value || [],
    action
  }
  emit('save', payload)
}

// 切换基础信息展开/收起
function toggleBasic() {
  basicExpanded.value = !basicExpanded.value
}

// 切换更多信息展开/收起
function toggleMoreInfo() {
  showMoreInfo.value = !showMoreInfo.value
}

// 切换详细信息展开/收起
function toggleDetail() {
  detailExpanded.value = !detailExpanded.value
}

const responseTimeClass = computed(() => {
  if (responseTimeMs.value > 3000) {
    return 'meta-item--time-danger'
  }
  if (responseTimeMs.value > 1000) {
    return 'meta-item--time-warn'
  }
  return 'meta-item--time-normal'
})

const responseStatusClass = computed(() => {
  const code = responseStatusCode.value
  if (code >= 200 && code < 300) return 'meta-item--status-2xx'
  if (code >= 300 && code < 400) return 'meta-item--status-3xx'
  if (code >= 400 && code < 500) return 'meta-item--status-4xx'
  if (code >= 500 && code < 600) return 'meta-item--status-5xx'
  return ''
})

const assertRateText = computed(() => {
  if (!assertTotalCount.value) return '0/0'
  return `${assertSuccessCount.value}/${assertTotalCount.value}`
})

const assertRateClass = computed(() => {
  if (assertTotalCount.value && assertSuccessCount.value === assertTotalCount.value) {
    return 'meta-tag--ok'
  }
  return 'meta-tag--partial'
})

const sortedExecutionResultItems = computed(() => {
  return [...executionResultItems.value].sort((a, b) => {
    if (a.ok === b.ok) return 0
    return a.ok ? 1 : -1
  })
})

const displayExecutionResultItems = computed(() => {
  if (executionResultExpanded.value) return sortedExecutionResultItems.value
  return sortedExecutionResultItems.value.slice(0, 1)
})

function safeStringify(value) {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch (e) {
    void e
    return String(value ?? '')
  }
}

function normalizeRuleText(rule) {
  const ruleMap = {
    0: '等于',
    1: '不等于',
    2: '包含',
    3: '不包含',
    4: '大于',
    5: '大于等于',
    6: '小于',
    7: '小于等于'
  }
  if (typeof rule === 'number') return ruleMap[rule] || '等于'
  return String(rule || '等于')
}

function getValueByJsonPath(source, jsonPath) {
  if (!jsonPath || typeof jsonPath !== 'string' || !jsonPath.startsWith('$.')) return undefined
  const segments = jsonPath.slice(2).split('.').filter(Boolean)
  let current = source
  for (let i = 0; i < segments.length; i += 1) {
    const key = segments[i]
    if (current == null || typeof current !== 'object' || !(key in current)) {
      return undefined
    }
    current = current[key]
  }
  return current
}

function buildRuleExecutionItems(ruleContext, responseBody) {
  if (!Array.isArray(ruleContext) || !ruleContext.length) return []
  return ruleContext.map((rule, idx) => {
    const path = String(rule?.json_path || rule?.jsonPath || `$.rule_${idx + 1}`)
    const expectedRaw = rule?.expected_value ?? rule?.expectedValue ?? ''
    const actualRaw = getValueByJsonPath(responseBody, path)
    const passed =
      actualRaw !== undefined &&
      String(actualRaw) === String(expectedRaw ?? '')
    return {
      ok: passed,
      text: `路径: ${path} 规则: ${normalizeRuleText(rule?.compare_rule ?? rule?.compareRule ?? rule?.json_path_assert_type)} 期望: "${String(expectedRaw ?? '')}" 实际: ${safeStringify(actualRaw)}`
    }
  })
}

function buildAssertionExecutionItems(assertionResults, responseBody) {
  if (!Array.isArray(assertionResults) || !assertionResults.length) return []
  return assertionResults.map((item, idx) => {
    const assertionType = String(item?.type || '').toLowerCase()
    if (assertionType === 'script') {
      const logs = Array.isArray(item?.logs)
        ? item.logs.map((v) => String(v ?? '')).filter(Boolean).join(' | ')
        : ''
      const err = String(item?.error_message || '').trim()
      const detail = err || logs
      if (!detail) return null
      return {
        ok: Boolean(item?.passed),
        text: `断言: 脚本 结果: ${Boolean(item?.passed) ? '成功' : '失败'} 详情: ${detail}`
      }
    }
    const path = String(
      item?.json_path ||
      item?.path ||
      item?.field ||
      item?.assert_path ||
      `$.assertion_${idx + 1}`
    )
    const ruleText = String(item?.rule ?? item?.compare_rule ?? item?.assert_rule ?? item?.type ?? 'eq')
    const expectedRaw = item?.expected_value ?? item?.expected ?? item?.expect ?? ''
    const actualRaw =
      item?.actual_value ??
      item?.actual ??
      item?.real ??
      getValueByJsonPath(responseBody, path)
    return {
      ok: Boolean(item?.passed),
      text: `路径: ${path} 规则: ${ruleText} 期望: "${String(expectedRaw ?? '')}" 实际: ${safeStringify(actualRaw)}`
    }
  }).filter(Boolean)
}

function buildExtractedVariableItems(extractedVariables) {
  if (!extractedVariables) return []
  if (typeof extractedVariables === 'string') {
    const parsedList = parseExtractedVariablesString(extractedVariables)
    if (parsedList.length > 0) {
      return parsedList.map((item) => ({
        ok: true,
        text: `提取变量: ${item.name} 值: ${safeStringify(item.value)}`
      }))
    }
    const parsed = parseMaybeJson(extractedVariables)
    if (parsed && parsed !== extractedVariables) {
      return buildExtractedVariableItems(parsed)
    }
    return []
  }
  if (Array.isArray(extractedVariables)) {
    return extractedVariables.map((item, idx) => {
      const varName = String(item?.variable_name ?? item?.name ?? `var_${idx + 1}`)
      const value = item?.value ?? item?.var_value ?? item?.result ?? ''
      return {
        ok: true,
        text: `提取变量: ${varName} 值: ${safeStringify(value)}`
      }
    })
  }
  if (typeof extractedVariables === 'object') {
    return Object.entries(extractedVariables).map(([key, value]) => ({
      ok: true,
      text: `提取变量: ${String(key)} 值: ${safeStringify(value)}`
    }))
  }
  return []
}

function parseExtractedVariablesString(text) {
  const raw = String(text || '').trim()
  if (!raw) return []
  // 兼容: "[{{date}}=2026-03-30 22:06:09,{{uid}}=1001]"
  // 也兼容: "{{date}}=2026-03-30 22:06:09"
  let body = raw
  if (body.startsWith('[') && body.endsWith(']')) {
    body = body.slice(1, -1)
  }
  if (!body.trim()) return []
  return body
    .split(',')
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .map((part, idx) => {
      const eqIndex = part.indexOf('=')
      if (eqIndex < 0) {
        return { name: `var_${idx + 1}`, value: part }
      }
      const name = part.slice(0, eqIndex).trim() || `var_${idx + 1}`
      const value = part.slice(eqIndex + 1).trim()
      return { name, value }
    })
}

function pickExtractedVariables(data) {
  if (!data || typeof data !== 'object') return null
  return (
    data?.extracted_variables ??
    data?.extract_variables ??
    data?.extractedVariables ??
    data?.post_operations_result?.extracted_variables ??
    data?.post_operations_result?.extract_variables ??
    null
  )
}

function normalizeRuleLabel(rule) {
  const ruleText = String(rule ?? '').toLowerCase()
  const ruleMap = {
    eq: '等于',
    ne: '不等于',
    gt: '大于',
    ge: '大于等于',
    lt: '小于',
    le: '小于等于',
    in: '包含',
    not_in: '不包含',
    contain: '包含',
    not_contain: '不包含'
  }
  if (ruleMap[ruleText]) return ruleMap[ruleText]
  return normalizeRuleText(rule)
}

function parseMaybeJson(input) {
  if (typeof input !== 'string') return input
  const text = input.trim()
  if (!text) return input
  if (!(text.startsWith('[') || text.startsWith('{'))) return input
  try {
    return JSON.parse(text)
  } catch (e) {
    void e
    return input
  }
}

function toExpectedLine(item, idx) {
  const path = String(item?.field ?? item?.json_path ?? item?.jsonPath ?? `$.assertion_${idx + 1}`)
  const rule = normalizeRuleLabel(item?.rule ?? item?.compare_rule ?? item?.assert_rule ?? 'eq')
  const expected = String(item?.expected ?? item?.expected_value ?? item?.expect ?? '')
  return `路径: ${path}; 规则: ${rule}\\"${expected}\\"`
}

function formatExpectedResult(expectResult, ruleContext) {
  const parsedExpect = parseMaybeJson(expectResult)
  if (Array.isArray(parsedExpect) && parsedExpect.length) {
    const lines = parsedExpect.map((item, idx) => {
      if (item && typeof item === 'object') {
        return toExpectedLine(item, idx)
      }
      return String(item ?? '')
    })
    return lines.join('\n')
  }
  if (parsedExpect && typeof parsedExpect === 'object') {
    return safeStringify(parsedExpect)
  }
  if (typeof parsedExpect === 'string' && parsedExpect.trim()) {
    return parsedExpect
  }
  if (Array.isArray(ruleContext) && ruleContext.length) {
    const lines = ruleContext.map((item, idx) => toExpectedLine(item, idx))
    return lines.join('\n')
  }
  return typeof ruleContext === 'string' ? ruleContext : safeStringify(ruleContext ?? [])
}

// 测试一下：调用执行步骤接口并回填响应区
async function handleTest() {
  const methodValueMap = {
    GET: 0,
    POST: 1,
    PUT: 2,
    DELETE: 3,
    PATCH: 4,
    HEAD: 5,
    OPTIONS: 6
  }
  const group = currentGroup.value || paramGroups.value[0] || {}
  const templateIds = getSelectedTemplateIds()
  const normalizedPresetVariables = Object.fromEntries(
    (presetVariables.value || []).map((item) => [item?.name, item?.value ?? '']).filter(([k]) => !!k)
  )
  const preOperationIds = collectOperationIds(preSteps.value)
  const postOperationIds = collectOperationIds(postSteps.value)
  const normalizedAssertion = normalizeAssertion()

  // 未保存场景：按 step_data 执行
  const stepDataPayload = {
    name: basicForm.value.name || '',
    step_type: 0,
    api_url: basicForm.value.url || '',
    method: methodValueMap[String(basicForm.value.method || 'GET').toUpperCase()] ?? 0,
    env_code: 0,
    api_input_params_detail: normalizeInputParams(group),
    api_assertion_detail: normalizedAssertion,
    template_id: templateIds,
    preset_variables: normalizedPresetVariables,
    pre_operations_id: preOperationIds,
    post_operations_id: postOperationIds,
    max_wait_time: Number(props.step?.maxWaitTime ?? props.step?.max_wait_time ?? 30)
  }

  const executePayload = { step_data: stepDataPayload }

  try {
    const resp = await executeStep(executePayload)
    const code = resp?.data?.code
    const msg = resp?.data?.msg || ''
    const data = resp?.data?.data || {}

    // 按后端执行接口返回结构精确回填
    const body = data?.response_body ?? {}
    responseBody.value =
      typeof body === 'string' ? body : JSON.stringify(body ?? {}, null, 2)

    const headers = data?.response_headers || {}
    responseHeaders.value = Object.entries(headers).map(([k, v]) => ({
      key: k,
      value: String(v ?? '')
    }))

    const requestParams =
      data?.request_params ??
      stepDataPayload?.api_input_params_detail?.params ??
      {}
    const requestBody =
      data?.request_body ??
      stepDataPayload?.api_input_params_detail?.body?.raw?.raw_context ??
      stepDataPayload?.api_input_params_detail?.body ??
      {}
    const normalizedParams =
      requestParams && typeof requestParams === 'object' && !Array.isArray(requestParams)
        ? requestParams
        : {}
    const normalizedRawBody =
      requestBody && typeof requestBody === 'object'
        ? requestBody
        : parseMaybeJson(String(requestBody || '')) || {}
    const actualInput = {
      params: normalizedParams,
      body: {
        raw: normalizedRawBody
      }
    }
    responseActualInput.value = JSON.stringify(actualInput, null, 2)

    const ruleContext =
      data?.api_assertion_detail?.rule_context ??
      stepDataPayload?.api_assertion_detail?.rule_context ??
      normalizeAssertion().rule_context ??
      []
    const expectResult =
      data?.expectResult ??
      data?.expect_result ??
      data?.expected_result ??
      ''
    responseExpected.value = formatExpectedResult(expectResult, ruleContext)
    responseStatusCode.value = Number(data?.response_status_code ?? 0) || 0
    responseTimeMs.value = Number(data?.response_time_ms ?? 0) || 0

    const assertionResults = Array.isArray(data?.assertion_results) ? data.assertion_results : []
    assertTotalCount.value = assertionResults.length
    assertSuccessCount.value = assertionResults.filter(item => item?.passed === true).length

    responseSuccess.value = (code === 0 || code === 200) && String(data?.status || '') === 'success'
    responseSummaryType.value = responseSuccess.value ? 'success' : 'error'
    responseSummary.value = msg || (responseSuccess.value ? '步骤执行成功' : '步骤执行失败')
    responseSummaryDetail.value =
      data?.execution_summary ||
      [data?.pre_operations_log, data?.post_operations_log, data?.error_message]
        .filter(Boolean)
        .join('\n\n') ||
      JSON.stringify(data || {}, null, 2)
    responseSummaryExpanded.value = false
    executionResultExpanded.value = false
    const bodyObject = data?.response_body && typeof data.response_body === 'object'
      ? data.response_body
      : {}
    const assertionItems = buildAssertionExecutionItems(assertionResults, bodyObject)
    const extractedItems = buildExtractedVariableItems(pickExtractedVariables(data))
    if (assertionItems.length > 0) {
      executionResultItems.value = [...assertionItems, ...extractedItems]
    } else {
      const ruleItems = buildRuleExecutionItems(ruleContext, bodyObject)
      if (ruleItems.length > 0) {
        executionResultItems.value = [...ruleItems, ...extractedItems]
      } else {
        executionResultItems.value = [...extractedItems]
      }
    }
    showResponse.value = true
  } catch (error) {
    void error
    responseSuccess.value = false
    responseSummaryType.value = 'error'
    responseSummary.value = '执行步骤失败'
    responseSummaryDetail.value = '调用 /api/v1/testcases/step/execute 失败，请检查网络或后端日志。'
    responseSummaryExpanded.value = false
    executionResultExpanded.value = false
    executionResultItems.value = [
      { ok: false, text: '路径: $.execute 规则: 等于 期望: "success" 实际: "failed"' }
    ]
    showResponse.value = true
  }
}

// 添加参数组
function addGroup() {
  const newId = paramGroups.value.length + 1
  paramGroups.value.push({
    id: newId,
    name: `第${newId}组`,
    checked: false,  // 新添加的组默认不勾选
    params: [],
    headers: [],
    body: '',
    ipport: '',
    encrypt: '',
    // Body 数据（使用新的统一结构）
    bodyData: {
      contentType: 'raw',
      formData: [],
      urlencoded: [],
      raw: '',
      rawType: 'json',
      binary: null
    }
  })
  // 切换到新添加的组
  currentGroupId.value = newId
  ensureParamsEditableRow(paramGroups.value[paramGroups.value.length - 1])
}

// ================= cURL 解析结果处理 =================

// 处理解析出的 Params，自动添加到当前组的 params 中
function handleParseParams(params) {
  if (!params || Object.keys(params).length === 0) return
  
  const group = currentGroup.value
  if (!group) return
  
  // 将解析出的 params 添加到当前组的 params 数组中
  Object.entries(params).forEach(([key, value]) => {
    // 检查是否已存在相同的 key
    const exists = group.params.some(p => p.key === key)
    if (!exists) {
      group.params.push({
        key: key,
        value: String(value)
      })
    }
  })
  ensureTrailingEmptyRow(group.params)
}

// 处理解析出的 Headers，自动添加到当前组的 headers 中
function handleParseHeaders(headers) {
  if (!headers || Object.keys(headers).length === 0) return
  
  const group = currentGroup.value
  if (!group) return
  
  // 将解析出的 headers 添加到当前组的 headers 数组中
  Object.entries(headers).forEach(([key, value]) => {
    // 检查是否已存在相同的 key
    const exists = group.headers.some(h => h.key === key)
    if (!exists) {
      group.headers.push({
        key: key,
        value: String(value)
      })
    }
  })
  ensureTrailingEmptyRow(group.headers)
}

// 处理解析出的 Body，自动填写到当前组的 body 中
function handleParseBody(body) {
  if (!body || body.trim() === '') return

  const group = currentGroup.value
  if (!group) return

  // 将解析出的 body 设置到当前组的 bodyData.raw 字段，并设置为 raw 类型
  if (!group.bodyData) {
    group.bodyData = {
      contentType: 'raw',
      formData: [],
      urlencoded: [],
      raw: body,
      rawType: 'json',
      binary: null
    }
  } else {
    group.bodyData.contentType = 'raw'
    group.bodyData.raw = body
    group.bodyData.rawType = 'json'
  }
}

// 处理 Body 数据变化
function handleBodyChange(newBodyData) {
  // bodyData 已经通过 v-model 自动更新
  // 这里可以添加额外的处理逻辑
}

// 处理 binary 文件上传
function handleBinaryChange(file) {
  const group = currentGroup.value
  if (!group) return
  
  group.binaryFile = file.raw
  group.binaryFileName = file.name
}

// 清除 binary 文件
function clearBinaryFile() {
  const group = currentGroup.value
  if (!group) return
  
  group.binaryFile = null
  group.binaryFileName = ''
}
</script>

<template>
  <el-drawer
  v-model="innerVisible"
    size="95%"
    :close-on-click-modal="true"
    :destroy-on-close="true"
    @close="handleClose"
    class="http-step-drawer"
  >
    <!-- 头部 -->
    <template #header>
      <div class="drawer-header">
        <el-button link class="close-btn" @click="handleClose">
          <el-icon><Close /></el-icon>
        </el-button>
        <span class="drawer-title">接口用例配置</span>
        <div class="header-actions">
          <el-button size="small">分享</el-button>
          <el-button size="small">另存为</el-button>
        </div>
      </div>
    </template>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 第一个容器：请求信息 -->
      <div class="request-container">
        <!-- 基础信息 -->
        <div class="collapse-section">
          <div class="collapse-header" @click="toggleBasic">
            <el-icon class="collapse-arrow" :class="{ 'is-active': basicExpanded }">
              <ArrowRight />
            </el-icon>
            <span class="collapse-title">基础信息</span>
          </div>
          <div v-show="basicExpanded" class="collapse-content">
            <el-form class="basic-form" label-position="top">
              <!-- 第一排：名称、接口所属模块、接口地址 -->
              <el-row :gutter="16" >
                <el-col :span="6">
                  <el-form-item label="名称" required>
                    <el-input v-model="basicForm.name" placeholder="请输入名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="接口所属项目" required>
                    <el-select
                      v-model="basicForm.projectId"
                      class="w-100"
                      :loading="moduleLoading"
                      placeholder="请选择项目"
                    >
                      <el-option
                        v-for="opt in moduleOptions"
                        :key="opt.value"
                        :label="opt.label"
                        :value="opt.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="接口地址">
                    <template #label>
                      <span>接口地址</span>
                      <el-icon class="label-icon"><Link /></el-icon>
                    </template>
                    <div class="url-input-wrapper">
                      <el-select 
                        v-model="basicForm.method" 
                        class="method-select"
                        :class="`color-${basicForm.method}`"
                      >
                        <el-option
                          v-for="opt in methodOptions"
                          :key="opt.value"
                          :label="opt.label"
                          :value="opt.value"
                          :class="`method-option color-${opt.value}`"
                        />
                      </el-select>
                      <curl-parser
                        v-model="basicForm.url"
                        v-model:method="basicForm.method"
                        @parse:params="handleParseParams"
                        @parse:headers="handleParseHeaders"
                        @parse:body="handleParseBody"
                        class="curl-parser-wrapper"
                      />
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <!-- 第二排：始终显示特性环境、预期结果描述；展开时显示步骤描述、Jdos应用 -->
              <el-row :gutter="16">
                <!-- 特性环境 - 始终显示 -->
                <el-col :span="6">
                  <el-form-item>
                    <template #label>
                      <span>特性环境</span>
                      <el-icon class="label-icon"><QuestionFilled /></el-icon>
                    </template>
                    <el-input v-model="basicForm.env" placeholder="请选择环境，可输入" />
                  </el-form-item>
                </el-col>
                <!-- 步骤描述 - 仅展开时显示 -->
                <el-col v-if="showMoreInfo" :span="6">
                  <el-form-item label="步骤描述">
                    <el-input 
                      v-model="basicForm.stepDesc" 
                      placeholder="步骤描述信息，步骤内容的补充说明"
                      type="textarea"
                      :rows="1"
                    />
                  </el-form-item>
                </el-col>
                <!-- 预期结果描述 - 始终显示 -->
                <el-col :span="6">
                  <el-form-item>
                    <template #label>
                      <span>预期结果描述</span>
                      <el-icon class="label-icon"><QuestionFilled /></el-icon>
                    </template>
                    <el-input 
                      v-model="basicForm.expectedResult" 
                      placeholder="步骤预期结果描述"
                      type="textarea"
                      :rows="1"
                    />
                  </el-form-item>
                </el-col>
                <!-- Jdos应用 - 仅展开时显示 -->
                <el-col v-if="showMoreInfo" :span="6">
                  <el-form-item>
                    <template #label>
                      <span>Jdos应用</span>
                      <el-icon class="label-icon"><QuestionFilled /></el-icon>
                      <el-icon class="label-icon link"><EditPen /></el-icon>
                    </template>
                    <el-input v-model="basicForm.jdosApp" placeholder="请输入Jdos应用名称" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <!-- 第三排：链路追踪、压测标识 - 仅展开时显示 -->
              <el-row v-if="showMoreInfo" :gutter="16">
                <el-col :span="6">
                  <el-form-item label="链路追踪(PFinder)">
                    <el-switch v-model="basicForm.pfinderEnabled" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="压测标识(ForceBot)">
                    <el-switch v-model="basicForm.forcebotEnabled" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <!-- 更多信息/隐藏信息链接 -->
              <div class="more-link">
                <el-link v-if="!showMoreInfo" type="primary" @click="toggleMoreInfo">更多信息</el-link>
                <el-link v-else type="primary" @click="toggleMoreInfo">隐藏信息</el-link>
              </div>
            </el-form>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="collapse-section">
          <div class="collapse-header" @click="toggleDetail">
            <el-icon class="collapse-arrow" :class="{ 'is-active': detailExpanded }">
              <ArrowRight />
            </el-icon>
            <span class="collapse-title">详细信息</span>
          </div>
          <div v-show="detailExpanded" class="collapse-content detail-content">
            <el-tabs v-model="activeDetailTab" class="detail-tabs">
              <el-tab-pane label="入参/断言" name="input">
                <div class="input-assert-wrapper">
                  <!-- 组选择器 -->
                  <div class="group-selector">
                    <el-icon class="help-icon"><QuestionFilled /></el-icon>
                    <el-button link type="primary" @click="addGroup">添加</el-button>
                    <div class="group-list">
                      <div 
                        v-for="group in paramGroups" 
                        :key="group.id"
                        class="group-item-wrapper"
                        :class="{ active: currentGroupId === group.id }"
                      >
                        <el-button-group class="group-button-group">
                          <!-- 组名按钮（带复选框） -->
                          <el-button 
                            class="group-name-btn"
                            @click="currentGroupId = group.id"
                          >
                            <el-checkbox 
                              v-model="group.checked" 
                              :label="group.id"
                              @click.stop
                            >
                              {{ group.name }}
                            </el-checkbox>
                          </el-button>
                          <!-- 更多操作按钮（三个竖着的点） -->
                          <el-dropdown trigger="hover" placement="bottom">
                            <el-button class="group-more-btn">
                              <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                                <path d="M456 231a56 56 0 10112 0 56 56 0 10-112 0zm0 280a56 56 0 10112 0 56 56 0 10-112 0zm0 280a56 56 0 10112 0 56 56 0 10-112 0z"></path>
                              </svg>
                            </el-button>
                            <template #dropdown>
                              <el-dropdown-menu>
                                <el-dropdown-item @click="openRenameDialog(group)">
                                  <el-icon><EditPen /></el-icon> 重命名
                                </el-dropdown-item>
                                <el-dropdown-item @click="copyGroup(group)">
                                  <el-icon><CopyDocument /></el-icon> 复制
                                </el-dropdown-item>
                                <el-dropdown-item 
                                  divided 
                                  @click="deleteGroup(group.id)"
                                  :disabled="paramGroups.length <= 1"
                                >
                                  <el-icon><Delete /></el-icon> 删除
                                </el-dropdown-item>
                              </el-dropdown-menu>
                            </template>
                          </el-dropdown>
                        </el-button-group>
                      </div>
                    </div>
                  </div> 
                               
                  <el-row :gutter="16" class="input-assert-row">
                    <!-- 左侧：请求入参 -->
                    <el-col :span="11" class="request-params-col">
                      <el-tabs v-model="activeInputTab" type="border-card" class="params-tabs">
                        <el-tab-pane label="Params" name="params">
                          <div class="key-value-table">
                            <el-table :data="currentGroup.params" size="small" border>
                              <el-table-column label="KEY" min-width="120">
                                <template #header>
                                  <span>KEY</span>
                                  <el-button size="small" class="ml-8" @click="openJsonDialog('params')">JSON添加</el-button>
                                </template>
                                <template #default="{ row }">
                                  <el-input v-model="row.key" size="small" placeholder="请输入Key" @input="handleParamRowInput" />
                                </template>
                              </el-table-column>
                              <el-table-column label="VALUE" min-width="180">
                                <template #default="{ row }">
                                  <el-input
                                    v-model="row.value"
                                    size="small"
                                    placeholder="请输入Value"
                                    @input="handleParamRowInput"
                                  />
                                </template>
                              </el-table-column>
                              <el-table-column label="操作" width="80" align="center">
                                <template #header>
                                  <el-link type="primary" @click="openBatchEdit">批量编辑</el-link>
                                </template>
                                <template #default="{ $index }">
                                  <el-button
                                    v-if="Array.isArray(currentGroup.params) && $index < currentGroup.params.length - 1"
                                    link
                                    type="danger"
                                    size="small"
                                    @click="removeParamRow($index)"
                                  >
                                    <el-icon><Delete /></el-icon>
                                  </el-button>
                                </template>
                              </el-table-column>
                            </el-table>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="Headers" name="headers">
                          <div class="key-value-table">
                            <el-table :data="currentGroup.headers" size="small" border>
                              <el-table-column label="KEY" min-width="120">
                                <template #header>
                                  <span>KEY</span>
                                  <el-button size="small" class="ml-8" @click="openJsonDialog('headers')">JSON添加</el-button>
                                </template>
                                <template #default="{ row }">
                                  <el-input v-model="row.key" size="small" placeholder="请输入Key" @input="handleHeaderRowInput" />
                                </template>
                              </el-table-column>
                              <el-table-column label="VALUE" min-width="180">
                                <template #default="{ row }">
                                  <el-input
                                    v-model="row.value"
                                    size="small"
                                    placeholder="请输入Value"
                                    @input="handleHeaderRowInput"
                                  />
                                </template>
                              </el-table-column>
                              <el-table-column label="操作" width="80" align="center">
                                <template #header>
                                  <el-link type="primary" @click="openBatchEdit">批量编辑</el-link>
                                </template>
                                <template #default="{ $index }">
                                  <el-button
                                    v-if="Array.isArray(currentGroup.headers) && $index < currentGroup.headers.length - 1"
                                    link
                                    type="danger"
                                    size="small"
                                    @click="removeHeaderRow($index)"
                                  >
                                    <el-icon><Delete /></el-icon>
                                  </el-button>
                                </template>
                              </el-table-column>
                            </el-table>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="Body" name="body">
                          <body-content v-model="currentGroup.bodyData" />
                        </el-tab-pane>
                        <el-tab-pane label="IPPort" name="ipport">
                          <div class="ipport-vertical">
                            <div class="ipport-label">IP:PORT</div>
                            <el-input
                              v-model="currentGroup.ipport"
                              type="textarea"
                              :rows="3"
                              placeholder="多个IP:Port请以','分隔"
                            />
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="加密" name="encrypt">
                          <div class="placeholder-content">
                            <span>加密配置区域</span>
                          </div>
                        </el-tab-pane>
                      </el-tabs>
                    </el-col>
                    
                    <!-- 右侧：断言模块 -->
                    <el-col :span="13" class="assert-col">
                      <div class="assert-wrapper">
                        <NormalAssert
                          v-model="assertForm"
                          @open-group-settings="compareGroupVisible = true"
                        />
                        <JsonPathAssert
                          v-if="assertForm.compareType === '1' && assertForm.compareRule === 'key' && assertForm.ruleFormat === 'jsonpath'"
                          v-model="assertTableData"
                          @json-add="openAssertJsonAdd"
                          @batch-delete="handleAssertBatchDelete"
                        />
                      </div>
                    </el-col>
                  </el-row>
                </div>  
              </el-tab-pane>

              <el-tab-pane label="预设变量" name="preset">
                <preset-variables-table
                  v-model="presetVariables"
                  @new-template="handleOpenNewTemplate"
                  @save-template="handlePresetSaveTemplate"
                />
              </el-tab-pane>
              <el-tab-pane label="前置操作" name="pre">
                <div class="prepost-pane">
                  <div class="prepost-toolbar">
                    <el-dropdown trigger="hover" @command="handlePreActionCommand">
                      <el-button size="small" type="primary">
                        添加
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="mysql">MySQL</el-dropdown-item>
                          <el-dropdown-item command="ducc">DUCC</el-dropdown-item>
                          <el-dropdown-item command="redis">REDIS</el-dropdown-item>
                          <el-dropdown-item command="script">自定义脚本</el-dropdown-item>
                          <el-dropdown-item command="delay">延迟时间</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                    <el-button link type="primary" @click="togglePreCollapseAll">
                      {{ preAllCollapsed ? '展开全部' : '收起全部' }}
                    </el-button>
                  </div>
                  <div class="prepost-list">
                    <template v-if="preSteps.length === 0">
                      <el-empty description="暂无前置操作" />
                    </template>
                    <template v-else>
                      <div class="step-list">
                        <template
                          v-for="(step, idx) in preSteps"
                          :key="step && step.id"
                        >
                          <MysqlStepDrawer
                            v-if="step && step.type === 'mysql'"
                            v-model:name="step.name"
                            :index="idx + 1"
                            :collapse-key="preCollapseKey"
                            :collapsed="preAllCollapsed"
                            @delete="handlePreStepDelete(step.id)"
                            @copy="handlePreStepCopy(step.id)"
                          />
                          <DuccStepDrawer
                            v-else-if="step && step.type === 'ducc'"
                            v-model:name="step.name"
                            :index="idx + 1"
                            :collapse-key="preCollapseKey"
                            :collapsed="preAllCollapsed"
                            @delete="handlePreStepDelete(step.id)"
                            @copy="handlePreStepCopy(step.id)"
                            @compare="openDuccDiff"
                          />
                          <RedisStepDrawer
                            v-else-if="step && step.type === 'redis'"
                            v-model:name="step.name"
                            :index="idx + 1"
                            :collapse-key="preCollapseKey"
                            :collapsed="preAllCollapsed"
                            @delete="handlePreStepDelete(step.id)"
                            @copy="handlePreStepCopy(step.id)"
                          />
                          <ScriptStepDrawer
                            v-else-if="step && step.type === 'script'"
                            v-model:name="step.name"
                            :index="idx + 1"
                            :collapse-key="preCollapseKey"
                            :collapsed="preAllCollapsed"
                            @delete="handlePreStepDelete(step.id)"
                            @copy="handlePreStepCopy(step.id)"
                          />
                          <DelayStepDrawer
                            v-else-if="step && step.type === 'delay'"
                            v-model:name="step.name"
                            :index="idx + 1"
                            :collapse-key="preCollapseKey"
                            :collapsed="preAllCollapsed"
                            @delete="handlePreStepDelete(step.id)"
                            @copy="handlePreStepCopy(step.id)"
                          />
                        </template>
                      </div>
                    </template>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="后置操作" name="post">
                <div class="prepost-pane">
                  <div class="prepost-toolbar">
                    <el-dropdown trigger="hover" @command="handlePostActionCommand">
                      <el-button size="small" type="primary">
                        添加
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="mysql">MySQL</el-dropdown-item>
                          <el-dropdown-item command="ducc">DUCC</el-dropdown-item>
                          <el-dropdown-item command="redis">REDIS</el-dropdown-item>
                          <el-dropdown-item command="script">自定义脚本</el-dropdown-item>
                          <el-dropdown-item command="delay">延迟时间</el-dropdown-item>
                          <el-dropdown-item command="extract">提取变量</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                    <el-button link type="primary" @click="togglePostCollapseAll">
                      {{ postAllCollapsed ? '展开全部' : '收起全部' }}
                    </el-button>
                  </div>
                  <div class="prepost-list">
                    <template v-if="postSteps.length === 0">
                      <el-empty description="暂无后置操作" />
                    </template>
                    <template v-else>
                      <div class="step-list">
                        <template
                          v-for="(step, idx) in postSteps"
                          :key="step && step.id"
                        >
                          <MysqlStepDrawer
                            v-if="step && step.type === 'mysql'"
                            v-model:name="step.name"
                            :index="idx + 1"
                            :collapse-key="postCollapseKey"
                            :collapsed="postAllCollapsed"
                            @delete="handlePostStepDelete(step.id)"
                            @copy="handlePostStepCopy(step.id)"
                          />
                          <DuccStepDrawer
                            v-else-if="step && step.type === 'ducc'"
                            v-model:name="step.name"
                            :index="idx + 1"
                            :collapse-key="postCollapseKey"
                            :collapsed="postAllCollapsed"
                            @delete="handlePostStepDelete(step.id)"
                            @copy="handlePostStepCopy(step.id)"
                            @compare="openDuccDiff"
                          />
                          <RedisStepDrawer
                            v-else-if="step && step.type === 'redis'"
                            v-model:name="step.name"
                            :index="idx + 1"
                            :collapse-key="postCollapseKey"
                            :collapsed="postAllCollapsed"
                            @delete="handlePostStepDelete(step.id)"
                            @copy="handlePostStepCopy(step.id)"
                          />
                          <ScriptStepDrawer
                            v-else-if="step && step.type === 'script'"
                            v-model:name="step.name"
                            :index="idx + 1"
                            :collapse-key="postCollapseKey"
                            :collapsed="postAllCollapsed"
                            @delete="handlePostStepDelete(step.id)"
                            @copy="handlePostStepCopy(step.id)"
                          />
                          <ExtractVarStepDrawer
                            v-else-if="step && step.type === 'extract'"
                            v-model:name="step.name"
                            :index="idx + 1"
                            :collapse-key="postCollapseKey"
                            :collapsed="postAllCollapsed"
                            @delete="handlePostStepDelete(step.id)"
                            @copy="handlePostStepCopy(step.id)"
                            :ref="el => setExtractStepRef(el, step.id)"
                          />
                          <DelayStepDrawer
                            v-else-if="step && step.type === 'delay'"
                            v-model:name="step.name"
                            :index="idx + 1"
                            :collapse-key="postCollapseKey"
                            :collapsed="postAllCollapsed"
                            @delete="handlePostStepDelete(step.id)"
                            @copy="handlePostStepCopy(step.id)"
                          />
                        </template>
                      </div>
                    </template>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="设置" name="settings">
                <HttpSettingsPanel />
              </el-tab-pane>
              <el-tab-pane label="网关/登陆" name="gateway">
                <GatewayLoginPanel />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>

      <!-- DUCC 历史版本对比弹窗 -->
      <el-dialog
        v-model="duccDiffVisible"
        title="历史版本对比"
        width="80%"
      >
        <div class="ducc-diff-dialog">
          <div class="ducc-diff-header">
            <el-select v-model="dummyLeft" class="ducc-diff-select" size="small">
              <el-option label="v20260302204818" value="v20260302204818" />
            </el-select>
            <el-select v-model="dummyRight" class="ducc-diff-select" size="small">
              <el-option label="v20260302204843" value="v20260302204843" />
            </el-select>
          </div>
          <div class="ducc-diff-body">
            <div class="ducc-diff-panel">
              <pre class="ducc-diff-code">"label": "14",
"desc": "商城",
"enabled": false</pre>
            </div>
            <div class="ducc-diff-panel">
              <pre class="ducc-diff-code">"label": "14",
"desc": "商城",
"enabled": true</pre>
            </div>
          </div>
        </div>
        <template #footer>
          <el-button @click="duccDiffVisible = false">取消</el-button>
        </template>
      </el-dialog>

      <!-- A/B 对比组设置弹窗 -->
      <CompareGroupSettings
        v-model="compareGroups"
        v-model:visible="compareGroupVisible"
        :base-method="basicForm.method"
        :base-url="basicForm.url"
      />
      <!-- 第二个容器：响应信息（测试后才显示） -->
      <div v-if="showResponse" class="response-container">
        <div class="section-header">
          <span class="section-title">响应信息区域</span>
        </div>
        <!-- 执行结果列表（按设计稿样式） -->
        <div v-if="executionResultItems.length" class="execution-result-list">
          <div
            v-for="(item, idx) in displayExecutionResultItems"
            :key="idx"
            class="execution-result-item"
            :class="item.ok ? 'execution-result-item--ok' : 'execution-result-item--error'"
          >
            <span class="execution-result-icon">{{ item.ok ? '✓' : '✕' }}</span>
            <span class="execution-result-text">{{ item.text }}</span>
            <span
              v-if="idx === 0 && executionResultItems.length > 1"
              class="execution-result-toggle"
              @click="executionResultExpanded = !executionResultExpanded"
            >
              {{ executionResultExpanded ? '收起' : '展开' }}
            </span>
          </div>
        </div>

        <div class="response-tabs">
          <el-tabs v-model="activeResponseTab">
            <el-tab-pane label="响应体" name="body">
              <div class="response-body-container">
                <!-- 响应值 -->
                <div class="response-item">
                  <div class="sub-header">
                    <span class="sub-title">响应值</span>
                  </div>
                  <ResponseBodyView v-model="responseBody" />
                </div>
                <!-- 期望值 -->
                <div class="response-item">
                  <div class="sub-header">
                    <span class="sub-title">期望值</span>
                  </div>
                  <ResponseExpectedView v-model="responseExpected" />
                </div>
                <!-- 实际入参 -->
                <div class="response-item">
                  <div class="sub-header">
                    <span class="sub-title">实际入参</span>
                  </div>
                  <ResponseActualInputView v-model="responseActualInput" />
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="响应头" name="headers">
              <ResponseHeaderView v-model="responseHeaders" />
            </el-tab-pane>
          </el-tabs>
        </div>
        <!-- 响应元信息 -->
        <div class="response-meta" :class="responseSuccess ? 'response-meta--success' : 'response-meta--error'">
          <span class="meta-item">测试站</span>
          <span class="meta-item meta-tag meta-tag--mode">键值</span>
          <span class="meta-item meta-tag" :class="assertRateClass">{{ assertRateText }}</span>
          <span class="meta-item" :class="responseStatusClass">状态码: {{ responseStatusCode }}</span>
          <span class="meta-item" :class="responseTimeClass">响应时间: {{ responseTimeMs }}ms</span>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button type="primary" @click="handleSave('save')">保存</el-button>
        <el-button type="primary" @click="handleSave('saveAndContinue')">保存并继续</el-button>
        <el-button type="danger" @click="handleTest">测试一下</el-button>
        <span class="footer-tip">(多个IP默认直连调用第一个)</span>
        <el-button>分环境测试</el-button>
      </div>
    </template>
    
    <!-- 重命名弹窗 -->
    <el-dialog
      v-model="renameDialogVisible"
      title="分组名称"
      width="400px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-input 
        v-model="renameForm.name" 
        placeholder="请输入分组名称"
        maxlength="50"
        show-word-limit
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeRenameDialog">取消</el-button>
          <el-button type="primary" @click="confirmRename">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- JSON 添加弹窗 -->
    <json-add-dialog
      v-model="jsonDialogVisible"
      :type="jsonDialogType"
      :title="jsonDialogTitle"
      :initial-content="jsonDialogInitialContent"
      @save="handleJsonSave"
    />
    
    <!-- 批量编辑弹窗 -->
    <batch-edit-dialog
      v-model="batchEditVisible"
      @save="handleBatchEditSave"
    />
  </el-drawer>

  <preset-template-dialog
    v-model="presetTemplateDialogVisible"
    @save="handleTemplateSave"
  />
</template>

<style scoped>
/* 头部样式 */
.drawer-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.close-btn {
  font-size: 18px;
  color: #606266;
}

.close-btn:hover {
  color: #409eff;
}

.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-right: auto;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* IPPort：label 在上、输入框在下 */
.ipport-vertical {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ipport-label {
  color: #606266;
  line-height: 1.2;
}

/* 主容器 */
.main-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
  padding: 0 20px 20px;
}

/* 折叠面板样式 - 参考 ant-collapse */
.collapse-section {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
}

.collapse-header {
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.collapse-header:hover {
  background: #ebeef5;
}

.collapse-arrow {
  font-size: 14px;
  color: #606266;
  transition: transform 0.3s;
}

.collapse-arrow.is-active {
  transform: rotate(90deg);
}

.collapse-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.collapse-content {
  padding: 16px;
}

/* 基础信息表单 */
.basic-form :deep(.el-form-item__label) {
  padding-bottom: 4px;
  font-size: 13px;
  color: #606266;
}

.basic-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.basic-form :deep(.el-form-item.is-required .el-form-item__label:before) {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.label-icon {
  font-size: 12px;
  color: #2695F1;
  margin-left: 4px;
  cursor: help;
  vertical-align: middle;
}

.label-icon.link {
  cursor: pointer;
}

/* URL输入组 */
.url-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}

.method-select {
  width: 90px !important;
  flex-shrink: 0;
}

.method-select :deep(.el-input__wrapper) {
  border-radius: 4px 0 0 4px !important;
}

/* HTTP方法颜色 - 选择框中选中的值 */
.method-select.color-GET :deep(.el-input__inner),
.method-select.color-GET :deep(.el-select__selected-item) {
  color: #007F31 !important;
}

.method-select.color-POST :deep(.el-input__inner),
.method-select.color-POST :deep(.el-select__selected-item) {
  color: #AD7A03 !important;
}

.method-select.color-PUT :deep(.el-input__inner),
.method-select.color-PUT :deep(.el-select__selected-item) {
  color: #0053B8 !important;
}

.method-select.color-PATCH :deep(.el-input__inner),
.method-select.color-PATCH :deep(.el-select__selected-item) {
  color: #623497 !important;
}

.method-select.color-DELETE :deep(.el-input__inner),
.method-select.color-DELETE :deep(.el-select__selected-item) {
  color: #8E1A10 !important;
}

/* HTTP方法下拉选项颜色 */
.method-option.color-GET {
  color: #007F31;
}

.method-option.color-POST {
  color: #AD7A03;
}

.method-option.color-PUT {
  color: #0053B8;
}

.method-option.color-PATCH {
  color: #623497;
}

.method-option.color-DELETE {
  color: #8E1A10;
}

.curl-parser-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
}

.curl-parser-wrapper :deep(.curl-input) {
  border-radius: 0 !important;
  border-left: none !important;
  height: 32px;
}

.curl-parser-wrapper :deep(.input-wrapper) {
  width: 100%;
}

/* 更多链接 */
.more-link {
  margin-top: 8px;
}

/* 详细信息区域 */
.detail-content {
  padding: 0;
}

.detail-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 16px;
}

.detail-tabs :deep(.el-tabs__content) {
  padding: 16px;
}

/* 前置/后置操作 Tab 布局 */
.prepost-pane {
  display: flex;
  flex-direction: column;
}

.prepost-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.prepost-list {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  box-sizing: border-box;
}

.step-list {
  width: 100%;
}

/* 前置/后置操作 - 添加按钮更圆润 */
.prepost-toolbar :deep(.el-button--primary) {
  border-radius: 16px;
  padding: 6px 18px;
}

/* 入参/断言布局 */
.input-assert-wrapper {
  display: flex;
  flex-direction: column;
}

/* 组选择器 */
.group-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.help-icon {
  font-size: 14px;
  color: #2695F1;
  cursor: help;
}

.group-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  white-space: nowrap;
  border-radius: 5px;
}

.group-item-wrapper {
  display: inline-flex;
}

/* 按钮组样式 */
.group-button-group {
  display: flex;
}

.group-button-group :deep(.el-button) {
  margin: 0;
}

/* 组名按钮 */
.group-name-btn {
  padding: 5px 12px;
  height: 32px;
}

.group-name-btn :deep(.el-checkbox__label) {
  padding-left: 4px;
}

/* 更多按钮 */
.group-more-btn {
  padding: 5px 8px;
  height: 32px;
}

/* 选中状态 - 覆盖按钮组边框 */
.group-item-wrapper.active .group-name-btn {
  border-color: #409eff;
  background: #ecf5ff;
  color: #409eff;
}

.group-item-wrapper.active .group-name-btn :deep(.el-checkbox__label) {
  color: #409eff;
}

.group-item-wrapper.active .group-more-btn {
  border-color: #409eff;
  background: #ecf5ff;
  color: #409eff;
}

/* 重命名弹窗 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 入参/断言行 */
.input-assert-row {
  display: flex;
}

.request-params-col {
  padding-right: 8px;
}

.params-tabs {
  border-radius: 12px;
  overflow: hidden;
}

.params-tabs :deep(.el-tabs__header) {
  padding: 0;
}

.params-tabs :deep(.el-tabs__content) {
  padding: 0;
}

/* 键值表格 */
.key-value-table {
  width: 100%;
}

.key-value-table :deep(.el-table__header th) {
  background: #fafafa;
}

.key-value-table :deep(.el-input__inner) {
  text-overflow: clip;
  white-space: nowrap;
  overflow-x: auto;
}

.key-value-table :deep(.el-input__wrapper) {
  overflow-x: auto;
  scrollbar-width: thin;
}

.key-value-table :deep(.el-input__wrapper::-webkit-scrollbar) {
  height: 6px;
}

.key-value-table :deep(.el-input__wrapper::-webkit-scrollbar-thumb) {
  background: #cfd3dc;
  border-radius: 6px;
}

.ml-8 {
  margin-left: 8px;
}

.ml-4 {
  margin-left: 4px;
}

.ml-16 {
  margin-left: 16px;
}

/* 断言区域 */
.assert-col {
  border-left: 1px solid rgba(0, 0, 0, 0.06);
  padding-left: 16px;
}

.assert-wrapper :deep(.el-form-item) {
  margin-bottom: 8px;
}

.assert-wrapper :deep(.el-form-item__label) {
  font-size: 13px;
  color: #606266;
}

/* 空状态 */
.empty-body {
  padding: 40px 0;
}

/* 占位符内容 */
.placeholder-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: #909399;
  font-size: 14px;
  padding: 20px;
}

.code-placeholder {
  min-height: 200px;
  background: #f8f9fa;
  font-family: monospace;
}

/* 请求信息容器 */
.request-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 响应信息容器 */
.response-container {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  position: relative;
}

.section-header {
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.response-tabs {
  padding: 16px;
}

.response-body-container {
  display: flex;
  gap: 16px;
}

.response-item {
  flex: 1;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
}

.sub-header {
  padding: 8px 12px;
  border-bottom: 1px dashed #dcdfe6;
  background: #fafafa;
  border-radius: 6px 6px 0 0;
  text-align: center;
}

.sub-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

/* 响应元信息 */
.response-meta {
  position: absolute;
  top: 12px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.response-meta .meta-item {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.response-meta--success {
  color: inherit;
}

.response-meta--error {
  color: inherit;
}

.meta-item--time-normal {
  color: #909399;
}

.meta-item--time-warn {
  color: #fa8c16;
}

.meta-item--time-danger {
  color: #f5222d;
}

.meta-item--status-2xx {
  color: #52c41a;
}

.meta-item--status-3xx {
  color: #fa8c16;
}

.meta-item--status-4xx {
  color: #722ed1;
}

.meta-item--status-5xx {
  color: #f5222d;
}

.meta-tag {
  padding: 2px 10px;
  border-radius: 4px;
  color: #fff;
}

.meta-tag--mode {
  background-color: #ff7a45; /* 橙色，表示键值模式 */
}

.meta-tag--ok {
  background-color: #52c41a; /* 绿色，表示完全正确 */
}

.meta-tag--partial {
  background-color: #fa8c16; /* 橙色，表示部分正确 */
}

/* 响应结果汇总行（断言结果 / 预设变量 / 前置后置等） */
.response-summary {
  margin-top: 8px;
  margin-bottom: 8px;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}

.response-summary-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.response-summary-icon .status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.response-summary-text {
  flex: 1;
}

.response-summary-toggle {
  color: #1890ff;
}

.response-summary-detail {
  margin-top: 4px;
}

.response-summary-detail-text {
  margin: 0;
  white-space: pre-wrap;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

.response-summary--success {
  background-color: #e4ffe4;
  color: #52c41a;
}

.response-summary--success .status-dot {
  background-color: #52c41a;
}

.response-summary--error {
  background-color: #ffeaea;
  color: #ff4d4f;
}

.response-summary--error .status-dot {
  background-color: #ff4d4f;
}

/* 执行结果列表（仿截图） */
.execution-result-list {
  margin: 6px 0 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.execution-result-item {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid;
  border-radius: 2px;
  padding: 5px 10px;
  font-size: 12px;
  line-height: 18px;
}

.execution-result-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  line-height: 1;
  flex: none;
}

.execution-result-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #595959;
}

.execution-result-item--ok {
  color: #389e0d;
  background: #f6ffed;
  border-color: #d9f7be;
}

.execution-result-item--error {
  color: #cf1322;
  background: #fff1f0;
  border-color: #ffd6d6;
}

.execution-result-item--ok .execution-result-icon {
  color: #fff;
  background: #52c41a;
}

.execution-result-item--error .execution-result-icon {
  color: #fff;
  background: #ff4d4f;
}

.execution-result-toggle {
  flex: none;
  font-size: 12px;
  color: #1677ff;
  cursor: pointer;
  user-select: none;
  line-height: 1;
  margin-left: 8px;
}

/* 底部操作栏 */
.drawer-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-tip {
  font-size: 13px;
  color: #999;
}

/* 工具类 */
.w-100 {
  width: 100% !important;
}

.ducc-diff-dialog {
  display: flex;
  flex-direction: column;
  height: 60vh;
}

.ducc-diff-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.ducc-diff-select {
  width: 260px;
}

.ducc-diff-body {
  display: flex;
  gap: 12px;
  flex: 1;
  overflow: hidden;
}

.ducc-diff-panel {
  flex: 1;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 8px;
  background: #fdfdfd;
  overflow: auto;
}

.ducc-diff-code {
  margin: 0;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 12px;
  white-space: pre;
}

/* 覆盖 Element Plus 默认样式 */
:deep(.el-drawer__body) {
  padding: 0;
  overflow-y: auto;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-drawer__footer) {
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  height: 32px;
}

:deep(.el-textarea__inner) {
  min-height: 32px !important;
}
</style>
