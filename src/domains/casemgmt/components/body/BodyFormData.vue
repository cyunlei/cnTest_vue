<template>
  <div class="body-form-data">
    <!-- 先完全复刻 a.html 的实现，后续再逐步接入真实数据 -->
    <postman-form-data v-model="model" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PostmanFormData from '../form/PostmanFormData.vue'

defineOptions({ name: 'BodyFormData' })

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
</script>

<style scoped>
.body-form-data {
  width: 100%;
}
</style>
