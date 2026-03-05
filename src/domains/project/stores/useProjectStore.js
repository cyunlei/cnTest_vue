/**
 * Project 领域 Store
 * 职责: 项目管理状态管理
 * 命名规范: use + Domain + Store
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createProject,
  fetchProjectList,
  fetchProjectDetail,
  updateProject,
  deleteProject
} from '../api'

export const useProjectStore = defineStore('project', () => {
  // ======== State ========
  /** @type {import('vue').Ref<import('../types').ProjectEntity[]>} */
  const projectList = ref([])
  
  /** @type {import('vue').Ref<number>} */
  const total = ref(0)
  
  /** @type {import('vue').Ref<import('../types').ProjectEntity|null>} */
  const currentProject = ref(null)
  
  /** @type {import('vue').Ref<boolean>} */
  const loading = ref(false)

  // ======== Getters ========
  const hasProjects = computed(() => projectList.value.length > 0)
  
  const currentProjectId = computed(() => currentProject.value?.id || null)

  // ======== Actions ========
  
  /**
   * 创建项目
   * @param {import('../types').CreateProjectDTO} data
   */
  async function createProjectAction(data) {
    loading.value = true
    try {
      const response = await createProject(data)
      if (response.data?.code === 200) {
        // 创建成功后刷新列表
        await fetchProjectListAction()
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
   * 获取项目列表
   * @param {import('../types').FetchProjectListParams} [params]
   */
  async function fetchProjectListAction(params = {}) {
    loading.value = true
    try {
      const response = await fetchProjectList(params)
      if (response.data?.code === 200) {
        projectList.value = response.data.data?.list || []
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
   * 获取项目详情
   * @param {number} projectId
   */
  async function fetchProjectDetailAction(projectId) {
    loading.value = true
    try {
      const response = await fetchProjectDetail({ project_id: projectId })
      if (response.data?.code === 200) {
        currentProject.value = response.data.data
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
   * 更新项目
   * @param {import('../types').UpdateProjectDTO} data
   */
  async function updateProjectAction(data) {
    loading.value = true
    try {
      const response = await updateProject(data)
      if (response.data?.code === 200) {
        // 更新当前项目缓存
        if (currentProject.value?.id === data.project_id) {
          currentProject.value = { ...currentProject.value, ...response.data.data }
        }
        // 刷新列表
        await fetchProjectListAction()
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
   * 删除项目
   * @param {number} projectId
   */
  async function deleteProjectAction(projectId) {
    loading.value = true
    try {
      const response = await deleteProject({ project_id: projectId })
      if (response.data?.code === 200) {
        // 如果删除的是当前项目，清空当前项目
        if (currentProject.value?.id === projectId) {
          currentProject.value = null
        }
        // 刷新列表
        await fetchProjectListAction()
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
   * 设置当前项目
   * @param {import('../types').ProjectEntity|null} project
   */
  function setCurrentProject(project) {
    currentProject.value = project
    // 持久化到 localStorage
    if (project) {
      localStorage.setItem('currentProject', JSON.stringify(project))
    } else {
      localStorage.removeItem('currentProject')
    }
  }

  /**
   * 从 localStorage 恢复当前项目
   */
  function restoreCurrentProject() {
    const saved = localStorage.getItem('currentProject')
    if (saved) {
      try {
        currentProject.value = JSON.parse(saved)
      } catch {
        currentProject.value = null
      }
    }
  }

  /**
   * 重置状态
   */
  function $reset() {
    projectList.value = []
    total.value = 0
    currentProject.value = null
    loading.value = false
    localStorage.removeItem('currentProject')
  }

  return {
    // State
    projectList,
    total,
    currentProject,
    loading,
    // Getters
    hasProjects,
    currentProjectId,
    // Actions
    createProjectAction,
    fetchProjectListAction,
    fetchProjectDetailAction,
    updateProjectAction,
    deleteProjectAction,
    setCurrentProject,
    restoreCurrentProject,
    $reset
  }
})
