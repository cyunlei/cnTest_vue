<template>
  <div class="raw-area">
    <div class="raw-editor-wrap">
      <!-- 高亮层：只展示，不接收鼠标事件 -->
      <pre
        ref="rawHighlight"
        class="raw-highlight raw-editor"
        aria-hidden="true"
        v-html="highlightedHtml"
      ></pre>

      <!-- 输入层：透明文字，只保留光标与选区交互 -->
      <textarea
        ref="rawEditor"
        class="raw-input raw-editor"
        :placeholder="placeholder"
        :value="content"
        @input="onInput"
        @scroll="syncScroll"
      />
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'

export default {
  name: 'RawContent',
  emits: ['input'],
  props: {
    contentType: {
      type: String,
      default: 'JSON'
    },
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入内容...'
    }
  },
  data() {
    return {
      content: ''
    }
  },
  computed: {
    highlightedHtml() {
      const text = this.content ?? ''
      const escaped = this.escapeHtml(text)
      if (!text) return ''

      if (String(this.contentType || '').toUpperCase() !== 'JSON') {
        return escaped
      }

      // 参考 json.cn：即使 JSON 不完全合法也做 token 高亮
      return this.highlightJson(escaped)
    }
  },
  watch: {
    modelValue: {
      handler(val) {
        if (val !== this.content) {
          this.content = val || ''
          this.$nextTick(() => this.syncScroll())
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.content = this.modelValue || ''
    this.$nextTick(() => this.syncScroll())
  },
  methods: {
    onInput(e) {
      this.content = e?.target?.value ?? ''
      this.$emit('input', this.content)
      this.$nextTick(() => this.syncScroll())
    },

    formatContent() {
      const content = (this.content || '').trim()
      if (!content) return
      
      try {
        const type = String(this.contentType || '').toUpperCase()
        if (type === 'TEXT') {
          return
        }
        if (type === 'JSON') {
          const jsonObj = this.parseJsonOrToast(content)
          if (!jsonObj) return
          const formatted = JSON.stringify(jsonObj, null, 2)
          this.content = formatted
          this.$emit('input', formatted)
          this.$nextTick(() => this.syncScroll())
          return
        }
        if (type === 'XML') {
          const xmlOk = this.validateXmlOrToast(content)
          if (!xmlOk) return
          const formatted = this.formatXml(content)
          this.content = formatted
          this.$emit('input', formatted)
          this.$nextTick(() => this.syncScroll())
          return
        }
        if (type === 'HTML') {
          const htmlOk = this.validateHtmlOrToast(content)
          if (!htmlOk) return
          const formatted = this.formatHtml(content)
          this.content = formatted
          this.$emit('input', formatted)
          this.$nextTick(() => this.syncScroll())
          return
        }
      } catch (e) {
        this.toastError('格式化失败，请检查内容格式！')
      }
    },

    setContent(content) {
      this.content = content || ''
      this.$emit('input', this.content)
      this.$nextTick(() => this.syncScroll())
    },

    syncScroll() {
      const input = this.$refs.rawEditor
      const hl = this.$refs.rawHighlight
      if (!input || !hl) return
      hl.scrollTop = input.scrollTop
      hl.scrollLeft = input.scrollLeft
    },

    escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    },

    highlightJson(escaped) {
      // 参考 json.cn 的常见配色：key 紫、string 绿、number 蓝、boolean 粉、null 橙、括号灰
      let s = escaped
      // key: "xxx":
      s = s.replace(/&quot;([^&\\]*(?:\.[^&\\]*)*)&quot;(?=\s*:)/g, '<span class="json-key">&quot;$1&quot;</span>')
      // string value: : "xxx"
      s = s.replace(/:\s*&quot;([^&\\]*(?:\.[^&\\]*)*)&quot;/g, ': <span class="json-string">&quot;$1&quot;</span>')
      // number
      s = s.replace(/:\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g, ': <span class="json-number">$1</span>')
      // boolean
      s = s.replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
      // null
      s = s.replace(/:\s*(null)/g, ': <span class="json-null">$1</span>')
      // braces / brackets
      s = s.replace(/([{}\[\]])/g, '<span class="json-brace">$1</span>')
      return s
    },

    toastError(message) {
      ElMessage({
        type: 'error',
        message,
        duration: 4000,
        showClose: true
      })
    },

    getLineColFromIndex(text, index) {
      const s = String(text || '')
      const i = Math.max(0, Math.min(Number(index) || 0, s.length))
      let line = 1
      let lastNl = -1
      for (let p = 0; p < i; p++) {
        if (s.charCodeAt(p) === 10) {
          line++
          lastNl = p
        }
      }
      const col = i - lastNl
      return { line, col }
    },

    parseJsonOrToast(text) {
      try {
        return JSON.parse(text)
      } catch (err) {
        const msg = String(err?.message || 'JSON 格式错误')
        const m = msg.match(/position\s+(\d+)/i)
        if (m) {
          const pos = Number(m[1])
          const { line, col } = this.getLineColFromIndex(text, pos)
          this.toastError(`JSON 格式错误：第 ${line} 行，第 ${col} 列。`)
        } else {
          this.toastError(`JSON 格式错误：${msg}`)
        }
        return null
      }
    },

    validateXmlOrToast(text) {
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'application/xml')
        const pe = doc.getElementsByTagName('parsererror')?.[0]
        if (!pe) return true
        const peText = pe.textContent || ''
        const lm = peText.match(/line\s*(\d+)/i)
        const cm = peText.match(/column\s*(\d+)/i)
        if (lm) {
          const line = Number(lm[1])
          const col = cm ? Number(cm[1]) : 1
          this.toastError(`XML 格式错误：第 ${line} 行，第 ${col} 列。`)
        } else {
          this.toastError('XML 格式错误：请检查标签是否闭合、是否有非法字符。')
        }
        return false
      } catch {
        this.toastError('XML 格式错误：无法解析。')
        return false
      }
    },

    validateHtmlOrToast(text) {
      const res = this.validateHtmlBasic(text)
      if (res.ok) return true
      this.toastError(`HTML 格式错误：第 ${res.line} 行，${res.message}`)
      return false
    },

    validateHtmlBasic(text) {
      const src = String(text || '')
      const voidTags = new Set([
        'AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK',
        'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'
      ])

      const tagRe = /<!--[\s\S]*?-->|<!DOCTYPE[\s\S]*?>|<\/?[a-zA-Z][^>]*?>/g
      const stack = []
      let line = 1
      let lastIndex = 0
      let m
      while ((m = tagRe.exec(src))) {
        const chunk = src.slice(lastIndex, m.index)
        line += (chunk.match(/\n/g) || []).length
        lastIndex = m.index + m[0].length

        const token = m[0]
        if (token.startsWith('<!--') || token.startsWith('<!DOCTYPE') || token.startsWith('<!doctype')) continue
        const isClose = /^<\//.test(token)
        const nameMatch = token.match(/^<\/?\s*([a-zA-Z0-9-]+)/)
        if (!nameMatch) continue
        const name = nameMatch[1].toUpperCase()
        const isSelfClosing = /\/>$/.test(token) || voidTags.has(name)
        if (isSelfClosing) continue

        if (!isClose) {
          stack.push({ name, line })
          continue
        }

        const top = stack.pop()
        if (!top) return { ok: false, line, message: `多余的闭合标签 </${name.toLowerCase()}>` }
        if (top.name !== name) {
          return {
            ok: false,
            line,
            message: `标签不匹配，期望 </${top.name.toLowerCase()}>，却遇到 </${name.toLowerCase()}>`
          }
        }
      }

      if (stack.length) {
        const last = stack[stack.length - 1]
        return { ok: false, line: last.line, message: `缺少闭合标签 </${last.name.toLowerCase()}>` }
      }
      return { ok: true, line: 1, message: '' }
    },

    formatXml(xml) {
      // 轻量 XML pretty print：按标签分行 + 缩进
      const input = String(xml || '').trim()
      const withNewlines = input
        .replace(/>\s*</g, '>\n<')
        .replace(/\r\n/g, '\n')

      const lines = withNewlines.split('\n')
      let indent = 0
      const out = []
      for (const line of lines) {
        const l = line.trim()
        if (!l) continue
        if (/^<\/.+>/.test(l)) indent = Math.max(0, indent - 1)
        out.push(`${'  '.repeat(indent)}${l}`)
        if (/^<[^!?/][^>]*[^/]>$/.test(l) && !/^<.*<\/.*>$/.test(l)) indent += 1
      }
      return out.join('\n')
    },

    formatHtml(html) {
      // 轻量 HTML pretty print：按标签分行 + 缩进（不保证 100% 等价，仅用于展示）
      const input = String(html || '').trim()
      const withNewlines = input
        .replace(/>\s*</g, '>\n<')
        .replace(/\r\n/g, '\n')

      const voidTags = new Set([
        'AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK',
        'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'
      ])

      const lines = withNewlines.split('\n')
      let indent = 0
      const out = []
      for (const line of lines) {
        const l = line.trim()
        if (!l) continue
        const mOpen = l.match(/^<([a-zA-Z0-9-]+)(\s|>|\/>)/)
        const tagName = mOpen ? mOpen[1].toUpperCase() : ''

        if (/^<\/.+>/.test(l)) indent = Math.max(0, indent - 1)
        out.push(`${'  '.repeat(indent)}${l}`)

        const isClosing = /^<\//.test(l)
        const isSelfClosing = /\/>$/.test(l) || (tagName && voidTags.has(tagName))
        const isOneLine = /^<.*<\/.*>$/.test(l)
        if (!isClosing && !isSelfClosing && !isOneLine && /^<[^!?]/.test(l)) indent += 1
      }
      return out.join('\n')
    },

    debugDump() {
      // reserved for debugging; no-op
    }
  }
}
</script>

