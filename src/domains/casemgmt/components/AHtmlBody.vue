<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

/**
 * AHtmlBody 组件 - 完全参照 a.html 实现
 */

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      contentType: 'form-data',
      formData: [],
      urlencoded: [],
      raw: '',
      rawType: 'JSON',
      binary: null
    })
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 内部状态
const currentType = ref('JSON')
const showRawControls = ref(false)
const rawEditorContent = ref('')
const rawEditor = ref(null)

// 格式化后的 Raw 内容（带颜色）
const formattedRawContent = computed(() => {
  const content = rawEditorContent.value
  if (!content || currentType.value !== 'JSON') return content
  
  try {
    // 如果是有效的 JSON，返回带颜色的 HTML
    JSON.parse(content)
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"([^"\\]*(\\.[^"\\]*)*)"\s*:/g, '<span class="json-key">"$1"</span>:')
      .replace(/: "([^"\\]*(\\.[^"\\]*)*)"/g, ': <span class="json-string">"$1"</span>')
      .replace(/: (\d+(\.\d+)?)/g, ': <span class="json-number">$1</span>')
      .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
      .replace(/: null/g, ': <span class="json-null">null</span>')
      .replace(/([{}[\]])/g, '<span class="json-brace">$1</span>')
  } catch (e) {
    // 不是有效的 JSON，返回原文
    return content
  }
})

// 处理 Raw 输入
function onRawInput() {
  if (rawEditor.value) {
    rawEditorContent.value = rawEditor.value.innerText
    updateValue('raw', rawEditorContent.value)
  }
}

// 内容类型
const contentType = computed({
  get: () => props.modelValue?.contentType || 'form-data',
  set: (val) => {
    updateValue('contentType', val)
    showRawControls.value = (val === 'raw')
  }
})

const rawType = computed({
  get: () => props.modelValue?.rawType || 'JSON',
  set: (val) => updateValue('rawType', val)
})

// 更新值
function updateValue(key, val) {
  const newValue = { ...props.modelValue, [key]: val }
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

// 切换内容类型
function switchContentType(type) {
  contentType.value = type
}

// 切换 Raw 类型
function switchType(type) {
  currentType.value = type
  rawType.value = type
}

// 格式化内容
function formatContent() {
  const content = rawEditorContent.value?.trim()
  if (!content) return
  
  try {
    let formatted = content
    
    if (currentType.value === 'JSON') {
      const jsonObj = JSON.parse(content)
      formatted = JSON.stringify(jsonObj, null, 2)
    } else if (currentType.value === 'XML') {
      formatted = formatXml(content)
    } else if (currentType.value === 'HTML') {
      formatted = formatHtml(content)
    }
    
    rawEditorContent.value = formatted
    updateValue('raw', formatted)
  } catch(e) {
    alert('格式错误！')
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

// 初始化
onMounted(() => {
  showRawControls.value = (contentType.value === 'raw')
  rawEditorContent.value = props.modelValue?.raw || ''
})
</script>

<template>
  <div class="ahtml-body-container">
    <!-- Content Type 选择 -->
    <div class="content-types">
      <label 
        class="radio-group" 
        :class="{ active: contentType === 'none' }"
        @click="switchContentType('none')"
      >
        <input type="radio" name="contentType" value="none" v-model="contentType"> none
      </label>
      <label 
        class="radio-group" 
        :class="{ active: contentType === 'form-data' }"
        @click="switchContentType('form-data')"
      >
        <input type="radio" name="contentType" value="form-data" v-model="contentType"> form-data
      </label>
      <label 
        class="radio-group" 
        :class="{ active: contentType === 'x-www-form-urlencoded' }"
        @click="switchContentType('x-www-form-urlencoded')"
      >
        <input type="radio" name="contentType" value="x-www-form-urlencoded" v-model="contentType"> x-www-form-urlencoded
      </label>
      <label 
        class="radio-group" 
        :class="{ active: contentType === 'raw' }"
        @click="switchContentType('raw')"
      >
        <input type="radio" name="contentType" value="raw" v-model="contentType"> raw
      </label>
      <label 
        class="radio-group" 
        :class="{ active: contentType === 'binary' }"
        @click="switchContentType('binary')"
      >
        <input type="radio" name="contentType" value="binary" v-model="contentType"> binary
      </label>
      <label 
        class="radio-group" 
        :class="{ active: contentType === 'graphql' }"
        @click="switchContentType('graphql')"
      >
        <input type="radio" name="contentType" value="graphql" v-model="contentType"> GraphQL
      </label>

      <!-- Raw 类型选择 -->
      <div v-if="showRawControls" class="raw-controls">
        <el-dropdown 
          trigger="hover" 
          @command="switchType"
          class="format-select"
        >
          <span>{{ currentType }}</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="TEXT">TEXT</el-dropdown-item>
              <el-dropdown-item command="JSON">JSON</el-dropdown-item>
              <el-dropdown-item command="XML">XML</el-dropdown-item>
              <el-dropdown-item command="HTML">HTML</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <!-- 格式化按钮 -->
        <span 
          v-if="currentType !== 'TEXT'" 
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
        <table class="form-data-table">
          <thead>
            <tr>
              <th class="col-checkbox"></th>
              <th class="col-key">Key</th>
              <th class="col-value">Value</th>
              <th class="col-content-type hide-column">Content-Type</th>
              <th class="col-desc">Description</th>
              <th class="col-bulk">
                <div class="header-bulk-wrapper">
                  <div class="header-more-container">
                    <div class="header-more-btn">⋯</div>
                  </div>
                  <span class="header-bulk-edit">Bulk Edit</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="col-checkbox"><input type="checkbox"></td>
              <td class="col-key">
                <table class="key-split-table">
                  <tr>
                    <td class="key-input-cell"><input type="text" class="key-input" placeholder="Key"></td>
                    <td class="type-select-cell">
                      <div class="row-value-type-select">
                        <div class="row-value-type-btn">Text</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
              <td class="col-value">
                <div class="value-wrapper">
                  <input type="text" class="table-input value-input" placeholder="Value">
                </div>
              </td>
              <td class="col-content-type hide-column"><input type="text" class="table-input" placeholder="Auto" value="Auto"></td>
              <td class="col-desc">
                <div class="desc-input-wrapper"><input type="text" class="table-input" placeholder="Description"></div>
              </td>
              <td class="col-bulk"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- URL Encoded -->
      <div v-if="contentType === 'x-www-form-urlencoded'" class="nested-container">
        <table class="urlencoded-table">
          <thead>
            <tr>
              <th class="col-checkbox"></th>
              <th class="col-key">Key</th>
              <th class="col-value">Value</th>
              <th class="col-content-type hide-column">Content-Type</th>
              <th class="col-desc">Description</th>
              <th class="col-bulk">
                <div class="header-bulk-wrapper">
                  <div class="header-more-container">
                    <div class="header-more-btn">⋯</div>
                  </div>
                  <span class="header-bulk-edit">Bulk Edit</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="col-checkbox"><input type="checkbox"></td>
              <td class="col-key">
                <table class="key-split-table">
                  <tr>
                    <td class="key-input-cell"><input type="text" class="key-input" placeholder="Key"></td>
                    <td class="type-select-cell">
                      <div class="row-value-type-select">
                        <div class="row-value-type-btn">Text</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
              <td class="col-value">
                <div class="value-wrapper">
                  <input type="text" class="table-input value-input" placeholder="Value">
                </div>
              </td>
              <td class="col-content-type hide-column"><input type="text" class="table-input" placeholder="Auto" value="Auto"></td>
              <td class="col-desc">
                <div class="desc-input-wrapper"><input type="text" class="table-input" placeholder="Description"></div>
              </td>
              <td class="col-bulk"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Binary -->
      <div v-if="contentType === 'binary'" class="binary-file-area">
        <div class="file-select-btn">Select file</div>
        <div class="file-dropdown">
          <div class="new-file">+ New file from local machine</div>
          <div>Files uploaded to team</div>
          <div class="no-file">No file found</div>
        </div>
      </div>
      
      <!-- Raw -->
      <div v-if="contentType === 'raw'" class="raw-area">
        <div
          ref="rawEditor"
          class="raw-editor"
          contenteditable="true"
          placeholder="请输入内容..."
          @input="onRawInput"
          v-html="formattedRawContent"
        ></div>
      </div>

      <!-- GraphQL -->
      <div v-if="contentType === 'graphql'" class="editor none">
        GraphQL 模式开发中
      </div>
    </div>
  </div>
</template>

<style scoped>
.ahtml-body-container {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.content-types {
  display: flex;
  padding: 12px;
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
  gap: 12px;
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

.body-area {
  position: relative;
  padding: 0;
}

.editor {
  width: 100%;
  min-height: 180px;
  height: 180px;
  border: none;
  border-radius: 0;
  padding: 12px;
  font-size: 14px;
  resize: vertical;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
  overflow-y: auto;
  outline: none;
}

.editor.none {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  background-color: #f9fafb;
  cursor: not-allowed;
  resize: none;
}

.nested-container {
  width: 100%;
  background-color: #fff;
  overflow-y: auto;
  overflow-x: hidden;
}

.form-data-table,
.urlencoded-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: visible !important;
}

.form-data-table th,
.urlencoded-table th {
  background-color: #f8f9fa;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
  height: 35px !important;
  line-height: 35px !important;
  padding: 0 8px;
  text-align: center !important;
  border-bottom: 1px solid #e5e7eb;
  border-left: 1px solid #e5e7eb;
  vertical-align: middle;
  position: relative;
  white-space: nowrap;
}

.form-data-table th:last-child,
.urlencoded-table th:last-child {
  border-right: 1px solid #e5e7eb;
}

.col-bulk {
  width: 70px !important;
  padding: 0 4px !important;
  min-width: 70px !important;
  white-space: nowrap;
}

.header-bulk-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.header-bulk-edit {
  font-size: 11px;
  color: #2563eb;
  cursor: pointer;
}

.header-more-btn {
  font-size: 13px;
  cursor: pointer;
  color: #6b7280;
  padding: 0 2px;
}

.form-data-table td,
.urlencoded-table td {
  height: 35px !important;
  padding: 0;
  font-size: 13px;
  color: #4b5563;
  text-align: center !important;
  border-bottom: 1px solid #e5e7eb;
  border-left: 1px solid #e5e7eb;
  vertical-align: middle;
  position: relative;
}

.form-data-table td:last-child,
.urlencoded-table td:last-child {
  border-right: 1px solid #e5e7eb;
}

.form-data-table tbody tr:last-child td,
.urlencoded-table tbody tr:last-child td {
  border-bottom: none;
}

.col-checkbox { width: 36px; padding: 0 8px !important; }
.col-key { width: 180px; }
.col-value { width: 140px; }
.col-content-type { width: 110px;}
.col-desc { width: 180px; }

.key-split-table {
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  text-align: center !important;
}

.key-split-table td {
  padding: 4px;
  border: 1px solid #e5e7eb;
  height: 27px;
  margin: 0;
  text-align: center !important;
  vertical-align: middle;
  position: static;
}

.key-input-cell { width: 92%; }
.type-select-cell { width: 8%; }

.key-input {
  width: 90%;
  border: 1px solid #d1d5db;
  padding: 4px;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
  margin: 0 auto;
  outline: none;
  box-sizing: border-box;
}

.table-input {
  width: 90%;
  border: 1px solid #d1d5db;
  padding: 4px;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
  margin: 0 auto;
  outline: none;
  box-sizing: border-box;
}

.desc-input-wrapper {
  width: 100%;
  height: 100%;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.row-value-type-select {
  position: relative;
  display: inline-block;
  text-align: center;
}

.row-value-type-btn {
  padding: 2px 4px;
  font-size: 11px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  text-align: center;
  width: 40px;
}

.hide-column {
  display: none !important;
}

.value-wrapper {
  position: relative;
  width: 100%;
}

.binary-file-area {
  padding: 16px;
}

.file-select-btn {
  padding: 8px 16px;
  border: 2px solid #2563eb;
  border-radius: 4px;
  background: #fff;
  color: #2563eb;
  cursor: pointer;
  font-size: 14px;
  width: 240px;
  text-align: left;
}

.file-dropdown {
  margin-top: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  width: 240px;
  background: #fff;
}

.file-dropdown div {
  padding: 8px 16px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
}

.raw-area {
  padding: 0;
}

.raw-editor {
  width: 100%;
  min-height: 200px;
  height: 200px;
  border: none;
  border-radius: 0;
  padding: 12px;
  font-size: 14px;
  resize: vertical;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  white-space: pre;
  word-wrap: normal;
  overflow-x: auto;
  line-height: 1.5;
  outline: none;
  background: #fff;
}

.raw-editor:empty:before {
  content: attr(placeholder);
  color: #999;
}

.json-key { color: #92278f; }
.json-string { color: #3ab54a; }
.json-number { color: #25aae2; }
.json-boolean { color: #f98280; }
.json-null { color: #f1592a; }
.json-brace { color: #586e75; }
</style>
