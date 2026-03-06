<script setup>
/**
 * 工作台页面 - Element Plus 重构版
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/shared/ui/organisms/AppHeader.vue'
import { VideoPlay, Document, Link, Clock, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const recentTab = ref('case')

// 快捷卡片数据
const quickCards = [
  { title: '快捷调用', icon: VideoPlay, color: '#1890ff', path: '/quick-call' },
  { title: '用例管理', icon: Document, color: '#52c41a', path: '/case-mgmt' },
  { title: 'Mock', icon: Link, color: '#fa8c16', path: '/mock-mgmt' },
  { title: '流量回放', icon: Clock, color: '#722ed1', path: '/task-mgmt' }
]

// 最近活动数据
const recentCases = [
  { id: 1, name: '订单创建流程测试', type: 'API', creator: '张三', time: '10分钟前', status: 'success' },
  { id: 2, name: '支付接口验证', type: 'JSF', creator: '李四', time: '30分钟前', status: 'pending' },
  { id: 3, name: '用户登录测试', type: 'API', creator: '王五', time: '1小时前', status: 'failed' },
  { id: 4, name: '商品搜索功能', type: 'UI', creator: '赵六', time: '2小时前', status: 'success' }
]

const recentTasks = [
  { id: 1, name: '每日回归测试', type: '定时任务', creator: '系统', time: '5分钟前', status: 'running' },
  { id: 2, name: '接口性能测试', type: '手动执行', creator: '张三', time: '1小时前', status: 'success' },
  { id: 3, name: '核心流程巡检', type: '定时任务', creator: '系统', time: '3小时前', status: 'success' }
]

// 周期任务数据
const periodicTasks = [
  { id: 1, name: '每日回归测试', schedule: '每天 02:00', lastRun: '今天 02:00', nextRun: '明天 02:00', status: 'enabled' },
  { id: 2, name: '接口健康检查', schedule: '每30分钟', lastRun: '10分钟前', nextRun: '20分钟后', status: 'enabled' },
  { id: 3, name: '性能基准测试', schedule: '每周一 06:00', lastRun: '3天前', nextRun: '4天后', status: 'disabled' }
]

// 运行统计
const statistics = {
  totalCases: 1234,
  totalTasks: 56,
  successRate: 98.5,
  runningTasks: 3
}

function handleCardClick(card) {
  router.push(card.path)
}

function getStatusType(status) {
  const map = {
    success: 'success',
    failed: 'danger',
    pending: 'warning',
    running: 'primary'
  }
  return map[status] || 'info'
}

function getStatusLabel(status) {
  const map = {
    success: '成功',
    failed: '失败',
    pending: '待执行',
    running: '执行中'
  }
  return map[status] || status
}
</script>

<template>
  <div class="dashboard-page">
    <AppHeader />
    
    <el-container class="dashboard-container">
      <el-main>
        <el-row :gutter="16">
          <!-- 左侧主内容区 -->
          <el-col :span="18">
            <!-- 快捷入口卡片 -->
            <el-card class="quick-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span class="card-title">常用功能</span>
                </div>
              </template>
              <el-row :gutter="16">
                <el-col :span="6" v-for="card in quickCards" :key="card.title">
                  <div class="quick-item" @click="handleCardClick(card)">
                    <div class="quick-icon" :style="{ backgroundColor: card.color + '15', color: card.color }">
                      <el-icon :size="28"><component :is="card.icon" /></el-icon>
                    </div>
                    <span class="quick-title">{{ card.title }}</span>
                  </div>
                </el-col>
              </el-row>
            </el-card>

            <!-- 最近活跃 -->
            <el-card class="recent-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span class="card-title">最近活跃</span>
                  <el-link type="primary" :icon="ArrowRight">查看全部</el-link>
                </div>
              </template>
              <el-tabs v-model="recentTab">
                <el-tab-pane label="用例" name="case">
                  <el-table :data="recentCases" stripe style="width: 100%">
                    <el-table-column prop="name" label="用例名称" min-width="180" />
                    <el-table-column prop="type" label="类型" width="80" />
                    <el-table-column prop="creator" label="创建人" width="100" />
                    <el-table-column prop="time" label="更新时间" width="120" />
                    <el-table-column label="状态" width="100">
                      <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)" size="small">
                          {{ getStatusLabel(row.status) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80" fixed="right">
                      <template #default>
                        <el-button link type="primary" size="small">执行</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-tab-pane>
                <el-tab-pane label="任务" name="task">
                  <el-table :data="recentTasks" stripe style="width: 100%">
                    <el-table-column prop="name" label="任务名称" min-width="180" />
                    <el-table-column prop="type" label="类型" width="100" />
                    <el-table-column prop="creator" label="创建人" width="100" />
                    <el-table-column prop="time" label="更新时间" width="120" />
                    <el-table-column label="状态" width="100">
                      <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)" size="small">
                          {{ getStatusLabel(row.status) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80" fixed="right">
                      <template #default>
                        <el-button link type="primary" size="small">查看</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-tab-pane>
              </el-tabs>
            </el-card>

            <!-- 周期任务 -->
            <el-card class="periodic-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span class="card-title">周期任务</span>
                  <el-link type="primary" :icon="ArrowRight">管理</el-link>
                </div>
              </template>
              <el-table :data="periodicTasks" style="width: 100%">
                <el-table-column prop="name" label="任务名称" min-width="150" />
                <el-table-column prop="schedule" label="执行周期" width="120" />
                <el-table-column prop="lastRun" label="上次执行" width="120" />
                <el-table-column prop="nextRun" label="下次执行" width="120" />
                <el-table-column label="状态" width="80">
                  <template #default="{ row }">
                    <el-switch v-model="row.status" active-value="enabled" inactive-value="disabled" />
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>

          <!-- 右侧边栏 -->
          <el-col :span="6">
            <!-- 运行统计 -->
            <el-card class="stat-card" shadow="hover">
              <template #header>
                <span class="card-title">运行统计</span>
              </template>
              <div class="stat-list">
                <div class="stat-item">
                  <span class="stat-label">用例总数</span>
                  <span class="stat-value">{{ statistics.totalCases }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">任务总数</span>
                  <span class="stat-value">{{ statistics.totalTasks }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">成功率</span>
                  <span class="stat-value success">{{ statistics.successRate }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">运行中任务</span>
                  <span class="stat-value primary">{{ statistics.runningTasks }}</span>
                </div>
              </div>
            </el-card>

            <!-- 快速链接 -->
            <el-card class="link-card" shadow="hover">
              <template #header>
                <span class="card-title">快速链接</span>
              </template>
              <div class="link-list">
                <el-link type="primary" :underline="false">用例库管理</el-link>
                <el-link type="primary" :underline="false">测试报告</el-link>
                <el-link type="primary" :underline="false">环境配置</el-link>
                <el-link type="primary" :underline="false">系统设置</el-link>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-container {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.quick-card {
  margin-bottom: 16px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.quick-item:hover {
  background: #f5f7fa;
}

.quick-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.quick-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.recent-card, .periodic-card {
  margin-bottom: 16px;
}

.stat-card, .link-card {
  margin-bottom: 16px;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.primary {
  color: #409eff;
}

.link-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
