<script setup>
/**
 * 工作台页面
 * 位置: domains/dashboard/views/ (领域页面层)
 */
import { ref } from 'vue'
import AppHeader from '@/shared/ui/organisms/AppHeader.vue'
import QuickAccessCard from '../components/QuickAccessCard.vue'
import RecentActivityTable from '../components/RecentActivityTable.vue'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import PeriodicTaskSection from '../components/PeriodicTaskSection.vue'

const recentTab = ref('case')

// 使用SVG图标代替图片
const quickCards = [
  { 
    title: '快捷调用', 
    iconType: 'svg',
    svgPath: 'M825.8 498L538.4 249.9c-10.7-9.2-26.4-.9-26.4 14v496.3c0 14.9 15.7 23.2 26.4 14L825.8 526c8.3-7.2 8.3-20.8 0-28zm-320 0L218.4 249.9c-10.7-9.2-26.4-.9-26.4 14v496.3c0 14.9 15.7 23.2 26.4 14L505.8 526c4.1-3.6 6.2-8.8 6.2-14 0-5.2-2.1-10.4-6.2-14z',
    color: '#1890ff'
  },
  { 
    title: '用例管理', 
    iconType: 'svg',
    svgPath: 'M476 399.1c0-3.9-3.1-7.1-7-7.1h-42c-3.8 0-7 3.2-7 7.1V484h-84.5c-4.1 0-7.5 3.1-7.5 7v42c0 3.8 3.4 7 7.5 7H420v84.9c0 3.9 3.2 7.1 7 7.1h42c3.9 0 7-3.2 7-7.1V540h84.5c4.1 0 7.5-3.2 7.5-7v-42c0-3.9-3.4-7-7.5-7H476v-84.9zM560.5 704h-225c-4.1 0-7.5 3.2-7.5 7v42c0 3.8 3.4 7 7.5 7h225c4.1 0 7.5-3.2 7.5-7v-42c0-3.8-3.4-7-7.5-7zm-7.1-502.6c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v704c0 17.7 14.3 32 32 32h512c17.7 0 32-14.3 32-32V397.3c0-8.5-3.4-16.6-9.4-22.6L553.4 201.4zM664 888H232V264h282.2L664 413.8V888zm190.2-581.4L611.3 72.9c-6-5.7-13.9-8.9-22.2-8.9H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h277l219 210.6V824c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V329.6c0-8.7-3.5-17-9.8-23z',
    color: '#52c41a'
  },
  { 
    title: 'Mock', 
    iconType: 'svg',
    svgPath: 'M917.7 148.8l-42.4-42.4c-1.6-1.6-3.6-2.3-5.7-2.3s-4.1.8-5.7 2.3l-76.1 76.1a199.27 199.27 0 00-112.1-34.3c-51.2 0-102.4 19.5-141.5 58.6L432.3 308.7a8.03 8.03 0 000 11.3L704 591.7c1.6 1.6 3.6 2.3 5.7 2.3 2 0 4.1-.8 5.7-2.3l101.9-101.9c68.9-69 77-175.7 24.3-253.5l76.1-76.1c3.1-3.2 3.1-8.3 0-11.4zM769.1 441.7l-59.4 59.4-186.8-186.8 59.4-59.4c24.9-24.9 58.1-38.7 93.4-38.7 35.3 0 68.4 13.7 93.4 38.7 24.9 24.9 38.7 58.1 38.7 93.4 0 35.3-13.8 68.4-38.7 93.4zm-190.2 105a8.03 8.03 0 00-11.3 0L501 613.3 410.7 523l66.7-66.7c3.1-3.1 3.1-8.2 0-11.3L441 408.6a8.03 8.03 0 00-11.3 0L363 475.3l-43-43a7.85 7.85 0 00-5.7-2.3c-2 0-4.1.8-5.7 2.3L206.8 534.2c-68.9 69-77 175.7-24.3 253.5l-76.1 76.1a8.03 8.03 0 000 11.3l42.4 42.4c1.6 1.6 3.6 2.3 5.7 2.3s4.1-.8 5.7-2.3l76.1-76.1c33.7 22.9 72.9 34.3 112.1 34.3 51.2 0 102.4-19.5 141.5-58.6l101.9-101.9c3.1-3.1 3.1-8.2 0-11.3l-43-43 66.7-66.7c3.1-3.1 3.1-8.2 0-11.3l-36.6-36.2zM441.7 769.1a131.32 131.32 0 01-93.4 38.7c-35.3 0-68.4-13.7-93.4-38.7a131.32 131.32 0 01-38.7-93.4c0-35.3 13.7-68.4 38.7-93.4l59.4-59.4 186.8 186.8-59.4 59.4z',
    color: '#fa8c16'
  },
  { 
    title: '流量回放', 
    iconType: 'svg',
    svgPath: 'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z',
    color: '#722ed1'
  }
]

