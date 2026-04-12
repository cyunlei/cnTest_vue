/**
 * 消息通知服务
 * 职责: 封装 Element Plus ElMessage，提供统一的消息通知接口
 * 遵循手册: 六.通用约束 - 第三方组件库需封装后使用
 */
import { ElMessage } from 'element-plus'

/**
 * 显示成功消息
 * @param {string} message - 消息内容
 * @param {number} [duration] - 显示时长（毫秒），默认 3000
 */
export function showSuccess(message, duration = 3000) {
  ElMessage.success({ message, duration })
}

/**
 * 显示警告消息
 * @param {string} message - 消息内容
 * @param {number} [duration] - 显示时长（毫秒），默认 3000
 */
export function showWarning(message, duration = 3000) {
  ElMessage.warning({ message, duration })
}

/**
 * 显示错误消息
 * @param {string} message - 消息内容
 * @param {number} [duration] - 显示时长（毫秒），默认 5000
 */
export function showError(message, duration = 5000) {
  ElMessage.error({ message, duration })
}

/**
 * 显示信息消息
 * @param {string} message - 消息内容
 * @param {number} [duration] - 显示时长（毫秒），默认 3000
 */
export function showInfo(message, duration = 3000) {
  ElMessage.info({ message, duration })
}

/**
 * Composable: 使用消息服务
 * @returns {{
 *   showSuccess: (msg: string, duration?: number) => void,
 *   showWarning: (msg: string, duration?: number) => void,
 *   showError: (msg: string, duration?: number) => void,
 *   showInfo: (msg: string, duration?: number) => void
 * }}
 */
export function useMessage() {
  return {
    showSuccess,
    showWarning,
    showError,
    showInfo
  }
}
