<template>
  <div class="urlencoded">
    <div class="table-container" v-if="!isBulkMode">
      <table class="urlencoded-table" ref="tableRef">
        <thead>
          <tr>
            <th class="col-checkbox"></th>
            <th class="col-key">Key</th>
            <th class="col-value" :class="{ 'col-hidden': !showValueColumn }">Value</th>
            <th class="col-description" :class="{ 'col-hidden': !showDescriptionColumn }">Description</th>
            <th class="col-actions">
              <div class="header-actions">
                <button class="column-toggle-btn" type="button" ref="columnToggleBtnRef" @click.stop="toggleColumnDropdown">⋯</button>
                <div class="column-dropdown" v-show="columnDropdownVisible" ref="columnDropdownRef" @click.stop>
                  <label class="dropdown-item">
                    <input type="checkbox" v-model="showValueColumn" /> value
                  </label>
                  <label class="dropdown-item">
                    <input type="checkbox" v-model="showDescriptionColumn" /> Description
                  </label>
                </div>
                <button class="bulk-edit-btn" type="button" @click="openBulkEdit">批量编辑</button>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, index) in rows" :key="row.id ?? index">
            <td class="col-checkbox">
              <input type="checkbox" v-model="row.enabled" @change="syncModel" />
            </td>
            <td class="col-key">
              <input v-model="row.key" class="cell-input" type="text" placeholder="Key" @input="onFieldChange(index)" />
            </td>
            <td class="col-value" :class="{ 'col-hidden': !showValueColumn }">
              <input v-model="row.value" class="cell-input" type="text" placeholder="Value" @input="onFieldChange(index)" />
            </td>
            <td class="col-description" :class="{ 'col-hidden': !showDescriptionColumn }">
              <input v-model="row.description" class="cell-input" type="text" placeholder="Description" @input="onFieldChange(index)" />
            </td>
            <td class="col-actions">
              <button class="delete-row-btn" type="button" @click="removeRow(index)" :disabled="rows.length === 1" title="删除该行">
                <svg class="delete-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="bulk-edit-container" v-else>
      <textarea v-model="bulkText" class="bulk-edit-textarea" placeholder="key:value&#10;key2:value2..." />
      <div class="bulk-edit-toolbar">
        <span class="hint">点击保存返回表格</span>
        <div class="buttons">
          <button type="button" class="btn-cancel" @click="cancelBulkEdit">取消</button>
          <button type="button" class="btn-confirm" @click="confirmBulkEdit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

interface UrlencodedRow {
  id?: string | number
  enabled: boolean
  key: string
  value: string
  description: string
}

const props = defineProps<{
  modelValue: UrlencodedRow[]
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: UrlencodedRow[]): void
}>()

const createEmptyRow = (): UrlencodedRow => ({
  enabled: false,
  key: '',
  value: '',
  description: ''
})

const rows = ref<UrlencodedRow[]>([])

const hasContent = (r: UrlencodedRow) => !!(r.key || r.value || r.description)

const ensureEmptyRow = () => {
  if (rows.value.length === 0) rows.value.push(createEmptyRow())
  const last = rows.value[rows.value.length - 1]
  if (hasContent(last)) rows.value.push(createEmptyRow())
}

watch(
  () => props.modelValue,
  (val) => {
    const list = Array.isArray(val) && val.length ? val : [createEmptyRow()]
    rows.value = list.map((it) => ({ ...createEmptyRow(), ...it }))
    ensureEmptyRow()
  },
  { immediate: true, deep: true }
)

const syncModel = () => emit('update:modelValue', rows.value)

const onFieldChange = (index: number) => {
  const r = rows.value[index]
  if (!r.enabled && hasContent(r)) r.enabled = true
  ensureEmptyRow()
  syncModel()
}

const removeRow = (index: number) => {
  if (rows.value.length === 1) {
    rows.value[0] = createEmptyRow()
  } else {
    rows.value.splice(index, 1)
  }
  ensureEmptyRow()
  syncModel()
}

