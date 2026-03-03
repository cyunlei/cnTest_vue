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
    default: ''
  },
  iconType: {
    type: String,
    default: 'img' // 'img' | 'svg'
  },
  svgPath: {
    type: String,
    default: ''
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
      <!-- SVG图标 -->
      <svg v-if="iconType === 'svg'" viewBox="0 0 1024 1024" width="48" height="48" :fill="color">
        <path :d="svgPath" />
      </svg>
      <!-- 图片图标 -->
      <img v-else :src="icon" :alt="title" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.quick-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 0;

  &:hover {
    border-color: var(--card-color, #1890ff);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-action {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--card-color, #1890ff);

  .arrow {
    transition: transform 0.2s;
    flex-shrink: 0;
  }
}

.quick-card:hover .arrow {
  transform: translateX(4px);
}

.card-icon {
  width: 12.5px;
  height: 10.4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 8px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  svg {
    width: 40px;
    height: 40px;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .quick-card {
    padding: 10px 12px;
  }

  .card-title {
    font-size: 13px;
  }

  .card-icon {
    width: 36px;
    height: 36px;

    svg {
      width: 32px;
      height: 32px;
    }
  }
}

/* 高DPI缩放适配 */
@media (-webkit-min-device-pixel-ratio: 1.25), (min-resolution: 120dpi) {
  .quick-card {
    padding: 10px 14px;
  }

  .card-icon {
    width: 40px;
    height: 40px;

    svg {
      width: 36px;
      height: 36px;
    }
  }
}
</style>
