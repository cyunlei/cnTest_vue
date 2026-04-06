<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppHeader from '@/shared/ui/organisms/AppHeader.vue'
import AppPagination from '@/shared/ui/organisms/AppPagination.vue'
import HttpStepDrawer from '../components/HttpStepDrawer.vue'
import StepExecuteDrawer from '../components/StepExecuteDrawer.vue'
import CaseSidebar from '../components/CaseSidebar.vue'
import { createStep, deleteStep, executeStep, fetchStepList, fetchStepDetail, fetchTestcaseDetail, updateStep } from '../api'
import { STEP_TYPE, ENV_CODE, HTTP_METHOD } from '../types'
import { fetchProjectList } from '@/domains/project/api'

// 更多步骤类型组件
import HttpStepType from '../components/step-types/HttpStepType.vue'
import MysqlStepType from '../components/step-types/MysqlStepType.vue'
import RedisStepType from '../components/step-types/RedisStepType.vue'
import JmqStepType from '../components/step-types/JmqStepType.vue'
import DubboStepType from '../components/step-types/DubboStepType.vue'
import KafkaStepType from '../components/step-types/KafkaStepType.vue'
import R2mStepType from '../components/step-types/R2mStepType.vue'
import FmqStepType from '../components/step-types/FmqStepType.vue'
import JarStepType from '../components/step-types/JarStepType.vue'
import ShellStepType from '../components/step-types/ShellStepType.vue'
import LoopStepType from '../components/step-types/LoopStepType.vue'
import ConditionStepType from '../components/step-types/ConditionStepType.vue'
import StardbStepType from '../components/step-types/StardbStepType.vue'
import ScheduleJobStepType from '../components/step-types/ScheduleJobStepType.vue'

const route = useRoute()
const router = useRouter()
const caseId = computed(() => route.params.id)
const projectId = computed(() => {
  const raw = route.query.project_id
  const str = Array.isArray(raw) ? raw[0] : raw
  const num = str ? Number(str) : Number.NaN
  return Number.isNaN(num) ? 0 : num
})

const activeTab = ref('scenario')
const caseDetail = ref({
  id: caseId.value || '',
  name: '',
  caseSet: '',
  owner: '',
  createTime: '',
  execSuccess: 0,
  execFail: 0
})

const stepList = ref([])
const stepTotal = ref(0)
const stepPage = ref(1)
const stepPageSize = ref(10)
const stepPageSizeOptions = [10, 20, 50, 100]

const execStrategy = ref('immediate')
const showHttpStepDrawer = ref(false)
const editingHttpStep = ref(null)
const showStepTypeDialog = ref(false)
const selectedStepType = ref(null)
const draggingStepId = ref('')
const dragOverStepId = ref('')
const showStepExecDrawer = ref(false)
const executingStep = ref(null)

function normalizePresetVariableIds(value) {
  return (Array.isArray(value) ? value : [])
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v > 0)
}

function normalizePresetVariablePayload(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const template = normalizePresetVariableIds(value.template)
  const variable = normalizePresetVariableIds(value.variable)
  const projectId = Number(value.project_id)
  const payload = {}
  if (template.length) payload.template = template
  if (variable.length) payload.variable = variable
  if ((template.length || variable.length) && Number.isFinite(projectId) && projectId > 0) {
    payload.project_id = projectId
  }
  return Object.keys(payload).length ? payload : undefined
}

// 项目下拉（module-select-trigger 使用）
const projectOptions = ref([])
const projectLoading = ref(false)
const selectedProjectId = ref(projectId.value || null)

const selectedProjectName = computed(() => {
  const found = projectOptions.value.find(item => item.id === selectedProjectId.value)
  return found ? found.name : '请选择项目'
})

async function loadProjects() {
  if (projectLoading.value) return
  projectLoading.value = true
  try {
    const resp = await fetchProjectList({
      project_id: '',
      page: 1,
      page_size: 100
    })
    const list = resp?.data?.data?.list || []
    projectOptions.value = list

    if (!selectedProjectId.value && list.length > 0) {
      selectedProjectId.value = list[0].id
      router.replace({
        query: {
          ...route.query,
          project_id: String(list[0].id)
        }
      })
    }
  } catch (error) {
    ElMessage.error('加载项目列表失败')
  } finally {
    projectLoading.value = false
  }
}

function handleProjectSelect(id) {
  selectedProjectId.value = id
  router.replace({
    query: {
      ...route.query,
      project_id: String(id)
    }
  })
}

onMounted(() => {
  void loadProjects()
  void loadCaseConfigData()
})

watch(
  () => caseId.value,
  () => {
    stepPage.value = 1
    void loadCaseConfigData()
  }
)

watch(
  () => selectedProjectId.value,
  () => {
    stepPage.value = 1
    void loadCaseConfigData()
  }
)

