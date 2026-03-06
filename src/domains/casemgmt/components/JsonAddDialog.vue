<script setup>
/**
 * JSON 添加对话框组件
 * 支持多级嵌套 JSON 的展示和选择 - 数组直接展开显示内部对象字段
 */
import { ref, watch } from 'vue'
import { useJsonCacheStore } from '../stores/useJsonCacheStore'
import JsonTreeNode from './JsonTreeNode.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'params' // params 或 headers
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// JSON 缓存 Store
const jsonCacheStore = useJsonCacheStore()

// 表单数据
const jsonForm = ref({
  content: '',
  parsedData: null,
  selectedKeys: [],
  showParsed: false,
  treeData: [] // 树形结构数据
})
const jsonError = ref('')

// 监听弹窗打开
watch(() => props.modelValue, (val) => {
  if (val) {
    // 从 Pinia Store 恢复内容
    jsonForm.value.content = jsonCacheStore.content
    jsonForm.value.parsedData = null
    jsonForm.value.selectedKeys = []
    jsonForm.value.showParsed = false
    jsonForm.value.treeData = []
    jsonError.value = ''
  }
})

// 关闭弹窗
function closeDialog() {
  // 保存内容到 Pinia Store
  jsonCacheStore.setContent(jsonForm.value.content)
  emit('update:modelValue', false)
}

// 将 JSON 转换为树形结构 - 数组直接展开，不显示索引
function jsonToTree(obj, parentKey = '') {
  const result = []
  
  for (const [key, value] of Object.entries(obj)) {
    const currentKey = parentKey ? `${parentKey}.${key}` : key
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // 嵌套对象
      result.push({
        key: currentKey,
        displayKey: key,
        value: '[Object]',
        type: 'object',
        children: jsonToTree(value, currentKey)
      })
    } else if (Array.isArray(value)) {
      // 数组 - 直接展开为多个对象节点，不显示索引
      if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
        // 数组元素是对象，为每个元素创建节点
        value.forEach((item, index) => {
          const itemKey = `${currentKey}[${index}]`
          result.push({
            key: itemKey,
            displayKey: key, // 显示原始字段名，不显示 [0], [1]
            value: `[Object]`,
            type: 'object',
            children: jsonToTree(item, itemKey)
          })
        })
      } else {
        // 数组元素是基本类型，显示数组本身
        result.push({
          key: currentKey,
          displayKey: key,
          value: `[Array(${value.length})]`,
          type: 'array',
          children: value.map((item, index) => ({
            key: `${currentKey}[${index}]`,
            displayKey: '', // 基本类型数组元素不显示索引
            value: typeof item === 'object' ? JSON.stringify(item) : String(item),
            type: 'primitive',
            children: []
          }))
        })
      }
    } else {
      // 基本类型
      result.push({
        key: currentKey,
        displayKey: key,
        value,
        type: 'primitive',
        children: []
      })
    }
  }
  
  return result
}

// 解析 JSON
function parseJson() {
  jsonError.value = ''
  jsonForm.value.parsedData = null
  jsonForm.value.selectedKeys = []
  jsonForm.value.showParsed = false
  jsonForm.value.treeData = []
  
  if (!jsonForm.value.content.trim()) {
    jsonError.value = '请输入 JSON 格式数据'
    return
  }
  
  try {
    const parsed = JSON.parse(jsonForm.value.content.trim())
    
    if (typeof parsed !== 'object' || parsed === null) {
      jsonError.value = '只支持 JSON 对象或数组结构的数据'
      return
    }
    
    // 检查是否为空
    if (Object.keys(parsed).length === 0) {
      jsonError.value = 'JSON 数据为空'
      return
    }
    
    jsonForm.value.parsedData = parsed
    
    // 转换为树形结构
    if (Array.isArray(parsed)) {
      // 根是数组的情况
      if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
        // 数组元素是对象，展开所有对象的字段
        jsonForm.value.treeData = parsed.flatMap((item, index) => {
          if (typeof item === 'object' && item !== null) {
            return jsonToTree(item, `[${index}]`)
          }
          return [{
            key: `[${index}]`,
            displayKey: '',
            value: String(item),
            type: 'primitive',
            children: []
          }]
        })
      } else {
        jsonForm.value.treeData = parsed.map((item, index) => ({
          key: `[${index}]`,
          displayKey: '',
          value: typeof item === 'object' ? JSON.stringify(item) : String(item),
          type: 'primitive',
          children: []
        }))
      }
    } else {
      jsonForm.value.treeData = jsonToTree(parsed)
    }
    
    jsonForm.value.selectedKeys = []  // 默认都不选中
    jsonForm.value.showParsed = true
  } catch (e) {
    jsonError.value = 'JSON 格式错误，请检查'
  }
}

// 保存 JSON 参数
function saveJsonParams() {
  if (!jsonForm.value.parsedData) return
  
  const selectedPaths = jsonForm.value.selectedKeys
  const result = []
  
  // 根据选中的路径提取数据
  selectedPaths.forEach(path => {
    const keys = path.split('.')
    let value = jsonForm.value.parsedData
    
    for (const key of keys) {
      if (value && typeof value === 'object') {
        // 处理数组索引
        const arrayMatch = key.match(/^(.+)\[(\d+)\]$/)
        if (arrayMatch) {
          const arrKey = arrayMatch[1]
          const arrIndex = parseInt(arrayMatch[2])
          value = value[arrKey]?.[arrIndex]
        } else {
          // 处理根数组的情况 [0], [1]
          const rootArrayMatch = key.match(/^\[(\d+)\]$/)
          if (rootArrayMatch && Array.isArray(value)) {
            value = value[parseInt(rootArrayMatch[1])]
          } else {
            value = value[key]
          }
        }
      } else {
        value = undefined
        break
      }
    }
    
    if (value !== undefined) {
      result.push({
        key: path,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      })
    }
  })
  
  emit('save', result)
  closeDialog()
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Json添加Param"
    width="600px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="json-dialog-content">
      <el-alert
        v-if="jsonError"
        :title="jsonError"
        type="error"
        :closable="false"
        show-icon
        class="json-error-alert"
      />
      
      <!-- 输入 JSON 区域 -->
      <el-input
        v-if="!jsonForm.showParsed"
        v-model="jsonForm.content"
        type="textarea"
        :rows="10"
        placeholder="请在此填写 JSON 格式数据，然后点击弹层下方左侧生成按钮"
        resize="none"
      />
      
      <!-- 格式化后的 JSON 展示区域 - 树形结构，全部展开 -->
      <div v-else class="json-parsed-view">
        <div class="json-tree">
          <json-tree-node
            v-for="item in jsonForm.treeData"
            :key="item.key"
            :node="item"
            v-model:selected-keys="jsonForm.selectedKeys"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="json-dialog-footer">
        <el-button v-if="!jsonForm.showParsed" @click="parseJson" :disabled="!jsonForm.content.trim()">
          生成
        </el-button>
        <el-button v-else @click="jsonForm.showParsed = false; jsonForm.parsedData = null;">
          重新输入
        </el-button>
        <div class="json-dialog-right">
          <el-button type="primary" @click="saveJsonParams" :disabled="jsonForm.selectedKeys.length === 0">
            保存
          </el-button>
          <el-button @click="closeDialog">取消</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.json-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.json-error-alert {
  margin-bottom: 8px;
}

/* 格式化 JSON 展示 */
.json-parsed-view {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.json-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.json-dialog-right {
  display: flex;
  gap: 12px;
}
</style>
