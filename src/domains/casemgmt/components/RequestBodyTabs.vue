<script setup>
import { ref, computed, watch } from 'vue'

/**
 * Request Body Tabs 组件
 * 参照 a.html 实现 Body 下的各种内容类型
 */

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      contentType: 'none',
      formData: [],
      urlencoded: [],
      raw: '',
      rawType: 'json',
      binary: null
    })
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 内部状态
const contentType = computed({
  get: () => props.modelValue?.contentType || 'none',
  set: (val) => updateValue('contentType', val)
})

const rawType = computed({
  get: () => props.modelValue?.rawType || 'json',
  set: (val) => updateValue('rawType', val)
})

const rawContent = computed({
  get: () => props.modelValue?.raw || '',
  set: (val) => updateValue('raw', val)
})

// 列显示控制
const showColumns = ref({
  value: true,
  contentType: false,
  desc: true
})

// 更多菜单
const moreMenuVisible = ref(false)

// 更新值
function updateValue(key, val) {
  const newValue = { ...props.modelValue, [key]: val }
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

// 内容类型选项
const contentTypes = [
  { label: 'none', value: 'none' },
  { label: 'form-data', value: 'formData' },
  { label: 'x-www-form-urlencoded', value: 'urlencoded' },
  { label: 'raw', value: 'raw' },
  { label: 'binary', value: 'binary' }
]

// Raw 类型选项
const rawTypes = [
  { label: 'JSON', value: 'json' },
  { label: 'TEXT', value: 'text' },
  { label: 'XML', value: 'xml' },
  { label: 'HTML', value: 'html' }
]

// 获取表格数据
const formDataTable = computed(() => {
  const data = props.modelValue?.formData || []
  if (data.length === 0 || (data[data.length - 1]?.key || data[data.length - 1]?.value)) {
    return [...data, { key: '', value: '', type: 'text', contentType: '', desc: '', checked: false }]
  }
  return data
})

const urlencodedTable = computed(() => {
  const data = props.modelValue?.urlencoded || []
  if (data.length === 0 || (data[data.length - 1]?.key || data[data.length - 1]?.value)) {
    return [...data, { key: '', value: '', type: 'text', contentType: '', desc: '', checked: false }]
  }
  return data
})

// 处理行输入
function handleRowInput(type, index, field, val) {
  const data = [...(props.modelValue?.[type] || [])]
  if (!data[index]) {
    data[index] = { key: '', value: '', type: 'text', contentType: '', desc: '', checked: false }
  }
  data[index][field] = val
  
  // 如果最后一行有内容，自动添加新行
  if (index === data.length - 1 && (data[index].key || data[index].value)) {
    data.push({ key: '', value: '', type: 'text', contentType: '', desc: '', checked: false })
  }
  
  // 自动勾选有内容的行
  if (data[index].key || data[index].value) {
    data[index].checked = true
  }
  
  updateValue(type, data)
}

// 切换值类型 (text/file)
function toggleValueType(type, index) {
  const data = [...(props.modelValue?.[type] || [])]
  if (!data[index]) return
  data[index].type = data[index].type === 'text' ? 'file' : 'text'
  data[index].value = ''
  updateValue(type, data)
}

// 选择文件
function selectFile(type, index) {
  const input = document.createElement('input')
  input.type = 'file'
  input.onchange = (e) => {
    const files = Array.from(e.target.files).map(f => f.name).join(', ')
    handleRowInput(type, index, 'value', files)
  }
  input.click()
}

// 格式化内容
function formatContent() {
  const content = rawContent.value?.trim()
  if (!content) return
  
  try {
    let formatted = content
    
    switch (rawType.value) {
      case 'json':
        const jsonObj = JSON.parse(content)
        formatted = JSON.stringify(jsonObj, null, 2)
        break
      case 'xml':
        formatted = formatXml(content)
        break
      case 'html':
        formatted = formatHtml(content)
        break
      default:
        return
    }
    
    updateValue('raw', formatted)
  } catch (e) {
    console.warn('Format error:', e)
  }
}

// 格式化 XML
function formatXml(xml) {
  let formatted = ''
  let indent = 0
  const lines = xml.split(/>\s*</)
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (i > 0) line = '<' + line
    if (i < lines.length - 1) line = line + '>'
    if (line.match(/^<\/\w/)) indent--
    formatted += '  '.repeat(Math.max(0, indent)) + line + '\n'
    if (line.match(/^<\w[^>]*[^\/]>.*$/)) indent++
  }
  return formatted.trim()
}

