/**
 * CaseMgmt 领域 Store
 * 职责: 测试用例管理状态管理
 * 命名规范: use + Domain + Store
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createTestCase,
  fetchTestCaseList,
  fetchTestCaseDetail,
  updateTestCase,
  deleteTestCase,
  createTestCaseSuite,
  fetchTestCaseSuiteList,
  fetchTestCaseSuiteDetail,
  updateTestCaseSuite,
  deleteTestCaseSuite,
  createTestCaseStep,
  fetchTestCaseStepList,
  fetchTestCaseStepDetail,
  updateTestCaseStep,
  deleteTestCaseStep,
  executeTestCase,
  executeTestCaseStep,
  fetchExecutionList
} from '../api'
import { CASE_TYPE_TEXT, PRIORITY_TEXT, PRIORITY_COLOR } from '../types'

export const useCaseMgmtStore = defineStore('caseMgmt', () => {
  // ======== State ========
  /** @type {import('vue').Ref<import('../types').TestCaseEntity[]>} */
  const testCaseList = ref([])
  
  /** @type {import('vue').Ref<number>} */
  const testCaseTotal = ref(0)
  
  /** @type {import('vue').Ref<import('../types').TestCaseEntity|null>} */
  const currentTestCase = ref(null)
  
  /** @type {import('vue').Ref<import('../types').TestCaseSuiteEntity[]>} */
  const testCaseSuiteList = ref([])
  
  /** @type {import('vue').Ref<import('../types').TestCaseSuiteEntity|null>} */
  const currentTestCaseSuite = ref(null)
  
  /** @type {import('vue').Ref<import('../types').TestCaseStepEntity[]>} */
  const testCaseStepList = ref([])
  
  /** @type {import('vue').Ref<import('../types').TestCaseStepEntity|null>} */
  const currentTestCaseStep = ref(null)
  
  /** @type {import('vue').Ref<boolean>} */
  const loading = ref(false)
  
  /** @type {import('vue').Ref<Object[]>} */
  const executionList = ref([])
  
  /** @type {import('vue').Ref<number>} */
  const executionTotal = ref(0)

  // ======== Getters ========
  const hasTestCases = computed(() => testCaseList.value.length > 0)
  
  const hasTestCaseSuites = computed(() => testCaseSuiteList.value.length > 0)
  
  const currentTestCaseId = computed(() => currentTestCase.value?.id || null)
  
  const currentTestCaseSuiteId = computed(() => currentTestCaseSuite.value?.id || null)
  
  /**
   * 获取用例类型显示文本
   * @param {number} type
   * @returns {string}
   */
  const getCaseTypeText = computed(() => (type) => {
    return CASE_TYPE_TEXT[type] || '未知类型'
  })
  
  /**
   * 获取优先级显示文本
   * @param {number} priority
   * @returns {string}
   */
  const getPriorityText = computed(() => (priority) => {
    return PRIORITY_TEXT[priority] || 'P?'
  })
  
  /**
   * 获取优先级颜色
   * @param {number} priority
   * @returns {string}
   */
  const getPriorityColor = computed(() => (priority) => {
    return PRIORITY_COLOR[priority] || '#999'
  })
  
  /**
   * 按用例集分组的用例列表
   * @type {import('vue').ComputedRef<Record<number, import('../types').TestCaseEntity[]>>}
   */
  const testCasesBySuite = computed(() => {
    const groups = {}
    testCaseList.value.forEach(testCase => {
      const parentId = testCase.parent_id
      if (!groups[parentId]) {
        groups[parentId] = []
      }
      groups[parentId].push(testCase)
    })
    return groups
  })
  
  /**
   * 树形结构的用例集列表
   * @type {import('vue').ComputedRef<any[]>}
   */
  const testCaseSuiteTree = computed(() => {
    const buildTree = (parentId = null) => {
      return testCaseSuiteList.value
        .filter(suite => suite.parent_id === parentId)
        .map(suite => ({
          ...suite,
          children: buildTree(suite.id)
        }))
    }
    return buildTree(null)
  })

  // ======== Actions: 测试用例 ========
  
  /**
   * 创建测试用例
   * @param {import('../types').CreateTestCaseDTO} data
   */
  async function createTestCaseAction(data) {
    loading.value = true
    try {
      const response = await createTestCase(data)
      if (response.data?.code === 200) {
        await fetchTestCaseListAction({ project_id: data.project_id })
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
   * 获取测试用例列表
   * @param {import('../types').FetchTestCaseListParams} [params]
   */
  async function fetchTestCaseListAction(params = {}) {
    loading.value = true
    try {
      const response = await fetchTestCaseList(params)
      if (response.data?.code === 200) {
        testCaseList.value = response.data.data?.list || []
        testCaseTotal.value = response.data.data?.total || 0
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
   * 获取测试用例详情
   * @param {number} projectId
   * @param {number} caseId
   */
  async function fetchTestCaseDetailAction(projectId, caseId) {
    loading.value = true
    try {
      const response = await fetchTestCaseDetail({ 
        project_id: projectId, 
        case_id: caseId 
      })
      if (response.data?.code === 200) {
        currentTestCase.value = response.data.data
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
   * 更新测试用例
   * @param {import('../types').UpdateTestCaseDTO} data
   */
  async function updateTestCaseAction(data) {
    loading.value = true
    try {
      const response = await updateTestCase(data)
      if (response.data?.code === 200) {
        if (currentTestCase.value?.id === data.case_id) {
          currentTestCase.value = { ...currentTestCase.value, ...response.data.data }
        }
        await fetchTestCaseListAction()
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
   * 删除测试用例
   * @param {number} caseId
   */
  async function deleteTestCaseAction(caseId) {
    loading.value = true
    try {
      const response = await deleteTestCase({ case_id: caseId })
      if (response.data?.code === 200) {
        if (currentTestCase.value?.id === caseId) {
          currentTestCase.value = null
        }
        await fetchTestCaseListAction()
        return { success: true }
      }
      return { success: false, msg: response.data?.msg || '删除失败' }
    } catch (error) {
      return { success: false, msg: error.message || '删除失败' }
    } finally {
      loading.value = false
    }
  }

  // ======== Actions: 用例集 ========
  
  /**
   * 创建用例集
   * @param {import('../types').CreateTestCaseSuiteDTO} data
   */
  async function createTestCaseSuiteAction(data) {
    loading.value = true
    try {
      const response = await createTestCaseSuite(data)
      if (response.data?.code === 200) {
        await fetchTestCaseSuiteListAction({ project_id: data.project_id })
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
   * 获取用例集列表
   * @param {import('../types').FetchTestCaseSuiteListParams} params
   */
  async function fetchTestCaseSuiteListAction(params) {
    loading.value = true
    try {
      const response = await fetchTestCaseSuiteList(params)
      if (response.data?.code === 200) {
        testCaseSuiteList.value = response.data.data || []
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
   * 获取用例集详情
   * @param {number} suiteId
   */
  async function fetchTestCaseSuiteDetailAction(suiteId) {
    loading.value = true
    try {
      const response = await fetchTestCaseSuiteDetail({ suite_id: suiteId })
      if (response.data?.code === 200) {
        currentTestCaseSuite.value = response.data.data
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
   * 更新用例集
   * @param {import('../types').UpdateTestCaseSuiteDTO} data
   */
  async function updateTestCaseSuiteAction(data) {
    loading.value = true
    try {
      const response = await updateTestCaseSuite(data)
      if (response.data?.code === 200) {
        if (currentTestCaseSuite.value?.id === data.suite_id) {
          currentTestCaseSuite.value = { ...currentTestCaseSuite.value, ...response.data.data }
        }
        await fetchTestCaseSuiteListAction({ project_id: data.project_id })
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
   * 删除用例集
   * @param {number} suiteId
   * @param {number} projectId
   */
  async function deleteTestCaseSuiteAction(suiteId, projectId) {
    loading.value = true
    try {
      const response = await deleteTestCaseSuite({ suite_id: suiteId })
      if (response.data?.code === 200) {
        if (currentTestCaseSuite.value?.id === suiteId) {
          currentTestCaseSuite.value = null
        }
        await fetchTestCaseSuiteListAction({ project_id: projectId })
        return { success: true }
      }
      return { success: false, msg: response.data?.msg || '删除失败' }
    } catch (error) {
      return { success: false, msg: error.message || '删除失败' }
    } finally {
      loading.value = false
    }
  }

  // ======== Actions: 测试步骤 ========
  
  /**
   * 创建测试步骤
   * @param {import('../types').CreateTestCaseStepDTO} data
   */
  async function createTestCaseStepAction(data) {
    loading.value = true
    try {
      const response = await createTestCaseStep(data)
      if (response.data?.code === 200) {
        await fetchTestCaseStepListAction({ case_id: data.case_id })
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
   * 获取测试步骤列表
   * @param {import('../types').FetchTestCaseStepListParams} params
   */
  async function fetchTestCaseStepListAction(params) {
    loading.value = true
    try {
      const response = await fetchTestCaseStepList(params)
      if (response.data?.code === 200) {
        testCaseStepList.value = response.data.data || []
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
   * 获取测试步骤详情
   * @param {number} stepId
   */
  async function fetchTestCaseStepDetailAction(stepId) {
    loading.value = true
    try {
      const response = await fetchTestCaseStepDetail({ step_id: stepId })
      if (response.data?.code === 200) {
        currentTestCaseStep.value = response.data.data
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
   * 更新测试步骤
   * @param {import('../types').UpdateTestCaseStepDTO} data
   */
  async function updateTestCaseStepAction(data) {
    loading.value = true
    try {
      const response = await updateTestCaseStep(data)
      if (response.data?.code === 200) {
        if (currentTestCaseStep.value?.id === data.step_id) {
          currentTestCaseStep.value = { ...currentTestCaseStep.value, ...response.data.data }
        }
        // 刷新当前用例的步骤列表
        if (currentTestCase.value) {
          await fetchTestCaseStepListAction({ case_id: currentTestCase.value.id })
        }
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
   * 删除测试步骤
   * @param {number} stepId
   * @param {number} caseId
   */
  async function deleteTestCaseStepAction(stepId, caseId) {
    loading.value = true
    try {
      const response = await deleteTestCaseStep({ step_id: stepId })
      if (response.data?.code === 200) {
        if (currentTestCaseStep.value?.id === stepId) {
          currentTestCaseStep.value = null
        }
        await fetchTestCaseStepListAction({ case_id: caseId })
        return { success: true }
      }
      return { success: false, msg: response.data?.msg || '删除失败' }
    } catch (error) {
      return { success: false, msg: error.message || '删除失败' }
    } finally {
      loading.value = false
    }
  }

  // ======== Actions: 执行 ========
  
  /**
   * 执行测试用例
   * @param {import('../types').ExecuteTestCaseDTO} data
   */
  async function executeTestCaseAction(data) {
    loading.value = true
    try {
      const response = await executeTestCase(data)
      if (response.data?.code === 200) {
        return { success: true, data: response.data.data }
      }
      return { success: false, msg: response.data?.msg || '执行失败' }
    } catch (error) {
      return { success: false, msg: error.message || '执行失败' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 执行测试步骤
   * @param {import('../types').ExecuteTestCaseStepDTO} data
   */
  async function executeTestCaseStepAction(data) {
    loading.value = true
    try {
      const response = await executeTestCaseStep(data)
      if (response.data?.code === 200) {
        return { success: true, data: response.data.data }
      }
      return { success: false, msg: response.data?.msg || '执行失败' }
    } catch (error) {
      return { success: false, msg: error.message || '执行失败' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取执行记录列表
   * @param {{project_id?: number, case_id?: number, page?: number, page_size?: number}} params
   */
  async function fetchExecutionListAction(params = {}) {
    loading.value = true
    try {
      const response = await fetchExecutionList(params)
      if (response.data?.code === 200) {
        executionList.value = response.data.data?.list || []
        executionTotal.value = response.data.data?.total || 0
        return { success: true, data: response.data.data }
      }
      return { success: false, msg: response.data?.msg || '获取执行记录失败' }
    } catch (error) {
      return { success: false, msg: error.message || '获取执行记录失败' }
    } finally {
      loading.value = false
    }
  }

  // ======== Actions: 状态管理 ========
  
  /**
   * 设置当前测试用例
   * @param {import('../types').TestCaseEntity|null} testCase
   */
  function setCurrentTestCase(testCase) {
    currentTestCase.value = testCase
  }

  /**
   * 设置当前用例集
   * @param {import('../types').TestCaseSuiteEntity|null} suite
   */
  function setCurrentTestCaseSuite(suite) {
    currentTestCaseSuite.value = suite
  }

  /**
   * 重置状态
   */
  function $reset() {
    testCaseList.value = []
    testCaseTotal.value = 0
    currentTestCase.value = null
    testCaseSuiteList.value = []
    currentTestCaseSuite.value = null
    testCaseStepList.value = []
    currentTestCaseStep.value = null
    executionList.value = []
    executionTotal.value = 0
    loading.value = false
  }

  return {
    // State
    testCaseList,
    testCaseTotal,
    currentTestCase,
    testCaseSuiteList,
    currentTestCaseSuite,
    testCaseStepList,
    currentTestCaseStep,
    executionList,
    executionTotal,
    loading,
    // Getters
    hasTestCases,
    hasTestCaseSuites,
    currentTestCaseId,
    currentTestCaseSuiteId,
    getCaseTypeText,
    getPriorityText,
    getPriorityColor,
    testCasesBySuite,
    testCaseSuiteTree,
    // Actions: TestCase
    createTestCaseAction,
    fetchTestCaseListAction,
    fetchTestCaseDetailAction,
    updateTestCaseAction,
    deleteTestCaseAction,
    // Actions: TestCaseSuite
    createTestCaseSuiteAction,
    fetchTestCaseSuiteListAction,
    fetchTestCaseSuiteDetailAction,
    updateTestCaseSuiteAction,
    deleteTestCaseSuiteAction,
    // Actions: TestCaseStep
    createTestCaseStepAction,
    fetchTestCaseStepListAction,
    fetchTestCaseStepDetailAction,
    updateTestCaseStepAction,
    deleteTestCaseStepAction,
    // Actions: Execution
    executeTestCaseAction,
    executeTestCaseStepAction,
    fetchExecutionListAction,
    // Actions: State
    setCurrentTestCase,
    setCurrentTestCaseSuite,
    $reset
  }
})
