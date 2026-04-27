<script setup>
/**
 * 点选式图片验证码弹窗组件
 * 位置: domains/auth/components/ (领域组件层)
 * 用途: 账号密码登录前的点选验证码校验
 * 
 * 交互方式: 用户根据提示点击图片上的目标位置（如红色圆圈）
 */
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useMessage } from '@/shared/ui'
import { getCaptcha, verifyCaptcha, refreshCaptcha } from '@/domains/verification/api'

// ======== Props ========
const props = defineProps({
  /** 是否显示弹窗 */
  visible: {
    type: Boolean,
    default: false
  }
})

// ======== Emits ========
const emit = defineEmits(['update:visible', 'verified', 'cancel'])

// ======== Hooks ========
const { showSuccess, showWarning, showError } = useMessage()

// ======== State ========
const captchaKey = ref('')
const captchaImage = ref('')
const captchaTip = ref('')
const captchaNaturalWidth = ref(400)
const captchaNaturalHeight = ref(300)
const selectedPoints = ref([])
const loading = ref(false)
const verifying = ref(false)
const startTime = ref(0)
const trackPoints = ref([])
const imageRef = ref(null)

// ======== Computed ========
const isReady = computed(() => {
  // 根据提示中的数量判断需要点击几个点
  const match = captchaTip.value.match(/共(\d+)个/)
  const requiredCount = match ? parseInt(match[1]) : 3
  return selectedPoints.value.length === requiredCount
})

/**
 * 将原始图片坐标转换为显示坐标（用于标记点显示）
 * @param {number} originalX
 * @param {number} originalY
 * @returns {{x: number, y: number}}
 */
function originalToDisplay(originalX, originalY) {
  if (!imageRef.value) return { x: originalX, y: originalY }
  
  const img = imageRef.value
  const rect = img.getBoundingClientRect()
  const displayWidth = rect.width
  const displayHeight = rect.height
  
  const naturalWidth = captchaNaturalWidth.value
  const naturalHeight = captchaNaturalHeight.value
  
  const scaleX = displayWidth / naturalWidth
  const scaleY = displayHeight / naturalHeight
  
  return {
    x: Math.round(originalX * scaleX),
    y: Math.round(originalY * scaleY)
  }
}

// ======== Methods ========

/**
 * 获取图片验证码
 */
async function fetchCaptcha() {
  loading.value = true
  selectedPoints.value = []
  trackPoints.value = []
  startTime.value = Date.now()
  
  try {
    const res = await getCaptcha({ type: 'image', difficulty: 'medium' })
    const body = res.data
    if (body.code === 200 && body.data) {
      captchaKey.value = body.data.captcha_key
      captchaImage.value = body.data.challenge?.image_base64 || ''
      captchaTip.value = body.data.challenge?.tip || '请点击所有的目标位置'
      // 保存图片原始尺寸信息（后端可能返回）
      captchaNaturalWidth.value = body.data.challenge?.width || 400
      captchaNaturalHeight.value = body.data.challenge?.height || 300
    } else {
      showWarning(body.msg || '获取验证码失败')
    }
  } catch (err) {
    showError(err?.message || '获取验证码失败')
  } finally {
    loading.value = false
  }
}

/**
 * 刷新验证码
 */
async function handleRefresh() {
  if (!captchaKey.value || loading.value) {
    fetchCaptcha()
    return
  }
  
  loading.value = true
  selectedPoints.value = []
  trackPoints.value = []
  startTime.value = Date.now()
  
  try {
    const res = await refreshCaptcha({ old_captcha_key: captchaKey.value })
    const body = res.data
    if (body.code === 200 && body.data) {
      captchaKey.value = body.data.captcha_key
      captchaImage.value = body.data.challenge?.image_base64 || ''
      captchaTip.value = body.data.challenge?.tip || '请点击所有的目标位置'
    } else {
      showWarning(body.msg || '刷新验证码失败')
    }
  } catch (err) {
    showError(err?.message || '刷新验证码失败')
  } finally {
    loading.value = false
  }
}

/**
 * 处理图片点击
 * @param {MouseEvent} e
 */
