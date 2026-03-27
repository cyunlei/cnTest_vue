<script setup>
/**
 * JSON 添加对话框组件
 */
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useJsonCacheStore } from '../../stores/useJsonCacheStore'
import InputDialog from './InputDialog.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'params'
  },
  title: {
    type: String,
    default: 'Json添加Param'
  },
  initialContent: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const jsonCacheStore = useJsonCacheStore()

// 保存当前输入的内容
const currentInput = ref('')

// 结果展示状态
const showResult = ref(false)
const parsedData = ref(null)
const treeData = ref([])
const selectedKeys = ref([])
const hasSaved = ref(false)

// 所有叶子节点数量（用于全选/取消全选状态判断）
const allLeafKeyCount = computed(() => collectAllLeafKeys(treeData.value, []).length)
const dialogPersistedContent = computed(() => {
  if (props.type === 'params') return jsonCacheStore.content || ''
  return currentInput.value || props.initialContent || ''
})

// 监听弹窗打开
watch(() => props.modelValue, (val) => {
  if (val) {
    parsedData.value = null
    treeData.value = []
    selectedKeys.value = []
    hasSaved.value = false
    // 入参场景读取缓存，其它场景优先使用外部传入的初始化内容
    currentInput.value = props.type === 'params'
      ? (jsonCacheStore.content || '')
      : (props.initialContent || '')
  }
})

function jsonToTree(obj, parentKey = '', parentPath = '', options = {}) {
  const result = []
  
  for (const [key, value] of Object.entries(obj)) {
    const currentKey = parentKey ? `${parentKey}.${key}` : key
    const currentPath = parentPath ? `${parentPath}.${key}` : key
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const node = {
        key: currentKey,
        displayKey: key,
        value: value,
        type: 'object',
        path: currentPath,
        children: jsonToTree(value, currentKey, currentPath, { parentType: 'object' })
      }
      if (options.parentType === 'array') {
        node.isArrayItemRoot = true
      }
      result.push(node)
    } else if (Array.isArray(value)) {
      const children = []
      value.forEach((item, index) => {
        const itemKey = `${currentKey}[${index}]`
        const itemPath = `${currentPath}[${index}]`
        if (typeof item === 'object' && item !== null) {
          const childNode = {
            key: itemKey,
            displayKey: null,
            value: item,
            type: 'object',
            path: itemPath,
            children: jsonToTree(item, itemKey, itemPath, { parentType: 'array' })
          }
          childNode.isArrayItemRoot = true
          children.push(childNode)
        } else {
          children.push({
            key: itemKey,
            displayKey: null,
            value: item,
            type: 'primitive',
            path: itemPath,
            children: []
          })
        }
      })
      const arrayNode = {
        key: currentKey,
        displayKey: key,
        value: value,
        type: 'array',
        path: currentPath,
        children: children
      }
      if (options.parentType === 'array') {
        arrayNode.isArrayItemRoot = true
      }
      result.push(arrayNode)
    } else {
      result.push({
        key: currentKey,
        displayKey: key,
        value: value,
        type: 'primitive',
        path: currentPath,
        children: []
      })
    }
  }
  
  return result
}

async function parseJson(input) {
  try {
    currentInput.value = input
    if (props.type === 'params') {
      jsonCacheStore.setContent(input)
    }
    
    const parsed = JSON.parse(input.trim())
    
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('只支持 JSON 对象或数组结构的数据')
    }
    
    if (Object.keys(parsed).length === 0 && !Array.isArray(parsed)) {
      throw new Error('JSON 数据为空')
    }
    
    parsedData.value = parsed
    
    // 构造一个虚拟根节点，用于显示最外层的大括号 / 中括号
    if (Array.isArray(parsed)) {
      const children = []
      parsed.forEach((item, index) => {
        const itemKey = `[${index}]`
        const itemPath = `[${index}]`
        if (typeof item === 'object' && item !== null) {
          const childNode = {
            key: itemKey,
            displayKey: null,
            value: item,
            type: Array.isArray(item) ? 'array' : 'object',
            path: itemPath,
            children: Array.isArray(item)
              ? jsonToTree({ ...item }, itemKey, itemPath, { parentType: 'array' })
              : jsonToTree(item, itemKey, itemPath, { parentType: 'array' })
          }
          childNode.isArrayItemRoot = true
          children.push(childNode)
        } else {
          children.push({
            key: itemKey,
            displayKey: null,
            value: item,
            type: 'primitive',
            path: itemPath,
            children: []
          })
        }
      })
      treeData.value = [
        {
          key: '__root_array__',
          displayKey: null,
          value: parsed,
          type: 'array',
          path: '',
          children
        }
      ]
    } else {
      treeData.value = [
        {
          key: '__root_object__',
          displayKey: null,
          value: parsed,
          type: 'object',
          path: '',
          children: jsonToTree(parsed, '', '', { parentType: 'object' })
        }
      ]
    }
    
    selectedKeys.value = []
    showResult.value = true
    
    return []
  } catch (e) {
    throw new Error(e.message || 'JSON 格式错误，请检查')
  }
}

