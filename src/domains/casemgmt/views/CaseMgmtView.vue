<script setup>
/**
 * 用例管理页面
 * 位置: domains/casemgmt/views/
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/shared/ui/organisms/AppHeader.vue'

const router = useRouter()

const activeTab = ref('scenario')
const selectedModule = ref('商家开放')
const searchKeyword = ref('')
const onlyMine = ref(false)
const showModuleDropdown = ref(false)
const showActionMenu = ref(false)
const showAddStepSubmenu = ref(false)
const showNodeTypeSubmenu = ref(false)
const showAddCaseModal = ref(false)

// 工具栏弹窗/抽屉状态
const showSyncCaseModal = ref(false)
const showBatchExecModal = ref(false)
const showExecResultDrawer = ref(false)
const showBatchOperationDropdown = ref(false)
const showCustomHeaderModal = ref(false)

// 选中的用例
const selectedCases = ref([])

// 同步用例表单
const syncCaseForm = ref({
  platform: ''
})
const platformOptions = [
  { label: 'JOS平台', value: 'jos' },
  { label: '开放平台', value: 'open' },
  { label: '内部平台', value: 'internal' }
]

// 批量执行表单
const batchExecForm = ref({
  notifyType: 'email',
  emailNotify: '',
  notifyStrategy: 'all',
  execInterval: '',
  execOrder: 'parallel',
  breakStrategy: 'ignore',
  hostConfig: '',
  execEnv: 'test',
  featureEnv: '',
  execCommand: '',
  variable1: '',
  variable2: '',
  relatedDemand: '',
  testStage: ''
})

// 自定义表头配置
const defaultHeaders = [
  { key: 'id', label: '用例编号', checked: true, group: '基本信息' },
  { key: 'name', label: '用例名称', checked: true, group: '基本信息' },
  { key: 'type', label: '类型', checked: true, group: '基本信息' },
  { key: 'caseSet', label: '所属用例集', checked: true, group: '基本信息' },
  { key: 'app', label: '关联应用', checked: true, group: '基本信息' },
  { key: 'tag', label: '标签', checked: true, group: '基本信息' },
  { key: 'priority', label: '优先级', checked: true, group: '基本信息' },
  { key: 'steps', label: '步骤数', checked: true, group: '执行信息' },
  { key: 'tasks', label: '任务数', checked: true, group: '执行信息' },
  { key: 'execCount', label: '执行次数', checked: true, group: '执行信息' },
  { key: 'result', label: '结果', checked: true, group: '执行信息' },
  { key: 'creator', label: '创建人', checked: true, group: '更新信息' },
  { key: 'createTime', label: '创建时间', checked: true, group: '更新信息' },
  { key: 'updateTime', label: '更新时间', checked: true, group: '更新信息' }
]
const customHeaders = ref([...defaultHeaders])

// 新增用例表单数据
const addCaseForm = ref({
  name: '',
  arrangeMode: 'list', // list, graph, code
  type: '',
  caseSet: '',
  priority: '',
  preCondition: '',
  description: '',
  tags: []
})

// 用例类型选项
const caseTypeOptions = [
  { label: '冒烟用例', value: 'smoke' },
  { label: '功能用例', value: 'functional' },
  { label: '回归用例', value: 'regression' },
  { label: '性能用例', value: 'performance' }
]

// 优先级选项
const priorityOptions = [
  { label: 'P0', value: 'P0' },
  { label: 'P1', value: 'P1' },
  { label: 'P2', value: 'P2' },
  { label: 'P3', value: 'P3' },
  { label: 'P4', value: 'P4' }
]

// 用例集选项
const caseSetOptions = [
  { label: 'product-jos-...', value: 'product-jos' },
  { label: 'JosAuthPack...', value: 'jos-auth' },
  { label: 'open-rest-api', value: 'open-rest' },
  { label: '回归', value: 'regression' }
]

const modules = [
  { name: '海外pop项目', count: '' },
  { name: '京东全球售', count: '' },
  { name: 'ext.chenyunlei1的模块', count: '' },
  { name: '品类场景自动化', count: '' },
  { name: '商家开放', count: '' },
  { name: '侯海佳的默认空间', count: '' },
  { name: '用户测试组', count: '' },
  { name: '公共模块', count: '' }
]

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

function selectModule(module) {
  selectedModule.value = module.name
  showModuleDropdown.value = false
}

function toggleModuleDropdown() {
  showModuleDropdown.value = !showModuleDropdown.value
}

function openModuleDropdown() {
  showModuleDropdown.value = true
}

function closeModuleDropdown() {
  setTimeout(() => {
    showModuleDropdown.value = false
  }, 100)
}

function toggleActionMenu() {
  showActionMenu.value = !showActionMenu.value
}

function openActionMenu() {
  showActionMenu.value = true
}

function closeActionMenu() {
  // 延迟关闭，以便能够点击子菜单
  setTimeout(() => {
    if (!showAddStepSubmenu.value && !showNodeTypeSubmenu.value) {
      showActionMenu.value = false
    }
  }, 100)
}

function openAddStepSubmenu() {
  showAddStepSubmenu.value = true
}

function closeAddStepSubmenu() {
  setTimeout(() => {
    showAddStepSubmenu.value = false
  }, 100)
}

function openNodeTypeSubmenu() {
  showNodeTypeSubmenu.value = true
}

function closeNodeTypeSubmenu() {
  setTimeout(() => {
    showNodeTypeSubmenu.value = false
  }, 100)
}

function handleNav(path) {
  console.log('Navigate to:', path)
}

// 打开新增用例弹窗
function openAddCaseModal() {
  showAddCaseModal.value = true
  showActionMenu.value = false
}

// 关闭新增用例弹窗
function closeAddCaseModal() {
  showAddCaseModal.value = false
  resetAddCaseForm()
}

// 重置表单
function resetAddCaseForm() {
  addCaseForm.value = {
    name: '',
    arrangeMode: 'list',
    type: '',
    caseSet: '',
    priority: '',
    preCondition: '',
    description: '',
    tags: []
  }
}

// 保存用例
function saveCase() {
  console.log('保存用例:', addCaseForm.value)
  // TODO: 调用API保存用例
  closeAddCaseModal()
}

// 保存并前往
function saveAndGo() {
  console.log('保存并前往:', addCaseForm.value)
  // TODO: 调用API保存用例并跳转
  closeAddCaseModal()
}

// ========== 工具栏功能 ==========

// 打开同步用例弹窗
function openSyncCaseModal() {
  showSyncCaseModal.value = true
}

// 关闭同步用例弹窗
function closeSyncCaseModal() {
  showSyncCaseModal.value = false
  syncCaseForm.value = { platform: '' }
}

// 提交同步用例
function submitSyncCase() {
  console.log('同步用例:', syncCaseForm.value)
  closeSyncCaseModal()
}

// 打开批量执行弹窗
function openBatchExecModal() {
  showBatchExecModal.value = true
}

// 关闭批量执行弹窗
function closeBatchExecModal() {
  showBatchExecModal.value = false
}

// 确认执行
function confirmBatchExec() {
  console.log('批量执行:', batchExecForm.value)
  closeBatchExecModal()
}

// 打开执行结果抽屉
function openExecResultDrawer() {
  showExecResultDrawer.value = true
}

// 关闭执行结果抽屉
function closeExecResultDrawer() {
  showExecResultDrawer.value = false
}

// 切换批量操作下拉框
function toggleBatchOperation() {
  showBatchOperationDropdown.value = !showBatchOperationDropdown.value
}

// 关闭批量操作下拉框
function closeBatchOperation() {
  showBatchOperationDropdown.value = false
}

// 批量操作
function batchDelete() {
  console.log('批量删除:', selectedCases.value)
  closeBatchOperation()
}
function batchMove() {
  console.log('批量移动:', selectedCases.value)
  closeBatchOperation()
}
function batchEdit() {
  console.log('批量编辑:', selectedCases.value)
  closeBatchOperation()
}
function batchCopy() {
  console.log('批量复制:', selectedCases.value)
  closeBatchOperation()
}

// 打开自定义表头弹窗
function openCustomHeaderModal() {
  showCustomHeaderModal.value = true
}

// 关闭自定义表头弹窗
function closeCustomHeaderModal() {
  showCustomHeaderModal.value = false
}

// 确认自定义表头
function confirmCustomHeader() {
  console.log('自定义表头:', customHeaders.value)
  closeCustomHeaderModal()
}

// 全选/取消全选某组
function toggleGroup(group, checked) {
  customHeaders.value.forEach(header => {
    if (header.group === group) {
      header.checked = checked
    }
  })
}

// 判断是否组内全选
function isGroupChecked(group) {
  const groupHeaders = customHeaders.value.filter(h => h.group === group)
  return groupHeaders.every(h => h.checked)
}

// 获取已选字段
const selectedHeaders = computed(() => {
  return customHeaders.value.filter(h => h.checked)
})

// 判断表头是否可见
function isHeaderVisible(key) {
  const header = customHeaders.value.find(h => h.key === key)
  return header ? header.checked : true
}

// 选中/取消选中单个
function toggleSelect(id) {
  const index = selectedCases.value.indexOf(id)
  if (index > -1) {
    selectedCases.value.splice(index, 1)
  } else {
    selectedCases.value.push(id)
  }
}

// 全选/取消全选
function toggleSelectAll(event) {
  if (event.target.checked) {
    selectedCases.value = caseData.value.map(row => row.id)
  } else {
    selectedCases.value = []
  }
}

// 跳转到用例配置页面
function goToCaseConfig(id) {
  router.push(`/case-config/${id}`)
}
</script>

<template>
  <div class="casemgmt-page">
    <AppHeader @navigate="handleNav" />
    
    <div class="page-container">
      <!-- 左侧树 -->
      <aside class="sidebar">
        <!-- 模块选择下拉 - 自定义圆角下拉 -->
        <div 
          class="module-select-wrapper"
          @mouseenter="openModuleDropdown"
          @mouseleave="closeModuleDropdown"
        >
          <div 
            class="module-select-trigger"
            @click="toggleModuleDropdown"
          >
            <svg class="module-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span class="selected-text">{{ selectedModule }}</span>
            <svg class="arrow-icon" :class="{ open: showModuleDropdown }" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </div>
          
          <!-- 下拉菜单 -->
          <div 
            v-if="showModuleDropdown" 
            class="module-dropdown"
            @mouseenter="openModuleDropdown"
            @mouseleave="closeModuleDropdown"
          >
            <!-- 站点切换标签 -->
            <div class="site-tabs">
              <button class="site-tab active">主站</button>
              <button class="site-tab">测试站</button>
            </div>
            <!-- 搜索框 -->
            <div class="dropdown-search">
              <input type="text" placeholder="请输入" />
              <button class="search-btn">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
              <button class="filter-btn">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
                </svg>
              </button>
            </div>
            <!-- 模块列表 -->
            <div class="module-list">
              <div 
                v-for="m in modules" 
                :key="m.name"
                :class="['module-item', { active: selectedModule === m.name }]"
                @click="selectModule(m)"
              >
                <svg class="expand-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
                <span class="module-name">{{ m.name }}</span>
              </div>
            </div>
            <div class="dropdown-footer">没有更多数据了</div>
          </div>
        </div>

        <!-- 筛选栏 - 只看自己 + 菜单按钮 -->
        <div class="filter-bar">
          <label class="checkbox-label">
            <input v-model="onlyMine" type="checkbox" />
            <span>只看自己</span>
          </label>
          
          <!-- 三个横杠菜单按钮 - 悬停和点击都能展示下拉框 -->
          <div 
            class="action-menu-wrapper"
            @mouseenter="openActionMenu"
            @mouseleave="closeActionMenu"
          >
            <button class="menu-trigger-btn" @click="toggleActionMenu">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </button>
            
            <!-- 下拉菜单 -->
            <div 
              v-if="showActionMenu" 
              class="action-dropdown"
              @mouseenter="openActionMenu"
              @mouseleave="closeActionMenu"
            >
              <div class="dropdown-header">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                </svg>
                <span>用例列表</span>
              </div>
              <div class="dropdown-divider"></div>
              <div class="menu-item">
                <span class="icon">+</span>
                <span>添加用例集</span>
                <svg class="arrow" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </div>
              <div class="menu-item" @click="openAddCaseModal">
                <span class="icon">+</span>
                <span>添加用例</span>
              </div>
              <div 
                class="menu-item has-submenu"
                @mouseenter="openAddStepSubmenu"
                @mouseleave="closeAddStepSubmenu"
              >
                <span class="icon">+</span>
                <span>添加用例步骤</span>
                <svg class="arrow" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
                
                <!-- 子菜单 -->
                <div 
                  v-if="showAddStepSubmenu" 
                  class="submenu"
                  @mouseenter="openAddStepSubmenu"
                  @mouseleave="closeAddStepSubmenu"
                >
                  <div class="submenu-item">新增JSF步骤</div>
                  <div class="submenu-item">新增HTTP步骤</div>
                  <div class="submenu-item">新增JIMDB步骤</div>
                  <div class="submenu-item">新增JMQ步骤</div>
                  <div class="submenu-item">新增JAR步骤</div>
                  <div class="submenu-item">新增KAFKA步骤</div>
                  <div class="submenu-item">新增MYSQL步骤</div>
                  <div class="submenu-item">新增STARDB步骤</div>
                  <div class="submenu-item">新增SHELL步骤</div>
                </div>
              </div>
              <div class="menu-item">
                <svg class="icon-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                </svg>
                <span>用例集数据同步</span>
                <svg class="help-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                </svg>
              </div>
              <div class="menu-item">
                <svg class="icon-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
                <span>刷新用例树</span>
              </div>
              <div class="menu-item">
                <svg class="icon-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                <span>回收站</span>
              </div>
              <div 
                class="menu-item has-submenu"
                @mouseenter="openNodeTypeSubmenu"
                @mouseleave="closeNodeTypeSubmenu"
              >
                <svg class="icon-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/>
                </svg>
                <span>切换叶子节点类型</span>
                <svg class="arrow" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
                
                <!-- 子菜单 -->
                <div 
                  v-if="showNodeTypeSubmenu" 
                  class="submenu"
                  @mouseenter="openNodeTypeSubmenu"
                  @mouseleave="closeNodeTypeSubmenu"
                >
                  <div class="submenu-item">
                    <span>用例集</span>
                    <svg class="check-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                  <div class="submenu-item">
                    <span>用例</span>
                  </div>
                  <div class="submenu-item">
                    <span>步骤</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 搜索框 - 带重置和筛选按钮 -->
        <div class="search-box">
          <input v-model="searchKeyword" type="text" placeholder="请输入搜索关键字..." />
          <button class="search-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          <button class="reset-link" @click="searchKeyword = ''">重置</button>
          <button class="filter-icon-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
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
        <!-- 标题栏 - Tabs 和 页面标题 -->
        <div class="title-bar">
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
          
          <h3 class="page-title">用例列表</h3>
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
          <!-- 新增按钮带下拉 -->
          <div class="tool-btn-wrapper">
            <button class="tool-btn primary" @click="openAddCaseModal">+ 新增</button>
          </div>
          <button class="tool-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            设置
          </button>
          <button class="tool-btn" @click="openSyncCaseModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
            </svg>
            同步用例
          </button>
          <button class="tool-btn" @click="openBatchExecModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            批量执行
          </button>
          <button class="tool-btn" @click="openExecResultDrawer">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            执行结果
          </button>
          <!-- 批量操作带下拉 -->
          <div class="tool-btn-wrapper" style="position: relative;">
            <button 
              class="tool-btn" 
              :class="{ disabled: selectedCases.length === 0 }"
              @click="toggleBatchOperation"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M10 9v6l5-3-5-3zm0 10c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-16C5.58 3 2 6.58 2 11s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z"/>
              </svg>
              批量操作
            </button>
            <!-- 批量操作下拉 -->
            <div v-if="showBatchOperationDropdown" class="batch-operation-dropdown">
              <div class="dropdown-item" @click="batchDelete">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                删除
              </div>
              <div class="dropdown-item" @click="batchMove">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M10 9v6l5-3-5-3zm0 10c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-16C5.58 3 2 6.58 2 11s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z"/>
                </svg>
                移动
              </div>
              <div class="dropdown-item" @click="batchEdit">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                编辑
              </div>
              <div class="dropdown-item" @click="batchCopy">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                复制
              </div>
            </div>
          </div>
          <button class="tool-btn" @click="openCustomHeaderModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/>
            </svg>
            自定义表头
          </button>
        </div>

        <!-- 表格 -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="col-checkbox">
                  <input 
                    type="checkbox" 
                    :checked="selectedCases.length === caseData.length && caseData.length > 0"
                    @change="toggleSelectAll"
                  />
                </th>
                <th v-if="isHeaderVisible('id')" class="col-id">用例编号</th>
                <th v-if="isHeaderVisible('name')" class="col-name">用例名称</th>
                <th v-if="isHeaderVisible('type')" class="col-type">类型</th>
                <th v-if="isHeaderVisible('caseSet')" class="col-set">所属用例集</th>
                <th v-if="isHeaderVisible('app')" class="col-app">关联应用</th>
                <th v-if="isHeaderVisible('tag')" class="col-tag">标签</th>
                <th v-if="isHeaderVisible('steps')" class="col-steps">步骤数</th>
                <th v-if="isHeaderVisible('tasks')" class="col-tasks">任务数</th>
                <th v-if="isHeaderVisible('execCount')" class="col-exec">执行次数</th>
                <th v-if="isHeaderVisible('result')" class="col-result">结果</th>
                <th v-if="isHeaderVisible('creator')" class="col-creator">创建人</th>
                <th v-if="isHeaderVisible('createTime')" class="col-time">创建时间</th>
                <th v-if="isHeaderVisible('updateTime')" class="col-update">更新时间</th>
                <th v-if="isHeaderVisible('priority')" class="col-priority">优先级</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in caseData" :key="row.id">
                <td class="col-checkbox">
                  <input 
                    type="checkbox" 
                    :checked="selectedCases.includes(row.id)"
                    @change="toggleSelect(row.id)"
                  />
                </td>
                <td v-if="isHeaderVisible('id')" class="col-id">{{ row.id }}</td>
                <td v-if="isHeaderVisible('name')" class="col-name">
                  <a href="javascript:;" class="link" @click="goToCaseConfig(row.id)">{{ row.name }}</a>
                </td>
                <td v-if="isHeaderVisible('type')" class="col-type">{{ row.type }}</td>
                <td v-if="isHeaderVisible('caseSet')" class="col-set">{{ row.caseSet }}</td>
                <td v-if="isHeaderVisible('app')" class="col-app">{{ row.app }}</td>
                <td v-if="isHeaderVisible('tag')" class="col-tag">{{ row.tag || 'NA' }}</td>
                <td v-if="isHeaderVisible('steps')" class="col-steps">{{ row.steps }}</td>
                <td v-if="isHeaderVisible('tasks')" class="col-tasks">{{ row.tasks }}</td>
                <td v-if="isHeaderVisible('execCount')" class="col-exec">{{ row.execCount }}</td>
                <td v-if="isHeaderVisible('result')" class="col-result">
                  <span :class="['result-tag', row.result === '正确' ? 'success' : row.result === '-' ? 'none' : 'fail']">
                    {{ row.result }}
                  </span>
                </td>
                <td v-if="isHeaderVisible('creator')" class="col-creator">{{ row.creator }}</td>
                <td v-if="isHeaderVisible('createTime')" class="col-time">{{ row.createTime }}</td>
                <td v-if="isHeaderVisible('updateTime')" class="col-update">{{ row.updateTime }}</td>
                <td v-if="isHeaderVisible('priority')" class="col-priority">{{ row.priority }}</td>
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

    <!-- 新增用例弹窗 -->
    <div v-if="showAddCaseModal" class="modal-overlay" @click.self="closeAddCaseModal">
      <div class="modal-container">
        <!-- 弹窗头部 -->
        <div class="modal-header">
          <h3 class="modal-title">新增用例</h3>
          <button class="modal-close" @click="closeAddCaseModal">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="modal-body">
          <form class="case-form">
            <!-- 用例名称 -->
            <div class="form-item required">
              <label class="form-label">
                <span class="required-star">*</span>
                用例名称:
              </label>
              <input 
                v-model="addCaseForm.name" 
                type="text" 
                class="form-input" 
                placeholder="请输入用例名称"
              />
            </div>

            <!-- 编排方式 -->
            <div class="form-item required">
              <label class="form-label">
                <span class="required-star">*</span>
                编排方式:
              </label>
              <div class="radio-group">
                <label class="radio-item">
                  <input type="radio" v-model="addCaseForm.arrangeMode" value="list" />
                  <span class="radio-text">列表编排</span>
                </label>
                <label class="radio-item">
                  <input type="radio" v-model="addCaseForm.arrangeMode" value="graph" />
                  <span class="radio-text">图形编排</span>
                </label>
                <label class="radio-item">
                  <input type="radio" v-model="addCaseForm.arrangeMode" value="code" />
                  <span class="radio-text">代码编排</span>
                </label>
              </div>
            </div>

            <!-- 用例类型 -->
            <div class="form-item required">
              <label class="form-label">
                <span class="required-star">*</span>
                用例类型:
              </label>
              <select v-model="addCaseForm.type" class="form-select">
                <option value="">请选择</option>
                <option v-for="opt in caseTypeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- 所属用例集 -->
            <div class="form-item required">
              <label class="form-label">
                <span class="required-star">*</span>
                所属用例集
                <svg class="help-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                </svg>
                :
              </label>
              <select v-model="addCaseForm.caseSet" class="form-select">
                <option value="">请选择</option>
                <option v-for="opt in caseSetOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- 优先级 -->
            <div class="form-item">
              <label class="form-label">
                <span class="required-star">*</span>
                优先级:
              </label>
              <select v-model="addCaseForm.priority" class="form-select">
                <option value="">请选择</option>
                <option v-for="opt in priorityOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- 前置条件 -->
            <div class="form-item">
              <label class="form-label">前置条件:</label>
              <textarea 
                v-model="addCaseForm.preCondition" 
                class="form-textarea" 
                placeholder="前置条件"
                rows="3"
              ></textarea>
            </div>

            <!-- 用例描述 -->
            <div class="form-item">
              <label class="form-label">用例描述:</label>
              <textarea 
                v-model="addCaseForm.description" 
                class="form-textarea" 
                placeholder="描述信息"
                rows="3"
              ></textarea>
            </div>

            <!-- 标签 -->
            <div class="form-item">
              <label class="form-label">标签:</label>
              <div class="tag-section">
                <button type="button" class="add-tag-btn">+ 新增标签</button>
              </div>
            </div>
          </form>
        </div>

        <!-- 弹窗底部 -->
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeAddCaseModal">取消</button>
          <button class="btn-save" @click="saveCase">保存</button>
          <button class="btn-save-go" @click="saveAndGo">保存并前往</button>
        </div>
      </div>
    </div>

    <!-- 同步用例弹窗 -->
    <div v-if="showSyncCaseModal" class="modal-overlay" @click.self="closeSyncCaseModal">
      <div class="modal-container sync-case-modal">
        <div class="modal-header">
          <h3 class="modal-title">同步用例</h3>
          <button class="modal-close" @click="closeSyncCaseModal">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-item required">
            <label class="form-label">
              <span class="required-star">*</span>
              平台选择:
            </label>
            <select v-model="syncCaseForm.platform" class="form-select">
              <option value="">请选择</option>
              <option v-for="opt in platformOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeSyncCaseModal">取消</button>
          <button class="btn-save-go" @click="submitSyncCase">提交</button>
        </div>
      </div>
    </div>

    <!-- 批量执行弹窗 -->
    <div v-if="showBatchExecModal" class="modal-overlay" @click.self="closeBatchExecModal">
      <div class="modal-container batch-exec-modal">
        <div class="modal-header">
          <h3 class="modal-title">批量执行</h3>
          <button class="modal-close" @click="closeBatchExecModal">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form class="case-form">
            <!-- 通知方式 -->
            <div class="form-item">
              <label class="form-label">通知方式:</label>
              <div class="radio-group">
                <label class="radio-item">
                  <input type="radio" v-model="batchExecForm.notifyType" value="email" />
                  <span class="radio-text">发送邮件</span>
                </label>
                <label class="radio-item">
                  <input type="radio" v-model="batchExecForm.notifyType" value="dd" />
                  <span class="radio-text">咚咚消息</span>
                </label>
                <label class="radio-item">
                  <input type="radio" v-model="batchExecForm.notifyType" value="both" />
                  <span class="radio-text">咚咚+邮件</span>
                </label>
              </div>
            </div>

            <!-- 邮件通知 -->
            <div class="form-item">
              <label class="form-label">邮件通知:</label>
              <input 
                v-model="batchExecForm.emailNotify" 
                type="text" 
                class="form-input" 
                placeholder="请填写完整邮箱地址，多个以;分隔"
              />
            </div>

            <!-- 通知策略 -->
            <div class="form-item">
              <label class="form-label">通知策略:</label>
              <select v-model="batchExecForm.notifyStrategy" class="form-select">
                <option value="all">全部发送结果通知</option>
                <option value="fail">仅失败时通知</option>
                <option value="success">仅成功时通知</option>
              </select>
            </div>

            <!-- 执行间隔 -->
            <div class="form-item">
              <label class="form-label">执行间隔:</label>
              <div class="input-with-suffix">
                <input 
                  v-model="batchExecForm.execInterval" 
                  type="number" 
                  class="form-input" 
                  placeholder=""
                />
                <span class="input-suffix">秒</span>
              </div>
            </div>

            <!-- 执行顺序 -->
            <div class="form-item">
              <label class="form-label">执行顺序:</label>
              <select v-model="batchExecForm.execOrder" class="form-select">
                <option value="parallel">并行</option>
                <option value="serial">串行</option>
              </select>
            </div>

            <!-- 中断策略 -->
            <div class="form-item">
              <label class="form-label">中断策略:</label>
              <select v-model="batchExecForm.breakStrategy" class="form-select">
                <option value="ignore">忽略错误继续执行</option>
                <option value="stop">遇到错误停止执行</option>
              </select>
            </div>

            <!-- HOST配置 -->
            <div class="form-item">
              <label class="form-label">HOST配置:</label>
              <input 
                v-model="batchExecForm.hostConfig" 
                type="text" 
                class="form-input" 
                placeholder="请填写需要配置的host配置，多个host以;分隔"
              />
            </div>

            <!-- 执行环境 -->
            <div class="form-item">
              <label class="form-label">执行环境:</label>
              <div class="input-with-icon">
                <select v-model="batchExecForm.execEnv" class="form-select">
                  <option value="test">测试站</option>
                  <option value="uat">UAT环境</option>
                  <option value="prod">生产环境</option>
                </select>
                <svg class="input-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>

            <!-- 特性环境 -->
            <div class="form-item">
              <label class="form-label">特性环境:</label>
              <input 
                v-model="batchExecForm.featureEnv" 
                type="text" 
                class="form-input" 
                placeholder="请选择环境，可输入"
              />
            </div>

            <!-- 执行命令 -->
            <div class="form-item">
              <label class="form-label">执行命令:</label>
              <input 
                v-model="batchExecForm.execCommand" 
                type="text" 
                class="form-input" 
                placeholder="仅自定义框架代码用例生效,不填写默认使用用例命..."
              />
            </div>

            <!-- 变量选择 -->
            <div class="form-item">
              <label class="form-label">变量选择:</label>
              <div class="double-select">
                <select v-model="batchExecForm.variable1" class="form-select">
                  <option value="">请选择</option>
                </select>
                <select v-model="batchExecForm.variable2" class="form-select">
                  <option value="">请选择</option>
                </select>
              </div>
            </div>

            <!-- 关联行云需求 -->
            <div class="form-item">
              <label class="form-label">关联行云需求:</label>
              <button type="button" class="add-btn">+</button>
            </div>

            <!-- 测试阶段 -->
            <div class="form-item">
              <label class="form-label">测试阶段:</label>
              <select v-model="batchExecForm.testStage" class="form-select">
                <option value="">请选择</option>
                <option value="unit">单元测试</option>
                <option value="integration">集成测试</option>
                <option value="system">系统测试</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn-save" @click="confirmBatchExec">确认并执行</button>
        </div>
      </div>
    </div>

    <!-- 执行结果抽屉 -->
    <div v-if="showExecResultDrawer" class="drawer-overlay" @click.self="closeExecResultDrawer">
      <div class="drawer-container">
        <div class="drawer-header">
          <h3 class="drawer-title">用例集执行记录</h3>
          <div class="drawer-info">
            <span>用例集ID: 851847</span>
            <span>名称: <a href="javascript:;" class="link">授权管理/取消授权</a></span>
            <label class="checkbox-item">
              <input type="checkbox" />
              新标签页打开执行结果
            </label>
            <input type="text" class="filter-input" placeholder="关联行云需求" />
          </div>
          <button class="drawer-close" @click="closeExecResultDrawer">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="drawer-body">
          <!-- 搜索栏 -->
          <div class="drawer-search">
            <div class="search-item">
              <span>关键字:</span>
              <input type="text" placeholder="支持编号/名称等关键字查询" />
            </div>
            <div class="search-item">
              <span>执行人:</span>
              <select>
                <option>请输入 ERP,支...</option>
              </select>
            </div>
            <div class="search-item">
              <span>日期:</span>
              <input type="date" value="2026-02-25" />
              <span>→</span>
              <input type="date" value="2026-03-03" />
            </div>
            <button class="btn-query">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              查询
            </button>
            <button class="btn-reset">重置</button>
            <label class="auto-refresh">
              <input type="checkbox" />
              自动刷新
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            </label>
          </div>
          <!-- 表格 -->
          <div class="drawer-table">
            <table>
              <thead>
                <tr>
                  <th class="col-checkbox"><input type="checkbox" /></th>
                  <th>编号</th>
                  <th>状态</th>
                  <th>名称</th>
                  <th>环境</th>
                  <th>执行人</th>
                  <th>来源</th>
                  <th>耗时(秒)</th>
                  <th>执行时间</th>
                  <th>用例结果 <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg></th>
                  <th>步骤结果 <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg></th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="11" class="empty-cell">
                    <div class="empty-state">
                      <svg viewBox="0 0 24 24" width="48" height="48" fill="#ddd">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                      <p>暂无数据</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义表头弹窗 -->
    <div v-if="showCustomHeaderModal" class="modal-overlay" @click.self="closeCustomHeaderModal">
      <div class="modal-container custom-header-modal">
        <div class="modal-header">
          <h3 class="modal-title">设置显示的列</h3>
          <button class="modal-close" @click="closeCustomHeaderModal">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="header-config">
            <!-- 左侧选择区 -->
            <div class="header-select-area">
              <!-- 基本信息组 -->
              <div class="header-group">
                <label class="group-title">
                  <input 
                    type="checkbox" 
                    :checked="isGroupChecked('基本信息')"
                    @change="e => toggleGroup('基本信息', e.target.checked)"
                  />
                  <span>基本信息</span>
                </label>
                <div class="group-items">
                  <label v-for="header in customHeaders.filter(h => h.group === '基本信息')" :key="header.key" class="header-item">
                    <input type="checkbox" v-model="header.checked" />
                    <span>{{ header.label }}</span>
                  </label>
                </div>
              </div>

              <!-- 执行信息组 -->
              <div class="header-group">
                <label class="group-title">
                  <input 
                    type="checkbox" 
                    :checked="isGroupChecked('执行信息')"
                    @change="e => toggleGroup('执行信息', e.target.checked)"
                  />
                  <span>执行信息</span>
                </label>
                <div class="group-items">
                  <label v-for="header in customHeaders.filter(h => h.group === '执行信息')" :key="header.key" class="header-item">
                    <input type="checkbox" v-model="header.checked" />
                    <span>{{ header.label }}</span>
                  </label>
                </div>
              </div>

              <!-- 更新信息组 -->
              <div class="header-group">
                <label class="group-title">
                  <input 
                    type="checkbox" 
                    :checked="isGroupChecked('更新信息')"
                    @change="e => toggleGroup('更新信息', e.target.checked)"
                  />
                  <span>更新信息</span>
                </label>
                <div class="group-items">
                  <label v-for="header in customHeaders.filter(h => h.group === '更新信息')" :key="header.key" class="header-item">
                    <input type="checkbox" v-model="header.checked" />
                    <span>{{ header.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- 右侧已选字段 -->
            <div class="selected-headers-area">
              <h4>已选择字段</h4>
              <div class="selected-list">
                <div v-for="header in selectedHeaders" :key="header.key" class="selected-item">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
                  </svg>
                  <span>{{ header.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeCustomHeaderModal">取消</button>
          <button class="btn-save-go" @click="confirmCustomHeader">确认</button>
        </div>
      </div>
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
  padding: 12px;
  overflow-y: auto;
  position: relative;
  z-index: 100;
}

/* 模块选择下拉 - 圆角样式 */
.module-select-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.module-select-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s;

  &:hover {
    border-color: #1890ff;
  }

  .module-icon {
    color: #666;
  }

  .selected-text {
    flex: 1;
    font-size: 14px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .arrow-icon {
    color: #999;
    transition: transform 0.2s;

    &.open {
      transform: rotate(180deg);
    }
  }
}

