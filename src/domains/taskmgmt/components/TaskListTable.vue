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

const emit = defineEmits(['selection-change'])

function handleNameClick(row) {
  router.push(`/task-mgmt/detail/${row.id}`)
}
</script>

<template>
  <el-table
    :data="props.data"
    v-loading="props.loading"
    style="width: 100%"
    @selection-change="emit('selection-change', $event)"
  >
    <el-table-column type="selection" width="48" align="center" />
    <el-table-column prop="id" label="编号" min-width="80" show-overflow-tooltip />
    <el-table-column prop="name" label="任务名称" min-width="260" show-overflow-tooltip>
      <template #default="{ row }">
        <a class="link-name" @click="handleNameClick(row)">{{ row.name }}</a>
      </template>
    </el-table-column>
    <el-table-column prop="creator" label="创建人" min-width="120" show-overflow-tooltip />
    <el-table-column prop="updateTime" label="更新时间" min-width="150" show-overflow-tooltip />
    <el-table-column prop="execType" label="执行方式" min-width="100" />
    <el-table-column label="执行次数" min-width="100">
      <template #default="{ row }">
        <span class="exec-count">
          <span class="success">{{ row.execSuccess }}</span>
          <span class="divider">/</span>
          <span class="fail">{{ row.execFail }}</span>
        </span>
      </template>
    </el-table-column>
    <el-table-column label="操作" min-width="220" fixed="right">
      <template #default>
        <div class="action-btns">
          <span class="action-link">编辑</span>
          <span class="action-link">执行</span>
          <el-dropdown size="small">
            <span class="action-link">
              设置<el-icon class="action-icon"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>基本设置</el-dropdown-item>
                <el-dropdown-item>执行策略</el-dropdown-item>
                <el-dropdown-item>通知配置</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span class="action-link">执行记录</span>
          <el-dropdown size="small">
            <span class="action-link">
              更多<el-icon class="action-icon"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>复制</el-dropdown-item>
                <el-dropdown-item>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
.exec-count .success {
  color: #52c41a;
}
.exec-count .divider {
  color: #999;
  margin: 0 2px;
}
.exec-count .fail {
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
  display: inline-flex;
  align-items: center;
}
.action-link:hover {
  opacity: 0.85;
}
.action-icon {
  margin-left: 2px;
  font-size: 12px;
}
</style>
