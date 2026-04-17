<script setup>
import { ref } from 'vue'
import { VideoPlay, QuestionFilled } from '@element-plus/icons-vue'
import ResponseArea from '../ResponseArea.vue'
import { executeQuickShell } from '../../api'

const appName = ref('')
const hostIp = ref('')
const username = ref('')
const password = ref('')
const shellCommand = ref('1')

const responseBody = ref('')
const responseHeaders = ref([])
const loading = ref(false)

async function handleExecute() {
  loading.value = true
  try {
    const resp = await executeQuickShell({
      app_name: appName.value,
      host_ip: hostIp.value,
      username: username.value,
      password: password.value,
      shell_command: shellCommand.value
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
  <div class="quick-call-shell-panel">
    <el-form label-position="top" class="shell-form">
      <el-form-item required>
        <template #label>
          <span>应用名</span>
          <el-icon class="label-icon"><QuestionFilled /></el-icon>
        </template>
        <el-input v-model="appName" placeholder="请输入应用名称" />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item required>
            <template #label>
              <span>远程主机IP</span>
              <el-icon class="label-icon"><QuestionFilled /></el-icon>
              <el-link type="primary" :underline="false" class="ml-4">获取应用</el-link>
            </template>
            <el-input v-model="hostIp" placeholder="请输入远程主机IP" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item required>
            <template #label>
              <span>用户名</span>
              <el-icon class="label-icon"><QuestionFilled /></el-icon>
            </template>
            <el-input v-model="username" placeholder="请输入用户名" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item>
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
          <span>Shell 命令（当前仅支持grep命令且以grep开头）</span>
        </template>
        <el-input v-model="shellCommand" type="textarea" :rows="5" placeholder="请输入Shell命令" />
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
.quick-call-shell-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.shell-form :deep(.el-form-item__label) {
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
.ml-4 {
  margin-left: 4px;
}
.panel-footer {
  display: flex;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}
</style>
