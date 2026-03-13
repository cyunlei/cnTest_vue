<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppHeader from '@/shared/ui/organisms/AppHeader.vue'
import HttpStepDrawer from '../components/HttpStepDrawer.vue'

// 更多步骤类型组件
import HttpStepType from '../components/step-types/HttpStepType.vue'
import MysqlStepType from '../components/step-types/MysqlStepType.vue'
import RedisStepType from '../components/step-types/RedisStepType.vue'
import JmqStepType from '../components/step-types/JmqStepType.vue'
import DubboStepType from '../components/step-types/DubboStepType.vue'
import KafkaStepType from '../components/step-types/KafkaStepType.vue'
import R2mStepType from '../components/step-types/R2mStepType.vue'
import FmqStepType from '../components/step-types/FmqStepType.vue'
import JarStepType from '../components/step-types/JarStepType.vue'
import ShellStepType from '../components/step-types/ShellStepType.vue'
import LoopStepType from '../components/step-types/LoopStepType.vue'
import ConditionStepType from '../components/step-types/ConditionStepType.vue'
import StardbStepType from '../components/step-types/StardbStepType.vue'
import ScheduleJobStepType from '../components/step-types/ScheduleJobStepType.vue'

const route = useRoute()
const router = useRouter()
const caseId = computed(() => route.params.id)

const activeTab = ref('scenario')
const caseDetail = ref({
  id: caseId.value || '6426940',
  name: 'jos授权工具接口返回refreshToken字段',
  caseSet: '授权管理/取消授权',
  owner: '陈云雷',
  createTime: '2026-02-27 10:16:58',
  execSuccess: 0,
  execFail: 0
})

const stepList = ref([
  {
    id: '17742916',
    name: 'jos授权工具接口返回refreshToken字段',
    detail: 'com.jd.open.oauth.rpc.JdTokenService',
    type: 'JSF',
    inputGroup: '1/1',
    order: 1
  }
])

const execStrategy = ref('immediate')
const showHttpStepDrawer = ref(false)
const editingHttpStep = ref(null)
const showStepTypeDialog = ref(false)
const selectedStepType = ref(null)

// 更多类型下拉选项（1=MySQL, 2=Redis, 3=JMQ, 4=DUBBO, 5=KAFKA, 6=R2M, 7=FMQ, 8=JAR, 9=SHELL, 10=循环, 11=条件, 12=STARDB, 13=SCHEDULEJOB）
// 注意：HTTP(0)已在外部单独展示，不在下拉框中显示
const stepTypeOptions = [
  { label: 'MySQL', value: 1, type: 'MySQL', component: 'MysqlStepType', desc: 'MySQL查询' },
  { label: 'Redis', value: 2, type: 'Redis', component: 'RedisStepType', desc: 'Redis操作' },
  { label: 'JMQ', value: 3, type: 'JMQ', component: 'JmqStepType', desc: 'JMQ消息' },
  { label: 'DUBBO', value: 4, type: 'DUBBO', component: 'DubboStepType', desc: 'Dubbo调用' },
  { label: 'KAFKA', value: 5, type: 'KAFKA', component: 'KafkaStepType', desc: 'Kafka消息' },
  { label: 'R2M', value: 6, type: 'R2M', component: 'R2mStepType', desc: 'R2M缓存' },
  { label: 'FMQ', value: 7, type: 'FMQ', component: 'FmqStepType', desc: 'FMQ消息' },
  { label: 'JAR', value: 8, type: 'JAR', component: 'JarStepType', desc: 'JAR包执行' },
  { label: 'SHELL', value: 9, type: 'SHELL', component: 'ShellStepType', desc: 'Shell脚本' },
  { label: '循环', value: 10, type: '循环', component: 'LoopStepType', desc: '循环控制' },
  { label: '条件', value: 11, type: '条件', component: 'ConditionStepType', desc: '条件判断' },
  { label: 'STARDB', value: 12, type: 'STARDB', component: 'StardbStepType', desc: 'STARDB数据库' },
  { label: 'SCHEDULEJOB', value: 13, type: 'SCHEDULEJOB', component: 'ScheduleJobStepType', desc: '调度任务' }
]

