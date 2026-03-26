<script setup>
import { computed, ref, watch } from 'vue'
import AppPagination from '@/shared/ui/organisms/AppPagination.vue'
import DateRangeInput from '@/shared/ui/molecules/DateRangeInput.vue'

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

const emit = defineEmits(['update:visible', 'close'])

const localVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value)
})

const filterForm = ref({
  keyword: '',
  executeType: '',
  executor: '',
  startDate: '',
  endDate: ''
})
const autoRefresh = ref(false)
const recordPage = ref(1)
const recordPageSize = ref(20)
const recordTotal = ref(0)
const recordPageSizeOptions = [20, 50, 100]

function formatDate(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fillDefaultRecent7Days() {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - 6)
  filterForm.value.startDate = formatDate(start)
  filterForm.value.endDate = formatDate(today)
}

watch(
  () => props.visible,
  visible => {
    if (!visible) return
    fillDefaultRecent7Days()
  },
  { immediate: true }
)

function handleClose() {
  localVisible.value = false
  emit('close')
}

function handleReset() {
  filterForm.value.keyword = ''
  filterForm.value.executeType = ''
  filterForm.value.executor = ''
  fillDefaultRecent7Days()
}

function handleRecordPageChange(page) {
  recordPage.value = page
}

function handleRecordPageSizeChange(size) {
  recordPageSize.value = size
  recordPage.value = 1
}
</script>

<template>
  <teleport to="body">
    <div v-if="localVisible" class="drawer-mask" @click.self="handleClose">
      <div class="drawer-panel">
        <div class="drawer-head">
          <div class="drawer-title-wrap">
            <div class="drawer-title">步骤执行记录</div>
            <span class="v-divider" />
            <span class="header-item">用例ID: <mark>{{ step?.id || '-' }}</mark></span>
            <span class="header-item">名称: <a href="javascript:;" class="name-link">{{ step?.name || '-' }}</a></span>
            <span class="v-divider" />
            <label class="auto-open-tab">
              <input type="checkbox" />
              新标签页打开执行结果
            </label>
            <button class="header-mini-btn" type="button" disabled>关联行云需求</button>
          </div>
          <label class="auto-refresh">
            <input v-model="autoRefresh" type="checkbox" />
            自动刷新
          </label>
        </div>
        <div class="step-exec-drawer">
      <div class="step-exec-toolbar">
        <div class="toolbar-left">
          <div class="filter-item">
            <label>关键字:</label>
            <input v-model="filterForm.keyword" type="text" placeholder="支持编号/名称等关键字查询" />
          </div>
          <div class="filter-item filter-item--select">
            <label>执行类型:</label>
            <select v-model="filterForm.executeType" class="execute-type-select">
              <option value="">全部</option>
              <option value="manual">手动</option>
              <option value="auto">自动</option>
            </select>
          </div>
          <div class="filter-item">
            <label>执行人:</label>
            <input v-model="filterForm.executor" type="text" placeholder="请输入 ERP, 支持自动补全" />
          </div>
          <div class="filter-item filter-item--date">
            <label>日期:</label>
            <DateRangeInput
              :start-date="filterForm.startDate"
              :end-date="filterForm.endDate"
              @update:start-date="value => (filterForm.startDate = value)"
              @update:end-date="value => (filterForm.endDate = value)"
            />
          </div>
        </div>
        <div class="toolbar-right">
          <button class="btn btn--primary" type="button">查询</button>
          <button class="btn" type="button" @click="handleReset">重置</button>
        </div>
      </div>

      <div class="step-exec-table">
        <table>
          <thead>
            <tr>
              <th class="col-mini">+</th>
              <th class="col-mini"><input type="checkbox" /></th>
              <th>编号</th>
              <th>状态</th>
              <th>名称</th>
              <th>类型</th>
              <th>环境</th>
              <th>执行人</th>
              <th>来源</th>
              <th>耗时(秒)</th>
              <th>执行时间</th>
              <th>步骤结果 <span class="hint-icon">?</span></th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="13" class="empty-cell">暂无执行记录</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="step-exec-pagination">
        <AppPagination
          :current-page="recordPage"
          :page-size="recordPageSize"
          :total="recordTotal"
          :page-size-options="recordPageSizeOptions"
          @page-change="handleRecordPageChange"
          @page-size-change="handleRecordPageSizeChange"
        />
      </div>

        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.drawer-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 2100;
}

