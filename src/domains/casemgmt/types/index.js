/**
 * CaseMgmt 领域类型定义
 * 职责: 测试用例、用例集、测试步骤相关类型
 * 遵循手册: 六.类型系统 - 领域驱动类型
 */

// ======== 测试步骤 Enums ========

/**
 * 步骤类型（与后端整数枚举保持一致）
 * 0-HTTP,1-MySQL,2-Redis,3-JMQ,4-DUBBO,5-KAFKA,6-R2M,7-FMQ,8-JAR,9-SHELL,10-循环,11-条件,12-STARDB,13-SCHEDULEJOB
 * @type {const}
 */
export const STEP_TYPE = {
  HTTP: 0,
  MYSQL: 1,
  REDIS: 2,
  JMQ: 3,
  DUBBO: 4,
  KAFKA: 5,
  R2M: 6,
  FMQ: 7,
  JAR: 8,
  SHELL: 9,
  LOOP: 10,
  CONDITION: 11,
  STARDB: 12,
  SCHEDULEJOB: 13
}

/**
 * 环境编码：0=测试,1=预发,2=生产
 * @type {const}
 */
export const ENV_CODE = {
  TEST: 0,
  STAGING: 1,
  PRODUCTION: 2
}

/**
 * HTTP 请求方法：0=GET,1=POST,2=PUT,3=PATCH,4=DELETE,5=HEAD,6=OPTIONS
 * @type {const}
 */
export const HTTP_METHOD = {
  GET: 0,
  POST: 1,
  PUT: 2,
  PATCH: 3,
  DELETE: 4,
  HEAD: 5,
  OPTIONS: 6
}

// ======== 测试步骤 DTOs ========

/**
 * 创建测试步骤请求 DTO
 * POST /api/v1/testcases/step/create application/json
 * @typedef {Object} CreateStepDTO
 * @property {string} name - 步骤名称（必填）
 * @property {number} step_type - 步骤类型（必填，参见 STEP_TYPE）
 * @property {number} project_id - 项目 ID（必填）
 * @property {number} testcase_id - 用例 ID（必填）
 * @property {number} env_code - 环境编码（必填，0=测试,1=预发,2=生产）
 * @property {string} [api_url] - API 地址（HTTP 类型必填）
 * @property {number} [method] - 请求方法（参见 HTTP_METHOD）
 * @property {string} [expected_result] - 预期结果
 * @property {Object} [paramsAndAssert] - 入参和断言配置
 * @property {Object} [type_config] - 类型专属配置
 * @property {Object} [preset_variables] - 预设变量
 * @property {number} [max_wait_time] - 最大等待时间（秒）
 * @property {number} [retry_count] - 重试次数
 * @property {number} [sort_order] - 排序序号
 */

/**
 * 更新测试步骤请求 DTO
 * POST /api/v1/testcases/step/update application/json
 * @typedef {Object} UpdateStepDTO
 * @property {number} step_id - 步骤 ID（必填）
 * @property {string} [name] - 步骤名称
 * @property {number} [step_type] - 步骤类型（参见 STEP_TYPE）
 * @property {number} [project_id] - 项目 ID
 * @property {number} [testcase_id] - 用例 ID
 * @property {number} [env_code] - 环境编码（0=测试,1=预发,2=生产）
 * @property {string} [api_url] - API 地址（HTTP 类型必填）
 * @property {number} [method] - 请求方法（参见 HTTP_METHOD）
 * @property {string} [expected_result] - 预期结果
 * @property {Object} [paramsAndAssert] - 入参和断言配置
 * @property {Object} [type_config] - 类型专属配置
 * @property {Object} [preset_variables] - 预设变量
 * @property {number} [max_wait_time] - 最大等待时间（秒）
 * @property {number} [retry_count] - 重试次数
 * @property {number} [sort_order] - 排序序号
 */

/**
 * 删除测试步骤请求 DTO
 * POST /api/v1/testcases/step/delete application/json
 * @typedef {Object} DeleteStepDTO
 * @property {number} step_id - 步骤 ID（必填）
 */

