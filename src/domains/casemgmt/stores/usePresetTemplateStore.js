import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * 变量模板 Store（持久化）
 * 用于保存“新增模板”抽屉里创建的变量模板
 */
export const usePresetTemplateStore = defineStore(
  'presetTemplate',
  () => {
    const templates = ref([])

    function addTemplate(tpl) {
      templates.value.push(tpl)
    }

    function clear() {
      templates.value = []
    }

    return {
      templates,
      addTemplate,
      clear
    }
  },
  {
    persist: true
  }
)

