<script setup>
/**
 * 用例管理页面
 * 位置: domains/casemgmt/views/
 */
import { ref } from 'vue'
import AppHeader from '@/shared/ui/organisms/AppHeader.vue'

const activeTab = ref('scenario')
const selectedModule = ref('商家开放')
const searchKeyword = ref('')
const onlyMine = ref(false)

const modules = ['商家开放', '服务市场', 'POP订单', '开放平台']

const treeData = [
  {
    name: '服务市场',
    count: '(182/187)',
    children: [
      { name: '【POP订单】-BF', count: '(2689/4269)' },
      { name: 'POP订单中台', count: '(2946/3716)', children: [
        { name: 'open-rest-api', count: '(115/123)' },
        { name: '回归', count: '(65/076)' }
      ]}
    ]
  }
]

const caseData = ref([
  { id: '5212175', name: '发布页面监控执行任务', type: '冒烟用例', caseSet: 'product-jos-...', app: 'omni-product-b', steps: 3, tasks: 2, execCount: 54150, result: '正确', creator: 'chenhaod...', createTime: '2024-09-27', updateTime: '2026-03-02', priority: 'P0' },
  { id: '5212296', name: '列表页面执行相关业务', type: '冒烟用例', caseSet: 'product-jos-...', app: 'omni-product-b', steps: 12, tasks: 3, execCount: 54094, result: '正确', creator: 'chenhaod...', createTime: '2024-09-27', updateTime: '2026-03-02', priority: 'P0' },
  { id: '6337469', name: '【已通1】绑定api权...', type: '回归用例', caseSet: 'JosAuthPack...', app: 'joswatchman', steps: 2, tasks: 0, execCount: 0, result: '-', creator: 'ext.lijinlan...', createTime: '2026-01-12', updateTime: '2026-03-02', priority: 'P2' },
  { id: '5576269', name: 'center端查询接口', type: '功能用例', caseSet: 'product-jos-...', app: 'float-layer-cent', steps: 12, tasks: 0, execCount: 62764, result: '正确', creator: 'licuixia1', createTime: '2024-12-17', updateTime: '2026-03-02', priority: 'P1' },
  { id: '4844737', name: '自营发品链路监控', type: '功能用例', caseSet: 'product-jos-...', app: 'itemvcpserv', steps: 6, tasks: 1, execCount: 44655, result: '正确', creator: 'licuixia1', createTime: '2024-12-25', updateTime: '2026-03-02', priority: 'P4' }
])

const expandedKeys = ref([])

function toggleExpand(node) {
  const index = expandedKeys.value.indexOf(node.name)
  if (index > -1) {
    expandedKeys.value.splice(index, 1)
  } else {
    expandedKeys.value.push(node.name)
  }
}

function isExpanded(node) {
  return expandedKeys.value.includes(node.name)
}

function handleNav(path) {
  console.log('Navigate to:', path)
}
</script>

