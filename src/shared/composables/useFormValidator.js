/**
 * 表单验证 Composable
 * 遵循手册: 七.逻辑复用 - Composables 分类
 */
import { ref, computed } from 'vue'

/**
 * @typedef {Object} ValidationRule
 * @property {string} name
 * @property {(value: string) => boolean} validator
 * @property {string} message
 */

/**
 * @typedef {Object} UseFormValidatorOptions
 * @property {ValidationRule[]} [rules]
 * @property {boolean} [immediate]
 */

/**
 * @typedef {Object} UseFormValidatorReturn
 * @property {import('vue').Ref<string>} value
 * @property {import('vue').Ref<string>} error
 * @property {import('vue').ComputedRef<boolean>} isValid
 * @property {import('vue').Ref<boolean>} isTouched
 * @property {() => boolean} validate
 * @property {() => void} clear
 * @property {(val: string) => void} setValue
 */

/** 邮箱验证正则 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** 手机号验证正则（中国大陆） */
export const PHONE_REGEX = /^1[3-9]\d{9}$/

/** 预定义验证规则 */
export const ValidationRules = {
  /** 必填 */
  required: (msg = '此项为必填项') => ({
    name: 'required',
    validator: (v) => !!v?.trim(),
    message: msg
  }),
  /** 邮箱格式 */
  email: (msg = '请输入正确的邮箱格式') => ({
    name: 'email',
    validator: (v) => !v || EMAIL_REGEX.test(v.trim()),
    message: msg
  }),
  /** 手机号格式 */
  phone: (msg = '请输入正确的手机号') => ({
    name: 'phone',
    validator: (v) => !v || PHONE_REGEX.test(v.trim()),
    message: msg
  }),
  /** 最小长度 */
  minLength: (length, msg) => ({
    name: 'minLength',
    validator: (v) => !v || v.trim().length >= length,
    message: msg || `至少需要 ${length} 个字符`
  }),
  /** 最大长度 */
  maxLength: (length, msg) => ({
    name: 'maxLength',
    validator: (v) => !v || v.trim().length <= length,
    message: msg || `最多 ${length} 个字符`
  })
}

/**
 * 表单验证 Hook
 * @param {UseFormValidatorOptions} [options]
 * @returns {UseFormValidatorReturn}
 * @example
 * const emailValidator = useFormValidator({
 *   rules: [ValidationRules.required(), ValidationRules.email()]
 * })
 */
export function useFormValidator(options = {}) {
  const { rules = [], immediate = false } = options
  
  const value = ref('')
  const error = ref('')
  const isTouched = ref(false)
  
  const isValid = computed(() => !error.value && (!immediate || isTouched.value))

  /**
   * 执行验证
   * @returns {boolean}
   */
  function validate() {
    isTouched.value = true
    
    for (const rule of rules) {
      if (!rule.validator(value.value)) {
        error.value = rule.message
        return false
      }
    }
    
    error.value = ''
    return true
  }

  /**
   * 清除验证状态
   */
  function clear() {
    value.value = ''
    error.value = ''
    isTouched.value = false
  }

  /**
   * 设置值
   * @param {string} val
   */
  function setValue(val) {
    value.value = val
    if (isTouched.value && immediate) {
      validate()
    }
  }

  return {
    value,
    error,
    isValid,
    isTouched,
    validate,
    clear,
    setValue
  }
}
