<script setup>
import { ref } from 'vue'
import { VideoPlay, QuestionFilled, CopyDocument } from '@element-plus/icons-vue'
import ResponseArea from '../ResponseArea.vue'
import { executeQuickMysql } from '../../api'

const jdbcUrl = ref('')
const username = ref('')
const password = ref('')
const sql = ref('1')

const responseBody = ref('')
const responseHeaders = ref([])
const loading = ref(false)

async function handleExecute() {
  loading.value = true
  try {
    const resp = await executeQuickMysql({
      jdbc_url: jdbcUrl.value,
      username: username.value,
      password: password.value,
      sql: sql.value
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
  <div class="quick-call-mysql-panel">
    <el-form label-position="top" class="mysql-form">
      <el-form-item>
        <template #label>
          <span>JDBC 地址</span>
        </template>
        <el-input v-model="jdbcUrl" placeholder="请输入JDBC地址, 示例: jdbc:mysql://***:3306/库名" />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item required>
            <template #label>
              <span>用户名</span>
              <el-icon class="label-icon"><QuestionFilled /></el-icon>
            </template>
            <el-input v-model="username" placeholder="请输入用户名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item required>
            <template #label>
              <span>密码</span>
              <el-icon class="label-icon"><QuestionFilled /></el-icon>
            </template>
            <el-input v-model="password" type="password" show-password placeholder="请输入密码" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item required>
        <template #label>
          <span>SQL</span>
          <el-icon class="label-icon"><QuestionFilled /></el-icon>
          <el-icon class="label-icon"><CopyDocument /></el-icon>
        </template>
        <el-input v-model="sql" type="textarea" :rows="5" placeholder="请输入SQL" />
      </el-form-item>
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
.quick-call-mysql-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mysql-form :deep(.el-form-item__label) {
  font-size: 13px;
  color: #606266;
  padding-bottom: 4px;
}
.label-icon {
  font-size: 12px;
  color: #2695F1;
  margin-left: 4px;
  vertical-align: middle;
  cursor: help;
}
.panel-footer {
  display: flex;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}
</style>
