<script setup lang="ts">
const { showSuccess, showWarning, showError } = useMessage()
import { computed, ref, watch, nextTick, defineExpose } from 'vue'
import { useMessage } from '@/shared/ui'
import { EditPen, Delete, CopyDocument, ArrowDown, Plus } from '@element-plus/icons-vue'

type ExtractRow = {
  id: number
  path: string
  name: string
  remark: string
  editing: boolean
  pathError?: string
  pathInvalid?: boolean
  nameError?: string
  nameInvalid?: boolean
}

const props = defineProps<{
  collapseKey?: number
  collapsed?: boolean
  index?: number
  name?: string
  config?: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'copy'): void
  (e: 'delete'): void
  (e: 'update:name', value: string): void
  (e: 'update:config', config: Record<string, any>): void
  (e: 'quick-add-jsonpath'): void
}>()

const stepName = ref(props.name || '操作步骤1')
const isCollapsed = ref(false)
const isEditingName = ref(false)
const nameInputRef = ref()

const rows = ref<ExtractRow[]>([])

 // 监听 config prop 变化，处理 _pendingJsonPaths 和已有数据
watch(
  () => props.config,
  (config) => {
    if (!config) return

    // 处理多行数据（_rows）
    if (config._rows && Array.isArray(config._rows) && config._rows.length > 0 && rows.value.length === 0) {
      rows.value = config._rows.map((row: any) => ({
        id: row.id || Date.now() + Math.random(),
        path: row.path || '',
        name: row.name || '',
        remark: row.remark || '',
        editing: false,
        pathError: '',
        pathInvalid: false,
        nameError: '',
        nameInvalid: false
      }))
      return
    }

    // 处理从后端返回的已有数据（单行）
    if ((config.jsonPath || config.variableName) && rows.value.length === 0) {
      rows.value.push({
        id: Date.now() + Math.random(),
        path: config.jsonPath || '',
        name: config.variableName || '',
        remark: config.description || '',
        editing: false,
        pathError: '',
        pathInvalid: false,
        nameError: '',
        nameInvalid: false
      })
      return
    }

    // 处理快捷添加的 JSONPath
    if (config._pendingJsonPaths && Array.isArray(config._pendingJsonPaths)) {
      // 添加新的 JSONPath 行
      config._pendingJsonPaths.forEach((path: string) => {
        const existing = rows.value.find(r => r.path === path)
        if (!existing) {
          rows.value.push({
            id: Date.now() + Math.random(),
            path: path,
            name: path.replace(/\$/g, '').replace(/\./g, '_').replace(/\[|\]/g, ''),
            remark: '',
            editing: false,
            pathError: '',
            pathInvalid: false,
            nameError: '',
            nameInvalid: false
          })
        }
      })
      // 清除 _pendingJsonPaths
      emit('update:config', { ...config, _pendingJsonPaths: undefined })
    }
  },
  { deep: true, immediate: true }
)

// 监听 rows 变化，emit config 更新
watch(
  rows,
  (newRows) => {
    const firstRow = newRows.find(r => r.path && r.name) || newRows[0]
    emit('update:config', {
      jsonPath: firstRow?.path || '',
      variableName: firstRow?.name || '',
      description: firstRow?.remark || '',
      _rows: newRows
    })
  },
  { deep: true }
)

watch(
  () => props.collapseKey,
  () => {
    if (props.collapsed !== undefined) {
      isCollapsed.value = props.collapsed
    }
  },
)

watch(
  () => props.name,
  (val) => {
    if (typeof val === 'string') {
      stepName.value = val
    }
  },
)

const displayIndex = computed(() => props.index ?? 1)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const startEditName = () => {
  isEditingName.value = true
  nextTick(() => {
    if (nameInputRef.value && typeof nameInputRef.value.focus === 'function') {
      nameInputRef.value.focus()
    }
  })
}

const handleNameInput = (val: string) => {
  stepName.value = val
  emit('update:name', val)
}