async function loadCaseConfigData() {
  await Promise.all([loadCaseDetail(), loadStepList()])
}

async function loadCaseDetail() {
  const testcaseId = Number(caseId.value)
  if (!Number.isFinite(testcaseId) || testcaseId <= 0) {
    caseDetail.value = {
      id: '',
      name: '',
      caseSet: '',
      owner: '',
      createTime: '',
      execSuccess: 0,
      execFail: 0
    }
    return
  }

  try {
    const resp = await fetchTestcaseDetail({ case_id: testcaseId })
    const testcase = resp?.data?.data?.testcase
    if (!testcase) return

    caseDetail.value = {
      id: testcase.id ?? testcaseId,
      name: testcase.name || '',
      caseSet: testcase.parent_name || testcase.suite_name || '',
      owner: testcase.creator || '',
      createTime: testcase.created_at || '',
      execSuccess: Number(testcase.exec_success_count ?? testcase.success_count ?? 0) || 0,
      execFail: Number(testcase.exec_fail_count ?? testcase.fail_count ?? 0) || 0
    }
  } catch (error) {
    void error
    ElMessage.error('加载用例详情失败')
  }
}

async function loadStepList() {
  const testcaseId = Number(caseId.value)
  if (!Number.isFinite(testcaseId) || testcaseId <= 0) {
    stepList.value = []
    stepTotal.value = 0
    return
  }

  try {
    const resp = await fetchStepList({
      testcase_id: testcaseId,
      page: stepPage.value,
      page_size: stepPageSize.value
    })
    const data = resp?.data?.data || {}
    const list = data.list || []
    stepTotal.value = Number(data.total ?? list.length ?? 0) || 0
    stepPage.value = Number(data.page ?? stepPage.value) || 1
    stepPageSize.value = Number(data.page_size ?? stepPageSize.value) || stepPageSize.value
    const numericSortOrders = list
      .map(item => item?.sort_order)
      .filter(v => typeof v === 'number' && Number.isFinite(v))
    const hasValidDistinctSortOrder =
      numericSortOrders.length === list.length &&
      new Set(numericSortOrders).size === list.length
    const sortOrderBase = hasValidDistinctSortOrder
      ? Math.min(...numericSortOrders)
      : 0

    stepList.value = list.map((item, index) => ({
      id: String(item.id ?? ''),
      name: item.name || '',
      detail:
        item.detail ||
        [item.method_label, item.api_url].filter(Boolean).join(' | ') ||
        item.api_url ||
        '',
      type: item.step_type_label || '',
      inputGroup: '1/1',
      order:
        hasValidDistinctSortOrder
          ? item.sort_order - sortOrderBase + 1
          : index + 1,
      stepRaw: item
    }))
  } catch (error) {
    void error
    stepList.value = []
    stepTotal.value = 0
    ElMessage.error('加载步骤列表失败')
  }
}

async function handleStepPageChange(page) {
  stepPage.value = page
  await loadStepList()
}

async function handleStepPageSizeChange(pageSize) {
  stepPageSize.value = pageSize
  stepPage.value = 1
  await loadStepList()
}

function buildCreateStepPayloadFromRow(step) {
  const raw = step?.stepRaw || {}
  return {
    name: raw.name || step?.name || '',
    project_id: raw.project_id ?? selectedProjectId.value ?? projectId.value ?? 0,
    environment_id: raw.environment_id ?? 1,
    method: raw.method ?? HTTP_METHOD.GET,
    step_type: raw.step_type ?? STEP_TYPE.HTTP,
    api_url: raw.api_url || '',
    env_code: raw.env_code ?? ENV_CODE.TEST,
    expected_result: raw.expected_result || '',
    testcase_id: Number(caseId.value),
    api_input_params: raw.api_input_params ?? {},
    api_assertion: raw.api_assertion ?? {},
    ...(normalizePresetVariablePayload(raw.preset_variable)
      ? { preset_variable: normalizePresetVariablePayload(raw.preset_variable) }
      : {}),
    pre_operations: raw.pre_operations ?? [],
    post_operations: raw.post_operations ?? [],
    max_wait_time: raw.max_wait_time ?? 30,
    retry_count: raw.retry_count ?? 0,
    sleep_time: raw.sleep_time ?? 0,
    concurrent_num: raw.concurrent_num ?? 0,
    assertion_retry_count: raw.assertion_retry_count ?? 0,
    sort_order: step?.order ? Math.max(0, Number(step.order) - 1) : 0
  }
}

async function handleDeleteStep(step) {
  const stepId = Number(step?.id)
  if (!Number.isFinite(stepId) || stepId <= 0) return

  try {
    const resp = await deleteStep({ step_id: stepId })
    const code = resp?.data?.code
    const msg = resp?.data?.msg
    if (code !== 0 && code !== 200) {
      ElMessage.error(msg || '删除步骤失败')
      return
    }
    ElMessage.success(msg || '删除步骤成功')
    await loadStepList()
  } catch (error) {
    void error
    ElMessage.error('删除步骤失败')
  }
}

