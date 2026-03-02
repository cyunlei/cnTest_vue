<script setup>
import { ref } from 'vue'
import AppHeader from '@/shared/ui/organisms/AppHeader.vue'

const activeMenu = ref('variable')
const selectedModule = ref('商家开放')
const searchKeyword = ref('')
const onlyMine = ref(false)

const modules = ['商家开放', '服务市场', 'POP订单', '开放平台']

const menuItems = [
  { id: 'general', name: '通用设置', icon: '⚙️', children: [
    { id: 'basic', name: '基本信息' },
    { id: 'member', name: '人员管理' },
    { id: 'personal', name: '个性化配置' },
    { id: 'tag', name: '标签管理' },
    { id: 'whitelist', name: '白名单管理' }
  ]},
  { id: 'resource', name: '模块资源', icon: '📦', children: [
    { id: 'variable', name: '变量模板' },
    { id: 'function', name: '函数模板' },
    { id: 'framework', name: '框架模板' },
    { id: 'account', name: '账号认证' },
    { id: 'file', name: '文件管理' },
    { id: 'env', name: '环境管理' },
    { id: 'recycle', name: '回收站' }
  ]},
  { id: 'notify', name: '通知消息', icon: '🔔', children: [
    { id: 'api', name: 'API变更' }
  ]}
]

const templateData = ref([
  { id: '253164', name: 'open-console-v2应用', scope: '用例维度', creator: 'ext.chenyunlei1', desc: '' },
  { id: '254271', name: 'watchmanjos应用', scope: '用例维度', creator: 'ext.chenyunlei1', desc: '' },
  { id: '246245', name: '开放平台', scope: '任务维度/用例维度/用例集维度', creator: 'jinjiao5', desc: '' },
  { id: '238547', name: '宙斯全量参数模板', scope: '用例维度', creator: 'liwenhui11', desc: '' },
  { id: '238546', name: '服务市场运营端和大前端', scope: '用例维度', creator: 'liwenhui11', desc: '' }
])

function handleNav(path) {
  console.log('Navigate to:', path)
}
</script>

<template>
  <div class="modulesettings-page">
    <AppHeader @navigate="handleNav" />
    <div class="page-container">
      <!-- 左侧菜单 -->
      <aside class="sidebar">
        <div class="module-select">
          <select v-model="selectedModule">
            <option v-for="m in modules" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <nav class="menu">
          <div v-for="menu in menuItems" :key="menu.id" class="menu-group">
            <div class="menu-title">
              <span>{{ menu.icon }}</span>
              <span>{{ menu.name }}</span>
            </div>
            <div class="menu-items">
              <a 
                v-for="item in menu.children" 
                :key="item.id"
                :class="['menu-item', { active: activeMenu === item.id }]"
                href="javascript:;"
                @click="activeMenu = item.id"
              >
                {{ item.name }}
              </a>
            </div>
          </div>
        </nav>
      </aside>

      <!-- 主内容 -->
      <main class="main-content">
        <div class="content-header">
          <h2 class="page-title">变量模板</h2>
        </div>
        
        <!-- 搜索筛选 -->
        <div class="search-filter">
          <div class="filter-item">
            <label>关键字:</label>
            <input type="text" placeholder="支持模糊查询" />
          </div>
          <div class="filter-item">
            <label>创建人:</label>
            <input type="text" placeholder="请输入ERP,支持自动补全..." />
          </div>
          <div class="filter-item">
            <label>只看自己:</label>
            <input v-model="onlyMine" type="checkbox" />
          </div>
          <button class="query-btn">查询</button>
          <button class="reset-btn">重置</button>
        </div>

        <!-- 操作栏 -->
        <div class="toolbar">
          <button class="tool-btn primary">+ 新增模板</button>
          <button class="tool-btn">删除</button>
        </div>

        <!-- 表格 -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="col-check"><input type="checkbox" /></th>
                <th class="col-id">编号</th>
                <th class="col-name">名称</th>
                <th class="col-scope">作用域</th>
                <th class="col-creator">创建人</th>
                <th class="col-desc">描述</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in templateData" :key="row.id">
                <td class="col-check"><input type="checkbox" /></td>
                <td class="col-id">{{ row.id }}</td>
                <td class="col-name">
                  <a href="javascript:;" class="link">{{ row.name }}</a>
                </td>
                <td class="col-scope">{{ row.scope }}</td>
                <td class="col-creator">{{ row.creator }}</td>
                <td class="col-desc">{{ row.desc || '-' }}</td>
                <td class="col-actions">
                  <a href="javascript:;">引用</a>
                  <a href="javascript:;">复制</a>
                  <a href="javascript:;">移动</a>
                  <a href="javascript:;">删除</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <span>第 1-5 条 / 总共 5 条</span>
          <div class="page-btns">
            <button class="page-btn" disabled>&lt;</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>&gt;</button>
          </div>
          <select class="page-size"><option>50 条/页</option></select>
        </div>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modulesettings-page { min-height: 100vh; background: #f5f5f5; }
.page-container { display: flex; height: calc(100vh - 56px); }

/* 左侧边栏 */
.sidebar { width: 220px; background: #fff; border-right: 1px solid #e8e8e8; padding: 16px; overflow-y: auto; }
.module-select { margin-bottom: 16px; }
.module-select select { width: 100%; padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; }

.menu-group { margin-bottom: 8px; }
.menu-title { display: flex; align-items: center; gap: 8px; padding: 10px 12px; font-size: 14px; font-weight: 500; color: #1a1a1a; cursor: pointer; }
.menu-items { padding-left: 8px; }
.menu-item { display: block; padding: 8px 12px 8px 32px; font-size: 13px; color: #666; text-decoration: none; border-radius: 4px; }
.menu-item:hover { background: #f5f5f5; color: #1890ff; }
.menu-item.active { background: #e6f7ff; color: #1890ff; }

/* 主内容 */
.main-content { flex: 1; padding: 20px; overflow-y: auto; }
.content-header { margin-bottom: 20px; }
.page-title { font-size: 16px; font-weight: 600; margin: 0; }

.search-filter { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; padding: 16px; background: #fff; border-radius: 8px; }
.filter-item { display: flex; align-items: center; gap: 8px; }
.filter-item label { font-size: 13px; color: #666; white-space: nowrap; }
.filter-item input { padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; width: 180px; }
.query-btn { padding: 6px 20px; border: none; background: #1890ff; color: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; }
.reset-btn { padding: 6px 16px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; color: #1890ff; }

.toolbar { display: flex; gap: 8px; margin-bottom: 16px; }
.tool-btn { padding: 6px 14px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; }
.tool-btn.primary { background: #1890ff; color: #fff; border-color: #1890ff; }

.table-container { background: #fff; border-radius: 8px; overflow: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #f0f0f0; }
th { background: #fafafa; font-weight: 500; color: #666; }
.col-check { width: 40px; }
.col-id { width: 80px; color: #666; }
.col-name { min-width: 150px; }
.col-scope { width: 180px; }
.col-actions { min-width: 150px; }
.link { color: #1890ff; text-decoration: none; }
.link:hover { text-decoration: underline; }
.col-actions a { color: #1890ff; margin-right: 8px; font-size: 13px; }

.pagination { display: flex; align-items: center; justify-content: flex-end; gap: 16px; margin-top: 16px; font-size: 13px; }
.page-btns { display: flex; gap: 4px; }
.page-btn { min-width: 28px; height: 28px; padding: 0 8px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; }
.page-btn.active { background: #1890ff; color: #fff; border-color: #1890ff; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-size { padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; }
</style>
