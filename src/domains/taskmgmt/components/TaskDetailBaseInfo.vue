<script setup>
const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({})
  }
})
</script>

<template>
  <el-collapse :model-value="['base']" class="base-info-collapse">
    <el-collapse-item name="base">
      <template #title>
        <div class="collapse-title">基础信息</div>
      </template>
      <div class="base-info-grid">
        <div class="info-row">
          <div class="info-item">
            <span class="label">任务名称：</span>
            <span class="value tag-name">{{ data.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">任务 ID：</span>
            <span class="value">{{ data.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">执行次数：</span>
            <span class="value">
              <span class="success">{{ data.execSuccess }}</span>
              <span class="divider">/</span>
              <span class="fail">{{ data.execFail }}</span>
            </span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ data.createdAt }}</span>
          </div>
          <div class="info-item">
            <span class="label">所属人：</span>
            <span class="value">{{ data.owner }}</span>
          </div>
          <div class="info-item">
            <span class="label"></span>
            <span class="value"></span>
          </div>
        </div>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<style scoped>
.base-info-collapse {
  margin-bottom: 12px;
  background: #fff;
  border-radius: 4px;
}
.base-info-collapse :deep(.el-collapse-item__header) {
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  background: #fafafa;
  border-radius: 4px 4px 0 0;
}
.base-info-collapse :deep(.el-collapse-item__wrap) {
  border-radius: 0 0 4px 4px;
}
.base-info-grid {
  padding: 16px;
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
  min-width: 220px;
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
.tag-name {
  display: inline-block;
  background: #fffbe6;
  color: #d48806;
  border: 1px solid #ffe58f;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
}
.success {
  color: #52c41a;
}
.divider {
  color: #999;
  margin: 0 2px;
}
.fail {
  color: #ff4d4f;
}
</style>
