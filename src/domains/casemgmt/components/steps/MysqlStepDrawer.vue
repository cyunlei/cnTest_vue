<script setup lang="ts">
import { ref, watch } from 'vue'
import { EditPen, Delete, CopyDocument, ArrowDown } from '@element-plus/icons-vue'

const props = defineProps<{
  collapseKey?: number
  collapsed?: boolean
}>()

// 先做纯展示组件，后续再接入 v-model 数据
const stepName = ref('操作步骤1')
const jdbcUrl = ref('')
const username = ref('')
const password = ref('')
const resultVar = ref('')
const sql = ref('')
const mode = ref<'direct' | 'file'>('direct')

// 折叠状态（默认展开）
const isCollapsed = ref(false)

watch(
  () => props.collapseKey,
  () => {
    if (props.collapsed !== undefined) {
      isCollapsed.value = props.collapsed
    }
  }
)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <div class="mysql-step">
    <!-- 标题行 -->
    <div class="mysql-step__header">
      <div class="left">
        <el-icon class="collapse-arrow" :class="{ 'is-collapsed': isCollapsed }" @click="toggleCollapse">
          <ArrowDown />
        </el-icon>
        <span class="index">1</span>
        <span class="type-tag">MYSQL</span>
        <el-input v-model="stepName" class="name-input" size="small" />
        <el-icon class="edit-icon">
          <EditPen />
        </el-icon>
      </div>
      <div class="right">
        <el-button text size="small">
          <el-icon><CopyDocument /></el-icon>
        </el-button>
        <el-button text size="small">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>

    <div v-show="!isCollapsed">
      <!-- 连接方式 -->
      <div class="mysql-step__row mode-row">
        <span class="label">连接方式：</span>
        <el-radio-group v-model="mode" size="small">
          <el-radio value="direct">直接写库</el-radio>
          <el-radio value="file">从开关文件获取</el-radio>
        </el-radio-group>
      </div>

      <!-- JDBC / 用户名 / 密码（横排） -->
      <div class="mysql-step__row">
        <el-form label-position="top" class="mysql-form jdbc-row">
          <el-row :gutter="12">
            <el-col :span="12">
              <el-form-item label="JDBC URL">
                <el-input
                  v-model="jdbcUrl"
                  placeholder="请输入JDBC URL，格式为jdbc:mysql://ip:3306/库名"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="用户名">
                <el-input v-model="username" placeholder="请输入用户名" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="密码">
                <el-input
                  v-model="password"
                  type="password"
                  show-password
                  placeholder="请输入密码"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 结果变量 -->
      <div class="mysql-step__row">
        <el-form label-width="80px" label-position="left" class="mysql-form">
          <el-form-item label="结果变量">
            <el-input v-model="resultVar" placeholder="请填写结果变量名" />
          </el-form-item>
        </el-form>
      </div>

      <!-- SQL -->
      <div class="mysql-step__row">
        <el-form label-width="80px" label-position="left" class="mysql-form">
          <el-form-item label="SQL">
            <el-input
              v-model="sql"
              type="textarea"
              :rows="4"
              placeholder="请输入 SQL 语句"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mysql-step {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px 16px 16px;
  background: #fff;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
}

.mysql-step__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.mysql-step__header .left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.index {
  font-weight: 500;
  color: #303133;
}

.type-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #ecf5ff;
  color: #409eff;
  border: 1px solid #b3d8ff;
}

.name-input {
  width: 160px;
}

.edit-icon {
  cursor: pointer;
  color: #909399;
}

.mysql-step__header .right :deep(.el-button) {
  padding: 4px;
}

.collapse-arrow {
  cursor: pointer;
  transition: transform 0.2s ease;
  margin-right: 4px;
}

.collapse-arrow.is-collapsed {
  transform: rotate(-90deg);
}

.mysql-step__row {
  margin-top: 8px;
}

.mode-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  color: #606266;
}

.mysql-form {
  width: 100%;
}

.mysql-form :deep(.el-form-item) {
  margin-bottom: 8px;
}

.jdbc-row :deep(.el-form-item) {
  margin-bottom: 0;
}
</style>