async function handleCopyStep(step) {
  try {
    const payload = buildCreateStepPayloadFromRow(step)
    const resp = await createStep(payload)
    const code = resp?.data?.code
    const msg = resp?.data?.msg
    if (code !== 0 && code !== 200) {
      ElMessage.error(msg || '复制步骤失败')
      return
    }
    ElMessage.success(msg || '复制步骤成功')
    await loadStepList()
  } catch (error) {
    void error
    ElMessage.error('复制步骤失败')
  }
}

async function handleExecuteStep(step) {
  executingStep.value = step || null
  showStepExecDrawer.value = true
}

function closeStepExecDrawer() {
  showStepExecDrawer.value = false
}

async function confirmExecuteStep(stepId) {
  if (!Number.isFinite(stepId) || stepId <= 0) return
  try {
    const resp = await executeStep({ step_id: stepId })
    const code = resp?.data?.code
    const msg = resp?.data?.msg
    if (code !== 0 && code !== 200) {
      ElMessage.error(msg || '执行步骤失败')
      return
    }
    ElMessage.success(msg || '执行已触发')
    closeStepExecDrawer()
  } catch (error) {
    void error
    ElMessage.error('执行步骤失败')
  }
}

function handleRowDragStart(step) {
  draggingStepId.value = String(step.id)
}

function handleRowDragOver(step) {
  if (!draggingStepId.value) return
  if (draggingStepId.value === String(step.id)) return
  dragOverStepId.value = String(step.id)
}

function handleRowDragEnd() {
  draggingStepId.value = ''
  dragOverStepId.value = ''
}

async function handleRowDrop(targetStep) {
  const fromId = draggingStepId.value
  const toId = String(targetStep.id)
  if (!fromId || !toId || fromId === toId) {
    handleRowDragEnd()
    return
  }

  const fromIndex = stepList.value.findIndex(step => String(step.id) === fromId)
  const toIndex = stepList.value.findIndex(step => String(step.id) === toId)
  if (fromIndex < 0 || toIndex < 0) {
    handleRowDragEnd()
    return
  }

  const movedStep = stepList.value[fromIndex]
  const targetSortOrder = toIndex

  const newList = [...stepList.value]
  const [moved] = newList.splice(fromIndex, 1)
  newList.splice(toIndex, 0, moved)
  // 本地先更新顺序，提升交互流畅度
  stepList.value = newList.map((item, idx) => ({
    ...item,
    order: idx + 1
  }))

  try {
    // 只更新被拖动的这一步，避免一次拖动触发 N 次 update
    await updateStep({
      step_id: Number(movedStep.id),
      sort_order: targetSortOrder
    })
    ElMessage.success('步骤顺序已更新')
    // 回源刷新，使用后端最终顺序
    await loadStepList()
  } catch (error) {
    void error
    ElMessage.error('更新步骤顺序失败，请重试')
    // 失败后回源刷新，避免前后端顺序不一致
    await loadStepList()
  } finally {
    handleRowDragEnd()
  }
}

// 更多类型下拉选项（1=MySQL, 2=Redis, 3=JMQ, 4=DUBBO, 5=KAFKA, 6=R2M, 7=FMQ, 8=JAR, 9=SHELL, 10=循环, 11=条件, 12=STARDB, 13=SCHEDULEJOB）
// 注意：HTTP(0)已在外部单独展示，不在下拉框中显示
const stepTypeOptions = [
  { label: 'MySQL', value: 1, type: 'MySQL', component: 'MysqlStepType', desc: 'MySQL查询' },
  { label: 'Redis', value: 2, type: 'Redis', component: 'RedisStepType', desc: 'Redis操作' },
  { label: 'JMQ', value: 3, type: 'JMQ', component: 'JmqStepType', desc: 'JMQ消息' },
  { label: 'DUBBO', value: 4, type: 'DUBBO', component: 'DubboStepType', desc: 'Dubbo调用' },
  { label: 'KAFKA', value: 5, type: 'KAFKA', component: 'KafkaStepType', desc: 'Kafka消息' },
  { label: 'R2M', value: 6, type: 'R2M', component: 'R2mStepType', desc: 'R2M缓存' },
  { label: 'FMQ', value: 7, type: 'FMQ', component: 'FmqStepType', desc: 'FMQ消息' },
  { label: 'JAR', value: 8, type: 'JAR', component: 'JarStepType', desc: 'JAR包执行' },
  { label: 'SHELL', value: 9, type: 'SHELL', component: 'ShellStepType', desc: 'Shell脚本' },
  { label: '循环', value: 10, type: '循环', component: 'LoopStepType', desc: '循环控制' },
  { label: '条件', value: 11, type: '条件', component: 'ConditionStepType', desc: '条件判断' },
  { label: 'STARDB', value: 12, type: 'STARDB', component: 'StardbStepType', desc: 'STARDB数据库' },
  { label: 'SCHEDULEJOB', value: 13, type: 'SCHEDULEJOB', component: 'ScheduleJobStepType', desc: '调度任务' }
]

