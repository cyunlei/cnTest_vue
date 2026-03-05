/**
 * Environment 领域 Store
 * 职责: 环境管理状态管理
 * 命名规范: use + Domain + Store
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createEnvironment,
  fetchEnvironmentList,
  fetchEnvironmentDetail,
  updateEnvironment,
  deleteEnvironment
} from '../api'
import { PROTOCOL_TYPE_TEXT, ENVIRONMENT_CODE_TEXT } from '../types'

export const useEnvironmentStore = defineStore('environment', () => {
  // ======== State ========
  /** @type {import('vue').Ref<import('../types').EnvironmentEntity[]>} */
  const environmentList = ref([])
  
  /** @type {import('vue').Ref<number>} */
  const total = ref(0)
  
  /** @type {import('vue').Ref<import('../types').EnvironmentEntity|null>} */
  const currentEnvironment = ref(null)
  
  /** @type {import('vue').Ref<boolean>} */
  const loading = ref(false)

  // ======== Getters ========
  const hasEnvironments = computed(() => environmentList.value.length > 0)
  
  const currentEnvironmentId = computed(() => currentEnvironment.value?.id || null)
  
  /**
   * 获取环境显示名称（包含协议和域名）
   * @param {import('../types').EnvironmentEntity} env
   * @returns {string}
   */
  const getEnvironmentDisplayName = computed(() => (env) => {
    if (!env) return ''
    const protocol = PROTOCOL_TYPE_TEXT[env.protocol] || 'HTTP'
    return `${env.name} (${protocol}://${env.domain}:${env.port})`
  })
  
  /**
   * 获取环境标识显示文本
   * @param {number} code
   * @returns {string}
   */
  const getEnvironmentCodeText = computed(() => (code) => {
    return ENVIRONMENT_CODE_TEXT[code] || '未知环境'
  })
  
  /**
   * 按项目分组的环境列表
   * @type {import('vue').ComputedRef<Record<number, import('../types').EnvironmentEntity[]>>}
   */
  const environmentsByProject = computed(() => {
    const groups = {}
    environmentList.value.forEach(env => {
      if (!groups[env.project_id]) {
        groups[env.project_id] = []
      }
      groups[env.project_id].push(env)
    })
    return groups
  })

  // ======== Actions ========
  
  /**
   * 创建环境
   * @param {import('../types').CreateEnvironmentDTO} data
   */
  async function createEnvironmentAction(data) {
    loading.value = true
    try {
      const response = await createEnvironment(data)
      if (response.data?.code === 200) {
        await fetchEnvironmentListAction({ project_id: data.project_id })
        return { success: true, data: response.data.data }
      }
      return { success: false, msg: response.data?.msg || '创建失败' }
    } catch (error) {
      return { success: false, msg: error.message || '创建失败' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取环境列表
   * @param {import('../types').FetchEnvironmentListParams} [params]
   */
  async function fetchEnvironmentListAction(params = {}) {
    loading.value = true
    try {
      const response = await fetchEnvironmentList(params)
      if (response.data?.code === 200) {
        environmentList.value = response.data.data?.list || []
        total.value = response.data.data?.total || 0
        return { success: true, data: response.data.data }
      }
      return { success: false, msg: response.data?.msg || '获取列表失败' }
    } catch (error) {
      return { success: false, msg: error.message || '获取列表失败' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取环境详情
   * @param {number} projectId
   * @param {number} envId
   */
  async function fetchEnvironmentDetailAction(projectId, envId) {
    loading.value = true
    try {
      const response = await fetchEnvironmentDetail({ 
        project_id: projectId, 
        env_id: envId 
      })
      if (response.data?.code === 200) {
        currentEnvironment.value = response.data.data
        return { success: true, data: response.data.data }
      }
      return { success: false, msg: response.data?.msg || '获取详情失败' }
    } catch (error) {
      return { success: false, msg: error.message || '获取详情失败' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新环境
   * @param {import('../types').UpdateEnvironmentDTO} data
   */
  async function updateEnvironmentAction(data) {
    loading.value = true
    try {
      const response = await updateEnvironment(data)
      if (response.data?.code === 200) {
        if (currentEnvironment.value?.id === data.env_id) {
          currentEnvironment.value = { ...currentEnvironment.value, ...response.data.data }
        }
        await fetchEnvironmentListAction()
        return { success: true, data: response.data.data }
      }
      return { success: false, msg: response.data?.msg || '更新失败' }
    } catch (error) {
      return { success: false, msg: error.message || '更新失败' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除环境
   * @param {number} envId
   */
  async function deleteEnvironmentAction(envId) {
    loading.value = true
    try {
      const response = await deleteEnvironment({ env_id: envId })
      if (response.data?.code === 200) {
        if (currentEnvironment.value?.id === envId) {
          currentEnvironment.value = null
        }
        await fetchEnvironmentListAction()
        return { success: true }
      }
      return { success: false, msg: response.data?.msg || '删除失败' }
    } catch (error) {
      return { success: false, msg: error.message || '删除失败' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 设置当前环境
   * @param {import('../types').EnvironmentEntity|null} environment
   */
  function setCurrentEnvironment(environment) {
    currentEnvironment.value = environment
    if (environment) {
      localStorage.setItem('currentEnvironment', JSON.stringify(environment))
    } else {
      localStorage.removeItem('currentEnvironment')
    }
  }

  /**
   * 从 localStorage 恢复当前环境
   */
  function restoreCurrentEnvironment() {
    const saved = localStorage.getItem('currentEnvironment')
    if (saved) {
      try {
        currentEnvironment.value = JSON.parse(saved)
      } catch {
        currentEnvironment.value = null
      }
    }
  }

  /**
   * 重置状态
   */
  function $reset() {
    environmentList.value = []
    total.value = 0
    currentEnvironment.value = null
    loading.value = false
    localStorage.removeItem('currentEnvironment')
  }

  return {
    // State
    environmentList,
    total,
    currentEnvironment,
    loading,
    // Getters
    hasEnvironments,
    currentEnvironmentId,
    getEnvironmentDisplayName,
    getEnvironmentCodeText,
    environmentsByProject,
    // Actions
    createEnvironmentAction,
    fetchEnvironmentListAction,
    fetchEnvironmentDetailAction,
    updateEnvironmentAction,
    deleteEnvironmentAction,
    setCurrentEnvironment,
    restoreCurrentEnvironment,
    $reset
  }
})
