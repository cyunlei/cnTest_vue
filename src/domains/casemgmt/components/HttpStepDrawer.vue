<script setup>
/**
 * HTTP 测试步骤抽屉 - 布局重构版
 */
import { ref, computed } from 'vue'
import { Close, Plus, Delete, ArrowRight, More, ArrowDown, ArrowUp, QuestionFilled, Link } from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'save'])

// 折叠面板状态
const basicExpanded = ref(true)
const detailExpanded = ref(true)

// 响应区域显示状态
const showResponse = ref(false)

// 详细信息Tab
const activeDetailTab = ref('input')

// 入参/断言子Tab
const activeInputTab = ref('params')

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

// 切换详细信息展开/收起
function toggleDetail() {
  detailExpanded.value = !detailExpanded.value
}

// 测试一下
function handleTest() {
  showResponse.value = true
}
</script>

<template>
  <el-drawer
    v-model="props.visible"
    size="95%"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <!-- 头部 -->
    <template #header>
      <div class="drawer-header">
        <el-button link :icon="Close" @click="handleClose" class="close-btn" />
        <span class="drawer-title">接口用例配置</span>
        <el-button size="small">分享</el-button>
        <el-button size="small">另存为</el-button>
      </div>
    </template>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 第一个容器：请求信息 -->
      <div class="request-container">
        <!-- 基础信息 -->
        <div class="basic-section section-box">
          <div class="section-header clickable" @click="toggleBasic">
            <el-icon class="expand-icon">
              <ArrowRight v-if="!basicExpanded" />
              <ArrowDown v-else />
            </el-icon>
            <span class="section-title">基础信息</span>
          </div>
          <div v-show="basicExpanded" class="section-content">
            <!-- 第一排：名称、接口所属模块、接口地址 -->
            <div class="form-row row-3-cols">
              <div class="form-item">
                <label class="form-label">名称 <span class="required">*</span></label>
                <el-input v-model="basicForm.name" placeholder="请输入名称" />
              </div>
              <div class="form-item">
                <label class="form-label">接口所属模块 <span class="required">*</span></label>
                <el-select v-model="basicForm.module" class="w-100">
                  <el-option
                    v-for="opt in moduleOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </div>
              <div class="form-item url-item">
                <label class="form-label">接口地址 <el-icon class="help-icon"><QuestionFilled /></el-icon></label>
                <div class="url-input-group">
                  <el-select v-model="basicForm.method" class="method-select">
                    <el-option
                      v-for="opt in methodOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                  <el-input v-model="basicForm.url" placeholder="请选择接口地址，支持输入，支持CURL命令" class="url-input" />
                  <el-button class="btn-enter">
                    <el-icon><ArrowRight /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
            
            <!-- 第二排：特性环境、步骤描述、预期结果描述、Jdos应用 -->
            <div class="form-row row-4-cols">
              <div class="form-item">
                <label class="form-label">特性环境 <el-icon class="help-icon"><QuestionFilled /></el-icon></label>
                <el-input v-model="basicForm.env" placeholder="请选择环境，可输入" />
              </div>
              <div class="form-item">
                <label class="form-label">步骤描述</label>
                <el-input v-model="basicForm.stepDesc" placeholder="步骤描述信息，步骤内容的补充说明" />
              </div>
              <div class="form-item">
                <label class="form-label">预期结果描述 <el-icon class="help-icon"><QuestionFilled /></el-icon></label>
                <el-input v-model="basicForm.expectedResult" placeholder="步骤预期结果描述" />
              </div>
              <div class="form-item">
                <label class="form-label">Jdos应用 <el-icon class="help-icon"><QuestionFilled /></el-icon> <el-icon class="link-icon"><Link /></el-icon></label>
                <el-input v-model="basicForm.jdosApp" placeholder="请输入Jdos应用名称" />
              </div>
            </div>
            
            <!-- 第三排：链路追踪、压测标识 -->
            <div class="form-row switches-row">
              <div class="form-item switch-item">
                <label class="form-label">链路追踪(PFinder)</label>
                <el-switch v-model="basicForm.pfinderEnabled" />
              </div>
              <div class="form-item switch-item">
                <label class="form-label">压测标识(ForceBot)</label>
                <el-switch v-model="basicForm.forcebotEnabled" />
              </div>
            </div>
            
            <!-- 更多信息/隐藏信息链接 -->
            <div class="more-link">
              <el-link type="primary" @click="basicExpanded = false">隐藏信息</el-link>
            </div>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="detail-section section-box">
          <div class="section-header clickable" @click="toggleDetail">
            <el-icon class="expand-icon">
              <ArrowRight v-if="!detailExpanded" />
              <ArrowDown v-else />
            </el-icon>
            <span class="section-title">详细信息</span>
          </div>
          <div v-show="detailExpanded" class="detail-tabs">
            <el-tabs v-model="activeDetailTab">
              <el-tab-pane label="入参/断言" name="input">
                <div class="input-assert-container">
                  <!-- 请求入参 -->
                  <div class="request-params-box sub-box">
                    <div class="sub-header">
                      <span class="sub-title">请求入参</span>
                    </div>
                    <div class="sub-tabs">
                      <el-tabs v-model="activeInputTab" type="border-card">
                        <el-tab-pane label="Params" name="params">
                          <div class="placeholder-content">
                            <span>Params 区域</span>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="Headers" name="headers">
                          <div class="placeholder-content">
                            <span>Headers 区域</span>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="Body" name="body">
                          <div class="placeholder-content">
                            <span>Body 区域</span>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="IPPort" name="ipport">
                          <div class="placeholder-content">
                            <span>IPPort 区域</span>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="加密" name="encrypt">
                          <div class="placeholder-content">
                            <span>加密 区域</span>
                          </div>
                        </el-tab-pane>
                      </el-tabs>
                    </div>
                  </div>
                  <!-- 断言模块 -->
                  <div class="assert-box sub-box">
                    <div class="sub-header">
                      <span class="sub-title">断言模块</span>
                    </div>
                    <div class="placeholder-content">
                      <span>比对方式、对比规则、规则形式、排除空值、忽略顺序等</span>
                    </div>
                  </div>
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
      <div v-if="showResponse" class="response-container section-box">
        <div class="section-header">
          <span class="section-title">响应信息区域</span>
        </div>
        <div class="response-tabs">
          <el-tabs v-model="activeResponseTab">
            <el-tab-pane label="响应体" name="body">
              <div class="response-body-container">
                <!-- 响应值 -->
                <div class="response-item sub-box">
                  <div class="sub-header">
                    <span class="sub-title">响应值</span>
                  </div>
                  <div class="placeholder-content code-placeholder">
                    <span>实际响应结果展示区域</span>
                  </div>
                </div>
                <!-- 期望值 -->
                <div class="response-item sub-box">
                  <div class="sub-header">
                    <span class="sub-title">期望值</span>
                  </div>
                  <div class="placeholder-content code-placeholder">
                    <span>期望响应结果展示区域</span>
                  </div>
                </div>
                <!-- 实际入参 -->
                <div class="response-item sub-box">
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
        <span class="tip">(多个IP默认直连调用第一个)</span>
        <el-button>分环境测试</el-button>
      </div>
    </template>
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