function collectAllLeafKeys(nodes, result = []) {
  nodes.forEach(node => {
    if (node.children && node.children.length > 0) {
      collectAllLeafKeys(node.children, result)
    } else {
      result.push(node.path)
    }
  })
  return result
}

function toggleSelectAll() {
  const allKeys = collectAllLeafKeys(treeData.value, [])
  if (selectedKeys.value.length === allKeys.length) {
    selectedKeys.value = []
  } else {
    selectedKeys.value = allKeys
  }
}

function handleSave() {
  if (!parsedData.value) return
  
  const result = []
  selectedKeys.value.forEach(path => {
    const value = getValueByPath(parsedData.value, path)
    if (value !== undefined) {
      // 如果是空对象 {}，视为无实际 value，不生成条目
      if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
        return
      }
      result.push({
        key: path,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      })
    }
  })
  
  hasSaved.value = true
  showResult.value = false
  emit('update:modelValue', false)
  emit('save', result)
}

function handleClose() {
  if (hasSaved.value) return
  showResult.value = false
  emit('update:modelValue', false)
}

function handleBack() {
  if (hasSaved.value) return
  showResult.value = false
}

function handleInputClose() {
  if (!showResult.value) {
    emit('update:modelValue', false)
  }
}

function handlePersistedContentUpdate(content) {
  currentInput.value = content
  if (props.type === 'params') {
    jsonCacheStore.setContent(content)
  }
}

function getValueByPath(obj, path) {
  const keys = path.split(/\.(?![^\[]*\])/)
  let value = obj
  
  for (const key of keys) {
    if (value === null || value === undefined) return undefined
    
    const arrayMatch = key.match(/^(.+)?\[(\d+)\]$/)
    if (arrayMatch) {
      const arrKey = arrayMatch[1]
      const arrIndex = parseInt(arrayMatch[2])
      if (arrKey) {
        value = value[arrKey]?.[arrIndex]
      } else {
        value = value[arrIndex]
      }
    } else {
      value = value[key]
    }
  }
  
  return value
}

</script>

<template>
  <div>
    <!-- 输入弹窗 -->
    <input-dialog
      v-if="!showResult"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :title="title"
      placeholder="请在此填写 JSON 格式数据，然后点击弹层下方左侧生成按钮"
      action-button-text="生成"
      :parse-function="parseJson"
      :persisted-content="dialogPersistedContent"
      @update:persisted-content="handlePersistedContentUpdate"
      @close="handleInputClose"
    />
    
    <!-- 结果选择弹窗 -->
    <el-dialog
      v-else
      :model-value="true"
      @update:model-value="handleClose"
      :title="title"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="json-dialog-content">
        <div class="json-toolbar">
          <el-button size="small" @click="toggleSelectAll">
            {{ selectedKeys.length === allLeafKeyCount ? '取消全选' : '全选' }}
          </el-button>
          <span class="selected-count">
            已选择 {{ selectedKeys.length }} / {{ allLeafKeyCount }} 项
          </span>
        </div>
        <div class="json-tree-container">
          <json-tree-node
            v-for="(item, index) in treeData"
            :key="item.key"
            :node="item"
            v-model:selected-keys="selectedKeys"
            :level="0"
            :is-last="index === treeData.length - 1"
          />
        </div>
      </div>
      
      <template #footer>
        <div class="json-dialog-footer">
          <el-button @click="handleBack">重新输入</el-button>
          <div class="json-dialog-right">
            <el-button type="primary" @click="handleSave" :disabled="selectedKeys.length === 0">
              保存
            </el-button>
            <el-button @click="handleClose">取消</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { h, ref } from 'vue'

