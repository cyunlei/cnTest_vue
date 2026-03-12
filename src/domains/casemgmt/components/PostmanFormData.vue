<template>
  <div class="pm-formdata">
    <div class="table-container" v-if="!isBulkMode" ref="tableContainerRef">
      <table class="form-data-table" ref="tableRef">
        <thead>
          <tr>
            <th class="col-checkbox"></th>
            <!-- 仅合并表头：Key + Type 视觉合并，但 body 仍是两列 -->
            <th class="col-key th-merge-right">Key</th>
            <th class="col-type th-merge-left" aria-label="Type"></th>
            <th class="col-value" :class="{ 'col-hidden': !showValueColumn }">Value</th>
            <th class="col-content-type" :class="{ 'col-hidden': !showContentTypeColumn }">Content-Type</th>
            <th class="col-description" :class="{ 'col-hidden': !showDescriptionColumn }">Description</th>
            <th class="col-actions">
              <div class="header-actions">
                <button
                  class="column-toggle-btn"
                  type="button"
                  ref="columnToggleBtnRef"
                  @click.stop="toggleColumnDropdown"
                  title="列显示"
                >
                  ⋯
                </button>
                <div
                  class="column-dropdown"
                  v-show="columnDropdownVisible"
                  ref="columnDropdownRef"
                  @click.stop
                >
                  <label class="dropdown-item">
                    <input type="checkbox" v-model="showValueColumn" /> value
                  </label>
                  <label class="dropdown-item">
                    <input type="checkbox" v-model="showContentTypeColumn" /> Content-Type
                  </label>
                  <label class="dropdown-item">
                    <input type="checkbox" v-model="showDescriptionColumn" /> Description
                  </label>
                </div>
                <button class="bulk-edit-btn" type="button" @click="openBulkEdit">
                  批量编辑
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in rows"
            :key="row.id ?? index"
            class="data-row"
          >
            <td class="col-checkbox">
              <input
                type="checkbox"
                v-model="row.enabled"
                @change="syncModel"
              />
            </td>
            <td class="col-key">
              <input
                v-model="row.key"
                class="cell-input"
                type="text"
                placeholder="Key"
                @input="onFieldChange(index)"
              />
            </td>
            <td class="col-type">
              <select
                v-model="row.type"
                class="cell-select"
                @change="onFieldChange(index)"
              >
                <option value="Text">Text</option>
                <option value="File">File</option>
              </select>
            </td>
            <td
              class="col-value"
              :class="{ 'col-hidden': !showValueColumn }"
            >
              <input
                v-if="row.type === 'Text'"
                v-model="row.value"
                class="cell-input"
                type="text"
                placeholder="Value"
                @input="onFieldChange(index)"
              />

              <!-- File 模式：未激活时显示 summary，激活时用浮层放大展示 tags + 下拉 -->
              <div
                v-else
                class="file-cell"
                :ref="(el) => setValueCellRef(index, el)"
                tabindex="0"
                role="button"
                @focus="openFilePicker(index)"
                @click="openFilePicker(index)"
              >
                <div class="file-summary" v-if="activeFileRowIndex !== index">
                  <span class="warn">⚠</span>
                  <span>{{ (row.files?.length || 0) }} files</span>
                </div>
                <div class="file-summary empty" v-else-if="(row.files?.length || 0) === 0">
                  <span class="placeholder">上传文件</span>
                </div>
              </div>
            </td>
            <td class="col-content-type" :class="{ 'col-hidden': !showContentTypeColumn }">
              <input
                v-model="row.contentType"
                class="cell-input"
                type="text"
                placeholder="Content-Type"
                @input="onFieldChange(index)"
              />
            </td>
            <td class="col-description" :class="{ 'col-hidden': !showDescriptionColumn }">
              <input
                v-model="row.description"
                class="cell-input"
                type="text"
                placeholder="Description"
                @input="onFieldChange(index)"
              />
            </td>
            <td class="col-actions">
              <button
                class="delete-row-btn"
                type="button"
                @click="removeRow(index)"
                :disabled="rows.length === 1"
                title="删除该行"
              >
                <svg class="delete-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- File 模式浮层（仅当前行） -->
    <teleport to="body">
      <div
        ref="fileFloatRef"
        class="file-float"
        v-show="activeFileRowIndex !== null"
        @mousedown.stop
      >
        <div class="file-tags" v-if="activeFileRowIndex !== null">
          <template v-if="(rows[activeFileRowIndex]?.files?.length || 0) > 0">
            <div
              class="file-tag"
              v-for="(f, i) in rows[activeFileRowIndex].files"
              :key="f.name + '_' + i"
              title="点击 × 删除该文件"
            >
              <span class="warn">⚠</span>
              <span class="name">{{ f.name }}</span>
              <button class="close" type="button" @click="removeFileTag(activeFileRowIndex, i)">×</button>
            </div>
          </template>
          <template v-else>
            <span class="file-summary empty">
              <span class="placeholder">上传文件</span>
            </span>
          </template>
        </div>
      </div>

      <div
        ref="fileDropdownRef"
        class="file-dropdown"
        v-show="activeFileRowIndex !== null"
        @mousedown.stop
      >
        <div class="file-dropdown-item" @click="triggerLocalFileSelect">
          <span style="font-size: 18px;">＋</span>
          <span>上传本地文件</span>
        </div>
        <input
          ref="fileInputRef"
          class="file-input-hidden"
          type="file"
          multiple
          @change="onFilesSelected"
        />
      </div>
    </teleport>

    <div class="bulk-edit-container" v-if="isBulkMode">
      <textarea
        v-model="bulkText"
        class="bulk-edit-textarea"
        placeholder="key:value&#10;key2:value2..."
      />
      <div class="bulk-edit-toolbar">
        <span class="hint">点击保存返回表格</span>
        <div class="buttons">
          <button type="button" class="btn-cancel" @click="cancelBulkEdit">
            取消
          </button>
          <button type="button" class="btn-confirm" @click="confirmBulkEdit">
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