/* 下拉菜单 - 圆角 */
.module-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 100;
  overflow: hidden;
}

.site-tabs {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.site-tab {
  flex: 1;
  padding: 6px 12px;
  border: none;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background: #e6f7ff;
    color: #1890ff;
    font-weight: 500;
  }

  &:hover:not(.active) {
    background: #e8e8e8;
  }
}

.dropdown-search {
  display: flex;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;

  input {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    font-size: 14px;

    &::placeholder {
      color: #999;
    }
  }

  .search-btn, .filter-btn {
    padding: 6px 8px;
    border: 1px solid #d9d9d9;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;
    color: #666;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }
  }
}

.module-list {
  max-height: 280px;
  overflow-y: auto;
}

.module-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }

  &.active {
    background: #e6f7ff;
    color: #1890ff;
  }

  .expand-icon {
    color: #999;
    flex-shrink: 0;
  }

  .module-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.dropdown-footer {
  padding: 10px 12px;
  text-align: center;
  font-size: 14px;
  color: #999;
  border-top: 1px solid #f0f0f0;
}

/* 筛选栏 - 只看自己和菜单按钮一排 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

/* 菜单按钮和下拉 */
.action-menu-wrapper {
  position: relative;
}

.menu-trigger-btn {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  height: 36px;
  width: 36px;
  box-sizing: border-box;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
}

