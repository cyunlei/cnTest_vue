<script setup>
/**
 * 登录表单组件
 * 位置: domains/auth/components/ (领域组件层)
 * 遵循手册: Props/Emits 协议、逻辑复用
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/useAuthStore'
import { loginByPassword, loginByEmailCode, sendEmailCode } from '../api'
import { useCountdown, useFormValidator, ValidationRules } from '@/shared/composables'
// [验证码已临时禁用] import CaptchaModal from './CaptchaModal.vue'

// ======== Emits ========
const emit = defineEmits(['switchPanel'])

// ======== Hooks ========
const router = useRouter()
const authStore = useAuthStore()
const { countdown, isCounting, start: startCountdown } = useCountdown({ seconds: 60 })

// ======== 表单验证 ========
const emailValidator = useFormValidator({
  rules: [ValidationRules.required('请输入邮箱'), ValidationRules.email()]
})
const codeValidator = useFormValidator({
  rules: [ValidationRules.required('请输入验证码'), ValidationRules.minLength(4, '验证码至少4位')]
})
const accountValidator = useFormValidator({
  rules: [ValidationRules.required('请输入账号')]
})
const passwordValidator = useFormValidator({
  rules: [ValidationRules.required('请输入密码'), ValidationRules.minLength(6, '密码至少6位')]
})

// ======== State ========
const loginType = ref('email')
const loading = ref(false)
const codeSending = ref(false)
const rememberAccount = ref(false)
const slideDirection = ref('left')
// [验证码已临时禁用] const captchaVisible = ref(false)
// [验证码已临时禁用] const tempToken = ref('')

// ======== Computed ========
const isEmailValid = computed(() => {
  return emailValidator.value.value && !emailValidator.error.value
})

// ======== Methods ========

/**
 * 切换登录方式
 * @param {'email'|'password'} type
 */
function switchLoginType(type) {
  if (type === loginType.value) return
  slideDirection.value = type === 'email' ? 'right' : 'left'
  loginType.value = type
}

/**
 * 发送邮箱验证码
 */
async function handleSendCode() {
  if (!emailValidator.validate()) {
    ElMessage.warning(emailValidator.error.value)
    return
  }

  codeSending.value = true
  try {
    const res = await sendEmailCode({ email: emailValidator.value.value.trim() })
    const body = res.data
    if (body.code === 200) {
      ElMessage.success(body.msg || '验证码已发送')
      startCountdown()
    } else {
      ElMessage.warning(body.msg || '发送失败')
    }
  } catch (e) {
    ElMessage.error(e?.message || '发送失败')
  } finally {
    codeSending.value = false
  }
}

/**
 * 处理登录
 */
async function handleLogin() {
  if (loginType.value === 'email') {
    // 邮箱验证码登录
    if (!emailValidator.validate() || !codeValidator.validate()) {
      ElMessage.warning(emailValidator.error.value || codeValidator.error.value)
      return
    }
    await doEmailLogin({
      email: emailValidator.value.value.trim(),
      code: codeValidator.value.value.trim()
    })
  } else {
    // 账号密码登录 - 先校验表单
    if (!accountValidator.validate() || !passwordValidator.validate()) {
      ElMessage.warning(accountValidator.error.value || passwordValidator.error.value)
      return
    }
    // [验证码已临时禁用] 弹出验证码校验
    // [验证码已临时禁用] captchaVisible.value = true
    // [验证码已临时禁用] 临时直接执行密码登录
    await doPasswordLogin({
      username: accountValidator.value.value.trim(),
      password: passwordValidator.value.value
    })
  }
}

/**
 * [验证码已临时禁用] 验证码验证成功后的回调
 * @param {string} token - 临时令牌
 */
// [验证码已临时禁用] async function onCaptchaVerified(token) {
// [验证码已临时禁用]   tempToken.value = token
// [验证码已临时禁用]   await doPasswordLogin({
// [验证码已临时禁用]     username: accountValidator.value.value.trim(),
// [验证码已临时禁用]     password: passwordValidator.value.value,
// [验证码已临时禁用]     temp_token: token
// [验证码已临时禁用]   })
// [验证码已临时禁用] }

/**
 * [验证码已临时禁用] 验证码弹窗取消
 */
// [验证码已临时禁用] function onCaptchaCancel() {
// [验证码已临时禁用]   tempToken.value = ''
// [验证码已临时禁用] }

/**
 * 执行邮箱验证码登录
 */
async function doEmailLogin(params) {
  loading.value = true
  try {
    const res = await loginByEmailCode(params)
    const body = res.data
    if (body.code === 200 && body.data) {
      authStore.loginSuccess(body.data)
      ElMessage.success(body.msg || '登录成功')
      router.push('/dashboard')
    } else {
      ElMessage.warning(body.msg || body.detail || '登录失败')
    }
  } catch (err) {
    ElMessage.error(err?.message || '请求失败，请检查网络')
  } finally {
    loading.value = false
  }
}

