<script setup>
import { computed } from 'vue'

/**
 * Body - raw 组件
 */
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  contentType: {
    type: String,
    default: 'json'
  }
})

const emit = defineEmits(['update:modelValue', 'format'])

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 格式化按钮点击
const handleFormat = () => {
  emit('format')
}
</script>

<template>
  <div class="body-raw">
    <div class="raw-toolbar">
      <span></span>
      <span class="format-btn" @click="handleFormat">格式化</span>
    </div>
    <el-input
      v-model="value"
      type="textarea"
      :rows="10"
      placeholder="请输入原始请求体内容"
    />
  </div>
</template>

<style scoped>
.body-raw {
  width: 100%;
  margin: 0;
  padding: 0;
}

.raw-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  margin: 0 0 4px 0;
}

.format-btn {
  color: #409eff;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  line-height: 1.5;
}

.format-btn:hover {
  color: #66b1ff;
}

.body-raw :deep(.el-textarea) {
  margin: 0;
}

.body-raw :deep(.el-textarea__inner) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  margin: 0;
  padding: 5px;
  border-radius: 4px;
}
</style>
