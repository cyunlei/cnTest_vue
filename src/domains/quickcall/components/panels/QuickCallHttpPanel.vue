<script setup>
import { ref, computed, nextTick } from 'vue'
import { Edit, Delete, VideoPlay } from '@element-plus/icons-vue'
import MethodSelect from '../MethodSelect.vue'
import ResponseArea from '../ResponseArea.vue'
import CurlParser from '@/domains/casemgmt/components/CurlParser.vue'
import BodyContent from '@/domains/casemgmt/components/BodyContent.vue'
import JsonAddDialog from '@/domains/casemgmt/components/common/JsonAddDialog.vue'
import BatchEditDialog from '@/domains/casemgmt/components/common/BatchEditDialog.vue'
import { executeQuickHttp } from '../../api'

const activeTab = ref('params')
const method = ref('GET')
const url = ref('')

const params = ref([{ key: '', value: '' }])
const headers = ref([{ key: '', value: '' }])
const bodyData = ref({
  contentType: 'raw',
  formData: [],
  urlencoded: [],
  raw: '',
  rawType: 'json',
  binary: null
})

const responseBody = ref('')
const responseHeaders = ref([])
const loading = ref(false)

// JSON添加 / 批量编辑弹窗
const jsonDialogVisible = ref(false)
const jsonDialogType = ref('params')
const batchEditVisible = ref(false)

function ensureTrailingEmptyRow(rows) {
  if (!Array.isArray(rows)) return
  if (rows.length === 0) {
    rows.push({ key: '', value: '' })
    return
  }
  const last = rows[rows.length - 1]
  const hasContent = !!(String(last?.key || '').trim() || String(last?.value || '').trim())
  if (hasContent) rows.push({ key: '', value: '' })
  while (rows.length > 1) {
    const tail = rows[rows.length - 1]
    const prev = rows[rows.length - 2]
    const tailEmpty = !String(tail?.key || '').trim() && !String(tail?.value || '').trim()
    const prevEmpty = !String(prev?.key || '').trim() && !String(prev?.value || '').trim()
    if (tailEmpty && prevEmpty) rows.pop()
    else break
  }
}

function handleParamInput() {
  ensureTrailingEmptyRow(params.value)
}
function handleHeaderInput() {
  ensureTrailingEmptyRow(headers.value)
}
function removeParamRow(index) {
  params.value.splice(index, 1)
  ensureTrailingEmptyRow(params.value)
}
function removeHeaderRow(index) {
  headers.value.splice(index, 1)
  ensureTrailingEmptyRow(headers.value)
}

function openJsonDialog(type) {
  jsonDialogType.value = type
  jsonDialogVisible.value = true
}
function handleJsonSave(selectedItems) {
  const target = jsonDialogType.value === 'params' ? params.value : headers.value
  if (Array.isArray(selectedItems)) {
    selectedItems.forEach(item => target.push({ key: item.key || '', value: String(item.value ?? '') }))
  }
  ensureTrailingEmptyRow(target)
  jsonDialogVisible.value = false
}
function openBatchEdit() {
  batchEditVisible.value = true
}
function handleBatchEditSave(selectedItems) {
  const target = activeTab.value === 'params' ? params.value : headers.value
  if (Array.isArray(selectedItems)) {
    selectedItems.forEach(item => target.push({ key: item.key || '', value: String(item.value ?? '') }))
  }
  ensureTrailingEmptyRow(target)
  batchEditVisible.value = false
}

function handleParseParams(parsed) {
  if (!parsed) return
  params.value = params.value.filter(r => !!(String(r.key || '').trim() || String(r.value || '').trim()))
  Object.entries(parsed).forEach(([k, v]) => {
    if (!params.value.some(r => r.key === k)) params.value.push({ key: k, value: String(v) })
  })
  ensureTrailingEmptyRow(params.value)
}
function handleParseHeaders(parsed) {
  if (!parsed) return
  headers.value = headers.value.filter(r => !!(String(r.key || '').trim() || String(r.value || '').trim()))
  Object.entries(parsed).forEach(([k, v]) => {
    if (!headers.value.some(r => r.key === k)) headers.value.push({ key: k, value: String(v) })
  })
  ensureTrailingEmptyRow(headers.value)
}
function handleParseBody(body) {
  if (!body) return
  bodyData.value.contentType = 'raw'
  bodyData.value.raw = body
  bodyData.value.rawType = 'json'
}

async function handleExecute() {
  loading.value = true
  try {
    const methodValueMap = { GET: 0, POST: 1, PUT: 2, DELETE: 3, PATCH: 4 }
    const payload = {
      method: methodValueMap[method.value] ?? 0,
      url: url.value,
      params: Object.fromEntries(params.value.filter(r => r.key).map(r => [r.key, r.value])),
      headers: Object.fromEntries(headers.value.filter(r => r.key).map(r => [r.key, r.value])),
      body: bodyData.value
    }
    const resp = await executeQuickHttp(payload)
    const data = resp?.data?.data ?? {}
    const body = data?.response_body ?? {}
    responseBody.value = typeof body === 'string' ? body : JSON.stringify(body, null, 2)
    const hdrs = data?.response_headers || {}
    responseHeaders.value = Object.entries(hdrs).map(([k, v]) => ({ key: k, value: String(v ?? '') }))
  } catch (e) {
    responseBody.value = String(e?.message || '执行失败')
    responseHeaders.value = []
  } finally {
    loading.value = false
  }
}

