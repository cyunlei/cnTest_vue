<template>
  <div class="body-binary">
    <div
      ref="triggerRef"
      class="binary-trigger"
      tabindex="0"
      role="button"
      @focus="openDropdown"
      @click="openDropdown"
    >
      <template v-if="fileInfo">
        <span class="tag">
          <span class="warn">⚠</span>
          <span
            class="name"
            :title="`${fileInfo.name}（${formatBytes(fileInfo.size)}）`"
          >
            {{ fileInfo.name }}
          </span>
          <button class="close" type="button" @click.stop="clearFile">×</button>
        </span>
      </template>
      <template v-else>
        <span class="placeholder">选择文件</span>
      </template>
    </div>

    <teleport to="body">
      <div
        ref="dropdownRef"
        class="binary-dropdown"
        v-show="dropdownVisible"
        @mousedown.stop
      >
        <div class="binary-dropdown-item" @click="triggerSelectFile">
          <span class="plus">＋</span>
          <span>上传本地的二进制文件</span>
        </div>
        <input
          ref="fileInputRef"
          class="file-input-hidden"
          type="file"
          @change="onFileSelected"
        />
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineOptions({ name: 'BodyBinary' })

const props = defineProps({
  modelValue: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue'])

const triggerRef = ref(null)
const dropdownRef = ref(null)
const fileInputRef = ref(null)
const dropdownVisible = ref(false)

const fileInfo = computed(() => {
  if (!props.modelValue) return null
  return {
    name: props.modelValue.name,
    size: props.modelValue.size,
    type: props.modelValue.type
  }
})

const formatBytes = (bytes) => {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n < 0) return ''
  if (n === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)))
  const v = n / Math.pow(1024, i)
  const fixed = i === 0 ? 0 : v < 10 ? 2 : v < 100 ? 1 : 0
  return `${v.toFixed(fixed)} ${units[i]}`
}

const openDropdown = () => {
  dropdownVisible.value = true
  nextTick(() => positionDropdown())
}

const closeDropdown = (e) => {
  if (!dropdownVisible.value) return
  const t = e?.target
  const drop = dropdownRef.value
  const trig = triggerRef.value
  if (drop && drop.contains(t)) return
  if (trig && trig.contains(t)) return
  dropdownVisible.value = false
}

const positionDropdown = () => {
  const trig = triggerRef.value
  const drop = dropdownRef.value
  if (!trig || !drop) return
  const rect = trig.getBoundingClientRect()
  drop.style.position = 'fixed'
  drop.style.left = `${rect.left}px`
  drop.style.top = `${rect.bottom + 6}px`
  drop.style.width = `${rect.width}px`
  drop.style.zIndex = '9999'
}

const triggerSelectFile = () => {
  fileInputRef.value?.click?.()
}

const arrayBufferToBase64 = (buffer) => {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

const onFileSelected = async (e) => {
  const input = e.target
  const file = input.files && input.files[0] ? input.files[0] : null
  if (!file) return

  // 只允许 1 个文件：直接替换
  const buffer = await file.arrayBuffer()
  const base64 = arrayBufferToBase64(buffer)
  emit('update:modelValue', {
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    encoding: 'base64',
    data: base64
  })

  input.value = ''
  dropdownVisible.value = false
}

const clearFile = () => {
  emit('update:modelValue', null)
}

watch(
  () => props.modelValue,
  () => {
    if (dropdownVisible.value) nextTick(() => positionDropdown())
  },
  { deep: true }
)

onMounted(() => {
  document.addEventListener('mousedown', closeDropdown, true)
  window.addEventListener('resize', positionDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', closeDropdown, true)
  window.removeEventListener('resize', positionDropdown)
})
</script>

<style scoped>
.body-binary {
  padding: 16px;
}

.binary-trigger {
  width: 240px;
  height: 28px;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border: 1px solid #d4d4d4;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  box-sizing: border-box;
  outline: none;
}

.binary-trigger:focus {
  border-color: #007cbf;
  box-shadow: 0 0 0 1px rgba(0, 124, 191, 0.15);
}

.placeholder {
  color: #999;
  font-size: 13px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 6px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 11px;
  max-width: 100%;
}

.warn {
  color: #f5a623;
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}

.close {
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
  padding: 0 2px;
  line-height: 1;
}

.binary-dropdown {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  padding: 8px 0;
  box-sizing: border-box;
}

.binary-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 12px;
}

.binary-dropdown-item:hover {
  background: #f5f5f5;
}

.plus {
  font-size: 18px;
}

.file-input-hidden {
  display: none;
}
</style>
