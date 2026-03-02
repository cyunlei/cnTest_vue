<script setup>
/**
 * 登录页面
 * 位置: domains/auth/views/ (领域页面层)
 * 使用 AuthLayout 模板组件
 */
import { ref } from 'vue'
import AuthLayout from '@/app/layouts/AuthLayout.vue'
import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'

const panel = ref('login')

/**
 * 切换面板
 * @param {'login'|'register'} type
 */
function switchPanel(type) {
  panel.value = type
}
</script>

<template>
  <AuthLayout>
    <div class="panel-container">
      <Transition name="panel-slide" mode="out-in">
        <LoginForm 
          v-if="panel === 'login'" 
          @switch-panel="switchPanel('register')" 
        />
        <RegisterForm 
          v-else 
          @switch-panel="switchPanel('login')" 
        />
      </Transition>
    </div>
  </AuthLayout>
</template>

<style scoped>
.panel-container {
  position: relative;
  overflow: hidden;
}

/* 登录/注册面板切换动画 */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.panel-slide-enter-to,
.panel-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
