<script setup lang="ts">
const { showSuccess, showWarning, showError } = useMessage()
import { computed, ref, watch, nextTick } from 'vue'
import { useMessage } from '@/shared/ui'
import { EditPen, Delete, CopyDocument, ArrowDown } from '@element-plus/icons-vue'
import { testConnection } from '../../api'

const props = defineProps<{
  collapseKey?: number
  collapsed?: boolean
  index?: number
  name?: string
  config?: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'copy'): void
  (e: 'delete'): void
  (e: 'update:name', value: string): void
  (e: 'update:config', config: Record<string, any>): void
}>()

const stepName = ref(props.name || '操作步骤1')
const isCollapsed = ref(false)
const isEditingName = ref(false)
const nameInputRef = ref()

const readMethods = [
  'get',
  'hget',
  'hgetall',
  'lindex',
  'llen',
  'scard',
  'sismember',
  'smembers',
  'zrange',
  'lrange'
]
const writeMethods = [
  'set',
  'del',
  'sadd',
  'zadd',
  'hset',
  'hmset',
  'hdel',
  'lpush',
  'rpush',
  'lpop',
  'rpop',
  'lset',
  'lrem',
  'ltrim',
  'rpoplpush',
  'linsert',
  'lpushx',
  'rpushx',
  'flushdb'
]

// 解析批量 key（按行分割）
const parseBatchKeys = (val: string): string[] => {
  if (!val) return []
  return val.split(/\n/)
    .map(k => k.trim())
    .filter(k => k.length > 0)
}

// Redis 表单相关
const redisUrl = ref(props.config?.redisUrl || '')
const accessMode = ref<'key' | 'batch'>(props.config?.accessMode || 'key')
// 访问方式：读操作 / 写操作，全部使用小写
const requestMethod = ref(props.config?.requestMethod || 'get')
const singleKey = ref(props.config?.singleKey || '')
const singleValue = ref(props.config?.singleValue || '')
const batchKeys = ref(props.config?.batchKeys || '')
const resultVar = ref(props.config?.resultVariable || '')

const redisUrlError = ref('')
const redisUrlInvalid = ref(false)
const keyError = ref('')
const keyInvalid = ref(false)
const testingConnection = ref(false)

const isEmptyLike = (val: string) => {
  return !val || /^[\s\u3000]*$/.test(val)
}

watch(
  () => props.collapseKey,
  () => {
    if (props.collapsed !== undefined) {
      isCollapsed.value = props.collapsed
    }
  }
)

watch(
  () => props.name,
  (val) => {
    if (typeof val === 'string') {
      stepName.value = val
    }
  }
)

const displayIndex = computed(() => props.index ?? 1)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const startEditName = () => {
  isEditingName.value = true
  nextTick(() => {
    if (nameInputRef.value && typeof nameInputRef.value.focus === 'function') {
      nameInputRef.value.focus()
    }
  })
}

const handleNameInput = (val: string) => {
  stepName.value = val
  emit('update:name', val)
}

const finishEditName = () => {
  const value = stepName.value.trim()
  if (!value) {
    const fallback = `操作步骤${displayIndex.value}`
    stepName.value = fallback
    emit('update:name', fallback)
  } else {
    emit('update:name', value)
  }
  isEditingName.value = false
}

const validateRedisUrl = () => {
  const value = redisUrl.value
  if (isEmptyLike(value)) {
    redisUrlError.value = 'Redis 地址为必填项'
    redisUrlInvalid.value = true
    return
  }
  redisUrlError.value = ''
  redisUrlInvalid.value = false
}

const validateKey = () => {
  const value = accessMode.value === 'key' ? singleKey.value : batchKeys.value
  if (isEmptyLike(value)) {
    keyError.value = accessMode.value === 'key' ? 'key 为必填项' : '批量 key 内容为必填项'
    keyInvalid.value = true
    return
  }
  keyError.value = ''
  keyInvalid.value = false
}

const canShowConnectionTest = computed(() => !isEmptyLike(redisUrl.value))

const buildRedisKeyOperations = () => {
  if (accessMode.value === 'key') {
    return [{
      access_type: requestMethod.value,
      key: singleKey.value,
      value: singleValue.value
    }]
  }
  return parseBatchKeys(batchKeys.value).map((k) => ({
    access_type: requestMethod.value,
    key: k,
    value: ''
  }))
}

