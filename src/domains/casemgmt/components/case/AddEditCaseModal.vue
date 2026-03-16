<template>
  <div v-show="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">{{ mode === 'edit' ? '编辑用例' : '新增用例' }}</h3>
        <button class="modal-close" @click="handleClose">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path
              d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <form class="ant-legacy-form ant-legacy-form-horizontal" style="margin-right: 96px;">
                  <!-- 用例名称 -->
                  <div class="ant-row ant-legacy-form-item">
                    <div class="ant-col ant-legacy-form-item-label ant-col-xs-24 ant-col-sm-6">
                      <label class="ant-legacy-form-item-required" title="用例名称">用例名称：</label>
                    </div>
                    <div class="ant-col ant-legacy-form-item-control-wrapper ant-col-xs-24 ant-col-sm-18">
                      <div class="ant-legacy-form-item-control">
                        <span class="ant-legacy-form-item-children">
                          <input
                            v-model="form.name"
                            placeholder="请输入用例名称"
                            class="ant-input"
                            type="text"
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 编排方式 -->
                  <div class="ant-row ant-legacy-form-item arrange-row">
                    <div class="ant-col ant-legacy-form-item-label ant-col-xs-24 ant-col-sm-6">
                      <label class="ant-legacy-form-item-required" title="编排方式">编排方式：</label>
                    </div>
                    <div class="ant-col ant-legacy-form-item-control-wrapper ant-col-xs-24 ant-col-sm-18">
                      <div class="ant-legacy-form-item-control has-success">
                        <span class="ant-legacy-form-item-children">
                          <div class="ant-radio-group ant-radio-group-outline ant-radio-group-middle">
                            <label class="ant-radio-wrapper" :class="{ 'ant-radio-wrapper-checked': form.editWay === 0 }">
                              <span class="ant-radio" :class="{ 'ant-radio-checked': form.editWay === 0 }">
                                <input
                                  type="radio"
                                  class="ant-radio-input"
                                  :value="0"
                                  v-model="form.editWay"
                                />
                                <span class="ant-radio-inner" />
                              </span>
                              <span>列表编排</span>
                            </label>
                            <label class="ant-radio-wrapper" :class="{ 'ant-radio-wrapper-checked': form.editWay === 1 }">
                              <span class="ant-radio" :class="{ 'ant-radio-checked': form.editWay === 1 }">
                                <input
                                  type="radio"
                                  class="ant-radio-input"
                                  :value="1"
                                  v-model="form.editWay"
                                />
                                <span class="ant-radio-inner" />
                              </span>
                              <span>图形编排</span>
                            </label>
                            <label class="ant-radio-wrapper" :class="{ 'ant-radio-wrapper-checked': form.editWay === 2 }">
                              <span class="ant-radio" :class="{ 'ant-radio-checked': form.editWay === 2 }">
                                <input
                                  type="radio"
                                  class="ant-radio-input"
                                  :value="2"
                                  v-model="form.editWay"
                                />
                                <span class="ant-radio-inner" />
                              </span>
                              <span>代码编排</span>
                            </label>
                          </div>
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 用例类型 -->
                  <div class="ant-row ant-legacy-form-item">
                    <div class="ant-col ant-legacy-form-item-label ant-col-xs-24 ant-col-sm-6">
                      <label class="ant-legacy-form-item-required" title="用例类型">用例类型：</label>
                    </div>
                    <div class="ant-col ant-legacy-form-item-control-wrapper ant-col-xs-24 ant-col-sm-18">
                      <div class="ant-legacy-form-item-control has-success">
                        <span class="ant-legacy-form-item-children">
                          <div
                            class="select-wrapper"
                            :class="{ 'select-wrapper--open': showCaseTypeDropdown }"
                            ref="caseTypeTriggerRef"
                            @click="toggleCaseTypeDropdown"
                          >
                            <div class="select-display">
                              <span v-if="caseTypeLabel" class="select-text">{{ caseTypeLabel }}</span>
                              <span v-else class="select-placeholder"></span>
                              <span class="select-arrow">▾</span>
                            </div>
                            <teleport to="body">
                              <div
                                v-if="showCaseTypeDropdown"
                                class="select-dropdown select-dropdown--case-type"
                                :style="caseTypeDropdownStyle"
                                @mouseleave="showCaseTypeDropdown = false"
                              >
                                <div
                                  v-for="opt in caseTypeOptions"
                                  :key="opt.value"
                                  class="select-option"
                                  @click.stop="selectCaseType(opt)"
                                >
                                  {{ opt.label }}
                                </div>
                              </div>
                            </teleport>
                          </div>
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 所属用例集 -->
                  <div class="ant-row ant-legacy-form-item">
                    <div class="ant-col ant-legacy-form-item-label ant-col-xs-24 ant-col-sm-6">
                      <label class="ant-legacy-form-item-required" title="">
                        <span>
                          所属用例集
                          <span
                            role="img"
                            aria-label="question-circle"
                            class="anticon anticon-question-circle"
                            style="margin-left: 4px; cursor: help; color: var(--deeptest-primary-color);"
                          >
                            <svg
                              viewBox="64 64 896 896"
                              focusable="false"
                              data-icon="question-circle"
                              width="1em"
                              height="1em"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"
                              />
                              <path
                                d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"
                              />
                            </svg>
                          </span>
                        </span>：
                      </label>
                    </div>
                    <div class="ant-col ant-legacy-form-item-control-wrapper ant-col-xs-24 ant-col-sm-18">
                      <div class="ant-legacy-form-item-control has-success">
                        <span class="ant-legacy-form-item-children">
                          <input
                            v-model="form.suiteName"
                            class="ant-input"
                            type="text"
                            readonly
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 优先级 -->
                  <div class="ant-row ant-legacy-form-item">
                    <div class="ant-col ant-legacy-form-item-label ant-col-xs-24 ant-col-sm-6">
                      <label class="ant-legacy-form-item-required" title="优先级">优先级：</label>
                    </div>
                    <div class="ant-col ant-legacy-form-item-control-wrapper ant-col-xs-24 ant-col-sm-18">
                      <div class="ant-legacy-form-item-control">
                        <span class="ant-legacy-form-item-children">
                          <div
                            class="select-wrapper"
                            :class="{ 'select-wrapper--open': showPriorityDropdown }"
                            ref="priorityTriggerRef"
                            @click="togglePriorityDropdown"
                          >
                            <div class="select-display">
                              <span v-if="priorityLabel" class="select-text">{{ priorityLabel }}</span>
                              <span v-else class="select-placeholder"></span>
                              <span class="select-arrow">▾</span>
                            </div>
                            <teleport to="body">
                              <div
                                v-if="showPriorityDropdown"
                                class="select-dropdown"
                                :style="priorityDropdownStyle"
                                @mouseleave="showPriorityDropdown = false"
                              >
                                <div
                                  v-for="opt in priorityOptions"
                                  :key="opt.value"
                                  class="select-option"
                                  @click.stop="selectPriority(opt)"
                                >
                                  {{ opt.label }}
                                </div>
                              </div>
                            </teleport>
                          </div>
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 前置条件 -->
                  <div class="ant-row ant-legacy-form-item">
                    <div class="ant-col ant-legacy-form-item-label ant-col-xs-24 ant-col-sm-6">
                      <label title="前置条件">前置条件：</label>
                    </div>
                    <div class="ant-col ant-legacy-form-item-control-wrapper ant-col-xs-24 ant-col-sm-18">
                      <div class="ant-legacy-form-item-control">
                        <span class="ant-legacy-form-item-children">
                          <textarea
                            v-model="form.precondition"
                            placeholder="前置条件"
                            class="ant-input"
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 用例描述 -->
                  <div class="ant-row ant-legacy-form-item">
                    <div class="ant-col ant-legacy-form-item-label ant-col-xs-24 ant-col-sm-6">
                      <label title="用例描述">用例描述：</label>
                    </div>
                    <div class="ant-col ant-legacy-form-item-control-wrapper ant-col-xs-24 ant-col-sm-18">
                      <div class="ant-legacy-form-item-control">
                        <span class="ant-legacy-form-item-children">
                          <textarea
                            v-model="form.note"
                            placeholder="描述信息"
                            class="ant-input"
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 标签 -->
                  <div class="ant-row ant-legacy-form-item">
                    <div class="ant-col ant-legacy-form-item-label ant-col-xs-24 ant-col-sm-6">
                      <label title="标签">标签：</label>
                    </div>
                    <div class="ant-col ant-legacy-form-item-control-wrapper ant-col-xs-24 ant-col-sm-18">
                      <div class="ant-legacy-form-item-control">
                        <span class="ant-legacy-form-item-children">
                          <div>
                            <div />
                          </div>
                          <span class="ant-tag site-tag-plus">
                            <span class="anticon anticon-plus">
                              <svg
                                viewBox="64 64 896 896"
                                focusable="false"
                                data-icon="plus"
                                width="1em"
                                height="1em"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z" />
                                <path d="M192 474h672q8 0 8 8v60q0 8-8 8H160q-8 0-8-8v-60q0-8 8-8z" />
                              </svg>
                            </span>
                            新增标签
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-cancel" @click="handleClose">取 消</button>
        <button type="button" class="btn-save" @click="handleSave('save')">保 存</button>
        <button type="button" class="btn-save-go" @click="handleSave('saveAndGo')">保存并前往</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, reactive, ref } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
  modelValue: { type: Object, default: null },
  // 默认所属用例集（从左侧树当前选中的用例集传入）
  defaultSuite: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'update:modelValue', 'close', 'save'])

