<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { EditPen, Delete, CopyDocument, ArrowDown } from '@element-plus/icons-vue'
import MonacoEditor from './MonacoEditor.vue'
import CodeMirrorEditor from './CodeMirrorEditor.vue'

const props = defineProps<{
  collapseKey?: number
  collapsed?: boolean
  index?: number
  name?: string
  modelValue?: string
  useTemplateMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'copy'): void
  (e: 'delete'): void
  (e: 'update:name', value: string): void
  (e: 'update:modelValue', value: string): void
}>()

const stepName = ref(props.name || '操作步骤1')
const isCollapsed = ref(false)
const isEditingName = ref(false)
const nameInputRef = ref()

// 自定义脚本字段
const language = ref<'beanshell' | 'python' | 'groovy' | 'javascript' | 'qlexpress'>('beanshell')
const code = ref(props.modelValue || '')
const scriptError = ref('')

const monacoLanguage = computed(() => {
  if (language.value === 'javascript') return 'javascript'
  // 其他几种先统一用 javascript 高亮
  return 'javascript'
})

watch(
  () => props.collapseKey,
  () => {
    if (props.collapsed !== undefined) {
      isCollapsed.value = props.collapsed
    }
  }
)

watch(
  () => props.name,
  (val) => {
    if (typeof val === 'string') {
      stepName.value = val
    }
  }
)

// 外部传入脚本变更时，同步到内部 code
watch(
  () => props.modelValue,
  (val) => {
    if (typeof val === 'string' && val !== code.value) {
      code.value = val
    }
  }
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

const buildGetSnippet = () => {
  if (language.value === 'python') {
    return 'vars["variable_name"]'
  }
  return 'vars.get("variable_name")'
}

const buildSetSnippet = () => {
  if (language.value === 'python') {
    return 'vars["variable_name"] = variable_value'
  }
  return 'vars.put("variable_name", "variable_value")'
}

const insertSnippet = (snippet: string) => {
  if (!snippet) return
  if (!code.value.trim()) {
    code.value = snippet
  } else {
    code.value = `${code.value.trimEnd()}\n\n${snippet}`
  }
}

const handleInsertGetVar = () => {
  insertSnippet(buildGetSnippet())
}

const handleInsertSetVar = () => {
  insertSnippet(buildSetSnippet())
}
const handleMonacoValidate = (errors: string[]) => {
  scriptError.value = errors[0] || ''
}

const handleCmValidate = (errors: string[]) => {
  scriptError.value = errors[0] || ''
}

// 内部编辑脚本时向外同步
watch(
  () => code.value,
  (val) => {
    emit('update:modelValue', val)
  }
)

// 占位：导入脚本模板（后续替换为真实接口调用）
const handleImportTemplate = async () => {
  try {
    // TODO: 调用后端脚本模板接口，按当前 language 选择合适模板
    // 例如：const tpl = await fetchScriptTemplate(language.value)
    const tpl = `// TODO: 替换为真实脚本模板\n// language: ${language.value}\n`
    code.value = tpl
    ElMessage.success('已导入脚本模板（示例，占位实现）')
  } catch (e) {
    ElMessage.error('导入脚本模板失败，请稍后重试')
  }
}
</script>

<template>
  <div class="script-step">
    <!-- 标题行：与 MySQL / DUCC / Redis 一致 -->
    <div class="script-step__header">
      <div class="left">
        <el-icon class="collapse-arrow" :class="{ 'is-collapsed': isCollapsed }" @click="toggleCollapse">
          <ArrowDown />
        </el-icon>
        <span class="index">{{ displayIndex }}</span>
        <span class="type-tag">自定义脚本</span>
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

    <!-- 内容区域：左侧代码编辑区域，去掉 AI 生成 -->
    <div v-show="!isCollapsed" class="script-step__body">
      <div class="script-layout">
        <!-- 左侧代码编辑区域 -->
        <div class="script-editor-card">
          <div class="script-editor-header">
            <div class="title">自定义代码</div>
          </div>
          <div class="script-editor-body">
            <MonacoEditor
              v-if="language !== 'python'"
              v-model:modelValue="code"
              :language="monacoLanguage"
              @validate="handleMonacoValidate"
            />
            <CodeMirrorEditor
              v-else
              v-model:modelValue="code"
              @validate="handleCmValidate"
            />
            <div v-if="scriptError" class="field-error">
              {{ scriptError }}
            </div>
          </div>
        </div>

        <!-- 右侧脚本语言 + 变量操作 / 模板导入 -->
        <div class="script-side-panel">
          <div class="side-row">
            <el-select v-model="language" size="small" class="lang-select-inner">
              <el-option label="beanshell" value="beanshell" />
              <el-option label="python" value="python" />
              <el-option label="groovy" value="groovy" />
              <el-option label="javascript" value="javascript" />
              <el-option label="qlexpress" value="qlexpress" />
            </el-select>
          </div>
          <template v-if="!props.useTemplateMode">
            <div class="side-row side-row--label">
              <span class="side-label">自定义变量</span>
            </div>
            <div class="side-row">
              <el-button link type="primary" @click="handleInsertGetVar">获取变量</el-button>
            </div>
            <div class="side-row">
              <el-button link type="primary" @click="handleInsertSetVar">设置变量</el-button>
            </div>
          </template>
          <template v-else>
            <div class="side-row side-row--label">
              <span class="side-label">脚本模板</span>
            </div>
            <div class="side-row">
              <el-button link type="primary" @click="handleImportTemplate">
                导入脚本模板
              </el-button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.script-step {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px 16px 16px;
  background: #fff;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
}

.script-step__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.script-step__header .left {
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

.script-step__header .right :deep(.el-button) {
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

.script-step__body {
  margin-top: 8px;
}

.script-layout {
  display: flex;
  gap: 16px;
}

.script-editor-card {
  flex: 1;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
  box-sizing: border-box;
}

.script-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.script-editor-header .title {
  font-weight: 500;
  color: #303133;
}

.lang-select {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.lang-select-inner {
  width: 130px;
}

.script-editor-body :deep(.el-textarea__inner) {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
}

.script-side-panel {
  width: 140px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.side-row {
  width: 100%;
}

.side-row--label .side-label {
  font-size: 13px;
  color: #606266;
}

.field-error {
  margin-top: 4px;
  font-size: 12px;
  color: #f56c6c;
}
</style>