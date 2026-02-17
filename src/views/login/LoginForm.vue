<template>
  <div>
    <h2 class="card-title">登录你的cnTest账户</h2>
    <p class="register-hint">
      没有账户?<a href="javascript:;" class="link" @click="$emit('toRegister')">免费注册</a>
      <span class="arrow">→</span>
    </p>

    <div class="login-tabs">
      <button
        :class="['tab', { active: loginType === 'phone' }]"
        @click="loginType = 'phone'"
      >
        邮箱验证码登录
      </button>
      <button
        :class="['tab', { active: loginType === 'password' }]"
        @click="loginType = 'password'"
      >
        账号密码登录
      </button>
    </div>

    <div v-if="loginType === 'phone'" class="form-body">
      <div class="field">
        <div class="input-wrap">
          <span class="input-icon">
            <img :src="mailIcon" alt="" width="18" height="18" class="icon-img" />
          </span>
          <input
            v-model="email"
            type="email"
            placeholder="输入邮箱"
            class="input"
          />
        </div>
      </div>
      <div class="field row-wrap">
        <div class="input-wrap flex-1">
          <input v-model="emailCode" type="text" placeholder="输入验证码" class="input" maxlength="6" />
        </div>
        <button
          type="button"
          class="btn-code"
          :disabled="codeSending || countdown > 0"
          @click="sendEmailCode"
        >
          {{ countdown > 0 ? `${countdown}s 后重发` : (codeSending ? '发送中...' : '获取验证码') }}
        </button>
      </div>
      <label class="remember">
        <input type="checkbox" v-model="rememberAccount" />
        <span>记住账号</span>
      </label>
    </div>

    <div v-else class="form-body">
      <div class="field">
        <div class="input-wrap">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </span>
          <input
            v-model="account"
            type="text"
            placeholder="输入账号"
            class="input"
          />
        </div>
      </div>
      <div class="field">
        <div class="input-wrap">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </span>
          <input
            v-model="password"
            :type="showPwd ? 'text' : 'password'"
            placeholder="输入密码"
            class="input"
          />
          <span class="eye" @click="showPwd = !showPwd">
            <svg v-if="!showPwd" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z"/>
            </svg>
          </span>
        </div>
      </div>
      <label class="remember">
        <input type="checkbox" v-model="rememberAccount" />
        <span>记住账号</span>
      </label>
    </div>

    <button class="btn-login" :disabled="loading" @click="handleLogin">
      {{ loading ? '登录中...' : '登录' }}
    </button>
    <p class="agreement">
      点击「登录」表示已阅读并同意<a href="#" class="link">服务条款</a>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api'
import { UserStore } from '@/stores/module/UserStore'
import mailIcon from '@/assets/icons/_mail.svg'

defineEmits(['toRegister'])

const router = useRouter()
const userStore = UserStore()

const loginType = ref('phone')
const email = ref('')
const emailCode = ref('')
const account = ref('')
const password = ref('')
const showPwd = ref(false)
const rememberAccount = ref(false)
const loading = ref(false)
const codeSending = ref(false)
const countdown = ref(0)

const EMAIL_REG = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
function isEmailValid(val) {
  return val && EMAIL_REG.test(val.trim())
}

let countdownTimer = null
async function sendEmailCode() {
  const val = email.value?.trim()
  if (!val) {
    ElMessage.warning('请输入邮箱')
    return
  }
  if (!isEmailValid(val)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return
  }
  codeSending.value = true
  try {
    const res = await api.sendEmailCodeApi({ email: val })
    const body = res.data || {}
    if (body.code === 200) {
      ElMessage.success(body.msg || '验证码已发送')
      countdown.value = 60
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0 && countdownTimer) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
      }, 1000)
    } else {
      ElMessage.warning(body.msg || '发送失败')
    }
  } catch (e) {
    ElMessage.error(e.message || '发送失败')
  } finally {
    codeSending.value = false
  }
}

async function handleLogin() {
  if (loginType.value === 'phone') {
    const e = email.value?.trim()
    const c = emailCode.value?.trim()
    if (!e) {
      ElMessage.warning('请输入邮箱')
      return
    }
    if (!isEmailValid(e)) {
      ElMessage.warning('请输入正确的邮箱格式')
      return
    }
    if (!c) {
      ElMessage.warning('请输入验证码')
      return
    }
    loading.value = true
    try {
      const res = await api.emailCodeLoginApi({ email: e, code: c })
      const body = res.data || {}
      if (body.code === 200 && body.data) {
        const { token, refresh } = body.data
        if (token) userStore.setToken(token)
        if (refresh) localStorage.setItem('refresh', refresh)
        ElMessage.success(body.msg || '登录成功')
        router.push('/home')
      } else {
        ElMessage.warning(body.msg || body.detail || '登录失败')
      }
    } catch (err) {
      ElMessage.error(err.message || '请求失败，请检查网络')
    } finally {
      loading.value = false
    }
    return
  }
  if (!account.value || !password.value) {
    ElMessage.warning('请输入账号和密码')
    return
  }
  loading.value = true
  try {
    const res = await api.loginApi({ username: account.value, password: password.value })
    const body = res.data || {}
    if (body.code === 200 && body.data) {
      const { token, refresh } = body.data
      if (token) userStore.setToken(token)
      if (refresh) localStorage.setItem('refresh', refresh)
      ElMessage.success(body.msg || '登录成功')
      router.push('/home')
    } else {
      ElMessage.warning(body.msg || body.detail || '登录失败')
    }
  } catch (err) {
    ElMessage.error(err.message || '请求失败，请检查网络')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@use './Login.scss';

.field.row-wrap {
  display: flex;
  gap: 12px;
  align-items: center;
  .input-wrap.flex-1 {
    flex: 1;
    margin-bottom: 0;
  }
}
.btn-code {
  flex-shrink: 0;
  height: 48px;
  padding: 0 16px;
  border: 1px solid #1890ff;
  border-radius: 10px;
  background: #fff;
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  &:hover:not(:disabled) {
    background: #e6f7ff;
  }
  &:disabled {
    border-color: #d9d9d9;
    color: #999;
    cursor: not-allowed;
  }
}
</style>