function handleImageClick(e) {
  if (loading.value || verifying.value) return
  
  const img = e.currentTarget
  const rect = img.getBoundingClientRect()
  
  // 计算点击位置相对于图片的显示坐标
  const displayX = e.clientX - rect.left
  const displayY = e.clientY - rect.top
  
  // 获取图片原始尺寸和显示尺寸
  const naturalWidth = captchaNaturalWidth.value
  const naturalHeight = captchaNaturalHeight.value
  const displayWidth = rect.width
  const displayHeight = rect.height
  
  // 计算缩放比例（object-fit: fill 时图片拉伸填满容器）
  const scaleX = displayWidth / naturalWidth
  const scaleY = displayHeight / naturalHeight
  
  // 将显示坐标转换为原始图片坐标
  let x = Math.round(displayX / scaleX)
  let y = Math.round(displayY / scaleY)
  
  // 边界检查，确保坐标在有效范围内
  x = Math.max(0, Math.min(x, naturalWidth))
  y = Math.max(0, Math.min(y, naturalHeight))
  
  // 检查是否点击了已选中的点（取消选择）
  // 注意：这里比较的是原始图片坐标
  const clickRadius = 20 // 原始图片坐标系下的点击半径
  const existingIndex = selectedPoints.value.findIndex(p => {
    const dx = p.x - x
    const dy = p.y - y
    return Math.sqrt(dx * dx + dy * dy) <= clickRadius
  })
  
  if (existingIndex >= 0) {
    // 取消选择该点
    selectedPoints.value.splice(existingIndex, 1)
  } else {
    // 添加新点
    selectedPoints.value.push({
      x,
      y,
      t: Date.now() - startTime.value
    })
  }
}

/**
 * 处理鼠标移动（记录轨迹）
 * @param {MouseEvent} e
 */
function handleMouseMove(e) {
  if (loading.value || verifying.value) return
  
  const img = e.currentTarget
  const rect = img.getBoundingClientRect()
  
  // 同样进行坐标转换
  const displayX = e.clientX - rect.left
  const displayY = e.clientY - rect.top
  
  const naturalWidth = captchaNaturalWidth.value
  const naturalHeight = captchaNaturalHeight.value
  const displayWidth = rect.width
  const displayHeight = rect.height
  
  const scaleX = displayWidth / naturalWidth
  const scaleY = displayHeight / naturalHeight
  
  let x = Math.round(displayX / scaleX)
  let y = Math.round(displayY / scaleY)
  
  x = Math.max(0, Math.min(x, naturalWidth))
  y = Math.max(0, Math.min(y, naturalHeight))
  
  trackPoints.value.push({
    x,
    y,
    t: Date.now() - startTime.value
  })
  
  // 限制轨迹长度，避免数据过大
  if (trackPoints.value.length > 100) {
    trackPoints.value.shift()
  }
}

/**
 * 验证验证码
 */
async function handleVerify() {
  if (!isReady.value) {
    showWarning('请按照提示点击所有目标位置')
    return
  }

  verifying.value = true
  const elapsedMs = Date.now() - startTime.value

  try {
    const res = await verifyCaptcha({
      captcha_key: captchaKey.value,
      points: selectedPoints.value,
      track: trackPoints.value.slice(-20), // 只提交最近20个轨迹点
      elapsed_ms: elapsedMs
    })
    const body = res.data
    if (body.code === 200 && body.data?.success) {
      showSuccess('验证成功')
      emit('verified', body.data.temp_token)
      closeModal()
    } else {
      showWarning(body.msg || '验证失败，请重试')
      selectedPoints.value = []

      // 如果返回了新验证码，直接使用
      if (body.data?.new_captcha) {
        captchaKey.value = body.data.new_captcha.captcha_key
        captchaImage.value = body.data.new_captcha.challenge?.image_base64 || ''
        captchaTip.value = body.data.new_captcha.challenge?.tip || '请点击所有的目标位置'
      } else {
        // 否则刷新验证码
        setTimeout(() => handleRefresh(), 500)
      }
    }
  } catch (err) {
    showError(err?.message || '验证失败')
    selectedPoints.value = []
    handleRefresh()
  } finally {
    verifying.value = false
  }
}

/**
 * 关闭弹窗
 */
function closeModal() {
  emit('update:visible', false)
  emit('cancel')
  selectedPoints.value = []
  trackPoints.value = []
}

/**
 * 重置状态
 */
function resetState() {
  captchaKey.value = ''
  captchaImage.value = ''
  captchaTip.value = ''
  captchaNaturalWidth.value = 400
  captchaNaturalHeight.value = 300
  selectedPoints.value = []
  trackPoints.value = []
  startTime.value = 0
}

