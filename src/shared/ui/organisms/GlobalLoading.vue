<script setup>
import { useGlobalLoading } from '@/shared/composables/useGlobalLoading'

const { isGlobalLoading } = useGlobalLoading()
</script>

<template>
  <teleport to="body">
    <transition name="global-loading-fade">
      <div v-if="isGlobalLoading" class="global-loading-mask">
        <div class="dot-spinner" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.global-loading-mask {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.dot-spinner {
  position: relative;
  width: 22px;
  height: 22px;
  animation: dot-rotate 1.2s linear infinite;
}

.dot-spinner span {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #409eff;
}

.dot-spinner span:nth-child(1) {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.dot-spinner span:nth-child(2) {
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.dot-spinner span:nth-child(3) {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.dot-spinner span:nth-child(4) {
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}

.global-loading-fade-enter-active,
.global-loading-fade-leave-active {
  transition: opacity 0.2s ease;
}

.global-loading-fade-enter-from,
.global-loading-fade-leave-to {
  opacity: 0;
}

@keyframes dot-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