function handleCardClick(card) {
  console.log('Clicked:', card.title)
}

function handleExecute(row) {
  console.log('Execute:', row)
}

function handleViewAll(type) {
  console.log('View all:', type)
}

function handlePlatformClick(platform) {
  console.log('Platform clicked:', platform)
}

function handleNav(path) {
  console.log('Navigate to:', path)
}
</script>

<template>
  <div class="dashboard-page">
    <AppHeader @navigate="handleNav" />
    
    <main class="dashboard-main">
      <div class="main-content">
        <!-- 左侧内容区 -->
        <div class="content-left">
          <!-- 常用功能 -->
          <section class="quick-access">
            <h3 class="section-title">常用功能</h3>
            <div class="cards-grid">
              <QuickAccessCard
                v-for="card in quickCards"
                :key="card.title"
                :title="card.title"
                :icon-type="card.iconType"
                :svg-path="card.svgPath"
                :icon="card.icon"
                :color="card.color"
                @click="handleCardClick(card)"
              />
            </div>
          </section>

          <!-- 最近活跃 -->
          <section class="recent-section">
            <div class="tabs">
              <button 
                :class="['tab-btn', { active: recentTab === 'case' }]"
                @click="recentTab = 'case'"
              >
                用例
              </button>
              <button 
                :class="['tab-btn', { active: recentTab === 'task' }]"
                @click="recentTab = 'task'"
              >
                任务
              </button>
            </div>
            <RecentActivityTable 
              :type="recentTab"
              @execute="handleExecute"
              @view-all="handleViewAll"
            />
          </section>

          <!-- 周期任务 -->
          <PeriodicTaskSection />
        </div>

        <!-- 右侧边栏 -->
        <div class="content-right">
          <DashboardSidebar @platform-click="handlePlatformClick" />
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-main {
  padding: 16px;
}

.main-content {
  display: flex;
  gap: 16px;
  max-width: 1600px;
  margin: 0 auto;
}

.content-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-right {
  width: 300px;
  flex-shrink: 0;
}

/* 常用功能 */
.quick-access {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e8e8e8;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

/* 最近活跃 */
.recent-section {
  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .tab-btn {
    padding: 6px 12px;
    border: none;
    background: transparent;
    font-size: 13px;
    color: #666;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: #1890ff;
    }

    &.active {
      color: #1890ff;
      font-weight: 500;
      background: #e6f7ff;
    }
  }
}

/* 响应式 - 1100px以下 */
@media (max-width: 1100px) {
  .content-right {
    width: 260px;
  }

  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 响应式 - 900px以下 */
@media (max-width: 900px) {
  .main-content {
    flex-direction: column;
  }

  .content-right {
    width: 100%;
  }

  .cards-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 响应式 - 768px以下 */
@media (max-width: 768px) {
  .dashboard-main {
    padding: 12px;
  }

  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 高DPI缩放适配 */
@media (-webkit-min-device-pixel-ratio: 1.25), (min-resolution: 120dpi) {
  .dashboard-main {
    padding: 12px;
  }
  
  .content-right {
    width: 280px;
  }
}
</style>
