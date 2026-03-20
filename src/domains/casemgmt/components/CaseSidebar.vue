<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { fetchProjectList } from '@/domains/project/api'
import { fetchSuiteList } from '../api'
import { useProjectStore } from '@/domains/project/stores/useProjectStore'

const route = useRoute()
const emit = defineEmits([
  'openAddSuiteModal',
  'openAddCaseModal',
  'editSuite',
  'deleteSuite',
  'selectSuite'
])

const projectStore = useProjectStore()

const selectedModule = ref('商家开放')
const searchKeyword = ref('')
const onlyMine = ref(false)
const showModuleDropdown = ref(false)
const showActionMenu = ref(false)
const showAddStepSubmenu = ref(false)
const showNodeTypeSubmenu = ref(false)
const showAddSuiteSubmenu = ref(false)
const hoveringActionMenu = ref(false)
let actionMenuCloseTimer = null
const showNodeMoreMenu = ref(false)
const hoveringNodeMoreMenu = ref(false)
const nodeMoreMenuStyle = ref({})
const activeMoreNode = ref(null)
const showNodeEnvSubmenu = ref(false)
const nodeEnvSubmenuStyle = ref({})
let nodeMoreCloseTimer = null
let moduleDropdownCloseTimer = null

// Teleport 定位相关
const moduleTriggerRef = ref(null)
const actionTriggerRef = ref(null)
const moduleDropdownStyle = ref({})
const actionDropdownStyle = ref({})

// 模块列表（从 /api/v1/projects/list 动态加载，名称即项目 name）
const modules = ref([])

// 用例集树数据
const treeData = ref([])
const selectedSuiteId = ref(null)

// 通用加载函数：
// 不传参数 => 顶层用例集
// 传 parentId => 该用例集下的子用例集
async function loadSuites(parentId) {
  try {
    const params = {}
    const projectId = projectStore.currentProjectId || modules.value[0]?.id
    if (projectId) {
      params.project_id = projectId
    }
    if (typeof parentId === 'number') {
      params.parent_id = parentId
    }
    const resp = await fetchSuiteList(params)
    const list = resp?.data?.data?.items || []
    return list.map(item => ({
      id: item.id,
      name: item.name,
      parent_id: item.parent_id,
      remark: item.remark || '',
      tags: item.tags || '',
      group: item.group || '',
      testcase_count: item.testcase_count ?? 0,
      step_count: item.step_count ?? 0,
      count:
        typeof item.testcase_count === 'number' &&
        typeof item.step_count === 'number'
          ? `(${item.testcase_count}|${item.step_count})`
          : '',
      // 初始 children 置为 null，展开时按需加载
      children: null
    }))
  } catch (error) {
    void error
    return []
  }
}

async function loadRootSuites() {
  const roots = await loadSuites()
  treeData.value = roots
  const routeSuiteId = Number(route.query.suite_id)
  const hasRouteSuiteId = Number.isFinite(routeSuiteId)
  if (hasRouteSuiteId) {
    const matched = roots.find(item => item.id === routeSuiteId)
    if (matched) {
      selectedSuiteId.value = matched.id
      emit('selectSuite', matched)
      return
    }
  }
  if (roots.length && selectedSuiteId.value == null) {
    selectedSuiteId.value = roots[0].id
  }
}

async function loadChildSuites(node) {
  node.children = await loadSuites(node.id)
}

async function loadModules() {
  try {
    // 进入页面先恢复持久化项目
    projectStore.restoreCurrentProject()
    const resp = await fetchProjectList({
      project_id: '',
      page: 1,
      page_size: 100
    })
    const list = resp?.data?.data?.list || []
    modules.value = list.map(item => ({
      id: item.id,
      name: item.name,
      count: ''
    }))
    if (modules.value.length > 0) {
      // 优先使用 store 持久化的项目 ID
      const savedId = projectStore.currentProjectId
      const target =
        modules.value.find(item => item.id === savedId) || modules.value[0]
      selectedModule.value = target.name
      projectStore.setCurrentProject({ id: target.id, name: target.name })
    }
    // 加载顶层用例集（不传任何参数）
    await loadRootSuites()
  } catch (error) {
    void error
  }
}

