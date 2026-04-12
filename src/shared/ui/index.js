/**
 * UI 层统一导出
 * 职责: 封装第三方组件库，提供项目统一使用的 UI 组件和服务
 * 遵循手册: 六.通用约束 - 第三方组件库需封装后使用
 */

// ======== Services ========
export {
  showSuccess,
  showWarning,
  showError,
  showInfo,
  useMessage
} from './services/useMessage'
