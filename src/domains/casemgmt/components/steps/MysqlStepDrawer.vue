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

// 先做纯展示组件，后续再接入 v-model 数据
const stepName = ref(props.name || '操作步骤1')
const jdbcUrl = ref(props.config?.jdbcUrl || '')
const username = ref(props.config?.username || '')
const password = ref(props.config?.password || '')
const resultVar = ref(props.config?.resultVariable || '')
const sql = ref(props.config?.sql || '')
const mode = ref<'direct' | 'file'>(props.config?.mode || 'direct')

// 监听 config 变化回填
watch(() => props.config, (config) => {
  if (config) {
    jdbcUrl.value = config.jdbcUrl || ''
    username.value = config.username || ''
    password.value = config.password || ''
    resultVar.value = config.resultVariable || ''
    sql.value = config.sql || ''
    mode.value = config.mode || 'direct'
  }
}, { deep: true })

// 数据变化时 emit update:config
watch([jdbcUrl, username, password, resultVar, sql, mode], () => {
  emit('update:config', {
    jdbcUrl: jdbcUrl.value,
    username: username.value,
    password: password.value,
    sql: sql.value,
    storeResult: !!resultVar.value,
    resultVariable: resultVar.value,
    mode: mode.value
  })
})

const jdbcError = ref('')
const sqlError = ref('')
const usernameError = ref('')
const passwordError = ref('')
const jdbcInvalid = ref(false)
const sqlInvalid = ref(false)
const usernameInvalid = ref(false)
const passwordInvalid = ref(false)
const testingConnection = ref(false)

// 折叠状态（默认展开）
const isCollapsed = ref(false)
const isEditingName = ref(false)
const nameInputRef = ref()

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

const isEmptyLike = (val: string) => {
  // 处理普通空格、制表符、换行和全角空格等
  return !val || /^[\s\u3000]*$/.test(val)
}

const validateJdbc = () => {
  const value = jdbcUrl.value
  if (isEmptyLike(value)) {
    jdbcError.value = 'JDBC URL 为必填项'
    jdbcInvalid.value = true
    return
  }
  // 正常 MySQL JDBC 写法示例：
  // jdbc:mysql://host:3306/dbName?param=xxx
  const jdbcPattern = /^jdbc:mysql:\/\/[^:\/\s]+(?::\d+)?\/\S+/i
  if (!jdbcPattern.test(value)) {
    jdbcError.value = 'JDBC URL 格式不正确，应为 jdbc:mysql://ip:3306/库名'
    jdbcInvalid.value = true
    return
  }
  jdbcError.value = ''
  jdbcInvalid.value = false
}

const validateSql = () => {
  const value = sql.value
  if (isEmptyLike(value)) {
    sqlError.value = 'SQL 为必填项'
    sqlInvalid.value = true
    return
  }
  // 只做基础 SQL 格式校验：以常见关键字开头，并且后面至少还有内容
  const sqlPattern = /^(select|update|insert|delete|replace|merge)\s+[\s\S]+/i
  if (!sqlPattern.test(value)) {
    sqlError.value = 'SQL 格式不正确，请输入完整的 SQL 语句'
    sqlInvalid.value = true
    return
  }
  sqlError.value = ''
  sqlInvalid.value = false
}

const validateUsername = () => {
  const value = username.value
  if (isEmptyLike(value)) {
    usernameError.value = '用户名为必填项'
    usernameInvalid.value = true
    return
  }
  usernameError.value = ''
  usernameInvalid.value = false
}

const validatePassword = () => {
  const value = password.value
  if (isEmptyLike(value)) {
    passwordError.value = '密码为必填项'
    passwordInvalid.value = true
    return
  }
  passwordError.value = ''
  passwordInvalid.value = false
}

const canShowConnectionTest = computed(() => {
  return !isEmptyLike(jdbcUrl.value) && !isEmptyLike(username.value) && !isEmptyLike(password.value)
})