type RowType = 'Text' | 'File'

interface FormDataRow {
  id?: string | number
  enabled: boolean
  key: string
  type: RowType
  value: string
  files?: File[]
  contentType: string
  description: string
}

const props = defineProps<{
  modelValue: FormDataRow[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FormDataRow[]): void
}>()

const createEmptyRow = (): FormDataRow => ({
  enabled: false,
  key: '',
  type: 'Text',
  value: '',
  files: [],
  contentType: '',
  description: ''
})

const rows = ref<FormDataRow[]>([])

const hasContent = (row: FormDataRow) =>
  !!(row.key || row.value || row.contentType || row.description)

const ensureEmptyRow = () => {
  if (rows.value.length === 0) {
    rows.value.push(createEmptyRow())
    return
  }
  const last = rows.value[rows.value.length - 1]
  if (hasContent(last)) {
    rows.value.push(createEmptyRow())
  }
}

// 初始化 / 监听外部 v-model
watch(
  () => props.modelValue,
  (val) => {
    const list = Array.isArray(val) && val.length > 0 ? val : [createEmptyRow()]
    rows.value = list.map((item) => ({
      ...createEmptyRow(),
      ...item
    }))
    ensureEmptyRow()
  },
  { immediate: true, deep: true }
)

const syncModel = () => {
  emit('update:modelValue', rows.value)
}

const onFieldChange = (index: number) => {
  // 自动勾选有内容的行
  const row = rows.value[index]
  if (!row.enabled && hasContent(row)) {
    row.enabled = true
  }
  ensureEmptyRow()
  syncModel()
}

watch(
  rows,
  (list) => {
    // type 切换时，保证 File 模式有 files 数组
    list.forEach((r) => {
      if (r.type === 'File' && !Array.isArray(r.files)) r.files = []
      if (r.type === 'Text' && Array.isArray(r.files) && r.files.length) {
        // 保留 files 以便切回 File 时还能看到（不强制清空）
      }
    })
  },
  { deep: true }
)

const removeRow = (index: number) => {
  if (rows.value.length === 1) {
    rows.value[0] = createEmptyRow()
  } else {
    rows.value.splice(index, 1)
  }
  ensureEmptyRow()
  syncModel()
}

// ========== Bulk Edit ==========
const isBulkMode = ref(false)
const bulkText = ref('')

