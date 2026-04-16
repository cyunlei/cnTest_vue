/**
 * 任务管理领域 Store
 * 命名规范: use+Domain+Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTaskMgmtStore = defineStore('taskMgmt', () => {
  // ======== State ========
  const listFilter = ref({
    keyword: '',
    execType: '',
    onlyMine: false,
    tempTaskHidden: true
  })

  const monitorFilter = ref({
    taskName: '',
    dateRange: ['', ''],
    stepName: '',
    caseName: '',
    owner: '',
    status: '',
    reason: '',
    correctRateMin: '',
    correctRateMax: '',
    onlyMine: false
  })

  const listPagination = ref({
    page: 1,
    pageSize: 50,
    total: 0
  })

  const monitorPagination = ref({
    page: 1,
    pageSize: 50,
    total: 0
  })

  const selectedModule = ref('商家开放')

  // ======== Getters ========
  const modules = computed(() => [
    '商家开放',
    '服务市场',
    'POP订单',
    '开放平台'
  ])

  // ======== Actions ========
  function setListFilter(payload) {
    listFilter.value = { ...listFilter.value, ...payload }
  }

  function setMonitorFilter(payload) {
    monitorFilter.value = { ...monitorFilter.value, ...payload }
  }

  function setListPagination(payload) {
    listPagination.value = { ...listPagination.value, ...payload }
  }

  function setMonitorPagination(payload) {
    monitorPagination.value = { ...monitorPagination.value, ...payload }
  }

  function $reset() {
    listFilter.value = {
      keyword: '',
      execType: '',
      onlyMine: false,
      tempTaskHidden: true
    }
    monitorFilter.value = {
      taskName: '',
      dateRange: ['', ''],
      stepName: '',
      caseName: '',
      owner: '',
      status: '',
      reason: '',
      correctRateMin: '',
      correctRateMax: '',
      onlyMine: false
    }
    listPagination.value = { page: 1, pageSize: 50, total: 0 }
    monitorPagination.value = { page: 1, pageSize: 50, total: 0 }
    selectedModule.value = '商家开放'
  }

  return {
    listFilter,
    monitorFilter,
    listPagination,
    monitorPagination,
    selectedModule,
    modules,
    setListFilter,
    setMonitorFilter,
    setListPagination,
    setMonitorPagination,
    $reset
  }
})