// 步骤类型映射到组件
const stepTypeComponentMap = {
  'HttpStepType': HttpStepType,
  'MysqlStepType': MysqlStepType,
  'RedisStepType': RedisStepType,
  'JmqStepType': JmqStepType,
  'DubboStepType': DubboStepType,
  'KafkaStepType': KafkaStepType,
  'R2mStepType': R2mStepType,
  'FmqStepType': FmqStepType,
  'JarStepType': JarStepType,
  'ShellStepType': ShellStepType,
  'LoopStepType': LoopStepType,
  'ConditionStepType': ConditionStepType,
  'StardbStepType': StardbStepType,
  'ScheduleJobStepType': ScheduleJobStepType
}

function handleNav(path) {
  void path
}

function goBack() {
  router.push('/case-mgmt')
}

function openHttpStepDrawer() {
  editingHttpStep.value = null
  showHttpStepDrawer.value = true
}

function closeHttpStepDrawer() {
  showHttpStepDrawer.value = false
}

function saveHttpStep(stepData) {
  void stepData
  stepList.value.push({
    id: Date.now().toString(),
    name: stepData.name,
    detail: stepData.method + ' | ' + stepData.url,
    type: 'HTTP',
    inputGroup: '1/1',
    order: stepList.value.length + 1,
    httpData: stepData
  })
  closeHttpStepDrawer()
}

function openStepDrawer(step) {
  // 点击任意步骤名称，都打开 HTTP 步骤抽屉
  // 如果是已保存的 HTTP 步骤，优先使用 httpData 回填
  // 否则至少回填步骤名称和 detail（方法 / URL 由用户再补）
  editingHttpStep.value = step.httpData || {
    name: step.name,
    detail: step.detail
  }
  showHttpStepDrawer.value = true
}

// 处理更多类型选择
function handleStepTypeSelect(stepType) {
  const typeOption = stepTypeOptions.find(opt => opt.value === stepType)
  if (!typeOption) return

  // 添加到步骤列表并显示类型对话框
  selectedStepType.value = typeOption
  const newStep = {
    id: Date.now().toString(),
    name: typeOption.label + '步骤',
    detail: typeOption.desc,
    type: typeOption.type,
    inputGroup: '1/1',
    order: stepList.value.length + 1,
    stepData: { type: typeOption.value, component: typeOption.component }
  }
  stepList.value.push(newStep)
  ElMessage.success(`已添加 ${typeOption.label} 步骤`)
}

// 打开步骤类型配置对话框
function openStepTypeDialog(step) {
  selectedStepType.value = stepTypeOptions.find(opt => opt.type === step.type) || null
  showStepTypeDialog.value = true
}

