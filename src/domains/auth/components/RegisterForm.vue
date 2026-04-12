<script setup>
/**
 * 注册表单组件
 * 位置: domains/auth/components/
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'
import { useMessage } from '@/shared/ui'
import { createUser, sendEmailCode, loginByEmailCode, checkAccountExist } from '../api'
import { useCountdown, useFormValidator, ValidationRules, useDebounce } from '@/shared/composables'

// ======== Emits ========
const emit = defineEmits(['switchPanel'])

// ======== Hooks ========
const router = useRouter()
const authStore = useAuthStore()
const { showSuccess, showWarning, showError } = useMessage()
const { countdown, isCounting, start: startCountdown } = useCountdown({ seconds: 60 })

// ======== 表单验证 ========
const emailValidator = useFormValidator({
  rules: [ValidationRules.required('请输入邮箱'), ValidationRules.email()]
})
const codeValidator = useFormValidator({
  rules: [ValidationRules.required('请输入验证码'), ValidationRules.minLength(4, '验证码至少4位')]
})
const usernameValidator = useFormValidator({
  rules: [ValidationRules.required('请输入用户名'), ValidationRules.minLength(2, '用户名至少2位')]
})
const passwordValidator = useFormValidator({
  rules: [ValidationRules.required('请输入密码'), ValidationRules.minLength(6, '密码至少6位')]
})
const phoneValidator = useFormValidator({
  rules: [ValidationRules.phone('请输入正确的手机号')]
})

// ======== State ========
const loading = ref(false)
const codeSending = ref(false)
const agreed = ref(false)
const emailCheckMsg = ref('')
const usernameCheckMsg = ref('')

// ======== Computed ========
const isEmailValid = computed(() => {
  return emailValidator.value.value && !emailValidator.error.value
})

// ======== 防抖检查账号是否存在 ========
const debouncedCheckEmail = useDebounce(async () => {
  const val = emailValidator.value.value.trim()
  if (!val) return
  try {
    const res = await checkAccountExist({ email: val })
    const body = res.data
    if (body.code !== 200 && body.msg) {
      emailCheckMsg.value = body.msg
    } else {
      emailCheckMsg.value = ''
    }
  } catch {
    emailCheckMsg.value = ''
  }
}, { delay: 400 })

const debouncedCheckUsername = useDebounce(async () => {
  const val = usernameValidator.value.value.trim()
  if (!val) return
  try {
    const res = await checkAccountExist({ username: val })
    const body = res.data
    if (body.code !== 200 && body.msg) {
      usernameCheckMsg.value = body.msg
    } else {
      usernameCheckMsg.value = ''
    }
  } catch {
    usernameCheckMsg.value = ''
  }
}, { delay: 400 })

// ======== Methods ========

/**
 * 发送邮箱验证码
 */
async function handleSendCode() {
  if (!emailValidator.validate()) {
    showWarning(emailValidator.error.value)
    return
  }

  codeSending.value = true
  try {
    const res = await sendEmailCode({ email: emailValidator.value.value.trim() })
    const body = res.data
    if (body.code === 200) {
      showSuccess(body.msg || '验证码已发送')
      startCountdown()
    } else {
      showWarning(body.msg || '发送失败')
    }
  } catch (e) {
    showError(e?.message || '发送失败')
  } finally {
    codeSending.value = false
  }
}

/**
 * 处理注册
 */
async function handleRegister() {
  // 检查协议
  if (!agreed.value) {
    showWarning('请先阅读并同意服务条款与隐私协议')
    return
  }

  // 验证表单
  const validators = [
    emailValidator,
    codeValidator,
    usernameValidator,
    passwordValidator
  ]

  for (const validator of validators) {
    if (!validator.validate()) {
      showWarning(validator.error.value)
      return
    }
  }

  // 检查账号是否存在提示
  if (emailCheckMsg.value || usernameCheckMsg.value) {
    showWarning(emailCheckMsg.value || usernameCheckMsg.value)
    return
  }

  const params = {
    email: emailValidator.value.value.trim(),
    code: codeValidator.value.value.trim(),
    username: usernameValidator.value.value.trim(),
    password: passwordValidator.value.value,
    phone: phoneValidator.value.value.trim() || undefined
  }

  loading.value = true
  try {
    const res = await createUser(params)
    const body = res.data
    if (body.code === 200) {
      showSuccess(body.msg || '注册成功')
      // 尝试自动登录
      await autoLogin(params.email, params.code)
    } else {
      showWarning(body.msg || body.detail || '注册失败')
    }
  } catch (err) {
    showError(err?.message || '请求失败')
  } finally {
    loading.value = false
  }
}

/**
 * 自动登录
 */
async function autoLogin(email, code) {
  try {
    const res = await loginByEmailCode({ email, code })
    const body = res.data
    if (body.code === 200 && body.data?.token) {
      authStore.loginSuccess(body.data)
      router.push('/dashboard')
    } else {
      emit('switchPanel')
    }
  } catch {
    emit('switchPanel')
  }
}

/**
 * 邮箱输入处理（防抖检查）
 */
function onEmailInput() {
  emailCheckMsg.value = ''
  debouncedCheckEmail.debouncedFn()
}

/**
 * 用户名输入处理（防抖检查）
 */
