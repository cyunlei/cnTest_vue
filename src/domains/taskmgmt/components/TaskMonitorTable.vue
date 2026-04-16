<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

function handleCaseNameClick(row) {
  window.open(`/case-config/${row.id}`, '_blank')
}

function handleTaskNameClick(row) {
  router.push(`/task-mgmt/detail/${row.id}`)
}
</script>

<template>
  <el-table
    :data="props.data"
    v-loading="props.loading"
    style="width: 100%"
  >
    <el-table-column type="expand" width="32">
      <template #default>
        <div style="padding: 8px 24px; color: #888; font-size: 13px">
          暂无展开内容
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="id" label="Id" min-width="70" show-overflow-tooltip />
    <el-table-column prop="module" label="模块" min-width="130" show-overflow-tooltip />
    <el-table-column prop="step" label="步骤名称" min-width="140" show-overflow-tooltip />
    <el-table-column prop="caseName" label="用例名称" min-width="180" show-overflow-tooltip>
      <template #default="{ row }">
        <a class="link-name" @click="handleCaseNameClick(row)">{{ row.caseName }}</a>
      </template>
    </el-table-column>
    <el-table-column prop="taskName" label="任务名称" min-width="160" show-overflow-tooltip>
      <template #default="{ row }">
        <a class="link-name" @click="handleTaskNameClick(row)">{{ row.taskName }}</a>
      </template>
    </el-table-column>
    <el-table-column prop="execTime" label="执行时间" min-width="110" />
    <el-table-column prop="execCount" label="执行数" min-width="80" />
    <el-table-column prop="correct" label="正确率" min-width="80">
      <template #default="{ row }">
        <span class="correct-rate">{{ row.correct }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="owner" label="责任人" min-width="100" />
    <el-table-column prop="status" label="状态" min-width="90" />
    <el-table-column prop="reason" label="异常原因" min-width="100" show-overflow-tooltip />
    <el-table-column prop="updateTime" label="分析更新时间" min-width="120" />
    <el-table-column prop="remark" label="备注" min-width="100" show-overflow-tooltip />
    <el-table-column label="操作" min-width="140" fixed="right">
      <template #default>
        <div class="action-btns">
          <span class="action-link">分析标注</span>
          <span class="action-link">查看明细</span>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
.link-name {
  color: #1890ff;
  cursor: pointer;
}
.link-name:hover {
  text-decoration: underline;
}
.correct-rate {
  color: #ff4d4f;
}
.action-btns {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.action-link {
  color: #1890ff;
  font-size: 13px;
  cursor: pointer;
}
.action-link:hover {
  opacity: 0.85;
}
</style>
