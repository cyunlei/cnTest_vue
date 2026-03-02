/**
 * Auth 领域类型定义 (JSDoc 版本)
 * 遵循手册: 六.类型系统 - 领域驱动类型
 */

// ==================== Entity ====================
/**
 * @typedef {Object} UserEntity
 * @property {string} id
 * @property {string} username
 * @property {string} email
 * @property {string} [phone]
 * @property {string} [avatar]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

// ==================== DTO ====================
/**
 * @typedef {Object} LoginDTO
 * @property {string} username
 * @property {string} password
 */

/**
 * @typedef {Object} EmailCodeLoginDTO
 * @property {string} email
 * @property {string} code
 */

/**
 * @typedef {Object} RegisterDTO
 * @property {string} username
 * @property {string} password
 * @property {string} email
 * @property {string} [phone]
 * @property {string} code
 */

/**
 * @typedef {Object} SendEmailCodeDTO
 * @property {string} email
 */

/**
 * @typedef {Object} CheckAccountExistDTO
 * @property {string} [username]
 * @property {string} [email]
 * @property {string} [phone]
 */

/**
 * @typedef {Object} ChangePasswordDTO
 * @property {string} oldPassword
 * @property {string} newPassword
 */

/**
 * @typedef {Object} EmailCodeChangePasswordDTO
 * @property {string} email
 * @property {string} code
 * @property {string} newPassword
 */

// ==================== Response Data ====================
/**
 * @typedef {Object} LoginResponseData
 * @property {string} token
 * @property {string} [refresh]
 * @property {UserEntity} [user]
 */

// ==================== Store State ====================
/**
 * @typedef {Object} AuthState
 * @property {string} token
 * @property {string} refreshToken
 * @property {UserEntity|null} userInfo
 */

export {}
