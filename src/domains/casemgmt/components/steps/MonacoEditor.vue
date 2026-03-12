<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps<{
  modelValue: string
  language: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'validate', errors: string[]): void
}>()

const containerRef = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

onMounted(() => {
  if (!containerRef.value) return

  editor = monaco.editor.create(containerRef.value, {
    value: props.modelValue || '',
    language: props.language,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 13,
    lineHeight: 20,
    contextmenu: false,
  })

  // 默认聚焦到第一行
  editor.focus()
  const model = editor.getModel()
  if (model) {
    editor.setPosition({ lineNumber: 1, column: 1 })
  }

  editor.onDidChangeModelContent(() => {
    if (!editor) return
    const value = editor.getValue()
    emit('update:modelValue', value)

    const currentModel = editor.getModel()
    if (currentModel && props.language === 'javascript') {
      const markers = monaco.editor.getModelMarkers({ resource: currentModel.uri })
      const errors = markers.map(
        (m) => `第 ${m.startLineNumber} 行：${m.message}`,
      )
      emit('validate', errors)
    } else {
      // 其他语言暂时只做高亮，不做深度校验
      emit('validate', [])
    }
  })
})

watch(
  () => props.modelValue,
  (val) => {
    if (editor && editor.getValue() !== val) {
      editor.setValue(val || '')
    }
  },
)

watch(
  () => props.language,
  (lang) => {
    if (!editor) return
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, lang)
    }
  },
)

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
})
</script>

<template>
  <div ref="containerRef" class="monaco-editor-container" />
</template>

<style scoped>
.monaco-editor-container {
  width: 100%;
  /* 约 10 行高度（行高 20px 左右） */
  height: 220px;
}
</style>