// ======== Watchers ========
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetState()
    fetchCaptcha()
  }
})

// ======== Lifecycle ========
onMounted(() => {
  if (props.visible) {
    fetchCaptcha()
  }
})

onUnmounted(() => {
  resetState()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="captcha-modal-overlay" @click.self="closeModal">
        <div class="captcha-modal">
          <!-- 头部 -->
          <div class="modal-header">
            <h3 class="modal-title">安全验证</h3>
            <button class="close-btn" @click="closeModal">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <!-- 内容 -->
          <div class="modal-body">
            <p class="modal-desc">{{ captchaTip || '请点击所有的目标位置' }}</p>
            
            <!-- 验证码图片区域 -->
            <div class="captcha-image-container">
              <div v-if="loading" class="captcha-loading">
                <svg class="loading-icon" viewBox="0 0 24 24" width="32" height="32">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="10">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
                <span>加载中...</span>
              </div>
              
              <template v-else>
                <img
                  v-if="captchaImage"
                  ref="imageRef"
                  :src="captchaImage"
                  alt="验证码"
                  class="captcha-image"
                  @click="handleImageClick"
                  @mousemove="handleMouseMove"
                  draggable="false"
                />
                <div v-else class="captcha-placeholder" @click="handleRefresh">
                  <span>点击刷新验证码</span>
                </div>
                
                <!-- 已选点标记 -->
                <div
                  v-for="(point, index) in selectedPoints"
                  :key="index"
                  class="point-marker"
                  :style="{ left: originalToDisplay(point.x, point.y).x + 'px', top: originalToDisplay(point.x, point.y).y + 'px' }"
                >
                  <span class="point-number">{{ index + 1 }}</span>
                </div>
              </template>
            </div>

            <!-- 底部操作栏 -->
            <div class="captcha-toolbar">
              <button class="toolbar-btn refresh" @click="handleRefresh" :disabled="loading">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
                <span>刷新</span>
              </button>
              
              <div class="selected-hint">
                已选 {{ selectedPoints.length }} 个位置
              </div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="modal-footer">
            <button class="btn btn-cancel" @click="closeModal">取消</button>
            <button 
              class="btn btn-confirm" 
              :disabled="!isReady || verifying"
              @click="handleVerify"
            >
              {{ verifying ? '验证中...' : '确定' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
/* ======== 遮罩层 ======== */
.captcha-modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  backdrop-filter: blur(2px);
}

/* ======== 弹窗 ======== */
.captcha-modal {
  width: 380px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* ======== 头部 ======== */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    color: #666;
  }
}

/* ======== 内容 ======== */
.modal-body {
  padding: 20px;
}

.modal-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #666;
  text-align: center;
}

/* 验证码图片容器 */
.captcha-image-container {
  position: relative;
  width: 100%;
  height: 280px;
  background: #f8f8f8;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  user-select: none;
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: fill;
  cursor: crosshair;
  display: block;
}

.captcha-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #999;
  font-size: 14px;
}

.loading-icon {
  color: #1890ff;
}

.captcha-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #666;
  }
}

/* 已选点标记 */
.point-marker {
  position: absolute;
  width: 24px;
  height: 24px;
  margin-left: -12px;
  margin-top: -12px;
  border-radius: 50%;
  background: #1890ff;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: point-appear 0.2s ease-out;
  pointer-events: none;
  z-index: 10;
}

.point-number {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

@keyframes point-appear {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 工具栏 */
.captcha-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #1890ff;
    color: #1890ff;
    background: #f0f7ff;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.selected-hint {
  font-size: 13px;
  color: #999;
}

/* ======== 底部 ======== */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.btn {
  height: 36px;
  padding: 0 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #666;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
}

.btn-confirm {
  border: none;
  background: #1890ff;
  color: #fff;

  &:hover:not(:disabled) {
    background: #40a9ff;
  }

  &:active:not(:disabled) {
    background: #096dd9;
  }

  &:disabled {
    background: #bae7ff;
    cursor: not-allowed;
  }
}

/* ======== 动画 ======== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .captcha-modal,
.modal-fade-leave-to .captcha-modal {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}

.modal-fade-enter-to .captcha-modal,
.modal-fade-leave-from .captcha-modal {
  transform: scale(1) translateY(0);
  opacity: 1;
}
</style>
