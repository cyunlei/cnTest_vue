/**
 * Project 领域 API 层
 * 职责: 项目管理相关接口
 * 
 * 后端API路径:
 * - POST   /project/create  - 创建项目
 * - GET    /project/list    - 查询项目列表
 * - GET    /project/detail  - 查询项目详情
 * - POST   /project/update  - 更新项目
 * - POST   /project/delete  - 删除项目（软删除）
 */
import { create, fetch } from '@/@core/http'

const BASE_URL = '/project'

/**
 * 创建项目
 * POST /project/create
 * @param {import('../types').CreateProjectDTO} data
 * @returns {Promise<import('../types').ApiResponse<import('../types').ProjectEntity>>}
 */
export function createProject(data) {
  return create(`${BASE_URL}/create`, data)
}

/**
 * 查询项目列表
 * GET /project/list
 * @param {import('../types').FetchProjectListParams} [params]
 * @returns {Promise<import('../types').ProjectListResponse>}
 */
export function fetchProjectList(params = {}) {
  return fetch(`${BASE_URL}/list`, params)
}

/**
 * 查询项目详情
 * GET /project/detail
 * @param {import('../types').FetchProjectDetailParams} params
 * @returns {Promise<import('../types').ProjectDetailResponse>}
 */
export function fetchProjectDetail(params) {
  return fetch(`${BASE_URL}/detail`, params)
}

/**
 * 更新项目
 * POST /project/update
 * @param {import('../types').UpdateProjectDTO} data
 * @returns {Promise<import('../types').ProjectDetailResponse>}
 */
export function updateProject(data) {
  return create(`${BASE_URL}/update`, data)
}

/**
 * 删除项目（软删除）
 * POST /project/delete
 * @param {import('../types').DeleteProjectDTO} data
 * @returns {Promise<import('../types').ApiResponse<void>>}
 */
export function deleteProject(data) {
  return create(`${BASE_URL}/delete`, data)
}
