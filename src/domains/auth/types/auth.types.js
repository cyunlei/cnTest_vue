/**
 * Auth 领域类型定义
 * 遵循手册: 六.类型系统 - 领域驱动类型
 * 规范: 使用 JSDoc 类型定义，便于 IDE 类型提示
 */

// ======== DTOs (Data Transfer Objects) ========

/**
 * 账号密码登录请求DTO
 * @typedef {Object} LoginByPasswordDTO
 * @property {string} [username] - 用户名
 * @property {string} [email] - 邮箱
 * @property {string} [phone] - 手机号
 * @property {string} password - 密码（必填）
 */

/**
 * 邮箱验证码登录请求DTO
 * @typedef {Object} LoginByEmailCodeDTO
 * @property {string} email - 邮箱（必填）
 * @property {string} code - 验证码（必填）
 */

/**
 * 用户注册请求DTO
 * @typedef {Object} RegisterDTO
 * @property {string} username - 用户名（必填）
 * @property {string} password - 密码（必填）
 * @property {string} email - 邮箱（必填）
 * @property {string} [phone] - 手机号（可选）
 * @property {string} code - 邮箱验证码（必填）
 */

/**
 * 修改密码请求DTO
 * @typedef {Object} ChangePasswordDTO
 * @property {string} username - 用户名（必填）
 * @property {string} old_password - 原密码（必填）
 * @property {string} new_password - 新密码（必填）
 */

/**
 * 邮箱验证码修改密码请求DTO
 * @typedef {Object} EmailCodeChangePasswordDTO
 * @property {string} email - 邮箱（必填）
 * @property {string} code - 验证码（必填）
 * @property {string} new_password - 新密码（必填）
 */

/**
 * 检查账号是否存在请求DTO
 * @typedef {Object} CheckAccountExistDTO
 * @property {string} [username] - 用户名
 * @property {string} [email] - 邮箱
 * @property {string} [phone] - 手机号
 */

// ======== Entities ========

/**
 * 用户实体
 * @typedef {Object} UserEntity
 * @property {string} username - 用户名
 * @property {string} email - 邮箱
 * @property {string} [phone] - 手机号
 * @property {string} [tags] - 标签
 * @property {boolean} is_active - 是否激活
 * @property {string} created_at - 创建时间
 * @property {string} updated_at - 更新时间
 */

/**
 * 登录响应数据
 * @typedef {Object} LoginResponseData
 * @property {string} token - 访问令牌
 * @property {string} refresh - 刷新令牌
 * @property {string} [username] - 用户名（仅邮箱验证码登录注册新用户时返回）
 */

// ======== API Response Types ========

/**
 * 标准API响应格式
 * @template T
 * @typedef {Object} ApiResponse
 * @property {number} code - 状态码
 * @property {string} msg - 消息
 * @property {T} [data] - 响应数据
 */

/**
 * 登录响应
 * @typedef {ApiResponse<LoginResponseData>} LoginResponse
 */

/**
 * 用户信息响应
 * @typedef {ApiResponse<UserEntity>} UserResponse
 */

// ======== Store State Types ========

/**
 * Auth Store State
 * @typedef {Object} AuthState
 * @property {string} token - 访问令牌
 * @property {string} refreshToken - 刷新令牌
 * @property {UserEntity|null} userInfo - 用户信息
 * @property {boolean} isLoggedIn - 是否已登录
 */

export {}
