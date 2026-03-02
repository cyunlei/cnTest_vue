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

const quickCards = [
  { 
    title: '快捷调用', 
    icon: '/src/assets/icons/test-mgmt.png',
    color: '#1890ff'
  },
  { 
    title: '用例管理', 
    icon: '/src/assets/icons/precise-test.png',
    color: '#52c41a'
  },
  { 
    title: 'JSF Mock', 
    icon: '/src/assets/icons/EasyMock.png',
    color: '#fa8c16'
  },
  { 
    title: '流量回放', 
    icon: '/src/assets/icons/pipeline.png',
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
  padding: 20px 24px;
}

.main-content {
  display: flex;
  gap: 20px;
  max-width: 1440px;
  margin: 0 auto;
}

.content-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-right {
  width: 320px;
  flex-shrink: 0;
}

/* 常用功能 */
.quick-access {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e8e8e8;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* 最近活跃 */
.recent-section {
  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .tab-btn {
    padding: 6px 16px;
    border: none;
    background: transparent;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: #f5f5f5;
    }

    &.active {
      color: #1890ff;
      background: #e6f7ff;
      font-weight: 500;
    }
  }
}

/* 响应式 */
@media (max-width: 1200px) {
  .content-right {
    width: 280px;
  }

  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
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

@media (max-width: 768px) {
  .dashboard-main {
    padding: 16px;
  }

  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
