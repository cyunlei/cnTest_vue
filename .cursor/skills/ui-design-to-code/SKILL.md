# UI Design to Code Skill
**Trigger:** `ui-to-code`
**Description:** 分析用户提供的截图或设计稿，生成语义化、响应式的前端代码。

## 工作流程
1. 用户提供一张UI截图。
2. AI分析图片，识别出：
   - 整体布局结构（如Header, Sidebar, Main Content, Footer）
   - 使用的UI组件（如按钮、输入框、卡片、导航栏）
   - 颜色方案、字体大小、间距等样式信息
3. 根据分析结果，生成干净的、符合现代标准的HTML和CSS代码。
4. 可选：生成Vue组件代码。

## 输出要求
- 只输出核心代码，不要额外解释。
- 使用Flexbox或CSS Grid实现布局。
- 为颜色、字体等创建CSS变量。
- 确保代码在移动端和桌面端都能良好显示。
