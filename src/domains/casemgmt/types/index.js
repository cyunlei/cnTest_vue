/**
 * CaseMgmt 领域类型定义
 * 职责: 测试用例管理相关的类型定义
 */

// ======== Enums ========

/** 用例类型枚举 @type {const} */
export const CASE_TYPE = {
  SMOKE: 0,        // 冒烟测试
  FUNCTIONAL: 1,   // 功能测试
  REGRESSION: 2,   // 回归测试
  PERFORMANCE: 3,  // 性能测试
  SECURITY: 4,     // 安全测试
  COMPATIBILITY: 5,// 兼容性测试
  OTHER: 6         // 其他
}

/** 优先级枚举 @type {const} */
export const PRIORITY = {
  P0: 0,  // 最高优先级
  P1: 1,
  P2: 2,
  P3: 3,
  P4: 4,
  P5: 5   // 最低优先级
}

/** 用例类型显示文本 */
export const CASE_TYPE_TEXT = {
  [CASE_TYPE.SMOKE]: '冒烟测试',
  [CASE_TYPE.FUNCTIONAL]: '功能测试',
  [CASE_TYPE.REGRESSION]: '回归测试',
  [CASE_TYPE.PERFORMANCE]: '性能测试',
  [CASE_TYPE.SECURITY]: '安全测试',
  [CASE_TYPE.COMPATIBILITY]: '兼容性测试',
  [CASE_TYPE.OTHER]: '其他'
}

/** 优先级显示文本 */
export const PRIORITY_TEXT = {
  [PRIORITY.P0]: 'P0',
  [PRIORITY.P1]: 'P1',
  [PRIORITY.P2]: 'P2',
  [PRIORITY.P3]: 'P3',
  [PRIORITY.P4]: 'P4',
  [PRIORITY.P5]: 'P5'
}

/** 优先级颜色 */
export const PRIORITY_COLOR = {
  [PRIORITY.P0]: '#ff4d4f',  // 红色
  [PRIORITY.P1]: '#ff7a45',  // 橙红
  [PRIORITY.P2]: '#ffa940',  // 橙色
  [PRIORITY.P3]: '#ffc53d',  // 黄色
  [PRIORITY.P4]: '#bae637',  // 黄绿
  [PRIORITY.P5]: '#73d13d'   // 绿色
}

// ======== TestCase DTOs ========

/**
 * 创建测试用例请求DTO
 * @typedef {Object} CreateTestCaseDTO
 * @property {string} name - 用例名称（必填）
 * @property {number} case_type - 用例类型（0-6，必填）
 * @property {number} parent_id - 所属用例集ID（必填）
 * @property {number} priority - 优先级（0-5，必填）
 * @property {string} [precondition] - 前置条件
 * @property {string} [post_condition] - 后置条件
 * @property {string} [tags] - 标签
 * @property {number} project_id - 项目ID（必填）
 */

/**
 * 更新测试用例请求DTO
 * @typedef {Object} UpdateTestCaseDTO
 * @property {number} case_id - 用例ID（必填）
 * @property {string} [name] - 用例名称
 * @property {number} [case_type] - 用例类型（0-6）
 * @property {number} [parent_id] - 所属用例集ID
 * @property {number} [priority] - 优先级（0-5）
 * @property {string} [precondition] - 前置条件
 * @property {string} [post_condition] - 后置条件
 * @property {string} [tags] - 标签
 * @property {number} [project_id] - 项目ID
 */

/**
 * 删除测试用例请求DTO
 * @typedef {Object} DeleteTestCaseDTO
 * @property {number} case_id - 用例ID（必填）
 */

/**
 * 查询测试用例列表请求参数
 * @typedef {Object} FetchTestCaseListParams
 * @property {number} [project_id] - 项目ID
 * @property {number} [case_id] - 用例ID（精确匹配）
 * @property {string} [name] - 用例名称（模糊搜索）
 * @property {number} [parent_id] - 所属用例集ID
 * @property {number} [case_type] - 用例类型
 * @property {number} [priority] - 优先级
 * @property {number} [page] - 页码（默认1）
 * @property {number} [page_size] - 每页数量（默认10）
 */

/**
 * 查询测试用例详情请求参数
 * @typedef {Object} FetchTestCaseDetailParams
 * @property {number} project_id - 项目ID（必填）
 * @property {number} case_id - 用例ID（必填）
 */

// ======== TestCase Entities ========

/**
 * 测试用例实体
 * @typedef {Object} TestCaseEntity
 * @property {number} id - 用例ID
 * @property {string} name - 用例名称
 * @property {number} case_type - 用例类型（0-6）
 * @property {number} parent_id - 所属用例集ID
 * @property {number} priority - 优先级（0-5）
 * @property {string} [precondition] - 前置条件
 * @property {string} [post_condition] - 后置条件
 * @property {string} [tags] - 标签
 * @property {number} project_id - 项目ID
 * @property {number} user_id - 创建者用户ID
 * @property {string} created_at - 创建时间
 * @property {string} updated_at - 更新时间
 */

// ======== TestCaseSuite DTOs ========

