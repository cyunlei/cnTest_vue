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
    <pre class="expected-text">{{ value || '' }}</pre>
  </div>
</template>

<style scoped>
.response-expected-view {
  width: 100%;
  height: 100%;
  min-height: 180px;
  padding: 8px 10px;
  box-sizing: border-box;
  overflow: hidden;
}

.expected-text {
  margin: 0;
  width: 100%;
  height: 100%;
  color: #0b4fb3;
  font-size: 12px;
  line-height: 1.6;
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
}
</style>