onMounted(() => {
  void loadModules()
})

const expandedKeys = ref([])

async function toggleExpand(node) {
  const index = expandedKeys.value.indexOf(node.id)
  if (index > -1) {
    expandedKeys.value.splice(index, 1)
  } else {
    // 每次展开都请求一次 /api/v1/testcases/suite/list，parent_id 为当前用例集 ID
    await loadChildSuites(node)
    expandedKeys.value.push(node.id)
    // 展开时也视为选中该用例集，触发右侧用例列表加载
    selectSuite(node)
  }
}

function isExpanded(node) {
  return expandedKeys.value.includes(node.id)
}

function removeNode(target) {
  const removeFrom = (nodes) => {
    const idx = nodes.findIndex(n => n.id === target.id)
    if (idx !== -1) {
      nodes.splice(idx, 1)
      return true
    }
    for (const n of nodes) {
      if (n.children && removeFrom(n.children)) {
        return true
      }
    }
    return false
  }
  removeFrom(treeData.value)
}

function handleDeleteSuite(node) {
  // 乐观更新：先从树中移除，再通知父组件调删除接口
  removeNode(node)
  emit('deleteSuite', node)
}

function selectSuite(node) {
  selectedSuiteId.value = node.id
  emit('selectSuite', node)
}

async function handleClickNode(node) {
  selectSuite(node)
}

function isSelected(node) {
  return selectedSuiteId.value === node.id
}

// 展开状态 + 树形列表 -> 扁平列表，支持任意层级
const flatNodes = computed(() => {
  const result = []
  function walk(nodes, level) {
    if (!Array.isArray(nodes)) return
    for (const n of nodes) {
      result.push({ node: n, level })
      if (expandedKeys.value.includes(n.id)) {
        walk(n.children, level + 1)
      }
    }
  }
  walk(treeData.value, 0)
  return result
})

async function selectModule(module) {
  selectedModule.value = module.name
  showModuleDropdown.value = false
  projectStore.setCurrentProject({ id: module.id, name: module.name })
  // 切换项目后重新拉取该项目的用例集树
  expandedKeys.value = []
  selectedSuiteId.value = null
  await loadRootSuites()
  // 若路由未指定 suite_id，则默认选中第一个根用例集并通知右侧刷新列表
  const routeSuiteId = Number(route.query.suite_id)
  const hasRouteSuiteId = Number.isFinite(routeSuiteId)
  if (!hasRouteSuiteId && treeData.value.length > 0) {
    selectSuite(treeData.value[0])
  }
}

function toggleModuleDropdown() {
  showModuleDropdown.value = !showModuleDropdown.value
}

function openModuleDropdown() {
  if (moduleDropdownCloseTimer) {
    clearTimeout(moduleDropdownCloseTimer)
    moduleDropdownCloseTimer = null
  }
  showModuleDropdown.value = true
}