<style>
.raw-area {
  padding: 0;
}

.raw-editor-wrap {
  position: relative;
  width: 100%;
}

.raw-editor {
  width: 100%;
  min-height: 180px;
  height: 180px;
  border: none;
  border-radius: 0;
  padding: 12px;
  font-size: 14px;
  resize: vertical;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  white-space: pre;
  overflow-wrap: normal;
  line-height: 1.5;
  overflow-y: auto;
  overflow-x: auto;
  outline: none;
  box-sizing: border-box;
}

.raw-highlight {
  position: absolute;
  inset: 0;
  margin: 0;
  pointer-events: none;
  color: #111827;
  z-index: 0;
  background: #fff;
}

.raw-input {
  position: relative;
  z-index: 1;
  background: transparent !important;
  background-color: transparent !important;
  color: transparent !important; /* 文字透明，显示高亮层 */
  -webkit-text-fill-color: transparent !important; /* Safari/Chromium: 确保文字不盖住高亮 */
  caret-color: #111827; /* 光标颜色 */
  text-shadow: 0 0 0 transparent; /* 兼容某些浏览器/主题的 text-fill */
}

.raw-input::selection {
  background: rgba(59, 130, 246, 0.25);
}

/* 颜色：贴近 json.cn 风格（偏亮/清晰） */
.json-key { color: #92278f; }
.json-string { color: #3ab54a; }
.json-number { color: #25aae2; }
.json-boolean { color: #f98280; }
.json-null { color: #f1592a; }
.json-brace { color: #586e75; }
</style>
