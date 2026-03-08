<template>
  <div class="nested-container">
    <table class="form-data-table" ref="table">
      <thead>
        <tr>
          <th class="col-checkbox"></th>
          <th class="col-key">Key</th>
          <th class="col-value">Value</th>
          <th class="col-content-type hide-column">Content-Type</th>
          <th class="col-desc">Description</th>
          <th class="col-bulk">
            <div class="header-bulk-wrapper">
              <div class="header-more-container">
                <div class="header-more-btn" ref="moreBtn">⋯</div>
              </div>
              <span class="header-bulk-edit">Bulk Edit</span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="col-checkbox"><input type="checkbox"></td>
          <td class="col-key">
            <table class="key-split-table">
              <tbody>
                <tr>
                  <td class="key-input-cell"><input type="text" class="key-input" placeholder="Key"></td>
                  <td class="type-select-cell">
                    <div class="row-value-type-select">
                      <div class="row-value-type-btn">Text</div>
                      <div class="row-value-type-dropdown">
                        <div>Text</div>
                        <div>File</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
          <td class="col-value">
            <div class="value-wrapper">
              <input type="text" class="table-input value-input" placeholder="Value">
              <div class="file-select-dropdown">
                <div class="file-option">+选择本地文件</div>
              </div>
            </div>
          </td>
          <td class="col-content-type hide-column"><input type="text" class="table-input" placeholder="Auto" value="Auto"></td>
          <td class="col-desc">
            <div class="desc-input-wrapper"><input type="text" class="table-input" placeholder="Description"></div>
          </td>
          <td class="col-bulk">
            <span class="delete-btn" style="display:none;cursor:pointer;color:#f56c6c;font-size:12px;">删除</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'FormDataTable',
  mounted() {
    this.initTableEvents()
    this.updateDeleteButtons()
  },
  methods: {
    initTableEvents() {
      const table = this.$refs.table
      if (!table) return
      const tbody = table.querySelector('tbody')
      if (!tbody) return
      const rows = tbody.querySelectorAll('tr')
      rows.forEach(row => this.bindRowEvents(row))
    },

    bindRowEvents(row) {
      const keyInput = row.querySelector('.key-input')
      const valueInput = row.querySelector('.value-input')
      const checkbox = row.querySelector('.col-checkbox input')
      const typeBtn = row.querySelector('.row-value-type-btn')
      const typeDropdown = row.querySelector('.row-value-type-dropdown')
      const fileDropdown = row.querySelector('.file-select-dropdown')
      const fileOption = fileDropdown ? fileDropdown.querySelector('.file-option') : null
      const deleteBtn = row.querySelector('.delete-btn')

      if (typeBtn && typeDropdown) {
        this.bindDropdownEvents(typeBtn, typeDropdown)
        typeDropdown.querySelectorAll('div').forEach(item => {
          item.addEventListener('click', () => {
            typeBtn.textContent = item.textContent
            this.closeAllDropdowns()
            if (valueInput) {
              if (item.textContent === 'File') {
                valueInput.placeholder = '选择文件'
                valueInput.readOnly = true
                valueInput.style.cursor = 'pointer'
                if (fileDropdown) fileDropdown.style.display = 'block'
              } else {
                valueInput.placeholder = 'Value'
                valueInput.readOnly = false
                valueInput.style.cursor = 'text'
                if (fileDropdown) fileDropdown.style.display = 'none'
                valueInput.value = ''
              }
            }
          })
        })
      }

      if (valueInput && fileDropdown) {
        this.bindDropdownEvents(valueInput, fileDropdown)
      }

      if (fileOption) {
        fileOption.addEventListener('click', () => {
          const fileInput = document.createElement('input')
          fileInput.type = 'file'
          fileInput.multiple = true
          fileInput.onchange = (e) => {
            const files = Array.from(e.target.files).map(f => f.name).join(', ')
            if (valueInput) valueInput.value = files
            if (fileDropdown) fileDropdown.style.display = 'none'
          }
          fileInput.click()
        })
      }

      if (keyInput && valueInput && checkbox) {
        const handleInput = () => {
          if (keyInput.value.trim() || valueInput.value.trim()) {
            checkbox.checked = true
            const tbody = this.$refs.table.querySelector('tbody')
            if (tbody && row === tbody.lastElementChild) {
              this.addNewRow()
            }
          }
        }
        keyInput.addEventListener('input', handleInput)
        valueInput.addEventListener('input', handleInput)
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          this.deleteRow(row)
        })
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

    closeAllDropdowns() {
      if (this.activeDropdown) {
        this.activeDropdown.style.display = 'none'
        this.activeDropdown = null
      }
    },

    addNewRow() {
      const tbody = this.$refs.table.querySelector('tbody')
      const newRow = document.createElement('tr')
      newRow.innerHTML = `
        <td class="col-checkbox"><input type="checkbox"></td>
        <td class="col-key">
          <table class="key-split-table">
            <tbody>
              <tr>
                <td class="key-input-cell"><input type="text" class="key-input" placeholder="Key"></td>
                <td class="type-select-cell">
                  <div class="row-value-type-select">
                    <div class="row-value-type-btn">Text</div>
                    <div class="row-value-type-dropdown">
                      <div>Text</div>
                      <div>File</div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
        <td class="col-value">
          <div class="value-wrapper">
            <input type="text" class="table-input value-input" placeholder="Value">
            <div class="file-select-dropdown">
              <div class="file-option">+选择本地文件</div>
            </div>
          </div>
        </td>
        <td class="col-content-type hide-column"><input type="text" class="table-input" placeholder="Auto" value="Auto"></td>
        <td class="col-desc">
          <div class="desc-input-wrapper"><input type="text" class="table-input" placeholder="Description"></div>
        </td>
        <td class="col-bulk">
          <span class="delete-btn" style="display:none;cursor:pointer;color:#f56c6c;font-size:12px;">删除</span>
        </td>
      `
      tbody.appendChild(newRow)
      this.bindRowEvents(newRow)
      this.updateDeleteButtons()
    },

    deleteRow(row) {
      const tbody = this.$refs.table.querySelector('tbody')
      if (tbody.children.length > 1) {
        row.remove()
        this.updateDeleteButtons()
      }
    },

    updateDeleteButtons() {
      const tbody = this.$refs.table.querySelector('tbody')
      if (!tbody) return
      const rows = Array.from(tbody.children).filter(el => el.tagName === 'TR')
      const showDelete = rows.length >= 2
      rows.forEach(row => {
        const deleteBtn = row.querySelector('.delete-btn')
        if (deleteBtn) {
          deleteBtn.style.display = showDelete ? 'inline' : 'none'
        }
      })
    }
  }
}
</script>

