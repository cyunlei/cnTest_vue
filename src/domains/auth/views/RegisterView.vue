<script setup lang="ts">
/**
 * 注册页面（独立路由版本）
 * 位置: domains/auth/views/
 */
import AuthLayout from '@/app/layouts/AuthLayout.vue'
import RegisterForm from '../components/RegisterForm.vue'
</script>

<template>
  <AuthLayout>
    <RegisterForm @switch-panel="$router.push('/login')" />
  </AuthLayout>
</template>
