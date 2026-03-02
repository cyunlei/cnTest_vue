/**
 * 防抖 Composable
 * 遵循手册: 七.逻辑复用 - Composables 分类
 */
import { ref, onUnmounted } from 'vue'

/**
 * @typedef {Object} UseDebounceOptions
 * @property {number} [delay=300]
 * @property {boolean} [immediate=false]
 */

/**
 * @typedef {Object} UseDebounceReturn
 * @property {(...args: any[]) => void} debouncedFn
 * @property {() => void} cancel
 * @property {import('vue').Ref<boolean>} isPending
 */

/**
 * 防抖 Hook
 * @param {(...args: any[]) => any} fn
 * @param {UseDebounceOptions} [options]
 * @returns {UseDebounceReturn}
 * @example
 * const { debouncedFn } = useDebounce((val) => console.log(val), { delay: 300 })
 */
export function useDebounce(fn, options = {}) {
  const { delay = 300, immediate = false } = options
  
  const isPending = ref(false)
  /** @type {ReturnType<typeof setTimeout>|null} */
  let timer = null

  /**
   * 防抖函数
   * @param {...any} args
   */
  function debouncedFn(...args) {
    const callNow = immediate && !timer
    
    if (timer) {
      clearTimeout(timer)
    }
    
    isPending.value = true
    
    timer = setTimeout(() => {
      timer = null
      isPending.value = false
      if (!immediate) {
        fn(...args)
      }
    }, delay)
    
    if (callNow) {
      fn(...args)
    }
  }

  /**
   * 取消待执行的函数
   */
  function cancel() {
    if (timer) {
      clearTimeout(timer)
      timer = null
      isPending.value = false
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    cancel()
  })

  return {
    debouncedFn,
    cancel,
    isPending
  }
}
