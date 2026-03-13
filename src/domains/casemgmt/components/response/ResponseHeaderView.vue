<script setup lang="ts">
import { computed } from 'vue'

interface HeaderRow {
  key: string
  value: string
}

const props = defineProps<{
  modelValue: HeaderRow[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: HeaderRow[]): void
}>()

const tableData = computed({
  get: () => props.modelValue || [],
  set: (v: HeaderRow[]) => emit('update:modelValue', v),
})
</script>

<template>
  <div class="response-header-view">
    <el-table
      :data="tableData"
      :border="false"
      size="small"
      style="width: 100%"
    >
      <el-table-column prop="key" label="Header" min-width="160" />
      <el-table-column prop="value" label="值" min-width="260" />
    </el-table>
  </div>
</template>

<style scoped>
.response-header-view {
  width: 100%;
}

.response-header-view :deep(.el-table__inner-wrapper) {
  box-shadow: none;
}

.response-header-view :deep(.el-table__cell) {
  border-bottom: none;
}
</style>

