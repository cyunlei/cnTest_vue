<script setup lang="ts">
const { showSuccess, showWarning, showError } = useMessage()
import { computed } from 'vue'
import { useMessage } from '@/shared/ui'

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function highlightJson(json: string): string {
  const escaped = escapeHtml(json)
  return escaped.replace(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number'
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key'
        } else {
          cls = 'json-string'
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean'
      } else if (/null/.test(match)) {
        cls = 'json-null'
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
}

const highlighted = computed(() => {
  if (!value.value) return ''
  try {
    const parsed = JSON.parse(value.value)
    const formatted = JSON.stringify(parsed, null, 4)
    return highlightJson(formatted)
  } catch {
    return escapeHtml(value.value)
  }
})

const handleCopy = async () => {
  if (!value.value) return
  try {
    await navigator.clipboard.writeText(value.value)
    ElMessage.success('响应体已复制')
  } catch {
    ElMessage.error('复制失败，请稍后重试')
  }
}
</script>

<template>
  <div class="response-body-view">
    <div class="toolbar">
      <div class="actions">
        <svg
          class="copy-icon"
          viewBox="0 0 16 16"
          @click="handleCopy"
        >
          <path
            d="M5 2.5A1.5 1.5 0 0 1 6.5 1h6A1.5 1.5 0 0 1 14 2.5v6A1.5 1.5 0 0 1 12.5 10h-6A1.5 1.5 0 0 1 5 8.5v-6Z"
          />
          <path
            d="M3.5 4A1.5 1.5 0 0 0 2 5.5v7A1.5 1.5 0 0 0 3.5 14h7A1.5 1.5 0 0 0 12 12.5V12H6.5A2.5 2.5 0 0 1 4 9.5V4h-.5Z"
          />
        </svg>
      </div>
    </div>
    <pre class="json-pre" v-html="highlighted"></pre>
  </div>
</template>

<style scoped>
.response-body-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.actions {
  display: inline-flex;
  align-items: center;
}

.copy-icon {
  width: 14px;
  height: 14px;
  fill: #1890ff;
  cursor: pointer;
}

.copy-icon:hover {
  fill: #40a9ff;
}

.json-pre {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
}

.json-key {
  color: #881391;
}

.json-string {
  color: #268bd2;
}

.json-number {
  color: #2aa198;
}

.json-boolean {
  color: #b58900;
}

.json-null {
  color: #999999;
}
</style>

