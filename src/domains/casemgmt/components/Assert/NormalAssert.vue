<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ScriptStepDrawer from '../steps/ScriptStepDrawer.vue'
import { ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

interface AssertForm {
  compareType: string
  compareRule: string
  ruleFormat: string
  textContent?: string
  ignorePath?: string
  ignoreNull: string
  ignoreOrder: string
}

const props = defineProps<{
  modelValue: AssertForm
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: AssertForm): void
  (e: 'open-group-settings'): void
}>()

const form = computed({
  get: () => props.modelValue,
  set: (v: AssertForm) => emit('update:modelValue', v)
})

const localRuleFormat = ref(form.value.ruleFormat || 'text')
const switching = ref(false)

watch(
  () => form.value.ruleFormat,
  (v) => {
    if (!switching.value) {
      localRuleFormat.value = v || 'text'
    }
  },
  { immediate: true },
)

const isNormal = computed(() => String(form.value.compareType) === '1')
const isAB = computed(() => String(form.value.compareType) === '2')

const isOverall = computed(() => String(form.value.compareRule) === 'overall')
const isKeyValue = computed(() => String(form.value.compareRule) === 'key')
const isScript = computed(() => String(form.value.compareRule) === 'script')

// 自定义脚本复选框状态
const scriptEnabled = computed({
  get: () => isScript.value,
  set: (val: boolean) => {
    if (val) {
      form.value = { ...form.value, compareRule: 'script' }
    } else if (form.value.compareRule === 'script') {
      // 取消勾选脚本时，回退到整体
      form.value = { ...form.value, compareRule: 'overall' }
    }
  }
})

// 自定义脚本编辑块列表（支持多个脚本）
interface ScriptBlock {
  id: number
  code: string
}

const scriptBlocks = ref<ScriptBlock[]>([])

watch(
  () => scriptEnabled.value,
  (val) => {
    if (!val) {
      scriptBlocks.value = []
    }
  }
)

const showRuleFormat = computed(() => isNormal.value && isKeyValue.value)
const showTextInput = computed(() => {
  // A/B 模式不展示大文本输入框
  if (!isNormal.value) return false
  if (isOverall.value) return true
  // 自定义脚本不使用普通文本框，而是使用 ScriptStepDrawer
  if (isScript.value) return false
  // 键值模式：仅当规则形式=文本时展示文本输入
  return isKeyValue.value && String(localRuleFormat.value) === 'text'
})

const wantJsonPath = computed(() => isNormal.value && isKeyValue.value && String(localRuleFormat.value) === 'jsonpath')

const showIgnorePathInput = computed(() => {
  // A/B 模式：不展示大文本框，但保留忽略路径输入框
  if (isAB.value) return true
  if (isScript.value) return false
  if (isOverall.value) return true
  return String(localRuleFormat.value) === 'text'
})

async function setRuleFormat(next: 'text' | 'jsonpath') {
  if (!showRuleFormat.value) return

  const prev = (form.value.ruleFormat || 'text') as 'text' | 'jsonpath'
  if (prev === next) return

  if (next === 'jsonpath') {
    switching.value = true
    localRuleFormat.value = prev
    try {
      await ElMessageBox.confirm(
        '如果您选中JSONPATH方式并保存，会覆盖原有文本内容(JSONPATH为空也会覆盖)。',
        '确认切换为JSONPATH吗？',
        { confirmButtonText: '切换', cancelButtonText: '取消', type: 'warning', distinguishCancelAndClose: true },
      )
      localRuleFormat.value = 'jsonpath'
      form.value = { ...form.value, ruleFormat: 'jsonpath' }
    } catch {
      localRuleFormat.value = prev
    } finally {
      switching.value = false
    }
    return
  }

  localRuleFormat.value = 'text'
  form.value = { ...form.value, ruleFormat: 'text' }
}

function handleCompareTypeChange(val: string) {
  // A/B 模式下：不展示“自定义脚本”与“规则形式”，强制回到整体/键值中的一种
  if (String(val) === '2') {
    const nextRule = form.value.compareRule === 'key' ? 'key' : 'overall'
    form.value = {
      ...form.value,
      compareType: '2',
      compareRule: nextRule,
      ruleFormat: 'text'
    }
    localRuleFormat.value = 'text'
    return
  }

  // 普通模式：若之前不是三态之一，则兜底整体
  const nextRule = ['overall', 'key', 'script'].includes(String(form.value.compareRule))
    ? String(form.value.compareRule)
    : 'overall'
  form.value = { ...form.value, compareType: '1', compareRule: nextRule }
}
</script>

