<template>
  <div class="preset-var-table-core">
    <el-table
      :data="rows"
      size="small"
      border
      class="preset-table"
      :header-cell-style="{ background: '#fafafa' }"
    >
      <el-table-column label="类型" width="120">
        <template #default="{ row }">
          <el-select
            v-model="row.varType"
            size="small"
            class="cell-select"
            :disabled="row.editing === false"
          >
            <el-option :label="'普通变量'" :value="0" />
            <el-option :label="'数组'" :value="1" />
            <el-option :label="'JSON数组'" :value="2" />
            <el-option :label="'UUID'" :value="3" />
            <el-option :label="'随机数'" :value="4" />
            <el-option :label="'当前日期'" :value="5" />
            <el-option :label="'时间戳'" :value="6" />
            <el-option :label="'动态变量'" :value="7" />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column min-width="180">
        <template #header>
          <div class="name-header">
            <span>变量名</span>
            <el-tooltip placement="top">
              <template #content>
                <div class="name-tooltip-text">
                  动态变量：<br />
                  具体参照
                  <a href="javascript:void(0)" class="param-doc-link">参数变量文档</a>
                </div>
              </template>
              <svg
                viewBox="64 64 896 896"
                class="name-help-icon"
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
        </template>
        <template #default="{ row }">
          <div class="name-cell">
            <el-input
              v-model="row.name"
              size="small"
              placeholder="变量名"
              :disabled="row.editing === false"
              :class="{ 'is-invalid': row.invalid }"
              @input="() => handleNameInput(row)"
            />
          </div>
        </template>
      </el-table-column>

      <el-table-column label="值" min-width="260">
        <template #default="{ row }">
          <el-input
            v-model="row.value"
            size="small"
            placeholder="变量值"
            :disabled="row.editing === false"
          />
        </template>
      </el-table-column>

      <el-table-column label="备注" min-width="140">
        <template #default="{ row }">
          <el-input
            v-model="row.remark"
            size="small"
            placeholder="备注"
            :disabled="row.editing === false"
          />
        </template>
      </el-table-column>

      <el-table-column label="操作" width="90" align="center">
        <template #default="{ row, $index }">
          <div class="ops">
            <template v-if="row.editing">
              <!-- 保存 -->
              <button class="icon-btn" type="button" @click="saveRow(row)">
                <svg viewBox="0 0 16 16" class="icon-svg">
                  <path
                    d="M3 2.5A1.5 1.5 0 0 1 4.5 1h7a.5.5 0 0 1 .35.15l2 2A.5.5 0 0 1 14 4v9.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5v-11A1.5 1.5 0 0 1 3 1.5zm1 0a.5.5 0 0 0-.5.5v3h7V2h-6.5zM4 8v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V8H4z"
                  />
                </svg>
              </button>
              <span class="ops-divider" />
              <!-- 撤销本次编辑 -->
              <button class="icon-btn" type="button" @click="cancelEdit(row, $index)">
                <svg viewBox="0 0 16 16" class="icon-svg">
                  <path
                    d="M5.854 3.646a.5.5 0 0 0-.708 0L2.5 6.293 5.146 8.94a.5.5 0 1 0 .708-.707L3.707 6.586H9a3.5 3.5 0 1 1 0 7H5.5a.5.5 0 0 0 0 1H9a4.5 4.5 0 1 0 0-9H3.707l2.147-2.146a.5.5 0 0 0 0-.708z"
                  />
                </svg>
              </button>
            </template>
            <template v-else>
              <!-- 编辑 -->
              <button class="icon-btn" type="button" @click="startEdit(row)">
                <svg viewBox="0 0 16 16" class="icon-svg">
                  <path
                    d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-8.5 8.5a.5.5 0 0 1-.168.11l-4 1.5a.5.5 0 0 1-.65-.65l1.5-4a.5.5 0 0 1 .11-.168l8.5-8.5zM11.5 2.207 13.793 4.5 14.5 3.793 12.207 1.5 11.5 2.207zM11.086 5 9 2.914 3.5 8.414V9H4.5a.5.5 0 0 1 .5.5V11h.586L11.086 5z"
                  />
                </svg>
              </button>
              <span class="ops-divider" />
              <!-- 删除 -->
              <button class="icon-btn" type="button" @click="remove($index)">
                <svg viewBox="0 0 16 16" class="icon-svg">
                  <path
                    d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm2.5-.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z"
                  />
                  <path
                    d="M14.5 3a1 1 0 0 1-1 1H13v9.5A1.5 1.5 0 0 1 11.5 15h-7A1.5 1.5 0 0 1 3 13.5V4h-.5a1 1 0 0 1 0-2h3A1.5 1.5 0 0 1 7 1.5h2A1.5 1.5 0 0 1 10.5 3h3a1 1 0 0 1 1 1zM4 4v9.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V4H4z"
                  />
                </svg>
              </button>
            </template>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="props.showAddButton !== false" class="add-row">
      <el-button size="small" @click="addRow">
        <el-icon class="mr-4"><Plus /></el-icon>
        添加
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

