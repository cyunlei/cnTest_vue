<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, shallowRef } from 'vue'
// 按需导入 Monaco Editor 核心和所需语言
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution'
import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution'

const props = defineProps<{
  modelValue: string
  language: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'validate', errors: string[]): void
}>()

const containerRef = ref<HTMLElement | null>(null)
// 使用 shallowRef 优化大型对象
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)

onMounted(() => {
  if (!containerRef.value) return

  editor.value = monaco.editor.create(containerRef.value, {
    value: props.modelValue || '',
    language: props.language,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 13,
    lineHeight: 20,
    contextmenu: false,
  })

  // 默认聚焦到第一行
  editor.value?.focus()
  const model = editor.value?.getModel()
  if (model) {
    editor.value?.setPosition({ lineNumber: 1, column: 1 })
  }

  editor.value?.onDidChangeModelContent(() => {
    if (!editor.value) return
    const value = editor.value.getValue()
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
    if (editor.value && editor.value.getValue() !== val) {
      editor.value.setValue(val || '')
    }
  },
)

watch(
  () => props.language,
  (lang) => {
    if (!editor.value) return
    const model = editor.value.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, lang)
    }
  },
)

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.dispose()
    editor.value = null
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

