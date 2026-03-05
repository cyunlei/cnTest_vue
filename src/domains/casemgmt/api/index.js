/**
 * CaseMgmt 领域 API 层
 * 职责: 测试用例管理相关接口
 * 
 * 后端API路径:
 * 
 * 测试用例:
 * - POST   /testcase/create  - 创建测试用例
 * - GET    /testcase/list    - 查询测试用例列表
 * - GET    /testcase/detail  - 查询测试用例详情
 * - POST   /testcase/update  - 更新测试用例
 * - POST   /testcase/delete  - 删除测试用例
 * 
 * 用例集:
 * - POST   /testcase/suite/create  - 创建用例集
 * - GET    /testcase/suite/list    - 查询用例集列表
 * - GET    /testcase/suite/detail  - 查询用例集详情
 * - POST   /testcase/suite/update  - 更新用例集
 * - POST   /testcase/suite/delete  - 删除用例集
 * 
 * 测试步骤:
 * - POST   /testcase/step/create  - 创建测试步骤
 * - GET    /testcase/step/list    - 查询测试步骤列表
 * - GET    /testcase/step/detail  - 查询测试步骤详情
 * - POST   /testcase/step/update  - 更新测试步骤
 * - POST   /testcase/step/delete  - 删除测试步骤
 * 
 * 执行:
 * - POST   /testcase/execute       - 执行测试用例
 * - POST   /testcase/step/execute  - 执行测试步骤
 * 
 * 执行记录:
 * - GET    /testcase/execution/list        - 查询执行记录列表
 * - GET    /testcase/execution/detail      - 查询执行记录详情
 * - GET    /testcase/execution/step/detail - 查询执行步骤详情
 */
import { create, fetch } from '@/@core/http'

const BASE_URL = '/testcase'

// ========== 测试用例 API ==========

/**
 * 创建测试用例
 * POST /testcase/create
 * @param {import('../types').CreateTestCaseDTO} data
 * @returns {Promise<import('../types').ApiResponse<import('../types').TestCaseEntity>>}
 */
export function createTestCase(data) {
  return create(`${BASE_URL}/create`, data)
}

/**
 * 查询测试用例列表
 * GET /testcase/list
 * @param {import('../types').FetchTestCaseListParams} [params]
 * @returns {Promise<import('../types').TestCaseListResponse>}
 */
export function fetchTestCaseList(params = {}) {
  return fetch(`${BASE_URL}/list`, params)
}

/**
 * 查询测试用例详情
 * GET /testcase/detail
 * @param {import('../types').FetchTestCaseDetailParams} params
 * @returns {Promise<import('../types').TestCaseDetailResponse>}
 */
export function fetchTestCaseDetail(params) {
  return fetch(`${BASE_URL}/detail`, params)
}

/**
 * 更新测试用例
 * POST /testcase/update
 * @param {import('../types').UpdateTestCaseDTO} data
 * @returns {Promise<import('../types').TestCaseDetailResponse>}
 */
export function updateTestCase(data) {
  return create(`${BASE_URL}/update`, data)
}

/**
 * 删除测试用例
 * POST /testcase/delete
 * @param {import('../types').DeleteTestCaseDTO} data
 * @returns {Promise<import('../types').ApiResponse<void>>}
 */
export function deleteTestCase(data) {
  return create(`${BASE_URL}/delete`, data)
}

// ========== 用例集 API ==========

/**
 * 创建用例集
 * POST /testcase/suite/create
 * @param {import('../types').CreateTestCaseSuiteDTO} data
 * @returns {Promise<import('../types').ApiResponse<import('../types').TestCaseSuiteEntity>>}
 */
export function createTestCaseSuite(data) {
  return create(`${BASE_URL}/suite/create`, data)
}

/**
 * 查询用例集列表
 * GET /testcase/suite/list
 * @param {import('../types').FetchTestCaseSuiteListParams} params
 * @returns {Promise<import('../types').TestCaseSuiteListResponse>}
 */
export function fetchTestCaseSuiteList(params) {
  return fetch(`${BASE_URL}/suite/list`, params)
}

