<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title?: string
}>()

const displayTitle = computed(() => props.title || 'MySQL 步骤')
</script>

<template>
  <div class="step-type-card mysql-step-type">
    <div class="step-type-title">{{ displayTitle }}</div>
    <div class="step-type-desc">配置 MySQL 查询或更新，用于前置/后置校验或数据准备。</div>
  </div>
</template>

<style scoped>
.step-type-card {
  padding: 12px 16px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  font-size: 13px;
}

.step-type-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #303133;
}

.step-type-desc {
  color: #909399;
}
</style>