// 步骤类型映射到组件
const stepTypeComponentMap = {
  'HttpStepType': HttpStepType,
  'MysqlStepType': MysqlStepType,
  'RedisStepType': RedisStepType,
  'JmqStepType': JmqStepType,
  'DubboStepType': DubboStepType,
  'KafkaStepType': KafkaStepType,
  'R2mStepType': R2mStepType,
  'FmqStepType': FmqStepType,
  'JarStepType': JarStepType,
  'ShellStepType': ShellStepType,
  'LoopStepType': LoopStepType,
  'ConditionStepType': ConditionStepType,
  'StardbStepType': StardbStepType,
  'ScheduleJobStepType': ScheduleJobStepType
}

function handleNav(path) {
  void path
}

function goBack() {
  router.push('/case-mgmt')
}

function handleSelectSuiteFromSidebar(suite) {
  router.push({
    path: '/case-mgmt',
    query: {
      project_id: route.query.project_id ? String(route.query.project_id) : undefined,
      suite_id: suite?.id ? String(suite.id) : undefined
    }
  })
}

function openHttpStepDrawer() {
  editingHttpStep.value = null
  showHttpStepDrawer.value = true
}

function closeHttpStepDrawer() {
  showHttpStepDrawer.value = false
}

async function saveHttpStep(stepData) {
  try {
    const stepId = Number(stepData?.id)
    const isUpdate = Number.isFinite(stepId) && stepId > 0

    const baseDto = {
      name: stepData.name,
      step_type: STEP_TYPE.HTTP,
      project_id: stepData.projectId || projectId.value,
      testcase_id: Number(caseDetail.value.id),
      environment_id: Number(stepData.environmentId ?? 1),
      env_code: ENV_CODE.TEST,
      api_url: stepData.url,
      method: HTTP_METHOD[stepData.method] ?? HTTP_METHOD.GET,
      expected_result: stepData.expectedResult || '',
      max_wait_time: Number(stepData.maxWaitTime ?? 30),
      retry_count: Number(stepData.retryCount ?? 0),
      sleep_time: Number(stepData.sleepTime ?? 0),
      sort_order: Number(stepData.sortOrder ?? stepList.value.length),
      api_input_params: stepData.apiInputParams || {},
      api_assertion: stepData.apiAssertion || {},
      ...(normalizePresetVariablePayload(stepData.presetVariable)
        ? { preset_variable: normalizePresetVariablePayload(stepData.presetVariable) }
        : {}),
      pre_operations: stepData.preOperations || [],
      post_operations: stepData.postOperations || [],
      config: {},
      pre_post_steps: [],
      testcase_as_pre_post: []
    }

    const dto = isUpdate ? { step_id: stepId, ...baseDto } : baseDto
    const resp = isUpdate ? await updateStep(dto) : await createStep(dto)
    const code = resp?.data?.code
    const msg = resp?.data?.msg

    if (code !== 0 && code !== 200) {
      ElMessage.error(msg || (isUpdate ? '更新步骤失败' : '保存步骤失败'))
      return
    }

    ElMessage.success(msg || (isUpdate ? '更新步骤成功' : '保存步骤成功'))
    await loadStepList()

    if (stepData.action === 'saveAndContinue') {
      // 更新场景：保留当前抽屉输入状态，避免“保存并继续”后被详情回拉覆盖导致看起来被清空
      if (isUpdate) {
        editingHttpStep.value = {
          ...(editingHttpStep.value || {}),
          id: stepId,
          name: stepData.name,
          projectId: stepData.projectId,
          method: stepData.method,
          url: stepData.url,
          expectedResult: stepData.expectedResult,
          environmentId: stepData.environmentId,
          maxWaitTime: stepData.maxWaitTime,
          retryCount: stepData.retryCount,
          sleepTime: stepData.sleepTime,
          sortOrder: stepData.sortOrder,
          inputParams: stepData.apiInputParams || {},
          assertion: stepData.apiAssertion || {},
          presetVariable: stepData.presetVariable,
          preOperations: stepData.preOperations || [],
          postOperations: stepData.postOperations || []
        }
        showHttpStepDrawer.value = true
        return
      }

      // 新建场景：需要拿后端新ID后回拉详情，继续编辑同一步骤
      const targetStepId = Number(resp?.data?.data?.id || resp?.data?.data?.step_id)
      if (Number.isFinite(targetStepId) && targetStepId > 0) {
        const detailResp = await fetchStepDetail({ step_id: targetStepId })
        const detailCode = detailResp?.data?.code
        const detailData = detailResp?.data?.data
        if ((detailCode === 0 || detailCode === 200) && detailData) {
          editingHttpStep.value = transformStepDetailToFrontend(detailData)
          showHttpStepDrawer.value = true
          return
        }
      }
      showHttpStepDrawer.value = true
      return
    }

    closeHttpStepDrawer()
  } catch (error) {
    void error
    ElMessage.error('保存步骤异常')
  }
}

