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

const BASE_URL = '/verification'

// ========== 邮箱验证码 API ==========

/**
 * 发送邮箱验证码
 * POST /verification/email/send
 * @param {import('../types').SendEmailCodeDTO} data
 * @returns {Promise<import('../types').SendCodeResponse>}
 */
export function sendEmailCode(data) {
  return create(`${BASE_URL}/email/send`, data)
}

/**
 * 验证邮箱验证码
 * POST /verification/email/verify
 * @param {import('../types').VerifyEmailCodeDTO} data
 * @returns {Promise<import('../types').VerifyCodeResponse>}
 */
export function verifyEmailCode(data) {
  return create(`${BASE_URL}/email/verify`, data)
}

// ========== 短信验证码 API ==========

/**
 * 发送短信验证码
 * POST /verification/sms/send
 * @param {import('../types').SendSmsCodeDTO} data
 * @returns {Promise<import('../types').SendCodeResponse>}
 */
export function sendSmsCode(data) {
  return create(`${BASE_URL}/sms/send`, data)
}

/**
 * 验证短信验证码
 * POST /verification/sms/verify
 * @param {import('../types').VerifySmsCodeDTO} data
 * @returns {Promise<import('../types').VerifyCodeResponse>}
 */
export function verifySmsCode(data) {
  return create(`${BASE_URL}/sms/verify`, data)
}

// ========== 图片验证码 API ==========

/**
 * 获取图片验证码
 * GET /verification/captcha
 * @returns {Promise<import('../types').GetCaptchaResponse>}
 */
export function getCaptcha() {
  return fetch(`${BASE_URL}/captcha`)
}

/**
 * 验证图片验证码
 * POST /verification/captcha/verify
 * @param {import('../types').VerifyCaptchaDTO} data
 * @returns {Promise<import('../types').VerifyCaptchaResponseType>}
 */
export function verifyCaptcha(data) {
  return create(`${BASE_URL}/captcha/verify`, data)
}

/**
 * 刷新图片验证码
 * POST /verification/captcha/refresh
 * @param {{captcha_id: string}} data
 * @returns {Promise<import('../types').GetCaptchaResponse>}
 */
export function refreshCaptcha(data) {
  return create(`${BASE_URL}/captcha/refresh`, data)
}

/**
 * 验证临时令牌
 * POST /verification/captcha/validate-token
 * @param {{temp_token: string}} data
 * @returns {Promise<import('../types').ApiResponse<{valid: boolean}>>}
 */
export function validateTempToken(data) {
  return create(`${BASE_URL}/captcha/validate-token`, data)
}