/**
 * 查询步骤列表请求参数
 * GET /api/v1/testcases/step/list query
 * @typedef {Object} FetchStepListParams
 * @property {number} [project_id] - 项目 ID
 * @property {number} [testcase_id] - 用例 ID
 * @property {number} [env_code] - 环境编码
 * @property {number} [step_type] - 步骤类型
 * @property {string} [name] - 步骤名称（模糊搜索）
 * @property {number} [page] - 页码
 * @property {number} [page_size] - 每页数量
 */

/**
 * 查询步骤详情请求参数
 * GET /api/v1/testcases/step/detail query
 * @typedef {Object} FetchStepDetailParams
 * @property {number} step_id - 步骤 ID（必填）
 */

// ======== 测试步骤 Entity ========

/**
 * 测试步骤实体
 * @typedef {Object} StepEntity
 * @property {number} id - 步骤 ID
 * @property {number} project_id - 项目 ID
 * @property {number} testcase_id - 所属用例 ID
 * @property {string} name - 步骤名称
 * @property {number} step_type - 步骤类型（参见 STEP_TYPE）
 * @property {number} env_code - 环境编码
 * @property {string} [api_url] - API 地址
 * @property {number} [method] - 请求方法（参见 HTTP_METHOD）
 * @property {string} [expected_result] - 预期结果
 * @property {Object} [paramsAndAssert] - 入参和断言配置
 * @property {Object} [type_config] - 类型专属配置
 * @property {Object} [preset_variables] - 预设变量
 * @property {number} [max_wait_time] - 最大等待时间（秒）
 * @property {number} [retry_count] - 重试次数
 * @property {number} sort_order - 排序序号
 * @property {string} [created_at] - 创建时间
 * @property {string} [updated_at] - 更新时间
 */

// ======== 用例集 DTOs ========

/**
 * 创建用例集请求 DTO
 * POST /api/v1/testcases/suite/create application/json
 * @typedef {Object} CreateSuiteDTO
 * @property {number} project_id - 项目 ID（必填）
 * @property {string} name - 用例集名称（必填）
 * @property {string} [description] - 描述
 */

/**
 * 更新用例集请求 DTO
 * POST /api/v1/testcases/suite/update application/json
 * @typedef {Object} UpdateSuiteDTO
 * @property {number} suite_id - 用例集 ID（必填）
 * @property {string} [name] - 用例集名称
 * @property {string} [description] - 描述
 */

/**
 * 删除用例集请求 DTO
 * POST /api/v1/testcases/suite/delete application/json
 * @typedef {Object} DeleteSuiteDTO
 * @property {number} suite_id - 用例集 ID（必填）
 */

/**
 * 查询用例集列表请求参数
 * GET /api/v1/testcases/suite/list query
 * @typedef {Object} FetchSuiteListParams
 * @property {number} [project_id] - 项目 ID
 * @property {string} [name] - 用例集名称（模糊搜索）
 * @property {number} [page] - 页码
 * @property {number} [page_size] - 每页数量
 */

/**
 * 查询用例集详情请求参数
 * GET /api/v1/testcases/suite/detail query
 * @typedef {Object} FetchSuiteDetailParams
 * @property {number} suite_id - 用例集 ID（必填）
 */

// ======== 用例集 Entity ========

/**
 * 用例集实体
 * @typedef {Object} SuiteEntity
 * @property {number} id - 用例集 ID
 * @property {number} project_id - 项目 ID
 * @property {string} name - 用例集名称
 * @property {string} [description] - 描述
 * @property {string} [created_at] - 创建时间
 * @property {string} [updated_at] - 更新时间
 */

// ======== 通用响应类型 ========

/**
 * 标准 API 响应格式
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
 * @property {number} [page] - 当前页码
 * @property {number} [page_size] - 每页数量
 */

/**
 * 步骤列表响应
 * @typedef {ApiResponse<PaginatedData<StepEntity>>} StepListResponse
 */