function handleSaveTemplate() {
  // TODO
}
function handleSaveAsCase() {
  // TODO
}

nextTick(() => {
  ensureTrailingEmptyRow(params.value)
  ensureTrailingEmptyRow(headers.value)
})
</script>

<template>
  <div class="quick-call-http-panel">
    <!-- URL 行 -->
    <div class="url-row">
      <MethodSelect v-model="method" />
      <div class="url-input-wrap">
        <CurlParser
          v-model="url"
          :method="method"
          @update:method="method = $event"
          @parse:params="handleParseParams"
          @parse:headers="handleParseHeaders"
          @parse:body="handleParseBody"
        />
      </div>
      <el-button link class="curl-btn">
        <el-icon><Edit /></el-icon>
        <span>cURL</span>
      </el-button>
    </div>

    <!-- Tabs -->
    <el-tabs v-model="activeTab" class="request-tabs">
      <el-tab-pane label="Params" name="params">
        <div class="kv-table">
          <el-table :data="params" size="small" border>
            <el-table-column min-width="140">
              <template #header>
                <span>KEY</span>
                <el-button size="small" link style="margin-left: 8px" @click="openJsonDialog('params')">JSON添加</el-button>
              </template>
              <template #default="{ row }">
                <el-input v-model="row.key" size="small" placeholder="请输入Key" @input="handleParamInput" />
              </template>
            </el-table-column>
            <el-table-column label="VALUE" min-width="200">
              <template #default="{ row }">
                <el-input v-model="row.value" size="small" placeholder="请输入Value" @input="handleParamInput" />
              </template>
            </el-table-column>
            <el-table-column width="70" align="center">
              <template #header>
                <el-link type="primary" :underline="false" @click="openBatchEdit">批量编辑</el-link>
              </template>
              <template #default="{ $index }">
                <el-button
                  v-if="$index < params.length - 1"
                  link
                  type="danger"
                  size="small"
                  @click="removeParamRow($index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Headers" name="headers">
        <div class="kv-table">
          <el-table :data="headers" size="small" border>
            <el-table-column min-width="140">
              <template #header>
                <span>KEY</span>
                <el-button size="small" link style="margin-left: 8px" @click="openJsonDialog('headers')">JSON添加</el-button>
              </template>
              <template #default="{ row }">
                <el-input v-model="row.key" size="small" placeholder="请输入Key" @input="handleHeaderInput" />
              </template>
            </el-table-column>
            <el-table-column label="VALUE" min-width="200">
              <template #default="{ row }">
                <el-input v-model="row.value" size="small" placeholder="请输入Value" @input="handleHeaderInput" />
              </template>
            </el-table-column>
            <el-table-column width="70" align="center">
              <template #header>
                <el-link type="primary" :underline="false" @click="openBatchEdit">批量编辑</el-link>
              </template>
              <template #default="{ $index }">
                <el-button
                  v-if="$index < headers.length - 1"
                  link
                  type="danger"
                  size="small"
                  @click="removeHeaderRow($index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Body" name="body">
        <BodyContent v-model="bodyData" />
      </el-tab-pane>

      <el-tab-pane label="IP/EONE特性环境" name="ip">
        <div class="placeholder-tab">IP/EONE 特性环境配置</div>
      </el-tab-pane>
      <el-tab-pane label="加密" name="encrypt">
        <div class="placeholder-tab">加密配置</div>
      </el-tab-pane>
      <el-tab-pane label="断言" name="assert">
        <div class="placeholder-tab">断言配置</div>
      </el-tab-pane>
      <el-tab-pane label="设置" name="settings">
        <div class="placeholder-tab">高级设置</div>
      </el-tab-pane>
    </el-tabs>

    <!-- 响应区 -->
    <ResponseArea :body="responseBody" :headers="responseHeaders" />

    <!-- 底部按钮 -->
    <div class="panel-footer">
      <el-button type="primary" :loading="loading" @click="handleExecute">
        <el-icon><VideoPlay /></el-icon>
        调用
      </el-button>
      <el-button @click="handleSaveTemplate">保存模板</el-button>
      <el-button @click="handleSaveAsCase">保存为用例</el-button>
    </div>

    <!-- 弹窗 -->
    <JsonAddDialog
      v-model="jsonDialogVisible"
      :type="jsonDialogType"
      title="Json添加"
      @save="handleJsonSave"
    />
    <BatchEditDialog v-model="batchEditVisible" @save="handleBatchEditSave" />
  </div>
</template>

<style scoped>
.quick-call-http-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.url-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.url-input-wrap {
  flex: 1;
  min-width: 0;
}
.url-input-wrap :deep(.el-input__inner) {
  font-size: 13px;
}
.curl-btn {
  color: #606266;
  font-size: 13px;
}
.request-tabs :deep(.el-tabs__header) {
  margin-bottom: 8px;
}
.kv-table :deep(.el-table__header-wrapper th) {
  background-color: #fafafa;
}
.placeholder-tab {
  padding: 40px 0;
  text-align: center;
  color: #999;
  font-size: 13px;
}
.panel-footer {
  display: flex;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}
</style>
