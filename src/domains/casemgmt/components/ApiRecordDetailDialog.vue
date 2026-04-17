<script setup>
import { ref, computed } from 'vue'
import { Close } from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  request: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'close'])

const localVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

const activeTab = ref('request')

function handleClose() {
  localVisible.value = false
  emit('close')
}

function formatBody(body) {
  if (!body) return ''
  const str = String(body).trim()
  if (!str) return ''
  if (str.startsWith('{') || str.startsWith('[')) {
    try {
      return JSON.stringify(JSON.parse(str), null, 2)
    } catch {
      return str
    }
  }
  return str
}

function headersArray(headers) {
  if (!headers || typeof headers !== 'object') return []
  return Object.entries(headers).map(([key, value]) => ({ key, value: String(value) }))
}

const reqHeaders = computed(() => headersArray(props.request?.requestHeaders))
const respHeaders = computed(() => headersArray(props.request?.responseHeaders))
const reqBody = computed(() => formatBody(props.request?.requestBody))
const respBody = computed(() => formatBody(props.request?.responseBody))

const hasReqBody = computed(() => props.request?.requestBody != null && String(props.request.requestBody).trim() !== '')
const hasRespBody = computed(() => props.request?.responseBody != null && String(props.request.responseBody).trim() !== '' && props.request.responseBody !== '(binary content ignored)')
</script>

<template>
  <el-dialog
    v-model="localVisible"
    title=""
    width="760px"
    align-center
    destroy-on-close
    :close-on-click-modal="true"
    class="api-record-detail-dialog"
    @closed="handleClose"
  >
    <template #header>
      <div class="detail-header">
        <div class="detail-title-row">
          <span class="detail-method">{{ request?.method }}</span>
          <span class="detail-status">{{ request?.status }}</span>
          <span class="detail-duration">{{ request?.duration }}</span>
        </div>
        <div class="detail-url" :title="request?.url">{{ request?.url }}</div>
      </div>
    </template>

    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="请求" name="request">
        <div class="detail-section">
          <div class="section-label">请求头</div>
          <el-table :data="reqHeaders" size="small" :show-header="true" border height="200">
            <el-table-column prop="key" label="Key" min-width="140" show-overflow-tooltip />
            <el-table-column prop="value" label="Value" min-width="260" show-overflow-tooltip />
          </el-table>
        </div>
        <div class="detail-section">
          <div class="section-label">请求体</div>
          <pre v-if="hasReqBody" class="code-block">{{ reqBody }}</pre>
          <div v-else class="empty-hint">（empty）</div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="响应" name="response">
        <div class="detail-section">
          <div class="section-label">响应头</div>
          <el-table :data="respHeaders" size="small" :show-header="true" border height="200">
            <el-table-column prop="key" label="Key" min-width="140" show-overflow-tooltip />
            <el-table-column prop="value" label="Value" min-width="260" show-overflow-tooltip />
          </el-table>
        </div>
        <div class="detail-section">
          <div class="section-label">响应体</div>
          <pre v-if="hasRespBody" class="code-block">{{ respBody }}</pre>
          <div v-else class="empty-hint">
            响应体未捕获。跨标签页请求或特殊发起方式（如 Service Worker、sendBeacon）可能无法获取响应体，建议在当前页面直接操作后再录制。
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<style scoped>
.detail-header {
  padding-right: 24px;
}
.detail-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.detail-method {
  padding: 2px 8px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}
.detail-status {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}
.detail-duration {
  font-size: 13px;
  color: #909399;
}
.detail-url {
  font-size: 13px;
  color: #606266;
  word-break: break-all;
  line-height: 1.5;
}
.detail-tabs :deep(.el-tabs__header) {
  margin: 0 0 12px 0;
}
.detail-section {
  margin-bottom: 16px;
}
.detail-section:last-child {
  margin-bottom: 0;
}
.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}
.code-block {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 260px;
  overflow-y: auto;
  margin: 0;
}
.empty-hint {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.6;
  color: #909399;
  margin: 0;
}
</style>

<style>
.api-record-detail-dialog .el-dialog__header {
  padding-bottom: 8px;
  margin-right: 0;
}
.api-record-detail-dialog .el-dialog__body {
  padding-top: 0;
}
</style>
