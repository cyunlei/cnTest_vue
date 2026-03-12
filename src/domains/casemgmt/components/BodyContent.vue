<template>
  <div class="body-content-wrapper" ref="container">
    <div class="content-types">
      <label class="radio-group" :class="{ active: contentType === 'none' }" @click="setContentType('none')">
        <input type="radio" name="contentType" value="none" v-model="contentType"> none
      </label>
      <label class="radio-group" :class="{ active: contentType === 'form-data' }" @click="setContentType('form-data')">
        <input type="radio" name="contentType" value="form-data" v-model="contentType"> form-data
      </label>
      <label class="radio-group" :class="{ active: contentType === 'x-www-form-urlencoded' }" @click="setContentType('x-www-form-urlencoded')">
        <input type="radio" name="contentType" value="x-www-form-urlencoded" v-model="contentType"> x-www-form-urlencoded
      </label>
      <label class="radio-group" :class="{ active: contentType === 'raw' }" @click="setContentType('raw')">
        <input type="radio" name="contentType" value="raw" v-model="contentType"> raw
      </label>
      <label class="radio-group" :class="{ active: contentType === 'binary' }" @click="setContentType('binary')">
        <input type="radio" name="contentType" value="binary" v-model="contentType"> binary
      </label>

      <div class="format-select" id="typeText" ref="typeText" v-show="contentType === 'raw'">
        {{ currentType }}
        <div class="select-dropdown" id="dropdown" ref="dropdown">
          <div @click="switchType('TEXT')">TEXT</div>
          <div @click="switchType('JSON')">JSON</div>
          <div @click="switchType('XML')">XML</div>
          <div @click="switchType('HTML')">HTML</div>
        </div>
      </div>
      <div class="format-btn" id="formatBtn" ref="formatBtn" @click="formatContent" v-show="contentType === 'raw' && currentType !== 'TEXT'">格式化</div>

    </div>

    <div class="body-area">
      <body-none v-if="contentType === 'none'" />
      <body-form-data
        v-if="contentType === 'form-data'"
        ref="bodyFormDataRef"
        v-model="formData"
      />
      <body-urlencoded
        v-if="contentType === 'x-www-form-urlencoded'"
        v-model="urlencoded"
      />
      <body-binary
        v-if="contentType === 'binary'"
        v-model="binary"
      />
      <body-raw
        v-if="contentType === 'raw'"
        ref="rawContentRef"
        :content-type="currentType"
        :model-value="rawContent"
        @update:model-value="updateBodyData('raw', $event)"
      />
    </div>

    <div class="global-dropdown" id="tableDropdown" ref="tableDropdown">
      <label class="dropdown-item">
        <input type="checkbox" value="value" checked @change="toggleColumn"> value
      </label>
      <label class="dropdown-item">
        <input type="checkbox" value="contentType" @change="toggleColumn"> Content-Type
      </label>
      <label class="dropdown-item">
        <input type="checkbox" value="desc" checked @change="toggleColumn"> Description
      </label>
    </div>
  </div>
</template>

<script>
import BodyNone from './body/BodyNone.vue'
import BodyFormData from './body/BodyFormData.vue'
import BodyUrlencoded from './body/BodyUrlencoded.vue'
import BodyBinary from './body/BodyBinary.vue'
import BodyRaw from './body/BodyRaw.vue'

