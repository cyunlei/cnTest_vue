import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * 用例管理页面 Store
 * 用于持久化用例列表的列显示配置等状态
 */
export const useCaseMgmtStore = defineStore('caseMgmt', () => {
  // 自定义表头配置
  const customHeaders = ref([])

  /**
   * 设置自定义表头配置
   * @param {Array<{key:string,label:string,checked:boolean,group:string}>} headers
   */
  function setCustomHeaders(headers) {
    customHeaders.value = headers.map(h => ({ ...h }))
  }

  /**
   * 重置自定义表头配置
   */
  function $reset() {
    customHeaders.value = []
  }

  return {
    customHeaders,
    setCustomHeaders,
    $reset
  }
}, {
  persist: true
})