const handleTestConnection = async () => {
  if (!canShowConnectionTest.value || testingConnection.value) return
  testingConnection.value = true
  try {
    const resp = await testConnection({
      type: 'redis',
      redis_url: redisUrl.value.trim()
    })
    const body = resp?.data || {}
    const msg = body?.msg || '连接测试完成'
    const connected = body?.data?.connected === true
    if (connected || Number(body?.code) === 200) {
      ElMessage.success(msg)
      return
    }
    ElMessage.error(msg)
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error?.message || '连接测试失败'
    ElMessage.error(msg)
  } finally {
    testingConnection.value = false
  }
}

// 监听 config 变化回填
watch(() => props.config, (config) => {
  if (config) {
    redisUrl.value = config.redisUrl || ''
    accessMode.value = config.accessMode || 'key'
    requestMethod.value = config.requestMethod || 'get'
    singleKey.value = config.singleKey || ''
    singleValue.value = config.singleValue || ''
    batchKeys.value = config.batchKeys || ''
    resultVar.value = config.resultVariable || ''
  }
}, { deep: true, immediate: true })

// 数据变化时 emit update:config
watch([redisUrl, accessMode, requestMethod, singleKey, singleValue, batchKeys, resultVar], () => {
  const keyOperations = buildRedisKeyOperations()
  emit('update:config', {
    redisUrl: redisUrl.value,
    readMode: writeMethods.includes(requestMethod.value) ? 1 : 0,
    storeResult: !!resultVar.value,
    resultVariable: resultVar.value,
    keyOperations,
    accessMode: accessMode.value,
    requestMethod: requestMethod.value,
    singleKey: singleKey.value,
    singleValue: singleValue.value,
    batchKeys: batchKeys.value
  })
}, { immediate: true })

// 暴露配置数据供父组件收集
defineExpose({
  getConfig: () => {
    const keyOperations = buildRedisKeyOperations()
    return {
      redisUrl: redisUrl.value,
      readMode: writeMethods.includes(requestMethod.value) ? 1 : 0,
      storeResult: !!resultVar.value,
      resultVariable: resultVar.value,
      keyOperations
    }
  }
})
</script>

<template>
  <div class="redis-step">
    <!-- 标题行，与 MYSQL/DUCC 一致 -->
    <div class="redis-step__header" draggable="true">
      <div class="left">
        <el-icon class="collapse-arrow" :class="{ 'is-collapsed': isCollapsed }" @click="toggleCollapse">
          <ArrowDown />
        </el-icon>
        <span class="index">{{ displayIndex }}</span>
        <span class="type-tag">REDIS</span>
        <div class="name-wrapper">
          <template v-if="!isEditingName">
            <span class="name-text">{{ stepName }}</span>
            <el-icon class="edit-icon" @click="startEditName">
              <EditPen />
            </el-icon>
          </template>
          <template v-else>
            <el-input
              v-model="stepName"
              class="name-input"
              size="small"
              ref="nameInputRef"
              @input="handleNameInput"
              @blur="finishEditName"
            />
          </template>
        </div>
      </div>
      <div class="right">
        <el-button text size="small" @click="emit('copy')">
          <el-icon><CopyDocument /></el-icon>
        </el-button>
        <el-popconfirm
          title="确定删除吗?"
          confirm-button-text="确定"
          cancel-button-text="取消"
          icon=""
          @confirm="emit('delete')"
        >
          <template #reference>
            <el-button text size="small">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <div v-show="!isCollapsed" class="redis-step__body">
      <!-- Redis 地址 -->
      <div class="redis-step__row">
        <div class="field-row">
          <div class="field-label">
            <span class="required-star">*</span>
            <span>Redis 地址</span>
          </div>
          <div class="field-input">
            <el-input
              v-model="redisUrl"
              placeholder="请输入 Redis 地址，例如：redis://host:6379/0"
              :class="{ 'is-invalid': redisUrlInvalid }"
              @blur="validateRedisUrl"
            />
          </div>
          <div v-if="canShowConnectionTest" class="connection-test-wrap">
            <el-button
              type="primary"
              size="small"
              :loading="testingConnection"
              @click="handleTestConnection"
            >
              测试连通
            </el-button>
          </div>
        </div>
        <div v-if="redisUrlError" class="field-error">{{ redisUrlError }}</div>
      </div>

      <!-- 结果变量（放在 Redis 地址下面，模式上面） -->
      <div class="redis-step__row">
        <div class="field-row">
          <div class="field-label">结果变量</div>
          <div class="field-input">
            <el-input v-model="resultVar" placeholder="请填写结果变量名" />
          </div>
        </div>
      </div>

      <!-- 模式选择：按 key / 批量添加 -->
      <div class="redis-step__row mode-row">
        <span class="label">模式：</span>
        <el-radio-group v-model="accessMode" size="small">
          <el-radio value="key">按 key 添加</el-radio>
          <el-radio value="batch">批量添加</el-radio>
        </el-radio-group>
      </div>

      <!-- 按 key 添加 -->
      <div v-if="accessMode === 'key'" class="redis-step__row">
        <div class="field-row inline-row">
          <div class="field-label">
            <span class="required-star">*</span>
            <span>请求方式</span>
          </div>
          <div class="field-input method-key-row">
            <el-select
              v-model="requestMethod"
              size="small"
              class="method-select method-select--redis"
              :class="{
                'method-select--read': readMethods.includes(requestMethod),
                'method-select--write': writeMethods.includes(requestMethod)
              }"
            >
              <el-option-group label="读操作">
                <el-option
                  v-for="m in readMethods"
                  :key="m"
                  :label="m"
                  :value="m"
                  class="redis-read-option"
                />
              </el-option-group>
              <el-option-group label="写操作">
                <el-option
                  v-for="m in writeMethods"
                  :key="m"
                  :label="m"
                  :value="m"
                  class="redis-write-option"
                />
              </el-option-group>
            </el-select>
            <el-input
              v-model="singleKey"
              placeholder="请输入 key"
              class="key-input"
              :class="{ 'is-invalid': keyInvalid }"
              @blur="validateKey"
            />
          </div>
        </div>
        <div v-if="keyError" class="field-error">{{ keyError }}</div>
      </div>

      <!-- 批量添加 -->
      <div v-else class="redis-step__row">
        <div class="field-row">
          <div class="field-label">
            <span class="required-star">*</span>
            <span>批量 key</span>
          </div>
          <div class="field-input">
            <el-input
              v-model="batchKeys"
              type="textarea"
              :rows="4"
              placeholder="一行一个 key"
              :class="{ 'is-invalid': keyInvalid }"
              @blur="validateKey"
            />
          </div>
        </div>
        <div v-if="keyError" class="field-error">{{ keyError }}</div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.redis-step {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px 16px 16px;
  background: #fff;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
}

