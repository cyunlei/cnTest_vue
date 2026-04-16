<script setup>
const props = defineProps({
  cases: {
    type: Array,
    required: true,
    default: () => []
  }
})

function handleCaseNameClick(row) {
  window.open(`/case-config/${row.id}`, '_blank')
}
</script>

<template>
  <div class="case-table-section">
    <div class="case-table-header">
      <el-button size="small">前置用例</el-button>
    </div>
    <el-table :data="props.cases" style="width: 100%">
      <el-table-column type="index" label="顺序" width="70" align="center" />
      <el-table-column prop="id" label="用例编号" min-width="100" />
      <el-table-column prop="name" label="用例名称" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">
          <a class="link-name" @click="handleCaseNameClick(row)">{{ row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="用例类型" min-width="100" />
      <el-table-column prop="set" label="所属用例集" min-width="220" show-overflow-tooltip />
      <el-table-column prop="owner" label="创建人" min-width="130" />
      <el-table-column prop="status" label="状态" min-width="90" />
      <el-table-column label="操作" min-width="90" fixed="right">
        <template #default>
          <span class="action-link">暂停</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.case-table-section {
  padding: 0 16px 16px;
}
.case-table-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.link-name {
  color: #1890ff;
  cursor: pointer;
}
.link-name:hover {
  text-decoration: underline;
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
