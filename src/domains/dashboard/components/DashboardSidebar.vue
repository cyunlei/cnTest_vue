<script setup>
/**
 * 工作台右侧边栏组件
 * 位置: domains/dashboard/components/
 * 包含: 统计数据、公告中心、常见问题、常用平台
 */
const emit = defineEmits(['platformClick'])

const stats = [
  { title: '我的用例', value: '271', icon: 'case' },
  { title: '我的任务', value: '3', icon: 'task' },
  { title: '我的接口', value: '67', icon: 'api' }
]

const notices = [
  { title: '【Mock管理】全新升级，新版服...', date: '2023-09-26' },
  { title: 'DeepTest接口自动化测试平台202...', date: '2022-09-27' },
  { title: '新版本《工作台》发布', date: '2022-08-25' },
  { title: '新版本《用例多环境执行》', date: '2022-06-27' }
]

const faqs = [
  '入参示例（函数/全局变量）',
  'HTTP接口流量录制回放',
  'CRON表达式',
  '变量模版引用设置',
  'Mock服务的创建及使用'
]

const platforms = [
  { name: '测试管理', icon: 'test-mgmt.png' },
  { name: '行云部署', icon: 'cloud-deploy.png' },
  { name: '流水线', icon: 'pipeline.png' },
  { name: 'Eone', icon: 'Eone.png' },
  { name: 'Dashboard', icon: 'dashboard.png' },
  { name: 'XBP', icon: 'xbp.png' }
]

function handlePlatformClick(platform) {
  emit('platformClick', platform)
}
</script>

<template>
  <aside class="dashboard-sidebar">
    <!-- 统计卡片 -->
    <div class="stats-section">
      <div v-for="stat in stats" :key="stat.title" class="stat-card">
        <div class="stat-title">{{ stat.title }}</div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-icon">
          <svg v-if="stat.icon === 'case'" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <svg v-else-if="stat.icon === 'task'" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 9h10.5v3.5H4V9zm0 5.5h10.5V18H4v-3.5zM20 18h-3.5V9H20v9z"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- 公告中心 -->
    <div class="section">
      <h4 class="section-title">公告中心</h4>
      <ul class="notice-list">
        <li v-for="notice in notices" :key="notice.title" class="notice-item">
          <a href="javascript:;" class="notice-title">{{ notice.title }}</a>
          <span class="notice-date">{{ notice.date }}</span>
        </li>
      </ul>
    </div>

    <!-- 常见问题 -->
    <div class="section">
      <div class="section-header">
        <h4 class="section-title">常见问题</h4>
        <a href="javascript:;" class="help-link">帮助中心</a>
      </div>
      <ul class="faq-list">
        <li v-for="faq in faqs" :key="faq" class="faq-item">
          <a href="javascript:;">{{ faq }}</a>
        </li>
      </ul>
    </div>

    <!-- 常用平台 -->
    <div class="section">
      <h4 class="section-title">常用平台</h4>
      <div class="platform-grid">
        <div 
          v-for="platform in platforms" 
          :key="platform.name" 
          class="platform-item"
          @click="handlePlatformClick(platform)"
        >
          <div class="platform-icon">
            <img :src="`/src/assets/icons/${platform.icon}`" :alt="platform.name" />
          </div>
          <span class="platform-name">{{ platform.name }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 统计卡片 */
.stats-section {
  display: flex;
  gap: 8px;
}

.stat-card {
  flex: 1;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  position: relative;
  min-width: 0;

  .stat-title {
    font-size: 11px;
    color: #666;
    margin-bottom: 6px;
    white-space: nowrap;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .stat-icon {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #d9d9d9;
  }
}

/* 通用区块 */
.section {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  padding: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 10px 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  .section-title {
    margin: 0;
  }
}

/* 公告列表 */
.notice-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.notice-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.notice-title {
  flex: 1;
  font-size: 12px;
  color: #666;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;

  &:hover {
    color: #1890ff;
  }
}

.notice-date {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
}

/* 帮助链接 */
.help-link {
  font-size: 11px;
  color: #1890ff;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
}

/* 常见问题 */
.faq-list {
  list-style: none;
  margin: 0;
  padding: 10px;
  background: #f6ffed;
  border-radius: 6px;
}

.faq-item {
  padding: 4px 0;
  font-size: 12px;

  a {
    color: #666;
    text-decoration: none;

    &:hover {
      color: #1890ff;
    }
  }

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }
}

/* 常用平台 */
.platform-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.platform-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f5f5f5;
  }
}

.platform-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.platform-name {
  font-size: 11px;
  color: #666;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* 响应式 */
@media (max-width: 1100px) {
  .stats-section {
    flex-wrap: wrap;
  }

  .stat-card {
    min-width: calc(50% - 4px);
  }

  .platform-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .stats-section {
    flex-direction: row;
  }

  .stat-card {
    min-width: 0;
  }

  .platform-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 高DPI缩放适配 */
@media (-webkit-min-device-pixel-ratio: 1.25), (min-resolution: 120dpi) {
  .stat-card {
    padding: 10px;
  }

  .stat-value {
    font-size: 18px;
  }

  .section {
    padding: 10px;
  }
}
</style>
