<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { EditPen, Delete, CopyDocument, ArrowDown, QuestionFilled } from '@element-plus/icons-vue'

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
  (e: 'compare'): void
  (e: 'update:config', config: Record<string, any>): void
}>()

const stepName = ref(props.name || '操作步骤1')
const duccLink = ref(props.config?.duccLink || props.config?.ducc_url || '')
const version = ref(props.config?.version || '')

const linkError = ref('')
const versionError = ref('')
const linkInvalid = ref(false)
const versionInvalid = ref(false)

const isCollapsed = ref(false)
const isEditingName = ref(false)
const nameInputRef = ref()

// 监听 config 变化回填
watch(() => props.config, (config) => {
  if (config) {
    duccLink.value = config.duccLink || config.ducc_url || ''
    version.value = config.version || ''
  }
}, { deep: true })

// 数据变化时 emit update:config（与接口扁平字段 ducc_url / version 对应，父层映射为 ducc_url）
watch([duccLink, version], () => {
  emit('update:config', {
    duccLink: duccLink.value,
    version: version.value
  })
})

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
  return !val || /^[\s\u3000]*$/.test(val)
}

const validateLink = () => {
  const value = duccLink.value
  if (isEmptyLike(value)) {
    linkError.value = 'DUCC链接为必填项'
    linkInvalid.value = true
    return
  }
  linkError.value = ''
  linkInvalid.value = false
}

const validateVersion = () => {
  const value = version.value
  if (isEmptyLike(value)) {
    versionError.value = '指定生效版本为必填项'
    versionInvalid.value = true
    return
  }
  versionError.value = ''
  versionInvalid.value = false
}

const handleParse = () => {
  validateLink()
}

const handleCompare = () => {
  validateVersion()
  if (!versionInvalid.value) {
    // 通知父组件打开历史版本对比弹窗
    emit('compare')
  }
}

// 暴露配置数据供父组件收集
defineExpose({
  getConfig: () => ({
    // DUCC 配置使用链接和版本，解析为 namespace/configId/itemId 格式
    namespace: '',
    configId: '',
    itemId: ''
  })
})
</script>

<template>
  <div class="ducc-step">
    <!-- 标题行 -->
    <div class="ducc-step__header">
      <div class="left">
        <el-icon class="collapse-arrow" :class="{ 'is-collapsed': isCollapsed }" @click="toggleCollapse">
          <ArrowDown />
        </el-icon>
        <span class="index">{{ displayIndex }}</span>
        <span class="type-tag">DUCC基本</span>
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
      <!-- DUCC 链接 -->
      <div class="ducc-step__row">
        <div class="field-row">
          <div class="field-label">
            <span class="required-star">*</span>
            <span>DUCC链接</span>
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </div>
          <div class="field-input">
            <el-input
              v-model="duccLink"
              placeholder="请输入DUCC链接，格式：ucc://$application${token}@$hostPort/v1/namespace/$namespace/config/$config/$profile"
              :class="{ 'is-invalid': linkInvalid }"
              @blur="validateLink"
            />
            <el-button size="small" class="ml-8" @click="handleParse">解析</el-button>
          </div>
          <div v-if="linkError" class="field-error">{{ linkError }}</div>
        </div>
      </div>

      <!-- 指定生效版本 -->
      <div class="ducc-step__row">
        <div class="field-row">
          <div class="field-label">
            <span class="required-star">*</span>
            <span>指定生效版本</span>
          </div>
          <div class="field-input">
            <el-select
              v-model="version"
              placeholder="请选择生效版本"
              class="version-select"
              :class="{ 'is-invalid': versionInvalid }"
              @change="validateVersion"
            >
              <!-- 后续接真实版本数据 -->
            </el-select>
            <el-button size="small" class="ml-8" @click="handleCompare">对比</el-button>
          </div>
          <div v-if="versionError" class="field-error">{{ versionError }}</div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ducc-step {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px 16px 16px;
  background: #fff;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
}

.ducc-step__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.ducc-step__header .left {
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

.ducc-step__header .right :deep(.el-button) {
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

.ducc-step__row {
  margin-top: 8px;
}

.field-row {
  display: flex;
  flex-direction: column;
}

.field-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  color: #606266;
}

.help-icon {
  font-size: 14px;
  color: #909399;
}

.field-input {
  display: flex;
  align-items: center;
}

.version-select {
  min-width: 220px;
}

.required-star {
  color: #f56c6c;
  margin-right: 2px;
}

.field-error {
  margin-top: 2px;
  font-size: 12px;
  color: #f56c6c;
}

:deep(.el-input.is-invalid .el-input__wrapper),
:deep(.el-select.is-invalid .el-input__wrapper) {
  border-color: #f56c6c;
}
</style>