<template>
  <div class="assert-panel">
    <!-- 比对方式 -->
    <el-form-item label="比对方式：">
      <div class="row-inline">
        <el-radio-group v-model="form.compareType" @change="handleCompareTypeChange">
        <el-radio value="1">普通</el-radio>
        <el-radio value="2">A/B</el-radio>
        </el-radio-group>
        <el-button
          v-if="isAB"
          size="small"
          type="primary"
          plain
          class="ab-setting-btn"
          @click="emit('open-group-settings')"
        >
          对比组设置
        </el-button>
      </div>
    </el-form-item>

    <!-- 对比规则 -->
    <el-form-item>
      <template #label>
        <span>对比规则</span>
        <el-tooltip placement="top">
          <template #content>
            <div class="assert-tooltip-text">
              提供三种比对方式。<br />
              整体比对：全部文本进行比对。生效优先级：忽略路径 &gt; JSONPATH &gt; 期望结果文本。<br />
              键值比对：按设置的JSONPATH规则进行比对，其他内容不进行比对。<br />
              自定义脚本：支持通过Groovy、QLExpress两种格式进行脚本编写。
            </div>
          </template>
          <svg
            viewBox="64 64 896 896"
            class="label-icon"
            focusable="false"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
            <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344.3 352 380.7 352 420v7.6c0 4.3 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-24.3 19.7-44 44-44h7.6c22.5 0 39.6 6.5 52.1 18.8 9.8 9.6 15.3 22.7 15.3 36.7 0 14-5.4 27.3-15.3 37.1L527.7 474c-24.5 24.3-40.5 56-44.2 90.1l-3.1 29.2c-.4 4.2 2.9 7.9 7.1 7.9h48.2c4 0 7.4-3 7.9-7l2.5-23.8c2.2-20.7 11.2-40.3 25.4-54.6l39.6-39.2C632.7 353.3 640 334 640 305.4c0-31.7-12.3-61.7-34.4-83.7zM472 664a48 48 0 1096 0 48 48 0 10-96 0z" />
          </svg>
        </el-tooltip>
        <span>：</span>
      </template>
      <div class="rule-row">
        <el-radio-group v-model="form.compareRule">
          <el-radio value="overall">整体</el-radio>
          <el-radio value="key">键值</el-radio>
        </el-radio-group>
        <el-checkbox
          v-if="isNormal"
          v-model="scriptEnabled"
          class="script-checkbox"
        >
          自定义脚本
        </el-checkbox>
      </div>
    </el-form-item>

    <!-- 规则形式 -->
    <el-form-item v-if="showRuleFormat" label="规则形式：">
      <el-radio-group :model-value="localRuleFormat" @change="(v) => setRuleFormat(String(v) as any)">
        <el-radio value="text">文本</el-radio>
        <el-radio value="jsonpath">JSONPath</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 文本输入区（整体 / 键值-文本） -->
    <div v-if="showTextInput" class="assert-text-area">
      <el-input
        v-model="form.textContent"
        type="textarea"
        :rows="8"
        resize="none"
        placeholder="请输入内容"
      />
    </div>

    <div v-if="showIgnorePathInput" class="ignore-path-block">
      <div class="ignore-path-label">
        <span>忽略路径：</span>
        <el-tooltip placement="top">
          <template #content>
            <div class="assert-tooltip-inner">
              支持常规路径(如 parent.child[0])及 JSONPATH (如: $.parent.child[0])两种形式填写，当需要多个时用逗号分隔
            </div>
          </template>
          <svg
            viewBox="64 64 896 896"
            class="label-icon"
            focusable="false"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
            <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344.3 352 380.7 352 420v7.6c0 4.3 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-24.3 19.7-44 44-44h7.6c22.5 0 39.6 6.5 52.1 18.8 9.8 9.6 15.3 22.7 15.3 36.7 0 14-5.4 27.3-15.3 37.1L527.7 474c-24.5 24.3-40.5 56-44.2 90.1l-3.1 29.2c-.4 4.2 2.9 7.9 7.1 7.9h48.2c4 0 7.4-3 7.9-7l2.5-23.8c2.2-20.7 11.2-40.3 25.4-54.6l39.6-39.2C632.7 353.3 640 334 640 305.4c0-31.7-12.3-61.7-34.4-83.7zM472 664a48 48 0 1096 0 48 48 0 10-96 0z" />
          </svg>
        </el-tooltip>
      </div>
      <el-input
        v-model="form.ignorePath"
        class="ignore-path-input"
        type="textarea"
        :rows="1"
        resize="none"
        placeholder="请输入忽略路径，eg：$.code,$.data.list[0].creatTime"
      />
    </div>

    <!-- 自定义脚本：使用 ScriptStepDrawer 作为脚本编辑器 -->
    <div v-if="isScript" class="assert-script-wrapper">
      <el-button
        type="primary"
        size="small"
        class="add-script-btn"
        @click="scriptBlocks.push({ id: Date.now(), code: '' })"
      >
        <el-icon><Plus /></el-icon>
        <span>添加脚本</span>
      </el-button>
      <div
        v-for="(block, idx) in scriptBlocks"
        :key="block.id"
        class="script-block"
      >
        <div class="script-block-header">
          <span class="script-block-title">自定义脚本{{ idx + 1 }}</span>
          <div class="script-block-actions">
            <!-- 复制脚本 -->
            <svg
              viewBox="64 64 896 896"
              class="script-action-icon copy"
              focusable="false"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
              @click.stop="scriptBlocks.splice(idx + 1, 0, { id: Date.now(), code: block.code })"
            >
              <path d="M832 64H296c-17.7 0-32 14.3-32 32v64h-72c-30.9 0-56 25.1-56 56v632c0 30.9 25.1 56 56 56h472c30.9 0 56-25.1 56-56v-64h80c17.7 0 32-14.3 32-32V120c0-30.9-25.1-56-56-56zM664 848H216V248h448v600zm112-120h-56V200c0-30.9-25.1-56-56-56H328v-40h448v624z" />
            </svg>
            <!-- 删除脚本 -->
            <svg
              viewBox="64 64 896 896"
              class="script-action-icon delete"
              focusable="false"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
              @click.stop="scriptBlocks.splice(idx, 1)"
            >
              <path d="M696 480H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z" />
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
            </svg>
          </div>
        </div>
        <ScriptStepDrawer
          v-model="block.code"
          :collapsed="false"
          :index="idx + 1"
          :name="`自定义脚本${idx + 1}`"
          :use-template-mode="true"
        />
      </div>
    </div>

    <!-- 排除空值 & 忽略顺序 -->
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item label="排除空值：">
          <el-radio-group v-model="form.ignoreNull">
            <el-radio value="1">需要</el-radio>
            <el-radio value="0">不需要</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="忽略顺序：">
          <el-radio-group v-model="form.ignoreOrder">
            <el-radio value="1">需要</el-radio>
            <el-radio value="0">不需要</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.assert-panel {
  padding-top: 4px;
}

