<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: any): void
}>()

const internalVisible = ref(props.visible)

watch(
  () => props.visible,
  (v) => {
    internalVisible.value = v
  }
)

watch(internalVisible, (v) => {
  if (!v) {
    emit('close')
  }
})

const handleSave = () => {
  emit('save', {})
}
</script>

<template>
  <el-drawer
    v-model="internalVisible"
    title="DUCC 步骤"
    size="70%"
    :destroy-on-close="true"
    :close-on-click-modal="true"
    direction="rtl"
  >
    <div class="step-drawer-placeholder">
      <p>这里是 DUCC 步骤配置区域（待实现）</p>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
  </el-drawer>
</template>

<style scoped>
.step-drawer-placeholder {
  padding: 16px;
}
</style>