function closeModuleDropdown() {
  if (moduleDropdownCloseTimer) clearTimeout(moduleDropdownCloseTimer)
  moduleDropdownCloseTimer = setTimeout(() => {
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
  if (!showAddSuiteSubmenu.value && !showAddStepSubmenu.value && !showNodeTypeSubmenu.value) {
    showActionMenu.value = false
  }
}

function scheduleCloseActionMenu() {
  if (actionMenuCloseTimer) clearTimeout(actionMenuCloseTimer)
  actionMenuCloseTimer = setTimeout(() => {
    if (!hoveringActionMenu.value && !showAddSuiteSubmenu.value && !showAddStepSubmenu.value && !showNodeTypeSubmenu.value) {
      showActionMenu.value = false
    }
  }, 120)
}

function onActionMenuEnter() {
  hoveringActionMenu.value = true
  if (actionMenuCloseTimer) {
    clearTimeout(actionMenuCloseTimer)
    actionMenuCloseTimer = null
  }
}

function onActionMenuLeave() {
  hoveringActionMenu.value = false
  scheduleCloseActionMenu()
}

function updateNodeMoreMenuPosition(triggerEl) {
  if (!triggerEl) return
  const rect = triggerEl.getBoundingClientRect()
  nodeMoreMenuStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${Math.max(8, rect.right - 180)}px`,
    minWidth: '180px',
    zIndex: 99999
  }
}

function openNodeMoreMenu(node, evt) {
  if (nodeMoreCloseTimer) {
    clearTimeout(nodeMoreCloseTimer)
    nodeMoreCloseTimer = null
  }
  activeMoreNode.value = node
  showNodeMoreMenu.value = true
  nextTick(() => {
    updateNodeMoreMenuPosition(evt?.currentTarget)
  })
}

function scheduleCloseNodeMoreMenu() {
  if (nodeMoreCloseTimer) clearTimeout(nodeMoreCloseTimer)
  nodeMoreCloseTimer = setTimeout(() => {
    if (!hoveringNodeMoreMenu.value) {
      showNodeMoreMenu.value = false
      showNodeEnvSubmenu.value = false
      activeMoreNode.value = null
    }
  }, 120)
}

function onNodeMoreMenuEnter() {
  hoveringNodeMoreMenu.value = true
  if (nodeMoreCloseTimer) {
    clearTimeout(nodeMoreCloseTimer)
    nodeMoreCloseTimer = null
  }
}

function onNodeMoreMenuLeave() {
  hoveringNodeMoreMenu.value = false
  scheduleCloseNodeMoreMenu()
}

function openNodeEnvSubmenu(evt) {
  showNodeEnvSubmenu.value = true
  nextTick(() => {
    const el = evt?.currentTarget
    if (!el) return
    const rect = el.getBoundingClientRect()
    nodeEnvSubmenuStyle.value = {
      top: `${rect.top}px`,
      left: `${rect.right + 4}px`,
      minWidth: '180px',
      zIndex: 100000
    }
  })
}

function closeNodeEnvSubmenu() {
  showNodeEnvSubmenu.value = false
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

function openAddSuiteSubmenu() {
  showAddSuiteSubmenu.value = true
}

function closeAddSuiteSubmenu() {
  setTimeout(() => {
    showAddSuiteSubmenu.value = false
  }, 100)
}

function handleClickAddSuite() {
  emit('openAddSuiteModal', null)
  showAddSuiteSubmenu.value = false
  showActionMenu.value = false
}

function handleClickAddSuiteUnderNode() {
  // 视为在当前节点下新增用例集：默认所属用例集=当前节点
  if (activeMoreNode.value) {
    emit('openAddSuiteModal', activeMoreNode.value)
  } else {
    emit('openAddSuiteModal', null)
  }
  showNodeMoreMenu.value = false
  showNodeEnvSubmenu.value = false
  activeMoreNode.value = null
}

function handleClickAddCaseUnderNode() {
  if (activeMoreNode.value) {
    emit('openAddCaseModal', activeMoreNode.value)
  } else {
    emit('openAddCaseModal', null)
  }
  showNodeMoreMenu.value = false
  showNodeEnvSubmenu.value = false
  activeMoreNode.value = null
}

function updateModuleDropdownPosition() {
  const trigger = moduleTriggerRef.value
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  moduleDropdownStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`
  }
}

function updateActionDropdownPosition() {
  const trigger = actionTriggerRef.value
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  actionDropdownStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    minWidth: '200px'
  }
}

watch(showModuleDropdown, (val) => {
  if (val) {
    nextTick(() => {
      updateModuleDropdownPosition()
    })
  }
})

watch(showActionMenu, (val) => {
  if (val) {
    nextTick(() => {
      updateActionDropdownPosition()
    })
  }
})
</script>

