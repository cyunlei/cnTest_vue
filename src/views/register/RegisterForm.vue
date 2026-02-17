<template>
  <div>
    <h2 class="card-title">注册你的cnTest账户</h2>
    <p class="login-hint">
      已有账户?<a href="javascript:;" class="link" @click="$emit('toLogin')">前去登录</a>
      <span class="arrow">→</span>
    </p>

    <div class="register-tabs">
      <!-- <button
        :class="['tab', { active: regType === 'phone' }]"
        @click="regType = 'phone'"
      >
        手机注册
      </button> -->
      <button
        :class="['tab', { active: regType === 'email' }]"
        @click="regType = 'email'"
      >
        邮箱注册
      </button>
    </div>

    <div v-if="regType === 'phone'" class="form-body">
      <div class="field">
        <div class="input-wrap">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </span>
          <input v-model="phone" type="tel" placeholder="输入手机号" class="input" maxlength="11" />
        </div>
      </div>
      <button type="button" class="btn-next" @click="handlePhoneNext">下一步</button>
    </div>

    <div v-else class="form-body">
      <div class="field">
        <div class="input-wrap">
          <span class="input-icon">
            <img :src="mailIcon" alt="" width="18" height="18" class="icon-img" />
          </span>
          <input v-model="email" type="email" placeholder="输入邮箱" class="input" @input="onEmailInput" />
        </div>
        <p v-if="emailCheckMsg" class="field-error">{{ emailCheckMsg }}</p>
        <p v-else-if="emailSendTip" class="field-tip">{{ emailSendTip }}</p>
      </div>
      <div class="field row-wrap">
        <div class="input-wrap flex-1">
          <input v-model="code" type="text" placeholder="输入验证码" class="input" maxlength="6" />
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
      <div class="field">
        <div class="input-wrap">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </span>
          <input v-model="username" type="text" placeholder="用户名" class="input" @input="onUsernameInput" />
        </div>
        <p v-if="usernameCheckMsg" class="field-error">{{ usernameCheckMsg }}</p>
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
            placeholder="密码"
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
      <div class="field">
        <div class="input-wrap">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </span>
          <input v-model="phone" type="tel" placeholder="手机号" class="input" maxlength="11" />
        </div>
      </div>
      <button class="btn-submit" :disabled="loading" @click="handleRegister">
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </div>

    <label class="agreement-label">
      <input type="checkbox" v-model="agreed" />
      <span>已阅读并同意以下协议</span>
      <a href="#" class="link">《服务条款》</a>
      <a href="#" class="link">《隐私协议》</a>
    </label>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api'
import { UserStore } from '@/stores/module/UserStore'
import mailIcon from '@/assets/icons/_mail.svg'

const emit = defineEmits(['toLogin'])

const router = useRouter()
const userStore = UserStore()

const regType = ref('email')
const email = ref('')
const code = ref('')
const username = ref('')
const password = ref('')
const phone = ref('')
const showPwd = ref(false)
const agreed = ref(false)
const loading = ref(false)
const codeSending = ref(false)
const countdown = ref(0)
const emailSendTip = ref('')
const emailCheckMsg = ref('')
const usernameCheckMsg = ref('')

function useDebounce(fn, delay) {
  let timer = null
  return (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

async function checkEmailExist() {
  const val = email.value?.trim()
  emailCheckMsg.value = ''
  if (!val) return
  try {
    const res = await api.checkAccountExistApi({ email: val })
    const body = res.data || {}
    if (body.code !== 200 && body.msg) emailCheckMsg.value = body.msg
  } catch {
    emailCheckMsg.value = ''
  }
}

async function checkUsernameExist() {
  const val = username.value?.trim()
  usernameCheckMsg.value = ''
  if (!val) return
  try {
    const res = await api.checkAccountExistApi({ username: val })
    const body = res.data || {}
    if (body.code !== 200 && body.msg) usernameCheckMsg.value = body.msg
  } catch {
    usernameCheckMsg.value = ''
  }
}

const onEmailInput = useDebounce(checkEmailExist, 400)
const onUsernameInput = useDebounce(checkUsernameExist, 400)

let countdownTimer = null

async function sendEmailCode() {
  const val = email.value?.trim()
  if (!val) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  codeSending.value = true
  emailSendTip.value = ''
  try {
    const res = await api.sendEmailCodeApi({ email: val })
    const body = res.data || {}
    if (body.code === 200) {
      ElMessage.success(body.msg || '验证码已发送')
      emailSendTip.value = body.msg || '验证码已发送'
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

function handlePhoneNext() {
  if (!phone.value?.trim()) {
    ElMessage.warning('请输入手机号')
    return
  }
  ElMessage.info('手机注册流程可在此扩展')
}

async function handleRegister() {
  if (!agreed.value) {
    ElMessage.warning('请先阅读并同意服务条款与隐私协议')
    return
  }
  const e = email.value?.trim()
  const c = code.value?.trim()
  const u = username.value?.trim()
  const p = password.value?.trim()
  const ph = phone.value?.trim()
  if (!e || !c || !u || !p) {
    ElMessage.warning('请填写邮箱、验证码、用户名和密码')
    return
  }
  loading.value = true
  try {
    const res = await api.registerApi({
      username: u,
      password: p,
      email: e,
      phone: ph || undefined,
      code: c
    })
    const body = res.data || {}
    if (body.code === 200) {
      ElMessage.success(body.msg || '注册成功')
      try {
        const loginRes = await api.emailCodeLoginApi({ email: e, code: c })
        const loginBody = loginRes.data || {}
        if (loginBody.code === 200 && loginBody.data?.token) {
          userStore.setToken(loginBody.data.token)
          if (loginBody.data.refresh) localStorage.setItem('refresh', loginBody.data.refresh)
          router.push('/home')
          return
        }
      } catch {
        // 自动登录失败
      }
      emit('toLogin')
    } else {
      ElMessage.warning(body.msg || body.detail || '注册失败')
    }
  } catch (err) {
    ElMessage.error(err.message || '请求失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@use './Register.scss';
</style>
