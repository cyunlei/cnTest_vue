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
 * 验证码点选坐标
 * @typedef {Object} CaptchaPoint
 * @property {number} x - X坐标
 * @property {number} y - Y坐标
 * @property {number} [t] - 时间戳（毫秒）
 */

/**
 * 验证码挑战数据
 * @typedef {Object} CaptchaChallenge
 * @property {string} image_url - 图片URL（可选）
 * @property {string} image_base64 - Base64编码的图片
 * @property {string} tip - 提示文字
 * @property {string} difficulty - 难度级别
 */

/**
 * 验证码约束条件
 * @typedef {Object} CaptchaConstraints
 * @property {number} max_attempts - 最大尝试次数
 * @property {number} time_limit - 时间限制（秒）
 * @property {number} expires_in - 过期时间（秒）
 */

/**
 * 获取图片验证码响应数据
 * @typedef {Object} CaptchaResponseData
 * @property {string} captcha_key - 验证码唯一标识
 * @property {string} type - 验证码类型 (text/image)
 * @property {CaptchaChallenge} challenge - 挑战数据
 * @property {CaptchaConstraints} constraints - 约束条件
 */

/**
 * 验证图片验证码请求DTO
 * @typedef {Object} VerifyCaptchaDTO
 * @property {string} captcha_key - 验证码标识（必填）
 * @property {CaptchaPoint[]} points - 点选坐标数组（必填）
 * @property {CaptchaPoint[]} [track] - 鼠标轨迹（可选）
 * @property {string} [fingerprint] - 设备指纹（可选）
 * @property {{width: number, height: number}} [viewport] - 视口大小（可选）
 * @property {number} [elapsed_ms] - 耗时毫秒（可选）
 */

/**
 * 验证图片验证码成功响应
 * @typedef {Object} VerifyCaptchaSuccessData
 * @property {boolean} success - 是否成功
 * @property {string} temp_token - 临时令牌
 * @property {number} expires_in - 过期时间（秒）
 * @property {string} risk_level - 风险等级
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
 * @typedef {ApiResponse<CaptchaResponseData>} GetCaptchaResponse
 */

/**
 * 验证图片验证码API响应
 * @typedef {ApiResponse<VerifyCaptchaSuccessData>} VerifyCaptchaResponseType
 */

export {}