.rule-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.script-checkbox {
  margin-left: 8px;
}

.row-inline {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ab-setting-btn {
  height: 24px;
  padding: 0 10px;
}

.assert-text-area {
  margin: 8px 0 10px;
}

.ignore-path-input {
  margin-top: 6px;
}

.ignore-path-block {
  margin-top: 10px;
}

.ignore-path-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.assert-script-wrapper {
  margin: 8px 0 10px;
}

.assert-script-wrapper :deep(.script-step__header),
.assert-script-wrapper :deep(.script-step__toolbar) {
  display: none;
}

.assert-script-wrapper :deep(.script-step__body) {
  padding-top: 0;
}

.script-block {
  margin-bottom: 12px;
}

.script-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.script-block-title {
  font-size: 13px;
  color: #606266;
}

.script-block-actions {
  display: inline-flex;
  gap: 8px;
}

.script-action-icon {
  cursor: pointer;
  font-size: 14px;
  color: #1890ff;
}

.script-action-icon.delete {
  color: #ff4d4f;
}

.add-script-btn {
  margin-bottom: 8px;
}

.assert-tooltip-text {
  max-width: 180px;
  white-space: normal;
  word-break: break-all;
}

/* 对齐截图 ant-tooltip-inner 的字体与内边距 */
.assert-tooltip-inner {
  max-width: 250px;
  white-space: normal;
  word-break: break-all;
  font-size: 14px;
  line-height: 22px;
  font-weight: 400;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  /* 只保留外层 tooltip 的单一背景 */
  background: transparent;
  padding: 0;
}

.label-icon {
  font-size: 14px;
  color: #1890ff;
  cursor: pointer;
  margin-left: 4px;
}
</style>
