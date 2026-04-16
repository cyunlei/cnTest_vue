<script setup>
const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({})
  },
  type: {
    type: String,
    default: 'strategy'
  }
})
</script>

<template>
  <div class="strategy-section">
    <!-- 执行策略 -->
    <template v-if="type === 'strategy'">
      <div class="info-block">
        <div class="info-row">
          <div class="info-item">
            <span class="label">触发方式：</span>
            <span class="value">{{ data.trigger }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">执行间隔：</span>
            <span class="value">{{ data.interval }}s</span>
          </div>
          <div class="info-item">
            <span class="label">中断策略：</span>
            <span class="value">{{ data.breakStrategy }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">串并行配置：</span>
            <span class="value">{{ data.parallel }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">HOST配置：</span>
            <span class="value empty">{{ data.host || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">环境配置：</span>
            <span class="value empty">{{ data.env || '-' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">执行命令：</span>
            <span class="value empty">{{ data.command || '-' }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 通知配置 -->
    <template v-if="type === 'notify'">
      <div class="info-block">
        <div class="info-row">
          <div class="info-item">
            <span class="label">是否通知：</span>
            <span class="value">{{ data.notify }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 重试策略 -->
    <template v-if="type === 'retry'">
      <div class="info-block">
        <div class="info-row">
          <div class="info-item">
            <span class="label">步骤失败重试次数：</span>
            <span class="value">{{ data.stepRetry }}</span>
          </div>
          <div class="info-item">
            <span class="label">用例失败重试次数：</span>
            <span class="value">{{ data.caseRetry }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">超时时间(毫秒)：</span>
            <span class="value empty">{{ data.timeout || '-' }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.strategy-section {
  padding: 16px;
}
.info-block {
  margin-bottom: 8px;
}
.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 12px;
}
.info-row:last-child {
  margin-bottom: 0;
}
.info-item {
  flex: 1;
  min-width: 260px;
  display: flex;
  align-items: center;
  font-size: 13px;
}
.label {
  color: #666;
  white-space: nowrap;
}
.value {
  color: #333;
}
.value.empty {
  color: #999;
}
</style>