// ========== 列显示（⋯ 下拉） ==========
const showValueColumn = ref(true)
const showDescriptionColumn = ref(true)
const columnDropdownVisible = ref(false)
const columnDropdownRef = ref<HTMLElement | null>(null)
const columnToggleBtnRef = ref<HTMLElement | null>(null)

const toggleColumnDropdown = () => {
  columnDropdownVisible.value = !columnDropdownVisible.value
  if (columnDropdownVisible.value) {
    nextTick(() => {
      const dropdown = columnDropdownRef.value
      const btn = columnToggleBtnRef.value
      if (!dropdown) return
      // fixed 浮层，避免被容器遮挡
      dropdown.style.position = 'fixed'
      dropdown.style.zIndex = '9999'
      if (btn) {
        const rect = btn.getBoundingClientRect()
        dropdown.style.top = `${rect.bottom + 2}px`
        // 右对齐按钮
        dropdown.style.left = `${Math.max(8, rect.right - dropdown.offsetWidth)}px`
      }
    })
  }
}

const closeColumnDropdown = (e: MouseEvent) => {
  if (!columnDropdownVisible.value) return
  const dropdown = columnDropdownRef.value
  const btn = columnToggleBtnRef.value
  const target = e.target as Node | null
  if (!target) return
  if (dropdown && dropdown.contains(target)) return
  if (btn && btn.contains(target)) return
  columnDropdownVisible.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', closeColumnDropdown, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', closeColumnDropdown, true)
})

// ========== Bulk Edit ==========
const isBulkMode = ref(false)
const bulkText = ref('')

const buildBulkText = () =>
  rows.value
    .filter((r) => r.key || r.value)
    .map((r) => `${r.key}:${r.value ?? ''}`)
    .join('\n')

const applyBulkText = (text: string) => {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const next: UrlencodedRow[] = []
  for (const line of lines) {
    const [k, ...rest] = line.split(':')
    const key = (k || '').trim()
    const value = rest.join(':').trim()
    if (!key) continue
    next.push({ enabled: true, key, value, description: '' })
  }

  rows.value = next.length ? [...next, createEmptyRow()] : [createEmptyRow()]
  syncModel()
}

const openBulkEdit = () => {
  bulkText.value = buildBulkText()
  isBulkMode.value = true
}
const cancelBulkEdit = () => {
  isBulkMode.value = false
}
const confirmBulkEdit = () => {
  applyBulkText(bulkText.value)
  isBulkMode.value = false
}

// ========== 列宽拖拽（相邻两列） ==========
const tableRef = ref<HTMLTableElement | null>(null)
let headerCells: HTMLTableCellElement[] = []
let resizeInited = false
let activeLeft = -1
let activeRight = -1
let startX = 0
let startLeftW = 0
let startRightW = 0

const setColumnWidth = (index: number, width: number) => {
  const minWidth = 60
  const finalWidth = Math.max(minWidth, width)
  const headCell = headerCells[index]
  if (!headCell || !tableRef.value) return
  headCell.style.width = `${finalWidth}px`
  headCell.style.minWidth = `${finalWidth}px`
  const bodyRows = tableRef.value.querySelectorAll('tbody tr')
  bodyRows.forEach((row) => {
    const cell = row.children[index] as HTMLElement | undefined
    if (cell) {
      cell.style.width = `${finalWidth}px`
      cell.style.minWidth = `${finalWidth}px`
    }
  })
}

const onMouseMove = (e: MouseEvent) => {
  if (activeLeft === -1 || activeRight === -1) return
  const dx = e.clientX - startX
  const minWidth = 60
  let nextLeft = startLeftW + dx
  let nextRight = startRightW - dx
  if (nextLeft < minWidth) {
    const applied = minWidth - startLeftW
    nextLeft = minWidth
    nextRight = startRightW - applied
  } else if (nextRight < minWidth) {
    const applied = startRightW - minWidth
    nextRight = minWidth
    nextLeft = startLeftW + applied
  }
  setColumnWidth(activeLeft, nextLeft)
  setColumnWidth(activeRight, nextRight)
}