.drawer-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 90%;
  height: 100%;
  background: #fff;
  box-shadow: rgba(0, 0, 0, 0.08) -6px 0 16px -8px, rgba(0, 0, 0, 0.05) -9px 0 28px 0, rgba(0, 0, 0, 0.03) -12px 0 48px 16px;
  display: flex;
  flex-direction: column;
}

.drawer-head {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 0 12px;
  border-bottom: 1px solid var(--ux-border-color-lighter, #ebeef5);
  font-size: 12px;
}

.drawer-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.drawer-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
}

.v-divider {
  width: 1px;
  height: 16px;
  background: var(--ux-border-color-lighter, #ebeef5);
}

.header-item {
  color: #606266;
  white-space: nowrap;
}

.step-exec-drawer {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--ux-text-color-primary, #303133);
  height: 100%;
  min-height: 0;
  padding: 8px 12px 10px;
  flex: 1;
  box-sizing: border-box;
  overflow: hidden;
}

.header-item mark {
  background: #fffbe6;
  color: inherit;
  padding: 0 4px;
}

.name-link {
  color: var(--deeptest-primary-color, #1890ff);
  text-decoration: none;
}

.auto-open-tab,
.auto-refresh {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--ux-text-color-secondary, #909399);
  white-space: nowrap;
}

.header-mini-btn {
  height: 24px;
  border: 1px solid var(--ux-border-color, #dcdfe6);
  background: #f5f7fa;
  border-radius: 2px;
  padding: 0 8px;
  color: #b1b3b8;
  font-size: 12px;
}

.step-exec-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 4px 2px 6px;
  border-bottom: 1px solid var(--ux-border-color-lighter, #ebeef5);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  white-space: nowrap;
}

.filter-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  white-space: nowrap;
}

.filter-item input,
.filter-item select {
  height: 28px;
  border: 1px solid var(--ux-border-color, #dcdfe6);
  border-radius: var(--radius--small, 4px);
  padding: 0 8px;
  font-size: 12px;
  outline: none;
  box-shadow: none;
}

.filter-item input:focus,
.filter-item select:focus {
  border-color: #1677ff;
  outline: none;
  box-shadow: none;
}

.filter-item:first-child input { width: 220px; }
.filter-item:nth-child(2) select { width: 88px; }
.filter-item:nth-child(3) input { width: 170px; }

.filter-item--select {
  gap: 6px;
}

/* 执行类型：原生下拉（还原） */
.filter-item--select .execute-type-select {
  border: 1px solid var(--ux-border-color, #dcdfe6);
  border-radius: 4px;
  padding: 0 8px;
  height: 28px;
  width: 88px;
  background-color: #fff;
  outline: none;
  box-shadow: none;
}

.filter-item--select .execute-type-select:focus {
  border-color: #1677ff;
}

.filter-item--date :deep(.el-date-editor) { width: 260px; }
.filter-item--date :deep(.el-input__wrapper) { height: 28px; }

.btn {
  height: 28px;
  border: 1px solid var(--ux-border-color, #dcdfe6);
  background: #fff;
  border-radius: var(--ux-border-radius-base, 4px);
  padding: 0 12px;
  font-size: 12px;
  cursor: pointer;
  line-height: 1;
}

.btn--primary {
  border-color: var(--color--primary, #2695F1);
  background: var(--color--primary, #2695F1);
  color: #fff;
}

.step-exec-table {
  border: 1px solid var(--ux-border-color-lighter, #ebeef5);
  border-radius: 0;
  overflow: auto;
  flex: 1;
  min-height: 0;
  margin-top: 2px;
}

.step-exec-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.step-exec-table th,
.step-exec-table td {
  height: 36px;
  padding: 0 8px;
  border-bottom: 1px solid var(--ux-border-color-lighter, #ebeef5);
  text-align: left;
  white-space: nowrap;
}

.step-exec-table th {
  background: var(--color--base--table-header, #f7f8f9);
  font-weight: 400;
  color: #606265;
  font-size: 12px;
}

.col-mini {
  width: 34px;
  text-align: center !important;
  padding: 0 !important;
}

.hint-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-left: 4px;
  border: 1px solid #91a3b5;
  border-radius: 50%;
  color: #91a3b5;
  font-size: 10px;
}

.empty-cell {
  text-align: center;
  color: var(--ux-text-color-secondary, #909399);
  height: 44px;
}

.step-exec-pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 6px;
}

</style>

