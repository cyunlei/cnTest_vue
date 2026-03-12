<template>
  <div class="body-none">
    此请求没有请求体
  </div>
</template>

<script setup>
defineOptions({ name: 'BodyNone' })
</script>

<style scoped>
.body-none {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: #9ca3af;
  background-color: #f9fafb;
  font-size: 14px;
}
</style>