async function openStepDrawer(step) {
  const stepId = Number(step?.id)
  if (!Number.isFinite(stepId) || stepId <= 0) {
    // 新建步骤或无效ID，直接打开空抽屉
    editingHttpStep.value = null
    showHttpStepDrawer.value = true
    return
  }

  try {
    const resp = await fetchStepDetail({ step_id: stepId })
    const code = resp?.data?.code
    const data = resp?.data?.data
    if ((code !== 0 && code !== 200) || !data) {
      ElMessage.error('获取步骤详情失败')
      return
    }
    // 将后端数据转换为前端格式并回填抽屉
    editingHttpStep.value = transformStepDetailToFrontend(data)
    showHttpStepDrawer.value = true
  } catch (error) {
    void error
    ElMessage.error('获取步骤详情失败')
  }
}

/**
 * 将后端步骤详情转换为前端组件需要的格式
 * @param {Object} data - 后端返回的步骤详情数据
 * @returns {Object} 前端组件需要的格式
 */
function transformStepDetailToFrontend(data) {
  // 方法映射：后端 0=GET, 1=POST -> 前端 'GET', 'POST'
  const methodMap = { 0: 'GET', 1: 'POST', 2: 'PUT', 3: 'PATCH', 4: 'DELETE', 5: 'HEAD', 6: 'OPTIONS' }

  // 基础信息
  const result = {
    id: data.id,
    name: data.name || '',
    projectId: data.project_id,
    environmentId: data.environment_id,
    method: methodMap[data.method] || 'GET',
    url: data.api_url || '',
    envCode: data.env_code,
    expectedResult: data.expected_result || '',
    testcaseId: data.testcase_id,
    maxWaitTime: data.max_wait_time ?? 30,
    retryCount: data.retry_count ?? 0,
    sleepTime: data.sleep_time ?? 0,
    concurrentNum: data.concurrent_num ?? 1,
    assertionRetryCount: data.assertion_retry_count ?? 0,
    sortOrder: data.sort_order ?? 1
  }

  // 入参配置
  {
    const inputParams = data.api_input_params_detail || data.api_input_params || null
    if (!inputParams) {
      // no-op
    } else {
    result.inputParams = {
      params: inputParams.params || {},
      header: inputParams.header || {},
      body: inputParams.body || {},
      rawType: inputParams.raw_type ?? 0,
      ipPort: inputParams.ip_port,
      isEncrypted: inputParams.is_encrypted ?? false
    }
    }
  }

  // 断言配置
  {
    const assertion = data.api_assertion_detail || data.api_assertion || null
    if (!assertion) {
      // no-op
    } else {
    result.assertion = {
      compareType: assertion.compare_type ?? 0,
      compareRule: assertion.compare_rule ?? 2,
      ruleFormat: assertion.rule_format ?? 1,
      excludeEmpty: assertion.exclude_empty ?? 0,
      ignoreOrder: assertion.ignore_order ?? 0,
      ignore_paths: assertion.ignore_paths ?? '',
      ruleText: assertion.rule_text,
      ruleContext: assertion.rule_context,
      compare_group: assertion.compare_group ?? assertion.compareGroup ?? null,
      scriptCode: assertion.script_code || '',
      scriptHash: assertion.script_hash,
      templateId: assertion.template_id
    }
    }
  }

  // 预设变量
  result.presetVariable = normalizePresetVariablePayload(data.preset_variable)

  // 前置操作（保留接口原始扁平字段 + 嵌套 config，供 HttpStepDrawer 回填）
  if (data.pre_operations && Array.isArray(data.pre_operations)) {
    result.preOperations = data.pre_operations.map((op) => ({
      ...op,
      id: op.operation_id ?? op.id,
      operation_id: op.operation_id ?? op.id,
      operationType: op.operation_type,
      operationTypeLabel: op.operation_type_label,
      positionLabel: op.position_label,
      sortOrder: op.sort_order,
      isActive: op.is_active,
      mysqlConfig: op.mysql_config,
      redisConfig: op.redis_config,
      duccConfig: op.ducc_config,
      scriptConfig: op.script_config,
      delayConfig: op.delay_config,
      extractConfig: op.extract_config
    }))
  }

  // 后置操作
  if (data.post_operations && Array.isArray(data.post_operations)) {
    result.postOperations = data.post_operations.map((op) => ({
      ...op,
      id: op.operation_id ?? op.id,
      operation_id: op.operation_id ?? op.id,
      operationType: op.operation_type,
      operationTypeLabel: op.operation_type_label,
      positionLabel: op.position_label,
      sortOrder: op.sort_order,
      isActive: op.is_active,
      mysqlConfig: op.mysql_config,
      redisConfig: op.redis_config,
      duccConfig: op.ducc_config,
      scriptConfig: op.script_config,
      delayConfig: op.delay_config,
      extractConfig: op.extract_config
    }))
  }

  return result
}

