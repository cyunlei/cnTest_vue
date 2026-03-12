<template>
  <div class="preset-vars">
    <div class="preset-toolbar">
      <div class="toolbar-left">
        <div class="field">
          <div class="label">
            <span>变量选择</span>
            <el-icon class="q"><QuestionFilled /></el-icon>
          </div>
          <el-select v-model="selectedModule" class="select" placeholder="请选择" size="small" clearable>
            <el-option v-for="opt in moduleOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>

        <div class="field">
          <div class="label">
            <el-checkbox v-model="multiTemplateEnabled" class="label-checkbox" @change="onMultiTemplateToggle">多选模板</el-checkbox>
            <el-icon class="q"><QuestionFilled /></el-icon>
          </div>
          <el-select
            v-model="templateSelectValue"
            class="template-input"
            size="small"
            placeholder="请选择"
            clearable
            :multiple="multiTemplateEnabled"
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option v-for="opt in templateOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
      </div>

      <div class="toolbar-right">
        <el-button link type="primary" @click="handleGoModuleSettings">变量模板</el-button>
        <el-button link type="primary" @click="emit('new-template')">新增模板</el-button>
      </div>
    </div>

    <preset-var-table-core
      ref="tableRef"
      v-model="rowsModel"
      :show-add-button="false"
    />

    <div v-if="showTemplateActions" class="add-row">
      <el-button size="small" @click="handleAddRow">
        <el-icon class="mr-4"><Plus /></el-icon>
        添加
      </el-button>
      <el-button size="small" type="primary" plain @click="handleSaveTemplate">保存模板</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Plus, QuestionFilled } from '@element-plus/icons-vue'
import { usePresetVariablesStore } from '../stores/usePresetVariablesStore'
import { usePresetTemplateStore } from '../stores/usePresetTemplateStore'
import PresetVarTableCore from './PresetVarTableCore.vue'

// 类型映射：
// 0: 普通变量
// 1: 数组
// 2: JSON数组
// 3: UUID
// 4: 随机数
// 5: 当前日期
// 6: 时间戳
// 7: 动态变量
export type PresetVarType = number

export interface PresetVarRow {
  id?: string | number
  varType: PresetVarType
  name: string
  value: string
  remark: string
}

const props = defineProps<{
  modelValue: PresetVarRow[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: PresetVarRow[]): void
  (e: 'extract'): void
  (e: 'new-template'): void
  (e: 'save-template'): void
}>()

const router = useRouter()

const moduleOptions = [
  { label: '商家开放', value: '商家开放' },
  { label: '开放平台', value: '开放平台' },
  { label: '内部平台', value: '内部平台' }
]

const builtinTemplateOptions = [
  { label: '开放平台', value: '开放平台' },
  { label: '商家开放', value: '商家开放' },
  { label: '内部平台', value: '内部平台' }
]

const store = usePresetVariablesStore()
const templateStore = usePresetTemplateStore()

const selectedModule = computed<string>({
  get() {
    return store.selectedModule
  },
  set(v) {
    store.setSelectedModule(v)
  }
})

const templateSingle = computed<string>({
  get() {
    return store.templateSingle
  },
  set(v) {
    store.setTemplateSingle(v)
  }
})

const templateMulti = computed<string[]>({
  get() {
    return store.templateMulti
  },
  set(v) {
    store.setTemplateMulti(v)
  }
})

const multiTemplateEnabled = computed<boolean>({
  get() {
    return store.isMultiTemplate
  },
  set(v) {
    store.setMultiTemplate(v)
  }
})

const templateOptions = computed(() => {
  const dynamic = templateStore.templates.map((t) => ({
    label: t.name,
    value: t.name
  }))
  return [...builtinTemplateOptions, ...dynamic]
})

const templateSelectValue = computed<string | string[]>({
  get() {
    return multiTemplateEnabled.value ? templateMulti.value : templateSingle.value
  },
  set(v) {
    if (multiTemplateEnabled.value) {
      templateMulti.value = Array.isArray(v) ? v : (v ? [String(v)] : [])
    } else {
      templateSingle.value = Array.isArray(v) ? String(v[0] ?? '') : String(v ?? '')
    }
  }
})

