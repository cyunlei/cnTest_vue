<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'

export interface JsonPathAssertRow {
  type?: string
  field?: string
  rule?: string | number
  expected?: string
  remark?: string
  extractVar?: string
}

const props = defineProps<{
  modelValue: JsonPathAssertRow[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: JsonPathAssertRow[]): void
  (e: 'json-add'): void
  (e: 'batch-delete'): void
}>()

const tableData = computed({
  get: () => props.modelValue || [],
  set: (v: JsonPathAssertRow[]) => emit('update:modelValue', v)
})

const hasData = computed(() => Array.isArray(tableData.value) && tableData.value.length > 0)

const selectedRows = ref<JsonPathAssertRow[]>([])
const hasSelection = computed(() => selectedRows.value.length > 0)

const typeOptions = [
  { label: 'JSON', value: 'JSON' },
  { label: '正则', value: 'REGEX' },
  { label: 'Header', value: 'HEADER' },
  { label: '状态码', value: 'STATUS' }
]

// 断言操作符分组（value 为数值编码，label 为展示文案）
const OPERATOR_GROUPS = [
  {
    category: '相等比较',
    operators: [
      { value: 0, label: '等于' },
      { value: 1, label: '字符串等于' },
      { value: 2, label: '不等于' }
    ]
  },
  {
    category: '大小比较',
    operators: [
      { value: 3, label: '大于' },
      { value: 4, label: '大于等于' },
      { value: 5, label: '小于' },
      { value: 6, label: '小于等于' }
    ]
  },
  {
    category: '字符串操作',
    operators: [
      { value: 7, label: '包含' },
      { value: 8, label: '不包含' },
      { value: 14, label: '为空' },
      { value: 15, label: '非空' },
      { value: 19, label: '开头是' },
      { value: 20, label: '正则匹配' }
    ]
  },
  {
    category: '数组操作',
    operators: [
      { value: 9, label: '包含' },
      { value: 10, label: '不包含' },
      { value: 11, label: '被包含' },
      { value: 12, label: '长度等于' }
    ]
  },
  {
    category: '对象操作',
    operators: [{ value: 13, label: '包含键' }]
  },
  {
    category: '空值判断',
    operators: [
      { value: 16, label: '为空' },
      { value: 17, label: '非空' },
      { value: 18, label: '为空或字符串为空' }
    ]
  },
  {
    category: '高级',
    operators: [
      { value: 21, label: '表达式为真' },
      { value: 22, label: '类型为' }
    ]
  }
]

const operatorValueToLabel = new Map<number, string>()
const operatorLabelToGroupIndex = new Map<string, number>()

OPERATOR_GROUPS.forEach((g, gi) => {
  g.operators.forEach((op) => {
    operatorValueToLabel.set(op.value, op.label)
    operatorLabelToGroupIndex.set(op.label, gi)
  })
})

const OPERATOR_COLORS = [
  '#df4951', // 赤
  '#fa8c16', // 橙
  '#fadb14', // 黄
  '#52c41a', // 绿
  '#13c2c2', // 青
  '#1890ff', // 蓝
  '#722ed1'  // 紫
]

const NO_EXPECTED_RULES = ['为空', '非空', '为空或字符串为空']

function getRuleLabel(rule: string | number | undefined) {
  if (typeof rule === 'number') return operatorValueToLabel.get(rule) || String(rule)
  return rule || ''
}

function getRuleColor(rule: string | number | undefined) {
  const label = getRuleLabel(rule)
  const gi = operatorLabelToGroupIndex.get(label)
  if (gi === undefined) return ''
  return OPERATOR_COLORS[gi % OPERATOR_COLORS.length]
}

function getTypeLabel(type: string | undefined) {
  const opt = typeOptions.find((t) => t.value === type)
  return opt ? opt.label : type || ''
}

function isEditing(row: JsonPathAssertRow) {
  return Boolean((row as any).__editing)
}

const editBackup = new WeakMap<object, JsonPathAssertRow>()

function startEdit(row: JsonPathAssertRow) {
  ;(row as any).__editing = true
  if (!editBackup.has(row as any)) {
    editBackup.set(row as any, { ...row })
  }
}

function saveEdit(row: JsonPathAssertRow) {
  const field = (row.field || '').trim()
  const ruleLabel = getRuleLabel(row.rule).trim()
  const expected = (row.expected || '').trim()

  const requireExpected = !NO_EXPECTED_RULES.includes(ruleLabel)

  if (!field || !ruleLabel || (requireExpected && !expected)) {
    ElMessage.error('字段、规则、期望值均不能为空')
    return
  }

  // 这些类型不需要期望值，确保保存为空
  if (!requireExpected) {
    row.expected = ''
  }

  ;(row as any).__editing = false
  editBackup.delete(row as any)
  emit('update:modelValue', (tableData.value || []).slice())
}