// 处理更多类型选择
function handleStepTypeSelect(stepType) {
  const typeOption = stepTypeOptions.find(opt => opt.value === stepType)
  if (!typeOption) return

  // 添加到步骤列表并显示类型对话框
  selectedStepType.value = typeOption
  const newStep = {
    id: Date.now().toString(),
    name: typeOption.label + '步骤',
    detail: typeOption.desc,
    type: typeOption.type,
    inputGroup: '1/1',
    order: stepList.value.length + 1,
    stepData: { type: typeOption.value, component: typeOption.component }
  }
  stepList.value.push(newStep)
  stepTotal.value += 1
  ElMessage.success(`已添加 ${typeOption.label} 步骤`)
}

// 打开步骤类型配置对话框
function openStepTypeDialog(step) {
  selectedStepType.value = stepTypeOptions.find(opt => opt.type === step.type) || null
  showStepTypeDialog.value = true
}

function closeStepTypeDialog() {
  showStepTypeDialog.value = false
  selectedStepType.value = null
}
</script>
<template>
  <div class="case-config-page">
    <AppHeader @navigate="handleNav" />
    <div class="page-container">
      <CaseSidebar @selectSuite="handleSelectSuiteFromSidebar" />
      <main class="main-content">
        <div class="title-bar">
          <div class="content-tabs">
            <button :class="['tab-btn', { active: activeTab === 'scenario' }]" @click="activeTab = 'scenario'">场景用例</button>
            <button :class="['tab-btn', { active: activeTab === 'atomic' }]" @click="activeTab = 'atomic'">原子用例</button>
          </div>
        </div>
        <div class="config-header">
          <div class="header-left">
            <button class="back-btn" title="返回" @click="goBack">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h3 class="page-title">用例配置</h3>
            <div class="header-left-actions">
              <button class="action-btn action-btn--mini">分享</button>
              <button class="action-btn action-btn--mini">另存为</button>
            </div>
          </div>
          <div class="header-actions">
            <button class="action-btn primary">设置为原子用例</button>
            <button class="action-btn">执行结果</button>
          </div>
        </div>
        <div class="case-info">
          <div class="info-row">
            <span class="info-label">用例明细:</span>
            <span class="info-value highlight">{{ caseDetail.name }}</span>
            <button class="edit-btn">编辑</button>
          </div>
          <div class="info-grid">
            <div class="info-item"><span class="label">用例ID:</span><span class="value">{{ caseDetail.id }}</span></div>
            <div class="info-item"><span class="label">所属用例集:</span><a class="value link">{{ caseDetail.caseSet }}</a></div>
            <div class="info-item"><span class="label">所属人:</span><span class="value"><span class="user-tag">{{ caseDetail.owner }}</span></span></div>
            <div class="info-item"><span class="label">创建时间:</span><span class="value">{{ caseDetail.createTime }}</span></div>
            <div class="info-item"><span class="label">执行次数:</span><span class="value">成功:{{ caseDetail.execSuccess }}, 失败:<span class="fail">{{ caseDetail.execFail }}</span></span></div>
          </div>
        </div>
        <div class="toolbar-section">
          <div class="toolbar-left">
            <span class="toolbar-label">添加:</span>
            <button class="tool-btn">JSF</button>
            <button class="tool-btn primary" @click="openHttpStepDrawer">HTTP</button>
            <el-dropdown trigger="hover" @command="handleStepTypeSelect">
              <button class="tool-btn">更多类型</button>
              <template #dropdown>
                <el-dropdown-menu class="step-type-dropdown">
                  <el-dropdown-item
                    v-for="opt in stepTypeOptions"
                    :key="opt.value"
                    :command="opt.value"
                    class="step-type-item"
                  >
                    <span class="step-type-label">{{ opt.label }}</span>
                    <span class="step-type-desc">{{ opt.desc }}</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <button class="tool-btn">导入</button>
            <button class="tool-btn">测试物料</button>
            <button class="tool-btn">接口录制</button>
          </div>
          <div class="toolbar-right">
            <button class="tool-btn">前置步骤</button>
            <button class="tool-btn">后置步骤</button>
            <button class="tool-btn">预设变量</button>
            <button class="tool-btn">批量操作</button>
          </div>
        </div>
        <div class="step-table">
          <table>
            <thead>
              <tr>
                <th class="col-checkbox"><input type="checkbox" /></th>
                <th class="col-id">步骤编号</th>
                <th class="col-name">步骤名称</th>
                <th class="col-detail">详细内容</th>
                <th class="col-type">类型</th>
                <th class="col-group">入参分组</th>
                <th class="col-order">顺序</th>
                <th class="col-action">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="step in stepList"
                :key="step.id"
                draggable="true"
                :class="{
                  'is-dragging': draggingStepId === String(step.id),
                  'is-drag-over': dragOverStepId === String(step.id)
                }"
                @dragstart="handleRowDragStart(step)"
                @dragover.prevent="handleRowDragOver(step)"
                @drop.prevent="handleRowDrop(step)"
                @dragend="handleRowDragEnd"
              >
                <td class="col-checkbox"><input type="checkbox" /></td>
                <td class="col-id">{{ step.id }}</td>
                <td class="col-name"><a class="link" @click="openStepDrawer(step)">{{ step.name }}</a></td>
                <td class="col-detail">{{ step.detail }}</td>
                <td class="col-type"><span class="type-tag jsf">{{ step.type }}</span></td>
                <td class="col-group">{{ step.inputGroup }}</td>
                <td class="col-order">{{ step.order }}</td>
                <td class="col-action">
                  <button class="action-icon-btn" title="删除" @click.stop="handleDeleteStep(step)">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                  <button class="action-icon-btn" title="复制" @click.stop="handleCopyStep(step)">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="11" height="11" rx="2" />
                      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                    </svg>
                  </button>
                  <button class="action-icon-btn" title="执行" @click.stop="handleExecuteStep(step)">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M10 8.5L16 12l-6 3.5z" fill="currentColor" stroke="none" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="step-pagination">
          <AppPagination
            :current-page="stepPage"
            :page-size="stepPageSize"
            :total="stepTotal"
            :page-size-options="stepPageSizeOptions"
            @page-change="handleStepPageChange"
            @page-size-change="handleStepPageSizeChange"
          />
        </div>
        <div class="exec-strategy">
          <h4 class="strategy-title">执行策略</h4>
          <div class="strategy-form">
            <span class="required">*</span>
            <span class="label">执行策略</span>
            <label class="radio-item"><input type="radio" v-model="execStrategy" value="immediate" /><span>立即执行</span></label>
            <label class="radio-item"><input type="radio" v-model="execStrategy" value="periodic" /><span>周期执行</span></label>
          </div>
        </div>
      </main>
    </div>
    <HttpStepDrawer :visible="showHttpStepDrawer" :step="editingHttpStep" @close="closeHttpStepDrawer" @save="saveHttpStep" />
    <StepExecuteDrawer
      v-model:visible="showStepExecDrawer"
      :step="executingStep"
      @close="closeStepExecDrawer"
      @execute="confirmExecuteStep"
    />

    <!-- 步骤类型配置对话框 -->
    <el-dialog
      v-model="showStepTypeDialog"
      :title="selectedStepType?.label + ' 步骤配置'"
      width="80%"
      :close-on-click-modal="false"
      destroy-on-close
      @close="closeStepTypeDialog"
    >
      <div class="step-type-dialog-content">
        <component
          v-if="selectedStepType"
          :is="stepTypeComponentMap[selectedStepType.component]"
          :title="selectedStepType.label + ' 步骤'"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeStepTypeDialog">取消</el-button>
          <el-button type="primary" @click="closeStepTypeDialog">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<style scoped>