/* 主容器 */
.main-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
  padding: 0 20px 20px;
}

/* 区域盒子通用样式 */
.section-box {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
}

.section-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header.clickable {
  cursor: pointer;
  user-select: none;
}

.section-header.clickable:hover {
  background: #ebeef5;
}

.expand-icon {
  font-size: 14px;
  color: #606266;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.sub-box {
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  margin: 8px;
}

.sub-header {
  padding: 8px 12px;
  border-bottom: 1px dashed #dcdfe6;
  background: #fafafa;
  border-radius: 6px 6px 0 0;
}

.sub-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

/* 占位符内容居中 */
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

/* 基础信息 */
.basic-section {
  flex: 0 0 auto;
}

.basic-section .section-content {
  padding: 16px;
}

/* 表单布局 - 相对布局 */
.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-row:last-child {
  margin-bottom: 0;
}

/* 三列布局：名称(1fr) + 模块(1fr) + 地址(2fr) */
.row-3-cols .form-item {
  flex: 1;
  min-width: 0;
}

.row-3-cols .url-item {
  flex: 2;
  min-width: 0;
}

/* 四列布局：特性环境 + 步骤描述 + 预期结果 + Jdos应用 */
.row-4-cols .form-item {
  flex: 1;
  min-width: 0;
}

.form-label {
  display: block;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.form-label .required {
  color: #f56c6c;
}

.form-label .help-icon,
.form-label .link-icon {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
  cursor: pointer;
}

/* 输入框高度统一为32px */
:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  height: 32px !important;
}

:deep(.el-input__inner) {
  height: 32px !important;
}

/* 下拉选择框宽度100% */
.w-100 {
  width: 100% !important;
}

/* URL输入组 - 相对布局 */
.url-input-group {
  display: flex;
  width: 100%;
}

/* 方法选择框 - 固定宽度100px */
.method-select {
  width: 100px !important;
  flex-shrink: 0;
}

.method-select :deep(.el-input__wrapper) {
  height: 32px !important;
  border-radius: 4px 0 0 4px !important;
}

/* 地址输入框 - 自适应剩余空间 */
.url-input {
  flex: 1;
  min-width: 0;
}

.url-input :deep(.el-input__wrapper) {
  height: 32px !important;
  border-radius: 0 !important;
  border-left: none !important;
}

/* 回车按钮 - 固定宽度46px */
.btn-enter {
  width: 46px !important;
  height: 32px !important;
  padding: 0 !important;
  border-radius: 0 4px 4px 0 !important;
  flex-shrink: 0;
}

/* 开关行 */
.switches-row {
  justify-content: flex-start;
}

.switch-item {
  flex: 0 0 auto;
  width: 200px;
}

/* 更多信息链接 */
.more-link {
  margin-top: 12px;
}

/* 详细信息 */
.detail-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.detail-tabs {
  flex: 1;
  padding: 16px;
}

.detail-tabs :deep(.el-tabs__content) {
  height: calc(100% - 40px);
}

/* 入参断言容器 */
.input-assert-container {
  display: flex;
  gap: 16px;
  height: 100%;
}

.request-params-box {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.request-params-box .sub-tabs {
  flex: 1;
  padding: 8px;
}

.assert-box {
  flex: 1;
}

/* 响应信息容器 */
.response-container {
  flex: 0 0 auto;
  position: relative;
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
}

.response-item .sub-header {
  text-align: center;
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

.tip {
  font-size: 13px;
  color: #999;
}

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
</style>