export default {
  name: 'BodyContent',
  components: {
    BodyNone,
    BodyFormData,
    BodyUrlencoded,
    BodyBinary,
    BodyRaw
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({
        contentType: 'form-data',
        formData: [],
        urlencoded: [],
        raw: '',
        rawType: 'json',
        binary: null
      })
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      activeDropdown: null
    }
  },
  computed: {
    contentType: {
      get() {
        const ct = this.modelValue?.contentType || 'form-data'
        return ct === 'formData' ? 'form-data' : ct
      },
      set(val) {
        const mapped = val === 'form-data' ? 'formData' : val
        this.updateBodyData('contentType', mapped)
      }
    },
    currentType: {
      get() {
        return (this.modelValue?.rawType || 'json').toUpperCase()
      },
      set(val) {
        this.updateBodyData('rawType', val.toLowerCase())
      }
    },
    formData: {
      get() {
        return this.modelValue?.formData || []
      },
      set(val) {
        this.updateBodyData('formData', val)
      }
    },
    urlencoded: {
      get() {
        return this.modelValue?.urlencoded || []
      },
      set(val) {
        this.updateBodyData('urlencoded', val)
      }
    },
    binary: {
      get() {
        return this.modelValue?.binary || null
      },
      set(val) {
        this.updateBodyData('binary', val)
      }
    },
    rawContent: {
      get() {
        return this.modelValue?.raw || ''
      },
      set(val) {
        this.updateBodyData('raw', val)
      }
    }
  },
  mounted() {
    this.init()
    document.addEventListener('click', (e) => {
      if (this.activeDropdown && !this.activeDropdown.contains(e.target)) {
        this.closeAllDropdowns()
      }
    })
  },
  methods: {
    updateBodyData(key, val) {
      const newVal = { ...this.modelValue, [key]: val }
      this.$emit('update:modelValue', newVal)
    },
    init() {
      this.bindDropdownEvents(this.$refs.typeText, this.$refs.dropdown)
    },

    closeAllDropdowns() {
      if (this.activeDropdown) {
        this.activeDropdown.style.display = 'none'
        this.activeDropdown = null
      }
    },

    bindDropdownEvents(trigger, dropdown) {
      if (!trigger || !dropdown) return
      trigger.addEventListener('click', (e) => {
        e.stopPropagation()
        this.closeAllDropdowns()
        const rect = trigger.getBoundingClientRect()
        dropdown.style.left = rect.left + 'px'
        dropdown.style.top = (rect.bottom + 2) + 'px'
        dropdown.style.display = 'block'
        this.activeDropdown = dropdown
      })
      dropdown.addEventListener('mouseleave', () => {
        this.closeAllDropdowns()
      })
      dropdown.addEventListener('click', (e) => {
        e.stopPropagation()
      })
    },

    toggleColumn() {
      const container = this.$refs.container
      const showValue = container.querySelector('input[value="value"]').checked
      const showCt = container.querySelector('input[value="contentType"]').checked
      const showDesc = container.querySelector('input[value="desc"]').checked

      container.querySelectorAll('.col-value').forEach(el => {
        el.classList.toggle('hide-column', !showValue)
      })
      container.querySelectorAll('.col-content-type').forEach(el => {
        el.classList.toggle('hide-column', !showCt)
      })
      container.querySelectorAll('.col-desc').forEach(el => {
        el.classList.toggle('hide-column', !showDesc)
      })
    },

    setContentType(type) {
      this.contentType = type
    },

    switchType(type) {
      this.currentType = type
      this.closeAllDropdowns()
    },

    formatContent() {
      this.$refs.rawContentRef?.formatContent()
    }
  }
}
</script>

<style>
.body-content-wrapper {
  width: 100%;
}

.content-types {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #fff;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.radio-group {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
}

.radio-group input[type="radio"] {
  cursor: pointer;
}

.radio-group.active {
  color: #2563eb;
  font-weight: 500;
}

.format-select {
  position: relative;
  font-size: 13px;
  color: #25aae2;
  cursor: pointer;
  padding: 4px 0;
  user-select: none;
  margin-left: auto;
}

.select-dropdown {
  display: none;
  position: fixed;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  width: 49px;
  z-index: 9999;
}

.select-dropdown div {
  padding: 6px 8px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
}

.select-dropdown div:hover {
  background-color: #f3f6f6;
}

.format-btn {
  margin-left: 8px;
  font-size: 13px;
  color: #2563eb;
  cursor: pointer;
}

.format-btn:hover {
  text-decoration: underline;
}

.form-data-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.column-toggle-btn {
  color: #666;
  border: none;
  background: none;
  font-size: 16px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
}

.column-toggle-btn:hover {
  background-color: #eee;
}

.bulk-edit-btn {
  color: #007cbf;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  border: none;
  background: none;
}

.bulk-edit-btn:hover {
  background-color: #eee;
  text-decoration: underline;
}

.body-area {
  position: relative;
  padding: 0;
  overflow: visible;
  width: 100%;
  box-sizing: border-box;
}

.body-area :deep(.body-form-data),
.body-area :deep(.outer-container),
.body-area :deep(.table-container) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.editor {
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

.editor.none {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  background-color: #f9fafb;
  cursor: not-allowed;
  resize: none;
}

.binary-file-area {
  padding: 16px;
}

.file-select-btn {
  padding: 8px 16px;
  border: 2px solid #2563eb;
  border-radius: 4px;
  background: #fff;
  color: #2563eb;
  cursor: pointer;
  font-size: 14px;
  width: 240px;
  text-align: left;
}

.file-dropdown {
  margin-top: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  width: 240px;
  background: #fff;
}

.file-dropdown div {
  padding: 8px 16px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
}

.global-dropdown {
  display: none;
  position: fixed;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  width: 130px;
  padding: 8px;
  z-index: 99999;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  font-size: 12px;
  color: #4b5563;
  cursor: pointer;
}
</style>
