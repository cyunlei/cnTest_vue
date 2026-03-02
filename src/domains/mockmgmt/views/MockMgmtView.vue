<script setup>
import { ref } from 'vue'
import AppHeader from '@/shared/ui/organisms/AppHeader.vue'

const activeTab = ref('jsf')
const mockData = ref([
  { id: 1, name: '抖音获取授权店铺', url: 'http://test.easymock.jd.com/logistics/listShopNetsite', method: 'POST', operator: 'zhangpeiwen7', updateTime: '2026-03-02 21:01:39', status: 'enabled' },
  { id: 2, name: '关注tab列表算法接口mock', url: 'http://test.easymock.jd.com/followTabListV908', method: 'POST', operator: 'ext.xuhangyu3', updateTime: '2026-03-02 19:59:19', status: 'disabled' },
  { id: 3, name: 'outPainting扩图接口', url: 'http://test.easymock.jd.com/outPainting', method: 'POST', operator: 'yanghongcha1', updateTime: '2026-03-02 17:16:54', status: 'enabled' },
  { id: 4, name: '汉朔LCD价签数据推送Mock', url: 'http://test.easymock.jd.com/proxy/integration', method: 'POST', operator: 'ext.jigang1', updateTime: '2026-03-02 09:52:44', status: 'enabled' },
  { id: 5, name: '汉朔EPD价签数据推送Mock', url: 'http://test.easymock.jd.com/prismart/integration', method: 'POST', operator: 'ext.jigang1', updateTime: '2026-03-02 09:37:44', status: 'enabled' },
  { id: 6, name: '送达照片审核-无效照片审核', url: 'http://test.easymock.jd.com/v2/models/ms_vit_model_v1_ensemble/infer', method: 'POST', operator: 'lijunjie134', updateTime: '2026-02-28 16:35:39', status: 'enabled' },
  { id: 7, name: 'mock网联接口返回', url: 'http://test.easymock.jd.com/front/preSvr', method: 'POST', operator: 'zhanghuan343', updateTime: '2026-02-28 16:14:45', status: 'enabled' },
  { id: 8, name: '送达照片审核-人脸人体打码test', url: 'http://test.easymock.jd.com/v2/models/human-face-mask/infer', method: 'POST', operator: 'lijunjie134', updateTime: '2026-02-28 15:46:22', status: 'enabled' },
  { id: 9, name: '打卡履约图片识别查询任务', url: 'http://test.easymock.jd.com/v2/inspection/queryResult', method: 'POST', operator: 'huangshengbin.7', updateTime: '2026-02-28 09:59:27', status: 'enabled' },
  { id: 10, name: '打卡履约图片识别创建任务', url: 'http://test.easymock.jd.com/v2/inspection/createTask', method: 'POST', operator: 'huangshengbin.7', updateTime: '2026-02-28 09:49:11', status: 'enabled' }
])

function handleNav(path) {
  console.log('Navigate to:', path)
}
</script>

