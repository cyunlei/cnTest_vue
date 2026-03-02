/**
 * Auth 领域 API 层
 * 职责: 用户认证相关接口
 * 命名规范: 五.API 层 - 请求函数命名规范
 *   - 查询列表: fetchXxxList
 *   - 创建资源: createXxx
 *   - 更新资源: updateXxx
 *   - 删除资源: deleteXxx
 */
import { create } from '@/@core/http'

const BASE_URL = '/accounts/api'

/**
 * 账号密码登录
 * POST /accounts/api/login
 * @param {import('../types').LoginDTO} params
 */
export function loginByPassword(params) {
  return create(`${BASE_URL}/login`, params)
}

/**
 * 邮箱验证码登录（自动注册新用户）
 * POST /accounts/api/email_code_login
 * @param {import('../types').EmailCodeLoginDTO} params
 */
export function loginByEmailCode(params) {
  return create(`${BASE_URL}/email_code_login`, params)
}

/**
 * 用户注册
 * POST /accounts/api/register
 * @param {import('../types').RegisterDTO} params
 */
export function createUser(params) {
  return create(`${BASE_URL}/register`, params)
}

/**
 * 发送邮箱验证码
 * POST /accounts/api/send_email_code
 * @param {import('../types').SendEmailCodeDTO} params
 */
export function sendEmailCode(params) {
  return create(`${BASE_URL}/send_email_code`, params)
}

/**
 * 检查账号是否存在
 * POST /accounts/api/check_account_exist
 * @param {import('../types').CheckAccountExistDTO} params
 */
export function checkAccountExist(params) {
  return create(`${BASE_URL}/check_account_exist`, params)
}

/**
 * 修改密码（原密码方式）
 * POST /accounts/api/change_password
 * @param {import('../types').ChangePasswordDTO} params
 */
export function updatePassword(params) {
  return create(`${BASE_URL}/change_password`, params)
}

/**
 * 邮箱验证码修改密码
 * POST /accounts/api/email_code_password
 * @param {import('../types').EmailCodeChangePasswordDTO} params
 */
export function updatePasswordByEmailCode(params) {
  return create(`${BASE_URL}/email_code_password`, params)
}