const stopResize = () => {
  activeLeft = -1
  activeRight = -1
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', stopResize)
}

const initResizableColumns = () => {
  if (resizeInited || !tableRef.value) return
  const headRow = tableRef.value.querySelector('thead tr')
  if (!headRow) return
  headerCells = Array.from(headRow.querySelectorAll('th'))
  if (!headerCells.length) return

  headerCells.forEach((th, idx) => {
    if (idx === 0 || idx === headerCells.length - 1) return
    th.style.position = 'relative'
    const resizer = document.createElement('div')
    Object.assign(resizer.style, {
      position: 'absolute',
      top: '0',
      bottom: '0',
      right: '-4px',
      width: '10px',
      cursor: 'col-resize',
      userSelect: 'none'
    })
    resizer.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault()
      activeLeft = idx
      activeRight = idx + 1
      startX = e.clientX
      startLeftW = th.offsetWidth
      startRightW = headerCells[idx + 1].offsetWidth
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', stopResize)
    })
    th.appendChild(resizer)
  })
  resizeInited = true
}

onMounted(() => nextTick(() => initResizableColumns()))
onBeforeUnmount(() => stopResize())
</script>

<style scoped>
.urlencoded {
  width: 100%;
}

.table-container {
  width: 100%;
  padding: 0;
  margin: 0;
  overflow-x: auto;
  border: 1px solid #d4d4d4;
  border-radius: 4px;
  box-sizing: border-box;
}

.urlencoded-table {
  width: 100%;
  min-width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 13px;
  color: #333;
}

.urlencoded-table th,
.urlencoded-table td {
  border: 1px solid #d4d4d4;
  padding: 6px 8px;
  box-sizing: border-box;
}

.urlencoded-table th {
  background-color: #fafafa;
  font-weight: 500;
  text-align: center;
  position: relative;
}

.col-checkbox {
  width: 32px;
  text-align: center;
  padding-left: 4px;
  padding-right: 4px;
}

.col-key {
  width: 30%;
}
.col-value {
  width: 35%;
}
.col-description {
  width: 35%;
}

.col-actions {
  width: 84px;
  min-width: 84px;
  max-width: 84px;
  text-align: center;
}
.urlencoded-table td.col-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

.col-hidden {
  display: none !important;
}

.cell-input {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 4px 6px;
  font-size: 13px;
  height: 28px;
  border-radius: 3px;
  border: 1px solid #d4d4d4;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  position: relative;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.column-toggle-btn {
  border: none;
  background: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  padding: 0 1px;
  border-radius: 3px;
}

.bulk-edit-btn {
  border: none;
  background: none;
  color: #007cbf;
  font-size: 10px;
  cursor: pointer;
  padding: 0 2px;
  border-radius: 3px;
  white-space: nowrap;
}

.column-dropdown {
  position: fixed;
  top: 0;
  left: 0;
  min-width: 140px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  padding: 6px 0;
  z-index: 9999;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}
.dropdown-item:hover {
  background: #f5f5f5;
}

.delete-row-btn {
  border: none;
  background: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
  color: #999;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.delete-row-btn:hover:enabled {
  background-color: #ffebee;
  color: #d32f2f;
}
.delete-row-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.delete-icon {
  display: block;
}

.bulk-edit-container {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d4d4d4;
  border-radius: 4px;
  padding: 8px;
}

.bulk-edit-textarea {
  width: 100%;
  min-height: 160px;
  box-sizing: border-box;
  border-radius: 3px;
  border: 1px solid #d4d4d4;
  font-family: monospace;
  font-size: 13px;
  padding: 8px;
  resize: vertical;
}

.bulk-edit-toolbar {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #777;
}

.bulk-edit-toolbar .buttons {
  display: flex;
  gap: 8px;
}

.btn-cancel,
.btn-confirm {
  border-radius: 3px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid transparent;
}
.btn-cancel {
  background-color: #f5f5f5;
  color: #555;
  border-color: #ddd;
}
.btn-confirm {
  background-color: #007cbf;
  color: #fff;
}
</style>
