<script setup>
import { reactive } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { useMessage } from '@/shared/ui'
import { savePersonalConfig } from '../api/index.js'

const { showSuccess, showError } = useMessage()

const form = reactive({
  stepMax: 30,
  atomStepMax: 5
})

async function handleSubmit() {
  try {
    await savePersonalConfig(form)
    showSuccess('保存成功')
  } catch (err) {
    void err
    showError('保存失败')
  }
}
</script>

<template>
  <div class="personal-config-view">
    <h2 class="page-title">个性化配置</h2>
    <el-card class="config-card" shadow="never">
      <template #header>
        <span>用例设置</span>
      </template>
      <el-form label-width="160px">
        <el-form-item>
          <template #label>
            <span>步骤最大个数</span>
            <el-tooltip content="单个用例允许的最大步骤数量">
              <el-icon class="tip-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
            <span>：</span>
          </template>
          <el-input-number v-model="form.stepMax" :min="1" :max="999" controls-position="right" />
        </el-form-item>
        <el-form-item>
          <template #label>
            <span>原子步骤最大个数</span>
            <el-tooltip content="单个用例允许的最大原子步骤数量">
              <el-icon class="tip-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
            <span>：</span>
          </template>
          <el-input-number v-model="form.atomStepMax" :min="1" :max="999" controls-position="right" />
        </el-form-item>
      </el-form>
    </el-card>
    <div class="form-actions">
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </div>
  </div>
</template>

<style scoped>
.personal-config-view {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  min-height: 600px;
}
.page-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 16px 0;
}
.config-card {
  max-width: 480px;
  border: 1px solid #f0f0f0;
}
.config-card :deep(.el-card__header) {
  background: #fafafa;
  font-size: 14px;
  font-weight: 500;
  padding: 12px 16px;
}
.tip-icon {
  margin-left: 4px;
  color: #999;
  font-size: 14px;
  cursor: help;
}
.form-actions {
  margin-top: 24px;
}
</style>