const finishEditName = () => {
  const value = stepName.value.trim()
  if (!value) {
    const fallback = `操作步骤${displayIndex.value}`
    stepName.value = fallback
    emit('update:name', fallback)
  } else {
    emit('update:name', value)
  }
  isEditingName.value = false
}

const handleAddRow = () => {
  const id = Date.now() + Math.random()
  rows.value.push({
    id,
    // 默认给一个示例 jsonPath，方便用户修改
    path: '',
    name: '',
    remark: '',
    editing: true,
    pathError: '',
    pathInvalid: false,
    nameError: '',
    nameInvalid: false,
  })
}

const handleQuickAdd = () => {
  // 打开快捷添加 JSONPATH 弹窗，由父级 HttpStepDrawer 统一控制
  // 这里先派发一个自定义事件，由父组件去复用 JsonAddDialog 组件
  // （父组件根据当前上下文设置不同的 title，例如“快捷添加 JSONPATH”）
  // @ts-ignore
  ;(emit as any)('quick-add-jsonpath')
}

const validatePath = (row: ExtractRow) => {
  const v = row.path ? row.path.trim() : ''
  if (!v) {
    row.pathError = '必填'
    row.pathInvalid = true
    ElMessage.error('JSONPath 不能为空')
  } else if (!v.startsWith('$.')) {
    row.pathError = '必须以 $. 开头'
    row.pathInvalid = true
    ElMessage.error('JSONPath 必须以 $. 开头')
  } else {
    row.pathError = ''
    row.pathInvalid = false
  }
}

const validateName = (row: ExtractRow) => {
  if (!row.name || !row.name.trim()) {
    row.nameError = '必填'
    row.nameInvalid = true
    ElMessage.error('变量名 不能为空')
  } else {
    row.nameError = ''
    row.nameInvalid = false
  }
}

const handleSaveRow = (row: ExtractRow) => {
  validatePath(row)
  validateName(row)
  if (row.pathInvalid || row.nameInvalid) return
  row.editing = false
}

const handleCancelRow = (row: ExtractRow, index: number) => {
  // 撤销按钮：直接移除当前变量提取行
  rows.value.splice(index, 1)
}

const deriveNameFromPath = (path: string) => {
  if (!path) return ''
  const cleaned = path.replace(/^\$\.?/, '')
  const parts = cleaned.split(/[\.\[\]]/).filter(Boolean)
  return parts[parts.length - 1] || ''
}

const addRowsFromJsonpaths = (paths: string[]) => {
  if (!Array.isArray(paths)) return
  paths.forEach((p) => {
    // JSONPath 列需要带上前缀 "$."
    const normalizedPath = p.startsWith('$')
      ? p
      : `$.${p.replace(/^\.+/, '')}`

    const id = Date.now() + Math.random()
    const name = deriveNameFromPath(normalizedPath)
    rows.value.push({
      id,
      path: normalizedPath,
      name,
      remark: '',
      editing: true,
      pathError: '',
      pathInvalid: false,
    })
  })
}

defineExpose({
  addRowsFromJsonpaths,
  getConfig: () => {
    // 取第一个有效行作为主配置
    const firstRow = rows.value.find(r => r.path && r.name) || rows.value[0]
    return {
      jsonPath: firstRow?.path || '',
      variableName: firstRow?.name || '',
      description: firstRow?.remark || '',
      _rows: rows.value
    }
  }
})
</script>

