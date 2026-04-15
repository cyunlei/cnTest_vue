<script setup>
/**
 * 前置/后置步骤添加弹窗
 * 支持选择用例集 -> 用例 -> 用例步骤
 */
import { ref, watch, computed, nextTick } from 'vue'
import { Delete, QuestionFilled } from '@element-plus/icons-vue'
import { useMessage } from '@/shared/ui'
import { fetchSuiteList } from '@/domains/casemgmt/api'
import { fetchTestcaseList } from '@/domains/casemgmt/api'
import { fetchStepList } from '@/domains/casemgmt/api'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '添加前置步骤'
  },
  type: {
    type: String,
    default: 'pre', // 'pre' | 'post'
    validator: (v) => ['pre', 'post'].includes(v)
  },
  projectId: {
    type: [Number, String],
    default: ''
  },
  testcaseId: {
    type: [Number, String],
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const { showSuccess, showWarning } = useMessage()

const visible = ref(false)
const loading = ref(false)

// 选择的数据
const selectedSuite = ref('')
const selectedCase = ref('')
const selectedSteps = ref([])

// 选项数据
const suiteOptions = ref([])
const caseOptions = ref([])
const stepOptions = ref([])

// 已添加的步骤列表
const addedSteps = ref([])

// 加载用例集列表
async function loadSuiteOptions() {
  try {
    const params = { page: 1, page_size: 1000 }
    if (props.projectId) {
      params.project_id = props.projectId
    }
    const resp = await fetchSuiteList(params)
    // 适配两种可能的响应结构：data.list 或 data.items
    const list = resp?.data?.data?.list || resp?.data?.data?.items || []
    suiteOptions.value = list.map(item => ({
      label: item.name,
      value: item.id
    }))
  } catch (error) {
    showWarning('加载用例集失败')
  }
}

// 加载用例列表
async function loadCaseOptions() {
  caseOptions.value = []
  selectedCase.value = ''
  stepOptions.value = []
  selectedSteps.value = []

  if (!selectedSuite.value) return

  try {
    const resp = await fetchTestcaseList({
      suite_id: selectedSuite.value,
      page: 1,
      page_size: 1000,
      relation_type: 1 // 只返回同用例集下的其他用例，排除当前用例本身
    })
    // 适配两种可能的响应结构：data.list 或 data.items
    const list = resp?.data?.data?.list || resp?.data?.data?.items || []
    // 过滤掉当前用例本身（如果后端没有处理的话）
    const filteredList = props.testcaseId
      ? list.filter(item => String(item.id) !== String(props.testcaseId))
      : list
    caseOptions.value = filteredList.map(item => ({
      label: item.name,
      value: item.id
    }))
  } catch (error) {
    showWarning('加载用例失败')
  }
}

// 加载步骤列表
async function loadStepOptions() {
  stepOptions.value = []
  selectedSteps.value = []

  if (!selectedCase.value) return

  try {
    const resp = await fetchStepList({
      testcase_id: selectedCase.value,
      page: 1,
      page_size: 1000
    })
    // 适配两种可能的响应结构：data.list 或 data.items
    const list = resp?.data?.data?.list || resp?.data?.data?.items || []
    stepOptions.value = list.map(item => ({
      label: item.name,
      value: item.id,
      detail: item.api_url || item.name,
      step_type: item.step_type
    }))
  } catch (error) {
    showWarning('加载步骤失败')
  }
}

// 监听弹窗打开
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    resetForm()
    loadSuiteOptions()
  }
})

watch(() => visible.value, (val) => {
  emit('update:modelValue', val)
})

// 监听用例集变化
watch(() => selectedSuite.value, () => {
  loadCaseOptions()
})

// 监听用例变化
watch(() => selectedCase.value, () => {
  loadStepOptions()
})

function resetForm() {
  selectedSuite.value = ''
  selectedCase.value = ''
  selectedSteps.value = []
  suiteOptions.value = []
  caseOptions.value = []
  stepOptions.value = []
  addedSteps.value = []
}