.redis-step__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  cursor: grab;
}

.redis-step__header:active {
  cursor: grabbing;
}

.redis-step__header .left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.index {
  font-weight: 500;
  color: #303133;
}

.type-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #ecf5ff;
  color: #409eff;
  border: 1px solid #b3d8ff;
}

.name-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.name-text {
  color: #409eff;
  cursor: default;
}

.name-input {
  width: 160px;
}

.edit-icon {
  cursor: pointer;
  color: #909399;
}

.redis-step__header .right :deep(.el-button) {
  padding: 4px;
}

.collapse-arrow {
  cursor: pointer;
  transition: transform 0.2s ease;
  margin-right: 4px;
}

.collapse-arrow.is-collapsed {
  transform: rotate(-90deg);
}

.redis-step__body {
  margin-top: 8px;
}

.redis-step__row {
  margin-top: 12px;
}

.field-row {
  display: flex;
  align-items: flex-start;
}

.connection-test-wrap {
  margin-left: 12px;
  display: flex;
  justify-content: flex-end;
  min-width: 88px;
}

.field-label {
  width: 90px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
}

.required-star {
  color: #f56c6c;
}

.field-input {
  flex: 1;
}

.mode-row .label {
  margin-right: 8px;
  color: #606266;
}

.inline-row .field-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.method-select {
  width: 120px;
}

.key-input {
  flex: 1;
}

.field-error {
  margin-top: 4px;
  margin-left: 90px;
  font-size: 12px;
  color: #f56c6c;
}

.is-invalid :deep(.el-input__wrapper),
.is-invalid :deep(.el-textarea__inner) {
  border-color: #f56c6c;
}

:deep(.el-select-dropdown__item.redis-read-option) {
  color: #008000;
}

:deep(.el-select-dropdown__item.redis-write-option) {
  color: #d40000;
}

.method-select--read :deep(.el-input__inner),
.method-select--read :deep(.el-select__selected-item) {
  color: #008000;
}

.method-select--write :deep(.el-input__inner),
.method-select--write :deep(.el-select__selected-item) {
  color: #d40000;
}
</style>

