<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

export interface JsonPathAssertRow {
  type?: string
  field?: string
  rule?: string
  expected?: string
  remark?: string
  extractVar?: string
}

const props = defineProps<{
  modelValue: JsonPathAssertRow[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: JsonPathAssertRow[]): void
}>()

const tableData = computed({
  get: () => props.modelValue || [],
  set: (v: JsonPathAssertRow[]) => emit('update:modelValue', v)
})

const hasData = computed(() => Array.isArray(tableData.value) && tableData.value.length > 0)

function handleJsonAdd() {
  emit('json-add')
}

function handleBatchDelete() {
  emit('batch-delete')
}

function handleDeleteRow(index: number) {
  const next = (tableData.value || []).slice()
  next.splice(index, 1)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="jsonpath-assert-panel">
    <div class="assert-table">
      <el-table :data="tableData" size="small" border>
        <el-table-column type="selection" width="40" />
        <el-table-column label="类型" width="100">
          <template #header>
            <span>类型</span>
            <el-tooltip placement="top">
              <template #content>
                <div class="assert-tooltip-text">
                  当前仅支持“JSONPATH”，如果您有其他需求，可以右上角咚咚联系我们
                </div>
              </template>
              <svg
                viewBox="64 64 896 896"
                class="label-icon"
                focusable="false"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344.3 352 380.7 352 420v7.6c0 4.3 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-24.3 19.7-44 44-44h7.6c22.5 0 39.6 6.5 52.1 18.8 9.8 9.6 15.3 22.7 15.3 36.7 0 14-5.4 27.3-15.3 37.1L527.7 474c-24.5 24.3-40.5 56-44.2 90.1l-3.1 29.2c-.4 4.2 2.9 7.9 7.1 7.9h48.2c4 0 7.4-3 7.9-7l2.5-23.8c2.2-20.7 11.2-40.3 25.4-54.6l39.6-39.2C632.7 353.3 640 334 640 305.4c0-31.7-12.3-61.7-34.4-83.7zM472 664a48 48 0 1096 0 48 48 0 10-96 0z" />
              </svg>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <el-input v-model="row.type" size="small" placeholder="类型" />
          </template>
        </el-table-column>
        <el-table-column label="字段">
          <template #header>
            <span>字段</span>
            <el-tooltip placement="top">
              <template #content>
                <div class="assert-tooltip-text">
                  关于 JSONPATH 的编写，您可以参考
                  <a href="https://github.com/json-path/JsonPath" target="_blank" rel="noopener noreferrer">JSONPATH 官方说明</a>
                  来完成，也可以通过
                  <a href="https://jsonpath.com/" target="_blank" rel="noopener noreferrer">JSONPath Online Evaluator</a>
                  来辅助填写
                </div>
              </template>
              <svg viewBox="64 64 896 896" class="label-icon" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344.3 352 380.7 352 420v7.6c0 4.3 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-24.3 19.7-44 44-44h7.6c22.5 0 39.6 6.5 52.1 18.8 9.8 9.6 15.3 22.7 15.3 36.7 0 14-5.4 27.3-15.3 37.1L527.7 474c-24.5 24.3-40.5 56-44.2 90.1l-3.1 29.2c-.4 4.2 2.9 7.9 7.1 7.9h48.2c4 0 7.4-3 7.9-7l2.5-23.8c2.2-20.7 11.2-40.3 25.4-54.6l39.6-39.2C632.7 353.3 640 334 640 305.4c0-31.7-12.3-61.7-34.4-83.7zM472 664a48 48 0 1096 0 48 48 0 10-96 0z" />
              </svg>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <el-input v-model="row.field" size="small" placeholder="字段" />
          </template>
        </el-table-column>
        <el-table-column label="规则" width="120">
          <template #header>
            <span>规则</span>
            <el-tooltip placement="top">
              <template #content>
                <div class="assert-tooltip-text">
                  规则支持“等于”“包含”“正则”三种方式，后续我们会酌情再支持其他方式
                </div>
              </template>
              <svg viewBox="64 64 896 896" class="label-icon" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344.3 352 380.7 352 420v7.6c0 4.3 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-24.3 19.7-44 44-44h7.6c22.5 0 39.6 6.5 52.1 18.8 9.8 9.6 15.3 22.7 15.3 36.7 0 14-5.4 27.3-15.3 37.1L527.7 474c-24.5 24.3-40.5 56-44.2 90.1l-3.1 29.2c-.4 4.2 2.9 7.9 7.1 7.9h48.2c4 0 7.4-3 7.9-7l2.5-23.8c2.2-20.7 11.2-40.3 25.4-54.6l39.6-39.2C632.7 353.3 640 334 640 305.4c0-31.7-12.3-61.7-34.4-83.7zM472 664a48 48 0 1096 0 48 48 0 10-96 0z" />
              </svg>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <el-input v-model="row.rule" size="small" placeholder="规则" />
          </template>
        </el-table-column>
        <el-table-column label="期望值" min-width="100" show-overflow-tooltip>
          <template #header>
            <span>期望值</span>
            <el-tooltip placement="top">
              <template #content>
                <div class="assert-tooltip-text">
                  期望值填写示例：<br />
                  字符串: "hello"<br />
                  正则: "\\d{1,4}", "hello.*"<br />
                  数组: [1, "str", {"nick": "x"}]<br />
                  对象: {"sex":"male","name":"ab"}<br />
                  除正则表达式外，请确保所有输入均为合法的 JSON 字符串，附两款在线工具辅助填写：<br />
                  <a href="https://www.bejson.com/" target="_blank" rel="noopener noreferrer">JSON 在线校验</a>
                  &nbsp;
                  <a href="https://tool.oschina.net/regex/" target="_blank" rel="noopener noreferrer">正则表达式</a>
                </div>
              </template>
              <svg viewBox="64 64 896 896" class="label-icon" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344.3 352 380.7 352 420v7.6c0 4.3 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-24.3 19.7-44 44-44h7.6c22.5 0 39.6 6.5 52.1 18.8 9.8 9.6 15.3 22.7 15.3 36.7 0 14-5.4 27.3-15.3 37.1L527.7 474c-24.5 24.3-40.5 56-44.2 90.1l-3.1 29.2c-.4 4.2 2.9 7.9 7.1 7.9h48.2c4 0 7.4-3 7.9-7l2.5-23.8c2.2-20.7 11.2-40.3 25.4-54.6l39.6-39.2C632.7 353.3 640 334 640 305.4c0-31.7-12.3-61.7-34.4-83.7zM472 664a48 48 0 1096 0 48 48 0 10-96 0z" />
              </svg>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <el-input v-model="row.expected" size="small" placeholder="期望值" />
          </template>
        </el-table-column>
        <el-table-column label="备注" width="80">
          <template #default="{ row }">
            <el-input v-model="row.remark" size="small" placeholder="备注" />
          </template>
        </el-table-column>
        <el-table-column label="提取变量" width="90">
          <template #default="{ row }">
            <el-input v-model="row.extractVar" size="small" placeholder="提取变量" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #header>
            <el-icon class="add-icon"><Plus /></el-icon>
            <el-button size="small" class="ml-4" @click="handleJsonAdd">JSON添加</el-button>
            <el-button size="small" :disabled="!hasData" @click="handleBatchDelete">批量删除</el-button>
          </template>
          <template #default="{ $index }">
            <el-button link type="danger" size="small" @click="handleDeleteRow($index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!hasData" description="暂无数据" :image-size="64" />
    </div>
  </div>
</template>

<style scoped>
.jsonpath-assert-panel {
  padding-top: 4px;
}

.assert-table {
  margin-top: 16px;
}

.assert-tooltip-text {
  max-width: 180px;
  white-space: normal;
  word-break: break-all;
}

.assert-tooltip-text a {
  color: #1890ff;
}

.label-icon {
  font-size: 12px;
  color: #2695f1;
  margin-left: 4px;
  cursor: help;
  vertical-align: middle;
}

.add-icon {
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
}

.ml-4 {
  margin-left: 4px;
}
</style>