<template>
  <aside class="sidebar">
    <!-- 模块选择下拉 - 自定义圆角下拉 -->
    <div
      class="module-select-wrapper"
      @mouseenter="openModuleDropdown"
      @mouseleave="closeModuleDropdown"
    >
      <div
        class="module-select-trigger"
        ref="moduleTriggerRef"
        @click="toggleModuleDropdown"
      >
        <svg class="module-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
          />
        </svg>
        <span class="selected-text">{{ selectedModule }}</span>
        <svg class="arrow-icon" :class="{ open: showModuleDropdown }" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </div>

      <!-- 下拉菜单 Teleport 到 body，避免被主容器遮挡 -->
      <teleport to="body">
        <div
          v-if="showModuleDropdown"
          class="module-dropdown"
          :style="moduleDropdownStyle"
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
                <path
                  d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                />
              </svg>
            </button>
            <button class="filter-btn">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
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
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
              <span class="module-name">{{ m.name }}</span>
            </div>
          </div>
          <div class="dropdown-footer">没有更多数据了</div>
        </div>
      </teleport>
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
        @mouseleave="scheduleCloseActionMenu"
      >
        <button class="menu-trigger-btn" ref="actionTriggerRef" @click="toggleActionMenu">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>

        <!-- 下拉菜单 -->
        <teleport to="body">
          <div
            v-if="showActionMenu"
            class="action-dropdown"
            :style="actionDropdownStyle"
            @mouseenter="onActionMenuEnter"
            @mouseleave="onActionMenuLeave"
          >
          <div class="dropdown-header">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
            <span>用例列表</span>
          </div>
          <div class="dropdown-divider"></div>
          <!-- 添加用例集（带子菜单） -->
          <div
            class="menu-item has-submenu"
            @mouseenter="openAddSuiteSubmenu"
            @mouseleave="closeAddSuiteSubmenu"
          >
            <span class="icon">+</span>
            <span>添加用例集</span>
            <svg class="arrow" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>

            <!-- 子菜单：新增用例集 / 文件导入 / 脚本导入 -->
            <div
              v-if="showAddSuiteSubmenu"
              class="submenu"
              @mouseenter="openAddSuiteSubmenu"
              @mouseleave="closeAddSuiteSubmenu"
            >
              <div class="submenu-item" @click="handleClickAddSuite">
                <span>新增用例集</span>
              </div>
              <div class="submenu-item">
                <span>文件导入</span>
              </div>
              <div class="submenu-item">
                <span>脚本导入</span>
              </div>
            </div>
          </div>
          <div class="menu-item">
            <span class="icon">+</span>
            <span @click.stop="emit('openAddCaseModal', null)">添加用例</span>
          </div>
          <div
            class="menu-item has-submenu"
            @mouseenter="openAddStepSubmenu"
            @mouseleave="closeAddStepSubmenu"
          >
            <span class="icon">+</span>
            <span>添加用例步骤</span>
            <svg class="arrow" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
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
              <path
                d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
              />
            </svg>
            <span>用例集数据同步</span>
            <svg class="help-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
              />
            </svg>
          </div>
          <div class="menu-item">
            <svg class="icon-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path
                d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
              />
            </svg>
            <span>刷新用例树</span>
          </div>
          <div class="menu-item">
            <svg class="icon-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
            <span>回收站</span>
          </div>
          <div
            class="menu-item has-submenu"
            @mouseenter="openNodeTypeSubmenu"
            @mouseleave="closeNodeTypeSubmenu"
          >
            <svg class="icon-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path
                d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"
              />
            </svg>
            <span>切换叶子节点类型</span>
            <svg class="arrow" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
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
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
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
        </teleport>
      </div>
    </div>

    <!-- 搜索框 - 带重置和筛选按钮 -->
    <div class="search-box">
      <input v-model="searchKeyword" type="text" placeholder="请输入搜索关键字..." />
      <button class="search-btn">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path
            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          />
        </svg>
      </button>
      <button class="reset-link" @click="searchKeyword = ''">重置</button>
      <button class="filter-icon-btn">
        <svg viewBox="64 64 896 896" width="16" height="16" fill="currentColor">
          <path d="M880.1 154H143.9c-24.5 0-39.8 26.7-27.5 48L349 597.4V838c0 17.7 14.2 32 31.8 32h262.4c17.6 0 31.8-14.3 31.8-32V597.4L907.7 202c12.2-21.3-3.1-48-27.6-48zM603.4 798H420.6V642h182.9v156zm9.6-236.6l-9.5 16.6h-183l-9.5-16.6L212.7 226h598.6L613 561.4z"/>
        </svg>
      </button>
    </div>

    <!-- 树形菜单（使用扁平列表 + level 支持任意层级） -->
    <div class="tree-menu">
      <div v-for="{ node, level } in flatNodes" :key="node.id" class="tree-node">
        <div
          :class="['tree-item', { selected: isSelected(node) }]"
          :style="{ paddingLeft: `${12 + level * 12}px` }"
        >
          <div class="tree-main" @click="handleClickNode(node)">
            <svg
              class="tree-arrow"
              :class="{ expanded: isExpanded(node) }"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              @click.stop="toggleExpand(node)"
            >
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>
            <span class="tree-label">{{ node.name }}</span>
            <span class="tree-count" title="用例数 | 步骤数">{{ node.count }}</span>
          </div>
          <div class="tree-actions">
            <!-- 铅笔 - 修改 -->
            <button class="tree-action-btn" title="修改" @click.stop="emit('editSuite', node)">
              <svg viewBox="64 64 896 896" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M880 298.7L725.3 144a63.9 63.9 0 0 0-45.2-18.7c-16.4 0-32.8 6.2-45.2 18.7L164 615.5V760h144.5l470.9-470.9c24.9-24.9 24.9-65.5 0-90.4zM289.9 704H220v-69.9l389.7-389.7 69.9 69.9L289.9 704z" />
              </svg>
            </button>
            <!-- 垃圾桶 - 删除 -->
            <button class="tree-action-btn" title="删除" @click.stop="handleDeleteSuite(node)">
              <svg viewBox="64 64 896 896" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M360 360h64v336h-64zM600 360h64v336h-64z" />
                <path d="M296 232h432v56H296z" />
                <path d="M408 184h208v64H408z" />
                <path d="M280 280v488c0 35.3 28.7 64 64 64h336c35.3 0 64-28.7 64-64V280h64v-64H216v64z" />
              </svg>
            </button>
            <!-- 竖着三个点 - 更多 -->
            <button
              class="tree-action-btn"
              title="更多"
              @mouseenter.stop="openNodeMoreMenu(node, $event)"
              @mouseleave.stop="scheduleCloseNodeMoreMenu"
              @click.stop="openNodeMoreMenu(node, $event)"
            >
              <svg viewBox="64 64 896 896" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M456 231a56 56 0 10112 0 56 56 0 10-112 0zm0 280a56 56 0 10112 0 56 56 0 10-112 0zm0 280a56 56 0 10112 0 56 56 0 10-112 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 节点“更多”菜单（Teleport 到 body，避免遮挡） -->
    <teleport to="body">
      <div
        v-if="showNodeMoreMenu"
        class="node-more-dropdown"
        :style="nodeMoreMenuStyle"
        @mouseenter="onNodeMoreMenuEnter"
        @mouseleave="onNodeMoreMenuLeave"
      >
        <div class="node-more-item" @click="handleClickAddSuiteUnderNode">
          <span class="node-more-icon">+</span>
          <span>新增用例集</span>
        </div>
        <div class="node-more-item" @click="handleClickAddCaseUnderNode">
          <span class="node-more-icon">+</span>
          <span>新增用例</span>
        </div>
        <div class="node-more-divider"></div>
        <div class="node-more-item">
          <svg class="node-more-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
          <span>复制</span>
        </div>
        <div class="node-more-item">
          <svg class="node-more-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a2.5 2.5 0 000-1.39l7.05-4.11A2.99 2.99 0 0018 7.91a3 3 0 10-2.83-4H15a3 3 0 102.83 4l-7.05 4.11A3 3 0 006 11a3 3 0 103 3.5l7.02 4.11A3 3 0 1018 16.08z"/></svg>
          <span>分享</span>
        </div>
        <div class="node-more-item">
          <svg class="node-more-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10 9v6l5-3-5-3z"/><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/></svg>
          <span>移动</span>
        </div>
        <div class="node-more-item">
          <svg class="node-more-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 7h10v2H7zm0 4h10v2H7zm0 4h6v2H7z"/></svg>
          <span>导出 Excel</span>
        </div>
        <div class="node-more-item">
          <svg class="node-more-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm1 7V3.5L18.5 9H15z"/></svg>
          <span>导出 Xmind</span>
        </div>
        <div class="node-more-item">
          <svg class="node-more-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8z"/><path d="M12 18c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
          <span>同步测试管理</span>
        </div>
        <div
          class="node-more-item node-more-has-submenu"
          @mouseenter="openNodeEnvSubmenu"
          @mouseleave="() => setTimeout(closeNodeEnvSubmenu, 80)"
        >
          <svg class="node-more-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          <span>执行环境</span>
          <svg class="node-more-arrow" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
        </div>
      </div>
    </teleport>

    <!-- 执行环境子菜单 -->
    <teleport to="body">
      <div
        v-if="showNodeEnvSubmenu"
        class="node-more-dropdown"
        :style="nodeEnvSubmenuStyle"
        @mouseenter="onNodeMoreMenuEnter"
        @mouseleave="onNodeMoreMenuLeave"
      >
        <div class="node-more-item">测试</div>
        <div class="node-more-item">预发</div>
        <div class="node-more-item">生产</div>
      </div>
    </teleport>
  </aside>
