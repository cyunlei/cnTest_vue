<script setup>
/**
 * 根组件
 * 职责: 应用级容器，仅渲染路由视图
 */
import GlobalLoading from '@/shared/ui/organisms/GlobalLoading.vue'
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <template v-if="route.meta.keepAlive">
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
    </template>
    <component :is="Component" v-else />
  </router-view>
  <GlobalLoading />
</template>

<style>
/* 全局基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}
</style>
