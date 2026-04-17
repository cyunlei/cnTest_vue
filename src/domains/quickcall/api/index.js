/**
 * QuickCall 领域 API 层
 * 职责: 快捷调用相关接口
 */
import { create, fetch } from '@/@core/http'

const QUICK_BASE_URL = '/api/v1/quick'

/**
 * 执行 HTTP 快捷调用
 * @param {Object} data
 */
export function executeQuickHttp(data) {
  return create(`${QUICK_BASE_URL}/http/execute`, data)
}

/**
 * 执行 MYSQL 快捷调用
 * @param {Object} data
 */
export function executeQuickMysql(data) {
  return create(`${QUICK_BASE_URL}/mysql/execute`, data)
}

/**
 * 执行 REDIS/JIMDB 快捷调用
 * @param {Object} data
 */
export function executeQuickRedis(data) {
  return create(`${QUICK_BASE_URL}/redis/execute`, data)
}

/**
 * 执行 SHELL 快捷调用
 * @param {Object} data
 */
export function executeQuickShell(data) {
  return create(`${QUICK_BASE_URL}/shell/execute`, data)
}

/**
 * 执行 HTTP 轮询
 * @param {Object} data
 */
export function executeHttpPoll(data) {
  return create(`${QUICK_BASE_URL}/http-poll/execute`, data)
}

/**
 * 查询 HTTP 轮询历史
 * @param {Object} params
 */
export function fetchHttpPollHistory(params) {
  return fetch(`${QUICK_BASE_URL}/http-poll/history`, params)
}

/**
 * 查询我的接口列表
 * @param {Object} params
 */
export function fetchMyInterfaces(params = {}) {
  return fetch(`${QUICK_BASE_URL}/interface/my`, params)
}

/**
 * 查询全部接口列表
 * @param {Object} params
 */
export function fetchAllInterfaces(params = {}) {
  return fetch(`${QUICK_BASE_URL}/interface/all`, params)
}

/**
 * 查询接口调用记录
 * @param {Object} params
 */
export function fetchCallHistory(params = {}) {
  return fetch(`${QUICK_BASE_URL}/call-history`, params)
}