const bulkPreview = computed(() => bulkText.value.trim())

const buildBulkText = () => {
  return rows.value
    .filter((r) => r.type === 'Text' && (r.key || r.value))
    .map((r) => `${r.key}:${r.value ?? ''}`)
    .join('\n')
}

const applyBulkText = (text: string) => {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const next: FormDataRow[] = []

  for (const line of lines) {
    const [k, ...rest] = line.split(':')
    const key = (k || '').trim()
    const value = rest.join(':').trim()
    if (!key) continue
    next.push({
      enabled: true,
      key,
      type: 'Text',
      value,
      contentType: '',
      description: ''
    })
  }

  if (next.length === 0) {
    rows.value = [createEmptyRow()]
  } else {
    rows.value = [...next, createEmptyRow()]
  }

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

// ========== 列显示控制（⋯ 下拉） ==========
const showValueColumn = ref(true)
const showContentTypeColumn = ref(false)
const showDescriptionColumn = ref(true)
const columnDropdownVisible = ref(false)
const tableContainerRef = ref<HTMLElement | null>(null)
const columnDropdownRef = ref<HTMLElement | null>(null)
const columnToggleBtnRef = ref<HTMLElement | null>(null)

const toggleColumnDropdown = () => {
  columnDropdownVisible.value = !columnDropdownVisible.value
  if (columnDropdownVisible.value) {
    nextTick(() => {
      const btn = columnToggleBtnRef.value
      const dropdown = columnDropdownRef.value
      if (!btn || !dropdown) return
      const rect = btn.getBoundingClientRect()
      dropdown.style.position = 'fixed'
      dropdown.style.top = `${rect.bottom + 2}px`
      // 右对齐按钮
      dropdown.style.left = `${Math.max(8, rect.right - dropdown.offsetWidth)}px`
      dropdown.style.zIndex = '9999'
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
  nextTick(() => {
    initResizableColumns()
  })
  // 用捕获阶段监听，避免抽屉内部 stopPropagation 导致无法收起
  document.addEventListener('mousedown', closeColumnDropdown, true)
})

watch([showValueColumn, showContentTypeColumn, showDescriptionColumn], () => {
  nextTick(() => resetResizableColumns())
})

onBeforeUnmount(() => {
  stopResize()
  document.removeEventListener('mousedown', closeColumnDropdown, true)
})

// ========== 列宽拖拽 ==========
const tableRef = ref<HTMLTableElement | null>(null)

let activeColIndex = -1
let activeRightColIndex = -1
let startX = 0
let startLeftWidth = 0
let startRightWidth = 0
let headerCells: HTMLTableCellElement[] = []
let resizeInited = false

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
  if (activeColIndex === -1 || activeRightColIndex === -1) return
  const dx = e.clientX - startX

  const minWidth = 60
  let nextLeft = startLeftWidth + dx
  let nextRight = startRightWidth - dx

  // clamp：只影响左右两列，且两列都不能小于 minWidth
  if (nextLeft < minWidth) {
    const appliedDx = minWidth - startLeftWidth
    nextLeft = minWidth
    nextRight = startRightWidth - appliedDx
  } else if (nextRight < minWidth) {
    const appliedDx = startRightWidth - minWidth
    nextRight = minWidth
    nextLeft = startLeftWidth + appliedDx
  }

  setColumnWidth(activeColIndex, nextLeft)
  setColumnWidth(activeRightColIndex, nextRight)
}

const stopResize = () => {
  activeColIndex = -1
  activeRightColIndex = -1
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', stopResize)
}

const isHiddenHeader = (th: HTMLTableCellElement | undefined) => {
  if (!th) return true
  return th.classList.contains('col-hidden')
}

const getNextVisibleHeaderIndex = (fromIndex: number) => {
  for (let i = fromIndex + 1; i < headerCells.length; i++) {
    if (!isHiddenHeader(headerCells[i])) return i
  }
  return -1
}

const resetResizableColumns = () => {
  if (!tableRef.value) return
  tableRef.value.querySelectorAll('.col-resizer').forEach((el) => el.remove())
  resizeInited = false
  initResizableColumns()
}

const initResizableColumns = () => {
  if (resizeInited || !tableRef.value) return

  const headRow = tableRef.value.querySelector('thead tr')
  if (!headRow) return

  headerCells = Array.from(headRow.querySelectorAll('th'))
  if (!headerCells.length) return

  headerCells.forEach((th, index) => {
    // 不允许拖动首列复选框和最后一列操作列
    if (index === 0 || index === headerCells.length - 1) return
    // 当前列隐藏不放 resizer
    if (isHiddenHeader(th)) return
    // 找右侧最近的可见列；没有则不放
    const rightIndex = getNextVisibleHeaderIndex(index)
    if (rightIndex === -1 || rightIndex === headerCells.length - 1) return
    if (isHiddenHeader(headerCells[rightIndex])) return

    th.style.position = 'relative'
    const resizer = document.createElement('div')
    resizer.className = 'col-resizer'
    resizer.title = '拖拽调整列宽'
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
      activeColIndex = index
      activeRightColIndex = rightIndex
      startX = e.clientX
      startLeftWidth = th.offsetWidth
      startRightWidth = headerCells[rightIndex].offsetWidth
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', stopResize)
    })

    th.appendChild(resizer)
  })

  resizeInited = true
}

