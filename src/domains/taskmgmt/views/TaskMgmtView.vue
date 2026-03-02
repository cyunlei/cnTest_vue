<script setup>
import { ref } from 'vue'
import AppHeader from '@/shared/ui/organisms/AppHeader.vue'

const activeTab = ref('list')
const selectedModule = ref('商家开放')
const tempTaskHidden = ref(true)
const onlyMine = ref(false)

const modules = ['商家开放', '服务市场', 'POP订单', '开放平台']

const taskData = ref([
  { id: '495207', name: '【会员更新】Costco付费会员-开放平台', creator: 'ext.lizhigang10', updateTime: '2026-01-30 15:19', execType: '手动执行', count: '1/0' },
  { id: '495150', name: '何利民MCP酒店测试', creator: 'ext.helimin6', updateTime: '2026-01-29 18:15', execType: '手动执行', count: '2/0' },
  { id: '479056', name: 'POP开放业务自动化', creator: 'bjkeqinqin', updateTime: '2026-01-12 15:30', execType: '手动执行', count: '96/0' },
  { id: '493068', name: 'lzg', creator: 'ext.lizhigang10', updateTime: '2026-01-07 21:32', execType: '手动执行', count: '1/0' },
  { id: '489442', name: '国补订单优化', creator: 'bjkeqinqin', updateTime: '2025-12-17 17:04', execType: '手动执行', count: '3/0' },
  { id: '139447', name: '厂直需求任务', creator: 'bjkeqinqin', updateTime: '2025-12-11 17:00', execType: '手动执行', count: '12/0' },
  { id: '487103', name: '订单API-数据推送字段不一致优化', creator: 'bjkeqinqin', updateTime: '2025-11-28 16:15', execType: '手动执行', count: '0/0' },
  { id: '486746', name: '开放5.0-restful升级-售后操作API支持自营厂直', creator: 'ext.shangyuxin6', updateTime: '2025-11-26 22:35', execType: '手动执行', count: '2/0' }
])

function handleNav(path) {
  console.log('Navigate to:', path)
}
</script>

<template>
  <div class="taskmgmt-page">
    <AppHeader @navigate="handleNav" />
    <div class="page-container">
      <aside class="sidebar">
        <div class="module-select">
          <select v-model="selectedModule">
            <option v-for="m in modules" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
      </aside>
      <main class="main-content">
        <div class="content-tabs">
          <button :class="['tab-btn', { active: activeTab === 'list' }]" @click="activeTab = 'list'">任务列表</button>
          <button :class="['tab-btn', { active: activeTab === 'monitor' }]" @click="activeTab = 'monitor'">任务监控</button>
        </div>
        <div class="search-filter">
          <div class="filter-row">
            <div class="filter-item">
              <label>关键字:</label>
              <input type="text" placeholder="支持名称/erp模糊查询" style="width: 200px;" />
            </div>
            <div class="filter-item">
              <label>执行方式:</label>
              <select><option>请选择</option></select>
            </div>
            <div class="filter-item">
              <label>只看自己:</label>
              <input v-model="onlyMine" type="checkbox" />
            </div>
            <div class="filter-item">
              <label>临时任务:</label>
              <button :class="['toggle-btn', { active: tempTaskHidden }]">
                {{ tempTaskHidden ? '隐藏' : '显示' }}
              </button>
            </div>
            <button class="query-btn">查询</button>
            <button class="reset-btn">重置</button>
          </div>
        </div>
        <div class="toolbar">
          <button class="tool-btn primary">+ 新增</button>
          <button class="tool-btn">批量操作</button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>编号</th>
                <th>任务名称</th>
                <th>创建人</th>
                <th>更新时间</th>
                <th>执行方式</th>
                <th>执行次数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in taskData" :key="row.id">
                <td><input type="checkbox" /></td>
                <td>{{ row.id }}</td>
                <td><a href="javascript:;" class="link">{{ row.name }}</a></td>
                <td>{{ row.creator }}</td>
                <td>{{ row.updateTime }}</td>
                <td>{{ row.execType }}</td>
                <td>{{ row.count }}</td>
                <td class="actions">
                  <a href="javascript:;">编辑</a>
                  <a href="javascript:;">执行</a>
                  <a href="javascript:;">设置</a>
                  <a href="javascript:;">执行记录</a>
                  <a href="javascript:;">更多</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span>第 1-50 条 / 总共 75 条</span>
          <div class="page-btns">
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">&gt;</button>
          </div>
          <select class="page-size"><option>50 条/页</option></select>
        </div>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.taskmgmt-page { min-height: 100vh; background: #f5f5f5; }
.page-container { display: flex; height: calc(100vh - 56px); }
.sidebar { width: 200px; background: #fff; border-right: 1px solid #e8e8e8; padding: 16px; }
.module-select select { width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; }
.main-content { flex: 1; padding: 20px; overflow-y: auto; }
.content-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.tab-btn { padding: 8px 16px; border: none; background: transparent; font-size: 14px; color: #666; cursor: pointer; border-radius: 4px; }
.tab-btn.active { color: #1890ff; font-weight: 500; background: #e6f7ff; }
.search-filter { background: #fff; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
.filter-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.filter-item { display: flex; align-items: center; gap: 8px; }
.filter-item label { font-size: 13px; color: #666; white-space: nowrap; }
.filter-item input, .filter-item select { padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; }
.toggle-btn { padding: 4px 12px; border: 1px solid #d9d9d9; background: #fff; border-radius: 12px; font-size: 12px; cursor: pointer; }
.toggle-btn.active { background: #1890ff; color: #fff; border-color: #1890ff; }
.query-btn { padding: 6px 20px; border: none; background: #1890ff; color: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; }
.reset-btn { padding: 6px 16px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; }
.toolbar { display: flex; gap: 8px; margin-bottom: 16px; }
.tool-btn { padding: 6px 14px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; }
.tool-btn.primary { background: #1890ff; color: #fff; border-color: #1890ff; }
.table-container { background: #fff; border-radius: 8px; overflow: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #f0f0f0; }
th { background: #fafafa; font-weight: 500; color: #666; }
.link { color: #1890ff; text-decoration: none; }
.actions { display: flex; gap: 8px; }
.actions a { color: #1890ff; font-size: 13px; }
.pagination { display: flex; align-items: center; justify-content: flex-end; gap: 16px; margin-top: 16px; font-size: 13px; }
.page-btns { display: flex; gap: 4px; }
.page-btn { min-width: 28px; height: 28px; padding: 0 8px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; }
.page-btn.active { background: #1890ff; color: #fff; border-color: #1890ff; }
.page-size { padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; }
</style>
