<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 50 },
  total: { type: Number, default: 0 },
  pageSizeOptions: {
    type: Array,
    default: () => [20, 50, 100]
  }
})

const emit = defineEmits(['page-change', 'page-size-change'])

const totalPages = computed(() => {
  if (!props.pageSize || props.pageSize <= 0) return 1
  return Math.max(1, Math.ceil(props.total / props.pageSize))
})

const pageInfoText = computed(() => {
  if (props.total === 0) return '第 0-0 条 / 总共 0 条'
  const start = (props.currentPage - 1) * props.pageSize + 1
  const end = Math.min(props.currentPage * props.pageSize, props.total)
  return `第 ${start}-${end} 条 / 总共 ${props.total} 条`
})

const paginationItems = computed(() => {
  const total = totalPages.value
  const current = props.currentPage
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }
  return [1, '...', current - 1, current, current + 1, '...', total]
})

function onPageChange(page) {
  if (!Number.isFinite(page) || page < 1 || page > totalPages.value) return
  if (page === props.currentPage) return
  emit('page-change', page)
}

function onPageSizeChange(event) {
  const nextSize = Number(event.target.value)
  if (!Number.isFinite(nextSize) || nextSize <= 0 || nextSize === props.pageSize) return
  emit('page-size-change', nextSize)
}
</script>

<template>
  <div class="app-pagination">
    <span>{{ pageInfoText }}</span>
    <div class="page-btns">
      <button class="page-btn" :disabled="currentPage <= 1" @click="onPageChange(currentPage - 1)">‹</button>
      <template v-for="item in paginationItems" :key="`p-${item}`">
        <span v-if="item === '...'" class="page-ellipsis">...</span>
        <button
          v-else
          class="page-btn"
          :class="{ active: Number(item) === currentPage }"
          @click="onPageChange(Number(item))"
        >
          {{ item }}
        </button>
      </template>
      <button class="page-btn" :disabled="currentPage >= totalPages" @click="onPageChange(currentPage + 1)">›</button>
    </div>
    <select class="page-size" :value="pageSize" @change="onPageSizeChange">
      <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }} 条/页</option>
    </select>
  </div>
</template>

<style scoped>
.app-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
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
}

.page-btn.active {
  background: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-ellipsis {
  display: inline-flex;
  align-items: center;
  padding: 0 4px;
  color: #999;
}

.page-size {
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}
</style>