// 格式化 HTML
function formatHtml(html) {
  let formatted = ''
  let indent = 0
  const lines = html.split(/>\s*</)
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (i > 0) line = '<' + line
    if (i < lines.length - 1) line = line + '>'
    if (line.match(/^<\/\w/)) indent--
    formatted += '  '.repeat(Math.max(0, indent)) + line + '\n'
    if (line.match(/^<\w[^>]*[^\/]>.*$/)) indent++
  }
  return formatted.trim()
}

// 批量编辑
function bulkEdit(type) {
  const data = props.modelValue?.[type] || []
  const lines = data.filter(item => item.key || item.value).map(item => {
    return `${item.key}${item.value ? ':' + item.value : ''}`
  }).join('\n')
  
  const result = prompt('批量编辑 (格式: key:value，每行一个):', lines)
  if (result !== null) {
    const newData = result.split('\n').filter(l => l.trim()).map(line => {
      const parts = line.split(':')
      return {
        key: parts[0]?.trim() || '',
        value: parts[1]?.trim() || '',
        type: 'text',
        contentType: '',
        desc: '',
        checked: true
      }
    })
    updateValue(type, newData)
  }
}

// 删除选中行
function deleteSelected(type) {
  const data = (props.modelValue?.[type] || []).filter(item => !item.checked)
  updateValue(type, data)
}

// 全选/取消全选
function toggleAll(type, checked) {
  const data = (props.modelValue?.[type] || []).map(item => ({ ...item, checked }))
  updateValue(type, data)
}

// 获取选中数量
function getSelectedCount(type) {
  return (props.modelValue?.[type] || []).filter(item => item.checked).length
}
</script>

