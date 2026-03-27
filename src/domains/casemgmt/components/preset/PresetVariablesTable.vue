<template>
  <div class="preset-vars">
    <div class="preset-toolbar">
      <div class="toolbar-left">
        <div class="field">
          <div class="label">
            <span>变量选择</span>
          </div>
          <el-select v-model="selectedModule" class="select" placeholder="请选择" size="small" clearable>
            <el-option v-for="opt in projectOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>

        <div class="field">
          <div class="label">
            <el-checkbox v-model="multiTemplateEnabled" class="label-checkbox" @change="onMultiTemplateToggle">多选模板</el-checkbox>
            <el-tooltip placement="top">
              <template #content>
                <div class="preset-tooltip-text">
                  更改当前生效变量模板，需要更改当前引用的变量模板并点保存之后查看
                </div>
              </template>
              <svg
                viewBox="64 64 896 896"
                class="q"
                focusable="false"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344.3 352 380.7 352 420v7.6c0 4.3 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-24.3 19.7-44 44-44h7.6c22.5 0 39.6 6.5 52.1 18.8 9.8 9.6 15.3 22.7 15.3 36.7 0 14-5.4 27.3-15.3 37.1L527.7 474c-24.5 24.3-40.5 56-44.2 90.1l-3.1 29.2c-.4 4.2 2.9 7.9 7.1 7.9h48.2c4 0 7.4-3 7.9-7l2.5-23.8c2.2-20.7 11.2-40.3 25.4-54.6l39.6-39.2C632.7 353.3 640 334 640 305.4c0-31.7-12.3-61.7-34.4-83.7zM472 664a48 48 0 1096 0 48 48 0 10-96 0z" />
              </svg>
            </el-tooltip>
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
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Plus, QuestionFilled } from '@element-plus/icons-vue'
import { usePresetVariablesStore } from '../../stores/usePresetVariablesStore'
import { usePresetTemplateStore } from '../../stores/usePresetTemplateStore'
import PresetVarTableCore from './PresetVarTableCore.vue'
import { fetchTemplateVariableList, fetchTemplateVariableDetail } from '../../api'
import { fetchProjectList } from '@/domains/project/api'

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

const projectOptions = ref<Array<{ label: string; value: string | number }>>([])

const store = usePresetVariablesStore()
const templateStore = usePresetTemplateStore()

const selectedModule = computed<string | number>({
  get() {
    return store.selectedModule
  },
  set(v) {
    store.setSelectedModule(v as any)
  }
})

const templateSingle = computed<string | number>({
  get() {
    return store.templateSingle
  },
  set(v) {
    store.setTemplateSingle(v as any)
  }
})

const templateMulti = computed<Array<string | number>>({
  get() {
    return (store.templateMulti || []) as Array<string | number>
  },
  set(v) {
    store.setTemplateMulti(v as any)
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

const remoteTemplateOptions = ref<Array<{ label: string; value: string | number }>>([])

const templateOptions = computed(() => {
  const dynamic = templateStore.templates.map((t) => ({
    label: t.name,
    value: t.name
  }))
  return [...remoteTemplateOptions.value, ...dynamic]
})

const templateSelectValue = computed<string | number | Array<string | number>>({
  get() {
    return multiTemplateEnabled.value ? templateMulti.value : templateSingle.value
  },
  set(v) {
    if (multiTemplateEnabled.value) {
      templateMulti.value = Array.isArray(v) ? v : (v !== '' && v != null ? [v as string | number] : [])
    } else {
      templateSingle.value = Array.isArray(v) ? (v[0] ?? '') : ((v ?? '') as string | number)
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

function resolveListPayload(resp: any) {
  return resp?.data?.data?.items || resp?.data?.data?.list || []
}

function mapTemplateOption(item: any, idx: number) {
  const value = item?.template_id ?? item?.id ?? item?.templateId ?? idx
  const label = item?.template_name ?? item?.name ?? item?.title ?? `模板${idx + 1}`
  return { value, label }
}

function mapVariableRow(item: any) {
  return {
    id: item?.id ?? item?.variable_id ?? undefined,
    varType: Number(item?.var_type ?? item?.varType ?? 0),
    name: item?.name ?? item?.variable_name ?? item?.key ?? '',
    value: item?.value ?? item?.variable_value ?? '',
    remark: item?.remark ?? item?.description ?? ''
  }
}

async function loadTemplateOptions() {
  if (selectedModule.value === '' || selectedModule.value == null) {
    remoteTemplateOptions.value = []
    return
  }
  const resp = await fetchTemplateVariableList({ project_id: selectedModule.value })
  const list = resolveListPayload(resp)
  remoteTemplateOptions.value = (Array.isArray(list) ? list : []).map(mapTemplateOption)
}

async function loadTemplateVariables(templateId: string | number) {
  if (templateId === '' || templateId == null) return
  const resp = await fetchTemplateVariableDetail({ template_id: templateId })
  const variables = resp?.data?.data?.variables || []
  const rows = (Array.isArray(variables) ? variables : []).map((item: any) => ({
    id: item?.id ?? undefined,
    varType: Number(item?.var_type ?? 0),
    name: item?.var_name ?? '',
    value: item?.var_value ?? '',
    remark: item?.remark ?? ''
  }))
  emit('update:modelValue', rows)
}

onMounted(() => {
  void loadProjectOptions()
})

async function loadProjectOptions() {
  const resp = await fetchProjectList({ project_id: '', page: 1, page_size: 100 })
  const list = resp?.data?.data?.list || []
  projectOptions.value = (Array.isArray(list) ? list : []).map((item: any) => ({
    label: item?.name ?? '',
    value: item?.id ?? ''
  }))
  if ((selectedModule.value === '' || selectedModule.value == null) && projectOptions.value.length > 0) {
    selectedModule.value = projectOptions.value[0].value
  } else {
    void loadTemplateOptions()
  }
}

watch(
  () => selectedModule.value,
  () => {
    templateSingle.value = ''
    templateMulti.value = []
    emit('update:modelValue', [])
    void loadTemplateOptions()
  }
)

// 单选模板变化时，如果命中已保存模板，则自动填充变量行
watch(
  () => templateSingle.value,
  (templateId) => {
    if (templateId === '' || templateId == null) return
    void loadTemplateVariables(templateId)

    const tpl = templateStore.templates.find((t) => t.name === String(templateId))
    if (!tpl) return
    const pureRows = Array.isArray(tpl.rows) ? tpl.rows : []
    if (pureRows.length > 0) {
      emit('update:modelValue', pureRows)
    }
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
  color: #1890ff;
  font-size: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.preset-tooltip-text {
  max-width: 220px;
  white-space: normal;
  word-break: break-all;
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
