<script setup>
import { ref, reactive } from 'vue'
import { Delete, Plus, ArrowRight, QuestionFilled, Menu, Sort } from '@element-plus/icons-vue'

const activeTab = ref('variable')
const onlySelf = ref(false)
const envTree = reactive([
  {
    id: 'main',
    name: '主站',
    expanded: true,
    children: []
  },
  {
    id: 'thai',
    name: '泰国站',
    expanded: false,
    children: []
  },
  {
    id: 'test',
    name: '测试站',
    expanded: false,
    children: []
  }
])

const tabs = [
  { id: 'env', name: '环境配置' },
  { id: 'self', name: '只看自己' },
  { id: 'variable', name: '变量模板' },
  { id: 'jsf', name: 'JSF配置' },
  { id: 'http', name: 'HTTP配置' },
  { id: 'jimdb', name: 'JimDB设置' },
  { id: 'jmq', name: 'JMQ设置' },
  { id: 'project', name: '工程文件' }
]

const selectedTemplate = ref('')
const templateOptions = [
  { label: '请选择变量模板', value: '' }
]

const variableTableData = ref([])

function toggleEnv(node) {
  node.expanded = !node.expanded
}

function addVariableRow() {
  variableTableData.value.push({
    id: Date.now(),
    type: '',
    name: '',
    value: '',
    remark: ''
  })
}

function deleteSelectedTemplate() {
  selectedTemplate.value = ''
}

function saveVariableTemplate() {
  // mock save
}
</script>

<template>
  <div class="env-mgmt-view">
    <!-- 左侧环境树 -->
    <aside class="env-sidebar">
      <div class="env-sidebar-header">
        <span class="env-title">环境配置</span>
        <el-checkbox v-model="onlySelf" label="只看自己" size="small" />
        <el-icon class="menu-icon"><Menu /></el-icon>
        <el-icon class="sort-icon"><Sort /></el-icon>
      </div>
      <div class="env-tree">
        <div
          v-for="node in envTree"
          :key="node.id"
          class="env-node"
        >
          <div class="env-node-header" @click="toggleEnv(node)">
            <el-icon class="arrow-icon" :class="{ expanded: node.expanded }">
              <ArrowRight />
            </el-icon>
            <span class="node-name">{{ node.name }}</span>
            <el-icon v-if="node.id === 'main'" class="add-icon"><Plus /></el-icon>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧内容 -->
    <main class="env-main">
      <!-- Tabs -->
      <div class="env-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          :class="['env-tab-item', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </div>
      </div>

      <!-- 变量模板内容 -->
      <div v-if="activeTab === 'variable'" class="tab-content">
        <div class="section-title">变量选择</div>
        <div class="template-select-row">
          <el-select v-model="selectedTemplate" placeholder="请选择" style="width: 320px">
            <el-option
              v-for="opt in templateOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <el-button class="icon-btn" @click="deleteSelectedTemplate">
            <el-icon><Delete /></el-icon>
          </el-button>
          <el-button type="primary" plain>新增模板</el-button>
        </div>

        <div class="section-title sub">当前模板变量:</div>
        <el-table
          :data="variableTableData"
          style="width: 100%"
          empty-text="暂无数据"
          class="env-table"
        >
          <el-table-column prop="type" label="类型" min-width="120" />
          <el-table-column prop="name" label="变量名" min-width="180">
            <template #header>
              <span>变量名</span>
              <el-icon class="header-help"><QuestionFilled /></el-icon>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="值" min-width="200" />
          <el-table-column prop="remark" label="备注" min-width="200" align="right" header-align="right" />
        </el-table>

        <div class="add-row-btn">
          <el-button link>
            <el-icon><Plus /></el-icon>
            添加
          </el-button>
        </div>

        <div class="form-actions">
          <el-button type="primary" @click="saveVariableTemplate">保存</el-button>
        </div>
      </div>

      <!-- 其他 Tab 占位 -->
      <div v-else class="tab-content placeholder">
        <el-empty description="暂无数据" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.env-mgmt-view {
  display: flex;
  height: 100%;
  background: #fff;
}

.env-sidebar {
  width: 200px;
  border-right: 1px solid #e4e7ed;
  padding: 12px 0;
  flex-shrink: 0;
}

.env-sidebar-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px 10px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 8px;
  white-space: nowrap;
}

.env-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

:deep(.el-checkbox__label) {
  font-size: 12px;
  padding-left: 4px;
}

.menu-icon,
.sort-icon {
  font-size: 14px;
  color: #909399;
  cursor: pointer;
  flex-shrink: 0;
}

.menu-icon {
  margin-left: auto;
}

.env-tree {
  padding: 0 8px;
}

.env-node-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.env-node-header:hover {
  background: #f5f7fa;
}

.arrow-icon {
  font-size: 12px;
  color: #999;
  transition: transform 0.2s;
}

.arrow-icon.expanded {
  transform: rotate(90deg);
}

.node-name {
  flex: 1;
}

.add-icon {
  font-size: 14px;
  color: #999;
}

.env-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.env-tabs {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 16px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.env-tab-item {
  padding: 12px 4px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.env-tab-item:hover {
  color: #409eff;
}

.env-tab-item.active {
  color: #409eff;
  font-weight: 500;
}

.env-tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #409eff;
}

.tab-content {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
}

.section-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
}

.section-title.sub {
  margin-top: 20px;
}

.template-select-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  padding: 0 10px;
}

.header-help {
  font-size: 14px;
  color: #c0c4cc;
  margin-left: 4px;
  vertical-align: middle;
}

.add-row-btn {
  margin-top: 16px;
  padding: 8px 0;
  border-top: 1px solid #ebeef5;
}

.form-actions {
  margin-top: 20px;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