<style>
.nested-container {
  width: 100%;
  background-color: #fff;
  overflow-y: auto;
  overflow-x: hidden;
  display: block;
}

.form-data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: visible !important;
}

.form-data-table th {
  background-color: #f8f9fa;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
  height: 35px !important;
  line-height: 35px !important;
  padding: 0 8px;
  text-align: center !important;
  border-bottom: 1px solid #e5e7eb;
  border-left: 1px solid #e5e7eb;
  vertical-align: middle;
  position: relative;
  white-space: nowrap;
}

.form-data-table th:last-child {
  border-right: 1px solid #e5e7eb;
}

.col-bulk {
  width: 70px !important;
  padding: 0 4px !important;
  min-width: 70px !important;
  white-space: nowrap;
}

.header-bulk-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.header-bulk-edit {
  font-size: 11px;
  color: #2563eb;
  cursor: pointer;
}

.header-more-btn {
  font-size: 13px;
  cursor: pointer;
  color: #6b7280;
  padding: 0 2px;
}

.form-data-table td {
  height: 35px !important;
  padding: 0;
  font-size: 13px;
  color: #4b5563;
  text-align: center !important;
  border-bottom: 1px solid #e5e7eb;
  border-left: 1px solid #e5e7eb;
  vertical-align: middle;
  position: relative;
}

.form-data-table td:last-child {
  border-right: 1px solid #e5e7eb;
}

.form-data-table tbody tr:last-child td {
  border-bottom: none;
}

.col-checkbox { width: 36px; padding: 0 8px !important; }
.col-key { width: 180px; }
.col-value { width: 140px; }
.col-content-type { width: 110px;}
.col-desc { width: 180px; }

.key-split-table {
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  text-align: center !important;
}

.key-split-table td {
  padding: 4px;
  border: 1px solid #e5e7eb;
  height: 27px;
  margin: 0;
  text-align: center !important;
  vertical-align: middle;
  position: static;
}

.key-input-cell { width: 92%; }
.type-select-cell { width: 8%; }

.key-input {
  width: 90%;
  border: 1px solid #d1d5db;
  padding: 4px;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
  margin: 0 auto;
  outline: none;
  box-sizing: border-box;
}

.table-input {
  width: 90%;
  border: 1px solid #d1d5db;
  padding: 4px;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
  margin: 0 auto;
  outline: none;
  box-sizing: border-box;
}

.desc-input-wrapper {
  width: 100%;
  height: 100%;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.row-value-type-select {
  position: relative;
  display: inline-block;
  text-align: center;
}

.row-value-type-btn {
  padding: 2px 4px;
  font-size: 11px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  text-align: center;
  width: 40px;
}

.row-value-type-dropdown {
  display: none;
  position: fixed;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  width: 60px;
  z-index: 99999;
  text-align: center;
}

.row-value-type-dropdown div {
  padding: 4px 6px;
  font-size: 11px;
  color: #333;
  cursor: pointer;
}

.row-value-type-dropdown div:hover {
  background-color: #f3f6f6;
}

.hide-column {
  display: none !important;
}

.value-wrapper {
  position: relative;
  width: 100%;
}

.file-select-dropdown {
  position: absolute;
  top: 100%;
  left: 5%;
  width: 90%;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: none;
}

.file-option {
  padding: 6px 8px;
  cursor: pointer;
  font-size: 12px;
  text-align: left;
}

.file-option:hover {
  background-color: #f3f6f6;
}
</style>