function handleClose() {
  visible.value = false
}

function handleAddSteps() {
  if (!selectedSteps.value || selectedSteps.value.length === 0) {
    showWarning('请选择至少一个步骤')
    return
  }

  const newSteps = selectedSteps.value.map((stepId, idx) => {
    const step = stepOptions.value.find(s => s.value === stepId)
    return {
      uid: `${stepId}_${Date.now()}_${idx}`,
      id: stepId,
      step_id: stepId,
      step_name: step?.label || '',
      detail: step?.detail || '',
      step_type: step?.step_type || 0,
      sort_order: addedSteps.value.length + idx + 1
    }
  })

  addedSteps.value.push(...newSteps)
  selectedSteps.value = []
}

function handleRemoveStep(index) {
  addedSteps.value.splice(index, 1)
  // 重新计算顺序
  addedSteps.value.forEach((step, idx) => {
    step.sort_order = idx + 1
  })
}

// 拖拽排序相关
const draggingIndex = ref(-1)
const dragOverIndex = ref(-1)

function handleDragStart(index) {
  draggingIndex.value = index
}

function handleDragOver(event, index) {
  event.preventDefault()
  dragOverIndex.value = index
}

function handleDragLeave() {
  dragOverIndex.value = -1
}

function handleDrop(event, dropIndex) {
  event.preventDefault()
  event.stopPropagation()

  const dragIndex = draggingIndex.value

  if (dragIndex === -1 || dragIndex === dropIndex) {
    draggingIndex.value = -1
    dragOverIndex.value = -1
    return
  }

  // 使用 Vue 的响应式方法更新数组
  const newSteps = [...addedSteps.value]
  const item = newSteps[dragIndex]
  newSteps.splice(dragIndex, 1)
  newSteps.splice(dropIndex, 0, item)

  // 重新计算顺序
  newSteps.forEach((step, idx) => {
    step.sort_order = idx + 1
  })

  // 替换整个数组触发视图更新
  addedSteps.value = newSteps

  draggingIndex.value = -1
  dragOverIndex.value = -1
}

function handleDragEnd() {
  draggingIndex.value = -1
  dragOverIndex.value = -1
}

function handleConfirm() {
  if (addedSteps.value.length === 0) {
    showWarning('请至少添加一个步骤')
    return
  }

  emit('confirm', {
    type: props.type,
    steps: addedSteps.value.map(s => ({
      step_id: Number(s.step_id),
      step_name: s.step_name,
      sort_order: Number(s.sort_order)
    }))
  })

  showSuccess('添加成功')
  visible.value = false
}