function cancelEdit(row: JsonPathAssertRow) {
  const backup = editBackup.get(row as any)
  if (backup) {
    Object.assign(row as any, backup)
  }
  ;(row as any).__editing = false
  editBackup.delete(row as any)
  emit('update:modelValue', (tableData.value || []).slice())
}

function handleJsonAdd() {
  emit('json-add')
}

function handleAddEmptyRow() {
  const next = (tableData.value || []).slice()
  const newRow: JsonPathAssertRow & { __editing?: boolean } = {
    type: 'JSON',
    field: '',
    rule: '等于',
    expected: '',
    remark: '',
    extractVar: ''
  }
  newRow.__editing = true
  next.push(newRow)
  emit('update:modelValue', next)
}

function handleBatchDelete() {
  emit('batch-delete')
}

function handleDeleteRow(index: number) {
  const next = (tableData.value || []).slice()
  next.splice(index, 1)
  emit('update:modelValue', next)
}

function handleSelectionChange(rows: JsonPathAssertRow[]) {
  selectedRows.value = rows || []
}
</script>

<template>
  <div class="jsonpath-assert-panel">
    <div class="assert-table" :class="{ 'assert-table--scroll': hasData }">
      <div class="assert-toolbar">
        <el-icon class="add-icon" @click="handleAddEmptyRow"><Plus /></el-icon>
        <el-button size="small" class="ml-4" @click="handleJsonAdd">JSON添加</el-button>
        <el-button size="small" :disabled="!hasSelection" @click="handleBatchDelete">批量删除</el-button>
      </div>
      <el-table
        :data="tableData"
        size="small"
        :border="false"
        table-layout="fixed"
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="30" />
        <el-table-column label="类型" width="70">
          <template #header>
            <span>类型</span>
            <el-tooltip placement="top">
              <template #content>
                <div class="assert-tooltip-text">
                  当前仅支持“JSONPATH”，如果您有其他需求，可以右上角咚咚联系我们
                </div>
              </template>
              <svg
                viewBox="64 64 896 896"
                class="label-icon"
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
          </template>
          <template #default="{ row }">
            <template v-if="isEditing(row)">
              <el-select
                v-model="row.type"
                size="small"
                placeholder="请选择类型"
                style="width: 100%;"
              >
                <el-option
                  v-for="opt in typeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </template>
            <span v-else class="cell-text">{{ getTypeLabel(row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="字段" min-width="120">
          <template #header>
            <span>字段</span>
            <el-tooltip placement="top">
              <template #content>
                <div class="assert-tooltip-text">
                  关于 JSONPATH 的编写，您可以参考
                  <a href="https://github.com/json-path/JsonPath" target="_blank" rel="noopener noreferrer">JSONPATH 官方说明</a>
                  来完成，也可以通过
                  <a href="https://jsonpath.com/" target="_blank" rel="noopener noreferrer">JSONPath Online Evaluator</a>
                  来辅助填写
                </div>
              </template>
              <svg viewBox="64 64 896 896" class="label-icon" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344.3 352 380.7 352 420v7.6c0 4.3 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-24.3 19.7-44 44-44h7.6c22.5 0 39.6 6.5 52.1 18.8 9.8 9.6 15.3 22.7 15.3 36.7 0 14-5.4 27.3-15.3 37.1L527.7 474c-24.5 24.3-40.5 56-44.2 90.1l-3.1 29.2c-.4 4.2 2.9 7.9 7.1 7.9h48.2c4 0 7.4-3 7.9-7l2.5-23.8c2.2-20.7 11.2-40.3 25.4-54.6l39.6-39.2C632.7 353.3 640 334 640 305.4c0-31.7-12.3-61.7-34.4-83.7zM472 664a48 48 0 1096 0 48 48 0 10-96 0z" />
              </svg>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <template v-if="isEditing(row)">
              <el-input v-model="row.field" size="small" placeholder="字段" />
            </template>
            <span v-else class="cell-text">{{ row.field || '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="规则" width="110">
          <template #header>
            <span>规则</span>
            <el-tooltip placement="top">
              <template #content>
                <div class="assert-tooltip-text">
                  规则支持“等于”“包含”“正则”三种方式，后续我们会酌情再支持其他方式
                </div>
              </template>
              <svg viewBox="64 64 896 896" class="label-icon" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344.3 352 380.7 352 420v7.6c0 4.3 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-24.3 19.7-44 44-44h7.6c22.5 0 39.6 6.5 52.1 18.8 9.8 9.6 15.3 22.7 15.3 36.7 0 14-5.4 27.3-15.3 37.1L527.7 474c-24.5 24.3-40.5 56-44.2 90.1l-3.1 29.2c-.4 4.2 2.9 7.9 7.1 7.9h48.2c4 0 7.4-3 7.9-7l2.5-23.8c2.2-20.7 11.2-40.3 25.4-54.6l39.6-39.2C632.7 353.3 640 334 640 305.4c0-31.7-12.3-61.7-34.4-83.7zM472 664a48 48 0 1096 0 48 48 0 10-96 0z" />
              </svg>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <template v-if="isEditing(row)">
              <el-select
                :model-value="getRuleLabel(row.rule)"
                @update:model-value="(v: string) => { row.rule = v; if (NO_EXPECTED_RULES.includes(v)) row.expected = '' }"
                size="small"
                placeholder="请选择规则"
                class="rule-select"
                :style="{ '--rule-color': getRuleColor(row.rule) || '' }"
                popper-class="json-assert-rule-popper"
              >
                <template v-for="(group, gi) in OPERATOR_GROUPS" :key="group.category">
                  <el-option
                    :value="`__cat__${group.category}`"
                    :label="group.category"
                    disabled
                    class="operator-category-option"
                  />
                  <el-option
                    v-for="op in group.operators"
                    :key="op.value"
                    :label="op.label"
                    :value="op.label"
                    :title="op.label"
                    :class="`operator-option operator-color-${gi % 7}`"
                  />
                </template>
              </el-select>
            </template>
            <span
              v-else
              class="cell-text rule-text"
              :style="{ color: getRuleColor(row.rule) || '#606266' }"
            >{{ getRuleLabel(row.rule) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="期望值" min-width="200" show-overflow-tooltip>
          <template #header>
            <span>期望值</span>
            <el-tooltip placement="top">
              <template #content>
                <div class="assert-tooltip-text">
                  期望值填写示例：<br />
                  字符串: "hello"<br />
                  正则: "\\d{1,4}", "hello.*"<br />
                  数组: [1, "str", {"nick": "x"}]<br />
                  对象: {"sex":"male","name":"ab"}<br />
                  除正则表达式外，请确保所有输入均为合法的 JSON 字符串，附两款在线工具辅助填写：<br />
                  <a href="https://www.json.cn/" target="_blank" rel="noopener noreferrer">JSON 在线校验</a>
                  &nbsp;
                  <a href="https://tool.oschina.net/regex/" target="_blank" rel="noopener noreferrer">正则表达式</a>
                </div>
              </template>
              <svg viewBox="64 64 896 896" class="label-icon" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344.3 352 380.7 352 420v7.6c0 4.3 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-24.3 19.7-44 44-44h7.6c22.5 0 39.6 6.5 52.1 18.8 9.8 9.6 15.3 22.7 15.3 36.7 0 14-5.4 27.3-15.3 37.1L527.7 474c-24.5 24.3-40.5 56-44.2 90.1l-3.1 29.2c-.4 4.2 2.9 7.9 7.1 7.9h48.2c4 0 7.4-3 7.9-7l2.5-23.8c2.2-20.7 11.2-40.3 25.4-54.6l39.6-39.2C632.7 353.3 640 334 640 305.4c0-31.7-12.3-61.7-34.4-83.7zM472 664a48 48 0 1096 0 48 48 0 10-96 0z" />
              </svg>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <template v-if="isEditing(row)">
              <el-input v-model="row.expected" size="small" placeholder="期望值" />
            </template>
            <span v-else class="cell-text">{{ row.expected || '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" width="70">
          <template #default="{ row }">
            <template v-if="isEditing(row)">
              <el-input v-model="row.remark" size="small" placeholder="备注" />
            </template>
            <span v-else class="cell-text">{{ row.remark || '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提取变量" width="90">
          <template #default="{ row }">
            <template v-if="isEditing(row)">
              <el-input v-model="row.extractVar" size="small" placeholder="提取变量" />
            </template>
            <span v-else class="cell-text">{{ row.extractVar || '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" align="center">
          <template #default="{ row, $index }">
            <div class="row-actions">
              <template v-if="isEditing(row)">
                <svg
                  viewBox="64 64 896 896"
                  class="row-action-icon save"
                  focusable="false"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  aria-hidden="true"
                  @click.stop="saveEdit(row)"
                >
                  <path d="M880 298.7L725.3 144a8 8 0 00-5.7-2.3H184c-17.7 0-32 14.3-32 32v672c0 17.7 14.3 32 32 32h656c17.7 0 32-14.3 32-32V304c0-2.1-.8-4.2-2.3-5.7zM512 192a96 96 0 110 192 96 96 0 010-192zm256 576H256v-96c0-35.3 28.7-64 64-64h384c35.3 0 64 28.7 64 64v96z" />
                </svg>
                <svg
                  viewBox="64 64 896 896"
                  class="row-action-icon cancel"
                  focusable="false"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  aria-hidden="true"
                  @click.stop="cancelEdit(row)"
                >
                  <path d="M563.8 512l262.5-262.5a8 8 0 000-11.3L748.8 160a8 8 0 00-11.3 0L475 422.5 212.5 160a8 8 0 00-11.3 0L197.8 238.2a8 8 0 000 11.3L460.3 512 197.8 774.5a8 8 0 000 11.3L212.5 864a8 8 0 0011.3 0L475 601.5 737.5 864a8 8 0 0011.3 0l77.5-78.2a8 8 0 000-11.3L563.8 512z" />
                </svg>
              </template>
              <template v-else>
                <svg
                  viewBox="64 64 896 896"
                  class="row-action-icon edit"
                  focusable="false"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  aria-hidden="true"
                  @click.stop="startEdit(row)"
                >
                  <path d="M880.1 293.7L730.3 143.9a8.03 8.03 0 0 0-11.3 0L293.7 569.2a8.03 8.03 0 0 0-2.3 5.7V752c0 4.4 3.6 8 8 8h177.1c2.1 0 4.2-.8 5.7-2.3l425.3-425.3a8.03 8.03 0 0 0 0-11.3zM444.7 704H352v-92.7l357.1-357.1 92.7 92.7L444.7 704z" />
                  <path d="M135.5 824h753c4.4 0 8 3.6 8 8v40c0 4.4-3.6 8-8 8h-753c-4.4 0-8-3.6-8-8v-40c0-4.4 3.6-8 8-8z" />
                </svg>
                <svg
                  viewBox="64 64 896 896"
                  class="row-action-icon delete"
                  focusable="false"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  aria-hidden="true"
                  @click.stop="handleDeleteRow($index)"
                >
                  <path d="M696 480H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z" />
                  <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                </svg>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!hasData" description="暂无数据" :image-size="64" />
    </div>
  </div>
</template>

<style scoped>
.jsonpath-assert-panel {
  padding-top: 4px;
}

.assert-table {
  margin-top: 16px;
  height: 260px;
  overflow-y: hidden;
}

.assert-table--scroll {
  overflow-y: auto;
}

.assert-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.assert-table :deep(.el-table__body-wrapper),
.assert-table :deep(.el-table__header-wrapper) {
  overflow-x: hidden;
}

.assert-table :deep(.el-scrollbar__bar.is-horizontal) {
  display: none !important;
}

.cell-text {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #606266;
}

.rule-text {
  font-weight: 500;
}

.row-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.row-action-icon {
  cursor: pointer;
  font-size: 14px;
  color: #1890ff;
}

.row-action-icon.delete {
  color: #ff4d4f;
}

.row-action-icon.save {
  color: #1890ff;
}

.row-action-icon.cancel {
  color: #909399;
}

.assert-tooltip-text {
  max-width: 180px;
  white-space: normal;
  word-break: break-all;
}

.assert-tooltip-text a {
  color: #1890ff;
}

.label-icon {
  font-size: 12px;
  color: #2695f1;
  margin-left: 4px;
  cursor: help;
  vertical-align: middle;
}

.add-icon {
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
}

.ml-4 {
  margin-left: 4px;
}

.rule-select {
  width: 100%;
  min-width: 100px;
}

:global(.json-assert-rule-popper) {
  min-width: 140px !important;
  width: 140px !important;
}

:global(.json-assert-rule-popper .el-select-dropdown__item) {
  text-align: center;
  padding-top: 1px;
  padding-bottom: 1px;
  line-height: 16px;
}

:global(.json-assert-rule-popper .operator-category-option) {
  color: #909399 !important;
  cursor: default;
  font-size: 12px;
  
}

:global(.json-assert-rule-popper .operator-option.operator-color-0) {
  color:rgb(223, 73, 81);
  font-size: 10px;
}

:global(.json-assert-rule-popper .operator-option.operator-color-1) {
  color: #fa8c16;
  font-size: 10px;
}

:global(.json-assert-rule-popper .operator-option.operator-color-2) {
  color:rgb(155, 133, 9);
  font-size: 10px;
}

:global(.json-assert-rule-popper .operator-option.operator-color-3) {
  color: #52c41a;
  font-size: 10px;
}

:global(.json-assert-rule-popper .operator-option.operator-color-4) {
  color: #13c2c2;
  font-size: 10px;
}

:global(.json-assert-rule-popper .operator-option.operator-color-5) {
  color: #1890ff;
  font-size: 10px;
}

:global(.json-assert-rule-popper .operator-option.operator-color-6) {
  color: #722ed1;
  font-size: 10px;
}

.rule-select :deep(.el-select__selected-item) {
  text-align: center;
  color: var(--rule-color, #606266);
}
</style>