const form = reactive({
  name: '',
  editWay: 0,
  caseType: '', // 0-6 用例类型
  suiteName: '',
  priority: '', // 0-5 优先级
  precondition: '',
  note: ''
})

const caseTypeOptions = [
  { value: '0', label: '功能用例' },
  { value: '1', label: '性能用例' },
  { value: '2', label: '接口用例' },
  { value: '3', label: '冒烟用例' },
  { value: '4', label: '回归用例' },
  { value: '5', label: '前置用例' },
  { value: '6', label: '后置用例' }
]

const priorityOptions = [
  { value: '0', label: 'P0' },
  { value: '1', label: 'P1' },
  { value: '2', label: 'P2' },
  { value: '3', label: 'P3' },
  { value: '4', label: 'P4' },
  { value: '5', label: 'P5' }
]

const showCaseTypeDropdown = ref(false)
const showPriorityDropdown = ref(false)

const caseTypeTriggerRef = ref(null)
const priorityTriggerRef = ref(null)
const caseTypeDropdownStyle = ref({})
const priorityDropdownStyle = ref({})

const caseTypeLabel = computed(() => {
  const opt = caseTypeOptions.find(o => o.value === form.caseType)
  return opt ? opt.label : ''
})

const priorityLabel = computed(() => {
  const opt = priorityOptions.find(o => o.value === form.priority)
  return opt ? opt.label : ''
})