const onMultiTemplateToggle = async (checked: boolean) => {
  if (!checked) {
    // 从多选切回单选：清空之前的多选内容
    templateMulti.value = []
    templateSingle.value = ''
    return
  }

  try {
    await ElMessageBox.confirm('如果您切换不会保留当前已编辑的变量信息。', '确认切换吗？', {
      confirmButtonText: '切换',
      cancelButtonText: '取消',
      type: 'warning',
      distinguishCancelAndClose: true
    })

    // 从单选切到多选：清空之前的单选内容
    templateSingle.value = ''
    templateMulti.value = []
  } catch {
    // 取消/关闭：恢复未勾选
    multiTemplateEnabled.value = false
  }
}

const showTemplateActions = computed(() => {
  if (multiTemplateEnabled.value) {
    return templateMulti.value.length > 0
  }
  return !!templateSingle.value
})

// 单选模板变化时，如果命中已保存模板，则自动填充变量行
watch(
  () => templateSingle.value,
  (name) => {
    if (!name) return
    const tpl = templateStore.templates.find((t) => t.name === name)
    if (!tpl) return
    const pureRows = Array.isArray(tpl.rows) ? tpl.rows : []
    emit('update:modelValue', pureRows)
  }
)

const rowsModel = computed<PresetVarRow[]>({
  get() {
    return props.modelValue
  },
  set(v) {
    emit('update:modelValue', v)
  }
})

const tableRef = ref<InstanceType<typeof PresetVarTableCore> | null>(null)

const handleSaveTemplate = () => {
  if (tableRef.value && (tableRef.value as any).validateAll && !(tableRef.value as any).validateAll()) {
    return
  }
  emit('save-template')
}

const handleAddRow = () => {
  if (tableRef.value && (tableRef.value as any).addRow) {
    (tableRef.value as any).addRow()
  }
}

const handleGoModuleSettings = () => {
  // 兼容之前对外的 extract 事件
  emit('extract')
  router.push('/module-settings')
}
</script>

<style scoped>
.preset-vars {
  width: 100%;
  min-height: 360px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
  padding: 8px 12px 12px;
  box-sizing: border-box;
}

.preset-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 0 10px;
}

.toolbar-left {
  display: flex;
  align-items: flex-end;
  gap: 0;
}

.field {
  display: flex;
  flex-direction: column;
}

.toolbar-left .field + .field {
  margin-left: 12px;
}

.field .label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
  margin-bottom: 6px;
}

.field .q {
  color: #909399;
  font-size: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.select,
.template-input {
  width: 220px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.label-checkbox :deep(.el-checkbox__inner) {
  width: 12px;
  height: 12px;
}

.label-checkbox :deep(.el-checkbox__label) {
  padding-left: 4px;
  font-size: 12px;
}

.preset-table :deep(.el-input__wrapper),
.preset-table :deep(.el-select__wrapper) {
  box-shadow: none;
  border: 1px solid #dcdfe6;
}

.preset-table :deep(.el-input.is-invalid .el-input__wrapper) {
  border-color: #f56c6c;
}

:deep(.el-select-dropdown__item) {
  font-size: 10px;
}

 .preset-table {
  flex: 1;
  margin-top: 4px;
}

.preset-table :deep(.el-table__body-wrapper),
.preset-table :deep(.el-table__cell) {
  overflow: visible;
}

.ops {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.icon-btn {
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover .icon-svg {
  color: #409eff;
}

.icon-svg {
  width: 14px;
  height: 14px;
  color: #606266;
}

.ops-divider {
  display: inline-block;
  width: 1px;
  height: 14px;
  background: #e4e7ed;
  margin: 0 4px;
}
.name-cell {
  position: relative;
}

.cell-error {
  position: absolute;
  left: 0;
  top: 100%;
  transform: translateY(2px);
  color: #f56c6c;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
}

.add-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
}

.mr-4 {
  margin-right: 4px;
}
</style>

