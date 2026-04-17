<script setup>
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { Close, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import ApiRecordDetailDrawer from './ApiRecordDetailDrawer.vue'
import BrowserExtensionHelpPopover from './BrowserExtensionHelpPopover.vue'
import { inferRequestType, REQUEST_TYPE_OPTIONS } from '@/shared/composables/useRequestType.ts'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  testcaseId: {
    type: [Number, String],
    default: ''
  },
  showAddAsStep: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:visible', 'close', 'save', 'add-as-steps'])

const localVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value)
})

const isRecording = ref(false)
const showRecordResultOnly = ref(false)
const filterKeyword = ref('')
const filterMethod = ref('')
const filterEvent = ref('')
const deduplicate = ref(false)
const filterTypes = ref(['all'])

const capturedRequests = ref([])
const extensionReady = ref(false)
const extensionInvalidated = ref(false)
const selectedRows = ref([])

const showDetailDrawer = ref(false)
const selectedRequest = ref(null)

const tableData = computed(() => {
  let list = capturedRequests.value.slice()
  if (showRecordResultOnly.value) {
    // UI 占位，不过滤
  }
  if (deduplicate.value) {
    const seen = new Set()
    list = list.filter(item => {
      const key = `${item.method}|${item.url}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
  if (filterKeyword.value.trim()) {
    const kw = filterKeyword.value.trim().toLowerCase()
    list = list.filter(item => item.url.toLowerCase().includes(kw) || (item.name && item.name.toLowerCase().includes(kw)))
  }
  if (filterMethod.value.trim()) {
    const m = filterMethod.value.trim().toUpperCase()
    list = list.filter(item => item.method.toUpperCase().includes(m))
  }
  if (filterEvent.value.trim()) {
    const ev = filterEvent.value.trim().toLowerCase()
    list = list.filter(item => (item.event || '').toLowerCase().includes(ev))
  }
  // 类型筛选
  const types = filterTypes.value || []
  if (!types.includes('all') && types.length > 0) {
    list = list.filter(item => {
      const t = item.resourceType || inferRequestType(item.url)
      return types.includes(t)
    })
  }
  return list
})

function handleClose() {
  showDetailDrawer.value = false
  selectedRequest.value = null
  localVisible.value = false
  emit('close')
}

function postToExtension(action) {
  window.postMessage({ source: 'cnTest-webapp', action }, '*')
}

function isExtensionInstalled() {
  if (extensionReady.value) return true
  if (typeof window !== 'undefined' && window.__cntestExtensionInstalled) return true
  return false
}

const EXTENSION_DISMISS_KEY = 'cntest_extension_download_dismissed'

function getBrowserType() {
  const ua = navigator.userAgent
  if (/Firefox/i.test(ua)) return 'firefox'
  if (/Chrome|Edg|OPR|Brave/i.test(ua)) return 'chrome'
  return 'chrome'
}

function showDownloadHint() {
  const dismissed = localStorage.getItem(EXTENSION_DISMISS_KEY)
  if (dismissed) return
  const browser = getBrowserType()
  const downloadUrl = browser === 'firefox' ? '/browser-extension-firefox.zip' : '/browser-extension-chrome.zip'

  ElMessageBox.alert(
    `<div style="font-size:14px;color:#303133;">
      录制前请先
      <a href="${downloadUrl}" download style="color:#409eff;text-decoration:none;font-weight:500;" id="ext-download-link">下载浏览器插件</a>
    </div>`,
    '提示',
    {
      confirmButtonText: '知道了',
      dangerouslyUseHTMLString: true,
      customClass: 'cntest-ext-hint-box',
      zIndex: 3000,
      callback: () => {
        localStorage.setItem(EXTENSION_DISMISS_KEY, '1')
      }
    }
  )

  // 绑定下载链接点击以记录 dismiss（ElMessageBox 的 HTML 不会被 Vue 绑定）
  setTimeout(() => {
    const link = document.querySelector('#ext-download-link')
    if (link) {
      link.addEventListener('click', () => {
        localStorage.setItem(EXTENSION_DISMISS_KEY, '1')
      })
    }
  }, 0)
}

function startRecording() {
  isRecording.value = true
  console.log('[cntest-drawer] startRecording, extensionReady:', extensionReady.value)
  if (extensionInvalidated.value) {
    ElMessage.warning('扩展已更新，请刷新页面后重新录制')
    return
  }
  if (!isExtensionInstalled()) {
    showDownloadHint()
  }
  postToExtension('START_RECORDING')
  if (!extensionReady.value) {
    installHooks()
  }
}

function stopRecording() {
  isRecording.value = false
  postToExtension('STOP_RECORDING')
  if (!extensionReady.value) {
    uninstallHooks()
  }
}

function toggleRecording() {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

function clearResults() {
  capturedRequests.value = []
  selectedRows.value = []
  postToExtension('CLEAR_RECORDING')
}

function handleQuery() {
  // 过滤已在前端 computed 中实时生效，这里仅作为交互保留
}

function handleSelectionChange(val) {
  selectedRows.value = val
}

function handleRowClick(row) {
  selectedRequest.value = row
  showDetailDrawer.value = true
}

function rowClassName({ row }) {
  const isChecked = selectedRows.value.some(r => r.id === row.id)
  const isOpened = selectedRequest.value && selectedRequest.value.id === row.id
  return (isChecked || isOpened) ? 'api-record-row--selected' : ''
}

function handleAddAsStep() {
  const rows = selectedRows.value
  if (!rows || rows.length === 0) {
    ElMessage.warning('请先勾选要添加的请求')
    return
  }
  emit('add-as-steps', rows)
}

function handleSave() {
  emit('save', capturedRequests.value)
  handleClose()
}

// ===== 扩展通信桥接 =====
function setupExtensionBridge() {
  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    const data = event.data
    if (!data || data.source !== 'cnTest-extension') return

    if (data.action === 'EXTENSION_READY') {
      extensionReady.value = true
      extensionInvalidated.value = false
      console.log('[cntest-drawer] extension ready')
      return
    }
    if (data.action === 'EXTENSION_INVALIDATED') {
      extensionReady.value = false
      extensionInvalidated.value = true
      console.warn('[cntest-drawer] extension invalidated')
      return
    }
    if (data.action === 'RECORDED_REQUEST' && data.payload) {
      const payload = data.payload
      // 1) 优先按 id 精确匹配（content hook 二次上报的 merged 记录）
      let idx = capturedRequests.value.findIndex(r => r.id === payload.id)
      // 2) 按 method + url + 2秒时间窗口合并（webRequest 基础记录与 content hook 详细记录）
      if (idx === -1 && payload.method && payload.url) {
        const now = Date.now()
        for (let i = capturedRequests.value.length - 1; i >= 0; i--) {
          const r = capturedRequests.value[i]
          if (
            r.method === payload.method &&
            r.url === payload.url &&
            Math.abs(now - (r.timestamp || now)) <= 2000
          ) {
            idx = i
            break
          }
        }
      }
      if (idx !== -1) {
        // 合并时保留最早的时间戳和稳定的 id，确保子抽屉选中行数据一致
        const base = capturedRequests.value[idx]
        capturedRequests.value[idx] = {
          ...base,
          ...payload,
          id: base.id,
          timestamp: base.timestamp
        }
      } else {
        capturedRequests.value.push(payload)
      }
      if (capturedRequests.value.length > 2000) {
        capturedRequests.value = capturedRequests.value.slice(-2000)
      }
      return
    }
    if (data.action === 'ALL_RECORDINGS' && Array.isArray(data.payload)) {
      capturedRequests.value = data.payload.slice(-2000)
    }
  })

  // 尝试获取已有记录（若扩展已提前就绪）
  postToExtension('GET_RECORDINGS')
}

onMounted(() => {
  setupExtensionBridge()
  if (typeof window !== 'undefined' && window.__cntestExtensionInstalled) {
    extensionReady.value = true
  }
})

// ===== Fallback Hooks（扩展未安装时） =====
let originalXHR = null
let originalFetch = null
let originalSend = null
let originalOpen = null

function installHooks() {
  if (originalXHR) return
  originalXHR = window.XMLHttpRequest
  originalFetch = window.fetch
  originalOpen = originalXHR.prototype.open
  originalSend = originalXHR.prototype.send

  originalXHR.prototype.open = function (method, url, async, user, password) {
    this.__record_method = method
    this.__record_url = url
    return originalOpen.apply(this, arguments)
  }

  originalXHR.prototype.send = function (body) {
    const method = this.__record_method || 'GET'
    const url = this.__record_url || ''
    const startTime = Date.now()
    const reqItem = {
      id: `${startTime}-${Math.random()}`,
      method,
      url,
      name: extractNameFromUrl(url),
      event: '',
      status: '-',
      duration: '-',
      timestamp: startTime,
      type: 'xhr',
      resourceType: inferRequestType(url),
      body: body || null
    }
    capturedRequests.value.push(reqItem)

    const onLoad = () => {
      reqItem.status = String(this.status || '-')
      reqItem.duration = `${Date.now() - startTime}ms`
    }
    const onError = () => {
      reqItem.status = 'ERROR'
      reqItem.duration = `${Date.now() - startTime}ms`
    }
    this.addEventListener('load', onLoad)
    this.addEventListener('error', onError)
    this.addEventListener('abort', onError)
    return originalSend.apply(this, arguments)
  }

  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input.url
    const method = (init && init.method) || 'GET'
    const startTime = Date.now()
    const reqItem = {
      id: `${startTime}-${Math.random()}`,
      method,
      url,
      name: extractNameFromUrl(url),
      event: '',
      status: '-',
      duration: '-',
      timestamp: startTime,
      type: 'fetch',
      resourceType: inferRequestType(url),
      body: (init && init.body) || null
    }
    capturedRequests.value.push(reqItem)

    return originalFetch.apply(this, arguments).then(resp => {
      reqItem.status = String(resp.status || '-')
      reqItem.duration = `${Date.now() - startTime}ms`
      return resp
    }).catch(err => {
      reqItem.status = 'ERROR'
      reqItem.duration = `${Date.now() - startTime}ms`
      throw err
    })
  }
}

function uninstallHooks() {
  if (!originalXHR) return
  originalXHR.prototype.open = originalOpen
  originalXHR.prototype.send = originalSend
  window.fetch = originalFetch
  originalXHR = null
  originalFetch = null
  originalOpen = null
  originalSend = null
}

function extractNameFromUrl(url) {
  try {
    const u = new URL(url, location.href)
    const parts = u.pathname.split('/').filter(Boolean)
    return parts[parts.length - 1] || u.pathname || url
  } catch {
    return url
  }
}

onUnmounted(() => {
  stopRecording()
})

watch(localVisible, (val) => {
  if (!val) {
    stopRecording()
    showDetailDrawer.value = false
    selectedRequest.value = null
  }
})
</script>

<template>
  <teleport to="body">
    <div v-if="localVisible" class="api-record-mask" @click.self="handleClose">
      <div class="api-record-panel">
        <!-- Header -->
        <div class="api-record-header">
          <div class="header-left">
            <span class="api-record-title">用例录制</span>
            <el-popover placement="bottom-start" :width="320" trigger="hover" popper-class="api-record-help-popover">
              <template #default>
                <BrowserExtensionHelpPopover />
              </template>
              <template #reference>
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </template>
            </el-popover>
          </div>
          <el-icon class="api-record-close" @click="handleClose"><Close /></el-icon>
        </div>

        <!-- Body -->
        <div class="api-record-body">
          <!-- 搜索区 -->
          <div class="api-record-filter">
            <div class="filter-row">
              <el-input v-model="filterKeyword" placeholder="关键字" clearable style="width: 140px" />
              <el-input v-model="filterMethod" placeholder="请求方法" clearable style="width: 140px" />
            </div>
            <div class="filter-row">
              <el-input v-model="filterEvent" placeholder="事件" clearable style="width: 140px" />
              <el-checkbox v-model="deduplicate">去重</el-checkbox>
              <el-button type="primary" size="small" @click="handleQuery">查询</el-button>
            </div>
          </div>

          <!-- 扩展失效提示 -->
          <el-alert
            v-if="extensionInvalidated"
            title="扩展已更新，请刷新页面后重新录制"
            type="warning"
            :closable="false"
            show-icon
            style="margin-bottom: 10px"
          />

          <!-- 录制结果 + 类型筛选 -->
          <div class="api-record-result-bar">
            <el-checkbox v-model="showRecordResultOnly">录制结果</el-checkbox>
            <el-select
              v-model="filterTypes"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="类型筛选"
              size="small"
              style="width: 160px"
              :teleport="true"
              popper-class="api-record-type-popper"
            >
              <el-option
                v-for="opt in REQUEST_TYPE_OPTIONS"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </div>

          <!-- 列表区 -->
          <div class="api-record-list">
            <el-table
              v-if="tableData.length > 0"
              :data="tableData"
              size="small"
              border
              stripe
              height="100%"
              :row-class-name="rowClassName"
              @selection-change="handleSelectionChange"
              @row-click="handleRowClick"
            >
              <el-table-column type="selection" width="40" align="center" />
              <el-table-column label="Method" width="80" align="center">
                <template #default="{ row }">
                  <span class="method-tag">{{ row.method }}</span>
                </template>
              </el-table-column>
              <el-table-column label="URL" min-width="200">
                <template #default="{ row }">
                  <el-tooltip :content="row.url" placement="top" popper-class="api-record-url-tooltip">
                    <span class="url-text">{{ row.url }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column label="Status" width="80" align="center" prop="status" />
              <el-table-column label="Duration" width="90" align="center" prop="duration" />
            </el-table>
            <div v-else class="api-record-empty">
              <el-empty description="暂无数据" :image-size="60" />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="api-record-footer">
          <div class="footer-left">
            <el-button :type="isRecording ? 'danger' : 'default'" @click="toggleRecording">
              {{ isRecording ? '停止录制' : '开始录制' }}
            </el-button>
            <el-button @click="clearResults">清空结果</el-button>
          </div>
          <div class="footer-right">
            <el-button v-if="showAddAsStep" @click="handleAddAsStep">添加为步骤</el-button>
            <el-button type="primary" @click="handleSave">保存</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 子抽屉 -->
    <ApiRecordDetailDrawer
      v-model:visible="showDetailDrawer"
      :request="selectedRequest"
      @close="showDetailDrawer = false"
    />
  </teleport>
</template>

<style scoped>
.api-record-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 2200;
}

.api-record-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 420px;
  height: 100%;
  background: #fff;
  box-shadow: rgba(0, 0, 0, 0.08) 6px 0 16px -8px, rgba(0, 0, 0, 0.05) 9px 0 28px 0, rgba(0, 0, 0, 0.03) 12px 0 48px 16px;
  display: flex;
  flex-direction: column;
}

.api-record-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #ebeef5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-record-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.help-icon {
  font-size: 16px;
  color: #c0c4cc;
  cursor: pointer;
}
.help-icon:hover {
  color: #409eff;
}

.api-record-close {
  font-size: 16px;
  color: #909399;
  cursor: pointer;
}

.api-record-close:hover {
  color: #409eff;
}

.api-record-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  overflow: hidden;
}

.api-record-filter {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.api-record-result-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.api-record-list {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

.api-record-empty {
  padding-top: 40px;
}

.method-tag {
  display: inline-block;
  padding: 2px 6px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}

.url-text {
  color: #303133;
  font-size: 13px;
}

.api-record-footer {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-top: 1px solid #ebeef5;
  background: #fff;
}

.footer-left,
.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-table__row) {
  cursor: pointer;
}
:deep(.api-record-row--selected td) {
  background-color: rgba(24, 144, 255, 0.2) !important;
}
</style>

<style>
/* 全局 popper z-index 提升，避免被 drawer mask 遮挡 */
.api-record-type-popper {
  z-index: 3000 !important;
}
.api-record-help-popover {
  z-index: 3000 !important;
}
.api-record-url-tooltip {
  max-width: 360px !important;
  word-break: break-all !important;
  white-space: pre-wrap !important;
}
</style>
