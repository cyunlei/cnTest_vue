<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

const isVisible = ref(false)
const isAnimating = ref(false)

const stepForm = ref({
  name: '',
  module: '商家开放',
  url: '',
  method: 'GET',
  env: '',
  expectedResult: ''
})

const methodOptions = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

watch(() => props.visible, (newVal) => {
  if (newVal) {
    isVisible.value = true
    setTimeout(() => {
      isAnimating.value = true
    }, 10)
  } else {
    isAnimating.value = false
    setTimeout(() => {
      isVisible.value = false
    }, 300)
  }
})

function handleClose() {
  emit('close')
}

function handleSave() {
  emit('save', { ...stepForm.value })
  resetForm()
}

function resetForm() {
  stepForm.value = {
    name: '',
    module: '商家开放',
    url: '',
    method: 'GET',
    env: '',
    expectedResult: ''
  }
}
</script>
<template>
  <div v-if="isVisible" class="drawer-wrapper">
    <div class="drawer-mask" :class="{ show: isAnimating }" @click="handleClose"></div>
    <div class="drawer-content" :class="{ show: isAnimating }">
      <div class="drawer-header">
        <h3 class="drawer-title">接口用例配置</h3>
        <button class="drawer-close" @click="handleClose">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      <div class="drawer-body">
        <div class="section">
          <div class="section-title"><span class="arrow expanded">▼</span><span>基础信息</span></div>
          <div class="section-content">
            <div class="form-row">
              <div class="form-item required">
                <label class="form-label"><span class="star">*</span>名称</label>
                <input v-model="stepForm.name" type="text" class="form-input" placeholder="请输入名称" />
              </div>
              <div class="form-item required">
                <label class="form-label"><span class="star">*</span>接口所属模块</label>
                <select v-model="stepForm.module" class="form-select">
                  <option value="商家开放">商家开放</option>
                  <option value="开放平台">开放平台</option>
                  <option value="内部平台">内部平台</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label class="form-label">接口地址</label>
                <div class="input-group">
                  <select v-model="stepForm.method" class="method-select">
                    <option v-for="m in methodOptions" :key="m" :value="m">{{ m }}</option>
                  </select>
                  <input v-model="stepForm.url" type="text" class="form-input flex-1" placeholder="请选择接口地址，支持输入，支持CURL命令" />
                  <button class="input-addon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label class="form-label">特性环境<svg class="help-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg></label>
                <input v-model="stepForm.env" type="text" class="form-input" placeholder="请选择环境，可输入" />
              </div>
              <div class="form-item">
                <label class="form-label">预期结果描述<svg class="help-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg></label>
                <input v-model="stepForm.expectedResult" type="text" class="form-input" placeholder="步骤预期结果描述" />
              </div>
            </div>
            <div class="form-row"><a class="more-link">更多信息</a></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title"><span class="arrow expanded">▼</span><span>详细信息</span></div>
          <div class="section-content">
            <div class="tabs">
              <button class="tab-item active">入参/断言</button>
              <button class="tab-item">预设变量</button>
              <button class="tab-item">前置操作</button>
              <button class="tab-item">后置操作</button>
              <button class="tab-item">设置</button>
              <button class="tab-item">网关/登陆</button>
            </div>
            <div class="tab-content">
              <div class="sub-toolbar">
                <button class="sub-btn">添加</button>
                <div class="group-tabs"><button class="group-tab active">第1组</button><button class="group-tab add">+</button></div>
              </div>
              <div class="param-tabs">
                <button class="param-tab active">Params</button>
                <button class="param-tab">Headers</button>
                <button class="param-tab">Body</button>
                <button class="param-tab">IPPort</button>
                <button class="param-tab">加密</button>
              </div>
              <div class="param-table">
                <table>
                  <thead><tr><th class="col-key">KEY</th><th class="col-json">JSON添加</th><th class="col-value">VALUE</th><th class="col-action"><a class="batch-link">批量编辑</a></th></tr></thead>
                  <tbody><tr><td colspan="4" class="empty-row"></td></tr></tbody>
                </table>
              </div>
              <div class="compare-section">
                <div class="compare-row"><span class="compare-label">比对方式:</span><label class="radio-item"><input type="radio" name="compareType" value="normal" checked /><span>普通</span></label><label class="radio-item"><input type="radio" name="compareType" value="ab" /><span>A/B</span></label></div>
                <div class="compare-row"><span class="compare-label">对比规则:</span><label class="radio-item"><input type="radio" name="compareRule" value="whole" /><span>整体</span></label><label class="radio-item"><input type="radio" name="compareRule" value="key" checked /><span>键值</span></label><label class="radio-item"><input type="radio" name="compareRule" value="script" /><span>自定义脚本</span></label></div>
                <div class="compare-row"><span class="compare-label">规则形式:</span><label class="radio-item"><input type="radio" name="ruleFormat" value="text" /><span>文本</span></label><label class="radio-item"><input type="radio" name="ruleFormat" value="jsonpath" checked /><span>JSONPath</span></label></div>
                <div class="compare-row"><span class="compare-label">排除空值:</span><label class="radio-item"><input type="radio" name="excludeNull" value="yes" /><span>需要</span></label><label class="radio-item"><input type="radio" name="excludeNull" value="no" checked /><span>不需要</span></label><span class="compare-label ml-32">忽略顺序:</span><label class="radio-item"><input type="radio" name="ignoreOrder" value="yes" /><span>需要</span></label><label class="radio-item"><input type="radio" name="ignoreOrder" value="no" checked /><span>不需要</span></label></div>
              </div>
              <div class="assert-table">
                <table>
                  <thead><tr><th class="col-check"><input type="checkbox" /></th><th class="col-type">类型</th><th class="col-field">字段</th><th class="col-rule">规则</th><th class="col-expect">期望值</th><th class="col-remark">备注</th><th class="col-extract">提取变量</th><th class="col-action"><button class="add-btn">+ JSON添加</button><a class="batch-delete">批量删除</a></th></tr></thead>
                  <tbody><tr><td colspan="8" class="empty-row"></td></tr></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="drawer-footer">
        <button class="btn-save" @click="handleSave">保存</button>
        <button class="btn-test">测试一下</button>
        <span class="tip">(多个IP默认直连调用第一个)</span>
        <button class="btn-env-test">分环境测试</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.drawer-wrapper { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 20000; }
