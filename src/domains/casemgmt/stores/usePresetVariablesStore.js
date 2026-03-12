import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * 预设变量 Store（持久化）
 * 用于“预设变量”Tab 的变量列表持久化
 */
export const usePresetVariablesStore = defineStore(
  'presetVariables',
  () => {
    const rows = ref([])
    const selectedModule = ref('')
    const isMultiTemplate = ref(false)
    const templateSingle = ref('')
    const templateMulti = ref([])

    function setRows(next) {
      rows.value = Array.isArray(next) ? next : []
    }

    function setSelectedModule(val) {
      selectedModule.value = val || ''
    }

    function setMultiTemplate(val) {
      isMultiTemplate.value = !!val
    }

    function setTemplateSingle(val) {
      templateSingle.value = val || ''
    }

    function setTemplateMulti(val) {
      templateMulti.value = Array.isArray(val) ? val : []
    }

    function clear() {
      rows.value = []
      selectedModule.value = ''
      isMultiTemplate.value = false
      templateSingle.value = ''
      templateMulti.value = []
    }

    return {
      rows,
      setRows,
      selectedModule,
      isMultiTemplate,
      templateSingle,
      templateMulti,
      setSelectedModule,
      setMultiTemplate,
      setTemplateSingle,
      setTemplateMulti,
      clear
    }
  },
  {
    persist: true
  }
)

