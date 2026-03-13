<template>
  <div class="body-urlencoded">
    <urlencoded-table v-model="model" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import UrlencodedTable from '../form/UrlencodedTable.vue'

defineOptions({ name: 'BodyUrlencoded' })

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
.body-urlencoded {
  width: 100%;
}
</style>
