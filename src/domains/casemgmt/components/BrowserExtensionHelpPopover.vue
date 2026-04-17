<script setup>
import { computed } from 'vue'

const isFirefox = computed(() => /Firefox/i.test(navigator.userAgent))
const isChrome = computed(() => /Chrome|Edg|OPR|Brave/i.test(navigator.userAgent) && !/Firefox/i.test(navigator.userAgent))

const chromeHelp = `
<div style="font-size:13px;line-height:1.6;color:#303133;">
  <p style="margin:0 0 6px 0;font-weight:600;">Google Chrome 安装方式</p>
  <ol style="padding-left:16px;margin:0 0 8px 0;">
    <li>打开 chrome://extensions/</li>
    <li>右上角打开<strong>开发者模式</strong></li>
    <li>点击<strong>加载已解压的扩展程序</strong></li>
    <li>选择 browser-extension 目录（默认已含 manifest.json）</li>
  </ol>
  <p style="margin:0;">
    <a href="/browser-extension-chrome.zip" download style="color:#409eff;text-decoration:none;">下载浏览器插件（Chrome）</a>
  </p>
</div>
`

const firefoxHelp = `
<div style="font-size:13px;line-height:1.6;color:#303133;">
  <p style="margin:0 0 6px 0;font-weight:600;">Mozilla Firefox 安装方式</p>
  <ol style="padding-left:16px;margin:0 0 8px 0;">
    <li>打开 about:debugging#/runtime/this-firefox</li>
    <li>点击<strong>临时载入附加组件</strong></li>
    <li>选择 browser-extension/manifest-firefox.json</li>
  </ol>
  <p style="margin:0;">
    <a href="/browser-extension-firefox.zip" download style="color:#409eff;text-decoration:none;">下载浏览器插件（Firefox）</a>
  </p>
</div>
`

const defaultHelp = chromeHelp

const contentHtml = computed(() => {
  if (isFirefox.value) return firefoxHelp
  if (isChrome.value) return chromeHelp
  return defaultHelp
})
</script>

<template>
  <div class="help-popover" v-html="contentHtml" />
</template>

<style scoped>
.help-popover {
  max-width: 320px;
}
</style>
