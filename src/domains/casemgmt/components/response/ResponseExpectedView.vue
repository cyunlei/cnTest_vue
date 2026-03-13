<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const value = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v),
})
</script>

<template>
  <div class="response-expected-view">
    <el-input
      v-model="value"
      type="textarea"
      :rows="6"
      resize="none"
      placeholder=""
      readonly
      class="plain-textarea"
    />
  </div>
</template>

<style scoped>
.response-expected-view {
  width: 100%;
}

.plain-textarea :deep(.el-textarea__inner) {
  border: none;
  box-shadow: none;
  background-color: transparent;
  padding-left: 0;
  padding-right: 0;
}
</style>