</template>

<style scoped lang="scss">
.sidebar {
  width: 360px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 12px;
  /* 由页面整体滚动，不在左侧栏内滚动 */
  overflow-y: visible;
}

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

.module-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 10000;
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

  .search-btn,
  .filter-btn {
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
  /* 需要显示右侧子菜单，不能裁剪溢出内容 */
  overflow: visible;
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

.node-more-dropdown {
  position: absolute;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 6px 0;
}

.node-more-item {
  padding: 8px 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-more-item:hover {
  background: #f5f5f5;
}

.node-more-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 6px 0;
}

.node-more-icon {
  width: 14px;
  display: inline-flex;
  justify-content: center;
  color: #999;
}

.node-more-svg {
  color: #999;
  flex: none;
}

.node-more-arrow {
  margin-left: auto;
  color: #999;
  flex: none;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;

  input {
    flex: none;
    width: 150px;
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
    margin-left: 1px;
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
    white-space: nowrap;

    &:hover {
      color: #40a9ff;
    }
  }

  .filter-icon-btn {
    padding: 0;
    border: none;
    background: transparent;
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

.tree-menu {
  .tree-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 6px 8px;
    cursor: pointer;
    font-size: 14px;
    border-radius: 4px;

    &:hover {
      background: #f5f5f5;
    }

    &.selected {
      background: #e6f7ff;
      .tree-label {
        color: #1890ff;
        font-weight: 500;
      }
    }

    &.root {
      padding-left: 12px;
    }

    &.child {
      padding-left: 24px;
    }
  }

  .tree-main {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  .tree-actions {
    display: none;
    align-items: center;
    gap: 0;
  }

  .tree-item:hover .tree-actions {
    display: inline-flex;
  }

  .tree-action-btn {
    border: none;
    background: transparent;
    padding: 0 4px;
    font-size: 14px;
    color: #999;
    cursor: pointer;

    &:hover {
      color: #1890ff;
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tree-count {
    font-size: 13px;
    color: #999;
  }
}
</style>