const JsonTreeNode = {
  name: 'JsonTreeNode',
  props: {
    node: Object,
    selectedKeys: Array,
    level: Number,
    isLast: Boolean
  },
  emits: ['update:selectedKeys'],
  setup(props, { emit }) {
    
    const isSelected = (node) => props.selectedKeys.includes(node.path)
    
    // 当前节点是否允许被选择（用于控制复选框和级联逻辑）
    const isSelectableNode = (node) => {
      if (!node) return false
      const hasKey = node.displayKey !== null && node.displayKey !== undefined
      // 虚拟根节点没有 displayKey，不可选
      if (!hasKey) return false
      // 对象 / 数组 / 叶子（primitive）都有意义，可以作为一条断言来源
      return node.type === 'object' || node.type === 'array' || node.type === 'primitive'
    }
    
    // 展开/收起当前节点（仅对象和数组有效）
    const expanded = ref(true)
    
    const toggleExpand = () => {
      expanded.value = !expanded.value
    }
    
    // 递归收集当前节点及其所有「可选」子节点的 path，用于级联选择
    const collectDescendantPaths = (node, result = []) => {
      if (isSelectableNode(node) && node.path) {
        result.push(node.path)
      }
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => collectDescendantPaths(child, result))
      }
      return result
    }
    
    const onSelectChange = (node, val) => {
      const keys = [...props.selectedKeys]
      const allPaths = collectDescendantPaths(node, [])
      
      if (val) {
        // 勾选上层参数时，自动全选下层所有参数
        allPaths.forEach(path => {
          if (!keys.includes(path)) {
            keys.push(path)
          }
        })
      } else {
        // 取消勾选上层参数时，自动取消下层所有参数
        allPaths.forEach(path => {
          const index = keys.indexOf(path)
          if (index > -1) {
            keys.splice(index, 1)
          }
        })
      }
      emit('update:selectedKeys', keys)
    }
    
    const formatValue = (value) => {
      if (value === null) return 'null'
      if (value === undefined) return 'undefined'
      if (typeof value === 'string') {
        // 将字符串中的换行符、回车符显式转义，避免在界面上实际换行
        const safe = value
          .replace(/\r\n/g, '\\n')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\n')
        return `"${safe}"`
      }
      if (typeof value === 'boolean') return String(value)
      if (typeof value === 'number') return String(value)
      return String(value)
    }
    
    // 获取值的颜色 - 使用 style 而不是 class
    // 颜色方案参照 json.cn：
    // 字符串：绿色，数字：蓝色，布尔值/null：红色，符号保持黑色
    const getValueColor = (value) => {
      if (value === null || value === undefined) return '#c7254e' // null
      const type = typeof value
      if (type === 'string') return '#008000' // 字符串：绿色
      if (type === 'number') return '#0000ff' // 数字：蓝色
      if (type === 'boolean') return '#c7254e' // 布尔：红色
      return '#333'
    }
    
    return { isSelected, onSelectChange, formatValue, getValueColor, expanded, toggleExpand, isSelectableNode }
  },
  render() {
    const node = this.node
    const level = this.level || 0
    const isLast = this.isLast
    
    const { isSelected, onSelectChange, formatValue, getValueColor, expanded, toggleExpand, isSelectableNode } = this
    
    const baseIndent = level * 20
    
    const hasChildren = node.children && node.children.length > 0
    
    // 创建三列布局的辅助函数
    // col1: 折叠图标列 (固定18px)
    // col2: 复选框列 (固定22px，有内容时才占宽度)
    // col3: 内容列
    const createThreeColumnLine = (toggleContent, checkboxContent, contentChildren, extraStyle = {}) => {
      return h('div', { 
        class: 'json-line',
        style: { 
          paddingLeft: `${baseIndent}px`,
          ...extraStyle 
        }
      }, [
        h('span', { class: 'json-col-toggle' }, toggleContent),
        h('span', { 
          class: 'json-col-checkbox', 
          style: checkboxContent ? {} : { width: '0', padding: 0 }
        }, checkboxContent),
        h('span', { class: 'json-col-content' }, contentChildren)
      ])
    }
    
    // 对象类型
    if (node.type === 'object') {
      const showKey = node.displayKey !== null && node.displayKey !== undefined
      const toggleIcon = hasChildren
        ? h('span', {
            class: ['json-fold-btn', expanded ? 'minus' : 'plus'],
            onClick: (e) => {
              e.stopPropagation()
              toggleExpand()
            }
          })
        : null
      
      // 只有有 key 的对象节点才展示复选框（虚拟根节点没有 displayKey，因此不会出现）
      const showCheckbox = isSelectableNode(node)
      const checkboxEl = showCheckbox
        ? h('input', {
            type: 'checkbox',
            class: 'json-checkbox',
            checked: isSelected(node),
            onChange: (e) => onSelectChange(node, e.target.checked)
          })
        : null
      
      const contentChildren = [
        showKey ? h('span', { class: 'json-key' }, `"${node.displayKey}"`) : null,
        showKey ? h('span', { class: 'json-colon' }, ': ') : null,
        h('span', { class: 'json-bracket' }, '{')
      ]
      
      if (!expanded && hasChildren) {
        contentChildren.push(
          h('span', { class: 'json-ellipsis' }, ' ... '),
          h('span', { class: 'json-bracket' }, '}'),
          !isLast ? h('span', { class: 'json-comma' }, ',') : null
        )
      } else if (!hasChildren) {
        contentChildren.push(!isLast ? h('span', { class: 'json-comma' }, ',') : null)
      }
      
      const childrenBlock = expanded && hasChildren
        ? h('div', { class: 'json-children' },
            node.children.map((child, idx) => 
              h(JsonTreeNode, {
                key: child.key,
                node: child,
                selectedKeys: this.selectedKeys,
                level: level + 1,
                isLast: idx === node.children.length - 1,
                'onUpdate:selectedKeys': (keys) => this.$emit('update:selectedKeys', keys)
              })
            )
          )
        : null
      
      const closingLine = expanded && hasChildren
        ? createThreeColumnLine(
            null,
            null,
            [h('span', { class: 'json-bracket' }, '}'), !isLast ? h('span', { class: 'json-comma' }, ',') : null]
          )
        : null
      
      return h('div', { class: 'json-node' }, [
        createThreeColumnLine(toggleIcon, checkboxEl, contentChildren),
        childrenBlock,
        closingLine
      ])
    }
    
    // 数组类型
    if (node.type === 'array') {
      const toggleIcon = hasChildren
        ? h('span', {
            class: ['json-fold-btn', expanded ? 'minus' : 'plus'],
            onClick: (e) => {
              e.stopPropagation()
              toggleExpand()
            }
          })
        : null
      
      // 只有有 key 的数组节点才展示复选框（无 key 的纯数组元素不显示）
      const showCheckbox = isSelectableNode(node)
      const checkboxEl = showCheckbox
        ? h('input', {
            type: 'checkbox',
            class: 'json-checkbox',
            checked: isSelected(node),
            onChange: (e) => onSelectChange(node, e.target.checked)
          })
        : null
      
      const contentChildren = [
        node.displayKey ? h('span', { class: 'json-key' }, `"${node.displayKey}"`) : null,
        node.displayKey ? h('span', { class: 'json-colon' }, ': ') : null,
        h('span', { class: 'json-bracket' }, '[')
      ]
      
      if (!expanded && hasChildren) {
        contentChildren.push(
          h('span', { class: 'json-ellipsis' }, ' ... '),
          h('span', { class: 'json-bracket' }, ']'),
          !isLast ? h('span', { class: 'json-comma' }, ',') : null
        )
      } else if (!hasChildren) {
        contentChildren.push(!isLast ? h('span', { class: 'json-comma' }, ',') : null)
      }
      
      const childrenBlock = expanded && hasChildren
        ? h('div', { class: 'json-children' },
            node.children.map((child, idx) => 
              h(JsonTreeNode, {
                key: child.key,
                node: child,
                selectedKeys: this.selectedKeys,
                level: level + 1,
                isLast: idx === node.children.length - 1,
                'onUpdate:selectedKeys': (keys) => this.$emit('update:selectedKeys', keys)
              })
            )
          )
        : null
      
      const closingLine = expanded && hasChildren
        ? createThreeColumnLine(
            null,
            null,
            [h('span', { class: 'json-bracket' }, ']'), !isLast ? h('span', { class: 'json-comma' }, ',') : null]
          )
        : null
      
      return h('div', { class: 'json-node' }, [
        createThreeColumnLine(toggleIcon, checkboxEl, contentChildren),
        childrenBlock,
        closingLine
      ])
    }
    
    // 基本类型 - 使用三列布局
    const valueColor = getValueColor(node.value)
    
    const primitiveCheckbox = node.displayKey
      ? h('input', {
          type: 'checkbox',
          class: 'json-checkbox',
          checked: isSelected(node),
          onChange: (e) => onSelectChange(node, e.target.checked)
        })
      : null
    
    const primitiveContent = [
      node.displayKey ? h('span', { class: 'json-key' }, `"${node.displayKey}"`) : null,
      node.displayKey ? h('span', { class: 'json-colon' }, ': ') : null,
      h('span', { 
        class: 'json-value',
        style: { color: valueColor }
      }, formatValue(node.value)),
      !isLast ? h('span', { class: 'json-comma' }, ',') : null
    ]
    
    return createThreeColumnLine(
      null,
      primitiveCheckbox,
      primitiveContent
    )
  }
}

