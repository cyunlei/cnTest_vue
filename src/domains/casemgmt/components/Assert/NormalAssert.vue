<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessageBox } from 'element-plus'

interface AssertForm {
  compareType: string
  compareRule: string
  ruleFormat: string
  textContent?: string
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

const showRuleFormat = computed(() => isNormal.value && isKeyValue.value)
const showTextInput = computed(() => {
  if (!isNormal.value) return true
  if (isOverall.value) return true
  if (isScript.value) return true
  // 键值模式：仅当规则形式=文本时展示文本输入
  return isKeyValue.value && String(localRuleFormat.value) === 'text'
})

const wantJsonPath = computed(() => isNormal.value && isKeyValue.value && String(localRuleFormat.value) === 'jsonpath')

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
      <el-radio-group v-model="form.compareRule">
        <el-radio value="overall">整体</el-radio>
        <el-radio value="key">键值</el-radio>
        <el-radio v-if="isNormal" value="script">自定义脚本</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 规则形式 -->
    <el-form-item v-if="showRuleFormat" label="规则形式：">
      <el-radio-group :model-value="localRuleFormat" @change="(v) => setRuleFormat(String(v) as any)">
        <el-radio value="text">文本</el-radio>
        <el-radio value="jsonpath">JSONPath</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 文本输入区（整体 / 键值-文本 / 自定义脚本） -->
    <div v-if="showTextInput" class="assert-text-area">
      <el-input
        v-model="form.textContent"
        type="textarea"
        :rows="8"
        resize="none"
        placeholder="请输入内容"
      />
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

.assert-tooltip-text {
  max-width: 180px;
  white-space: normal;
  word-break: break-all;
}

.label-icon {
  font-size: 14px;
  color: #1890ff;
  cursor: pointer;
  margin-left: 4px;
}
</style>
