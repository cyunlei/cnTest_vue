import { computed, ref } from 'vue'

const loadingCounter = ref(0)
const loadingText = ref('加载中...')

const isGlobalLoading = computed(() => loadingCounter.value > 0)

export function showGlobalLoading(text = '') {
  if (typeof text === 'string' && text.trim()) {
    loadingText.value = text.trim()
  }
  loadingCounter.value += 1
}

export function hideGlobalLoading() {
  if (loadingCounter.value > 0) {
    loadingCounter.value -= 1
  }
  if (loadingCounter.value === 0) {
    loadingText.value = '加载中...'
  }
}

export async function withGlobalLoading(task, text = '') {
  showGlobalLoading(text)
  try {
    return await task()
  } finally {
    hideGlobalLoading()
  }
}

export function useGlobalLoading() {
  return {
    isGlobalLoading,
    loadingText,
    showGlobalLoading,
    hideGlobalLoading,
    withGlobalLoading
  }
}

