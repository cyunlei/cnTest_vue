/**
 * Project 领域 API 层
 * 职责: 项目管理相关接口
 * 
 * 后端API路径:
 * - POST   /api/v1/projects/create  - 创建项目
 * - GET    /api/v1/projects/list    - 查询项目列表
 * - GET    /api/v1/projects/detail  - 查询项目详情
 * - POST   /api/v1/projects/update  - 更新项目
 * - POST   /api/v1/projects/delete  - 删除项目（软删除）
 */
import { create, fetch } from '@/@core/http'

const BASE_URL = '/api/v1/projects'

/**
 * 创建项目
 * POST /api/v1/projects/create
 * @param {import('../types').CreateProjectDTO} data
 * @returns {Promise<import('../types').ApiResponse<import('../types').ProjectEntity>>}
 */
export function createProject(data) {
  return create(`${BASE_URL}/create`, data)
}

/**
 * 查询项目列表
 * GET /api/v1/projects/list
 * @param {import('../types').FetchProjectListParams} [params]
 * @returns {Promise<import('../types').ProjectListResponse>}
 */
export function fetchProjectList(params = {}) {
  return fetch(`${BASE_URL}/list`, params)
}

/**
 * 查询项目详情
 * GET /api/v1/projects/detail
 * @param {import('../types').FetchProjectDetailParams} params
 * @returns {Promise<import('../types').ProjectDetailResponse>}
 */
export function fetchProjectDetail(params) {
  return fetch(`${BASE_URL}/detail`, params)
}

/**
 * 更新项目
 * POST /api/v1/projects/update
 * @param {import('../types').UpdateProjectDTO} data
 * @returns {Promise<import('../types').ProjectDetailResponse>}
 */
export function updateProject(data) {
  return create(`${BASE_URL}/update`, data)
}

/**
 * 删除项目（软删除）
 * POST /api/v1/projects/delete
 * @param {import('../types').DeleteProjectDTO} data
 * @returns {Promise<import('../types').ApiResponse<void>>}
 */
export function deleteProject(data) {
  return create(`${BASE_URL}/delete`, data)
}