function closeStepTypeDialog() {
  showStepTypeDialog.value = false
  selectedStepType.value = null
}
</script>
<template>
  <div class="case-config-page">
    <AppHeader @navigate="handleNav" />
    <div class="page-container">
      <aside class="sidebar">
        <div class="module-select-wrapper">
          <div class="module-select-trigger">
            <span class="selected-text">商家开放</span>
          </div>
        </div>
        <div class="filter-bar">
          <label class="checkbox-label">
            <input type="checkbox" />
            <span>只看自己</span>
          </label>
        </div>
      </aside>
      <main class="main-content">
        <div class="title-bar">
          <div class="content-tabs">
            <button :class="['tab-btn', { active: activeTab === 'scenario' }]" @click="activeTab = 'scenario'">场景用例</button>
            <button :class="['tab-btn', { active: activeTab === 'atomic' }]" @click="activeTab = 'atomic'">原子用例</button>
          </div>
        </div>
        <div class="config-header">
          <div class="header-left">
            <button class="back-btn" @click="goBack"><span>X</span></button>
            <h3 class="page-title">用例配置</h3>
          </div>
          <div class="header-actions">
            <button class="action-btn">分享</button>
            <button class="action-btn">另存为</button>
            <button class="action-btn primary">设置为原子用例</button>
            <button class="action-btn">执行结果</button>
          </div>
        </div>
        <div class="case-info">
          <div class="info-row">
            <span class="info-label">用例明细:</span>
            <span class="info-value highlight">{{ caseDetail.name }}</span>
            <button class="edit-btn">编辑</button>
          </div>
          <div class="info-grid">
            <div class="info-item"><span class="label">用例ID:</span><span class="value">{{ caseDetail.id }}</span></div>
            <div class="info-item"><span class="label">所属用例集:</span><a class="value link">{{ caseDetail.caseSet }}</a></div>
            <div class="info-item"><span class="label">所属人:</span><span class="value"><span class="user-tag">{{ caseDetail.owner }}</span></span></div>
            <div class="info-item"><span class="label">创建时间:</span><span class="value">{{ caseDetail.createTime }}</span></div>
            <div class="info-item"><span class="label">执行次数:</span><span class="value">成功:{{ caseDetail.execSuccess }}, 失败:<span class="fail">{{ caseDetail.execFail }}</span></span></div>
          </div>
        </div>
        <div class="toolbar-section">
          <div class="toolbar-left">
            <span class="toolbar-label">添加:</span>
            <button class="tool-btn">JSF</button>
            <button class="tool-btn primary" @click="openHttpStepDrawer">HTTP</button>
            <el-dropdown trigger="hover" @command="handleStepTypeSelect">
              <button class="tool-btn">更多类型</button>
              <template #dropdown>
                <el-dropdown-menu class="step-type-dropdown">
                  <el-dropdown-item
                    v-for="opt in stepTypeOptions"
                    :key="opt.value"
                    :command="opt.value"
                    class="step-type-item"
                  >
                    <span class="step-type-label">{{ opt.label }}</span>
                    <span class="step-type-desc">{{ opt.desc }}</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <button class="tool-btn">导入</button>
            <button class="tool-btn">测试物料</button>
            <button class="tool-btn">接口录制</button>
          </div>
          <div class="toolbar-right">
            <button class="tool-btn">前置步骤</button>
            <button class="tool-btn">后置步骤</button>
            <button class="tool-btn">预设变量</button>
            <button class="tool-btn">批量操作</button>
          </div>
        </div>
        <div class="step-table">
          <table>
            <thead>
              <tr>
                <th class="col-checkbox"><input type="checkbox" /></th>
                <th class="col-id">步骤编号</th>
                <th class="col-name">步骤名称</th>
                <th class="col-detail">详细内容</th>
                <th class="col-type">类型</th>
                <th class="col-group">入参分组</th>
                <th class="col-order">顺序</th>
                <th class="col-action">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="step in stepList" :key="step.id">
                <td class="col-checkbox"><input type="checkbox" /></td>
                <td class="col-id">{{ step.id }}</td>
                <td class="col-name"><a class="link" @click="openStepDrawer(step)">{{ step.name }}</a></td>
                <td class="col-detail">{{ step.detail }}</td>
                <td class="col-type"><span class="type-tag jsf">{{ step.type }}</span></td>
                <td class="col-group">{{ step.inputGroup }}</td>
                <td class="col-order">{{ step.order }}</td>
                <td class="col-action"><button class="action-icon">复制</button><button class="action-icon">执行</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="exec-strategy">
          <h4 class="strategy-title">执行策略</h4>
          <div class="strategy-form">
            <span class="required">*</span>
            <span class="label">执行策略</span>
            <label class="radio-item"><input type="radio" v-model="execStrategy" value="immediate" /><span>立即执行</span></label>
            <label class="radio-item"><input type="radio" v-model="execStrategy" value="periodic" /><span>周期执行</span></label>
          </div>
        </div>
      </main>
    </div>
    <HttpStepDrawer :visible="showHttpStepDrawer" :step="editingHttpStep" @close="closeHttpStepDrawer" @save="saveHttpStep" />

    <!-- 步骤类型配置对话框 -->
    <el-dialog
      v-model="showStepTypeDialog"
      :title="selectedStepType?.label + ' 步骤配置'"
      width="80%"
      :close-on-click-modal="false"
      destroy-on-close
      @close="closeStepTypeDialog"
    >
      <div class="step-type-dialog-content">
        <component
          v-if="selectedStepType"
          :is="stepTypeComponentMap[selectedStepType.component]"
          :title="selectedStepType.label + ' 步骤'"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeStepTypeDialog">取消</el-button>
          <el-button type="primary" @click="closeStepTypeDialog">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<style scoped>