// 步骤类型映射
function getStepTypeLabel(type) {
  const typeMap = {
    0: 'HTTP',
    1: 'MySQL',
    2: 'Redis',
    3: 'JMQ',
    4: 'DUBBO',
    5: 'KAFKA',
    6: 'R2M',
    7: 'FMQ',
    8: 'JAR',
    9: 'SHELL',
    10: '循环',
    11: '条件',
    12: 'STARDB',
    13: 'SCHEDULEJOB'
  }
  return typeMap[type] || '未知'
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="720px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <div class="prepost-dialog">
      <!-- 选择区域 -->
      <div class="select-section">
        <div class="select-row">
          <div class="select-item">
            <label class="select-label">用例集</label>
            <el-select
              v-model="selectedSuite"
              placeholder="请选择"
              size="default"
              clearable
              class="select-control"
            >
              <el-option
                v-for="opt in suiteOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </div>
        </div>

        <div class="select-row">
          <div class="select-item">
            <label class="select-label required">用例</label>
            <el-select
              v-model="selectedCase"
              placeholder="请选择"
              size="default"
              clearable
              :disabled="!selectedSuite"
              class="select-control"
            >
              <el-option
                v-for="opt in caseOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </div>
        </div>

        <div class="select-row steps-row">
          <div class="select-item">
            <label class="select-label required">
              用例步骤
              <el-tooltip content="选择要添加的步骤" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </label>
            <el-select
              v-model="selectedSteps"
              placeholder="请选择"
              size="default"
              multiple
              clearable
              :disabled="!selectedCase"
              class="select-control steps-select"
              collapse-tags
              collapse-tags-tooltip
            >
              <el-option
                v-for="opt in stepOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </div>
          <el-button
            type="primary"
            size="default"
            :disabled="!selectedSteps.length"
            @click="handleAddSteps"
            class="add-btn"
          >
            添加
          </el-button>
        </div>
      </div>

      <!-- 已添加步骤列表 -->
      <div class="added-section">
        <div class="section-title">已添加步骤</div>
        <div class="added-table-wrapper">
          <table v-if="addedSteps.length" class="added-table">
            <thead>
              <tr>
                <th class="col-index">编号</th>
                <th class="col-name">步骤名称</th>
                <th class="col-detail">详细内容</th>
                <th class="col-order">顺序</th>
                <th class="col-action">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(step, index) in addedSteps"
                :key="step.uid"
                :class="{
                  'is-dragging': draggingIndex === index,
                  'is-drag-over': dragOverIndex === index
                }"
                draggable="true"
                @dragstart="handleDragStart(index)"
                @dragover="handleDragOver($event, index)"
                @dragleave="handleDragLeave"
                @drop="handleDrop($event, index)"
                @dragend="handleDragEnd"
              >
                <td class="col-index">{{ step.step_id }}</td>
                <td class="col-name">
                  <span class="step-name">{{ step.step_name }}</span>
                </td>
                <td class="col-detail">
                  <span class="step-detail" :title="step.detail">{{ step.detail }}</span>
                </td>
                <td class="col-order">{{ step.sort_order }}</td>
                <td class="col-action">
                  <div class="action-btns">
                    <el-button
                      link
                      type="danger"
                      size="small"
                      @click="handleRemoveStep(index)"
                      class="delete-btn"
                      title="删除"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <el-empty v-else description="暂无数据" :image-size="80" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" :disabled="!addedSteps.length" @click="handleConfirm">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.prepost-dialog {
  padding: 8px 0;
}

.select-section {
  margin-bottom: 24px;
}

.select-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.select-row.steps-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.select-item {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.select-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.select-label.required::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.help-icon {
  color: #909399;
  font-size: 14px;
  cursor: help;
}

.select-control {
  width: 100%;
}

.steps-select {
  flex: 1;
}

.add-btn {
  margin-bottom: 0;
  height: 32px;
}

.added-section {
  border-top: 1px solid #e4e7ed;
  padding-top: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
}

.added-table-wrapper {
  min-height: 200px;
}

.step-name {
  color: #409eff;
  font-weight: 500;
}

.step-detail {
  color: #606266;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  max-width: 100%;
}

.step-order {
  color: #303133;
  font-weight: 500;
}

.action-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.move-btn,
.delete-btn {
  padding: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 原生表格样式 */
.added-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  border: 1px solid #e4e7ed;
}

.added-table th,
.added-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #e4e7ed;
  border-right: 1px solid #e4e7ed;
}

.added-table th:last-child,
.added-table td:last-child {
  border-right: none;
}

.added-table thead {
  background: #fafafa;
  font-weight: 500;
  color: #606266;
}

.added-table tbody tr {
  cursor: move;
  transition: background-color 0.2s ease;
}

.added-table tbody tr:hover {
  background: #f5f7fa;
}

.added-table tbody tr.is-dragging {
  opacity: 0.5;
  background: #f5f7fa;
}

.added-table tbody tr.is-drag-over {
  background: #e6f7ff;
  border-top: 2px solid #409eff;
}

.col-index {
  width: 80px;
  text-align: center;
}

.col-name {
  min-width: 150px;
}

.col-detail {
  min-width: 200px;
}

.col-order {
  width: 70px;
  text-align: center;
}

.col-action {
  width: 60px;
  text-align: center;
}
</style>
