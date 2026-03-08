<script setup>
/**
 * HTTP 测试步骤抽屉 - 参考界面重构版
 */
import { ref, computed } from 'vue'
import { Close, Plus, Delete, ArrowRight, More, ArrowDown, ArrowUp, QuestionFilled, Link, EditPen, Right, CopyDocument } from '@element-plus/icons-vue'
import JsonAddDialog from './JsonAddDialog.vue'
import BatchEditDialog from './BatchEditDialog.vue'
import CurlParser from './CurlParser.vue'
import BodyContent from './BodyContent.vue'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'save'])

// 折叠面板状态
const basicExpanded = ref(true) // 基础信息整体展开/收起
const showMoreInfo = ref(false) // 更多信息展开/收起（控制第二排后两个和第三排）
const detailExpanded = ref(true)

// 响应区域显示状态
const showResponse = ref(false)

// 详细信息Tab
const activeDetailTab = ref('input')

// 入参/断言子Tab
const activeInputTab = ref('params')

// Body 数据使用 RequestBodyTabs 组件内部管理

// 响应Tab
const activeResponseTab = ref('body')

// 基础信息表单数据
const basicForm = ref({
  name: '',
  module: '商家开放',
  method: 'GET',
  url: '',
  env: '',
  stepDesc: '',
  expectedResult: '',
  jdosApp: '',
  pfinderEnabled: false,
  forcebotEnabled: false
})

// 模块选项
const moduleOptions = [
  { label: '商家开放', value: '商家开放' },
  { label: '开放平台', value: '开放平台' },
  { label: '内部平台', value: '内部平台' }
]

// HTTP方法选项
const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' }
]

// 断言表单数据
const assertForm = ref({
  compareType: '1', // 比对方式：1-普通，2-A/B
  compareRule: '0', // 对比规则：0-键值，1-整体
  ruleFormat: 'jsonpath', // 规则形式：text-文本，jsonpath-JSONPath
  isCustomScript: false, // 是否自定义脚本
  ignoreNull: '0', // 排除空值：0-不需要，1-需要
  ignoreOrder: '0' // 忽略顺序：0-不需要，1-需要
})

// 多组参数
const paramGroups = ref([
  { 
    id: 1, 
    name: '第1组', 
    checked: true, 
    params: [], 
    headers: [], 
    body: '', 
    ipport: '', 
    encrypt: '',
    // Body 数据（使用新的统一结构）
    bodyData: {
      contentType: 'none',
      formData: [],
      urlencoded: [],
      raw: '',
      rawType: 'json',
      binary: null
    }
  }
])
const currentGroupId = ref(1)

// 计算当前组
const currentGroup = computed(() => {
  return paramGroups.value.find(g => g.id === currentGroupId.value) || paramGroups.value[0]
})

// 重命名弹窗状态
const renameDialogVisible = ref(false)
const renameForm = ref({ id: null, name: '' })

// JSON 添加弹窗状态
const jsonDialogVisible = ref(false)
const jsonDialogType = ref('params')

// 打开 JSON 添加弹窗
function openJsonDialog(type = 'params') {
  jsonDialogType.value = type
  jsonDialogVisible.value = true
}

// 处理 JSON 保存
function handleJsonSave(selectedItems) {
  const group = currentGroup.value
  if (!group) return
  
  if (jsonDialogType.value === 'params') {
    selectedItems.forEach(item => {
      group.params.push(item)
    })
  } else if (jsonDialogType.value === 'headers') {
    selectedItems.forEach(item => {
      group.headers.push(item)
    })
  }
  
  // 关闭弹窗
  jsonDialogVisible.value = false
}

// 批量编辑弹窗状态
const batchEditVisible = ref(false)

// 打开批量编辑弹窗
function openBatchEdit() {
  batchEditVisible.value = true
}

// 处理批量编辑保存
function handleBatchEditSave(selectedItems) {
  const group = currentGroup.value
  if (!group) return
  
  // 根据当前 tab 决定添加到 params 还是 headers
  if (activeInputTab.value === 'params') {
    selectedItems.forEach(item => {
      group.params.push(item)
    })
  } else if (activeInputTab.value === 'headers') {
    selectedItems.forEach(item => {
      group.headers.push(item)
    })
  }
  
  // 关闭弹窗
  batchEditVisible.value = false
}