/**
 * 创建用例集请求DTO
 * @typedef {Object} CreateTestCaseSuiteDTO
 * @property {string} name - 用例集名称（必填）
 * @property {string} [description] - 描述
 * @property {number} [parent_id] - 父用例集ID
 * @property {number} project_id - 项目ID（必填）
 */

/**
 * 更新用例集请求DTO
 * @typedef {Object} UpdateTestCaseSuiteDTO
 * @property {number} suite_id - 用例集ID（必填）
 * @property {string} [name] - 用例集名称
 * @property {string} [description] - 描述
 * @property {number} [parent_id] - 父用例集ID
 * @property {number} [project_id] - 项目ID
 */

/**
 * 删除用例集请求DTO
 * @typedef {Object} DeleteTestCaseSuiteDTO
 * @property {number} suite_id - 用例集ID（必填）
 */

/**
 * 查询用例集列表请求参数
 * @typedef {Object} FetchTestCaseSuiteListParams
 * @property {number} project_id - 项目ID（必填）
 * @property {number} [suite_id] - 用例集ID
 * @property {string} [name] - 名称（模糊搜索）
 */

// ======== TestCaseSuite Entities ========

/**
 * 用例集实体
 * @typedef {Object} TestCaseSuiteEntity
 * @property {number} id - 用例集ID
 * @property {string} name - 用例集名称
 * @property {string} [description] - 描述
 * @property {number} [parent_id] - 父用例集ID
 * @property {number} project_id - 项目ID
 * @property {number} user_id - 创建者用户ID
 * @property {string} created_at - 创建时间
 * @property {string} updated_at - 更新时间
 */

// ======== TestCaseStep DTOs ========

/**
 * 创建测试步骤请求DTO
 * @typedef {Object} CreateTestCaseStepDTO
 * @property {number} case_id - 用例ID（必填）
 * @property {string} name - 步骤名称（必填）
 * @property {string} [description] - 描述
 * @property {number} [step_order] - 步骤顺序
 * @property {string} [step_type] - 步骤类型
 * @property {Object} [step_config] - 步骤配置
 */

/**
 * 更新测试步骤请求DTO
 * @typedef {Object} UpdateTestCaseStepDTO
 * @property {number} step_id - 步骤ID（必填）
 * @property {string} [name] - 步骤名称
 * @property {string} [description] - 描述
 * @property {number} [step_order] - 步骤顺序
 * @property {string} [step_type] - 步骤类型
 * @property {Object} [step_config] - 步骤配置
 */

/**
 * 删除测试步骤请求DTO
 * @typedef {Object} DeleteTestCaseStepDTO
 * @property {number} step_id - 步骤ID（必填）
 */

/**
 * 查询测试步骤列表请求参数
 * @typedef {Object} FetchTestCaseStepListParams
 * @property {number} case_id - 用例ID（必填）
 */

// ======== TestCaseStep Entities ========

/**
 * 测试步骤实体
 * @typedef {Object} TestCaseStepEntity
 * @property {number} id - 步骤ID
 * @property {number} case_id - 所属用例ID
 * @property {string} name - 步骤名称
 * @property {string} [description] - 描述
 * @property {number} step_order - 步骤顺序
 * @property {string} step_type - 步骤类型
 * @property {Object} step_config - 步骤配置
 * @property {string} created_at - 创建时间
 * @property {string} updated_at - 更新时间
 */

// ======== Execution DTOs ========

/**
 * 执行测试用例请求DTO
 * @typedef {Object} ExecuteTestCaseDTO
 * @property {number} case_id - 用例ID（必填）
 * @property {number} [env_id] - 环境ID
 * @property {Object} [config] - 执行配置
 */

/**
 * 执行测试步骤请求DTO
 * @typedef {Object} ExecuteTestCaseStepDTO
 * @property {number} step_id - 步骤ID（必填）
 * @property {number} [env_id] - 环境ID
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
 * 测试用例列表响应
 * @typedef {ApiResponse<PaginatedData<TestCaseEntity>>} TestCaseListResponse
 */

/**
 * 测试用例详情响应
 * @typedef {ApiResponse<TestCaseEntity>} TestCaseDetailResponse
 */

/**
 * 用例集列表响应
 * @typedef {ApiResponse<TestCaseSuiteEntity[]>} TestCaseSuiteListResponse
 */

/**
 * 用例集详情响应
 * @typedef {ApiResponse<TestCaseSuiteEntity>} TestCaseSuiteDetailResponse
 */

/**
 * 测试步骤列表响应
 * @typedef {ApiResponse<TestCaseStepEntity[]>} TestCaseStepListResponse
 */

// ======== Store State ========

/**
 * CaseMgmt Store State
 * @typedef {Object} CaseMgmtState
 * @property {TestCaseEntity[]} testCaseList - 测试用例列表
 * @property {number} testCaseTotal - 用例总数
 * @property {TestCaseEntity|null} currentTestCase - 当前选中用例
 * @property {TestCaseSuiteEntity[]} testCaseSuiteList - 用例集列表
 * @property {TestCaseStepEntity[]} testCaseStepList - 测试步骤列表
 * @property {boolean} loading - 加载状态
 */

export {}
