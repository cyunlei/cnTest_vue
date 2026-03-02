<script setup>
/**
 * 最近活跃表格组件
 * 位置: domains/dashboard/components/
 */
import { ref } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'case' // 'case' | 'task'
  }
})

const emit = defineEmits(['execute', 'viewAll'])

// 模拟数据
const caseData = ref([
  { id: '6438249', name: '[liywei_test] jos授权工具接口返回r...', time: '-', result: '-', caseSet: '授权管理/取消授权', module: '商家开放' },
  { id: '6427960', name: '授权列表返回refreshToken字段', time: '-', result: '-', caseSet: '授权管理/取消授权', module: '商家开放' },
  { id: '6426940', name: 'jos授权工具接口返回refreshToken字段', time: '-', result: '-', caseSet: '授权管理/取消授权', module: '商家开放' },
  { id: '6416338', name: '查询是否为跨境商家', time: '-', result: '-', caseSet: '自研资质优化', module: '商家开放' },
  { id: '6416031', name: '查询不存在的api调频默认值', time: '-', result: '-', caseSet: '默认调频', module: '商家开放' },
  { id: '6416002', name: '查询存在的api调频默认值', time: '-', result: '-', caseSet: '默认调频', module: '商家开放' },
  { id: '6380362', name: '【秒送应用】同步授权报备', time: '2026-02-09 11:26:41', result: '不正确', caseSet: '授权/文档/YY后台', module: '商家开放' },
  { id: '6408300', name: 'ISV应用等级评估定时任务', time: '-', result: '-', caseSet: '自研资质优化', module: '商家开放' },
  { id: '6408284', name: '任务中心-查询任务列表-管理端', time: '-', result: '-', caseSet: '自研资质优化', module: '商家开放' },
  { id: '6408240', name: '【appkey维度】下发任务规则', time: '-', result: '-', caseSet: '自研资质优化', module: '商家开放' }
])

const taskData = ref([
  { id: 'TASK-001', name: '定时执行用例集-商家开放', time: '2026-02-09 10:00:00', result: '成功', caseSet: '授权管理', module: '商家开放' },
  { id: 'TASK-002', name: '接口监控任务-订单中心', time: '2026-02-09 09:30:00', result: '成功', caseSet: '订单接口', module: '订单中心' }
])

const tableData = props.type === 'case' ? caseData : taskData

function handleExecute(row) {
  emit('execute', row)
}

function handleViewAll() {
  emit('viewAll', props.type)
}
</script>

<template>
  <div class="recent-table">
    <div class="table-header">
      <h3 class="section-title">最近活跃</h3>
      <a href="javascript:;" class="view-all" @click="handleViewAll">
        全部用例
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
      </a>
    </div>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th class="col-id">用例编号</th>
            <th class="col-name">
              用例名称
              <svg class="sort-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </th>
            <th class="col-time">执行时间</th>
            <th class="col-result">执行结果</th>
            <th class="col-set">所属用例集</th>
            <th class="col-module">所属模块</th>
            <th class="col-action">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableData.value" :key="row.id">
            <td class="col-id">{{ row.id }}</td>
            <td class="col-name">
              <a href="javascript:;" class="link">{{ row.name }}</a>
            </td>
            <td class="col-time">{{ row.time }}</td>
            <td class="col-result">
              <span v-if="row.result === '不正确'" class="result-fail">{{ row.result }}</span>
              <span v-else-if="row.result === '成功'" class="result-success">{{ row.result }}</span>
              <span v-else class="result-none">{{ row.result || '-' }}</span>
            </td>
            <td class="col-set">
              <a href="javascript:;" class="link">{{ row.caseSet }}</a>
            </td>
            <td class="col-module">{{ row.module }}</td>
            <td class="col-action">
              <a href="javascript:;" class="execute-link" @click="handleExecute(row)">执行</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="table-pagination">
      <span class="total">第 1-10 条 / 总共 24 条</span>
      <div class="pagination">
        <button class="page-btn" disabled>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <button class="page-btn active">1</button>
        <button class="page-btn">2</button>
        <button class="page-btn">3</button>
        <button class="page-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>
      </div>
      <div class="page-size">
        <span>10 条/页</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.recent-table {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.view-all {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #1890ff;
  text-decoration: none;

  &:hover {
    opacity: 0.8;
  }
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th {
  padding: 12px 8px;
  text-align: left;
  font-weight: 500;
  color: #666;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  white-space: nowrap;
}

td {
  padding: 12px 8px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

tr:hover td {
  background: #f5f5f5;
}

.col-id {
  width: 80px;
  color: #666;
}

.col-name {
  min-width: 200px;
}

.col-time {
  width: 140px;
  color: #666;
}

.col-result {
  width: 100px;
}

.col-set {
  width: 140px;
}

.col-module {
  width: 100px;
}

.col-action {
  width: 80px;
  text-align: center;
}

.sort-icon {
  vertical-align: middle;
  margin-left: 4px;
  cursor: pointer;
  opacity: 0.5;

  &:hover {
    opacity: 1;
  }
}

.link {
  color: #1890ff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.result-success {
  color: #52c41a;
}

.result-fail {
  color: #f5222d;
}

.result-none {
  color: #999;
}

.execute-link {
  color: #1890ff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.total {
  font-size: 13px;
  color: #666;
}

.pagination {
  display: flex;
  gap: 4px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #1890ff;
    color: #1890ff;
  }

  &.active {
    border-color: #1890ff;
    background: #1890ff;
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.page-size {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}
</style>