const internalModel = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

watch(
  () => props.visible,
  val => {
    if (val && internalModel.value) {
      form.name = internalModel.value.name || ''
      form.editWay = internalModel.value.editWay ?? 0
      form.suiteName = internalModel.value.suiteName || ''
      form.caseType = internalModel.value.caseType ?? ''
      form.priority = internalModel.value.priority ?? ''
      form.precondition = internalModel.value.precondition || ''
      // 用例描述字段从后端的 description 映射到表单的 note
      form.note = internalModel.value.description || internalModel.value.note || ''
    } else if (val && !internalModel.value) {
      form.name = ''
      form.editWay = 0
      form.caseType = ''
      form.suiteName = props.defaultSuite?.name || ''
      form.priority = ''
      form.precondition = ''
      form.note = ''
    }
  },
  { immediate: true }
)

function handleClose() {
  emit('update:visible', false)
  emit('close')
}

function handleSave(action) {
  const payload = {
    name: form.name,
    editWay: form.editWay,
    caseType: form.caseType,
    priority: form.priority,
    suiteName: form.suiteName,
    precondition: form.precondition,
    note: form.note,
    action
  }
  emit('save', payload)
}

function toggleCaseTypeDropdown() {
  showCaseTypeDropdown.value = !showCaseTypeDropdown.value
  if (showCaseTypeDropdown.value && caseTypeTriggerRef.value) {
    const rect = caseTypeTriggerRef.value.getBoundingClientRect()
    caseTypeDropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 2}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`
    }
  }
}

function selectCaseType(option) {
  form.caseType = option.value
  showCaseTypeDropdown.value = false
}

function togglePriorityDropdown() {
  showPriorityDropdown.value = !showPriorityDropdown.value
  if (showPriorityDropdown.value && priorityTriggerRef.value) {
    const rect = priorityTriggerRef.value.getBoundingClientRect()
    priorityDropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 2}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`
    }
  }
}

function selectPriority(option) {
  form.priority = option.value
  showPriorityDropdown.value = false
}
</script>

<style scoped>
/* 限制 radio group 的高度，防止覆盖上一行 */
.ant-radio-group {
  height: 32px;
  line-height: 32px;
  overflow: hidden;
}

/* 或者给每行加 clear，确保不重叠 */
.ant-row {
  position: relative;
  min-height: 32px;
}

/* 确保 radio 按钮不会脱离文档流造成覆盖 */
.ant-radio-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
}

.modal-container {
  background-color: #fff;
  border-radius: 6px;
  width: 840px;
  height: 512px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #666;
}

.modal-body {
  flex: 1;
  padding: 16px 24px 0;
  overflow: hidden; /* 固定高度，不出现滚动条 */
}

.modal-footer {
  padding: 12px 24px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #e8e8e8;
}

.btn-cancel,
.btn-save,
.btn-save-go {
  min-width: 80px;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  height: 32px;
  box-sizing: border-box;
}

