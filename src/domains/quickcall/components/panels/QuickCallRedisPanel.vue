<script setup>
import { ref } from 'vue'
import { Plus, VideoPlay } from '@element-plus/icons-vue'
import ResponseArea from '../ResponseArea.vue'
import { executeQuickRedis } from '../../api'

const redisUrl = ref('')
const operations = ref([])

const responseBody = ref('')
const responseHeaders = ref([])
const loading = ref(false)

function addOperation() {
  operations.value.push({ key: '', value: '' })
}

async function handleExecute() {
  loading.value = true
  try {
    const resp = await executeQuickRedis({
      redis_url: redisUrl.value,
      key_operations: operations.value.filter(o => o.key)
    })
    const data = resp?.data?.data ?? {}
    responseBody.value = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    responseHeaders.value = []
  } catch (e) {
    responseBody.value = String(e?.message || '执行失败')
    responseHeaders.value = []
  } finally {
    loading.value = false
  }
}

function handleSaveTemplate() {}
function handleSaveAsCase() {}
</script>

<template>
  <div class="quick-call-redis-panel">
    <el-form label-position="top" class="redis-form">
      <el-form-item>
        <el-input v-model="redisUrl" placeholder="请输入JIMDB地址, 示例: jim://xxx/12345" />
      </el-form-item>

      <el-button
        class="add-btn"
        :icon="Plus"
        @click="addOperation"
      >
        添加
      </el-button>

      <div v-for="(op, idx) in operations" :key="idx" class="operation-row">
        <el-input v-model="op.key" placeholder="Key" class="op-key" />
        <el-input v-model="op.value" placeholder="Value" class="op-value" />
        <el-button link type="danger" @click="operations.splice(idx, 1)">删除</el-button>
      </div>
    </el-form>

    <ResponseArea :body="responseBody" :headers="responseHeaders" />

    <div class="panel-footer">
      <el-button type="primary" :loading="loading" @click="handleExecute">
        <el-icon><VideoPlay /></el-icon>
        调用
      </el-button>
      <el-button @click="handleSaveTemplate">保存模板</el-button>
      <el-button @click="handleSaveAsCase">保存为用例</el-button>
    </div>
  </div>
</template>

<style scoped>
.quick-call-redis-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.redis-form :deep(.el-form-item__label) {
  font-size: 13px;
  color: #606266;
  padding-bottom: 4px;
}
.add-btn {
  width: 100%;
  border-style: dashed;
  margin-bottom: 8px;
}
.operation-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
.op-key {
  width: 200px;
}
.op-value {
  flex: 1;
}
.panel-footer {
  display: flex;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}
</style>