.case-config-page { min-height: 100vh; background: #f5f5f5; }
.page-container { display: flex; height: calc(100vh - 56px); }
.sidebar { width: 260px; background: #fff; border-right: 1px solid #e8e8e8; padding: 12px; overflow-y: auto; }
.module-select-trigger { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 8px; cursor: pointer; background: #fff; margin-bottom: 12px; }
.filter-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #666; cursor: pointer; }
.main-content { flex: 1; padding: 16px; overflow-y: auto; }
.title-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
.content-tabs { display: flex; gap: 4px; }
.tab-btn { padding: 8px 16px; border: none; background: transparent; font-size: 15px; color: #666; cursor: pointer; border-radius: 4px; }
.tab-btn:hover { color: #1890ff; }
.tab-btn.active { color: #1890ff; font-weight: 500; background: #e6f7ff; }
.config-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding: 0; background: transparent; border-radius: 0; }
.header-left { display: flex; align-items: center; gap: 8px; }
.back-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1677ff;
  padding: 0;
}
.page-title { font-size: 28px; font-weight: 700; margin: 0; color: #1f1f1f; line-height: 1; }
.header-left-actions { display: flex; gap: 8px; margin-left: 10px; }
.header-actions { display: flex; gap: 8px; }
.action-btn { padding: 6px 16px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 14px; cursor: pointer; color: #666; }
.action-btn--mini { padding: 4px 16px; height: 30px; }
.action-btn:hover { border-color: #1890ff; color: #1890ff; }
.action-btn.primary { background: #1890ff; color: #fff; border-color: #1890ff; }
.case-info { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.info-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.info-label { font-size: 14px; color: #333; font-weight: 500; }
.info-value { font-size: 14px; color: #333; }
.info-value.highlight { background: #fff7e6; padding: 4px 8px; border-radius: 4px; }
.edit-btn { padding: 2px 8px; border: none; background: transparent; color: #1890ff; cursor: pointer; font-size: 13px; }
.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.info-item { display: flex; gap: 8px; font-size: 14px; }
.info-item .label { color: #999; }
.info-item .value { color: #333; }
.link { color: #1890ff; text-decoration: none; cursor: pointer; }
.user-tag { display: inline-flex; align-items: center; gap: 4px; color: #1890ff; }
.fail { color: #f5222d; }
.toolbar-section { display: flex; align-items: center; justify-content: space-between; background: #e6f7ff; padding: 10px 14px; border-radius: 8px; margin-bottom: 10px; }
.toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 8px; }
.toolbar-label { font-size: 14px; color: #333; }
.tool-btn { padding: 6px 16px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 14px; cursor: pointer; color: #333; outline: none; }
.tool-btn:hover { border-color: #1890ff; color: #1890ff; }
.tool-btn:focus { outline: none; }
.tool-btn.primary { background: #1890ff; color: #fff; border-color: #1890ff; }
.step-table { background: #fff; border-radius: 8px; overflow: auto; margin-bottom: 10px; }
.step-table table { width: 100%; border-collapse: collapse; font-size: 14px; }
.step-table th, .step-table td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #f0f0f0; line-height: 1.25; }
.step-table th { background: #fafafa; font-weight: 500; color: #666; }
.step-table tbody tr { cursor: move; transition: background-color 0.2s ease; }
.step-table tbody tr:hover { background: #f7fbff; }
.step-table tbody tr.is-dragging { opacity: 0.55; }
.step-table tbody tr.is-drag-over { background: #e6f7ff; }
.step-pagination { display: flex; justify-content: flex-end; margin: 0 0 10px; }
.type-tag { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.type-tag.jsf { background: #f6ffed; color: #52c41a; }
.type-tag.HTTP { background: #e6f7ff; color: #1890ff; }
.type-tag.MySQL { background: #fff7e6; color: #fa8c16; }
.type-tag.Redis { background: #fff1f0; color: #ff4d4f; }
.type-tag.JMQ { background: #f6ffed; color: #52c41a; }
.type-tag.DUBBO { background: #e6fffb; color: #13c2c2; }
.type-tag.KAFKA { background: #f9f0ff; color: #722ed1; }
.type-tag.R2M { background: #fff0f6; color: #eb2f96; }
.type-tag.FMQ { background: #f0f5ff; color: #2f54eb; }
.type-tag.JAR { background: #e6f7ff; color: #096dd9; }
.type-tag.SHELL { background: #f0f0f0; color: #595959; }
.type-tag.循环 { background: #fff2e8; color: #fa541c; }
.type-tag.条件 { background: #e6fffb; color: #08979c; }
.type-tag.STARDB { background: #f0f5ff; color: #1d39c4; }
.type-tag.SCHEDULEJOB { background: #fff7e6; color: #d48806; }
.col-action { white-space: nowrap; }
.action-icon-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  margin-right: 6px;
  border: none;
  background: transparent;
  color: #595959;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.action-icon-btn:last-child { margin-right: 0; }
.action-icon-btn:hover { color: #1890ff; }
.exec-strategy { background: #fff; border-radius: 8px; padding: 12px 14px; }
.strategy-title { font-size: 14px; font-weight: 500; color: #333; margin: 0 0 12px 0; }
.strategy-form { display: flex; align-items: center; gap: 12px; }
.strategy-form .required { color: #f5222d; }
.radio-item { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; }

/* 步骤类型下拉菜单样式 */
.step-type-dropdown {
  max-height: 400px;
  overflow-y: auto;
}

.step-type-dropdown :deep(.el-dropdown-menu__list) {
  padding: 4px;
}

.step-type-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  min-width: 180px;
}

.step-type-item:hover {
  background-color: #f5f7fa;
}

.step-type-label {
  font-weight: 500;
  color: #303133;
  min-width: 60px;
}

.step-type-desc {
  font-size: 12px;
  color: #909399;
}

/* 步骤类型对话框内容 */
.step-type-dialog-content {
  padding: 20px;
  min-height: 300px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Element Plus 下拉菜单覆盖样式 */
:deep(.el-dropdown) {
  vertical-align: middle;
}

</style>