// 打开重命名弹窗
function openRenameDialog(group) {
  renameForm.value.id = group.id
  renameForm.value.name = group.name
  renameDialogVisible.value = true
}

// 关闭重命名弹窗
function closeRenameDialog() {
  renameDialogVisible.value = false
  renameForm.value = { id: null, name: '' }
}

// 确认重命名
function confirmRename() {
  const group = paramGroups.value.find(g => g.id === renameForm.value.id)
  if (group && renameForm.value.name.trim()) {
    group.name = renameForm.value.name.trim()
  }
  closeRenameDialog()
}

// 复制参数组
function copyGroup(group) {
  const newId = paramGroups.value.length + 1
  const newName = `${group.name}-copy`
  paramGroups.value.push({
    id: newId,
    name: newName,
    checked: group.checked,
    params: JSON.parse(JSON.stringify(group.params || [])),
    headers: JSON.parse(JSON.stringify(group.headers || [])),
    body: group.body || '',
    ipport: group.ipport || '',
    encrypt: group.encrypt || '',
    // Body 数据（使用新的统一结构）
    bodyData: {
      contentType: group.bodyData?.contentType || 'none',
      formData: JSON.parse(JSON.stringify(group.bodyData?.formData || [])),
      urlencoded: JSON.parse(JSON.stringify(group.bodyData?.urlencoded || [])),
      raw: group.bodyData?.raw || '',
      rawType: group.bodyData?.rawType || 'json',
      binary: group.bodyData?.binary || null
    }
  })
}

// 删除参数组
function deleteGroup(groupId) {
  const index = paramGroups.value.findIndex(g => g.id === groupId)
  if (index > -1 && paramGroups.value.length > 1) {
    paramGroups.value.splice(index, 1)
    // 如果删除的是当前选中的组，切换到第一个组
    if (currentGroupId.value === groupId) {
      currentGroupId.value = paramGroups.value[0]?.id || 1
    }
  }
}

// 关闭抽屉
function handleClose() {
  emit('close')
}

// 保存
function handleSave() {
  emit('save')
}

// 切换基础信息展开/收起
function toggleBasic() {
  basicExpanded.value = !basicExpanded.value
}

// 切换更多信息展开/收起
function toggleMoreInfo() {
  showMoreInfo.value = !showMoreInfo.value
}

// 切换详细信息展开/收起
function toggleDetail() {
  detailExpanded.value = !detailExpanded.value
}

// 测试一下
function handleTest() {
  showResponse.value = true
}

// 添加参数组
function addGroup() {
  const newId = paramGroups.value.length + 1
  paramGroups.value.push({
    id: newId,
    name: `第${newId}组`,
    checked: false,  // 新添加的组默认不勾选
    params: [],
    headers: [],
    body: '',
    ipport: '',
    encrypt: '',
    // Body 数据（使用新的统一结构）
    bodyData: {
      contentType: 'none',
      formData: [],
      urlencoded: [],
      raw: '',
      rawType: 'json',
      binary: null
    }
  })
  // 切换到新添加的组
  currentGroupId.value = newId
}

// ================= cURL 解析结果处理 =================

// 处理解析出的 Params，自动添加到当前组的 params 中
function handleParseParams(params) {
  if (!params || Object.keys(params).length === 0) return
  
  const group = currentGroup.value
  if (!group) return
  
  // 将解析出的 params 添加到当前组的 params 数组中
  Object.entries(params).forEach(([key, value]) => {
    // 检查是否已存在相同的 key
    const exists = group.params.some(p => p.key === key)
    if (!exists) {
      group.params.push({
        key: key,
        value: String(value)
      })
    }
  })
}

// 处理解析出的 Headers，自动添加到当前组的 headers 中
function handleParseHeaders(headers) {
  if (!headers || Object.keys(headers).length === 0) return
  
  const group = currentGroup.value
  if (!group) return
  
  // 将解析出的 headers 添加到当前组的 headers 数组中
  Object.entries(headers).forEach(([key, value]) => {
    // 检查是否已存在相同的 key
    const exists = group.headers.some(h => h.key === key)
    if (!exists) {
      group.headers.push({
        key: key,
        value: String(value)
      })
    }
  })
}

