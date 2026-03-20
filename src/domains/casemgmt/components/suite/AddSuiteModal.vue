<script setup>
import { ref, watch } from 'vue'
import { fetchSuiteList } from '../../api'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  projectId: {
    type: Number,
    default: null
  },
  mode: {
    type: String,
    default: 'create' // 'create' | 'edit'
  },
  suite: {
    type: Object,
    default: null
  },
  defaultParentId: {
    type: Number,
    default: null
  },
  defaultParentSuite: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const form = ref({
  name: '',
  parentId: null,
  remark: '',
  tags: '',
  group: ''
})

const parentOptions = ref([])

async function loadParentOptions() {
  if (!props.projectId) return
  try {
    const resp = await fetchSuiteList({ project_id: props.projectId })
    const list = resp?.data?.data?.items || []
    parentOptions.value = list.map(item => ({
      label: item.name,
      value: item.id
    }))
    // 确保当前所在用例集出现在下拉列表中
    if (
      props.defaultParentSuite &&
      !parentOptions.value.some(opt => opt.value === props.defaultParentSuite.id)
    ) {
      parentOptions.value.unshift({
        label: props.defaultParentSuite.name,
        value: props.defaultParentSuite.id
      })
    }
    // 加载完成后，如果是新增模式且存在默认父用例集，则强制选中
    if (props.mode === 'create' && props.defaultParentId != null) {
      form.value.parentId = props.defaultParentId
    }
  } catch (error) {
    void error
  }
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      void loadParentOptions()
      // 回填编辑数据
      if (props.mode === 'edit' && props.suite) {
        form.value = {
          name: props.suite.name || '',
          parentId: props.suite.parent_id ?? null,
          remark: props.suite.remark || '',
          tags: props.suite.tags || '',
          group: props.suite.group || ''
        }
      } else {
        form.value = {
          name: '',
          parentId: props.defaultParentId ?? null,
          remark: '',
          tags: '',
          group: ''
        }
      }
    }
  }
)

function handleClose() {
  emit('close')
}

function handleCancel() {
  handleClose()
}

function handleSave() {
  const payload = {
    name: form.value.name,
    parent_id: form.value.parentId,
    env_code: 0,
    remark: form.value.remark,
    tags: form.value.tags || '',
    project_id: props.projectId,
    group: form.value.group || ''
  }
  if (props.mode === 'edit' && props.suite?.id) {
    payload.suite_id = props.suite.id
  }
  emit('saved', payload)
}
</script>

<template>
  <div v-show="props.visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">{{ props.mode === 'edit' ? '编辑用例集' : '新增用例集' }}</h3>
        <button class="modal-close" @click="handleClose">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path
              d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <form class="case-form">
          <div class="form-item required">
            <label class="form-label">
              <span class="required-star">*</span>
              用例集名称:
            </label>
            <input v-model="form.name" type="text" class="form-input" placeholder="请输入用例集名称" />
          </div>
          <div class="form-item required">
            <label class="form-label">
              <span class="required-star">*</span>
              所属用例集:
            </label>
            <select v-model="form.parentId" class="form-select">
              <option :value="null">无归属</option>
              <option
                v-for="opt in parentOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label">备注:</label>
            <textarea v-model="form.remark" class="form-textarea" placeholder="请输入备注" rows="3"></textarea>
          </div>
          <div class="form-item">
            <label class="form-label">标签:</label>
            <div class="tag-section">
              <input
                v-model="form.tags"
                type="text"
                class="form-input"
                placeholder="请选择"
              />
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">关联应用:</label>
            <select class="form-select">
              <option value="">请选择</option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label">逻辑分组:</label>
            <input v-model="form.group" type="text" class="form-input" />
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="handleCancel">取消</button>
        <button class="btn-save" @click="handleSave">保存</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  width: 616px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
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
  padding: 24px;
}

.case-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.form-label {
  width: 100px;
  font-size: 14px;
  color: #666;
  padding-top: 8px;
  flex-shrink: 0;
}

.form-label .required-star {
  color: #f5222d;
  margin-right: 4px;
}

.form-input,
.form-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  height: 36px;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: #999;
}

.form-textarea {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  resize: vertical;
  outline: none;
}

.form-textarea:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.tag-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-footer {
  padding: 12px 24px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #e8e8e8;
}

.btn-cancel,
.btn-save {
  min-width: 80px;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.btn-cancel {
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #333;
}

.btn-save {
  border: none;
  background: #1890ff;
  color: #fff;
}
</style>

