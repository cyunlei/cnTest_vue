<script setup>
/**
 * 移动步骤弹窗
 * 支持选择模块 -> 用例集 -> 用例，将步骤移动至目标用例
 */
import { ref, watch } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { useMessage } from '@/shared/ui'
import { fetchSuiteList, fetchTestcaseList } from '../../api'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  step: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

const { showWarning } = useMessage()

const dialogVisible = ref(false)
const loading = ref(false)

// 选择的数据
const selectedModule = ref('')
const selectedSuite = ref('')
const selectedTestcase = ref('')

// 选项数据
const moduleOptions = ref([
  { label: '默认模块', value: 'default' },
  { label: '用户中心', value: 'user_center' },
  { label: '订单系统', value: 'order_system' },
  { label: '支付网关', value: 'payment_gateway' }
])
const suiteOptions = ref([])
const testcaseOptions = ref([])

// 加载用例集列表
async function loadSuiteOptions() {
  suiteOptions.value = []
  selectedSuite.value = ''
  testcaseOptions.value = []
  selectedTestcase.value = ''

  if (!selectedModule.value) return

  try {
    const resp = await fetchSuiteList({ page: 1, page_size: 1000 })
    const list = resp?.data?.data?.list || resp?.data?.data?.items || []
    // 模拟按模块过滤：若后端无模块字段，则全部返回；有则按模块过滤
    const filteredList = list.filter(item => {
      if (!item.module || item.module === '') return true
      return item.module === selectedModule.value
    })
    suiteOptions.value = filteredList.map(item => ({
      label: item.name,
      value: item.id
    }))
  } catch (error) {
    showWarning('加载用例集失败')
  }
}

// 加载用例列表
async function loadTestcaseOptions() {
  testcaseOptions.value = []
  selectedTestcase.value = ''

  if (!selectedSuite.value) return

  try {
    const resp = await fetchTestcaseList({
      suite_id: selectedSuite.value,
      page: 1,
      page_size: 1000
    })
    const list = resp?.data?.data?.list || resp?.data?.data?.items || []
    testcaseOptions.value = list.map(item => ({
      label: item.name,
      value: item.id
    }))
  } catch (error) {
    showWarning('加载用例失败')
  }
}

function resetForm() {
  selectedModule.value = ''
  selectedSuite.value = ''
  selectedTestcase.value = ''
  suiteOptions.value = []
  testcaseOptions.value = []
}

function handleClose() {
  dialogVisible.value = false
}

function handleConfirm() {
  if (!selectedTestcase.value) {
    showWarning('请选择目标用例')
    return
  }

  emit('confirm', Number(selectedTestcase.value))
  dialogVisible.value = false
}

// 监听 visible 变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    resetForm()
  }
})

// 监听 dialog 内部 visible 变化回传
watch(() => dialogVisible.value, (val) => {
  emit('update:visible', val)
})

// 监听模块变化
watch(() => selectedModule.value, () => {
  loadSuiteOptions()
})

// 监听用例集变化
watch(() => selectedSuite.value, () => {
  loadTestcaseOptions()
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="移动步骤"
    width="520px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <div class="move-step-dialog">
      <div class="form-row">
        <label class="form-label required">所属模块</label>
        <el-select
          v-model="selectedModule"
          placeholder="请选择所属模块"
          size="default"
          clearable
          class="form-control"
        >
          <el-option
            v-for="opt in moduleOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>

      <div class="form-row">
        <label class="form-label required">
          所属用例集
          <el-tooltip content="选择用例集后加载对应用例" placement="top">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </label>
        <el-select
          v-model="selectedSuite"
          placeholder="请选择所属用例集"
          size="default"
          clearable
          :disabled="!selectedModule"
          class="form-control"
        >
          <el-option
            v-for="opt in suiteOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>

      <div class="form-row">
        <label class="form-label required">所属用例</label>
        <el-select
          v-model="selectedTestcase"
          placeholder="请选择所属用例"
          size="default"
          clearable
          :disabled="!selectedSuite"
          class="form-control"
        >
          <el-option
            v-for="opt in testcaseOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :disabled="!selectedTestcase" @click="handleConfirm">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.move-step-dialog {
  padding: 8px 0;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-label {
  width: 100px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.form-label.required::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.help-icon {
  color: #909399;
  font-size: 14px;
  cursor: help;
}

.form-control {
  flex: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
