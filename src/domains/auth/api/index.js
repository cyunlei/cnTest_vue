/**
 * Auth 领域 API 层
 * 职责: 用户认证相关接口
 * 命名规范: 五.API 层 - 请求函数命名规范
 *   - 查询列表: fetchXxxList
 *   - 创建资源: createXxx
 *   - 更新资源: updateXxx
 *   - 删除资源: deleteXxx
 * 
 * 后端API路径:
 * - POST /accounts/register - 用户注册
 * - POST /accounts/login - 账号密码登录
 * - POST /accounts/email_code_login - 邮箱验证码登录
 * - POST /accounts/change_password - 修改密码
 * - POST /accounts/email_code_password - 邮箱验证码修改密码
 * - POST /accounts/check_account_exist - 检查账号是否存在
 */
import { create, fetch } from '@/@core/http'

const BASE_URL = '/api/v1/auth'

/**
 * 账号密码登录
 * POST /api/v1/auth/login
 * @param {import('../types').LoginByPasswordDTO} params
 * @returns {Promise<import('../types').LoginResponse>}
 */
export function loginByPassword(params) {
  return create(`${BASE_URL}/login`, params)
}

/**
 * 邮箱验证码登录（自动注册新用户）
 * POST /api/v1/auth/email_code_login
 * @param {import('../types').LoginByEmailCodeDTO} params
 * @returns {Promise<import('../types').LoginResponse>}
 */
export function loginByEmailCode(params) {
  return create(`${BASE_URL}/email_code_login`, params)
}

/**
 * 发送邮箱验证码
 * POST /api/v1/auth/send_email_code
 * @param {{email: string}} params
 * @returns {Promise<import('../types').ApiResponse<void>>}
 */
export function sendEmailCode(params) {
  return create(`${BASE_URL}/send_email_code`, params)
}

/**
 * 用户注册
 * POST /api/v1/auth/register
 * @param {import('../types').RegisterDTO} params
 * @returns {Promise<import('../types').ApiResponse<void>>}
 */
export function createUser(params) {
  return create(`${BASE_URL}/register`, params)
}

/**
 * 检查账号是否存在
 * POST /api/v1/auth/check_account_exist
 * @param {import('../types').CheckAccountExistDTO} params
 * @returns {Promise<import('../types').ApiResponse<void>>}
 */
export function checkAccountExist(params) {
  return create(`${BASE_URL}/check_account_exist`, params)
}

/**
 * 修改密码（原密码方式）
 * POST /api/v1/auth/change_password
 * @param {import('../types').ChangePasswordDTO} params
 * @returns {Promise<import('../types').ApiResponse<void>>}
 */
export function updatePassword(params) {
  return create(`${BASE_URL}/change_password`, params)
}

/**
 * 邮箱验证码修改密码
 * POST /api/v1/auth/email_code_password
 * @param {import('../types').EmailCodeChangePasswordDTO} params
 * @returns {Promise<import('../types').ApiResponse<void>>}
 */
export function updatePasswordByEmailCode(params) {
  return create(`${BASE_URL}/email_code_password`, params)
}
