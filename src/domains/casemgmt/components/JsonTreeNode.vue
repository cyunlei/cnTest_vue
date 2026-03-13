<script setup>
/**
 * JSON 树节点组件 - 递归渲染 JSON 数据结构
 * 默认展开所有层级，数组直接展开显示内部对象字段
 */
import { computed } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  selectedKeys: {
    type: Array,
    default: () => []
  },
  level: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:selectedKeys'])

// 是否有子节点
const hasChildren = computed(() => props.node.children && props.node.children.length > 0)

// 是否选中
const isSelected = computed({
  get: () => props.selectedKeys.includes(props.node.key),
  set: (val) => {
    const keys = [...props.selectedKeys]
    if (val) {
      keys.push(props.node.key)
    } else {
      const index = keys.indexOf(props.node.key)
      if (index > -1) keys.splice(index, 1)
    }
    emit('update:selectedKeys', keys)
  }
})

// 格式化值显示
function formatValue(value) {
  if (typeof value === 'string') {
    return `"${value}"`
  }
  return String(value)
}

// 获取值的颜色类
function getValueColorClass(value) {
  if (typeof value === 'string') return 'json-string'
  if (typeof value === 'number') return 'json-number'
  if (typeof value === 'boolean') return 'json-boolean'
  return ''
}
</script>

<template>
  <div class="json-tree-node" :style="{ marginLeft: level * 20 + 'px' }">
    <div class="json-node-content">
      <!-- 只有有 key 且为 primitive 的节点才有复选框（如 "msg": "执行成功"），对象/数组 key 不可选 -->
      <template v-if="node.displayKey && node.type === 'primitive'">
        <el-checkbox v-model="isSelected" class="json-checkbox">
          <span class="json-key">"{{ node.displayKey }}"</span>
          <span class="json-colon">: </span>
          <span :class="['json-value', getValueColorClass(node.value)]">
            {{ formatValue(node.value) }}
          </span>
        </el-checkbox>
      </template>
      <!-- 其他节点（无 key 或非 primitive）只展示值 / 结构，不可勾选 -->
      <template v-else>
        <span v-if="node.displayKey" class="json-key">"{{ node.displayKey }}"</span>
        <span v-if="node.displayKey" class="json-colon">: </span>
        <span v-if="node.type === 'primitive'" :class="['json-value', getValueColorClass(node.value)]">
          {{ formatValue(node.value) }}
        </span>
        <span v-else class="json-bracket">
          {{ node.value }}
        </span>
      </template>
    </div>
    
    <!-- 子节点 - 默认全部展开 -->
    <div v-if="hasChildren" class="json-children">
      <json-tree-node
        v-for="child in node.children"
        :key="child.key"
        :node="child"
        :selected-keys="selectedKeys"
        :level="level + 1"
        @update:selected-keys="$emit('update:selectedKeys', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.json-tree-node {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.8;
}

.json-node-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.json-checkbox :deep(.el-checkbox__label) {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  padding-left: 4px;
}

.json-key {
  color: #881391;
}

.json-colon {
  color: #606266;
}

.json-value {
  color: #606266;
}

.json-string {
  color: #268bd2;
}

.json-number {
  color: #2aa198;
}

.json-boolean {
  color: #b58900;
}

.json-bracket {
  color: #606266;
}
</style>
