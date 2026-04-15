<script setup>
/**
 * 预设变量配置弹窗
 * 根据UI截图高保真还原
 */
import { ref, watch, computed, onMounted } from 'vue'
import { Delete, Edit, Plus, Rank, QuestionFilled } from '@element-plus/icons-vue'
import { useMessage } from '@/shared/ui'
import { fetchProjectList } from '@/domains/project/api'
import { fetchTemplateVariableList, fetchTemplateVariableDetail, updateTemplateVariable } from '../../api'
import PresetTemplateDialog from '../preset/PresetTemplateDialog.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const { showSuccess, showWarning } = useMessage()

const visible = ref(false)
const activeTab = ref('current') // 'current' | 'template'

// 变量选择
const multiTemplateEnabled = ref(false)
const selectedModule = ref('')
const selectedTemplate = ref('')

// 选项数据
const moduleOptions = ref([])
const templateOptions = ref([])

// 变量列表
const variableList = ref([])

// 新增模板弹窗
const showTemplateDialog = ref(false)

// 拖拽相关
const draggingIndex = ref(-1)
const dragOverIndex = ref(-1)

// 监听弹窗打开
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    loadModuleOptions()
  }
})

watch(() => visible.value, (val) => {
  emit('update:modelValue', val)
})

// 加载模块选项
async function loadModuleOptions() {
  try {
    const resp = await fetchProjectList({ page: 1, page_size: 100 })
    const list = resp?.data?.data?.list || []
    moduleOptions.value = list.map(item => ({
      label: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('加载模块失败', error)
  }
}

// 加载模板选项
async function loadTemplateOptions() {
  if (!selectedModule.value) {
    templateOptions.value = []
    return
  }
  try {
    const resp = await fetchTemplateVariableList({ project_id: selectedModule.value })
    const list = resp?.data?.data?.items || resp?.data?.data?.list || []
    templateOptions.value = list.map(item => ({
      label: item.template_name || item.name,
      value: item.template_id || item.id
    }))
  } catch (error) {
    console.error('加载模板失败', error)
  }
}

// 加载模板变量
async function loadTemplateVariables() {
  if (!selectedTemplate.value) {
    variableList.value = []
    return
  }
  try {
    const resp = await fetchTemplateVariableDetail({ template_id: selectedTemplate.value })
    const variables = resp?.data?.data?.variables || []
    variableList.value = variables.map((item, index) => ({
      id: item.id || item.variable_id || `var_${index}`,
      varType: Number(item.var_type || 0),
      name: item.var_name || item.name || '',
      value: item.var_value || item.value || '',
      remark: item.remark || '',
      editing: false
    }))
  } catch (error) {
    console.error('加载变量失败', error)
  }
}

// 监听模块变化
watch(() => selectedModule.value, () => {
  selectedTemplate.value = ''
  variableList.value = []
  loadTemplateOptions()
})

// 监听模板变化
watch(() => selectedTemplate.value, () => {
  loadTemplateVariables()
})

// 变量类型选项
const varTypeOptions = [
  { label: '普通变量', value: 0 },
  { label: '数组', value: 1 },
  { label: 'JSON数组', value: 2 },
  { label: 'UUID', value: 3 },
  { label: '随机数', value: 4 },
  { label: '当前日期', value: 5 },
  { label: '时间戳', value: 6 },
  { label: '动态变量', value: 7 }
]

function getVarTypeLabel(type) {
  const found = varTypeOptions.find(opt => opt.value === type)
  return found?.label || '普通变量'
}

// 删除当前选中的模板
function handleDeleteTemplate() {
  if (!selectedTemplate.value) {
    showWarning('请先选择要删除的模板')
    return
  }
  // TODO: 调用删除模板API
  showWarning('删除模板功能开发中')
}

// 新增模板
function handleNewTemplate() {
  showTemplateDialog.value = true
}

// 编辑行
function handleEditRow(row) {
  row.editing = true
}

// 保存行
function handleSaveRow(row) {
  if (!row.name.trim()) {
    showWarning('变量名不能为空')
    return
  }
  row.editing = false
}

// 删除行
function handleDeleteRow(index) {
  variableList.value.splice(index, 1)
}

// 添加新行
function handleAddRow() {
  variableList.value.push({
    id: `new_${Date.now()}`,
    varType: 0,
    name: '',
    value: '',
    remark: '',
    editing: true
  })
}

// 拖拽相关函数
function handleDragStart(index) {
  draggingIndex.value = index
}

function handleDragOver(event, index) {
  event.preventDefault()
  if (draggingIndex.value !== index) {
    dragOverIndex.value = index
  }
}

function handleDragLeave() {
  dragOverIndex.value = -1
}

function handleDrop(event, dropIndex) {
  event.preventDefault()
  const dragIndex = draggingIndex.value

  if (dragIndex === -1 || dragIndex === dropIndex) {
    draggingIndex.value = -1
    dragOverIndex.value = -1
    return
  }

  // 移动元素
  const item = variableList.value[dragIndex]
  variableList.value.splice(dragIndex, 1)
  variableList.value.splice(dropIndex, 0, item)

  draggingIndex.value = -1
  dragOverIndex.value = -1
}

function handleDragEnd() {
  draggingIndex.value = -1
  dragOverIndex.value = -1
}

function getRowClassName({ rowIndex }) {
  if (draggingIndex.value === rowIndex) {
    return 'is-dragging'
  }
  if (dragOverIndex.value === rowIndex) {
    return 'is-drag-over'
  }
  return ''
}

// 保存
async function handleSave() {
  if (!selectedTemplate.value) {
    showWarning('请先选择变量模板')
    return
  }

  // 检查是否有未保存的编辑
  const editingRows = variableList.value.filter(row => row.editing)
  if (editingRows.length > 0) {
    showWarning('请先保存正在编辑的变量')
    return
  }

  try {
    const variables = variableList.value.map(row => ({
      var_type: row.varType,
      var_name: row.name,
      var_value: row.value,
      remark: row.remark
    }))

    const resp = await updateTemplateVariable({
      template_id: selectedTemplate.value,
      variables
    })

    if (resp?.data?.code === 200) {
      showSuccess('保存成功')
      emit('save', variableList.value)
    } else {
      showWarning(resp?.data?.msg || '保存失败')
    }
  } catch (error) {
    showWarning('保存失败')
  }
}

function handleClose() {
  visible.value = false
}

function handleTemplateSave(payload) {
  // 刷新模板列表
  loadTemplateOptions()
  showSuccess('模板创建成功')
}

onMounted(() => {
  loadModuleOptions()
})
</script>

<template>
  <div>
    <el-dialog
      v-model="visible"
      title="预设变量配置"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
      @close="handleClose"
      class="preset-variable-dialog"
      align-center
    >
      <div class="preset-dialog-content">
        <!-- 顶部工具栏 -->
        <div class="preset-toolbar">
          <div class="toolbar-left">
            <div class="field-group">
              <span class="field-label">变量选择</span>
              <el-checkbox v-model="multiTemplateEnabled" class="multi-check">多选模版</el-checkbox>
            </div>
            <el-select
              v-model="selectedModule"
              placeholder="请选择"
              size="default"
              clearable
              class="module-select"
            >
              <el-option
                v-for="opt in moduleOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <el-select
              v-model="selectedTemplate"
              placeholder="请选择"
              size="default"
              clearable
              :disabled="!selectedModule"
              class="template-select"
            >
              <el-option
                v-for="opt in templateOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <el-button
              link
              type="danger"
              :disabled="!selectedTemplate"
              @click="handleDeleteTemplate"
              class="delete-template-btn"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <el-button type="primary" size="default" @click="handleNewTemplate">
            新增模板
          </el-button>
        </div>

        <!-- Tabs -->
        <div class="preset-tabs">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'current' }"
            @click="activeTab = 'current'"
          >
            当前生效变量
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'template' }"
            @click="activeTab = 'template'"
          >
            当前模板(编辑)
          </div>
          <el-tooltip content="更改当前生效变量模板，需要更改当前引用的变量模板并点保存之后查看" placement="top">
            <el-icon class="tab-help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>

        <!-- 变量表格 -->
        <div class="preset-table-wrapper">
          <el-table
            :data="variableList"
            size="default"
            border
            class="preset-table"
            :row-class-name="getRowClassName"
            max-height="400"
          >
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <template v-if="row.editing">
                  <el-select v-model="row.varType" size="small">
                    <el-option
                      v-for="opt in varTypeOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </template>
                <template v-else>
                  <span class="var-type-text">{{ getVarTypeLabel(row.varType) }}</span>
                </template>
              </template>
            </el-table-column>

            <el-table-column label="变量名" min-width="140">
              <template #header>
                <div class="column-header">
                  <span>变量名</span>
                  <el-tooltip content="动态变量：具体参照参数变量文档" placement="top">
                    <el-icon class="header-help-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <template #default="{ row }">
                <template v-if="row.editing">
                  <el-input v-model="row.name" size="small" placeholder="变量名" />
                </template>
                <template v-else>
                  <span class="var-name-text">{{ row.name }}</span>
                </template>
              </template>
            </el-table-column>

            <el-table-column label="值" min-width="200">
              <template #default="{ row }">
                <template v-if="row.editing">
                  <el-input v-model="row.value" size="small" placeholder="值" />
                </template>
                <template v-else>
                  <span class="var-value-text" :title="row.value">{{ row.value }}</span>
                </template>
              </template>
            </el-table-column>

            <el-table-column label="备注" min-width="140">
              <template #default="{ row }">
                <template v-if="row.editing">
                  <el-input v-model="row.remark" size="small" placeholder="备注" />
                </template>
                <template v-else>
                  <span class="var-remark-text" :title="row.remark">{{ row.remark }}</span>
                </template>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="{ row, $index }">
                <div class="action-btns">
                  <template v-if="row.editing">
                    <el-button link type="primary" size="small" @click="handleSaveRow(row)">
                      保存
                    </el-button>
                  </template>
                  <template v-else>
                    <el-button link type="primary" size="small" @click="handleEditRow(row)">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                  </template>
                  <el-button link type="danger" size="small" @click="handleDeleteRow($index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                  <div
                    class="drag-handle"
                    draggable="true"
                    @dragstart="handleDragStart($index)"
                    @dragover="handleDragOver($event, $index)"
                    @dragleave="handleDragLeave"
                    @drop="handleDrop($event, $index)"
                    @dragend="handleDragEnd"
                  >
                    <el-icon><Rank /></el-icon>
                  </div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 添加按钮 -->
        <div class="preset-footer-actions">
          <el-button size="small" @click="handleAddRow">
            <el-icon class="mr-4"><Plus /></el-icon>
            添加
          </el-button>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">关闭</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增模板弹窗 -->
    <PresetTemplateDialog
      v-model="showTemplateDialog"
      @save="handleTemplateSave"
    />
  </div>
</template>

<style scoped>
.preset-dialog-content {
  padding: 8px 0;
}

/* 顶部工具栏 */
.preset-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.field-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  color: #606266;
}

