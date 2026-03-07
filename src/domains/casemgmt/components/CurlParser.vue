<script setup>
/**
 * cURL / PowerShell / Fetch 命令解析组件
 * 基于 a.html 的功能封装
 */
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  method: {
    type: String,
    default: 'GET'
  }
})

const emit = defineEmits([
  'update:modelValue',
  'update:method',
  'parse:params',
  'parse:headers',
  'parse:body'
])

const inputValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// ================= 工具函数 =================
const Utils = {
  // 格式化 JSON Body
  formatJsonBody(rawBody) {
    if (!rawBody || rawBody.trim() === '') return ''
    try {
      return JSON.stringify(JSON.parse(rawBody.trim()), null, 2)
    } catch {
      try {
        const fixedBody = rawBody
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/'/g, '"')
        return JSON.stringify(JSON.parse(fixedBody), null, 2)
      } catch {
        return rawBody
      }
    }
  },

  // 清理 PowerShell 转义符
  cleanPowerShellEscapes(str) {
    return str.replace(/`"/g, '"').replace(/`'/g, "'").replace(/`([\s\S])/g, '$1')
  }
}

// ================= 解析策略 =================
const ParseStrategies = {
  // 策略 1: PowerShell 原生语法
  powershell: {
    detect(input) {
      return /Invoke-WebRequest|Invoke-RestMethod|iwr\s/i.test(input)
    },
    parse(processed, result) {
      // Method
      const methodMatch = processed.match(/-Method\s+["']?([A-Za-z]+)["']?/i)
      if (methodMatch) result.method = methodMatch[1].toUpperCase()

      // URL
      const uriMatch = processed.match(/-Uri\s+["']?([^\s"']+)["']?/i)
      if (uriMatch) result.url = uriMatch[1].replace(/["']/g, '')

      // Headers
      const headersMatch = processed.match(/-Headers\s+@\{([\s\S]*?)\}/i)
      if (headersMatch) {
        const headerRegex = /"([^"]+)"\s*=\s*"([\s\S]*?)(?<!`)"/g
        let headerMatch
        while ((headerMatch = headerRegex.exec(headersMatch[1])) !== null) {
          result.headers[headerMatch[1].trim()] = Utils.cleanPowerShellEscapes(headerMatch[2].trim())
        }
      }

      // ContentType
      const contentTypeMatch = processed.match(/-ContentType\s+["']([^"']+)["']/i)
      if (contentTypeMatch) result.headers['Content-Type'] = contentTypeMatch[1]

      // Body
      const bodyMatch = processed.match(/-Body\s+["']([\s\S]*?)["'](?=\s+-|$)/i)
      if (bodyMatch) {
        const rawBody = Utils.cleanPowerShellEscapes(bodyMatch[1])
        result.body = Utils.formatJsonBody(rawBody)
      }

      if (result.body && !methodMatch) result.method = 'POST'
    }
  },

  // 策略 2: Cmd/Bash Curl
  curl: {
    detect(input) {
      return input.toLowerCase().startsWith('curl')
    },
    parse(processed, result) {
      // 预处理：清理 cmd ^ 转义
      processed = processed.replace(/\^/g, '')
        .replace(/\\r?\n/g, ' ')
        .replace(/\r?\n/g, ' ')
        .replace(/\s+/g, ' ').trim()

      // Method
      const methodMatch = processed.match(/-X\s+([A-Za-z]+)/i)
      if (methodMatch) result.method = methodMatch[1].toUpperCase()

      // URL
      const urlMatch = processed.match(/https?:\/\/[^\s"']+/i)
      if (urlMatch) result.url = urlMatch[0].replace(/["']/g, '')

      // Headers
      const headerRegex = /-H\s+["']([^"']+)["']/gi
      let headerMatch
      while ((headerMatch = headerRegex.exec(processed)) !== null) {
        const colonIdx = headerMatch[1].indexOf(':')
        if (colonIdx > 0) {
          result.headers[headerMatch[1].slice(0, colonIdx).trim()] = headerMatch[1].slice(colonIdx + 1).trim()
        }
      }

      // Cookie
      const cookieMatch = processed.match(/-b\s+["']([^"']+)["']/i)
      if (cookieMatch) result.headers['Cookie'] = cookieMatch[1]

      // Body
      const bodyFlagMatch = processed.match(/(--data-raw|--data|-d)\s+/i)
      if (bodyFlagMatch) {
        const afterFlag = processed.slice(bodyFlagMatch.index + bodyFlagMatch[0].length)
        const startQuote = afterFlag[0]
        if (startQuote === '"' || startQuote === "'") {
          let endIdx = -1, escapeCount = 0
          for (let i = 1; i < afterFlag.length; i++) {
            if (startQuote === '"' && afterFlag[i] === startQuote && afterFlag[i-1] === startQuote) { i++; continue }
            if (startQuote === '"') {
              if (afterFlag[i] === startQuote && escapeCount % 2 === 0) { endIdx = i; break }
              escapeCount = afterFlag[i] === '\\' ? escapeCount + 1 : 0
            } else if (afterFlag[i] === startQuote) { endIdx = i; break }
          }
          if (endIdx !== -1) {
            const rawBody = afterFlag.slice(1, endIdx).replace(/""/g, '"').replace(/\\"/g, '"')
            result.body = Utils.formatJsonBody(rawBody)
          }
        }
      }
      if (result.body && !methodMatch) result.method = 'POST'
    }
  },

  // 策略 3: Fetch 代码
  fetch: {
    detect(input) {
      return /^fetch\s*\(/i.test(input)
    },
    parse(processed, result) {
      // URL
      const urlMatch = processed.match(/fetch\s*\(\s*["']([^"']+)["']/i)
      if (urlMatch) result.url = urlMatch[1].replace(/["']/g, '')

      // Method
      const methodMatch = processed.match(/"?method"?\s*:\s*["']([A-Za-z]+)["']/i)
      if (methodMatch) result.method = methodMatch[1].toUpperCase()

      // Headers
      const headersMatch = processed.match(/"?headers"?\s*:\s*\{([^}]+)\}/i)
      if (headersMatch) {
        headersMatch[1].split(/,/).filter(p => p.trim()).forEach(pair => {
          const colonIdx = pair.indexOf(':')
          if (colonIdx > 0) {
            const key = pair.slice(0, colonIdx).trim().replace(/^["']|["']$/g, '')
            const val = pair.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '').replace(/\\"/g, '"')
            if (key) result.headers[key] = val
          }
        })
      }

      // Body
      const bodyFlagMatch = processed.match(/"?body"?\s*:\s*/i)
      if (bodyFlagMatch) {
        const afterFlag = processed.slice(bodyFlagMatch.index + bodyFlagMatch[0].length)
        const startQuote = afterFlag[0]
        if (startQuote === '"' || startQuote === "'") {
          let endIdx = -1, escapeCount = 0
          for (let i = 1; i < afterFlag.length; i++) {
            if (afterFlag[i] === startQuote && afterFlag[i-1] === '\\') { i++; continue }
            if (afterFlag[i] === startQuote && escapeCount % 2 === 0) { endIdx = i; break }
            escapeCount = afterFlag[i] === '\\' ? escapeCount + 1 : 0
          }
          if (endIdx !== -1) {
            const rawBody = afterFlag.slice(1, endIdx).replace(/\\"/g, '"')
            result.body = Utils.formatJsonBody(rawBody)
          }
        }
      }
      if (result.body && !methodMatch) result.method = 'POST'
    }
  },

  // 策略 4: 普通 URL (默认兜底)
  url: {
    detect() { return true },
    parse(processed, result) {
      result.url = processed.replace(/["']/g, '')
    }
  }
}

// ================= 主解析函数 =================
function parseUniversalInput(inputStr) {
  const result = { method: 'GET', url: '', headers: {}, body: '' }
  const originalInput = inputStr.trim()

  if (!originalInput) return result

  // 遍历策略，找到第一个匹配的解析器
  const strategies = [
    ParseStrategies.powershell,
    ParseStrategies.curl,
    ParseStrategies.fetch,
    ParseStrategies.url
  ]

  const matchedStrategy = strategies.find(s => s.detect(originalInput))

  if (matchedStrategy) {
    matchedStrategy.parse(originalInput, result)
  }

  // 解析 URL Query 参数
  if (result.url.includes('?')) {
    const [baseUrl, queryStr] = result.url.split('?', 2)
    result.url = baseUrl
    const searchParams = new URLSearchParams(queryStr)
    const params = {}
    searchParams.forEach((value, key) => { params[key] = value })
    result.params = params
  } else {
    result.params = {}
  }

  return result
}

// ================= 组件方法 =================
const isCommand = computed(() => {
  return /curl|Invoke-WebRequest|Invoke-RestMethod|iwr|fetch\s*\(/i.test(props.modelValue)
})

function handleParse(e) {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  
  const inputValue = props.modelValue.trim()
  if (!inputValue) return

  const parsedData = parseUniversalInput(inputValue)

  // 如果是命令，更新 URL 为解析后的 URL
  if (isCommand.value && parsedData.url) {
    emit('update:modelValue', parsedData.url)
  }

  // 更新 Method
  if (parsedData.method) {
    emit('update:method', parsedData.method)
  }

  // 触发解析结果事件
  emit('parse:params', parsedData.params || {})
  emit('parse:headers', parsedData.headers || {})
  emit('parse:body', parsedData.body || '')
}

function handleKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault()
    e.stopPropagation()
    handleParse()
  }
}

defineExpose({
  handleParse
})
</script>

<template>
  <div class="curl-parser">
    <div class="input-wrapper">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @keydown="handleKeydown"
        class="curl-input"
        placeholder="粘贴 cmd curl / PowerShell / fetch / URL 到这里，按回车解析..."
      />
      <button class="parse-btn" @click.stop="handleParse" title="点击解析 / 按回车解析">
        ↵
      </button>
    </div>
    <div class="tip">支持: cmd curl / PowerShell / bash curl / fetch / 普通URL</div>
  </div>
</template>

<style scoped>
.curl-parser {
  width: 100%;
}

.input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}

.curl-input {
  flex: 1;
  height: 32px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 13px;
  transition: border-color 0.2s;
  min-width: 0;
}

.curl-input:focus {
  outline: none;
  border-color: #409eff;
}

.parse-btn {
  height: 32px;
  width: 46px;
  padding: 0;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 0 4px 4px 0;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}

.parse-btn:hover {
  background: #66b1ff;
}

.tip {
  display: none;
}
</style>