<script setup>
import { ref } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
import { executeHttpPoll, fetchHttpPollHistory } from '../../api'

const queryInput = ref('')
const useVip = ref(true)
const vipOnlyOnline = ref(true)
const vipSelect = ref('')
const pollIps = ref('')

const inspectResult = ref('')
const failedIps = ref('')
const inspectStatus = ref('未开始')
const loading = ref(false)

async function handleStartPoll() {
  loading.value = true
  inspectStatus.value = '进行中'
  try {
    const resp = await executeHttpPoll({
      query: queryInput.value,
      use_vip: useVip.value,
      vip_only_online: vipOnlyOnline.value,
      vip: vipSelect.value,
      poll_ips: pollIps.value
    })
    const data = resp?.data?.data ?? {}
    inspectResult.value = typeof data.result === 'string' ? data.result : JSON.stringify(data.result || {}, null, 2)
    failedIps.value = data.failed_ips || ''
    inspectStatus.value = data.status || '已完成'
  } catch (e) {
    inspectStatus.value = '失败'
    inspectResult.value = String(e?.message || '执行失败')
  } finally {
    loading.value = false
  }
}

function handleCurrentDetail() {
  // 刷新本次详情
}

async function handlePollHistory() {
  try {
    const resp = await fetchHttpPollHistory({ page: 1, page_size: 10 })
    const data = resp?.data?.data ?? {}
    inspectResult.value = JSON.stringify(data, null, 2)
  } catch (e) {
    // ignore
  }
}
</script>

<template>
  <div class="quick-call-http-poll-panel">
    <el-form label-position="top" class="poll-form">
      <el-form-item>
        <el-input v-model="queryInput" placeholder="ID | 接口地址 | 入参" />
      </el-form-item>

      <el-form-item>
        <el-checkbox v-model="useVip">使用VIP:</el-checkbox>
        <el-checkbox v-model="vipOnlyOnline" class="ml-12">仅在线</el-checkbox>
      </el-form-item>

      <el-form-item>
        <el-select v-model="vipSelect" placeholder="VIP选择（单选）" style="width: 100%">
          <el-option label="VIP-1" value="vip1" />
          <el-option label="VIP-2" value="vip2" />
        </el-select>
      </el-form-item>

      <el-form-item required>
        <template #label>
          <span>轮询IP:</span>
        </template>
        <el-input
          v-model="pollIps"
          type="textarea"
          :rows="3"
          placeholder="输入IP，多个按';'号分隔"
        />
      </el-form-item>

      <el-form-item>
        <div class="action-btns">
          <el-button type="primary" :loading="loading" @click="handleStartPoll">开始轮询</el-button>
          <el-button @click="handleCurrentDetail">本次详情(刷新)</el-button>
          <el-button @click="handlePollHistory">轮询历史</el-button>
        </div>
      </el-form-item>

      <el-form-item>
        <template #label>
          <span>巡检结果：</span>
          <el-tag :type="inspectStatus === '已完成' ? 'success' : inspectStatus === '失败' ? 'danger' : 'warning'" size="small">
            {{ inspectStatus }}
          </el-tag>
        </template>
        <el-input v-model="inspectResult" type="textarea" :rows="3" placeholder="" />
      </el-form-item>

      <el-form-item label="失败IP:">
        <el-input v-model="failedIps" type="textarea" :rows="2" placeholder="" />
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.quick-call-http-poll-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.poll-form :deep(.el-form-item__label) {
  font-size: 13px;
  color: #606266;
  padding-bottom: 4px;
}
.ml-12 {
  margin-left: 12px;
}
.action-btns {
  display: flex;
  gap: 10px;
}
</style>