function onUsernameInput() {
  usernameCheckMsg.value = ''
  debouncedCheckUsername.debouncedFn()
}
</script>

<template>
  <div class="register-form">
    <h2 class="card-title">注册你的cnTest账户</h2>
    <p class="login-hint">
      已有账户?
      <a href="javascript:;" class="link" @click="emit('switchPanel')">前去登录</a>
      <span class="arrow">→</span>
    </p>

    <!-- 注册方式 Tab -->
    <div class="register-tabs">
      <button class="tab active">
        邮箱注册
      </button>
    </div>

    <!-- 邮箱注册表单 -->
    <div class="form-body">
      <div class="field">
        <div class="input-wrap" :class="{ 'is-error': emailValidator.error.value || emailCheckMsg }">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </span>
          <input
            v-model="emailValidator.value.value"
            type="email"
            placeholder="输入邮箱"
            class="input"
            @blur="emailValidator.validate"
            @input="onEmailInput"
          />
        </div>
        <p v-if="emailCheckMsg" class="field-error">{{ emailCheckMsg }}</p>
        <p v-else-if="emailValidator.error.value" class="field-error">{{ emailValidator.error.value }}</p>
      </div>

      <div class="field row-wrap">
        <div class="input-wrap flex-1" :class="{ 'is-error': codeValidator.error.value }">
          <input
            v-model="codeValidator.value.value"
            type="text"
            placeholder="输入验证码"
            class="input"
            maxlength="6"
            @blur="codeValidator.validate"
          />
        </div>
        <button
          type="button"
          class="btn-code"
          :disabled="codeSending || isCounting || !isEmailValid"
          @click="handleSendCode"
        >
          {{ isCounting ? `${countdown}s 后重发` : (codeSending ? '发送中...' : '获取验证码') }}
        </button>
      </div>
      <p v-if="codeValidator.error.value" class="field-error">{{ codeValidator.error.value }}</p>

      <div class="field">
        <div class="input-wrap" :class="{ 'is-error': usernameValidator.error.value || usernameCheckMsg }">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </span>
          <input
            v-model="usernameValidator.value.value"
            type="text"
            placeholder="用户名"
            class="input"
            @blur="usernameValidator.validate"
            @input="onUsernameInput"
          />
        </div>
        <p v-if="usernameCheckMsg" class="field-error">{{ usernameCheckMsg }}</p>
        <p v-else-if="usernameValidator.error.value" class="field-error">{{ usernameValidator.error.value }}</p>
      </div>

      <div class="field">
        <div class="input-wrap" :class="{ 'is-error': passwordValidator.error.value }">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/>
            </svg>
          </span>
          <input
            v-model="passwordValidator.value.value"
            type="password"
            placeholder="密码"
            class="input"
            @blur="passwordValidator.validate"
          />
        </div>
        <p v-if="passwordValidator.error.value" class="field-error">{{ passwordValidator.error.value }}</p>
      </div>

      <div class="field">
        <div class="input-wrap">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </span>
          <input
            v-model="phoneValidator.value.value"
            type="tel"
            placeholder="手机号（可选）"
            class="input"
            maxlength="11"
          />
        </div>
        <p v-if="phoneValidator.error.value" class="field-error">{{ phoneValidator.error.value }}</p>
      </div>

      <button class="btn-submit" :disabled="loading" @click="handleRegister">
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </div>

    <label class="agreement-label">
      <input v-model="agreed" type="checkbox" />
      <span>已阅读并同意以下协议</span>
      <a href="#" class="link">《服务条款》</a>
      <a href="#" class="link">《隐私协议》</a>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.card-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
}

.login-hint {
  margin: 0 0 28px;
  font-size: 14px;
  color: #666;

  .link {
    color: #1890ff;
    text-decoration: none;
    margin-left: 4px;

    &:hover {
      text-decoration: underline;
    }
  }

  .arrow {
    margin-left: 4px;
    color: #1890ff;
    font-size: 14px;
  }
}

.register-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  background: #f0f0f0;
  border-radius: 10px;
  padding: 4px;
}

.tab {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  background: #fff;
  color: #1a1a1a;
  font-weight: 500;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.form-body {
  margin-bottom: 20px;
}

.field {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.field-error {
  margin: 6px 0 0;
  font-size: 12px;
  color: #f5222d;
  line-height: 1.4;
}

.row-wrap {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.input-wrap {
  display: flex;
  align-items: center;
  height: 48px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 0 14px;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15);
  }

  &.is-error {
    border-color: #f5222d;
    box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.15);
  }

  &.flex-1 {
    flex: 1;
  }
}

.input-icon {
  display: flex;
  align-items: center;
  margin-right: 10px;
  color: #999;
}

.input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #1a1a1a;
  background: transparent;

  &::placeholder {
    color: #bbb;
  }
}

.btn-submit {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 10px;
  background: #1890ff;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #40a9ff;
  }

  &:active {
    background: #096dd9;
  }

  &:disabled {
    background: #bae7ff;
    cursor: not-allowed;
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

.agreement-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  user-select: none;
  flex-wrap: wrap;

  input {
    width: 16px;
    height: 16px;
    accent-color: #1890ff;
  }

  .link {
    color: #1890ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
