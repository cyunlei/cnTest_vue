<script>
import { ref, computed, watch } from 'vue'

/**
 * 内部组件：参数选择弹窗
 * 用于展示解析结果，供用户勾选
 */
export const ParamSelectDialog = {
  name: 'ParamSelectDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    params: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: '参数选择'
    }
  },
  emits: ['update:modelValue', 'save', 'back'],
  setup(props, { emit }) {
    // 参数列表（带选中状态）
    const paramList = ref([])
    
    // 是否已经保存（防止重复触发）
    const hasSaved = ref(false)
    
    // 监听弹窗打开和参数变化
    watch(() => props.modelValue, (val) => {
      if (val && props.params.length > 0) {
        // 初始化参数列表，默认都不选中
        paramList.value = props.params.map(param => ({
          ...param,
          selected: false
        }))
        hasSaved.value = false
      }
    })
    
    // 全选
    function selectAll() {
      paramList.value.forEach(item => item.selected = true)
    }
    
    // 取消全选
    function unselectAll() {
      paramList.value.forEach(item => item.selected = false)
    }
    
    // 保存
    function handleSave() {
      const selectedParams = paramList.value
        .filter(item => item.selected)
        .map(item => ({
          key: item.key,
          value: item.value
        }))
      
      if (selectedParams.length === 0) {
        return
      }
      
      // 标记已保存
      hasSaved.value = true
      // 关闭弹窗
      emit('update:modelValue', false)
      // 发送保存事件
      emit('save', selectedParams)
    }
    
    // 返回/取消
    function handleBack() {
      // 如果已经保存，不再触发返回
      if (hasSaved.value) {
        return
      }
      emit('update:modelValue', false)
      emit('back')
    }
    
    // 选中数量
    const selectedCount = computed(() => {
      return paramList.value.filter(item => item.selected).length
    })
    
    // 是否有选中的参数
    const hasSelected = computed(() => {
      return paramList.value.some(item => item.selected)
    })
    
    return {
      paramList,
      hasSaved,
      selectedCount,
      hasSelected,
      selectAll,
      unselectAll,
      handleSave,
      handleBack
    }
  }
}
</script>

<script setup>
/**
 * 批量编辑对话框组件
 * 包含输入弹窗和参数选择弹窗
 * 
 * 使用方式：
 * <batch-edit-dialog v-model="visible" @save="handleSave" />
 */
import { ref, computed } from 'vue'
import { useBatchEditStore } from '../stores/useBatchEditStore'
import InputDialog from './InputDialog.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const batchEditStore = useBatchEditStore()

// 使用 computed 来处理持久化内容
const persistedContent = computed({
  get: () => batchEditStore.content,
  set: (value) => batchEditStore.setContent(value)
})

// 结果弹窗状态
const resultDialogVisible = ref(false)
const parsedParams = ref([])

// 是否已经保存
const hasSaved = ref(false)

// 参数列表（带选中状态）
const paramList = ref([])

// 选中数量
const selectedCount = computed(() => {
  return paramList.value.filter(item => item.selected).length
})

// 是否有选中的参数
const hasSelected = computed(() => {
  return paramList.value.some(item => item.selected)
})

/**
 * 从 URL 中提取查询参数
 */
function extractUrlParams(url) {
  const params = {}
  try {
    // 处理带有 hash 的 URL（如 #/path?query）
    const hashIndex = url.indexOf('#')
    if (hashIndex !== -1) {
      const hash = url.substring(hashIndex + 1)
      const queryIndex = hash.indexOf('?')
      if (queryIndex !== -1) {
        const queryString = hash.substring(queryIndex + 1)
        const searchParams = new URLSearchParams(queryString)
        searchParams.forEach((value, key) => {
          params[key] = value
        })
      }
    }
    
    // 也尝试从标准 URL 查询参数提取
    const urlObj = new URL(url)
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value
    })
  } catch (e) {
    // 不是标准 URL，尝试手动解析 query string
    const queryMatch = url.match(/[?&]([^=]+)=([^&]*)/g)
    if (queryMatch) {
      queryMatch.forEach(match => {
        const [, key, value] = match.match(/[?&]([^=]+)=([^&]*)/)
        if (key) {
          params[decodeURIComponent(key)] = decodeURIComponent(value || '')
        }
      })
    }
  }
  return params
}

/**
 * 解析 KV 格式（key=value&key2=value2）
 */
function parseKvFormat(input) {
  const params = {}
  const pairs = input.split('&')
  pairs.forEach(pair => {
    const [key, ...valueParts] = pair.split('=')
    if (key && key.trim()) {
      const value = valueParts.join('=')
      params[decodeURIComponent(key.trim())] = decodeURIComponent(value || '')
    }
  })
  return params
}