.action-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 200px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 99999;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  background: #fafafa;
}

.dropdown-divider {
  height: 1px;
  background: #f0f0f0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: #f5f5f5;
  }

  .icon {
    font-size: 16px;
    color: #999;
  }

  .icon-svg {
    color: #999;
  }

  .arrow {
    margin-left: auto;
    color: #999;
  }

  .help-icon {
    color: #1890ff;
    margin-left: 4px;
  }
}

.menu-item.has-submenu {
  position: relative;
}

.submenu {
  position: absolute;
  left: calc(100% + 4px);
  top: 0;
  min-width: 140px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 101;
}

.submenu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }

  .check-icon {
    color: #52c41a;
  }
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;

  input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    font-size: 14px;
    height: 36px;
    box-sizing: border-box;

    &::placeholder {
      color: #999;
    }
  }

  .search-btn {
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;
    color: #666;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }
  }

  .reset-link {
    padding: 0 8px;
    font-size: 14px;
    color: #1890ff;
    cursor: pointer;
    background: none;
    border: none;

    &:hover {
      color: #40a9ff;
    }
  }

  .filter-icon-btn {
    padding: 8px;
    border: 1px solid #d9d9d9;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;
    color: #666;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }
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
    font-size: 14px;
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
    font-size: 13px;
    color: #999;
  }
}

