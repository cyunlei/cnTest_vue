<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowUp, ArrowDown, Plus, Delete } from '@element-plus/icons-vue'
import { useMessage } from '@/shared/ui'
import { createTask, fetchCaseOptionList } from '../api/index.js'

const router = useRouter()
const { showSuccess, showError } = useMessage()

const form = reactive({
  name: '',
  selectType: 'case',
  module: '',
  caseSet: '',
  keyword: '',
  jdosApp: '',
  trigger: 'manual',
  interval: 0,
  breakStrategy: 'ignore',
  parallel: 'serial',
  host: '',
  env: '',
  command: '',
  notify: 'no',
  stepRetry: 0,
  caseRetry: 0,
  timeout: ''
})

const availableCases = ref([])
const selectedCases = ref([])
const availableSelection = ref([])
const selectedSelection = ref([])
const loadingAvailable = ref(false)

async function loadAvailableCases() {
  loadingAvailable.value = true
  try {
    const resp = await fetchCaseOptionList({
      module: form.module,
      caseSet: form.caseSet,
      keyword: form.keyword,
      jdosApp: form.jdosApp
    })
    const list = resp?.data?.data?.list || []
    // 过滤掉已选的
    const selectedIds = new Set(selectedCases.value.map(c => c.id))
    availableCases.value = list.filter(c => !selectedIds.has(c.id))
  } finally {
    loadingAvailable.value = false
  }
}

function handleQueryCases() {
  loadAvailableCases()
}

function addToSelected() {
  const toAdd = availableCases.value.filter(c => availableSelection.value.includes(c.id))
  const newSelected = [...selectedCases.value, ...toAdd.map(c => ({ ...c, order: selectedCases.value.length + 1 }))]
  selectedCases.value = renumberOrders(newSelected)
  // 从可选中移除
  const addIds = new Set(toAdd.map(c => c.id))
  availableCases.value = availableCases.value.filter(c => !addIds.has(c.id))
  availableSelection.value = []
}

function batchRemoveSelected() {
  const removeIds = new Set(selectedSelection.value)
  const removed = selectedCases.value.filter(c => removeIds.has(c.id))
  selectedCases.value = renumberOrders(selectedCases.value.filter(c => !removeIds.has(c.id)))
  // 加回可选列表
  availableCases.value.push(...removed.map(({ order, ...rest }) => rest))
  selectedSelection.value = []
}

function removeSingleCase(id) {
  const idx = selectedCases.value.findIndex(c => c.id === id)
  if (idx === -1) return
  const removed = selectedCases.value[idx]
  selectedCases.value = renumberOrders(selectedCases.value.filter(c => c.id !== id))
  const { order, ...rest } = removed
  availableCases.value.push(rest)
}

function renumberOrders(list) {
  return list.map((c, idx) => ({ ...c, order: idx + 1 }))
}

function moveSelectedUp() {
  if (selectedSelection.value.length === 0) return
  const ids = selectedSelection.value
  const indices = ids.map(id => selectedCases.value.findIndex(c => c.id === id)).sort((a, b) => a - b)
  // 简单实现：如果最上面的已经在第一个，不能上移；否则整体交换
  if (indices[0] === 0) return
  const newList = [...selectedCases.value]
  for (const idx of indices) {
    const temp = newList[idx]
    newList[idx] = newList[idx - 1]
    newList[idx - 1] = temp
  }
  selectedCases.value = renumberOrders(newList)
}

function moveSelectedDown() {
  if (selectedSelection.value.length === 0) return
  const ids = selectedSelection.value
  const indices = ids.map(id => selectedCases.value.findIndex(c => c.id === id)).sort((a, b) => b - a)
  if (indices[0] === selectedCases.value.length - 1) return
  const newList = [...selectedCases.value]
  for (const idx of indices) {
    const temp = newList[idx]
    newList[idx] = newList[idx + 1]
    newList[idx + 1] = temp
  }
  selectedCases.value = renumberOrders(newList)
}