/**
 * 解析函数
 * @param {string} input
 * @returns {Promise<Array>}
 */
async function parseBatchEdit(input) {
  let params = {}
  
  // 判断是否包含 URL
  const urlRegex = /https?:\/\/[^\s]+/
  const urlMatch = input.match(urlRegex)
  
  if (urlMatch) {
    params = extractUrlParams(urlMatch[0])
  } else if (input.includes('&') || input.includes('=')) {
    params = parseKvFormat(input)
  } else {
    throw new Error('无法识别格式，请输入 URL 或 key=value&key2=value2 格式')
  }
  
  const entries = Object.entries(params)
  if (entries.length === 0) {
    throw new Error('未识别到参数')
  }
  
  return entries.map(([key, value]) => ({ key, value }))
}

// 处理输入弹窗解析完成
function handleParse(params) {
  parsedParams.value = params
  hasSaved.value = false
  // 初始化参数列表
  paramList.value = params.map(param => ({
    ...param,
    selected: false
  }))
  resultDialogVisible.value = true
}

// 处理结果弹窗保存
function handleResultSave() {
  const selectedParams = paramList.value
    .filter(item => item.selected)
    .map(item => ({
      key: item.key,
      value: item.value
    }))
  
  if (selectedParams.length === 0) {
    return
  }
  
  // 标记已保存
  hasSaved.value = true
  // 关闭结果弹窗
  resultDialogVisible.value = false
  // 发送保存事件
  emit('save', selectedParams)
}

// 全选
function selectAll() {
  paramList.value.forEach(item => item.selected = true)
}

// 取消全选
function unselectAll() {
  paramList.value.forEach(item => item.selected = false)
}

// 处理结果弹窗返回/取消
function handleResultBack() {
  // 如果已经保存，不再重新打开输入弹窗
  if (hasSaved.value) {
    return
  }
  resultDialogVisible.value = false
  // 重新打开输入弹窗
  emit('update:modelValue', true)
}

// 处理输入弹窗关闭
function handleInputClose() {
  // 什么都不做，只是关闭
}
</script>

<template>
  <div>
    <!-- 输入弹窗 -->
    <input-dialog
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      title="批量编辑"
      placeholder="请在此填写 URL 或参数，然后点击弹层下方左侧解析按钮&#10;例如：&#10;https://open.jd.com/v2/#/doc/spi?apiCateId=200554&apiId=101050&#10;或&#10;apiCateId=200554&apiId=101050&gwType=2"
      action-button-text="解析"
      :parse-function="parseBatchEdit"
      v-model:persisted-content="persistedContent"
      @parse="handleParse"
      @close="handleInputClose"
    />
    
    <!-- 结果选择弹窗 -->
    <el-dialog
      :model-value="resultDialogVisible"
      @update:model-value="resultDialogVisible = $event"
      title="批量编辑"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
      @close="handleResultBack"
    >
      <div class="select-content">
        <!-- 工具栏 -->
        <div class="toolbar">
          <el-button size="small" @click="selectAll">全选</el-button>
          <el-button size="small" @click="unselectAll">取消全选</el-button>
          <span class="selected-info">已选择 {{ selectedCount }} / {{ paramList.length }} 项</span>
        </div>
        
        <!-- 参数列表 -->
        <div class="params-list">
          <div 
            v-for="(item, index) in paramList" 
            :key="index"
            class="param-item"
          >
            <el-checkbox v-model="item.selected" class="param-checkbox">
              <div class="param-content">
                <span class="param-key">{{ item.key }}</span>
                <span class="param-separator">=</span>
                <span class="param-value">{{ item.value }}</span>
              </div>
            </el-checkbox>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleResultBack">返回</el-button>
          <el-button 
            type="primary" 
            :disabled="!hasSelected"
            @click="handleResultSave"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.select-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-info {
  margin-left: auto;
  font-size: 13px;
  color: #606266;
}

.params-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #f8f9fa;
  padding: 8px 12px;
}

.param-item {
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.param-item:last-child {
  border-bottom: none;
}

.param-checkbox {
  width: 100%;
}

.param-checkbox :deep(.el-checkbox__label) {
  flex: 1;
  padding-left: 8px;
}

.param-content {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
}

.param-key {
  color: #881391;
  font-weight: 500;
  white-space: nowrap;
}

.param-separator {
  color: #606266;
}

.param-value {
  color: #268bd2;
  word-break: break-all;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
