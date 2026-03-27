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

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const highlightedHtml = computed(() => {
  const raw = String(value.value || '')
  const escaped = escapeHtml(raw)
  return escaped
    .replace(/("(?:\\.|[^"\\])*")(\s*:)?/g, (_m, p1, p2) => {
      if (p2) return `<span class="json-key">${p1}</span>${p2}`
      return `<span class="json-string">${p1}</span>`
    })
    .replace(/\b(true|false|null)\b/g, '<span class="json-bool">$1</span>')
    .replace(/\b-?\d+(?:\.\d+)?\b/g, '<span class="json-number">$&</span>')
})
</script>

<template>
  <div class="response-actual-input-view">
    <pre class="actual-highlight" v-html="highlightedHtml" />
  </div>
</template>

<style scoped>
.response-actual-input-view {
  width: 100%;
  height: 100%;
  min-height: 180px;
  padding: 8px 10px;
  box-sizing: border-box;
  overflow: hidden;
}

.actual-highlight {
  margin: 0;
  width: 100%;
  height: 100%;
  font-size: 12px;
  line-height: 1.6;
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  white-space: pre-wrap;
  word-break: break-word;
  color: #2b2f36;
  overflow: hidden;
}

.actual-highlight :deep(.json-key) {
  color: #1f4f9f;
}

.actual-highlight :deep(.json-string) {
  color: #096dd9;
}

.actual-highlight :deep(.json-number) {
  color: #cf1322;
}

.actual-highlight :deep(.json-bool) {
  color: #389e0d;
}
</style>

