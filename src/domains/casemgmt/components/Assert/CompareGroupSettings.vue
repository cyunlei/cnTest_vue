<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'

export interface CompareGroup {
  id: number | string
  name: string
  enabled: boolean
}

const props = defineProps<{
  modelValue: CompareGroup[]
  visible: boolean
  baseMethod?: string
  baseUrl?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: CompareGroup[]): void
  (e: 'update:visible', v: boolean): void
}>()

const innerVisible = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v)
})

// 这里可以后续接入真正的对比组数据
// 目前仅做 UI 布局，使用本地 tab 控制展示
// 选项默认不选中，由用户自行勾选
const activeTabs = ref<string[]>([])

interface HeaderRow {
  key: string
  value: string
}

const headerRows = ref<HeaderRow[]>([])

const localMethod = ref(props.baseMethod || 'GET')
const localUrl = ref(props.baseUrl || '')

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

const handleCopyUrl = async () => {
  const text = localUrl.value || props.baseUrl || ''
  if (!text) return
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  } catch {
    // ignore copy failures silently
  }
}

const bodyText = ref('')
const bodyCopySuccess = ref(false)

const handleCopyBody = async () => {
  const text = bodyText.value
  if (!text) return
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    bodyCopySuccess.value = true
    window.setTimeout(() => {
      bodyCopySuccess.value = false
    }, 1500)
  } catch {
    // ignore
  }
}

const handleFormatBody = () => {
  if (!bodyText.value) {
    return
  }
  try {
    // 尝试解析 JSON，不合法会抛异常
    const parsed = JSON.parse(bodyText.value)
    // 使用 4 空格缩进美化，只在当前输入框内显示
    bodyText.value = JSON.stringify(parsed, null, 4)
  } catch {
    ElMessage.error('JSON 格式不正确，请检查后再试')
  }
}

const handleClose = () => {
  innerVisible.value = false
}

const handleSave = () => {
  if (activeTabs.value.includes('addr') && !localUrl.value.trim()) {
    ElMessage.error('请输入接口地址')
    return
  }
  innerVisible.value = false
}

const addHeaderRow = () => {
  headerRows.value.push({ key: '', value: '' })
}

type HeaderPresetCommand =
  | 'ct-json'
  | 'ct-xml'
  | 'ct-form'
  | 'ct-text'
  | 'ct-text-xml'
  | 'ct-text-html'
  | 'cookie'

const handleHeaderPreset = (row: HeaderRow, command: HeaderPresetCommand) => {
  switch (command) {
    case 'ct-json':
      row.key = 'Content-Type'
      row.value = 'application/json'
      break
    case 'ct-xml':
      row.key = 'Content-Type'
      row.value = 'application/xml'
      break
    case 'ct-form':
      row.key = 'Content-Type'
      row.value = 'application/x-www-form-urlencoded'
      break
    case 'ct-text':
      row.key = 'Content-Type'
      row.value = 'text/plain'
      break
    case 'ct-text-xml':
      row.key = 'Content-Type'
      row.value = 'text/xml'
      break
    case 'ct-text-html':
      row.key = 'Content-Type'
      row.value = 'text/html'
      break
    case 'cookie':
      row.key = 'Cookie'
      row.value = '${erp.cookie}'
      break
    default:
      break
  }
}
</script>

