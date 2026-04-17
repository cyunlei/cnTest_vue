<script setup>
/**
 * HTTP 方法选择器 - 高保真还原截图7
 */
const props = defineProps({
  modelValue: { type: String, default: 'GET' }
})
const emit = defineEmits(['update:modelValue'])

const options = [
  { label: 'GET', value: 'GET', color: '#52c41a' },
  { label: 'POST', value: 'POST', color: '#faad14' },
  { label: 'PUT', value: 'PUT', color: '#722ed1' },
  { label: 'PATCH', value: 'PATCH', color: '#a0522d' },
  { label: 'DELETE', value: 'DELETE', color: '#f5222d' }
]

function handleChange(val) {
  emit('update:modelValue', val)
}
</script>

<template>
  <el-select
    :model-value="props.modelValue"
    class="method-select"
    popper-class="method-select-dropdown"
    @change="handleChange"
  >
    <el-option
      v-for="opt in options"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
      :class="`method-option method-option--${opt.value}`"
    >
      <span :style="{ color: opt.color }">{{ opt.label }}</span>
    </el-option>
    <template #prefix>
      <span
        class="method-prefix"
        :style="{ color: options.find(o => o.value === props.modelValue)?.color || '#333' }"
      >
        {{ props.modelValue }}
      </span>
    </template>
  </el-select>
</template>

<style scoped>
.method-select {
  width: 90px !important;
  flex-shrink: 0;
}
.method-prefix {
  font-weight: 500;
  font-size: 13px;
}
:deep(.el-input__wrapper) {
  padding-left: 10px;
}
:deep(.el-input__inner) {
  opacity: 0;
  width: 0;
}
</style>

<style>
.method-select-dropdown .method-option--GET {
  color: #52c41a;
}
.method-select-dropdown .method-option--POST {
  color: #faad14;
}
.method-select-dropdown .method-option--PUT {
  color: #722ed1;
}
.method-select-dropdown .method-option--PATCH {
  color: #a0522d;
}
.method-select-dropdown .method-option--DELETE {
  color: #f5222d;
}
.method-select-dropdown .el-select-dropdown__item.selected {
  background-color: #e6f7ff;
  font-weight: 500;
}
</style>
