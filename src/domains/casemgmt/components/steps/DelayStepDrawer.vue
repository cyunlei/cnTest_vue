<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { EditPen, Delete, CopyDocument, ArrowDown } from '@element-plus/icons-vue'

const props = defineProps<{
  collapseKey?: number
  collapsed?: boolean
  index?: number
  name?: string
}>()

const emit = defineEmits<{
  (e: 'copy'): void
  (e: 'delete'): void
  (e: 'update:name', value: string): void
}>()

const stepName = ref(props.name || '操作步骤1')
const isCollapsed = ref(false)
const isEditingName = ref(false)
const nameInputRef = ref()

// 延迟时间（秒）
const delaySeconds = ref<number | null>(null)
const delayError = ref('')
const delayInvalid = ref(false)

watch(
  () => props.collapseKey,
  () => {
    if (props.collapsed !== undefined) {
      isCollapsed.value = props.collapsed
    }
  },
)

watch(
  () => props.name,
  (val) => {
    if (typeof val === 'string') {
      stepName.value = val
    }
  },
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

const validateDelay = () => {
  const v = delaySeconds.value
  if (v === null || Number.isNaN(v)) {
    delayError.value = '延迟时间为必填项'
    delayInvalid.value = true
    return
  }
  if (v < 0) {
    delayError.value = '延迟时间不能为负数'
    delayInvalid.value = true
    return
  }
  delayError.value = ''
  delayInvalid.value = false
}
</script>

<template>
  <div class="delay-step">
    <!-- 标题行：与其它步骤保持一致 -->
    <div class="delay-step__header">
      <div class="left">
        <el-icon class="collapse-arrow" :class="{ 'is-collapsed': isCollapsed }" @click="toggleCollapse">
          <ArrowDown />
        </el-icon>
        <span class="index">{{ displayIndex }}</span>
        <span class="type-tag">延迟时间</span>
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

    <!-- 内容区域：设置延迟时间 -->
    <div v-show="!isCollapsed" class="delay-step__body">
      <div class="delay-row">
        <div class="field-label">
          <span class="required-star">*</span>
          <span>延迟时间(s)</span>
        </div>
        <div class="field-input">
          <el-input-number
            v-model="delaySeconds"
            :min="0"
            :max="86400"
            :step="1"
            size="small"
            :controls="false"
            :class="{ 'is-invalid': delayInvalid }"
            placeholder="请输入延迟秒数"
            @blur="validateDelay"
          />
          <div v-if="delayError" class="field-error">{{ delayError }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.delay-step {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px 16px 16px;
  background: #fff;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
}

.delay-step__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.delay-step__header .left {
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
  width: 180px;
}

.edit-icon {
  cursor: pointer;
  color: #909399;
}

.delay-step__header .right :deep(.el-button) {
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

.delay-step__body {
  margin-top: 8px;
}

.delay-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.field-label {
  width: 100px;
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

.field-error {
  margin-top: 4px;
  font-size: 12px;
  color: #f56c6c;
}

.is-invalid :deep(.el-input__wrapper) {
  border-color: #f56c6c;
}
</style>
