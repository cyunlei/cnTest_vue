<script setup>
/**
 * 常用功能卡片组件
 * 位置: domains/dashboard/components/ (领域组件层)
 */
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#1890ff'
  }
})

const emit = defineEmits(['click'])

function handleClick() {
  emit('click')
}
</script>

<template>
  <div class="quick-card" :style="{ '--card-color': color }" @click="handleClick">
    <div class="card-content">
      <div class="card-title">{{ title }}</div>
      <div class="card-action">
        <span>去使用</span>
        <svg class="arrow" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
      </div>
    </div>
    <div class="card-icon">
      <img :src="icon" :alt="title" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.quick-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--card-color, #1890ff);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.card-action {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--card-color, #1890ff);

  .arrow {
    transition: transform 0.2s;
  }
}

.quick-card:hover .arrow {
  transform: translateX(4px);
}

.card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>
