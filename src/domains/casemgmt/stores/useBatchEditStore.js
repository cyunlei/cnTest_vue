import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * 批量编辑内容缓存 Store
 * 用于持久化批量编辑弹窗的输入内容
 */
export const useBatchEditStore = defineStore('batchEdit', () => {
  // 批量编辑内容
  const content = ref('')

  /**
   * 设置内容
   * @param {string} newContent
   */
  function setContent(newContent) {
    content.value = newContent
  }

  /**
   * 清空内容
   */
  function clearContent() {
    content.value = ''
  }

  return {
    content,
    setContent,
    clearContent
  }
}, {
  persist: true
})
