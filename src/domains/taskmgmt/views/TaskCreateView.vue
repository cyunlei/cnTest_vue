<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DocumentAdd, Share, DocumentCopy } from '@element-plus/icons-vue'
import TaskCreateForm from '../components/TaskCreateForm.vue'

const router = useRouter()
const formRef = ref(null)

function handleSubmit() {
  formRef.value?.submit()
}

function handleCancel() {
  router.back()
}
</script>

<template>
  <div class="task-create-inner">
    <div class="page-header">
      <div class="header-left">
        <el-button text>
          <el-icon><DocumentAdd /></el-icon>
          <span>新增任务</span>
        </el-button>
        <el-button text>
          <el-icon><Share /></el-icon>
          <span>分享</span>
        </el-button>
        <el-button text>
          <el-icon><DocumentCopy /></el-icon>
          <span>另存为</span>
        </el-button>
      </div>
      <div class="header-right">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </div>
    </div>
    <TaskCreateForm ref="formRef" />
  </div>
</template>

<style scoped>
.task-create-inner {
  /* 嵌套在 tab-panel 中，不需要额外的 padding/背景/min-height */
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
