/**
 * 任务管理领域类型定义
 * 遵循手册: 四.4 类型系统
 */

/** 执行方式 */
export const EXEC_TYPE = {
  MANUAL: '手动执行',
  SCHEDULED: '周期执行'
}

/** 任务状态 */
export const TASK_STATUS = {
  ENABLED: '已启用',
  DISABLED: '已停用'
}

/** 中断策略 */
export const BREAK_STRATEGY = {
  IGNORE: '忽略错误继续执行',
  STOP: '遇到错误中断执行'
}

/** 串并行配置 */
export const PARALLEL_CONFIG = {
  SERIAL: '串行执行',
  PARALLEL: '并行执行'
}

/** 通知配置 */
export const NOTIFY_CONFIG = {
  NO: '不通知',
  YES: '通知'
}

/** 监控状态 */
export const MONITOR_STATUS = {
  UNPROCESSED: '未处理',
  PROCESSED: '已处理'
}

/** 选取方式 */
export const SELECT_TYPE = {
  CASE: '用例选取',
  STEP: '步骤选取'
}