/* 主内容 */
.main-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

/* 标题栏 */
.title-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.content-tabs {
  display: flex;
  gap: 4px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 15px;
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

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

/* 搜索筛选 */
.search-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 14px;
    color: #666;
    white-space: nowrap;
  }

  input {
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;
    width: 140px;
    height: 36px;
    box-sizing: border-box;
  }
}

.filter-btn, .reset-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  height: 36px;
  box-sizing: border-box;
}

.query-btn {
  padding: 8px 20px;
  border: none;
  background: #1890ff;
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  height: 36px;
  box-sizing: border-box;
}

/* 工具栏 */
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.tool-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  height: 36px;
  box-sizing: border-box;

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
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background: #fafafa;
  font-weight: 500;
  color: #666;
  white-space: nowrap;
  font-size: 14px;
}

td {
  font-size: 14px;
}

.link {
  color: #1890ff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.result-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;

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
  font-size: 14px;
}

.page-btns {
  display: flex;
  gap: 4px;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;

  &.active {
    background: #1890ff;
    color: #fff;
    border-color: #1890ff;
  }
}

.page-size {
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

/* 工具栏按钮样式 */
.tool-btn-wrapper {
  position: relative;
}

.tool-btn {
  svg {
    margin-right: 4px;
    vertical-align: middle;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f5f5f5;
    border-color: #d9d9d9;
    color: #999;
  }
}

/* 批量操作下拉 */
.batch-operation-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 120px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 99999;
  overflow: hidden;

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #f5f5f5;
    }

    svg {
      color: #999;
    }
  }
}