<template>
  <div class="extract-step">
    <!-- 标题行 -->
    <div class="extract-step__header" draggable="true">
      <div class="left">
        <el-icon class="collapse-arrow" :class="{ 'is-collapsed': isCollapsed }" @click="toggleCollapse">
          <ArrowDown />
        </el-icon>
        <span class="index">{{ displayIndex }}</span>
        <span class="type-tag">提取变量</span>
        <div class="name-wrapper">
          <template v-if="!isEditingName">
            <span class="name-text">{{ stepName }}</span>
            <el-icon class="edit-icon" @click="startEditName">
              <EditPen />
            </el-icon>
          </template>
          <template v-else>
            <el-input
              v-model="stepName"
              class="name-input"
              size="small"
              ref="nameInputRef"
              @input="handleNameInput"
              @blur="finishEditName"
            />
          </template>
        </div>
      </div>
      <div class="right">
        <el-button text size="small" @click="emit('copy')">
          <el-icon><CopyDocument /></el-icon>
        </el-button>
        <el-popconfirm
          title="确定删除吗?"
          confirm-button-text="确定"
          cancel-button-text="取消"
          icon=""
          @confirm="emit('delete')"
        >
          <template #reference>
            <el-button text size="small">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-show="!isCollapsed" class="extract-step__body">
      <div class="extract-header-row">
        <div class="header-left">
          <span class="header-title">提取变量</span>
        </div>
        <div class="header-right">
          <el-button size="small" type="primary" @click="handleAddRow">
            <el-icon><Plus /></el-icon>
            <span class="ml-4">添加</span>
          </el-button>
          <el-button size="small" link type="primary" @click="handleQuickAdd">快捷添加</el-button>
        </div>
      </div>

      <div class="extract-table-wrapper">
        <template v-if="rows.length">
          <el-table :data="rows" border size="small">
            <el-table-column label="JSONPath" min-width="260">
              <template #default="{ row }">
                <div class="jsonpath-cell extract-input-wrap" :class="{ 'is-invalid-input': row.pathInvalid }">
                  <el-input
                    v-model="row.path"
                    size="small"
                    placeholder="JSONPath表达式为: $.data.list[0].name"
                    :disabled="!row.editing"
                    @blur="validatePath(row)"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="变量名" min-width="160">
              <template #default="{ row }">
                <div class="jsonpath-cell extract-input-wrap" :class="{ 'is-invalid-input': row.nameInvalid }">
                  <el-input
                    v-model="row.name"
                    size="small"
                    placeholder="变量名"
                    :disabled="!row.editing"
                    @blur="validateName(row)"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="描述" min-width="260">
              <template #default="{ row }">
                <el-input
                  v-model="row.remark"
                  size="small"
                  placeholder="描述"
                  :disabled="!row.editing"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" align="center">
              <template #default="{ row, $index }">
                <template v-if="row.editing">
                  <el-button link type="primary" size="small" @click="handleSaveRow(row)">
                    保存
                  </el-button>
                  <el-button link type="primary" size="small" @click="handleCancelRow(row, $index)">
                    撤销
                  </el-button>
                </template>
                <template v-else>
                  <el-button link type="primary" size="small" @click="row.editing = true">
                    编辑
                  </el-button>
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click="rows.splice($index, 1)"
                  >
                    删除
                  </el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </template>
        <template v-else>
          <el-empty description="暂无提取变量" :image-size="80" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.extract-step {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px 16px 16px;
  background: #fff;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
}

.extract-step__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  cursor: grab;
}

.extract-step__header:active {
  cursor: grabbing;
}

.extract-step__header .left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.index {
  font-weight: 500;
  color: #303133;
}

.type-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #ecf5ff;
  color: #409eff;
  border: 1px solid #b3d8ff;
}

.name-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.name-text {
  color: #409eff;
  cursor: default;
}

.name-input {
  width: 180px;
}

.edit-icon {
  cursor: pointer;
  color: #909399;
}

.extract-step__header .right :deep(.el-button) {
  padding: 4px;
}

.collapse-arrow {
  cursor: pointer;
  transition: transform 0.2s ease;
  margin-right: 4px;
}

.collapse-arrow.is-collapsed {
  transform: rotate(-90deg);
}

.extract-step__body {
  margin-top: 8px;
}

.extract-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.header-title {
  font-weight: 500;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ml-4 {
  margin-left: 4px;
}

.extract-table-wrapper {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 8px 12px;
  box-sizing: border-box;
}

.jsonpath-cell {
  display: flex;
  flex-direction: column;
}

.field-error {
  margin-top: 2px;
  font-size: 12px;
  color: #f56c6c;
}

/* 红框：类在包裹层上，避免 el-input 不合并 class */
.extract-input-wrap.is-invalid-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset !important;
  border: 1px solid #f56c6c !important;
}
</style>
