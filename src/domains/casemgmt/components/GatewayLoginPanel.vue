<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  gatewayAuth: 'off',
  accountLogin: 'off'
})

const onSetAccount = () => {
  router.push({
    path: '/module-settings',
    query: { tab: 'account-auth' }
  })
}
</script>

<template>
  <div class="gateway-login-panel">
    <div class="gateway-row">
      <div class="gateway-label-wrap">
        <span class="gateway-label-text">网关认证</span>
        <el-tooltip placement="top">
          <template #content>
            <div class="gateway-tooltip-text">
              Color网关认证配置
            </div>
          </template>
          <svg
            viewBox="64 64 896 896"
            class="gateway-help-icon"
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
      <el-select v-model="form.gatewayAuth" size="small" class="gateway-select">
        <el-option label="关闭" value="off" />
        <el-option label="开启" value="on" />
      </el-select>
    </div>

    <div class="gateway-row">
      <div class="gateway-label-wrap">
        <span class="gateway-label-text">账号登录</span>
        <el-tooltip placement="top">
          <template #content>
            <div class="gateway-tooltip-text">
              需在账号认证配置账号及密码
            </div>
          </template>
          <svg
            viewBox="64 64 896 896"
            class="gateway-help-icon"
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
        <button class="set-account-btn" type="button" @click="onSetAccount">
          设置账号
        </button>
      </div>
      <el-select v-model="form.accountLogin" size="small" class="gateway-select">
        <el-option label="关闭" value="off" />
        <el-option label="开启" value="on" />
      </el-select>
    </div>
  </div>
</template>

<style scoped>
.gateway-login-panel {
  padding: 12px 16px;
  background: #fff;
}

.gateway-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.gateway-label-wrap {
  display: flex;
  align-items: center;
  min-width: 220px;
  font-size: 12px;
  color: #606266;
}

.gateway-label-text {
  margin-right: 4px;
}

.gateway-help-icon {
  font-size: 14px;
  color: #1890ff;
  cursor: pointer;
  margin-right: 6px;
}

.set-account-btn {
  border: none;
  background: transparent;
  padding: 0;
  margin-left: 4px;
  font-size: 12px;
  color: #1890ff;
  cursor: pointer;
}

.gateway-select {
  width: 160px;
}

.gateway-tooltip-text {
  max-width: 220px;
  white-space: normal;
  word-break: break-all;
}
</style>
