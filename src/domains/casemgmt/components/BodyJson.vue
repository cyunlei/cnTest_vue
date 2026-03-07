<script setup>
import { computed } from 'vue'

/**
 * Body - application/json 组件
 */
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <div class="body-json">
    <el-input
      v-model="value"
      type="textarea"
      :rows="10"
      placeholder="请输入 JSON 格式请求体"
    />
  </div>
</template>

<style scoped>
.body-json {
  width: 100%;
  margin: 0;
  padding: 0;
}

.body-json :deep(.el-textarea) {
  margin: 0;
}

.body-json :deep(.el-textarea__inner) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  margin: 0;
  padding: 5px;
  border-radius: 4px;
}
</style>