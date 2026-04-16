<script setup>
/**
 * 移动用例弹窗
 * 支持选择所属模块 -> 所属用例集 -> 所属用例（目标位置）
 */
import { ref, watch } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { useMessage } from '@/shared/ui'
import { fetchProjectList } from '@/domains/project/api'
import { fetchSuiteList, fetchTestcaseList } from '@/domains/casemgmt/api'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  testcase: {
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
const moduleOptions = ref([])
const suiteOptions = ref([])
const testcaseOptions = ref([])

// 加载模块列表
async function loadModuleOptions() {
  try {
    const resp = await fetchProjectList({
      project_id: '',
      page: 1,
      page_size: 1000
    })
    const list = resp?.data?.data?.list || resp?.data?.data?.items || []
    moduleOptions.value = list.map((item) => ({
      label: item.name,
      value: item.id
    }))
  } catch (error) {
    showWarning('加载模块失败')
  }
}

// 加载用例集列表
async function loadSuiteOptions() {
  suiteOptions.value = []
  selectedSuite.value = ''
  testcaseOptions.value = []
  selectedTestcase.value = ''

  if (!selectedModule.value) return

  try {
    const resp = await fetchSuiteList({
      project_id: selectedModule.value,
      page: 1,
      page_size: 1000
    })
    const list = resp?.data?.data?.list || resp?.data?.data?.items || []
    suiteOptions.value = list.map((item) => ({
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
    // 过滤掉当前用例本身
    const filteredList = props.testcase?.id
      ? list.filter((item) => String(item.id) !== String(props.testcase.id))
      : list
    testcaseOptions.value = filteredList.map((item) => ({
      label: item.name,
      value: item.id
    }))
  } catch (error) {
    showWarning('加载用例失败')
  }
}

// 监听弹窗打开
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
    if (val) {
      resetForm()
      loadModuleOptions()
    }
  }
)

watch(
  () => dialogVisible.value,
  (val) => {
    emit('update:visible', val)
  }
)

// 监听级联变化
watch(() => selectedModule.value, loadSuiteOptions)
watch(() => selectedSuite.value, loadTestcaseOptions)

function resetForm() {
  selectedModule.value = ''
  selectedSuite.value = ''
  selectedTestcase.value = ''
  moduleOptions.value = []
  suiteOptions.value = []
  testcaseOptions.value = []
}

function handleClose() {
  dialogVisible.value = false
}

function handleConfirm() {
  if (!selectedSuite.value) {
    showWarning('请选择所属用例集')
    return
  }

  emit('confirm', {
    module_id: selectedModule.value,
    suite_id: selectedSuite.value,
    testcase_id: selectedTestcase.value || undefined
  })

  dialogVisible.value = false
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="移动用例"
    width="520px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <div class="move-case-dialog">
      <div class="select-row">
        <div class="select-item">
          <label class="select-label required">所属模块</label>
          <el-select
            v-model="selectedModule"
            placeholder="请选择"
            size="default"
            clearable
            class="select-control"
          >
            <el-option
              v-for="opt in moduleOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
      </div>

      <div class="select-row">
        <div class="select-item">
          <label class="select-label required">
            所属用例集
            <el-tooltip content="选择目标用例集" placement="top">
              <el-icon class="help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </label>
          <el-select
            v-model="selectedSuite"
            placeholder="请选择"
            size="default"
            clearable
            :disabled="!selectedModule"
            class="select-control"
          >
            <el-option
              v-for="opt in suiteOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
      </div>

      <div class="select-row">
        <div class="select-item">
          <label class="select-label">所属用例</label>
          <el-select
            v-model="selectedTestcase"
            placeholder="请选择"
            size="default"
            clearable
            :disabled="!selectedSuite"
            class="select-control"
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
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.move-case-dialog {
  padding: 8px 0;
}

.select-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.select-item {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.select-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.select-label.required::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.help-icon {
  color: #909399;
  font-size: 14px;
  cursor: help;
}

.select-control {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