async function submit() {
  if (!form.name.trim()) {
    showError('请输入任务名称')
    return
  }
  try {
    await createTask({
      ...form,
      cases: selectedCases.value.map(c => c.id)
    })
    showSuccess('创建成功')
    router.push('/task-mgmt')
  } catch (error) {
    void error
    showError('创建失败')
  }
}

onMounted(() => {
  loadAvailableCases()
})

defineExpose({ submit })
</script>

<template>
  <div class="task-create-form">
    <el-collapse :model-value="['base', 'cases', 'strategy', 'notify', 'retry']">
      <!-- 基础信息 -->
      <el-collapse-item name="base">
        <template #title>
          <div class="collapse-title">基础信息</div>
        </template>
        <div class="form-body">
          <el-form-item label="任务名称：" class="inline-item">
            <el-input v-model="form.name" placeholder="请输入任务名称" clearable style="width: 480px" />
          </el-form-item>
        </div>
      </el-collapse-item>

      <!-- 用例明细 -->
      <el-collapse-item name="cases">
        <template #title>
          <div class="collapse-title">用例明细</div>
        </template>
        <div class="form-body">
          <div class="select-type-row">
            <span class="sub-label">选取方式</span>
            <el-radio-group v-model="form.selectType">
              <el-radio label="case">用例选取</el-radio>
              <el-radio label="step">步骤选取</el-radio>
            </el-radio-group>
          </div>

          <div class="filter-row">
            <el-form-item label="模块：" class="compact-item">
              <el-select v-model="form.module" placeholder="请选择模块" clearable style="width: 160px">
                <el-option label="商家开放" value="商家开放" />
                <el-option label="服务市场" value="服务市场" />
                <el-option label="POP订单" value="POP订单" />
                <el-option label="开放平台" value="开放平台" />
              </el-select>
            </el-form-item>
            <el-form-item label="用例集：" class="compact-item">
              <el-select v-model="form.caseSet" placeholder="请选择用例集" clearable style="width: 180px">
                <el-option label="【会员更新】Costco付费会员" value="costco" />
                <el-option label="门店&用户测试用例" value="store-user" />
              </el-select>
            </el-form-item>
            <el-form-item label="关键字：" class="compact-item">
              <el-input v-model="form.keyword" placeholder="支持关键字筛选用例" clearable style="width: 180px" />
            </el-form-item>
            <el-form-item label="JdosApp：" class="compact-item">
              <el-input v-model="form.jdosApp" placeholder="jdosApp筛选用例" clearable style="width: 160px" />
            </el-form-item>
            <el-button type="primary" @click="handleQueryCases">查询</el-button>
          </div>

          <div class="transfer-section">
            <div class="transfer-panel">
              <div class="panel-header">
                <span class="panel-title optional">可选列表</span>
              </div>
              <el-table
                :data="availableCases"
                v-loading="loadingAvailable"
                height="280"
                style="width: 100%"
                @selection-change="availableSelection = $event.map(r => r.id)"
              >
                <el-table-column type="selection" width="40" align="center" />
                <el-table-column prop="id" label="用例编号" min-width="90" />
                <el-table-column prop="name" label="用例名称" min-width="160" show-overflow-tooltip />
                <el-table-column prop="creator" label="创建人" min-width="110" />
              </el-table>
            </div>

            <div class="transfer-actions">
              <el-button type="primary" :icon="Plus" @click="addToSelected">添加至已选</el-button>
              <div class="arrow-btns">
                <el-button :icon="ArrowUp" @click="moveSelectedUp" />
                <el-button :icon="ArrowDown" @click="moveSelectedDown" />
              </div>
              <el-button :icon="Delete" @click="batchRemoveSelected">批量删除</el-button>
            </div>

            <div class="transfer-panel">
              <div class="panel-header">
                <span class="panel-title selected">已选用例列表</span>
              </div>
              <el-table
                :data="selectedCases"
                height="280"
                style="width: 100%"
                @selection-change="selectedSelection = $event.map(r => r.id)"
              >
                <el-table-column type="selection" width="40" align="center" />
                <el-table-column prop="id" label="用例编号" min-width="90" />
                <el-table-column prop="name" label="用例名称" min-width="140" show-overflow-tooltip />
                <el-table-column prop="order" label="顺序" min-width="70" align="center" />
                <el-table-column label="操作" min-width="80" align="center">
                  <template #default="{ row }">
                    <el-button link type="primary" size="small" @click="removeSingleCase(row.id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </el-collapse-item>

      <!-- 执行策略 -->
      <el-collapse-item name="strategy">
        <template #title>
          <div class="collapse-title">执行策略</div>
        </template>
        <div class="form-body">
          <div class="form-row">
            <el-form-item label="触发方式：" class="compact-item">
              <el-radio-group v-model="form.trigger">
                <el-radio label="manual">手动执行</el-radio>
                <el-radio label="scheduled">周期执行</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="执行间隔：" class="compact-item">
              <el-input-number v-model="form.interval" :min="0" controls-position="right" style="width: 120px" />
              <span class="unit">秒</span>
            </el-form-item>
            <el-form-item label="中断策略：" class="compact-item">
              <el-radio-group v-model="form.breakStrategy">
                <el-radio label="ignore">忽略错误继续执行</el-radio>
                <el-radio label="stop">遇到错误中断执行</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="串并行配置：" class="compact-item">
              <el-radio-group v-model="form.parallel">
                <el-radio label="serial">串行执行</el-radio>
                <el-radio label="parallel">并行执行</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="HOST配置：" class="compact-item">
              <el-input v-model="form.host" placeholder="请填写需要配置的host配置，多个host以;分隔" clearable style="width: 420px" />
            </el-form-item>
            <el-form-item label="环境配置：" class="compact-item">
              <el-input v-model="form.env" placeholder="请填写需要配置的POC环境" clearable style="width: 320px" />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="执行命令：" class="compact-item">
              <el-input v-model="form.command" placeholder="请填写执行命令" clearable style="width: 420px" />
            </el-form-item>
          </div>
        </div>
      </el-collapse-item>

      <!-- 通知配置 -->
      <el-collapse-item name="notify">
        <template #title>
          <div class="collapse-title">通知配置</div>
        </template>
        <div class="form-body">
          <el-form-item label="是否通知：" class="compact-item">
            <el-radio-group v-model="form.notify">
              <el-radio label="no">不通知</el-radio>
              <el-radio label="yes">通知</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
      </el-collapse-item>

      <!-- 重试策略 -->
      <el-collapse-item name="retry">
        <template #title>
          <div class="collapse-title">重试策略</div>
        </template>
        <div class="form-body">
          <div class="form-row">
            <el-form-item label="步骤失败重试次数：" class="compact-item">
              <el-input-number v-model="form.stepRetry" :min="0" controls-position="right" style="width: 120px" />
            </el-form-item>
            <el-form-item label="用例失败重试次数：" class="compact-item">
              <el-input-number v-model="form.caseRetry" :min="0" controls-position="right" style="width: 120px" />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="超时时间(毫秒)：" class="compact-item">
              <el-input-number v-model="form.timeout" :min="0" controls-position="right" style="width: 140px" />
            </el-form-item>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style scoped>
.task-create-form {
  background: #fff;
  border-radius: 4px;
  padding: 0 16px 24px;
}
.collapse-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.form-body {
  padding: 8px 0 16px;
}
.inline-item :deep(.el-form-item__label) {
  font-size: 13px;
  color: #666;
}
.compact-item {
  margin-bottom: 12px;
  margin-right: 16px;
}
.compact-item :deep(.el-form-item__label) {
  font-size: 13px;
  color: #666;
}
.select-type-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.sub-label {
  font-size: 13px;
  color: #666;
}
.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0 8px;
  margin-bottom: 12px;
}
.transfer-section {
  display: flex;
  align-items: center;
  gap: 12px;
}
.transfer-panel {
  flex: 1;
  min-width: 280px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}
.panel-title {
  font-size: 13px;
  font-weight: 500;
}
.panel-title.optional {
  color: #d48806;
}
.panel-title.selected {
  color: #d48806;
}
.transfer-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 120px;
}
.arrow-btns {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0 24px;
}
.unit {
  margin-left: 6px;
  font-size: 13px;
  color: #666;
}
</style>
