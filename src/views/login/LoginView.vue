<template>
  <div class="login-page">
    <div class="hero">
      <div class="hero-content">
        <div class="logo">
          <span class="logo-icon">Js</span>
          <span class="logo-text">cnTest</span>
        </div>
        <h1 class="slogan">
          全场景自动化测试<br />高效交付
        </h1>
        <ul class="features">
          <li><span class="check">✓</span> 永久免费</li>
          <li><span class="check">✓</span> 实时在线</li>
          <li><span class="check">✓</span> 需求管理/测试/持续交付</li>
        </ul>
        <div class="footer-links">
          © 2026 Js.Design Inc. All rights reserved.
          <a href="#">服务条款</a>
          <a href="#">隐私协议</a>
        </div>
      </div>
    </div>

    <div class="form-wrap">
      <div class="avatar-side">
        <div class="avatar-circle" />
      </div>
      <div class="login-card">
        <LoginForm v-if="panel === 'login'" @to-register="panel = 'register'" />
        <RegisterForm v-else @to-login="panel = 'login'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from '@/views/register/RegisterForm.vue'

const panel = ref('login') // 'login' | 'register'
</script>

<style lang="scss" scoped>
@use './Login.scss';
</style>
