<script setup lang="ts">
/**
 * 首页
 * 位置: domains/auth/views/
 */
import { useAuthStore } from '../stores/useAuthStore'

const authStore = useAuthStore()
</script>

<template>
  <div class="home-page">
    <h1>欢迎回来，{{ authStore.username || '用户' }}</h1>
    <p>登录成功，您已进入首页。</p>
    <button class="logout-btn" @click="authStore.logout(); $router.push('/login')">
      退出登录
    </button>
  </div>
</template>

<style scoped>
.home-page {
  padding: 48px 24px;
  text-align: center;
}

h1 {
  margin-bottom: 16px;
  color: #1a1a1a;
}

p {
  color: #666;
  margin-bottom: 24px;
}

.logout-btn {
  padding: 10px 24px;
  border: 1px solid #1890ff;
  border-radius: 8px;
  background: #fff;
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e6f7ff;
  }
}
</style>
