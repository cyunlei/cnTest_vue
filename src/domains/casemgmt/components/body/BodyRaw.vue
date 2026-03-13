<template>
  <div class="body-raw">
    <raw-content
      ref="rawContentRef"
      :content-type="contentType"
      :model-value="modelValue"
      @input="(v) => $emit('update:modelValue', v)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RawContent from '../common/RawContent.vue'

defineOptions({ name: 'BodyRaw' })

defineProps({
  modelValue: { type: String, default: '' },
  contentType: { type: String, default: 'JSON' }
})

defineEmits(['update:modelValue'])

const rawContentRef = ref(null)

defineExpose({
  formatContent() {
    return rawContentRef.value?.formatContent()
  }
})
</script>

<style scoped>
.body-raw {
  padding: 0;
}
</style>
