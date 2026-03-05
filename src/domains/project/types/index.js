/**
 * Project 领域类型定义
 * 职责: 项目管理相关的类型定义
 */

// ======== Enums ========

/** @type {const} */
export const PROJECT_STATUS = {
  ACTIVE: 1,
  DELETED: 0
}

// ======== DTOs ========

/**
 * 创建项目请求DTO
 * @typedef {Object} CreateProjectDTO
 * @property {string} name - 项目名称（必填，最大100字符）
 * @property {string} [description] - 项目描述（可选，最大500字符）
 */

/**
 * 更新项目请求DTO
 * @typedef {Object} UpdateProjectDTO
 * @property {number} project_id - 项目ID（必填）
 * @property {string} [name] - 项目名称（可选，最大100字符）
 * @property {string} [description] - 项目描述（可选，最大500字符）
 */

/**
 * 删除项目请求DTO
 * @typedef {Object} DeleteProjectDTO
 * @property {number} project_id - 项目ID（必填）
 */

/**
 * 查询项目列表请求参数
 * @typedef {Object} FetchProjectListParams
 * @property {number} [project_id] - 项目ID（可选，精确匹配）
 * @property {string} [name] - 项目名称（可选，模糊搜索）
 * @property {number} [page] - 页码（默认1）
 * @property {number} [page_size] - 每页数量（默认10）
 */

/**
 * 查询项目详情请求参数
 * @typedef {Object} FetchProjectDetailParams
 * @property {number} project_id - 项目ID（必填）
 */

// ======== Entities ========

/**
 * 项目实体
 * @typedef {Object} ProjectEntity
 * @property {number} id - 项目ID
 * @property {string} name - 项目名称
 * @property {string} [description] - 项目描述
 * @property {number} user_id - 创建者用户ID
 * @property {string} creator - 创建者用户名
 * @property {number} status - 状态（1=正常，0=已删除）
 * @property {string} created_at - 创建时间
 * @property {string} updated_at - 更新时间
 */

// ======== Response Types ========

/**
 * 标准API响应格式
 * @template T
 * @typedef {Object} ApiResponse
 * @property {number} code - 状态码
 * @property {string} msg - 消息
 * @property {T} [data] - 响应数据
 */

/**
 * 分页数据格式
 * @template T
 * @typedef {Object} PaginatedData
 * @property {T[]} list - 数据列表
 * @property {number} total - 总数量
 * @property {number} page - 当前页码
 * @property {number} page_size - 每页数量
 */

/**
 * 项目列表响应
 * @typedef {ApiResponse<PaginatedData<ProjectEntity>>} ProjectListResponse
 */

/**
 * 项目详情响应
 * @typedef {ApiResponse<ProjectEntity>} ProjectDetailResponse
 */

// ======== Store State ========

/**
 * Project Store State
 * @typedef {Object} ProjectState
 * @property {ProjectEntity[]} projectList - 项目列表
 * @property {number} total - 项目总数
 * @property {ProjectEntity|null} currentProject - 当前选中项目
 * @property {boolean} loading - 加载状态
 */

export {}