// 处理解析出的 Body，自动填写到当前组的 body 中
function handleParseBody(body) {
  if (!body || body.trim() === '') return

  const group = currentGroup.value
  if (!group) return

  // 将解析出的 body 设置到当前组的 bodyData.raw 字段，并设置为 raw 类型
  if (!group.bodyData) {
    group.bodyData = {
      contentType: 'raw',
      formData: [],
      urlencoded: [],
      raw: body,
      rawType: 'json',
      binary: null
    }
  } else {
    group.bodyData.contentType = 'raw'
    group.bodyData.raw = body
    group.bodyData.rawType = 'json'
  }
}

// 处理 Body 数据变化
function handleBodyChange(newBodyData) {
  // bodyData 已经通过 v-model 自动更新
  // 这里可以添加额外的处理逻辑
}

// 处理 binary 文件上传
function handleBinaryChange(file) {
  const group = currentGroup.value
  if (!group) return
  
  group.binaryFile = file.raw
  group.binaryFileName = file.name
}

// 清除 binary 文件
function clearBinaryFile() {
  const group = currentGroup.value
  if (!group) return
  
  group.binaryFile = null
  group.binaryFileName = ''
}
</script>

<template>
  <el-drawer
    v-model="props.visible"
    size="95%"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="handleClose"
    class="http-step-drawer"
  >
    <!-- 头部 -->
    <template #header>
      <div class="drawer-header">
        <el-button link class="close-btn" @click="handleClose">
          <el-icon><Close /></el-icon>
        </el-button>
        <span class="drawer-title">接口用例配置</span>
        <div class="header-actions">
          <el-button size="small">分享</el-button>
          <el-button size="small">另存为</el-button>
        </div>
      </div>
    </template>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 第一个容器：请求信息 -->
      <div class="request-container">
        <!-- 基础信息 -->
        <div class="collapse-section">
          <div class="collapse-header" @click="toggleBasic">
            <el-icon class="collapse-arrow" :class="{ 'is-active': basicExpanded }">
              <ArrowRight />
            </el-icon>
            <span class="collapse-title">基础信息</span>
          </div>
          <div v-show="basicExpanded" class="collapse-content">
            <el-form class="basic-form" label-position="top">
              <!-- 第一排：名称、接口所属模块、接口地址 -->
              <el-row :gutter="16" >
                <el-col :span="6">
                  <el-form-item label="名称" required>
                    <el-input v-model="basicForm.name" placeholder="请输入名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="接口所属模块" required>
                    <el-select v-model="basicForm.module" class="w-100">
                      <el-option
                        v-for="opt in moduleOptions"
                        :key="opt.value"
                        :label="opt.label"
                        :value="opt.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="接口地址">
                    <template #label>
                      <span>接口地址</span>
                      <el-icon class="label-icon"><Link /></el-icon>
                    </template>
                    <div class="url-input-wrapper">
                      <el-select 
                        v-model="basicForm.method" 
                        class="method-select"
                        :class="`color-${basicForm.method}`"
                      >
                        <el-option
                          v-for="opt in methodOptions"
                          :key="opt.value"
                          :label="opt.label"
                          :value="opt.value"
                          :class="`method-option color-${opt.value}`"
                        />
                      </el-select>
                      <curl-parser
                        v-model="basicForm.url"
                        v-model:method="basicForm.method"
                        @parse:params="handleParseParams"
                        @parse:headers="handleParseHeaders"
                        @parse:body="handleParseBody"
                        class="curl-parser-wrapper"
                      />
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <!-- 第二排：始终显示特性环境、预期结果描述；展开时显示步骤描述、Jdos应用 -->
              <el-row :gutter="16">
                <!-- 特性环境 - 始终显示 -->
                <el-col :span="6">
                  <el-form-item>
                    <template #label>
                      <span>特性环境</span>
                      <el-icon class="label-icon"><QuestionFilled /></el-icon>
                    </template>
                    <el-input v-model="basicForm.env" placeholder="请选择环境，可输入" />
                  </el-form-item>
                </el-col>
                <!-- 步骤描述 - 仅展开时显示 -->
                <el-col v-if="showMoreInfo" :span="6">
                  <el-form-item label="步骤描述">
                    <el-input 
                      v-model="basicForm.stepDesc" 
                      placeholder="步骤描述信息，步骤内容的补充说明"
                      type="textarea"
                      :rows="1"
                    />
                  </el-form-item>
                </el-col>
                <!-- 预期结果描述 - 始终显示 -->
                <el-col :span="6">
                  <el-form-item>
                    <template #label>
                      <span>预期结果描述</span>
                      <el-icon class="label-icon"><QuestionFilled /></el-icon>
                    </template>
                    <el-input 
                      v-model="basicForm.expectedResult" 
                      placeholder="步骤预期结果描述"
                      type="textarea"
                      :rows="1"
                    />
                  </el-form-item>
                </el-col>
                <!-- Jdos应用 - 仅展开时显示 -->
                <el-col v-if="showMoreInfo" :span="6">
                  <el-form-item>
                    <template #label>
                      <span>Jdos应用</span>
                      <el-icon class="label-icon"><QuestionFilled /></el-icon>
                      <el-icon class="label-icon link"><EditPen /></el-icon>
                    </template>
                    <el-input v-model="basicForm.jdosApp" placeholder="请输入Jdos应用名称" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <!-- 第三排：链路追踪、压测标识 - 仅展开时显示 -->
              <el-row v-if="showMoreInfo" :gutter="16">
                <el-col :span="6">
                  <el-form-item label="链路追踪(PFinder)">
                    <el-switch v-model="basicForm.pfinderEnabled" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="压测标识(ForceBot)">
                    <el-switch v-model="basicForm.forcebotEnabled" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <!-- 更多信息/隐藏信息链接 -->
              <div class="more-link">
                <el-link v-if="!showMoreInfo" type="primary" @click="toggleMoreInfo">更多信息</el-link>
                <el-link v-else type="primary" @click="toggleMoreInfo">隐藏信息</el-link>
              </div>
            </el-form>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="collapse-section">
          <div class="collapse-header" @click="toggleDetail">
            <el-icon class="collapse-arrow" :class="{ 'is-active': detailExpanded }">
              <ArrowRight />
            </el-icon>
            <span class="collapse-title">详细信息</span>
          </div>
          <div v-show="detailExpanded" class="collapse-content detail-content">
            <el-tabs v-model="activeDetailTab" class="detail-tabs">
              <el-tab-pane label="入参/断言" name="input">
                <div class="input-assert-wrapper">
                  <!-- 组选择器 -->
                  <div class="group-selector">
                    <el-icon class="help-icon"><QuestionFilled /></el-icon>
                    <el-button link type="primary" @click="addGroup">添加</el-button>
                    <div class="group-list">
                      <div 
                        v-for="group in paramGroups" 
                        :key="group.id"
                        class="group-item-wrapper"
                        :class="{ active: currentGroupId === group.id }"
                      >
                        <el-button-group class="group-button-group">
                          <!-- 组名按钮（带复选框） -->
                          <el-button 
                            class="group-name-btn"
                            @click="currentGroupId = group.id"
                          >
                            <el-checkbox 
                              v-model="group.checked" 
                              :label="group.id"
                              @click.stop
                            >
                              {{ group.name }}
                            </el-checkbox>
                          </el-button>
                          <!-- 更多操作按钮（三个竖着的点） -->
                          <el-dropdown trigger="hover" placement="bottom">
                            <el-button class="group-more-btn">
                              <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                                <path d="M456 231a56 56 0 10112 0 56 56 0 10-112 0zm0 280a56 56 0 10112 0 56 56 0 10-112 0zm0 280a56 56 0 10112 0 56 56 0 10-112 0z"></path>
                              </svg>
                            </el-button>
                            <template #dropdown>
                              <el-dropdown-menu>
                                <el-dropdown-item @click="openRenameDialog(group)">
                                  <el-icon><EditPen /></el-icon> 重命名
                                </el-dropdown-item>
                                <el-dropdown-item @click="copyGroup(group)">
                                  <el-icon><CopyDocument /></el-icon> 复制
                                </el-dropdown-item>
                                <el-dropdown-item 
                                  divided 
                                  @click="deleteGroup(group.id)"
                                  :disabled="paramGroups.length <= 1"
                                >
                                  <el-icon><Delete /></el-icon> 删除
                                </el-dropdown-item>
                              </el-dropdown-menu>
                            </template>
                          </el-dropdown>
                        </el-button-group>
                      </div>
                    </div>
                  </div> 
                               
                  <el-row :gutter="16" class="input-assert-row">
                    <!-- 左侧：请求入参 -->
                    <el-col :span="11" class="request-params-col">
                      <el-tabs v-model="activeInputTab" type="border-card" class="params-tabs">
                        <el-tab-pane label="Params" name="params">
                          <div class="key-value-table">
                            <el-table :data="currentGroup.params" size="small" border>
                              <el-table-column label="KEY" min-width="120">
                                <template #header>
                                  <span>KEY</span>
                                  <el-button size="small" class="ml-8" @click="openJsonDialog('params')">JSON添加</el-button>
                                </template>
                                <template #default="{ row }">
                                  <el-input v-model="row.key" size="small" placeholder="请输入Key" />
                                </template>
                              </el-table-column>
                              <el-table-column label="VALUE" min-width="180">
                                <template #default="{ row }">
                                  <el-input v-model="row.value" size="small" placeholder="请输入Value" />
                                </template>
                              </el-table-column>
                              <el-table-column label="操作" width="80" align="center">
                                <template #header>
                                  <el-link type="primary" @click="openBatchEdit">批量编辑</el-link>
                                </template>
                                <template #default="{ $index }">
                                  <el-button link type="danger" size="small" @click="currentGroup.params.splice($index, 1)">
                                    <el-icon><Delete /></el-icon>
                                  </el-button>
                                </template>
                              </el-table-column>
                            </el-table>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="Headers" name="headers">
                          <div class="key-value-table">
                            <el-table :data="currentGroup.headers" size="small" border>
                              <el-table-column label="KEY" min-width="120">
                                <template #header>
                                  <span>KEY</span>
                                  <el-button size="small" class="ml-8" @click="openJsonDialog('headers')">JSON添加</el-button>
                                </template>
                                <template #default="{ row }">
                                  <el-input v-model="row.key" size="small" placeholder="请输入Key" />
                                </template>
                              </el-table-column>
                              <el-table-column label="VALUE" min-width="180">
                                <template #default="{ row }">
                                  <el-input v-model="row.value" size="small" placeholder="请输入Value" />
                                </template>
                              </el-table-column>
                              <el-table-column label="操作" width="80" align="center">
                                <template #header>
                                  <el-link type="primary" @click="openBatchEdit">批量编辑</el-link>
                                </template>
                                <template #default="{ $index }">
                                  <el-button link type="danger" size="small" @click="currentGroup.headers.splice($index, 1)">
                                    <el-icon><Delete /></el-icon>
                                  </el-button>
                                </template>
                              </el-table-column>
                            </el-table>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="Body" name="body">
                          <body-content />
                        </el-tab-pane>
                        <el-tab-pane label="IPPort" name="ipport">
                          <el-form-item label="IP:PORT">
                            <el-input 
                              type="textarea" 
                              :rows="3"
                              placeholder="多个IP:Port请以','分隔"
                            />
                          </el-form-item>
                        </el-tab-pane>
                        <el-tab-pane label="加密" name="encrypt">
                          <div class="placeholder-content">
                            <span>加密配置区域</span>
                          </div>
                        </el-tab-pane>
                      </el-tabs>
                    </el-col>
                    
                    <!-- 右侧：断言模块 -->
                    <el-col :span="13" class="assert-col">
                      <div class="assert-wrapper">
                        <!-- 比对方式 -->
                        <el-form-item label="比对方式：">
                          <el-radio-group v-model="assertForm.compareType">
                            <el-radio label="1">普通</el-radio>
                            <el-radio label="2">A/B</el-radio>
                          </el-radio-group>
                        </el-form-item>
                        
                        <!-- 对比规则 -->
                        <el-form-item>
                          <template #label>
                            <span>对比规则</span>
                            <el-icon class="label-icon"><QuestionFilled /></el-icon>
                            <span>：</span>
                          </template>
                          <el-radio-group v-model="assertForm.compareRule">
                            <el-radio label="1">整体</el-radio>
                            <el-radio label="0">键值</el-radio>
                          </el-radio-group>
                          <el-checkbox v-model="assertForm.isCustomScript" class="ml-16">自定义脚本</el-checkbox>
                        </el-form-item>
                        
                        <!-- 规则形式 -->
                        <el-form-item label="规则形式：">
                          <el-radio-group v-model="assertForm.ruleFormat">
                            <el-radio-button label="text">文本</el-radio-button>
                            <el-radio-button label="jsonpath">JSONPath</el-radio-button>
                          </el-radio-group>
                        </el-form-item>
                        
                        <!-- 排除空值 & 忽略顺序 -->
                        <el-row :gutter="16">
                          <el-col :span="12">
                            <el-form-item label="排除空值：">
                              <el-radio-group v-model="assertForm.ignoreNull">
                                <el-radio label="1">需要</el-radio>
                                <el-radio label="0">不需要</el-radio>
                              </el-radio-group>
                            </el-form-item>
                          </el-col>
                          <el-col :span="12">
                            <el-form-item label="忽略顺序：">
                              <el-radio-group v-model="assertForm.ignoreOrder">
                                <el-radio label="1">需要</el-radio>
                                <el-radio label="0">不需要</el-radio>
                              </el-radio-group>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        
                        <!-- 断言表格 -->
                        <div class="assert-table">
                          <el-table :data="[]" size="small" border>
                            <el-table-column type="selection" width="40" />
                            <el-table-column label="类型" width="100">
                              <template #header>
                                <span>类型</span>
                                <el-icon class="label-icon"><QuestionFilled /></el-icon>
                              </template>
                            </el-table-column>
                            <el-table-column label="字段">
                              <template #header>
                                <span>字段</span>
                                <el-icon class="label-icon"><QuestionFilled /></el-icon>
                              </template>
                            </el-table-column>
                            <el-table-column label="规则" width="120">
                              <template #header>
                                <span>规则</span>
                                <el-icon class="label-icon"><QuestionFilled /></el-icon>
                              </template>
                            </el-table-column>
                            <el-table-column label="期望值" min-width="100" show-overflow-tooltip>
                              <template #header>
                                <span>期望值</span>
                                <el-icon class="label-icon"><QuestionFilled /></el-icon>
                              </template>
                            </el-table-column>
                            <el-table-column label="备注" width="80" />
                            <el-table-column label="提取变量" width="90" />
                            <el-table-column label="操作" width="120" align="center">
                              <template #header>
                                <el-icon class="add-icon"><Plus /></el-icon>
                                <el-button size="small" class="ml-4">JSON添加</el-button>
                                <el-button size="small" disabled>批量删除</el-button>
                              </template>
                            </el-table-column>
                          </el-table>
                          <el-empty v-if="true" description="暂无数据" :image-size="64" />
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                </div>  
              </el-tab-pane>
              <el-tab-pane label="预设变量" name="preset">
                <div class="placeholder-content">
                  <span>预设变量配置区域</span>
                </div>
              </el-tab-pane>
              <el-tab-pane label="前置操作" name="pre">
                <div class="placeholder-content">
                  <span>前置操作配置区域</span>
                </div>
              </el-tab-pane>
              <el-tab-pane label="后置操作" name="post">
                <div class="placeholder-content">
                  <span>后置操作配置区域</span>
                </div>
              </el-tab-pane>
              <el-tab-pane label="设置" name="settings">
                <div class="placeholder-content">
                  <span>设置配置区域</span>
                </div>
              </el-tab-pane>
              <el-tab-pane label="网关/登陆" name="gateway">
                <div class="placeholder-content">
                  <span>网关/登陆配置区域</span>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>

      <!-- 第二个容器：响应信息（测试后才显示） -->
      <div v-if="showResponse" class="response-container">
        <div class="section-header">
          <span class="section-title">响应信息区域</span>
        </div>
        <div class="response-tabs">
          <el-tabs v-model="activeResponseTab">
            <el-tab-pane label="响应体" name="body">
              <div class="response-body-container">
                <!-- 响应值 -->
                <div class="response-item">
                  <div class="sub-header">
                    <span class="sub-title">响应值</span>
                  </div>
                  <div class="placeholder-content code-placeholder">
                    <span>实际响应结果展示区域</span>
                  </div>
                </div>
                <!-- 期望值 -->
                <div class="response-item">
                  <div class="sub-header">
                    <span class="sub-title">期望值</span>
                  </div>
                  <div class="placeholder-content code-placeholder">
                    <span>期望响应结果展示区域</span>
                  </div>
                </div>
                <!-- 实际入参 -->
                <div class="response-item">
                  <div class="sub-header">
                    <span class="sub-title">实际入参</span>
                  </div>
                  <div class="placeholder-content code-placeholder">
                    <span>实际请求参数展示区域</span>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="响应头" name="headers">
              <div class="placeholder-content">
                <span>响应头信息展示区域</span>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <!-- 响应元信息 -->
        <div class="response-meta">
          <span class="meta-item">测试站</span>
          <span class="meta-item">键值</span>
          <span class="meta-item">状态码: 200</span>
          <span class="meta-item">响应时间: 435ms</span>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button type="primary">保存并继续</el-button>
        <el-button type="danger" @click="handleTest">测试一下</el-button>
        <span class="footer-tip">(多个IP默认直连调用第一个)</span>
        <el-button>分环境测试</el-button>
      </div>
    </template>
    
    <!-- 重命名弹窗 -->
    <el-dialog
      v-model="renameDialogVisible"
      title="分组名称"
      width="400px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-input 
        v-model="renameForm.name" 
        placeholder="请输入分组名称"
        maxlength="50"
        show-word-limit
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeRenameDialog">取消</el-button>
          <el-button type="primary" @click="confirmRename">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- JSON 添加弹窗 -->
    <json-add-dialog
      v-model="jsonDialogVisible"
      type="params"
      @save="handleJsonSave"
    />
    
    <!-- 批量编辑弹窗 -->
    <batch-edit-dialog
      v-model="batchEditVisible"
      @save="handleBatchEditSave"
    />
  </el-drawer>
