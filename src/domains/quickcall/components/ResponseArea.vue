<script setup>
import { ref, computed } from 'vue'
import ResponseBodyView from '@/domains/casemgmt/components/response/ResponseBodyView.vue'
import ResponseHeaderView from '@/domains/casemgmt/components/response/ResponseHeaderView.vue'

const props = defineProps({
  body: { type: String, default: '' },
  headers: { type: Array, default: () => [] },
  json: { type: String, default: '' }
})

const activeTab = ref('body')

const hasData = computed(() => {
  return !!(props.body || props.headers.length || props.json)
})
</script>

<template>
  <div class="response-area">
    <el-tabs v-model="activeTab" class="response-tabs">
      <el-tab-pane label="响应体" name="body" />
      <el-tab-pane label="响应头" name="headers" />
      <el-tab-pane label="JSON" name="json" />
    </el-tabs>

    <div v-if="!hasData" class="response-empty">
      <el-empty description="点击“调用”查看结果" />
    </div>
    <div v-else class="response-content">
      <div v-show="activeTab === 'body'" class="response-pane">
        <ResponseBodyView :model-value="body" />
      </div>
      <div v-show="activeTab === 'headers'" class="response-pane">
        <ResponseHeaderView :model-value="headers" />
      </div>
      <div v-show="activeTab === 'json'" class="response-pane">
        <ResponseBodyView :model-value="json || body" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.response-area {
  margin-top: 8px;
}
.response-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}
.response-empty {
  border: 1px solid #e4e7ed;
  border-top: none;
  border-radius: 0 0 6px 6px;
  padding: 40px 0;
}
.response-content {
  border: 1px solid #e4e7ed;
  border-top: none;
  border-radius: 0 0 6px 6px;
  padding: 12px;
  min-height: 200px;
}
.response-pane {
  width: 100%;
}
</style>