/**
 * 步骤详情响应
 * @typedef {ApiResponse<StepEntity>} StepDetailResponse
 */

/**
 * 创建/更新/删除步骤响应
 * @typedef {ApiResponse<StepEntity>} StepMutationResponse
 */

/**
 * 用例集列表响应
 * @typedef {ApiResponse<PaginatedData<SuiteEntity>>} SuiteListResponse
 */

/**
 * 用例集详情响应
 * @typedef {ApiResponse<SuiteEntity>} SuiteDetailResponse
 */

/**
 * 创建/更新/删除用例集响应
 * @typedef {ApiResponse<SuiteEntity>} SuiteMutationResponse
 */
 
// ======== 测试用例 DTOs ========

/**
 * 创建测试用例请求 DTO
 * POST /api/v1/testcases/create application/json
 * @typedef {Object} CreateTestcaseDTO
 * @property {number} project_id - 项目 ID（必填）
 * @property {number} suite_id - 所属用例集 ID（必填）
 * @property {string} name - 用例名称（必填）
 * @property {string} [type] - 用例类型（冒烟/功能/回归等）
 * @property {string} [remark] - 备注
 * @property {string} [tags] - 标签，逗号分隔
 * @property {string} [app_code] - 关联应用编码
 * @property {string} [group] - 逻辑分组
 */

/**
 * 更新测试用例请求 DTO
 * POST /api/v1/testcases/update application/json
 * @typedef {Object} UpdateTestcaseDTO
 * @property {number} testcase_id - 测试用例 ID（必填）
 * @property {number} [project_id] - 项目 ID
 * @property {number} [suite_id] - 所属用例集 ID
 * @property {string} [name] - 用例名称
 * @property {string} [type] - 用例类型
 * @property {string} [remark] - 备注
 * @property {string} [tags] - 标签
 * @property {string} [app_code] - 关联应用编码
 * @property {string} [group] - 逻辑分组
 */

/**
 * 删除测试用例请求 DTO
 * POST /api/v1/testcases/delete application/json
 * @typedef {Object} DeleteTestcaseDTO
 * @property {number} testcase_id - 测试用例 ID（必填）
 */

/**
 * 查询测试用例列表请求参数
 * GET /api/v1/testcases/list query
 * @typedef {Object} FetchTestcaseListParams
 * @property {number} [project_id] - 项目 ID
 * @property {number} [suite_id] - 所属用例集 ID
 * @property {string} [name] - 用例名称（模糊搜索）
 * @property {string} [creator] - 创建人 ERP
 * @property {string} [type] - 用例类型
 * @property {number} [page] - 页码
 * @property {number} [page_size] - 每页数量
 */

/**
 * 查询测试用例详情请求参数
 * GET /api/v1/testcases/detail query
 * @typedef {Object} FetchTestcaseDetailParams
 * @property {number} testcase_id - 测试用例 ID（必填）
 */

// ======== 测试用例 Entity ========

/**
 * 测试用例实体
 * @typedef {Object} TestcaseEntity
 * @property {number} id - 测试用例 ID
 * @property {number} project_id - 项目 ID
 * @property {number} suite_id - 所属用例集 ID
 * @property {string} name - 用例名称
 * @property {string} [type] - 用例类型
 * @property {string} [remark] - 备注
 * @property {string} [tags] - 标签
 * @property {string} [app_code] - 关联应用编码
 * @property {string} [group] - 逻辑分组
 * @property {string} [creator] - 创建人
 * @property {string} [created_at] - 创建时间
 * @property {string} [updated_at] - 更新时间
 */

/**
 * 测试用例列表响应
 * @typedef {ApiResponse<PaginatedData<TestcaseEntity>>} TestcaseListResponse
 */

/**
 * 测试用例详情响应
 * @typedef {ApiResponse<TestcaseEntity>} TestcaseDetailResponse
 */

/**
 * 创建/更新/删除测试用例响应
 * @typedef {ApiResponse<TestcaseEntity>} TestcaseMutationResponse
 */

export {}