<template>
  <div class="mockmgmt-page">
    <AppHeader @navigate="handleNav" />
    <div class="page-content">
      <div class="content-tabs">
        <button :class="['tab-btn', { active: activeTab === 'jsf' }]" @click="activeTab = 'jsf'">JSF Mock</button>
        <button :class="['tab-btn', { active: activeTab === 'http' }]" @click="activeTab = 'http'">HTTP Mock</button>
        <button :class="['tab-btn', { active: activeTab === 'color' }]" @click="activeTab = 'color'">Color接口</button>
        <button :class="['tab-btn', { active: activeTab === 'user' }]" @click="activeTab = 'user'">用户组</button>
      </div>
      <div class="search-filter">
        <div class="filter-row">
          <div class="filter-item">
            <label>接口名称:</label>
            <input type="text" style="width: 280px;" />
          </div>
          <div class="filter-item">
            <label>用户组:</label>
            <select style="width: 200px;"><option>请选择用户组</option></select>
          </div>
          <div class="filter-item">
            <label>分类:</label>
            <input type="text" />
          </div>
          <div class="filter-item">
            <label>请求路径:</label>
            <input type="text" placeholder="例如:/reqButterflyFlower" />
          </div>
        </div>
        <div class="filter-row" style="margin-top: 12px;">
          <div class="filter-item">
            <label>操作人:</label>
            <input type="text" />
          </div>
          <button class="query-btn">查询</button>
          <button class="reset-btn">重置</button>
          <button class="add-btn">新增接口</button>
          <button class="batch-btn">批量操作</button>
        </div>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" /></th>
              <th class="col-index">序号</th>
              <th class="col-name">接口名称</th>
              <th class="col-category">分类</th>
              <th class="col-url">请求完整地址</th>
              <th class="col-method">请求类型</th>
              <th class="col-operator">操作人</th>
              <th class="col-time">更新时间</th>
              <th class="col-status">状态</th>
              <th class="col-inherit">透传</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in mockData" :key="row.id">
              <td class="col-check"><input type="checkbox" /></td>
              <td class="col-index">{{ row.id }}</td>
              <td class="col-name">{{ row.name }}</td>
              <td class="col-category">-</td>
              <td class="col-url">{{ row.url }}</td>
              <td class="col-method"><span class="method-tag">{{ row.method }}</span></td>
              <td class="col-operator">{{ row.operator }}</td>
              <td class="col-time">{{ row.updateTime }}</td>
              <td class="col-status">
                <span :class="['status-switch', row.status]">
                  {{ row.status === 'enabled' ? '开启' : '关闭' }}
                </span>
              </td>
              <td class="col-inherit">否</td>
              <td class="col-actions">
                <a href="javascript:;">设置模板</a>
                <a href="javascript:;">编辑</a>
                <a href="javascript:;">删除</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <span>共 1871 条数据</span>
        <div class="page-btns">
          <button class="page-btn">&lt;</button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">3</button>
          <button class="page-btn">4</button>
          <button class="page-btn">5</button>
          <span>...</span>
          <button class="page-btn">94</button>
          <button class="page-btn">&gt;</button>
        </div>
        <select class="page-size"><option>20 条/页</option></select>
        <span>跳至</span>
        <input type="text" class="page-input" />
        <span>页</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mockmgmt-page { min-height: 100vh; background: #f5f5f5; }
.page-content { padding: 20px; }
.content-tabs { display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid #e8e8e8; padding-bottom: 12px; }
.tab-btn { padding: 8px 20px; border: none; background: transparent; font-size: 14px; color: #666; cursor: pointer; border-radius: 4px; }
.tab-btn.active { color: #1890ff; font-weight: 500; background: #e6f7ff; }
.search-filter { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 16px; }
.filter-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.filter-item { display: flex; align-items: center; gap: 8px; }
.filter-item label { font-size: 13px; color: #666; white-space: nowrap; }
.filter-item input, .filter-item select { padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; }
.query-btn { padding: 6px 20px; border: none; background: #1890ff; color: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; }
.reset-btn { padding: 6px 16px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; }
.add-btn { padding: 6px 16px; border: none; background: #1890ff; color: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; }
.batch-btn { padding: 6px 16px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; }
.table-container { background: #fff; border-radius: 8px; overflow: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { padding: 12px 8px; text-align: left; border-bottom: 1px solid #f0f0f0; }
th { background: #fafafa; font-weight: 500; color: #666; white-space: nowrap; }
.col-check { width: 40px; }
.col-index { width: 50px; }
.col-name { min-width: 150px; }
.col-url { min-width: 300px; color: #666; font-size: 12px; }
.col-method { width: 80px; }
.method-tag { padding: 2px 8px; background: #e6f7ff; color: #1890ff; border-radius: 4px; font-size: 12px; }
.col-status { width: 80px; }
.status-switch { padding: 2px 8px; border-radius: 12px; font-size: 12px; }
.status-switch.enabled { background: #e6f7ff; color: #1890ff; }
.status-switch.disabled { background: #f5f5f5; color: #999; }
.col-actions { min-width: 120px; }
.col-actions a { color: #1890ff; margin-right: 8px; font-size: 13px; }
.pagination { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 16px; font-size: 13px; }
.page-btns { display: flex; gap: 4px; }
.page-btn { min-width: 28px; height: 28px; padding: 0 8px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; }
.page-btn.active { background: #1890ff; color: #fff; border-color: #1890ff; }
.page-size { padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; }
.page-input { width: 40px; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; text-align: center; }
</style>