/**
 * 执行账号密码登录
 */
async function doPasswordLogin(params) {
  loading.value = true
  try {
    const res = await loginByPassword(params)
    const body = res.data
    if (body.code === 200 && body.data) {
      authStore.loginSuccess(body.data)
      ElMessage.success(body.msg || '登录成功')
      router.push('/dashboard')
    } else {
      ElMessage.warning(body.msg || body.detail || '登录失败')
    }
  } catch (err) {
    ElMessage.error(err?.message || '请求失败，请检查网络')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-form">
    <h2 class="card-title">登录你的cnTest账户</h2>
    <p class="register-hint">
      没有账户?
      <a href="javascript:;" class="link" @click="emit('switchPanel')">免费注册</a>
      <span class="arrow">→</span>
    </p>

    <!-- 登录方式 Tab - 带滑动指示器 -->
    <div class="login-tabs">
      <div 
        class="tab-slider"
        :class="{ 'is-right': loginType === 'password' }"
      />
      <button
        :class="['tab', { active: loginType === 'email' }]"
        @click="switchLoginType('email')"
      >
        邮箱验证码登录
      </button>
      <button
        :class="['tab', { active: loginType === 'password' }]"
        @click="switchLoginType('password')"
      >
        账号密码登录
      </button>
    </div>

    <!-- 表单容器 - 带滑动动画 -->
    <div class="form-container">
      <Transition 
        :name="slideDirection === 'left' ? 'slide-left' : 'slide-right'"
        mode="out-in"
      >
        <!-- 邮箱验证码登录表单 -->
        <div v-if="loginType === 'email'" key="email" class="form-body">
          <div class="field">
            <div class="input-wrap" :class="{ 'is-error': emailValidator.error.value }">
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
              />
            </div>
            <p v-if="emailValidator.error.value" class="field-error">{{ emailValidator.error.value }}</p>
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

          <label class="remember">
            <input v-model="rememberAccount" type="checkbox" />
            <span>记住账号</span>
          </label>
        </div>

        <!-- 账号密码登录表单 -->
        <div v-else key="password" class="form-body">
          <div class="field">
            <div class="input-wrap" :class="{ 'is-error': accountValidator.error.value }">
              <span class="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </span>
              <input
                v-model="accountValidator.value.value"
                type="text"
                placeholder="输入账号"
                class="input"
                @blur="accountValidator.validate"
              />
            </div>
            <p v-if="accountValidator.error.value" class="field-error">{{ accountValidator.error.value }}</p>
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
                placeholder="输入密码"
                class="input"
                @blur="passwordValidator.validate"
              />
            </div>
            <p v-if="passwordValidator.error.value" class="field-error">{{ passwordValidator.error.value }}</p>
          </div>

          <label class="remember">
            <input v-model="rememberAccount" type="checkbox" />
            <span>记住账号</span>
          </label>
        </div>
      </Transition>
    </div>

    <button class="btn-login" :disabled="loading" @click="handleLogin">
      {{ loading ? '登录中...' : '登录' }}
    </button>

    <p class="agreement">
      点击「登录」表示已阅读并同意<a href="#" class="link">服务条款</a>
    </p>

    <!-- [验证码已临时禁用] 图片验证码弹窗
    <CaptchaModal
      v-model:visible="captchaVisible"
      @verified="onCaptchaVerified"
      @cancel="onCaptchaCancel"
    />
    -->
  </div>
</template>

<style lang="scss" scoped>
.card-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
}

.register-hint {
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

/* ========== 登录方式 Tab - 带滑动指示器 ========== */
.login-tabs {
  position: relative;
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  background: #f0f0f0;
  border-radius: 10px;
  padding: 4px;
}

/* 滑动指示器 */
.tab-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 1;

  &.is-right {
    transform: translateX(100%);
  }
}

.tab {
  position: relative;
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  background: transparent;
  color: #999;
  transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;

  &.active {
    color: #1a1a1a;
    font-weight: 500;
  }

  &:hover:not(.active) {
    color: #666;
  }
}

/* ========== 表单容器与滑动动画 ========== */
.form-container {
  position: relative;
  overflow: hidden;
  min-height: 180px;
}

.form-body {
  margin-bottom: 20px;
}

/* 向左滑动动画 - 邮箱验证码 → 账号密码 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

/* 向右滑动动画 - 账号密码 → 邮箱验证码 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
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

.remember {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  user-select: none;

  input {
    width: 16px;
    height: 16px;
    accent-color: #1890ff;
  }
}

.btn-login {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 10px;
  background: #1890ff;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 16px;
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

.agreement {
  margin: 0 0 24px;
  font-size: 12px;
  color: #999;
  text-align: center;

  .link {
    color: #1890ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
