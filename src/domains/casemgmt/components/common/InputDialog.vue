<script setup>
/**
 * 通用输入对话框组件 - 只封装输入步骤
 * 输入 → 解析 → 触发事件（外部处理结果展示）
 *
 * Props:
 * - title: 弹窗标题
 * - placeholder: 输入框占位符
 * - actionButtonText: 操作按钮文字（如"解析"、"生成"）
 * - parseFunction: 解析函数，接收输入内容，返回参数数组
 * - persistedContent: 持久化的输入内容
 */
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '输入'
  },
  placeholder: {
    type: String,
    default: '请输入内容'
  },
  actionButtonText: {
    type: String,
    default: '解析'
  },
  // 外部传入的解析函数
  parseFunction: {
    type: Function,
    required: true
  },
  // 持久化的输入内容
  persistedContent: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'parse', 'close', 'update:persistedContent'])

// 输入内容
const content = ref('')

// 解析错误信息
const parseError = ref('')

// 检测内容是否是有效的 JSON
const isValidJson = computed(() => {
  const text = content.value.trim()
  if (!text) return false
  try {
    JSON.parse(text)
    return true
  } catch (e) {
    return false
  }
})

// 格式化 JSON
function formatJson() {
  const text = content.value.trim()
  if (!text) return
  try {
    const parsed = JSON.parse(text)
    content.value = JSON.stringify(parsed, null, 2)
    parseError.value = ''
  } catch (e) {
    parseError.value = 'JSON 格式错误，无法格式化'
  }
}

// 监听弹窗打开
watch(() => props.modelValue, (val) => {
  if (val) {
    // 恢复持久化的输入内容
    content.value = props.persistedContent
    parseError.value = ''
  }
})

// 关闭弹窗
function closeDialog() {
  // 保存输入内容
  emit('update:persistedContent', content.value)
  emit('update:modelValue', false)
  emit('close')
}

// 解析内容
async function handleParse() {
  parseError.value = ''
  
  const inputContent = content.value.trim()
  if (!inputContent) {
    parseError.value = '请输入内容'
    return
  }
  
  try {
    // 调用外部传入的解析函数
    const result = await props.parseFunction(inputContent)
    
    if (!result || result.length === 0) {
      parseError.value = '未识别到有效参数'
      return
    }
    
    // 保存输入内容
    emit('update:persistedContent', content.value)
    
    // 关闭输入弹窗，发送解析结果
    emit('update:modelValue', false)
    emit('parse', result)
  } catch (e) {
    parseError.value = e.message || '解析失败'
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="title"
    width="600px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="closeDialog"
  >
    <div class="input-content">
      <el-alert
        v-if="parseError"
        :title="parseError"
        type="error"
        :closable="false"
        show-icon
        class="parse-error-alert"
      />
      
      <el-input
        v-model="content"
        type="textarea"
        :rows="10"
        :placeholder="placeholder"
        resize="none"
      />
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <div class="dialog-left">
          <el-button @click="handleParse" :disabled="!content.trim()">
            {{ actionButtonText }}
          </el-button>
          <el-button
            v-if="isValidJson"
            @click="formatJson"
            type="info"
            plain
          >
            格式化
          </el-button>
        </div>
        <div class="dialog-right">
          <el-button @click="closeDialog">取消</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.input-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.parse-error-alert {
  margin: 0;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-left {
  display: flex;
  gap: 12px;
}

.dialog-right {
  display: flex;
  gap: 12px;
}
</style>
