<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { Close } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  testcaseId: {
    type: [Number, String],
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'close', 'save'])

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

const allRequests = ref([])
const capturedRequests = ref([])

const filteredRequests = computed(() => {
  let list = capturedRequests.value.slice()
  if (showRecordResultOnly.value) {
    // 保留录制结果checkbox只是一个UI状态，不过滤，因为全部就是录制结果
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
  return list
})

function handleClose() {
  localVisible.value = false
  emit('close')
}

function startRecording() {
  isRecording.value = true
  installHooks()
}

function stopRecording() {
  isRecording.value = false
  uninstallHooks()
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
}

function handleQuery() {
  // 过滤已在前端 computed 中实时生效，这里仅作为交互保留
}

function handleAddAsStep() {
  // mock
}

function handleSave() {
  emit('save', capturedRequests.value)
  handleClose()
}

// ===== 浏览器请求拦截 =====
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

  // Hook XHR
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

  // Hook fetch
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
  }
})
</script>

<template>
  <teleport to="body">
    <div v-if="localVisible" class="api-record-mask" @click.self="handleClose">
      <div class="api-record-panel">
        <!-- Header -->
        <div class="api-record-header">
          <span class="api-record-title">用例录制</span>
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

          <!-- 录制结果 -->
          <div class="api-record-result-bar">
            <el-checkbox v-model="showRecordResultOnly">录制结果</el-checkbox>
          </div>

          <!-- 列表区 -->
          <div class="api-record-list">
            <div v-if="filteredRequests.length === 0" class="api-record-empty">
              <el-empty description="暂无数据" :image-size="60" />
            </div>
            <div v-else class="request-items">
              <div
                v-for="item in filteredRequests"
                :key="item.id"
                class="request-item"
              >
                <div class="request-method">{{ item.method }}</div>
                <div class="request-url" :title="item.url">{{ item.name || item.url }}</div>
                <div class="request-meta">
                  <span class="request-status">{{ item.status }}</span>
                  <span class="request-duration">{{ item.duration }}</span>
                </div>
              </div>
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
            <el-button @click="handleAddAsStep">添加为步骤</el-button>
            <el-button type="primary" @click="handleSave">保存</el-button>
          </div>
        </div>
      </div>
    </div>
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
  right: 0;
  width: 420px;
  height: 100%;
  background: #fff;
  box-shadow: rgba(0, 0, 0, 0.08) -6px 0 16px -8px, rgba(0, 0, 0, 0.05) -9px 0 28px 0, rgba(0, 0, 0, 0.03) -12px 0 48px 16px;
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

.api-record-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
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
  margin-bottom: 8px;
}

.api-record-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

.api-record-empty {
  padding-top: 40px;
}

.request-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.request-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 13px;
}

.request-method {
  padding: 2px 6px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.request-url {
  flex: 1;
  min-width: 0;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.request-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 12px;
  flex-shrink: 0;
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
</style>