.btn-cancel {
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #333;
}

.btn-save {
  border: 1px solid #1890ff;
  background: #fff;
  color: #1890ff;
}

.btn-save-go {
  border: none;
  background: #1890ff;
  color: #fff;
}

.ant-legacy-form-item-label {
  text-align: right;
  padding-right: 8px;
}

.ant-legacy-form-item-required::before {
  display: inline-block;
  margin-right: 4px;
  color: #f5222d;
  content: '*';
}

.ant-input {
  width: 100%;
  height: var(--height--form-input, 32px);
  padding: 4px 11px;
  border-radius: 4px;
  border: 1px solid var(--ux-border-color, #dcdfe6);
  box-sizing: border-box;
  background-color: #fff;
  color: rgba(0, 0, 0, 0.85);
  pointer-events: auto;
}

/* 下拉选择框：圆角、无边框风格 */
select.ant-input.ant-input-select {
  border: none;
  border-radius: 16px;
  padding: 4px 16px;
  background-color: #fff;
  box-shadow: none;
  appearance: none;
}

select.ant-input.ant-input-select:focus {
  outline: none;
  box-shadow: none;
}

.ant-input:focus {
  outline: none;
  border-color: var(--color--primary, #1890ff);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 自绘圆角下拉（用例类型 / 优先级） */
.select-wrapper {
  position: relative;
  width: 100%;
}

.select-display {
  height: var(--height--form-input, 32px);
  padding: 4px 12px;
  border-radius: 4px;
  background-color: #fff;
  border: 1px solid var(--ux-border-color, #dcdfe6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.select-text {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

.select-placeholder {
  flex: 1;
  height: 16px;
}

.select-arrow {
  font-size: 10px;
  color: #999;
  margin-left: 8px;
}

.select-dropdown {
  position: fixed;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  z-index: 21000;
  max-height: 220px;
  overflow-y: auto;
}

.select-wrapper--open .select-display {
  border-color: var(--color--primary, #1890ff);
}

/* 用例类型下拉：不显示滚动条，固定完整展开 */
.select-dropdown--case-type {
  max-height: none;
  overflow-y: visible;
}

.select-option {
  padding: 4px 12px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  cursor: pointer;
}

.select-option:hover {
  background-color: #f5f5f5;
}

textarea.ant-input {
  min-height: 80px;
  resize: vertical;
}

.ant-radio-group-middle {
  display: inline-flex;
  align-items: center;
  gap: 24px;
}

.ant-radio-wrapper {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  line-height: 1;
}

.ant-radio {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
}

.ant-radio-inner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid var(--ux-border-color, #dcdfe6);
  box-sizing: border-box;
  background-color: #fff;
  position: relative;
}

.ant-radio-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.ant-radio-checked .ant-radio-inner {
  border-color: var(--color--primary, #1890ff);
}

.ant-radio-checked .ant-radio-inner::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color--primary, #1890ff);
  transform: translate(-50%, -50%);
}

.ant-select {
  width: 100%;
}

.ant-select-selector {
  display: flex;
  align-items: center;
  min-height: var(--height--form-input, 32px);
  padding: 0 11px;
  border-radius: 4px;
  border: 1px solid var(--ux-border-color, #dcdfe6);
  box-sizing: border-box;
  background-color: #fff;
}

.ant-select-selection-search-input {
  border: none;
  outline: none;
  width: 100%;
  background: transparent;
}

.ant-select-selection-placeholder {
  color: var(--color--base--placeholder, #c0c4cc);
}

.ant-select-selector:focus-within {
  border-color: var(--color--primary, #1890ff);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.ant-select-arrow {
  display: none;
}

.site-tag-plus {
  margin-top: 4px;
  padding: 0 8px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  border-radius: 4px;
  border: 1px dashed var(--ux-border-color, #dcdfe6);
  cursor: pointer;
}

/* 仿 Ant Form 布局，让标签和控件对齐示例图 */
.ant-row {
  display: flex;
  margin-bottom: 8px;
}

.ant-col {
  box-sizing: border-box;
}

.ant-col-xs-24 {
  flex: 0 0 100%;
  max-width: 100%;
}

.ant-col-sm-6 {
  flex: 0 0 25%;
  max-width: 25%;
}

.ant-col-sm-18 {
  flex: 0 0 75%;
  max-width: 75%;
}

.ant-legacy-form-item-control {
  width: 100%;
}

.ant-legacy-form-item-label > label {
  display: inline-block;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

/* 编排方式这一行单独控制高度和对齐，避免遮挡其他行 */
.arrange-row .ant-radio-group-middle {
  height: 32px;
  align-items: center;
}
</style>