// ========== File 浮层选择器 ==========
const activeFileRowIndex = ref<number | null>(null)
const valueCellRefs = ref<Record<number, HTMLElement>>({})
const fileFloatRef = ref<HTMLElement | null>(null)
const fileDropdownRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const setValueCellRef = (index: number, el: Element | null) => {
  if (!el) return
  valueCellRefs.value[index] = el as HTMLElement
}

const positionFileFloat = (index: number) => {
  const cell = valueCellRefs.value[index]
  const floatEl = fileFloatRef.value
  const dropdownEl = fileDropdownRef.value
  if (!cell || !floatEl || !dropdownEl) return

  const rect = cell.getBoundingClientRect()
  // 只放大高度，不改变宽度：浮层宽度与单元格一致
  const width = rect.width
  const left = rect.left
  const top = rect.top

  floatEl.style.position = 'fixed'
  floatEl.style.left = `${left}px`
  floatEl.style.top = `${top}px`
  floatEl.style.width = `${width}px`
  floatEl.style.zIndex = '9999'
  floatEl.style.height = '64px'

  const floatRect = floatEl.getBoundingClientRect()
  dropdownEl.style.position = 'fixed'
  dropdownEl.style.left = `${floatRect.left}px`
  dropdownEl.style.top = `${floatRect.bottom + 6}px`
  dropdownEl.style.width = `${floatRect.width}px`
  dropdownEl.style.zIndex = '9999'
}

const openFilePicker = (index: number) => {
  activeFileRowIndex.value = index
  nextTick(() => positionFileFloat(index))
}

const closeFilePicker = (e: MouseEvent) => {
  if (activeFileRowIndex.value === null) return
  const target = e.target as Node | null
  if (!target) return
  const floatEl = fileFloatRef.value
  const dropdownEl = fileDropdownRef.value
  const cell = valueCellRefs.value[activeFileRowIndex.value]
  if (floatEl && floatEl.contains(target)) return
  if (dropdownEl && dropdownEl.contains(target)) return
  if (cell && cell.contains(target)) return
  activeFileRowIndex.value = null
}

const triggerLocalFileSelect = () => {
  fileInputRef.value?.click()
}

const onFilesSelected = (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  if (!files.length) return
  const idx = activeFileRowIndex.value
  if (idx === null) return
  const row = rows.value[idx]
  if (!row.files) row.files = []
  row.files.push(...files)
  row.enabled = true
  // reset input so selecting same file again triggers change
  input.value = ''
  syncModel()
}

const removeFileTag = (rowIndex: number, fileIndex: number) => {
  const row = rows.value[rowIndex]
  if (!row.files) return
  row.files.splice(fileIndex, 1)
  syncModel()
}