<template>
  <el-dialog
    v-model="innerVisible"
    width="780px"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-header">
        <span class="header-title">对比组设置</span>
        <span class="header-badge">未选中的内容与原步骤相同（特性环境除外）</span>
      </div>
    </template>

    <div class="compare-group-dialog">
      <div class="tab-row">
        <el-checkbox-group v-model="activeTabs">
          <el-checkbox label="addr">接口地址</el-checkbox>
          <el-checkbox label="ip">IP PORT</el-checkbox>
          <el-checkbox label="headers">Headers</el-checkbox>
          <el-checkbox label="body">消息体</el-checkbox>
          <el-checkbox label="env">特性环境</el-checkbox>
        </el-checkbox-group>
      </div>

      <!-- 接口地址 -->
      <div class="form-section" v-if="activeTabs.includes('addr')">
        <div class="addr-label-row">
          <span class="addr-label-text">接口地址</span>
          <svg
            viewBox="64 64 896 896"
            class="copy-icon"
            focusable="false"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
            @click.stop="handleCopyUrl"
          >
            <path
              d="M832 64H296c-17.7 0-32 14.3-32 32v64h-72c-30.9 0-56 25.1-56 56v632c0 30.9 25.1 56 56 56h472c30.9 0 56-25.1 56-56v-64h80c17.7 0 32-14.3 32-32V120c0-30.9-25.1-56-56-56zM664 848H216V248h448v600zm112-120h-56V200c0-30.9-25.1-56-56-56H328v-40h448v624z"
            />
          </svg>
        </div>
        <el-form label-width="0" size="small">
          <el-form-item>
            <div class="addr-input-row">
              <el-select v-model="localMethod" class="method-select">
                <el-option
                  v-for="m in httpMethods"
                  :key="m"
                  :label="m"
                  :value="m"
                />
              </el-select>
              <el-input
                v-model="localUrl"
                class="url-input"
                placeholder="请选择接口地址，支持输入"
              />
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- IP:PORT & 特性环境（两行：第一行 label，第二行输入框） -->
      <div
        class="form-section ip-env-section"
        v-if="activeTabs.includes('ip') || activeTabs.includes('env')"
      >
        <!-- 第一行：标签 -->
        <el-row :gutter="16" class="ip-env-label-row">
          <el-col v-if="activeTabs.includes('ip')" :span="14">
            <span class="ip-label-text">IP:PORT</span>
          </el-col>
          <el-col v-if="activeTabs.includes('env')" :span="10">
            <span class="env-label-text">特性环境</span>
          </el-col>
        </el-row>
        <!-- 第二行：输入框 -->
        <el-row :gutter="16" class="ip-env-input-row">
          <el-col v-if="activeTabs.includes('ip')" :span="14">
            <el-input
              placeholder="请输入比对目标ip:port，如：192.168.0.1:80，只允许填一个"
            />
          </el-col>
          <el-col v-if="activeTabs.includes('env')" :span="10">
            <el-input placeholder="请选择环境，可输入" />
          </el-col>
        </el-row>
      </div>

      <!-- Headers -->
      <div class="form-section" v-if="activeTabs.includes('headers')">
        <div class="headers-label">Headers</div>
        <div
          v-if="!headerRows.length"
          class="headers-add-box"
          @click="addHeaderRow"
        >
          <span class="headers-add-plus">+</span>
          <span class="headers-add-text">添加</span>
        </div>
        <template v-else>
          <el-table :data="headerRows" size="small" border :show-header="false">
            <el-table-column label="Key">
              <template #default="{ row }">
                <el-input v-model="row.key" size="small" placeholder="Key" />
              </template>
            </el-table-column>
            <el-table-column label="=" width="40" align="center">
              <template #default>
                <span>=</span>
              </template>
            </el-table-column>
            <el-table-column label="Value">
              <template #default="{ row }">
                <el-input v-model="row.value" size="small" placeholder="Value" />
              </template>
            </el-table-column>
            <el-table-column width="80" align="center">
              <template #default="{ row, $index }">
                <div class="headers-op-icons">
                  <!-- 下拉箭头（预设下拉菜单） -->
                  <el-dropdown
                    trigger="hover"
                    @command="(cmd: HeaderPresetCommand) => handleHeaderPreset(row, cmd)"
                  >
                    <span class="op-icon-wrapper" @click.stop>
                      <svg
                        viewBox="64 64 896 896"
                        class="op-icon"
                        focusable="false"
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.7L512 654.2 227.9 262.7A16 16 0 0 0 215 256H140c-6.5 0-10.4 7.4-6.5 12.7l362 496a16 16 0 0 0 26 0l362-496c3.9-5.3.1-12.7-6.5-12.7z"
                        />
                      </svg>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="ct-json">
                          Content-Type: application/json
                        </el-dropdown-item>
                        <el-dropdown-item command="ct-xml">
                          Content-Type: application/xml
                        </el-dropdown-item>
                        <el-dropdown-item command="ct-form">
                          Content-Type: application/x-www-form-urlencoded
                        </el-dropdown-item>
                        <el-dropdown-item command="ct-text">
                          Content-Type: text/plain
                        </el-dropdown-item>
                        <el-dropdown-item command="ct-text-xml">
                          Content-Type: text/xml
                        </el-dropdown-item>
                        <el-dropdown-item command="ct-text-html">
                          Content-Type: text/html
                        </el-dropdown-item>
                        <el-dropdown-item command="cookie">
                          获取当前登录cookie
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  <!-- 删除圆圈 -->
                  <svg
                    viewBox="64 64 896 896"
                    class="op-icon"
                    focusable="false"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    aria-hidden="true"
                    @click.stop="headerRows.splice($index, 1)"
                  >
                    <path d="M696 480H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z" />
                    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                  </svg>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div
            class="headers-add-box"
            @click="addHeaderRow"
          >
            <span class="headers-add-plus">+</span>
            <span class="headers-add-text">添加</span>
          </div>
        </template>
      </div>

      <!-- 消息体 -->
      <div class="form-section" v-if="activeTabs.includes('body')">
        <div class="body-label-row">
          <span class="body-label-text">方法入参</span>
          <div class="body-label-right">
            <a
              href="javascript:void(0)"
              class="format-link"
              @click.prevent="handleFormatBody"
            >格式化</a>
            <svg
              v-if="!bodyCopySuccess"
              viewBox="64 64 896 896"
              class="copy-icon"
              focusable="false"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
              @click.stop="handleCopyBody"
            >
              <path
                d="M832 64H296c-17.7 0-32 14.3-32 32v64h-72c-30.9 0-56 25.1-56 56v632c0 30.9 25.1 56 56 56h472c30.9 0 56-25.1 56-56v-64h80c17.7 0 32-14.3 32-32V120c0-30.9-25.1-56-56-56zM664 848H216V248h448v600zm112-120h-56V200c0-30.9-25.1-56-56-56H328v-40h448v624z"
              />
            </svg>
            <svg
              v-else
              viewBox="64 64 896 896"
              class="copy-icon copy-success-icon"
              focusable="false"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm215.5 301.7L479.1 705.2c-3.2 3.8-7.9 6.1-12.9 6.2h-.3c-5 0-9.7-2.2-12.9-6L286.6 532.4a18.03 18.03 0 0 1 1.6-25.3l32.9-29.3a18.03 18.03 0 0 1 25.3 1.6l102.7 121.7 211-263.8a18 18 0 0 1 25.3-2.8l32.4 26.3c7.7 6.3 8.8 17.7 2.3 25.3z"
              />
            </svg>
          </div>
        </div>
        <el-input
          v-model="bodyText"
          type="textarea"
          :rows="8"
          resize="none"
          placeholder=""
          class="body-textarea"
        />
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button size="small" @click="innerVisible = false">关闭</el-button>
        <el-button size="small" type="primary" @click="handleSave">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.header-badge {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 2px;
  background-color: #ff4d4f;
  color: #fff;
}

