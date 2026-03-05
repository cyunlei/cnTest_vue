/**
 * Verification 领域类型定义
 * 职责: 验证码服务相关的类型定义
 */

// ======== DTOs ========

/**
 * 发送邮箱验证码请求DTO
 * @typedef {Object} SendEmailCodeDTO
 * @property {string} email - 邮箱地址（必填）
 * @property {string} [scene] - 使用场景（register/login/reset_password等）
 */

/**
 * 验证邮箱验证码请求DTO
 * @typedef {Object} VerifyEmailCodeDTO
 * @property {string} email - 邮箱地址（必填）
 * @property {string} code - 验证码（必填）
 */

/**
 * 发送短信验证码请求DTO
 * @typedef {Object} SendSmsCodeDTO
 * @property {string} phone - 手机号（必填）
 * @property {string} [scene] - 使用场景
 */

/**
 * 验证短信验证码请求DTO
 * @typedef {Object} VerifySmsCodeDTO
 * @property {string} phone - 手机号（必填）
 * @property {string} code - 验证码（必填）
 */

/**
 * 获取图片验证码响应
 * @typedef {Object} CaptchaResponse
 * @property {string} captcha_id - 验证码ID
 * @property {string} image_base64 - Base64编码的图片
 * @property {number} expire_seconds - 过期时间（秒）
 */

/**
 * 验证图片验证码请求DTO
 * @typedef {Object} VerifyCaptchaDTO
 * @property {string} captcha_id - 验证码ID（必填）
 * @property {string} code - 验证码内容（必填）
 */

/**
 * 验证图片验证码响应
 * @typedef {Object} VerifyCaptchaResponse
 * @property {string} temp_token - 临时令牌（用于后续操作）
 * @property {number} expire_seconds - 过期时间（秒）
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
 * 发送验证码响应
 * @typedef {ApiResponse<void>} SendCodeResponse
 */

/**
 * 验证验证码响应
 * @typedef {ApiResponse<{valid: boolean}>} VerifyCodeResponse
 */

/**
 * 获取图片验证码API响应
 * @typedef {ApiResponse<CaptchaResponse>} GetCaptchaResponse
 */

/**
 * 验证图片验证码API响应
 * @typedef {ApiResponse<VerifyCaptchaResponse>} VerifyCaptchaResponseType
 */

export {}
