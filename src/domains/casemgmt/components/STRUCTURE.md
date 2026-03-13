# Components 目录结构优化方案

## 当前结构问题
1. 根目录下组件过多，分类不清晰
2. `more-step-types` 目录命名较长
3. 部分功能组件分散，如预设变量相关组件

## 优化后的目录结构

```
components/
├── index.ts                    # 统一导出文件（已创建）
├── STRUCTURE.md                # 本说明文档
│
├── common/                     # 通用/基础组件 (5个)
│   ├── InputDialog.vue         # 通用输入对话框
│   ├── JsonAddDialog.vue       # JSON添加对话框
│   ├── BatchEditDialog.vue     # 批量编辑对话框
│   ├── JsonTreeNode.vue        # JSON树节点
│   └── RawContent.vue          # 原始内容展示
│
├── core/                       # 核心功能组件
│   ├── HttpStepDrawer.vue      # HTTP步骤抽屉（主组件）
│   ├── BodyContent.vue         # 请求体内容
│   └── CurlParser.vue          # cURL解析器
│
├── steps/                      # 前置/后置操作步骤（已有）
│   ├── MysqlStepDrawer.vue
│   ├── RedisStepDrawer.vue
│   ├── DuccStepDrawer.vue
│   ├── ScriptStepDrawer.vue
│   ├── DelayStepDrawer.vue
│   ├── ExtractVarStepDrawer.vue
│   ├── MonacoEditor.vue
│   └── CodeMirrorEditor.vue
│
├── step-types/                 # 步骤类型卡片 (14个) ✅ 已迁移
│   ├── HttpStepType.vue
│   ├── MysqlStepType.vue
│   ├── RedisStepType.vue
│   ├── JmqStepType.vue
│   ├── DubboStepType.vue
│   ├── KafkaStepType.vue
│   ├── R2mStepType.vue
│   ├── FmqStepType.vue
│   ├── JarStepType.vue
│   ├── ShellStepType.vue
│   ├── LoopStepType.vue
│   ├── ConditionStepType.vue
│   ├── StardbStepType.vue
│   └── ScheduleJobStepType.vue
│
├── Assert/                     # 断言相关 (4个) （保持大写，Windows大小写不敏感）
│   ├── NormalAssert.vue
│   ├── JsonPathAssert.vue
│   ├── CompareGroupSettings.vue
│   └── ABAssert.vue
│
├── body/                       # 请求体相关（已有）
│   ├── BodyRaw.vue
│   ├── BodyBinary.vue
│   ├── BodyFormData.vue
│   ├── BodyUrlencoded.vue
│   └── BodyNone.vue
│
├── response/                   # 响应相关（已有）
│   ├── ResponseBodyView.vue
│   ├── ResponseHeaderView.vue
│   ├── ResponseExpectedView.vue
│   └── ResponseActualInputView.vue
│
├── preset/                     # 预设变量相关（新创建）
│   ├── PresetVariablesTable.vue
│   ├── PresetTemplateDialog.vue
│   └── PresetVarTableCore.vue
│
├── settings/                   # 设置面板（新创建）
│   ├── HttpSettingsPanel.vue
│   └── GatewayLoginPanel.vue
│
└── form/                       # 表单相关（新创建）
    ├── UrlencodedTable.vue
    └── PostmanFormData.vue
```

## 迁移步骤（保持向后兼容）

### 步骤1：创建新目录结构（已完成）
- [x] 创建 `common/` 目录
- [x] 创建 `preset/` 目录
- [x] 创建 `settings/` 目录
- [x] 创建 `form/` 目录

### 步骤2：逐步迁移组件

对于每个要迁移的组件，执行以下操作：

1. **移动组件到新目录**
2. **在原位置创建兼容性导出文件**：

```vue
<!-- 原位置的兼容性导出文件 -->
<script>
// InputDialog.vue 在原位置重定向到 common/InputDialog.vue
export { default } from './common/InputDialog.vue'
</script>
```

3. **更新 `index.ts` 中的导出路径**

### 步骤3：批量更新导入路径

当大部分组件迁移完成后，使用脚本批量替换项目中的导入路径：

```bash
# 示例：将 './InputDialog.vue' 替换为 './common/InputDialog.vue'
find src -type f -name "*.vue" -o -name "*.ts" | xargs sed -i "s/from '\.\/InputDialog/from '\.\/common\/InputDialog/g"
```

### 步骤4：清理兼容性文件

当所有导入路径更新完成后，删除原位置的兼容性导出文件。

## 建议的迁移优先级

### 高优先级（立即执行）
1. ~~创建统一导出 `index.ts`~~（已完成）
2. ~~创建 `preset/` 目录~~（已完成）

### 中优先级（近期执行）
3. ~~将预设变量组件移入 `preset/` 目录~~ ✅ **已完成**
   - PresetVariablesTable.vue
   - PresetTemplateDialog.vue
   - PresetVarTableCore.vue
4. ~~将通用对话框移入 `common/` 目录~~ ✅ **已完成**
   - InputDialog.vue
   - JsonAddDialog.vue
   - BatchEditDialog.vue
   - JsonTreeNode.vue
   - RawContent.vue
5. ~~将设置面板移入 `settings/` 目录~~ ✅ **已完成**
   - HttpSettingsPanel.vue
   - GatewayLoginPanel.vue
6. ~~将表单组件移入 `form/` 目录~~ ✅ **已完成**
   - UrlencodedTable.vue
   - PostmanFormData.vue

### 低优先级（后续执行）
7. ~~将 `more-step-types/` 重命名为 `step-types/`~~ ✅ **已完成**
   - 所有14个步骤类型组件已迁移到 `step-types/`
   - 原 `more-step-types/` 目录保留兼容性导出文件
8. ~~将 `Assert/` 重命名为 `assert/`（小写统一）~~ ❌ **已取消** (Windows大小写不敏感)
   - 保持 `Assert/` 目录名（大写A）
   - 已在 `index.ts` 中使用大写路径

## 使用统一导出

优化后，导入方式从：
```typescript
import InputDialog from './components/InputDialog.vue'
import BatchEditDialog from './components/BatchEditDialog.vue'
import NormalAssert from './components/Assert/NormalAssert.vue'
```

简化为：
```typescript
import { InputDialog, BatchEditDialog, NormalAssert } from './components'
```

## 注意事项

1. **逐步迁移**：每次只迁移一个组件，确保测试通过
2. **保持兼容**：在原位置创建导出重定向，避免破坏现有功能
3. **更新文档**：迁移完成后更新本文档
4. **团队协作**：通知团队成员目录结构变更
