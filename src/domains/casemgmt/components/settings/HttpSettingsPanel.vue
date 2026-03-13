<script setup>
import { reactive } from 'vue'

const settingsForm = reactive({
  waitTimeoutMs: 10000,
  invokeRetryCount: 0,
  sleepSeconds: 0,
  parallelCount: 0,
  assertRetryCount: 0
})
</script>

<template>
  <div class="http-settings-panel">
    <div class="settings-row">
      <div class="settings-label-wrap">
        <span class="settings-label-text">执行等待最大时长(ms)</span>
        <el-tooltip placement="top">
          <template #content>
            <div class="settings-tooltip-text">
              接口调用响应超时时间设置（毫秒），最大不超过600000毫秒（10分钟）
            </div>
          </template>
          <svg
            viewBox="64 64 896 896"
            class="settings-help-icon"
            focusable="false"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
            <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344.3 352 380.7 352 420v7.6c0 4.3 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-24.3 19.7-44 44-44h7.6c22.5 0 39.6 6.5 52.1 18.8 9.8 9.6 15.3 22.7 15.3 36.7 0 14-5.4 27.3-15.3 37.1L527.7 474c-24.5 24.3-40.5 56-44.2 90.1l-3.1 29.2c-.4 4.2 2.9 7.9 7.1 7.9h48.2c4 0 7.4-3 7.9-7l2.5-23.8c2.2-20.7 11.2-40.3 25.4-54.6l39.6-39.2C632.7 353.3 640 334 640 305.4c0-31.7-12.3-61.7-34.4-83.7zM472 664a48 48 0 1096 0 48 48 0 10-96 0z" />
          </svg>
        </el-tooltip>
      </div>
      <el-input-number
        v-model="settingsForm.waitTimeoutMs"
        :min="0"
        :max="600000"
        size="small"
        :controls="false"
        class="settings-input"
      />
    </div>

    <div class="settings-row">
      <div class="settings-label-wrap">
        <span class="settings-label-text">调用失败重试次数</span>
      </div>
      <el-input-number
        v-model="settingsForm.invokeRetryCount"
        :min="0"
        :max="10"
        size="small"
        :controls="false"
        class="settings-input"
      />
    </div>

    <div class="settings-row">
      <div class="settings-label-wrap">
        <span class="settings-label-text">SleepTime(s)</span>
        <el-tooltip placement="top">
          <template #content>
            <div class="settings-tooltip-text">
              当前步骤执行后与下一步步骤执行的间隔时间（秒），最大不超过900秒（15分钟）
            </div>
          </template>
          <svg
            viewBox="64 64 896 896"
            class="settings-help-icon"
            focusable="false"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
            <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344.3 352 380.7 352 420v7.6c0 4.3 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-24.3 19.7-44 44-44h7.6c22.5 0 39.6 6.5 52.1 18.8 9.8 9.6 15.3 22.7 15.3 36.7 0 14-5.4 27.3-15.3 37.1L527.7 474c-24.5 24.3-40.5 56-44.2 90.1l-3.1 29.2c-.4 4.2 2.9 7.9 7.1 7.9h48.2c4 0 7.4-3 7.9-7l2.5-23.8c2.2-20.7 11.2-40.3 25.4-54.6l39.6-39.2C632.7 353.3 640 334 640 305.4c0-31.7-12.3-61.7-34.4-83.7zM472 664a48 48 0 1096 0 48 48 0 10-96 0z" />
          </svg>
        </el-tooltip>
      </div>
      <el-input-number
        v-model="settingsForm.sleepSeconds"
        :min="0"
        :max="900"
        size="small"
        :controls="false"
        class="settings-input"
      />
    </div>

    <div class="settings-row">
      <div class="settings-label-wrap">
        <span class="settings-label-text">步骤并发数</span>
        <el-tooltip placement="top">
          <template #content>
            <div class="settings-tooltip-text">
              当前步骤并发数，最大为100
            </div>
          </template>
          <svg
            viewBox="64 64 896 896"
            class="settings-help-icon"
            focusable="false"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
            <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344.3 352 380.7 352 420v7.6c0 4.3 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-24.3 19.7-44 44-44h7.6c22.5 0 39.6 6.5 52.1 18.8 9.8 9.6 15.3 22.7 15.3 36.7 0 14-5.4 27.3-15.3 37.1L527.7 474c-24.5 24.3-40.5 56-44.2 90.1l-3.1 29.2c-.4 4.2 2.9 7.9 7.1 7.9h48.2c4 0 7.4-3 7.9-7l2.5-23.8c2.2-20.7 11.2-40.3 25.4-54.6l39.6-39.2C632.7 353.3 640 334 640 305.4c0-31.7-12.3-61.7-34.4-83.7zM472 664a48 48 0 1096 0 48 48 0 10-96 0z" />
          </svg>
        </el-tooltip>
      </div>
      <el-input-number
        v-model="settingsForm.parallelCount"
        :min="0"
        :max="100"
        size="small"
        :controls="false"
        class="settings-input"
      />
    </div>

    <div class="settings-row">
      <div class="settings-label-wrap">
        <span class="settings-label-text">断言失败重试次数</span>
      </div>
      <el-input-number
        v-model="settingsForm.assertRetryCount"
        :min="0"
        :max="10"
        size="small"
        :controls="false"
        class="settings-input"
      />
    </div>
  </div>
</template>

<style scoped>
.http-settings-panel {
  padding: 12px 16px;
  background: #fff;
}

.settings-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.settings-label-wrap {
  display: flex;
  align-items: center;
  min-width: 220px;
  font-size: 12px;
  color: #606266;
}

.settings-label-text {
  margin-right: 4px;
}

.settings-help-icon {
  font-size: 14px;
  color: #1890ff;
  cursor: pointer;
}

.settings-input {
  width: 160px;
}

.settings-tooltip-text {
  max-width: 180px;
  white-space: normal;
  word-break: break-all;
}
</style>
