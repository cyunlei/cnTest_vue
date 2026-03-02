/**
 * 倒计时 Composable
 * 遵循手册: 七.逻辑复用 - Composables 分类
 * 返回结构标准: { data, loading, execute }
 */
import { ref, onUnmounted } from 'vue'

/**
 * @typedef {Object} UseCountdownOptions
 * @property {number} [seconds=60]
 * @property {() => void} [onComplete]
 */

/**
 * @typedef {Object} UseCountdownReturn
 * @property {import('vue').Ref<number>} countdown
 * @property {import('vue').Ref<boolean>} isCounting
 * @property {() => void} start
 * @property {() => void} stop
 * @property {() => void} reset
 */

/**
 * 倒计时 Hook
 * 用途: 验证码发送倒计时等场景
 * @param {UseCountdownOptions} [options]
 * @returns {UseCountdownReturn}
 * @example
 * const { countdown, isCounting, start } = useCountdown({ seconds: 60 })
 */
export function useCountdown(options = {}) {
  const { seconds = 60, onComplete } = options
  
  const countdown = ref(0)
  const isCounting = ref(false)
  /** @type {ReturnType<typeof setInterval>|null} */
  let timer = null

  /**
   * 开始倒计时
   */
  function start() {
    if (isCounting.value) return
    
    countdown.value = seconds
    isCounting.value = true
    
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        stop()
        onComplete?.()
      }
    }, 1000)
  }

  /**
   * 停止倒计时
   */
  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    isCounting.value = false
  }

  /**
   * 重置倒计时
   */
  function reset() {
    stop()
    countdown.value = 0
  }

  // 组件卸载时清理定时器
  onUnmounted(() => {
    stop()
  })

  return {
    countdown,
    isCounting,
    start,
    stop,
    reset
  }
}
