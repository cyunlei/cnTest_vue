<template>
  <el-drawer
    v-model="visible"
    title="新增模板"
    size="60%"
    :destroy-on-close="true"
    :close-on-click-modal="true"
    direction="rtl"
  >
    <div class="tpl-drawer-body">
      <el-form label-width="110px" label-position="left" class="tpl-form">
        <el-form-item label="变量模板名称" required>
          <el-input v-model="templateName" placeholder="请输入变量模板名称" />
        </el-form-item>

        <div class="var-block">
          <div class="var-label">
            <span class="req-star">*</span>
            <span>变量</span>
          </div>
          <div class="tpl-table-wrapper">
            <preset-var-table-core ref="tableRef" v-model="rows" />
          </div>
        </div>

        <el-form-item label="描述">
          <el-input
            v-model="description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <div class="tpl-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import PresetVarTableCore from './PresetVarTableCore.vue'

export type PresetVarType = number

export interface PresetVarRow {
  varType: PresetVarType
  name: string
  value: string
  remark: string
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', payload: { name: string; description: string; rows: PresetVarRow[] }): void
}>()

const visible = ref(false)
const templateName = ref('')
const description = ref('')
const rows = ref<PresetVarRow[]>([])
const tableRef = ref<InstanceType<typeof PresetVarTableCore> | null>(null)

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      rows.value = []
    }
  },
  { immediate: true }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const close = () => {
  visible.value = false
}

const handleSave = () => {
  if (!templateName.value.trim()) {
    ElMessage.error('变量模板名称不能为空')
    return
  }

  if (tableRef.value && (tableRef.value as any).validateAll && !(tableRef.value as any).validateAll()) {
    return
  }

  const effectiveRows = rows.value.filter((r) =>
    (r.name || r.value || r.remark || '').toString().trim()
  )

  emit('save', {
    name: templateName.value.trim(),
    description: description.value.trim(),
        rows: effectiveRows.map((r) => ({
      varType: r.varType,
      name: r.name.trim(),
      value: r.value,
      remark: r.remark
    }))
  })

  visible.value = false
}
</script>

<style scoped>
.tpl-drawer-body {
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tpl-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.tpl-table-wrapper {
  width: 100%;
  flex: 1;
}

.var-block {
  margin-bottom: 16px;
}

.var-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
  margin-bottom: 6px;
}

.preset-table :deep(.el-input__wrapper),
.preset-table :deep(.el-select__wrapper) {
  box-shadow: none;
  border: 1px solid #dcdfe6;
}

.preset-table :deep(.el-input.is-invalid .el-input__wrapper) {
  border-color: #f56c6c;
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

.add-row {
  margin-top: 10px;
}

.tpl-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.mr-4 {
  margin-right: 4px;
}

.tpl-empty {
  margin: 12px 0;
}

.field-error {
  margin-top: 4px;
  color: #f56c6c;
  font-size: 12px;
}

.req-star {
  color: #f56c6c;
  margin-right: 4px;
}
</style>