/* 同步用例弹窗 */
.sync-case-modal {
  width: 500px;
}

/* 批量执行弹窗 */
.batch-exec-modal {
  width: 700px;
  max-height: 85vh;
  overflow-y: auto;

  .input-with-suffix {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;

    .form-input {
      flex: 1;
      padding-right: 30px;
    }

    .input-suffix {
      margin-left: 8px;
      color: #666;
      font-size: 14px;
    }
  }

  .input-with-icon {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;

    .form-select {
      flex: 1;
    }

    .input-icon {
      margin-left: 8px;
      color: #1890ff;
    }
  }

  .double-select {
    flex: 1;
    display: flex;
    gap: 12px;

    .form-select {
      flex: 1;
    }
  }

  .add-btn {
    padding: 6px 12px;
    border: 1px solid #d9d9d9;
    background: #fff;
    border-radius: 4px;
    font-size: 14px;
    color: #666;
    cursor: pointer;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }
  }
}

/* 执行结果抽屉 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 20000;
}

.drawer-container {
  position: fixed;
  top: 0;
  right: 0;
  width: 90%;
  height: 100%;
  background: #fff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.drawer-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  font-size: 14px;
  color: #666;

  .link {
    color: #1890ff;
    text-decoration: none;
  }

  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }

  .filter-input {
    padding: 6px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;
    width: 120px;
  }
}

.drawer-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #666;
  }
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.drawer-search {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  .search-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #666;

    input, select {
      padding: 6px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 14px;
    }
  }

  .btn-query {
    padding: 6px 16px;
    border: none;
    background: #1890ff;
    color: #fff;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover {
      background: #40a9ff;
    }
  }

  .btn-reset {
    padding: 6px 16px;
    border: 1px solid #d9d9d9;
    background: #fff;
    border-radius: 4px;
    font-size: 14px;
    color: #666;
    cursor: pointer;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }
  }

  .auto-refresh {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    margin-left: auto;

    svg {
      color: #1890ff;
    }
  }
}

.drawer-table {
  background: #fff;
  border-radius: 8px;
  overflow: auto;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
    }

    th {
      background: #fafafa;
      font-weight: 500;
      color: #666;
      white-space: nowrap;

      svg {
        color: #999;
        vertical-align: middle;
        margin-left: 4px;
      }
    }
  }

  .empty-cell {
    text-align: center;
    padding: 60px 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #999;
  }
}

/* 自定义表头弹窗 */
.custom-header-modal {
  width: 800px;
}

