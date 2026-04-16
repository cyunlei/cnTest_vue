/**
 * 任务管理 API 层
 * 命名规范: fetchXxxList / createXxx / updateXxx / deleteXxx
 */

import axios from 'axios'

// ========== Mock 数据 ==========

const mockTaskList = [
  { id: 493667, name: '网关支持按时间限制流控批量执行任务', creator: 'ext.lijinlan10', updateTime: '2026-04-16 20:58', execType: '手动执行', execSuccess: 218, execFail: 0 },
  { id: 473264, name: 'center942(1)订单宙斯服务批量执行任务', creator: 'bjkeqinqin', updateTime: '2026-02-05 00:18', execType: '手动执行', execSuccess: 3, execFail: 0 },
  { id: 472335, name: 'OrderChangeFeeService批量执行任务', creator: 'bjkeqinqin', updateTime: '2026-02-05 00:18', execType: '手动执行', execSuccess: 3, execFail: 0 },
  { id: 495614, name: 'OrderAddHisHisService批量执行任务', creator: 'liwenhui11', updateTime: '2026-02-05 00:18', execType: '手动执行', execSuccess: 1, execFail: 0 },
  { id: 495615, name: 'OrderAddJsfService批量执行任务', creator: 'liwenhui11', updateTime: '2026-02-05 00:18', execType: '手动执行', execSuccess: 1, execFail: 0 },
  { id: 472334, name: 'OrderExtBaseJsfService批量执行任务', creator: 'bjkeqinqin', updateTime: '2026-02-05 00:18', execType: '手动执行', execSuccess: 5, execFail: 0 },
  { id: 495612, name: 'PopRegularBuyService批量执行任务', creator: 'liwenhui11', updateTime: '2026-02-05 00:18', execType: '手动执行', execSuccess: 1, execFail: 0 },
  { id: 495613, name: 'CustomsOrderStorageService批量执行任务', creator: 'liwenhui11', updateTime: '2026-02-05 00:18', execType: '手动执行', execSuccess: 1, execFail: 0 },
  { id: 495610, name: 'DeliveryService批量执行任务', creator: 'liwenhui11', updateTime: '2026-02-05 00:18', execType: '手动执行', execSuccess: 1, execFail: 0 },
  { id: 495611, name: 'SamOrderJsfService批量执行任务', creator: 'liwenhui11', updateTime: '2026-02-05 00:18', execType: '手动执行', execSuccess: 1, execFail: 0 },
  { id: 472348, name: 'OrderRemarkService批量执行任务', creator: 'bjkeqinqin', updateTime: '2026-02-05 00:18', execType: '手动执行', execSuccess: 7, execFail: 0 },
  { id: 473349, name: 'DiffResOrderJsfService批量执行任务', creator: 'bjkeqinqin', updateTime: '2026-02-05 00:18', execType: '手动执行', execSuccess: 6, execFail: 0 },
  { id: 495609, name: 'OrderChangeFeeService批量执行任务', creator: 'liwenhui11', updateTime: '2026-02-05 00:18', execType: '手动执行', execSuccess: 1, execFail: 0 },
  { id: 472345, name: 'MainCanOrderJsfService批量执行任务', creator: 'bjkeqinqin', updateTime: '2026-02-05 00:18', execType: '手动执行', execSuccess: 7, execFail: 0 }
]

const mockTaskDetail = {
  id: 495207,
  name: '【会员更新】Costco付费会员-开放平台',
  execSuccess: 1,
  execFail: 0,
  owner: 'ext.lizhigang10',
  createdAt: '2026-01-30 15:10',
  caseSet: '【会员更新】Costco付费会员-开放平台',
  status: '已启用',
  trigger: '手动执行',
  interval: 0,
  parallel: '串行执行',
  host: '',
  env: '',
  command: '',
  breakStrategy: '忽略错误继续执行',
  notify: '不通知',
  stepRetry: 0,
  caseRetry: 0,
  timeout: 0,
  cases: [
    { id: 6380382, name: '【测试通】【正向】会员更新', type: '功能用例', set: '【会员更新】Costco付费会员-开放平台', owner: 'ext.lizhigang10', status: '已启用' }
  ]
}

const mockMonitorList = Array.from({ length: 12 }).map((_, i) => ({
  id: 543210 + i,
  module: '门店&用户测试用例',
  step: i % 2 === 0 ? '用户身份queryPage' : '操作员queryForList',
  caseName: i % 2 === 0 ? '用户身份优化查询16822386' : '操作员优化查询16822386',
  taskName: '早值班-b用户-卢波',
  execTime: '2023-07-13',
  execCount: 1,
  correct: '100%',
  owner: 'lubo24',
  status: '未处理',
  reason: '-',
  updateTime: '-',
  remark: '-'
}))

const mockCaseOptions = [
  { id: 6380381, name: '【测试通】【正向】会员查询', creator: 'ext.lizhigang10' },
  { id: 6380382, name: '【测试通】【正向】会员更新', creator: 'ext.lizhigang10' },
  { id: 6380383, name: '【测试通】【反向】会员注销', creator: 'ext.lizhigang10' },
  { id: 6380384, name: '【测试通】【正向】积分兑换', creator: 'ext.lizhigang10' },
  { id: 6380385, name: '【测试通】【正向】订单创建', creator: 'bjkeqinqin' }
]

// ========== API 函数 ==========

/**
 * 获取任务列表
 * @param {Object} params
 * @returns {Promise<{ list: any[], total: number }>}
 */
export async function fetchTaskList(params = {}) {
  void params
  // 模拟接口延迟
  await new Promise(r => setTimeout(r, 200))
  return {
    data: {
      code: 0,
      data: {
        list: mockTaskList,
        total: 698,
        page: 1,
        page_size: 50
      }
    }
  }
}

/**
 * 获取任务详情
 * @param {Object} params
 * @returns {Promise<any>}
 */
export async function fetchTaskDetail(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 150))
  return {
    data: {
      code: 0,
      data: mockTaskDetail
    }
  }
}

/**
 * 获取任务监控列表
 * @param {Object} params
 * @returns {Promise<{ list: any[], total: number }>}
 */
export async function fetchTaskMonitorList(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 200))
  return {
    data: {
      code: 0,
      data: {
        list: mockMonitorList,
        total: 1716,
        page: 1,
        page_size: 50
      }
    }
  }
}

/**
 * 创建任务
 * @param {Object} payload
 * @returns {Promise<any>}
 */
export async function createTask(payload = {}) {
  void payload
  await new Promise(r => setTimeout(r, 300))
  return {
    data: {
      code: 0,
      msg: '创建成功',
      data: { id: Math.floor(Math.random() * 1000000) }
    }
  }
}

/**
 * 更新任务
 * @param {Object} payload
 * @returns {Promise<any>}
 */
export async function updateTask(payload = {}) {
  void payload
  await new Promise(r => setTimeout(r, 300))
  return {
    data: {
      code: 0,
      msg: '更新成功'
    }
  }
}

/**
 * 删除任务
 * @param {Object} params
 * @returns {Promise<any>}
 */
export async function deleteTask(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 200))
  return {
    data: {
      code: 0,
      msg: '删除成功'
    }
  }
}

/**
 * 获取可选用例列表
 * @param {Object} params
 * @returns {Promise<{ list: any[] }>}
 */
export async function fetchCaseOptionList(params = {}) {
  void params
  await new Promise(r => setTimeout(r, 150))
  return {
    data: {
      code: 0,
      data: {
        list: mockCaseOptions
      }
    }
  }
}
