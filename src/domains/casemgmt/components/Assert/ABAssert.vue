<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ArrowDown, EditPen, Delete, CopyDocument } from '@element-plus/icons-vue'

const props = defineProps<{
  index?: number
  name?: string
}>()

const emit = defineEmits<{
  (e: 'copy'): void
  (e: 'delete'): void
  (e: 'update:name', value: string): void
}>()

const stepName = ref(props.name || 'A/B断言')
const isCollapsed = ref(false)
const isEditingName = ref(false)
const nameInputRef = ref()

const leftExpr = ref('')
const rightExpr = ref('')
const remark = ref('')

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
  const fallback = `断言步骤${displayIndex.value}`
  const finalVal = value || fallback
  stepName.value = finalVal
  emit('update:name', finalVal)
  isEditingName.value = false
}
</script>

<template>
  <div class="assert-card">
    <div class="assert-card__header">
      <div class="left">
        <el-icon class="collapse-arrow" :class="{ 'is-collapsed': isCollapsed }" @click="toggleCollapse">
          <ArrowDown />
        </el-icon>
        <span class="index">{{ displayIndex }}</span>
        <span class="type-tag">A/B断言</span>
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
      <div class="collapse-inner assert-card__body">
      <el-form label-position="top" class="assert-form">
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="A 侧表达式">
              <el-input
                v-model="leftExpr"
                size="small"
                placeholder="例如：$.code 或 $.data.list[0].id"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="B 侧表达式">
              <el-input
                v-model="rightExpr"
                size="small"
                placeholder="例如：$.code 或 $.data.list[0].id"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="备注">
              <el-input
                v-model="remark"
                size="small"
                placeholder="可填写本条断言说明"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
  </div>
</template>

<style scoped>
.assert-card {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px 16px 16px;
  background: #fff;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
}

.assert-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.assert-card__header .left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collapse-arrow {
  cursor: pointer;
  transition: transform 0.2s;
}

.collapse-arrow.is-collapsed {
  transform: rotate(-90deg);
}

.index {
  font-weight: 500;
  color: #303133;
}

.type-tag {
  padding: 0 6px;
  font-size: 12px;
  color: #409eff;
  background: #ecf5ff;
  border-radius: 2px;
}

.name-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.name-text {
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edit-icon {
  cursor: pointer;
  color: #909399;
}

.assert-card__body {
  margin-top: 4px;
}

.assert-form {
  width: 100%;
}
</style>