<template>
  <div class="casemgmt-page">
    <AppHeader @navigate="handleNav" />
    
    <div class="page-container">
      <!-- 左侧树 -->
      <aside class="sidebar">
        <div class="module-select">
          <select v-model="selectedModule">
            <option v-for="m in modules" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <div class="filter-bar">
          <label class="checkbox-label">
            <input v-model="onlyMine" type="checkbox" />
            <span>只看自己</span>
          </label>
        </div>
        <div class="search-box">
          <input v-model="searchKeyword" type="text" placeholder="请输入搜索关键字..." />
          <button class="search-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </div>
        <!-- 树形菜单 -->
        <div class="tree-menu">
          <div v-for="node in treeData" :key="node.name" class="tree-node">
            <div class="tree-item" @click="toggleExpand(node)">
              <svg v-if="node.children" class="tree-arrow" :class="{ expanded: isExpanded(node) }" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
              <span class="tree-icon">📁</span>
              <span class="tree-label">{{ node.name }}</span>
              <span class="tree-count">{{ node.count }}</span>
            </div>
            <div v-if="node.children && isExpanded(node)" class="tree-children">
              <div v-for="child in node.children" :key="child.name" class="tree-node">
                <div class="tree-item child" @click="toggleExpand(child)">
                  <svg v-if="child.children" class="tree-arrow" :class="{ expanded: isExpanded(child) }" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                  <span class="tree-icon">📄</span>
                  <span class="tree-label">{{ child.name }}</span>
                  <span class="tree-count">{{ child.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 主内容 -->
      <main class="main-content">
        <h3 class="page-title">用例列表</h3>
        
        <!-- Tabs -->
        <div class="content-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'scenario' }]"
            @click="activeTab = 'scenario'"
          >
            场景用例
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'atomic' }]"
            @click="activeTab = 'atomic'"
          >
            原子用例
          </button>
        </div>

        <!-- 搜索栏 -->
        <div class="search-filter">
          <div class="filter-item">
            <label>关键字:</label>
            <input type="text" placeholder="输入名称/编号查询" />
          </div>
          <div class="filter-item">
            <label>创建人:</label>
            <input type="text" placeholder="输入erp" />
          </div>
          <div class="filter-item">
            <label>接口:</label>
            <input type="text" placeholder="输入接口地址/topic" />
          </div>
          <button class="filter-btn">高级筛选</button>
          <button class="query-btn">查询</button>
          <button class="reset-btn">重置</button>
        </div>

        <!-- 操作栏 -->
        <div class="toolbar">
          <button class="tool-btn primary">+ 新增</button>
          <button class="tool-btn">设置</button>
          <button class="tool-btn">同步用例</button>
          <button class="tool-btn">批量执行</button>
          <button class="tool-btn">执行结果</button>
          <button class="tool-btn">批量操作</button>
          <button class="tool-btn">自定义表头</button>
        </div>

        <!-- 表格 -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="col-checkbox"><input type="checkbox" /></th>
                <th class="col-id">用例编号</th>
                <th class="col-name">用例名称</th>
                <th class="col-type">类型</th>
                <th class="col-set">所属用例集</th>
                <th class="col-app">关联应用</th>
                <th class="col-tag">标签</th>
                <th class="col-steps">步骤数</th>
                <th class="col-tasks">任务数</th>
                <th class="col-exec">执行次数</th>
                <th class="col-result">结果</th>
                <th class="col-creator">创建人</th>
                <th class="col-time">创建时间</th>
                <th class="col-update">更新时间</th>
                <th class="col-priority">优先级</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in caseData" :key="row.id">
                <td class="col-checkbox"><input type="checkbox" /></td>
                <td class="col-id">{{ row.id }}</td>
                <td class="col-name">
                  <a href="javascript:;" class="link">{{ row.name }}</a>
                </td>
                <td class="col-type">{{ row.type }}</td>
                <td class="col-set">{{ row.caseSet }}</td>
                <td class="col-app">{{ row.app }}</td>
                <td class="col-tag">{{ row.tag || 'NA' }}</td>
                <td class="col-steps">{{ row.steps }}</td>
                <td class="col-tasks">{{ row.tasks }}</td>
                <td class="col-exec">{{ row.execCount }}</td>
                <td class="col-result">
                  <span :class="['result-tag', row.result === '正确' ? 'success' : row.result === '-' ? 'none' : 'fail']">
                    {{ row.result }}
                  </span>
                </td>
                <td class="col-creator">{{ row.creator }}</td>
                <td class="col-time">{{ row.createTime }}</td>
                <td class="col-update">{{ row.updateTime }}</td>
                <td class="col-priority">{{ row.priority }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <span>第 1-50 条 / 总共 8459 条</span>
          <div class="page-btns">
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">3</button>
            <button class="page-btn">4</button>
            <button class="page-btn">5</button>
            <span>...</span>
            <button class="page-btn">170</button>
          </div>
          <select class="page-size">
            <option>50 条/页</option>
          </select>
        </div>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.casemgmt-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-container {
  display: flex;
  height: calc(100vh - 56px);
}

/* 左侧边栏 */
.sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 16px;
  overflow-y: auto;
}

.module-select {
  margin-bottom: 12px;

  select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 13px;
  }
}

.filter-bar {
  margin-bottom: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.search-box {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;

  input {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 13px;
  }

  .search-btn {
    padding: 6px 10px;
    border: 1px solid #d9d9d9;
    background: #fff;
    border-radius: 4px;
    cursor: pointer;
  }
}

/* 树形菜单 */
.tree-menu {
  .tree-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    cursor: pointer;
    font-size: 13px;
    border-radius: 4px;

    &:hover {
      background: #f5f5f5;
    }

    &.child {
      padding-left: 24px;
    }
  }

  .tree-arrow {
    color: #999;
    transition: transform 0.2s;

    &.expanded {
      transform: rotate(90deg);
    }
  }

  .tree-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tree-count {
    font-size: 12px;
    color: #999;
  }
}

/* 主内容 */
.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.content-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    color: #1890ff;
  }

  &.active {
    color: #1890ff;
    font-weight: 500;
    background: #e6f7ff;
  }
}

/* 搜索筛选 */
.search-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 13px;
    color: #666;
    white-space: nowrap;
  }

  input {
    padding: 6px 10px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 13px;
    width: 160px;
  }
}

.filter-btn, .reset-btn {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.query-btn {
  padding: 6px 20px;
  border: none;
  background: #1890ff;
  color: #fff;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

/* 工具栏 */
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tool-btn {
  padding: 6px 14px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }

  &.primary {
    background: #1890ff;
    color: #fff;
    border-color: #1890ff;

    &:hover {
      background: #40a9ff;
    }
  }
}

/* 表格 */
.table-container {
  background: #fff;
  border-radius: 8px;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

th, td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background: #fafafa;
  font-weight: 500;
  color: #666;
  white-space: nowrap;
}

.link {
  color: #1890ff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.result-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;

  &.success {
    background: #f6ffed;
    color: #52c41a;
  }

  &.fail {
    background: #fff1f0;
    color: #f5222d;
  }

  &.none {
    color: #999;
  }
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
  font-size: 13px;
}

.page-btns {
  display: flex;
  gap: 4px;
}

.page-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;

  &.active {
    background: #1890ff;
    color: #fff;
    border-color: #1890ff;
  }
}

.page-size {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
}
</style>
