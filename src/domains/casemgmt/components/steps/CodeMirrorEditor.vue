<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, basicSetup } from 'codemirror'
import { python } from '@codemirror/lang-python'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'validate', errors: string[]): void
}>()

const host = ref<HTMLElement | null>(null)
let view: EditorView | null = null

onMounted(() => {
  if (!host.value) return

  const state = EditorState.create({
    doc: props.modelValue || '',
    extensions: [
      basicSetup,
      python(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const value = update.state.doc.toString()
          emit('update:modelValue', value)

          const errors: string[] = []
          if (!value.trim()) {
            errors.push('脚本不能为空')
          }
          emit('validate', errors)
        }
      }),
    ],
  })

  view = new EditorView({
    state,
    parent: host.value,
  })

  // 默认聚焦到第一行
  view.focus()
})

watch(
  () => props.modelValue,
  (val) => {
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== val) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: val || '' },
      })
    }
  },
)

onBeforeUnmount(() => {
  if (view) {
    view.destroy()
    view = null
  }
})
</script>

<template>
  <div ref="host" class="cm-editor-container" />
</template>

<style scoped>
.cm-editor-container {
  width: 100%;
  /* 约 10 行高度 */
  height: 220px;
}
</style>

