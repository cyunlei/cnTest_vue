<template>
  <div class="raw-area">
    <div
      ref="rawEditor"
      class="raw-editor"
      contenteditable="true"
      placeholder="请输入内容..."
      @input="onInput"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'RawContent',
  props: {
    contentType: {
      type: String,
      default: 'JSON'
    },
    modelValue: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      content: ''
    }
  },
  watch: {
    modelValue: {
      handler(val) {
        if (val !== this.content && this.$refs.rawEditor) {
          this.$refs.rawEditor.innerText = val || ''
          this.content = val || ''
        }
      },
      immediate: true
    }
  },
  mounted() {
    if (this.modelValue && this.$refs.rawEditor) {
      this.$refs.rawEditor.innerText = this.modelValue
      this.content = this.modelValue
    }
  },
  methods: {
    onInput() {
      if (this.$refs.rawEditor) {
        this.content = this.$refs.rawEditor.innerText
        this.$emit('input', this.content)
      }
    },

    formatContent() {
      const editor = this.$refs.rawEditor
      if (!editor) return
      
      const content = editor.innerText.trim()
      if (!content) return
      
      try {
        if (this.contentType === 'JSON') {
          const jsonObj = JSON.parse(content)
          const formatted = JSON.stringify(jsonObj, null, 2)
          editor.innerHTML = formatted
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"([^"\\]*(\\.[^"\\]*)*)"\s*:/g, '<span class="json-key">"$1"</span>:')
            .replace(/: "([^"\\]*(\\.[^"\\]*)*)"/g, ': <span class="json-string">"$1"</span>')
            .replace(/: (\d+(\.\d+)?)/g, ': <span class="json-number">$1</span>')
            .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
            .replace(/: null/g, ': <span class="json-null">null</span>')
            .replace(/([{}[\]])/g, '<span class="json-brace">$1</span>')
          this.content = formatted
          this.$emit('input', formatted)
        }
      } catch (e) {
        alert('JSON格式错误！')
      }
    },

    setContent(content) {
      if (this.$refs.rawEditor) {
        this.$refs.rawEditor.innerText = content
        this.content = content
      }
    }
  }
}
</script>

<style>
.raw-area {
  padding: 0;
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
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
  overflow-y: auto;
  outline: none;
}

.raw-editor:empty:before {
  content: attr(placeholder);
  color: #999;
}

.json-key { color: #92278f; }
.json-string { color: #3ab54a; }
.json-number { color: #25aae2; }
.json-boolean { color: #f98280; }
.json-null { color: #f1592a; }
.json-brace { color: #586e75; }
</style>