</template>

<style scoped>
/* 头部样式 */
.drawer-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.close-btn {
  font-size: 18px;
  color: #606266;
}

.close-btn:hover {
  color: #409eff;
}

.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-right: auto;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* 主容器 */
.main-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
  padding: 0 20px 20px;
}

/* 折叠面板样式 - 参考 ant-collapse */
.collapse-section {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
}

.collapse-header {
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.collapse-header:hover {
  background: #ebeef5;
}

.collapse-arrow {
  font-size: 14px;
  color: #606266;
  transition: transform 0.3s;
}

.collapse-arrow.is-active {
  transform: rotate(90deg);
}

.collapse-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.collapse-content {
  padding: 16px;
}

/* 基础信息表单 */
.basic-form :deep(.el-form-item__label) {
  padding-bottom: 4px;
  font-size: 13px;
  color: #606266;
}

.basic-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.basic-form :deep(.el-form-item.is-required .el-form-item__label:before) {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.label-icon {
  font-size: 12px;
  color: #2695F1;
  margin-left: 4px;
  cursor: help;
  vertical-align: middle;
}

.label-icon.link {
  cursor: pointer;
}

/* URL输入组 */
.url-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}

.method-select {
  width: 90px !important;
  flex-shrink: 0;
}

.method-select :deep(.el-input__wrapper) {
  border-radius: 4px 0 0 4px !important;
}

/* HTTP方法颜色 - 选择框中选中的值 */
.method-select.color-GET :deep(.el-input__inner),
.method-select.color-GET :deep(.el-select__selected-item) {
  color: #007F31 !important;
}

.method-select.color-POST :deep(.el-input__inner),
.method-select.color-POST :deep(.el-select__selected-item) {
  color: #AD7A03 !important;
}

.method-select.color-PUT :deep(.el-input__inner),
.method-select.color-PUT :deep(.el-select__selected-item) {
  color: #0053B8 !important;
}

.method-select.color-PATCH :deep(.el-input__inner),
.method-select.color-PATCH :deep(.el-select__selected-item) {
  color: #623497 !important;
}

.method-select.color-DELETE :deep(.el-input__inner),
.method-select.color-DELETE :deep(.el-select__selected-item) {
  color: #8E1A10 !important;
}

/* HTTP方法下拉选项颜色 */
.method-option.color-GET {
  color: #007F31;
}

.method-option.color-POST {
  color: #AD7A03;
}

.method-option.color-PUT {
  color: #0053B8;
}

.method-option.color-PATCH {
  color: #623497;
}

.method-option.color-DELETE {
  color: #8E1A10;
}

.curl-parser-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
}