.case-config-page { min-height: 100vh; background: #f5f5f5; }
.page-container { display: flex; height: calc(100vh - 56px); }
.sidebar { width: 260px; background: #fff; border-right: 1px solid #e8e8e8; padding: 12px; overflow-y: auto; }
.module-select-trigger { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 8px; cursor: pointer; background: #fff; margin-bottom: 12px; }
.filter-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #666; cursor: pointer; }
.main-content { flex: 1; padding: 16px; overflow-y: auto; }
.title-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
.content-tabs { display: flex; gap: 4px; }
.tab-btn { padding: 8px 16px; border: none; background: transparent; font-size: 15px; color: #666; cursor: pointer; border-radius: 4px; }
.tab-btn:hover { color: #1890ff; }
.tab-btn.active { color: #1890ff; font-weight: 500; background: #e6f7ff; }
.config-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 12px 16px; background: #fff; border-radius: 8px; }
.header-left { display: flex; align-items: center; gap: 12px; }
.back-btn { width: 32px; height: 32px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.page-title { font-size: 16px; font-weight: 600; margin: 0; color: #333; }
.header-actions { display: flex; gap: 8px; }
.action-btn { padding: 6px 16px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 14px; cursor: pointer; color: #666; }
.action-btn:hover { border-color: #1890ff; color: #1890ff; }
.action-btn.primary { background: #1890ff; color: #fff; border-color: #1890ff; }
.case-info { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.info-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.info-label { font-size: 14px; color: #333; font-weight: 500; }
.info-value { font-size: 14px; color: #333; }
.info-value.highlight { background: #fff7e6; padding: 4px 8px; border-radius: 4px; }
.edit-btn { padding: 2px 8px; border: none; background: transparent; color: #1890ff; cursor: pointer; font-size: 13px; }
.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.info-item { display: flex; gap: 8px; font-size: 14px; }
.info-item .label { color: #999; }
.info-item .value { color: #333; }
.link { color: #1890ff; text-decoration: none; cursor: pointer; }
.user-tag { display: inline-flex; align-items: center; gap: 4px; color: #1890ff; }
.fail { color: #f5222d; }
.toolbar-section { display: flex; align-items: center; justify-content: space-between; background: #e6f7ff; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
.toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 8px; }
.toolbar-label { font-size: 14px; color: #333; }
.tool-btn { padding: 6px 16px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 14px; cursor: pointer; color: #333; outline: none; }
.tool-btn:hover { border-color: #1890ff; color: #1890ff; }
.tool-btn:focus { outline: none; }
.tool-btn.primary { background: #1890ff; color: #fff; border-color: #1890ff; }
.step-table { background: #fff; border-radius: 8px; overflow: auto; margin-bottom: 16px; }
.step-table table { width: 100%; border-collapse: collapse; font-size: 14px; }
.step-table th, .step-table td { padding: 12px; text-align: left; border-bottom: 1px solid #f0f0f0; }
.step-table th { background: #fafafa; font-weight: 500; color: #666; }
.type-tag { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.type-tag.jsf { background: #f6ffed; color: #52c41a; }
.type-tag.HTTP { background: #e6f7ff; color: #1890ff; }
.type-tag.MySQL { background: #fff7e6; color: #fa8c16; }
.type-tag.Redis { background: #fff1f0; color: #ff4d4f; }
.type-tag.JMQ { background: #f6ffed; color: #52c41a; }
.type-tag.DUBBO { background: #e6fffb; color: #13c2c2; }
.type-tag.KAFKA { background: #f9f0ff; color: #722ed1; }
.type-tag.R2M { background: #fff0f6; color: #eb2f96; }
.type-tag.FMQ { background: #f0f5ff; color: #2f54eb; }
.type-tag.JAR { background: #e6f7ff; color: #096dd9; }
.type-tag.SHELL { background: #f0f0f0; color: #595959; }
.type-tag.循环 { background: #fff2e8; color: #fa541c; }
.type-tag.条件 { background: #e6fffb; color: #08979c; }
.type-tag.STARDB { background: #f0f5ff; color: #1d39c4; }
.type-tag.SCHEDULEJOB { background: #fff7e6; color: #d48806; }
.action-icon { padding: 4px 8px; border: none; background: transparent; color: #1890ff; cursor: pointer; font-size: 13px; }
.exec-strategy { background: #fff; border-radius: 8px; padding: 16px; }
.strategy-title { font-size: 14px; font-weight: 500; color: #333; margin: 0 0 12px 0; }
.strategy-form { display: flex; align-items: center; gap: 12px; }
.strategy-form .required { color: #f5222d; }
.radio-item { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; }

/* 步骤类型下拉菜单样式 */
.step-type-dropdown {
  max-height: 400px;
  overflow-y: auto;
}

.step-type-dropdown :deep(.el-dropdown-menu__list) {
  padding: 4px;
}

.step-type-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  min-width: 180px;
}

.step-type-item:hover {
  background-color: #f5f7fa;
}

.step-type-label {
  font-weight: 500;
  color: #303133;
  min-width: 60px;
}

.step-type-desc {
  font-size: 12px;
  color: #909399;
}

/* 步骤类型对话框内容 */
.step-type-dialog-content {
  padding: 20px;
  min-height: 300px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Element Plus 下拉菜单覆盖样式 */
:deep(.el-dropdown) {
  vertical-align: middle;
}
</style>