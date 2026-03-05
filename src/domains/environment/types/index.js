/**
 * Environment 领域类型定义
 * 职责: 环境管理相关的类型定义
 */

// ======== Enums ========

/** 协议类型枚举 @type {const} */
export const PROTOCOL_TYPE = {
  HTTP: 0,
  HTTPS: 1
}

/** 环境标识枚举 @type {const} */
export const ENVIRONMENT_CODE = {
  TEST: 0,      // 测试环境
  STAGING: 1,   // 预发环境
  PRODUCTION: 2 // 生产环境
}

/** 协议类型显示文本 */
export const PROTOCOL_TYPE_TEXT = {
  [PROTOCOL_TYPE.HTTP]: 'HTTP',
  [PROTOCOL_TYPE.HTTPS]: 'HTTPS'
}

/** 环境标识显示文本 */
export const ENVIRONMENT_CODE_TEXT = {
  [ENVIRONMENT_CODE.TEST]: '测试环境',
  [ENVIRONMENT_CODE.STAGING]: '预发环境',
  [ENVIRONMENT_CODE.PRODUCTION]: '生产环境'
}

// ======== DTOs ========

/**
 * 创建环境请求DTO
 * @typedef {Object} CreateEnvironmentDTO
 * @property {number} project_id - 项目ID（必填）
 * @property {string} name - 环境名称（必填，最大100字符）
 * @property {number} [protocol] - 协议类型（0=HTTP, 1=HTTPS，默认HTTPS）
 * @property {string} domain - 域名（必填，最大255字符）
 * @property {number} [port] - 端口（默认80/443）
 * @property {number} code - 环境标识（0=测试, 1=预发, 2=生产）
 * @property {string} [remark] - 备注（可选，最大500字符）
 */

/**
 * 更新环境请求DTO
 * @typedef {Object} UpdateEnvironmentDTO
 * @property {number} env_id - 环境ID（必填）
 * @property {number} [project_id] - 项目ID（可选，用于切换项目）
 * @property {string} [name] - 环境名称（可选，最大100字符）
 * @property {number} [protocol] - 协议类型（可选）
 * @property {string} [domain] - 域名（可选，最大255字符）
 * @property {number} [port] - 端口（可选）
 * @property {number} [code] - 环境标识（可选）
 * @property {string} [remark] - 备注（可选，最大500字符）
 */

/**
 * 删除环境请求DTO
 * @typedef {Object} DeleteEnvironmentDTO
 * @property {number} env_id - 环境ID（必填）
 */

/**
 * 查询环境列表请求参数
 * @typedef {Object} FetchEnvironmentListParams
 * @property {number} [project_id] - 项目ID（可选）
 * @property {number} [env_id] - 环境ID（可选，精确匹配）
 * @property {string} [name] - 环境名称（可选，模糊搜索）
 * @property {number} [code] - 环境标识（可选）
 * @property {number} [page] - 页码（默认1）
 * @property {number} [page_size] - 每页数量（默认10）
 */

/**
 * 查询环境详情请求参数
 * @typedef {Object} FetchEnvironmentDetailParams
 * @property {number} project_id - 项目ID（必填）
 * @property {number} env_id - 环境ID（必填）
 */

// ======== Entities ========

/**
 * 环境实体
 * @typedef {Object} EnvironmentEntity
 * @property {number} id - 环境ID
 * @property {string} name - 环境名称
 * @property {number} protocol - 协议类型（0=HTTP, 1=HTTPS）
 * @property {string} domain - 域名
 * @property {number} port - 端口
 * @property {number} code - 环境标识（0=测试, 1=预发, 2=生产）
 * @property {string} [remark] - 备注
 * @property {number} project_id - 所属项目ID
 * @property {number} user_id - 创建者用户ID
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
 * 环境列表响应
 * @typedef {ApiResponse<PaginatedData<EnvironmentEntity>>} EnvironmentListResponse
 */

/**
 * 环境详情响应
 * @typedef {ApiResponse<EnvironmentEntity>} EnvironmentDetailResponse
 */

// ======== Store State ========

/**
 * Environment Store State
 * @typedef {Object} EnvironmentState
 * @property {EnvironmentEntity[]} environmentList - 环境列表
 * @property {number} total - 环境总数
 * @property {EnvironmentEntity|null} currentEnvironment - 当前选中环境
 * @property {boolean} loading - 加载状态
 */

export {}
