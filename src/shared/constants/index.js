/**
 * 全局常量定义
 * 遵循手册: 二.文件组织 - shared/constants
 * 命名规范: SCREAMING_SNAKE_CASE
 */

// ======== API 相关 ========
/** API 超时时间（毫秒） */
export const API_TIMEOUT = 30000

/** API 重试次数 */
export const MAX_RETRY_COUNT = 3

// ======== 分页相关 ========
/** 默认页码 */
export const DEFAULT_PAGE = 1

/** 默认每页条数 */
export const DEFAULT_PAGE_SIZE = 10

/** 可选每页条数列表 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// ======== 存储键名 ========
/** 语言设置 */
export const STORAGE_KEY_LANGUAGE = 'app_language'

/** 主题设置 */
export const STORAGE_KEY_THEME = 'app_theme'

/** 记住的账号 */
export const STORAGE_KEY_REMEMBER_ACCOUNT = 'remember_account'

// ======== 正则表达式 ========
/** 邮箱正则 */
export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** 手机号正则（中国大陆） */
export const REGEX_PHONE = /^1[3-9]\d{9}$/

/** 密码强度正则（至少8位，包含字母和数字） */
export const REGEX_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/

// ======== 业务常量 ========
/** 验证码倒计时秒数 */
export const VERIFICATION_CODE_COUNTDOWN = 60

/** 最大登录失败次数 */
export const MAX_LOGIN_ATTEMPTS = 5

/** 登录锁定时间（分钟） */
export const LOGIN_LOCK_DURATION = 30
