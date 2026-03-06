/**
 * JSON 缓存 Store
 * 用于存储 JSON 添加弹窗的内容，支持持久化
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useJsonCacheStore = defineStore('jsonCache', () => {
  // State
  const content = ref('')

  // Actions
  function setContent(newContent) {
    content.value = newContent
  }

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