.drawer-mask { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0); transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-mask.show { background: rgba(0, 0, 0, 0.5); }
.drawer-content { position: absolute; top: 0; right: 0; width: 90%; max-width: 1200px; height: 100%; background: #fff; box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15); display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-content.show { transform: translateX(0); }
.drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid #e8e8e8; background: #fafafa; }
.drawer-title { font-size: 16px; font-weight: 600; color: #333; margin: 0; }
.drawer-close { background: none; border: none; cursor: pointer; color: #999; padding: 4px; display: flex; align-items: center; justify-content: center; transition: color 0.2s, transform 0.2s; }
.drawer-close:hover { color: #666; transform: rotate(90deg); }
.drawer-body { flex: 1; overflow-y: auto; padding: 24px; }
.drawer-footer { display: flex; align-items: center; gap: 12px; padding: 16px 24px; border-top: 1px solid #e8e8e8; background: #fafafa; }
.section { margin-bottom: 24px; border: 1px solid #e8e8e8; border-radius: 8px; overflow: hidden; }
.section-title { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #fafafa; font-size: 14px; font-weight: 500; color: #333; cursor: pointer; }
.section-title .arrow { font-size: 10px; color: #999; transition: transform 0.2s; }
.section-title .arrow.expanded { transform: rotate(0); }
.section-content { padding: 16px; }
.form-row { display: flex; gap: 24px; margin-bottom: 16px; }
.form-item { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.form-item.required .form-label { color: #333; }
.form-label { font-size: 14px; color: #666; display: flex; align-items: center; gap: 4px; }
.form-label .star { color: #f5222d; }
.help-icon { color: #1890ff; cursor: help; }
.form-input, .form-select { height: 36px; padding: 0 12px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.form-input:focus, .form-select:focus { border-color: #1890ff; box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2); }
.form-input::placeholder { color: #999; }
.flex-1 { flex: 1; }
.input-group { display: flex; gap: 0; }
.method-select { width: 80px; height: 36px; padding: 0 8px; border: 1px solid #d9d9d9; border-right: none; border-radius: 4px 0 0 4px; font-size: 14px; color: #52c41a; background: #fff; outline: none; }
.input-group .form-input { border-radius: 0; }
.input-addon { width: 36px; height: 36px; border: 1px solid #d9d9d9; border-left: none; border-radius: 0 4px 4px 0; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #666; }
.more-link { color: #1890ff; font-size: 14px; cursor: pointer; }
.tabs { display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid #e8e8e8; padding-bottom: 8px; }
.tab-item { padding: 8px 16px; border: none; background: transparent; font-size: 14px; color: #666; cursor: pointer; position: relative; transition: color 0.2s; }
.tab-item:hover { color: #1890ff; }
.tab-item.active { color: #1890ff; }
.tab-item.active::after { content: ""; position: absolute; bottom: -9px; left: 0; right: 0; height: 2px; background: #1890ff; }
.sub-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.sub-btn { padding: 6px 16px; border: 1px solid #1890ff; background: #fff; color: #1890ff; border-radius: 4px; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.sub-btn:hover { background: #e6f7ff; }
.group-tabs { display: flex; align-items: center; gap: 4px; }
.group-tab { padding: 6px 12px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; }
.group-tab.active { background: #1890ff; color: #fff; border-color: #1890ff; }
.group-tab.add { padding: 6px 10px; color: #1890ff; }
.param-tabs { display: flex; gap: 4px; margin-bottom: 16px; }
.param-tab { padding: 8px 16px; border: none; border-bottom: 2px solid transparent; background: transparent; font-size: 14px; color: #666; cursor: pointer; transition: all 0.2s; }
.param-tab:hover { color: #1890ff; }
.param-tab.active { color: #1890ff; border-bottom-color: #1890ff; }
.param-table, .assert-table { margin-bottom: 16px; }
.param-table table, .assert-table table { width: 100%; border-collapse: collapse; font-size: 14px; }
.param-table th, .param-table td, .assert-table th, .assert-table td { padding: 12px; text-align: left; border-bottom: 1px solid #f0f0f0; }
.param-table th, .assert-table th { background: #fafafa; font-weight: 500; color: #666; }
.batch-link, .batch-delete { color: #1890ff; font-size: 13px; cursor: pointer; }
.empty-row { height: 60px; }
.compare-section { background: #fafafa; padding: 16px; border-radius: 4px; margin-bottom: 16px; }
.compare-row { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
.compare-row:last-child { margin-bottom: 0; }
.compare-label { font-size: 14px; color: #666; min-width: 70px; }
.ml-32 { margin-left: 32px; }
.radio-item { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; color: #333; }
.add-btn { padding: 4px 12px; border: 1px solid #1890ff; background: #fff; color: #1890ff; border-radius: 4px; font-size: 13px; cursor: pointer; margin-right: 8px; }
.btn-save { padding: 8px 20px; border: none; background: #1890ff; color: #fff; border-radius: 4px; font-size: 14px; cursor: pointer; transition: background 0.2s; }
.btn-save:hover { background: #40a9ff; }
.btn-test { padding: 8px 20px; border: 1px solid #1890ff; background: #fff; color: #1890ff; border-radius: 4px; font-size: 14px; cursor: pointer; }
.btn-env-test { padding: 8px 20px; border: 1px solid #d9d9d9; background: #fff; color: #666; border-radius: 4px; font-size: 14px; cursor: pointer; margin-left: auto; }
.tip { font-size: 13px; color: #999; }
</style>