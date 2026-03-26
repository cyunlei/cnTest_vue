<script setup>
import { computed, ref } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const props = defineProps({
  startDate: {
    type: String,
    default: ''
  },
  endDate: {
    type: String,
    default: ''
  },
  placeholderStart: {
    type: String,
    default: '开始日期'
  },
  placeholderEnd: {
    type: String,
    default: '结束日期'
  }
})

const emit = defineEmits(['update:startDate', 'update:endDate'])

const pickerRef = ref(null)
function getPanelAnchorDates() {
  const today = new Date()
  const currentMonthFirst = new Date(today.getFullYear(), today.getMonth(), 1)
  const previousMonthFirst = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  return { previousMonthFirst, currentMonthFirst }
}

const defaultPanelDates = (() => {
  const { previousMonthFirst, currentMonthFirst } = getPanelAnchorDates()
  return [previousMonthFirst, currentMonthFirst]
})()
const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 6)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 29)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 89)
      return [start, end]
    }
  }
]

const modelValue = computed({
  get: () => {
    if (!props.startDate || !props.endDate) return []
    return [props.startDate, props.endDate]
  },
  set: value => {
    const [start, end] = Array.isArray(value) ? value : []
    emit('update:startDate', start || '')
    emit('update:endDate', end || '')
  }
})

function openPanel() {
  const picker = pickerRef.value
  if (!picker) return
  if (typeof picker.handleOpen === 'function') {
    picker.handleOpen()
    return
  }
  const rootEl = picker.$el
  const inputEl = rootEl?.querySelector?.('input')
  if (inputEl) {
    inputEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    inputEl.focus()
  }
}
</script>

<template>
  <div class="date-range-trigger" @focusin="openPanel" @mousedown="openPanel">
    <el-config-provider :locale="zhCn">
      <el-date-picker
        ref="pickerRef"
        v-model="modelValue"
        type="daterange"
        range-separator="→"
        :start-placeholder="placeholderStart"
        :end-placeholder="placeholderEnd"
        format="YYYY/MM/DD"
        value-format="YYYY-MM-DD"
        :unlink-panels="true"
        :automatic-dropdown="true"
        :teleported="true"
        :shortcuts="shortcuts"
        :default-value="defaultPanelDates"
        popper-class="plain-date-range-popper"
        @focus="openPanel"
        @click="openPanel"
      />
    </el-config-provider>
  </div>
</template>

<style>
.plain-date-range-popper {
  z-index: 3200 !important;
}

.plain-date-range-popper .el-picker-panel {
  position: relative;
}

.plain-date-range-popper .el-picker-panel__sidebar {
  position: absolute;
  left: 0;
  right: auto;
  bottom: 0;
  top: auto;
  width: 50%;
  height: 44px;
  border-right: none;
  border-top: 1px solid transparent;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
}

.plain-date-range-popper .el-picker-panel__shortcut {
  margin: 0;
  padding: 1px 8px;
  border: 1px solid #91caff;
  border-radius: 4px;
  color: #1677ff;
  line-height: 18px;
  font-size: 12px;
}

.plain-date-range-popper .el-picker-panel__body {
  margin-left: 0 !important;
  padding-bottom: 44px;
}

</style>