.header-config {
  display: flex;
  gap: 24px;
}

.header-select-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-group {
  .group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    cursor: pointer;

    input[type="checkbox"] {
      width: 16px;
      height: 16px;
    }
  }

  .group-items {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding-left: 24px;
  }
}

.header-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
  }

  &:has(input:checked) {
    color: #1890ff;
  }
}

.selected-headers-area {
  width: 200px;
  border-left: 1px solid #e8e8e8;
  padding-left: 24px;

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin: 0 0 16px 0;
  }
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;

  svg {
    color: #999;
  }
}

/* 响应式 */
@media (max-width: 1100px) {
  .sidebar {
    width: 200px;
    padding: 12px;
  }

  .search-filter {
    flex-wrap: wrap;
    padding: 12px;
  }

  .filter-item input {
    width: 120px;
  }
}

@media (max-width: 900px) {
  .sidebar {
    display: none;
  }

  .main-content {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-wrap: wrap;
  }

  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* 高DPI缩放适配 */
@media (-webkit-min-device-pixel-ratio: 1.25), (min-resolution: 120dpi) {
  .sidebar {
    width: 220px;
    padding: 12px;
  }

  .main-content {
    padding: 16px;
  }

  th, td {
    padding: 8px 6px;
  }
}

/* 新增用例弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
}

.modal-container {
  background: #fff;
  border-radius: 8px;
  width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #666;
  }
}

.modal-body {
  padding: 24px;
}

.case-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  &.required {
    .form-label {
      color: #333;
    }
  }
}

.form-label {
  width: 100px;
  font-size: 14px;
  color: #666;
  padding-top: 8px;
  flex-shrink: 0;

  .required-star {
    color: #f5222d;
    margin-right: 4px;
  }

  .help-icon {
    color: #1890ff;
    margin-left: 4px;
    cursor: help;
  }
}

.form-input,
.form-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  height: 36px;
  box-sizing: border-box;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: #1890ff;
  }
}

.form-textarea {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: #1890ff;
  }
}

.radio-group {
  display: flex;
  gap: 24px;
  padding-top: 6px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;

  input[type="radio"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
}

.tag-section {
  flex: 1;
  padding-top: 6px;
}

.add-tag-btn {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
  cursor: pointer;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  background: #fafafa;
}

.btn-cancel {
  padding: 8px 20px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  height: 36px;
  box-sizing: border-box;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
}

.btn-save {
  padding: 8px 20px;
  border: 1px solid #1890ff;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  color: #1890ff;
  cursor: pointer;
  height: 36px;
  box-sizing: border-box;

  &:hover {
    background: #e6f7ff;
  }
}

.btn-save-go {
  padding: 8px 20px;
  border: none;
  background: #1890ff;
  border-radius: 4px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  height: 36px;
  box-sizing: border-box;

  &:hover {
    background: #40a9ff;
  }
}
</style>
