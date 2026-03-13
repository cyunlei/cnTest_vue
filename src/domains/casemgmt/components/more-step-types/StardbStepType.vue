<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title?: string
}>()

const displayTitle = computed(() => props.title || 'STARDB 步骤')
</script>

<template>
  <div class="step-type-card stardb-step-type">
    <div class="step-type-title">{{ displayTitle }}</div>
    <div class="step-type-desc">配置 STARDB 相关操作，用于分布式数据库验证。</div>
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

