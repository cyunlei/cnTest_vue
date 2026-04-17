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
  <teleport to="body">
    <transition name="detail-slide">
      <div v-if="localVisible" class="api-record-detail-mask" @click.self="handleClose">
        <div class="api-record-detail-panel">
          <!-- Header -->
          <div class="detail-header">
            <div class="detail-title-row">
              <span class="detail-method">{{ request?.method }}</span>
              <span class="detail-status">{{ request?.status }}</span>
              <span class="detail-duration">{{ request?.duration }}</span>
            </div>
            <div class="detail-url" :title="request?.url">{{ request?.url }}</div>
            <el-icon class="detail-close" @click="handleClose"><Close /></el-icon>
          </div>

          <!-- Tabs -->
          <el-tabs v-model="activeTab" class="detail-tabs">
            <el-tab-pane label="请求" name="request">
              <div class="detail-section">
                <div class="section-label">请求头</div>
                <el-table :data="reqHeaders" size="small" :show-header="true" border height="180">
                  <el-table-column prop="key" label="Key" min-width="120" show-overflow-tooltip />
                  <el-table-column prop="value" label="Value" min-width="200" show-overflow-tooltip />
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
                <el-table :data="respHeaders" size="small" :show-header="true" border height="180">
                  <el-table-column prop="key" label="Key" min-width="120" show-overflow-tooltip />
                  <el-table-column prop="value" label="Value" min-width="200" show-overflow-tooltip />
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
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.api-record-detail-mask {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 2500;
  pointer-events: none;
}
.api-record-detail-panel {
  position: absolute;
  top: 0;
  left: 420px;
  width: 480px;
  height: 100%;
  background: #fff;
  box-shadow: rgba(0,0,0,0.08) 6px 0 16px -8px, rgba(0,0,0,0.05) 9px 0 28px 0, rgba(0,0,0,0.03) 12px 0 48px 16px;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}
.detail-header {
  position: relative;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}
.detail-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.detail-method {
  padding: 2px 6px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}
.detail-status {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}
.detail-duration {
  font-size: 12px;
  color: #909399;
}
.detail-url {
  font-size: 12px;
  color: #606266;
  word-break: break-all;
  line-height: 1.5;
  padding-right: 20px;
}
.detail-close {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 16px;
  color: #909399;
  cursor: pointer;
}
.detail-close:hover {
  color: #409eff;
}
.detail-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.detail-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 12px;
}
.detail-tabs :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 16px;
}
.detail-section {
  margin-bottom: 16px;
}
.detail-section:last-child {
  margin-bottom: 0;
}
.section-label {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}
.code-block {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 10px;
  font-size: 12px;
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 240px;
  overflow-y: auto;
  margin: 0;
}
.empty-hint {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 10px;
  font-size: 12px;
  line-height: 1.6;
  color: #909399;
  margin: 0;
}

.detail-slide-enter-active,
.detail-slide-leave-active {
  transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.detail-slide-enter-from,
.detail-slide-leave-to {
  transform: translateX(-100%);
}
</style>