.multi-check {
  margin-left: 8px;
}

.module-select,
.template-select {
  width: 200px;
}

.delete-template-btn {
  padding: 8px;
}

/* Tabs */
.preset-tabs {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 8px;
}

.tab-item {
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  padding: 4px 8px;
  position: relative;
}

.tab-item.active {
  color: #409eff;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 0;
  right: 0;
  height: 2px;
  background: #409eff;
}

.tab-help-icon {
  color: #909399;
  font-size: 14px;
  cursor: help;
  margin-left: 8px;
}

/* 表格 */
.preset-table-wrapper {
  margin-bottom: 12px;
}

.preset-table {
  width: 100%;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-help-icon {
  color: #909399;
  font-size: 14px;
  cursor: help;
}

.var-type-text,
.var-name-text {
  font-size: 14px;
  color: #303133;
}

.var-value-text,
.var-remark-text {
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  max-width: 100%;
}

.action-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.drag-handle {
  cursor: move;
  color: #909399;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-handle:hover {
  color: #409eff;
}

/* 拖拽状态 */
:deep(.is-dragging) {
  opacity: 0.5;
  background: #f5f7fa;
}

:deep(.is-drag-over) {
  background: #e6f7ff;
  border-top: 2px solid #409eff;
}

/* 底部操作 */
.preset-footer-actions {
  margin-top: 12px;
}

.mr-4 {
  margin-right: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

<style>
/* 全局样式调整 */
.preset-variable-dialog .el-dialog__body {
  padding: 16px 20px;
}

.preset-variable-dialog .el-dialog__header {
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.preset-variable-dialog .el-dialog__footer {
  padding: 12px 20px;
  border-top: 1px solid #e4e7ed;
}

.preset-variable-dialog .el-dialog__title {
  font-size: 16px;
  font-weight: 600;
}
</style>