.curl-parser-wrapper :deep(.curl-input) {
  border-radius: 0 !important;
  border-left: none !important;
  height: 32px;
}

.curl-parser-wrapper :deep(.input-wrapper) {
  width: 100%;
}

/* 更多链接 */
.more-link {
  margin-top: 8px;
}

/* 详细信息区域 */
.detail-content {
  padding: 0;
}

.detail-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 16px;
}

.detail-tabs :deep(.el-tabs__content) {
  padding: 16px;
}

/* 入参/断言布局 */
.input-assert-wrapper {
  display: flex;
  flex-direction: column;
}

/* 组选择器 */
.group-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.help-icon {
  font-size: 14px;
  color: #2695F1;
  cursor: help;
}

.group-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  white-space: nowrap;
  border-radius: 5px;
}

.group-item-wrapper {
  display: inline-flex;
}

/* 按钮组样式 */
.group-button-group {
  display: flex;
}

.group-button-group :deep(.el-button) {
  margin: 0;
}

/* 组名按钮 */
.group-name-btn {
  padding: 5px 12px;
  height: 32px;
}

.group-name-btn :deep(.el-checkbox__label) {
  padding-left: 4px;
}

/* 更多按钮 */
.group-more-btn {
  padding: 5px 8px;
  height: 32px;
}

