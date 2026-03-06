/**
 * Element Plus 组件库配置
 * 统一导入和注册 Element Plus 组件
 */
import { ElButton, ElInput, ElSelect, ElOption, ElTable, ElTableColumn, ElDialog, ElDrawer, ElForm, ElFormItem, ElCheckbox, ElRadio, ElRadioGroup, ElSwitch, ElTabs, ElTabPane, ElTag, ElTooltip, ElDropdown, ElDropdownMenu, ElDropdownItem, ElMenu, ElMenuItem, ElSubMenu, ElBreadcrumb, ElBreadcrumbItem, ElPagination, ElCard, ElRow, ElCol, ElContainer, ElHeader, ElMain, ElAside, ElDivider, ElIcon, ElBadge, ElPopover, ElTree, ElUpload, ElDatePicker, ElTimePicker, ElInputNumber, ElSlider, ElRate, ElColorPicker, ElTransfer, ElCollapse, ElCollapseItem, ElSteps, ElStep, ElAlert, ElLoading, ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import 'element-plus/dist/index.css'

// 组件列表
const components = [
  ElButton, ElInput, ElSelect, ElOption, ElTable, ElTableColumn,
  ElDialog, ElDrawer, ElForm, ElFormItem, ElCheckbox, ElRadio, ElRadioGroup,
  ElSwitch, ElTabs, ElTabPane, ElTag, ElTooltip, ElDropdown, ElDropdownMenu,
  ElDropdownItem, ElMenu, ElMenuItem, ElSubMenu, ElBreadcrumb, ElBreadcrumbItem,
  ElPagination, ElCard, ElRow, ElCol, ElContainer, ElHeader, ElMain, ElAside,
  ElDivider, ElIcon, ElBadge, ElPopover, ElTree, ElUpload, ElDatePicker,
  ElTimePicker, ElInputNumber, ElSlider, ElRate, ElColorPicker, ElTransfer,
  ElCollapse, ElCollapseItem, ElSteps, ElStep, ElAlert
]

// 插件函数
export function setupElementPlus(app) {
  // 注册组件
  components.forEach(component => {
    app.component(component.name, component)
  })

  // 注册指令
  app.use(ElLoading)

  // 挂载全局方法
  app.config.globalProperties.$message = ElMessage
  app.config.globalProperties.$messageBox = ElMessageBox
  app.config.globalProperties.$notify = ElNotification
  app.config.globalProperties.$loading = ElLoading.service
}

// 单独导出，方便按需导入
export {
  ElButton, ElInput, ElSelect, ElOption, ElTable, ElTableColumn,
  ElDialog, ElDrawer, ElForm, ElFormItem, ElCheckbox, ElRadio, ElRadioGroup,
  ElSwitch, ElTabs, ElTabPane, ElTag, ElTooltip, ElDropdown, ElDropdownMenu,
  ElDropdownItem, ElMenu, ElMenuItem, ElSubMenu, ElBreadcrumb, ElBreadcrumbItem,
  ElPagination, ElCard, ElRow, ElCol, ElContainer, ElHeader, ElMain, ElAside,
  ElDivider, ElIcon, ElBadge, ElPopover, ElTree, ElUpload, ElDatePicker,
  ElTimePicker, ElInputNumber, ElSlider, ElRate, ElColorPicker, ElTransfer,
  ElCollapse, ElCollapseItem, ElSteps, ElStep, ElAlert,
  ElLoading, ElMessage, ElMessageBox, ElNotification
}