onMounted(() => {
  // 关闭 file 浮层（捕获阶段，兼容抽屉 stopPropagation）
  document.addEventListener('mousedown', closeFilePicker, true)
  window.addEventListener('resize', () => {
    if (activeFileRowIndex.value !== null) positionFileFloat(activeFileRowIndex.value)
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', closeFilePicker, true)
})
</script>

<style scoped>
.pm-formdata {
  width: 100%;
  max-width: 100%;
}

.table-container {
  width: 100%;
  max-width: 100%;
  padding: 0;
  margin: 0;
  overflow-x: auto;
  border: 1px solid #d4d4d4;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-data-table {
  width: 100%;
  min-width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 13px;
  color: #333;
}

.form-data-table th,
.form-data-table td {
  border: 1px solid #d4d4d4;
  padding: 6px 8px;
  text-align: left;
  box-sizing: border-box;
}

.form-data-table th {
  background-color: #fafafa;
  font-weight: 500;
  text-align: center;
}

.form-data-table th.col-key {
  text-align: center;
}

/* 仅合并表头（视觉）：去掉 Key/Type 之间的分割线 */
.form-data-table th.th-merge-right {
  border-right: none;
}
.form-data-table th.th-merge-left {
  border-left: none;
}

.col-checkbox {
  width: 32px;
  text-align: center;
}

.form-data-table th.col-checkbox,
.form-data-table td.col-checkbox {
  padding-left: 4px;
  padding-right: 4px;
}

.col-key {
  width: 18%;
}

.col-type {
  width: 10%;
}

.col-type .cell-select {
  font-size: 10px;
}

.col-value {
  width: 30%;
}

.col-content-type {
  width: 15%;
}

.col-description {
  width: 22%;
}

.col-actions {
  width: 60px;
  min-width: 100%;
  max-width: 100%;
  text-align: center;
  position: relative;
}

.form-data-table td.col-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

.col-hidden {
  display: none !important;
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
  line-height: 1;
}

.column-toggle-btn:hover {
  background-color: #eee;
}

.column-dropdown {
  position: fixed;
  top: 0;
  left: 0;
  min-width: 140px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  padding: 6px 0;
  z-index: 100;
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
  background-color: #f5f5f5;
}

.dropdown-item input[type='checkbox'] {
  width: 14px;
  height: 14px;
}

.form-data-table input[type='checkbox'] {
  width: 14px;
  height: 14px;
}

.cell-input,
.cell-select {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 4px 6px;
  font-size: 13px;
  height: 28px;
  line-height: 28px;
  border-radius: 3px;
  border: 1px solid #d4d4d4;
}

.cell-input {
  line-height: normal;
}

.file-cell {
  width: 100%;
  min-width: 0;
  min-height: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 3px;
  border: 1px solid #d4d4d4;
  background: #fff;
}

.file-summary {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  width: 100%;
  min-width: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  font-size: 13px;
  color: #333;
}

.file-summary .warn {
  color: #f5a623;
}

.file-summary .placeholder {
  color: #999;
}

.file-float {
  background: #f0f7fc;
  border: 1px solid #007cbf;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 0 10px rgba(0, 124, 191, 0.2);
  box-sizing: border-box;
  overflow-y: auto;
}

.file-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.file-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 11px;
  max-width: 180px;
}

.file-tag .name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-tag .close {
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
  padding: 0 2px;
  line-height: 1;
}

.file-dropdown {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  padding: 8px 0;
  box-sizing: border-box;
}

.file-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 12px;
}

.file-dropdown-item:hover {
  background: #f5f5f5;
}

.file-dropdown-divider {
  height: 1px;
  background: #eee;
  margin: 6px 0;
}

.file-input-hidden {
  display: none;
}

.cell-input:focus,
.cell-select:focus {
  outline: none;
  border-color: #007cbf;
  box-shadow: 0 0 0 1px rgba(0, 124, 191, 0.15);
}

.file-placeholder {
  display: inline-block;
  width: 100%;
  padding: 4px 6px;
  color: #999;
  font-size: 13px;
  box-sizing: border-box;
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

.bulk-edit-btn:hover {
  background-color: #eee;
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

.bulk-edit-textarea:focus {
  outline: none;
  border-color: #007cbf;
  box-shadow: 0 0 0 1px rgba(0, 124, 191, 0.15);
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

.btn-cancel:hover {
  background-color: #e8e8e8;
}

.btn-confirm {
  background-color: #007cbf;
  color: #fff;
}

.btn-confirm:hover {
  background-color: #0062a1;
}
</style>