.compare-group-dialog {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.compare-group-dialog :deep(.el-form-item) {
  margin-bottom: 1px;
}

.tab-row {
  margin-top: 4px;
}

.form-section {
  margin-top: 1px;
}

.addr-label-row {
  display: flex;
  align-items: center;
}

.addr-label-text {
  font-size: 12px;
  color: #606266;
  margin-height: 5px;
}

.addr-input-row {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 0;
}

.ip-label-row {
  margin-top: 1px;
  margin-bottom: 1px;
}

.ip-label-text {
  font-size: 12px;
  color: #606266;
}

.ip-input {
  flex: 1;
}

.ip-env-label-row {
  margin-top: 0;
}

.ip-label-text,
.env-label-text {
  font-size: 12px;
  color: #606266;
}

.ip-env-input-row {
  margin-top: 0;
}

.ip-env-section {
  margin-top: 0;
}

.ip-section {
  margin-top: 2px;
}

.copy-icon {
  font-size: 14px;
  color: #1890ff;
  cursor: pointer;
  margin-left: 8px;
}

.method-select {
  width: 80px;
  margin-right: 2px;
}

.url-input {
  width: 100%;
}

.headers-label {
  margin-bottom: 4px;
  font-size: 12px;
  color: #606266;
}

.headers-add-box {
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  padding: 8px 0;
  text-align: center;
  cursor: pointer;
  color: #606266;
}

.headers-add-plus {
  margin-right: 4px;
}

.headers-op-icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.op-icon {
  cursor: pointer;
}

.op-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.body-label-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #606266;
}

.body-label-text {
  flex-shrink: 0;
}

.body-label-right {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.format-link {
  font-size: 12px;
  color: #409eff;
  text-decoration: none;
  cursor: pointer;
}

.body-textarea :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
  white-space: pre;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