/* 选中状态 - 覆盖按钮组边框 */
.group-item-wrapper.active .group-name-btn {
  border-color: #409eff;
  background: #ecf5ff;
  color: #409eff;
}

.group-item-wrapper.active .group-name-btn :deep(.el-checkbox__label) {
  color: #409eff;
}

.group-item-wrapper.active .group-more-btn {
  border-color: #409eff;
  background: #ecf5ff;
  color: #409eff;
}

/* 重命名弹窗 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 入参/断言行 */
.input-assert-row {
  display: flex;
}

.request-params-col {
  padding-right: 8px;
}

.params-tabs {
  border-radius: 12px;
  overflow: hidden;
}

.params-tabs :deep(.el-tabs__header) {
  padding: 0;
}

.params-tabs :deep(.el-tabs__content) {
  padding: 0;
}

/* ==================== Request Body Tabs 样式 ==================== */
.request-body-tabs {
  width: 100%;
}

/* 键值表格 */
.key-value-table {
  width: 100%;
}

.key-value-table :deep(.el-table__header th) {
  background: #fafafa;
}

.ml-8 {
  margin-left: 8px;
}

.ml-4 {
  margin-left: 4px;
}

.ml-16 {
  margin-left: 16px;
}

/* 断言区域 */
.assert-col {
  border-left: 1px solid rgba(0, 0, 0, 0.06);
  padding-left: 16px;
}

