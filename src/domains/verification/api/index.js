/**
 * Verification 领域 API 层
 * 职责: 验证码服务相关接口
 * 
 * 后端API路径:
 * 
 * 邮箱/短信验证码:
 * - POST /verification/email/send   - 发送邮箱验证码
 * - POST /verification/email/verify - 验证邮箱验证码
 * - POST /verification/sms/send     - 发送短信验证码（预留）
 * - POST /verification/sms/verify   - 验证短信验证码（预留）
 * 
 * 图片验证码:
 * - GET  /verification/captcha              - 获取图片验证码
 * - POST /verification/captcha/verify       - 验证图片验证码
 * - POST /verification/captcha/refresh      - 刷新图片验证码
 * - POST /verification/captcha/validate-token - 验证临时令牌
 */
import { create, fetch } from '@/@core/http'

const BASE_URL = '/api/v1/verification'

// ========== 邮箱验证码 API ==========

/**
 * 发送邮箱验证码
 * POST /api/v1/verification/email/send
 * @param {import('../types').SendEmailCodeDTO} data
 * @returns {Promise<import('../types').SendCodeResponse>}
 */
export function sendEmailCode(data) {
  return create(`${BASE_URL}/email/send`, data)
}

/**
 * 验证邮箱验证码
 * POST /api/v1/verification/email/verify
 * @param {import('../types').VerifyEmailCodeDTO} data
 * @returns {Promise<import('../types').VerifyCodeResponse>}
 */
export function verifyEmailCode(data) {
  return create(`${BASE_URL}/email/verify`, data)
}

// ========== 短信验证码 API ==========

/**
 * 发送短信验证码
 * POST /api/v1/verification/sms/send
 * @param {import('../types').SendSmsCodeDTO} data
 * @returns {Promise<import('../types').SendCodeResponse>}
 */
export function sendSmsCode(data) {
  return create(`${BASE_URL}/sms/send`, data)
}

/**
 * 验证短信验证码
 * POST /api/v1/verification/sms/verify
 * @param {import('../types').VerifySmsCodeDTO} data
 * @returns {Promise<import('../types').VerifyCodeResponse>}
 */
export function verifySmsCode(data) {
  return create(`${BASE_URL}/sms/verify`, data)
}

// ========== 图片验证码 API ==========

/**
 * 获取图片验证码
 * GET /api/v1/verification/captcha
 * @param {Object} params - 查询参数
 * @param {string} [params.type='image'] - 验证码类型 (text/image)
 * @param {string} [params.difficulty='hard'] - 难度 (easy/medium/hard)
 * @returns {Promise<import('../types').GetCaptchaResponse>}
 */
export function getCaptcha(params = {}) {
  const queryParams = new URLSearchParams()
  queryParams.append('type', params.type || 'image')
  queryParams.append('difficulty', params.difficulty || 'hard')
  return fetch(`${BASE_URL}/captcha?${queryParams.toString()}`)
}

/**
 * 验证图片验证码
 * POST /api/v1/verification/captcha/verify
 * @param {import('../types').VerifyCaptchaDTO} data
 * @returns {Promise<import('../types').VerifyCaptchaResponseType>}
 */
export function verifyCaptcha(data) {
  return create(`${BASE_URL}/captcha/verify`, data)
}

/**
 * 刷新图片验证码
 * POST /api/v1/verification/captcha/refresh
 * @param {{old_captcha_key: string}} data
 * @returns {Promise<import('../types').GetCaptchaResponse>}
 */
export function refreshCaptcha(data) {
  return create(`${BASE_URL}/captcha/refresh`, data)
}

/**
 * 验证临时令牌
 * POST /api/v1/verification/captcha/validate-token
 * @param {{temp_token: string}} data
 * @returns {Promise<import('../types').ApiResponse<{valid: boolean}>>}
 */
export function validateTempToken(data) {
  return create(`${BASE_URL}/captcha/validate-token`, data)
}