const handleTestConnection = async () => {
  if (!canShowConnectionTest.value || testingConnection.value) return
  testingConnection.value = true
  try {
    const resp = await testConnection({
      type: 'mysql',
      jdbc_url: jdbcUrl.value.trim(),
      username: username.value.trim(),
      password: password.value
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

// 暴露配置数据供父组件收集
defineExpose({
  getConfig: () => ({
    jdbcUrl: jdbcUrl.value,
    username: username.value,
    password: password.value,
    sql: sql.value,
    storeResult: !!resultVar.value,
    resultVariable: resultVar.value
  })
})
</script>

<template>
  <div class="mysql-step">
    <!-- 标题行 -->
    <div class="mysql-step__header" draggable="true">
      <div class="left">
        <el-icon class="collapse-arrow" :class="{ 'is-collapsed': isCollapsed }" @click="toggleCollapse">
          <ArrowDown />
        </el-icon>
        <span class="index">{{ displayIndex }}</span>
        <span class="type-tag">MYSQL</span>
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

    <div class="collapse-wrapper" :class="{ 'is-collapsed': isCollapsed }">
      <div class="collapse-inner">
      <!-- 连接方式 -->
      <div class="mysql-step__row mode-row">
        <span class="label">连接方式：</span>
        <el-radio-group v-model="mode" size="small">
          <el-radio value="direct">直接写库</el-radio>
          <el-radio value="file">从开关文件获取</el-radio>
        </el-radio-group>
      </div>

      <!-- JDBC / 用户名 / 密码（横排） -->
      <div class="mysql-step__row">
        <el-form label-position="top" class="mysql-form jdbc-row">
          <el-row :gutter="12">
            <el-col :span="canShowConnectionTest ? 10 : 12">
            <el-form-item>
              <template #label>
                <span class="required-star">*</span>JDBC URL
              </template>
                <el-input
                  v-model="jdbcUrl"
                :class="{ 'is-invalid': jdbcInvalid }"
                  placeholder="请输入JDBC URL，格式为jdbc:mysql://ip:3306/库名"
                @blur="validateJdbc"
                />
              <div v-if="jdbcError" class="field-error">{{ jdbcError }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="canShowConnectionTest ? 5 : 6">
              <el-form-item>
                <template #label>
                  <span class="required-star">*</span>用户名
                </template>
                <el-input
                  v-model="username"
                  :class="{ 'is-invalid': usernameInvalid }"
                  placeholder="请输入用户名"
                  @blur="validateUsername"
                />
                <div v-if="usernameError" class="field-error">{{ usernameError }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="canShowConnectionTest ? 5 : 6">
              <el-form-item>
                <template #label>
                  <span class="required-star">*</span>密码
                </template>
                <el-input
                  v-model="password"
                  type="password"
                  show-password
                  placeholder="请输入密码"
                  :class="{ 'is-invalid': passwordInvalid }"
                  @blur="validatePassword"
                />
                <div v-if="passwordError" class="field-error">{{ passwordError }}</div>
              </el-form-item>
            </el-col>
            <el-col v-if="canShowConnectionTest" :span="4" class="connection-test-col">
              <el-form-item label=" ">
                <div class="connection-test-btn-wrap">
                  <el-button
                    type="primary"
                    size="small"
                    :loading="testingConnection"
                    @click="handleTestConnection"
                  >
                    测试连通
                  </el-button>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 结果变量 -->
      <div class="mysql-step__row">
        <el-form label-position="top" class="mysql-form">
          <el-form-item label="结果变量">
            <el-input v-model="resultVar" placeholder="请填写结果变量名" />
          </el-form-item>
        </el-form>
      </div>

      <!-- SQL -->
      <div class="mysql-step__row">
        <el-form label-position="top" class="mysql-form">
          <el-form-item>
            <template #label>
              <span class="required-star">*</span>SQL
            </template>
            <el-input
              v-model="sql"
              type="textarea"
              :rows="4"
              placeholder="请输入 SQL 语句"
              :class="{ 'is-invalid': sqlInvalid }"
              @blur="validateSql"
            />
            <div v-if="sqlError" class="field-error">{{ sqlError }}</div>
          </el-form-item>
        </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mysql-step {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px 16px 16px;
  background: #fff;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
}

.mysql-step__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  cursor: grab;
}

.mysql-step__header:active {
  cursor: grabbing;
}

.mysql-step__header .left {
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

.name-input {
  width: 160px;
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

.edit-icon {
  cursor: pointer;
  color: #909399;
}

.mysql-step__header .right :deep(.el-button) {
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

.mysql-step__row {
  margin-top: 8px;
}

.mode-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  color: #606266;
}

.mysql-form {
  width: 100%;
}

.mysql-form :deep(.el-form-item) {
  margin-bottom: 8px;
}

.jdbc-row :deep(.el-form-item) {
  margin-bottom: 0;
}

.connection-test-col :deep(.el-form-item__label) {
  color: transparent;
  user-select: none;
}

.connection-test-btn-wrap {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.required-star {
  color: #f56c6c;
  margin-right: 4px;
}

.field-error {
  margin-top: 2px;
  font-size: 12px;
  color: #f56c6c;
}

.mysql-form :deep(.el-input.is-invalid .el-input__wrapper),
.mysql-form :deep(.el-textarea.is-invalid .el-textarea__inner) {
  border-color: #f56c6c;
}
</style>