export default {
  components: { JsonTreeNode }
}
</script>

<style scoped>
.json-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.json-toolbar {
  padding: 8px 12px;
  border: 1px solid #e4e7ed;
  border-bottom: none;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border-radius: 4px 4px 0 0;
}

.selected-count {
  margin-left: auto;
  font-size: 13px;
  color: #606266;
}

.json-tree-container {
  padding: 12px 16px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: auto;
  border: 1px solid #e4e7ed;
  border-radius: 0 0 4px 4px;
  background: #f8f9fa;
  font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
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

/* 树节点样式 */
.json-node {
  display: flex;
  flex-direction: column;
}

:deep(.json-line) {
  display: flex;
  align-items: center;
  min-height: 22px;
  white-space: nowrap;
  overflow: visible;
}

.json-line:hover {
  background-color: #f0f0f0;
}

/* 三列布局 */
:deep(.json-col-toggle),
:deep(.json-col-checkbox),
:deep(.json-col-content) {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

:deep(.json-col-toggle) {
  width: 18px;
  min-width: 18px;
  justify-content: center;
}

:deep(.json-col-checkbox) {
  width: 22px;
  justify-content: center;
}

:deep(.json-col-content) {
  flex: 1;
  flex-shrink: 1;
  min-width: 0;
}

/* 防止值换行：所有值强制单行展示 */
:deep(.json-value) {
  white-space: nowrap;
}

/* 复选框样式 */
.json-checkbox {
  margin: 0 4px 0 0;
  width: 14px;
  height: 14px;
  cursor: pointer;
  flex-shrink: 0;
}

.json-checkbox-placeholder {
  display: inline-block;
  width: 18px;
  flex-shrink: 0;
}

/* CSS 绘制折叠图标（参考 a.html） */
:deep(.json-fold-btn) {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  vertical-align: middle;
  background: #fff;
}

/* 加号样式：青色 #00cfe8 */
:deep(.json-fold-btn.plus) {
  border: 1px solid #00cfe8;
}
:deep(.json-fold-btn.plus)::before,
:deep(.json-fold-btn.plus)::after {
  content: '';
  position: absolute;
  background: #00cfe8;
}
:deep(.json-fold-btn.plus)::before {
  width: 8px;
  height: 1px;
}
:deep(.json-fold-btn.plus)::after {
  width: 1px;
  height: 8px;
}

/* 减号样式：红色 #ea5455 */
:deep(.json-fold-btn.minus) {
  border: 1px solid #ea5455;
}
:deep(.json-fold-btn.minus)::before {
  content: '';
  position: absolute;
  width: 8px;
  height: 1px;
  background: #ea5455;
}

.json-ellipsis {
  color: #909399;
  margin: 0 4px;
}

/* JSON 颜色（通过 :deep 作用到 JsonTreeNode 渲染出来的节点上） */
:deep(.json-key) {
  color: #92278f !important; /* 靠近 json.cn 的紫色，强制生效 */
}

.json-colon {
  color: #333;
  margin-right: 4px;
}

.json-bracket {
  color: #333;
}

.json-comma {
  color: #333;
  margin-left: 2px;
}

/* .json-value 的颜色通过内联样式设置，样式选择器仅用于结构控制 */

.json-children {
  display: flex;
  flex-direction: column;
}
</style>