.assert-wrapper :deep(.el-form-item) {
  margin-bottom: 8px;
}

.assert-wrapper :deep(.el-form-item__label) {
  font-size: 13px;
  color: #606266;
}

/* 断言表格 */
.assert-table {
  margin-top: 16px;
}

.add-icon {
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
}

/* 空状态 */
.empty-body {
  padding: 40px 0;
}

/* 占位符内容 */
.placeholder-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: #909399;
  font-size: 14px;
  padding: 20px;
}

.code-placeholder {
  min-height: 200px;
  background: #f8f9fa;
  font-family: monospace;
}

/* 请求信息容器 */
.request-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 响应信息容器 */
.response-container {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  position: relative;
}

.section-header {
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.response-tabs {
  padding: 16px;
}

.response-body-container {
  display: flex;
  gap: 16px;
}

.response-item {
  flex: 1;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  
}

.sub-header {
  padding: 8px 12px;
  border-bottom: 1px dashed #dcdfe6;
  background: #fafafa;
  border-radius: 6px 6px 0 0;
  text-align: center;
}

.sub-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

/* 响应元信息 */
.response-meta {
  position: absolute;
  top: 12px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.response-meta .meta-item {
  font-size: 12px;
  color: #606266;
  padding: 2px 8px;
  background: #f0f2f5;
  border-radius: 4px;
}

/* 底部操作栏 */
.drawer-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-tip {
  font-size: 13px;
  color: #999;
}

/* 工具类 */
.w-100 {
  width: 100% !important;
}

/* 覆盖 Element Plus 默认样式 */
:deep(.el-drawer__body) {
  padding: 0;
  overflow-y: auto;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-drawer__footer) {
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  height: 32px;
}

:deep(.el-textarea__inner) {
  min-height: 32px !important;
}
</style>
