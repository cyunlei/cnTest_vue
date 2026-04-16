/**
 * 模块设置领域 Store
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModuleSettingsStore = defineStore('moduleSettings', () => {
  const selectedModule = ref('门店&用户测试用例')

  function $reset() {
    selectedModule.value = '门店&用户测试用例'
  }

  return {
    selectedModule,
    $reset
  }
})
