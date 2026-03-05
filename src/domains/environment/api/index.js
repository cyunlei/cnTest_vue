/**
 * Environment 领域 API 层
 * 职责: 环境管理相关接口
 * 
 * 后端API路径:
 * - POST   /environment/create  - 创建环境
 * - GET    /environment/list    - 查询环境列表
 * - GET    /environment/detail  - 查询环境详情
 * - POST   /environment/update  - 更新环境
 * - POST   /environment/delete  - 删除环境
 */
import { create, fetch } from '@/@core/http'

const BASE_URL = '/environment'

/**
 * 创建环境
 * POST /environment/create
 * @param {import('../types').CreateEnvironmentDTO} data
 * @returns {Promise<import('../types').ApiResponse<import('../types').EnvironmentEntity>>}
 */
export function createEnvironment(data) {
  return create(`${BASE_URL}/create`, data)
}

/**
 * 查询环境列表
 * GET /environment/list
 * @param {import('../types').FetchEnvironmentListParams} [params]
 * @returns {Promise<import('../types').EnvironmentListResponse>}
 */
export function fetchEnvironmentList(params = {}) {
  return fetch(`${BASE_URL}/list`, params)
}

/**
 * 查询环境详情
 * GET /environment/detail
 * @param {import('../types').FetchEnvironmentDetailParams} params
 * @returns {Promise<import('../types').EnvironmentDetailResponse>}
 */
export function fetchEnvironmentDetail(params) {
  return fetch(`${BASE_URL}/detail`, params)
}

/**
 * 更新环境
 * POST /environment/update
 * @param {import('../types').UpdateEnvironmentDTO} data
 * @returns {Promise<import('../types').EnvironmentDetailResponse>}
 */
export function updateEnvironment(data) {
  return create(`${BASE_URL}/update`, data)
}

/**
 * 删除环境
 * POST /environment/delete
 * @param {import('../types').DeleteEnvironmentDTO} data
 * @returns {Promise<import('../types').ApiResponse<void>>}
 */
export function deleteEnvironment(data) {
  return create(`${BASE_URL}/delete`, data)
}