<template>
  <div class="request-body-tabs">
    <!-- Content Type 选择区 -->
    <div class="content-types">
      <label 
        v-for="ct in contentTypes" 
        :key="ct.value"
        class="radio-group"
        :class="{ active: contentType === ct.value }"
        @click="contentType = ct.value"
      >
        <input 
          type="radio" 
          :value="ct.value" 
          v-model="contentType"
        >
        {{ ct.label }}
      </label>

      <!-- Raw 类型选择器和格式化按钮 -->
      <div v-if="contentType === 'raw'" class="raw-controls">
        <el-dropdown 
          trigger="hover" 
          @command="rawType = $event"
          class="format-select"
        >
          <span>{{ rawType.toUpperCase() }}</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item 
                v-for="rt in rawTypes" 
                :key="rt.value" 
                :command="rt.value"
              >
                {{ rt.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <span 
          v-if="rawType !== 'text'" 
          class="format-btn"
          @click="formatContent"
        >
          格式化
        </span>
      </div>

    </div>

    <!-- Body 内容区 -->
    <div class="body-area">
      <!-- None -->
      <div v-if="contentType === 'none'" class="editor none">
        此请求没有请求体
      </div>

      <!-- Form Data -->
      <div v-if="contentType === 'formData'" class="nested-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-checkbox">
                <el-checkbox 
                  :model-value="getSelectedCount('formData') === formDataTable.length && formDataTable.length > 0"
                  @change="toggleAll('formData', $event)"
                />
              </th>
              <th class="col-key">Key</th>
              <th v-if="showColumns.value" class="col-value">Value</th>
              <th v-if="showColumns.contentType" class="col-content-type">Content-Type</th>
              <th v-if="showColumns.desc" class="col-desc">Description</th>
              <th class="col-bulk">
                <div class="header-bulk-wrapper">
                  <el-dropdown trigger="click" @command="$event === 'bulk' ? bulkEdit('formData') : deleteSelected('formData')">
                    <span class="header-more-btn">⋯</span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="bulk">批量编辑</el-dropdown-item>
                        <el-dropdown-item command="delete" :disabled="getSelectedCount('formData') === 0">删除选中</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  <span class="header-bulk-edit" @click="bulkEdit('formData')">Bulk Edit</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in formDataTable" :key="index">
              <td class="col-checkbox">
                <el-checkbox v-model="row.checked" />
              </td>
              <td class="col-key">
                <div class="key-split-cell">
                  <el-input 
                    v-model="row.key" 
                    placeholder="Key"
                    @input="handleRowInput('formData', index, 'key', $event)"
                  />
                  <el-button 
                    size="small" 
                    class="type-btn"
                    @click="toggleValueType('formData', index)"
                  >
                    {{ row.type === 'file' ? 'File' : 'Text' }}
                  </el-button>
                </div>
              </td>
              <td v-if="showColumns.value" class="col-value">
                <div class="value-wrapper">
                  <el-input 
                    v-if="row.type === 'text'"
                    v-model="row.value" 
                    placeholder="Value"
                    @input="handleRowInput('formData', index, 'value', $event)"
                  />
                  <el-input 
                    v-else
                    v-model="row.value" 
                    placeholder="选择文件"
                    readonly
                    @click="selectFile('formData', index)"
                  />
                </div>
              </td>
              <td v-if="showColumns.contentType" class="col-content-type">
                <el-input 
                  v-model="row.contentType" 
                  placeholder="Auto"
                  @input="handleRowInput('formData', index, 'contentType', $event)"
                />
              </td>
              <td v-if="showColumns.desc" class="col-desc">
                <el-input 
                  v-model="row.desc" 
                  placeholder="Description"
                  @input="handleRowInput('formData', index, 'desc', $event)"
                />
              </td>
              <td class="col-bulk"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- URL Encoded -->
      <div v-if="contentType === 'urlencoded'" class="nested-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-checkbox">
                <el-checkbox 
                  :model-value="getSelectedCount('urlencoded') === urlencodedTable.length && urlencodedTable.length > 0"
                  @change="toggleAll('urlencoded', $event)"
                />
              </th>
              <th class="col-key">Key</th>
              <th v-if="showColumns.value" class="col-value">Value</th>
              <th v-if="showColumns.contentType" class="col-content-type">Content-Type</th>
              <th v-if="showColumns.desc" class="col-desc">Description</th>
              <th class="col-bulk">
                <div class="header-bulk-wrapper">
                  <el-dropdown trigger="click" @command="$event === 'bulk' ? bulkEdit('urlencoded') : deleteSelected('urlencoded')">
                    <span class="header-more-btn">⋯</span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="bulk">批量编辑</el-dropdown-item>
                        <el-dropdown-item command="delete" :disabled="getSelectedCount('urlencoded') === 0">删除选中</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  <span class="header-bulk-edit" @click="bulkEdit('urlencoded')">Bulk Edit</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in urlencodedTable" :key="index">
              <td class="col-checkbox">
                <el-checkbox v-model="row.checked" />
              </td>
              <td class="col-key">
                <div class="key-split-cell">
                  <el-input 
                    v-model="row.key" 
                    placeholder="Key"
                    @input="handleRowInput('urlencoded', index, 'key', $event)"
                  />
                  <el-button 
                    size="small" 
                    class="type-btn"
                    @click="toggleValueType('urlencoded', index)"
                  >
                    {{ row.type === 'file' ? 'File' : 'Text' }}
                  </el-button>
                </div>
              </td>
              <td v-if="showColumns.value" class="col-value">
                <div class="value-wrapper">
                  <el-input 
                    v-if="row.type === 'text'"
                    v-model="row.value" 
                    placeholder="Value"
                    @input="handleRowInput('urlencoded', index, 'value', $event)"
                  />
                  <el-input 
                    v-else
                    v-model="row.value" 
                    placeholder="选择文件"
                    readonly
                    @click="selectFile('urlencoded', index)"
                  />
                </div>
              </td>
              <td v-if="showColumns.contentType" class="col-content-type">
                <el-input 
                  v-model="row.contentType" 
                  placeholder="Auto"
                  @input="handleRowInput('urlencoded', index, 'contentType', $event)"
                />
              </td>
              <td v-if="showColumns.desc" class="col-desc">
                <el-input 
                  v-model="row.desc" 
                  placeholder="Description"
                  @input="handleRowInput('urlencoded', index, 'desc', $event)"
                />
              </td>
              <td class="col-bulk"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Binary -->
      <div v-if="contentType === 'binary'" class="binary-area">
        <el-upload
          drag
          action="#"
          :auto-upload="false"
          :on-change="(file) => updateValue('binary', file)"
          class="binary-uploader"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处或 <em>点击上传</em>
          </div>
        </el-upload>
      </div>

      <!-- Raw -->
      <div v-if="contentType === 'raw'" class="raw-area">
        <el-input
          v-model="rawContent"
          type="textarea"
          :rows="10"
          placeholder="请输入内容..."
          class="raw-editor"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.request-body-tabs {
  width: 100%;
}

/* Content Types */
.content-types {
  display: flex;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #fff;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.radio-group {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
}

.radio-group input[type="radio"] {
  cursor: pointer;
}

.radio-group.active {
  color: #2563eb;
  font-weight: 500;
}

.raw-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.format-select {
  font-size: 13px;
  color: #25aae2;
  cursor: pointer;
  user-select: none;
}

.format-btn {
  font-size: 13px;
  color: #2563eb;
  cursor: pointer;
}

.format-btn:hover {
  text-decoration: underline;
}

/* Body Area */
.body-area {
  position: relative;
  padding: 0;
  margin: 0;
}

.body-area .editor.none {
  margin: 0;
  border: none;
}

.editor.none {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: #9ca3af;
  background-color: #f9fafb;
  cursor: not-allowed;
}

.nested-container {
  width: 100%;
  background-color: #fff;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Table Styles */
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.data-table th {
  background-color: #f8f9fa;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
  height: 35px;
  line-height: 35px;
  padding: 0 8px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  border-left: 1px solid #e5e7eb;
  vertical-align: middle;
  white-space: nowrap;
}

.data-table th:first-child {
  border-left: none;
}

.data-table th:last-child {
  border-right: 1px solid #e5e7eb;
}

.data-table td {
  height: 35px;
  padding: 4px 8px;
  font-size: 13px;
  color: #4b5563;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  border-left: 1px solid #e5e7eb;
  vertical-align: middle;
}

.data-table td:first-child {
  border-left: none;
}

.data-table td:last-child {
  border-right: 1px solid #e5e7eb;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.col-checkbox { 
  width: 36px; 
  text-align: center;
}

.col-key { width: 180px; }
.col-value { width: 140px; }
.col-content-type { width: 110px; }
.col-desc { width: 180px; }
.col-bulk { 
  width: 70px; 
  padding: 0 4px;
  min-width: 70px;
}

.header-bulk-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.header-more-btn {
  font-size: 13px;
  cursor: pointer;
  color: #6b7280;
  padding: 0 2px;
}

.header-bulk-edit {
  font-size: 11px;
  color: #2563eb;
  cursor: pointer;
  white-space: nowrap;
}

.key-split-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.key-split-cell :deep(.el-input) {
  flex: 1;
}

.type-btn {
  padding: 2px 6px;
  font-size: 11px;
  min-height: 24px;
}

.value-wrapper {
  position: relative;
  width: 100%;
}

/* Binary Area */
.binary-area {
  padding: 16px;
}

.binary-uploader {
  width: 100%;
}

.binary-uploader :deep(.el-upload) {
  width: 100%;
}

.binary-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
}

/* Raw Area */
.raw-area {
  padding: 0;
  margin: 0;
}

.raw-editor :deep(.el-textarea__inner) {
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.5;
  border-radius: 0;
  border: none;
  padding: 12px;
}
</style>