export type PresetVarType = number

export interface PresetVarRow {
  id?: string | number
  varType: PresetVarType
  name: string
  value: string
  remark: string
  editing?: boolean
  _backup?: {
    varType: PresetVarType
    name: string
    value: string
    remark: string
  }
  invalid?: boolean
}

const props = defineProps<{
  modelValue: PresetVarRow[]
  showAddButton?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: PresetVarRow[]): void
}>()

const createRow = (): PresetVarRow => ({
  varType: 0,
  name: '',
  value: '',
  remark: '',
  editing: true,
  invalid: false
})

const rows = ref<PresetVarRow[]>([])
const initialized = ref(false)

const toPureRows = (arr: PresetVarRow[]) =>
  arr.map(({ editing, _backup, invalid, ...rest }) => ({
    ...rest
  }))

watch(
  () => props.modelValue,
  (val) => {
    if (!initialized.value) {
      rows.value = (Array.isArray(val) && val.length > 0
        ? val
        : [createRow()]
      ).map((r) => ({
        ...createRow(),
        ...r,
        editing: false
      }))
      initialized.value = true
    }
  },
  { immediate: true, deep: true }
)

const sync = () => {
  emit('update:modelValue', toPureRows(rows.value))
}

const validateRow = (row: PresetVarRow): boolean => {
  const name = (row.name || '').trim()
  if (!name) {
    row.invalid = true
    ElMessage.error('变量名不能为空')
    return false
  }
  const duplicated = rows.value.some(
    (r) => r !== row && (r.name || '').trim() === name
  )
  if (duplicated) {
    row.invalid = true
    ElMessage.error('同一个模板下变量名不能重复')
    return false
  }
  row.invalid = false
  return true
}

const handleNameInput = (row: PresetVarRow) => {
  const name = (row.name || '').trim()
  if (!name) {
    row.invalid = false
    return
  }
  const duplicated = rows.value.some(
    (r) => r !== row && (r.name || '').trim() === name
  )
  row.invalid = duplicated
}

const addRow = () => {
  // 新增前必须先“保存”上一行：变量名必填且不重复
  const last = rows.value[rows.value.length - 1]
  if (last) {
    if (!validateRow(last)) {
      // 校验不通过时阻止新增，并保留在当前行
      return
    }
    last.editing = false
  }

  rows.value.push(createRow())
  sync()
}

const startEdit = (row: PresetVarRow) => {
  if (row.editing) {
    if (!validateRow(row)) return
    row.editing = false
    sync()
    return
  }

  row._backup = {
    varType: row.varType,
    name: row.name,
    value: row.value,
    remark: row.remark
  }

  rows.value.forEach((r) => {
    r.editing = r === row
  })
}

const remove = (idx: number) => {
  rows.value.splice(idx, 1)
  sync()
}

const saveRow = (row: PresetVarRow) => {
  if (!validateRow(row)) return
  row.editing = false
  row._backup = undefined
  sync()
}

const cancelEdit = (row: PresetVarRow, index: number) => {
  if (!row._backup) {
    // 新增行未保存过，撤销=删除
    rows.value.splice(index, 1)
    if (rows.value.length === 0) {
      rows.value.push(createRow())
    }
    sync()
    return
  }

  row.varType = row._backup.varType
  row.name = row._backup.name
  row.value = row._backup.value
  row.remark = row._backup.remark
  row.editing = false
  row._backup = undefined
  row.invalid = false
  sync()
}

const validateAll = (): boolean => {
  for (const row of rows.value) {
    const hasEdited =
      (row.name && row.name.trim()) ||
      (row.value && String(row.value).trim()) ||
      (row.remark && row.remark.trim())
    if (hasEdited && !validateRow(row)) {
      return false
    }
  }
  return true
}

defineExpose({
  validateAll,
  addRow
})
</script>

<style scoped>
.preset-var-table-core {
  width: 100%;
}

.preset-table :deep(.el-input__wrapper),
.preset-table :deep(.el-select__wrapper) {
  box-shadow: none;
  border: 1px solid #dcdfe6;
}

.preset-table :deep(.el-input.is-invalid .el-input__wrapper) {
  border-color: #f56c6c;
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

.name-header {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
}

.name-help-icon {
  font-size: 14px;
  color: #1890ff;
  cursor: pointer;
}

.name-tooltip-text {
  max-width: 220px;
  white-space: normal;
  word-break: break-all;
}

.param-doc-link {
  color: #1890ff;
  text-decoration: underline;
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

.add-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 10px 0;
}

.mr-4 {
  margin-right: 4px;
}
</style>

