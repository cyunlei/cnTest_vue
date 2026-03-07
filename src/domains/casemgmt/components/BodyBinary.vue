<script setup>
import { Plus } from '@element-plus/icons-vue'

/**
 * Body - binary 组件
 */
const props = defineProps({
  file: {
    type: Object,
    default: null
  },
  fileName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:file', 'update:fileName'])

function handleChange(file) {
  emit('update:file', file.raw)
  emit('update:fileName', file.name)
}

function clearFile() {
  emit('update:file', null)
  emit('update:fileName', '')
}
</script>

<template>
  <div class="body-binary">
    <el-upload
      drag
      action="#"
      :auto-upload="false"
      :on-change="handleChange"
      :limit="1"
      class="binary-uploader"
    >
      <el-icon class="el-icon--upload"><Plus /></el-icon>
      <div class="el-upload__text">
        拖拽文件到此处或 <em>点击上传</em>
      </div>
    </el-upload>
    <div v-if="fileName" class="file-info">
      <span>已选择: {{ fileName }}</span>
      <el-button link type="danger" @click="clearFile">清除</el-button>
    </div>
  </div>
</template>

<style scoped>
.body-binary {
  width: 100%;
  margin: 0;
  padding: 0;
}

.binary-uploader :deep(.el-upload) {
  width: 100%;
}

.binary-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 180px;
}

.file-info {
  margin: 8px 0 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>