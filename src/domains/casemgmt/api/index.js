/**
 * CaseMgmt 领域 API 层
 * 职责: 测试用例、用例集、测试步骤相关接口
 * 遵循手册: 五.API 层 - 统一协议、请求函数命名规范
 *
 * 测试步骤后端 API:
 * - POST   /api/v1/testcases/step/create  - 创建测试步骤 application/json
 * - GET    /api/v1/testcases/step/list   - 查询步骤列表 query
 * - GET    /api/v1/testcases/step/detail - 查询步骤详情 query
 * - POST   /api/v1/testcases/step/update - 更新测试步骤 application/json
 * - POST   /api/v1/testcases/step/delete - 删除测试步骤 application/json
 */
import { create, fetch } from '@/@core/http'

const STEP_BASE_URL = '/api/v1/testcases/step'
const SUITE_BASE_URL = '/api/v1/testcases/suite'
const TESTCASE_BASE_URL = '/api/v1/testcases'

/**
 * 创建测试步骤
 * POST /api/v1/testcases/step/create
 * Content-Type: application/json
 * @param {import('../types').CreateStepDTO} data
 * @returns {Promise<import('axios').AxiosResponse<import('../types').StepMutationResponse>>}
 */
export function createStep(data) {
  return create(`${STEP_BASE_URL}/create`, data)
}

/**
 * 查询步骤列表
 * GET /api/v1/testcases/step/list
 * @param {import('../types').FetchStepListParams} [params]
 * @returns {Promise<import('axios').AxiosResponse<import('../types').StepListResponse>>}
 */
export function fetchStepList(params = {}) {
  return fetch(`${STEP_BASE_URL}/list`, params)
}

/**
 * 查询步骤详情
 * GET /api/v1/testcases/step/detail
 * @param {import('../types').FetchStepDetailParams} params
 * @returns {Promise<import('axios').AxiosResponse<import('../types').StepDetailResponse>>}
 */
export function fetchStepDetail(params) {
  return fetch(`${STEP_BASE_URL}/detail`, params)
}

/**
 * 更新测试步骤
 * POST /api/v1/testcases/step/update
 * Content-Type: application/json
 * @param {import('../types').UpdateStepDTO} data
 * @returns {Promise<import('axios').AxiosResponse<import('../types').StepMutationResponse>>}
 */
export function updateStep(data) {
  return create(`${STEP_BASE_URL}/update`, data)
}

/**
 * 执行测试步骤
 * POST /api/v1/testcases/step/execute
 * Content-Type: application/json
 * @param {{ step_id: number }} data
 * @returns {Promise<import('axios').AxiosResponse<import('../types').ApiResponse<any>>>}
 */
export function executeStep(data) {
  return create(`${STEP_BASE_URL}/execute`, data)
}

/**
 * 删除测试步骤
 * POST /api/v1/testcases/step/delete
 * Content-Type: application/json
 * @param {import('../types').DeleteStepDTO} data
 * @returns {Promise<import('axios').AxiosResponse<import('../types').ApiResponse<void>>>}
 */
export function deleteStep(data) {
  return create(`${STEP_BASE_URL}/delete`, data)
}

// ======== 用例集 API ========

/**
 * 创建用例集
 * POST /api/v1/testcases/suite/create
 * Content-Type: application/json
 * @param {import('../types').CreateSuiteDTO} data
 * @returns {Promise<import('axios').AxiosResponse<import('../types').SuiteMutationResponse>>}
 */
export function createSuite(data) {
  return create(`${SUITE_BASE_URL}/create`, data)
}

/**
 * 查询用例集列表
 * GET /api/v1/testcases/suite/list
 * @param {import('../types').FetchSuiteListParams} [params]
 * @returns {Promise<import('axios').AxiosResponse<import('../types').SuiteListResponse>>}
 */
export function fetchSuiteList(params = {}) {
  return fetch(`${SUITE_BASE_URL}/list`, params)
}

/**
 * 查询用例集详情
 * GET /api/v1/testcases/suite/detail
 * @param {import('../types').FetchSuiteDetailParams} params
 * @returns {Promise<import('axios').AxiosResponse<import('../types').SuiteDetailResponse>>}
 */
export function fetchSuiteDetail(params) {
  return fetch(`${SUITE_BASE_URL}/detail`, params)
}

/**
 * 更新用例集
 * POST /api/v1/testcases/suite/update
 * Content-Type: application/json
 * @param {import('../types').UpdateSuiteDTO} data
 * @returns {Promise<import('axios').AxiosResponse<import('../types').SuiteMutationResponse>>}
 */
export function updateSuite(data) {
  return create(`${SUITE_BASE_URL}/update`, data)
}

/**
 * 删除用例集
 * POST /api/v1/testcases/suite/delete
 * Content-Type: application/json
 * @param {import('../types').DeleteSuiteDTO} data
 * @returns {Promise<import('axios').AxiosResponse<import('../types').ApiResponse<void>>>}
 */
export function deleteSuite(data) {
  return create(`${SUITE_BASE_URL}/delete`, data)
}

// ======== 测试用例 API ========

/**
 * 创建测试用例
 * POST /api/v1/testcases/create
 * Content-Type: application/json
 * @param {import('../types').CreateTestcaseDTO} data
 * @returns {Promise<import('axios').AxiosResponse<import('../types').TestcaseMutationResponse>>}
 */
export function createTestcase(data) {
  return create(`${TESTCASE_BASE_URL}/create`, data)
}

/**
 * 查询测试用例列表
 * GET /api/v1/testcases/list
 * @param {import('../types').FetchTestcaseListParams} [params]
 * @returns {Promise<import('axios').AxiosResponse<import('../types').TestcaseListResponse>>}
 */
export function fetchTestcaseList(params = {}) {
  return fetch(`${TESTCASE_BASE_URL}/list`, params)
}

/**
 * 查询测试用例详情
 * GET /api/v1/testcases/detail
 * @param {import('../types').FetchTestcaseDetailParams} params
 * @returns {Promise<import('axios').AxiosResponse<import('../types').TestcaseDetailResponse>>}
 */
export function fetchTestcaseDetail(params) {
  return fetch(`${TESTCASE_BASE_URL}/detail`, params)
}

/**
 * 更新测试用例
 * POST /api/v1/testcases/update
 * Content-Type: application/json
 * @param {import('../types').UpdateTestcaseDTO} data
 * @returns {Promise<import('axios').AxiosResponse<import('../types').TestcaseMutationResponse>>}
 */
export function updateTestcase(data) {
  return create(`${TESTCASE_BASE_URL}/update`, data)
}

/**
 * 删除测试用例
 * POST /api/v1/testcases/delete
 * Content-Type: application/json
 * @param {import('../types').DeleteTestcaseDTO} data
 * @returns {Promise<import('axios').AxiosResponse<import('../types').ApiResponse<void>>>}
 */
export function deleteTestcase(data) {
  return create(`${TESTCASE_BASE_URL}/delete`, data)
}
