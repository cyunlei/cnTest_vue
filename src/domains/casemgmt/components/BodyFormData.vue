<script setup>
import { computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

/**
 * Body - multipart/form-data 组件
 */
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const items = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function addItem() {
  items.value.push({ key: '', value: '' })
}

function removeItem(index) {
  items.value.splice(index, 1)
}
</script>

<template>
  <div class="body-form-data">
    <el-table :data="items" size="small" border>
      <el-table-column label="KEY" min-width="120">
        <template #default="{ row }">
          <el-input v-model="row.key" size="small" placeholder="请输入Key" />
        </template>
      </el-table-column>
      <el-table-column label="VALUE" min-width="180">
        <template #default="{ row }">
          <el-input v-model="row.value" size="small" placeholder="请输入Value" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" align="center">
        <template #default="{ $index }">
          <el-button link type="danger" size="small" @click="removeItem($index)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="add-btn-row">
      <el-button size="small" @click="addItem">
        <el-icon><Plus /></el-icon> 添加参数
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.body-form-data {
  width: 100%;
  margin: 0;
  padding: 0;
}

.add-btn-row {
  margin: 0;
  padding: 8px 0 0 0;
  text-align: center;
}
</style>