/**
 * 查询用例集详情
 * GET /testcase/suite/detail
 * @param {{suite_id: number}} params
 * @returns {Promise<import('../types').TestCaseSuiteDetailResponse>}
 */
export function fetchTestCaseSuiteDetail(params) {
  return fetch(`${BASE_URL}/suite/detail`, params)
}

/**
 * 更新用例集
 * POST /testcase/suite/update
 * @param {import('../types').UpdateTestCaseSuiteDTO} data
 * @returns {Promise<import('../types').TestCaseSuiteDetailResponse>}
 */
export function updateTestCaseSuite(data) {
  return create(`${BASE_URL}/suite/update`, data)
}

/**
 * 删除用例集
 * POST /testcase/suite/delete
 * @param {import('../types').DeleteTestCaseSuiteDTO} data
 * @returns {Promise<import('../types').ApiResponse<void>>}
 */
export function deleteTestCaseSuite(data) {
  return create(`${BASE_URL}/suite/delete`, data)
}

// ========== 测试步骤 API ==========

/**
 * 创建测试步骤
 * POST /testcase/step/create
 * @param {import('../types').CreateTestCaseStepDTO} data
 * @returns {Promise<import('../types').ApiResponse<import('../types').TestCaseStepEntity>>}
 */
export function createTestCaseStep(data) {
  return create(`${BASE_URL}/step/create`, data)
}

/**
 * 查询测试步骤列表
 * GET /testcase/step/list
 * @param {import('../types').FetchTestCaseStepListParams} params
 * @returns {Promise<import('../types').TestCaseStepListResponse>}
 */
export function fetchTestCaseStepList(params) {
  return fetch(`${BASE_URL}/step/list`, params)
}

/**
 * 查询测试步骤详情
 * GET /testcase/step/detail
 * @param {{step_id: number}} params
 * @returns {Promise<import('../types').ApiResponse<import('../types').TestCaseStepEntity>>}
 */
export function fetchTestCaseStepDetail(params) {
  return fetch(`${BASE_URL}/step/detail`, params)
}

/**
 * 更新测试步骤
 * POST /testcase/step/update
 * @param {import('../types').UpdateTestCaseStepDTO} data
 * @returns {Promise<import('../types').ApiResponse<import('../types').TestCaseStepEntity>>}
 */
export function updateTestCaseStep(data) {
  return create(`${BASE_URL}/step/update`, data)
}

/**
 * 删除测试步骤
 * POST /testcase/step/delete
 * @param {import('../types').DeleteTestCaseStepDTO} data
 * @returns {Promise<import('../types').ApiResponse<void>>}
 */
export function deleteTestCaseStep(data) {
  return create(`${BASE_URL}/step/delete`, data)
}

// ========== 执行 API ==========

/**
 * 执行测试用例
 * POST /testcase/execute
 * @param {import('../types').ExecuteTestCaseDTO} data
 * @returns {Promise<import('../types').ApiResponse<any>>}
 */
export function executeTestCase(data) {
  return create(`${BASE_URL}/execute`, data)
}

/**
 * 执行测试步骤
 * POST /testcase/step/execute
 * @param {import('../types').ExecuteTestCaseStepDTO} data
 * @returns {Promise<import('../types').ApiResponse<any>>}
 */
export function executeTestCaseStep(data) {
  return create(`${BASE_URL}/step/execute`, data)
}

// ========== 执行记录 API ==========

/**
 * 查询执行记录列表
 * GET /testcase/execution/list
 * @param {{project_id?: number, case_id?: number, page?: number, page_size?: number}} params
 * @returns {Promise<import('../types').ApiResponse<import('../types').PaginatedData<any>>>}
 */
export function fetchExecutionList(params = {}) {
  return fetch(`${BASE_URL}/execution/list`, params)
}

/**
 * 查询执行记录详情
 * GET /testcase/execution/detail
 * @param {{batch_id: number}} params
 * @returns {Promise<import('../types').ApiResponse<any>>}
 */
export function fetchExecutionDetail(params) {
  return fetch(`${BASE_URL}/execution/detail`, params)
}
