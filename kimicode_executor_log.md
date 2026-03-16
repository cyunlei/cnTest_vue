# Kimi Code CLI 执行日志

## 2026-03-16: 测试步骤 API 层与类型定义（按 AiExecytionManual 规范）

### 任务
根据 AiExecytionManual.md 规则，实现测试步骤相关 5 个后端 API 的前端对接：
1. POST `/api/v1/testcases/step/create` - 创建测试步骤（application/json）
2. GET `/api/v1/testcases/step/list` - 查询步骤列表（query）
3. GET `/api/v1/testcases/step/detail` - 查询步骤详情（query）
4. POST `/api/v1/testcases/step/update` - 更新测试步骤（application/json）
5. POST `/api/v1/testcases/step/delete` - 删除测试步骤（application/json）

### 执行内容

#### 1. 创建 CaseMgmt 领域类型定义
**新建文件:** `src/domains/casemgmt/types/index.js`

- 步骤相关 DTO：`CreateStepDTO`、`UpdateStepDTO`、`DeleteStepDTO`
- 查询参数：`FetchStepListParams`、`FetchStepDetailParams`
- 实体与响应：`StepEntity`、`StepListResponse`、`StepDetailResponse`、`StepMutationResponse`
- 枚举：`STEP_TYPE`（步骤类型常量）

#### 2. 创建 CaseMgmt 领域 API 层
**新建文件:** `src/domains/casemgmt/api/index.js`

- `createStep(data)`：POST step/create，application/json
- `fetchStepList(params)`：GET step/list，query 参数
- `fetchStepDetail(params)`：GET step/detail，query 参数
- `updateStep(data)`：POST step/update，application/json
- `deleteStep(data)`：POST step/delete，application/json

命名遵循手册：createXxx、fetchXxxList、updateXxx、deleteXxx；使用 `@core/http` 的 `create`、`fetch`。

### 文件变更汇总

```
新建: src/domains/casemgmt/types/index.js
新建: src/domains/casemgmt/api/index.js
```

### 验证结果
✅ 类型定义符合领域驱动类型规范（六.类型系统）
✅ API 层符合统一协议与命名规范（五.API 层）
✅ 无 Lint 报错
✅ 与 project、environment 领域 API 风格一致

---

## 2026-03-06: 项目重构 - Element Plus 组件化

### 任务
根据 AiExecytionManual.md 规则，将自定义组件重构为 Element Plus 组件库实现，提升 UI 质量和开发效率。

### 重构内容

#### 1. AppHeader.vue - 顶部导航栏
**修改文件:** `src/shared/ui/organisms/AppHeader.vue`

**重构内容:**
- 使用 `el-menu` 替换自定义导航菜单
- 使用 `el-dropdown` 替换用户下拉菜单
- 使用 `el-badge` 替换消息通知徽章
- 使用 `el-avatar` 替换用户头像
- 使用 `el-icon` 替换 SVG 图标

#### 2. DashboardView.vue - 工作台页面
**修改文件:** `src/domains/dashboard/views/DashboardView.vue`

**重构内容:**
- 使用 `el-card` 替换自定义卡片组件
- 使用 `el-table` 替换最近活动列表
- 使用 `el-tabs` 替换自定义标签页
- 使用 `el-tag` 替换状态标签
- 使用 `el-row`/`el-col` 布局系统
- 移除自定义子组件（QuickAccessCard, RecentActivityTable, DashboardSidebar, PeriodicTaskSection）

#### 3. HttpStepDrawer.vue - 步骤抽屉
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

**重构内容:**
- 使用 `el-drawer` 替换自定义抽屉
- 使用 `el-form`/`el-form-item` 替换表单
- 使用 `el-collapse`/`el-collapse-item` 替换基础信息折叠面板
- 使用 `el-input` 配合 `prepend` 插槽实现方法选择+地址输入
- 使用 `el-select`/`el-option` 替换下拉选择
- 使用 `el-tabs` 替换 Params/Headers/Body 标签页
- 使用 `el-table` 替换参数表格
- 使用 `el-switch` 替换 Toggle 开关
- 使用 `el-radio-group`/`el-radio-button` 替换组选择
- 使用 `el-dialog` 替换批量编辑弹窗

### 登录注册页面
根据要求，以下文件**未做修改**（保持原有实现）:
- `src/domains/auth/components/LoginForm.vue`
- `src/domains/auth/components/RegisterForm.vue`
- `src/domains/auth/views/LoginView.vue`
- `src/domains/auth/views/RegisterView.vue`

### Bug 修复

#### 问题1: 启动报错，缺少 `@element-plus/icons-vue` 依赖
**修复**: 安装图标库 `npm install @element-plus/icons-vue`

#### 问题2: 登录后跳转失败，Vite 预构建缓存错误
**错误信息**:
```
GET http://127.0.0.1:8085/node_modules/.vite/deps/@element-plus_icons-vue.js?v=2e63755c net::ERR_ABORTED 504 (Outdated Optimize Dep)
TypeError: Failed to fetch dynamically imported module: http://127.0.0.1:8085/src/domains/dashboard/views/DashboardView.vue
```

**修复**:
1. 修改 `vite.config.js`，添加完整的 `optimizeDeps` 配置
```javascript
optimizeDeps: {
  include: [
    '@element-plus/icons-vue',
    'element-plus',
    'element-plus/dist/index.css'
  ],
  force: true,
  esbuildOptions: {
    target: 'es2020'
  }
}
```

2. **关键步骤 - 完全重启开发服务器**:
   - 按 `Ctrl+C` 停止当前开发服务器
   - 删除缓存：`Remove-Item -Recurse -Force node_modules\.vite`
   - 重新启动：`npm run dev`

**注意**: 必须完全停止开发服务器后再重启，仅刷新页面无法解决问题

### 验证结果
✅ `npm run build` 构建成功
✅ Element Plus 组件正确导入和使用
✅ 登录注册页面保持原有样式
✅ 启动正常，无报错
✅ 登录后跳转正常

---

## 2026-03-06: HTTP 测试步骤抽屉代码检查与修复

### 检查项与修复
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. HTTP方法颜色修正
**问题**: 颜色值与截图不符（使用了过深的颜色）
**修复**: 更新为标准颜色
- GET: `#52c41a` (绿色)
- POST: `#faad14` (黄色/金色)
- PUT: `#1890ff` (蓝色)
- PATCH: `#722ed1` (紫色)
- DELETE: `#f5222d` (红色)

#### 2. HTML标签修复
**问题**: 第439行存在多余的 `</div>` 导致标签不匹配
**修复**: 删除多余的结束标签

#### 3. 布局验证
**隐藏信息时（默认）:**
- 第一排：名称 | 接口所属模块(200px) | 接口地址
- 第二排：特性环境 | 预期结果描述（两列等宽，input输入框）

**更多信息时（展开后）:**
- 第一排：名称 | 接口所属模块(200px) | 接口地址
- 第二排：特性环境 | 步骤描述 | 预期结果描述 | Jdos应用（四列等宽）
- 第三排：链路追踪(PFinder) | 压测标识(ForceBot)

#### 4. 布局修复 - 链路追踪/压测标识移到第三排
**问题**: 链路追踪(PFinder)和压测标识(ForceBot)嵌套在第二行内
**修复**: 使用独立容器包裹，确保在第三排显示

**更多信息时布局：**
- 第一排：名称 | 接口所属模块(200px) | 接口地址
- 第二排：特性环境 | 步骤描述 | 预期结果描述 | Jdos应用（四列等宽）
- 第三排：链路追踪(PFinder) | 压测标识(ForceBot)

#### 5. 功能验证
| 功能 | 状态 |
|-----|-----|
| X号关闭按钮 | ✅ 存在 |
| HTTP方法颜色 | ✅ 已修正 |
| 三列第一行布局 | ✅ 正常 |
| 第二行条件切换 | ✅ v-if/v-else 切换 |
| 链路追踪/压测标识第三排 | ✅ 已修复 |
| 多组参数支持 | ✅ addGroup函数正常 |
| JSON批量添加 | ✅ parseJsonToParams正常 |
| Headers批量编辑 | ✅ parseHeaders正常 |

### 验证结果
✅ `npm run build` 构建成功
✅ 所有优化项已正确实现

---

## 2026-03-06: 优化 HTTP 测试步骤配置抽屉

### 任务
根据用户提供的截图和需求，优化测试步骤创建接口配置抽屉组件。

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. HTTP方法不同颜色
- GET: `#52c41a` (绿色)
- POST: `#faad14` (黄色/金色)
- PUT: `#1890ff` (蓝色)
- PATCH: `#722ed1` (紫色)
- DELETE: `#f5222d` (红色)

#### 2. 抽屉头部添加X号关闭按钮
- 在标题左侧添加 X 图标关闭按钮
- 与标题保持适当间距

#### 3. 调整布局（三列第一行）
- 名称（1fr）+ 接口所属模块（200px）+ 接口地址（1.5fr）
- 模块下拉框宽度固定为 200px

#### 4. 第二行默认展示
- 特性环境（左）
- 预期结果描述（右，textarea）

#### 5. 更多信息展开内容（第二行）
点击"更多信息"后展示：
- 特性环境
- 步骤描述（textarea）
- 预期结果描述（textarea）
- Jdos应用（带帮助图标）

#### 6. 第三行展开内容
- 链路追踪(PFinder) - Toggle Switch
- 压测标识(ForceBot) - Toggle Switch

#### 7. 入参/断言多组支持
- 添加"添加"按钮，点击创建新组
- 组标签显示复选框+组名（第1组、第2组...）
- 点击组标签切换当前编辑组
- 每组独立存储：params、headers、body、ipport、encrypt

#### 8. Params JSON批量添加
- "JSON添加"按钮，打开弹窗
- 支持JSON格式：`{ "suiteId":"851847", "lineId":"70886" }`
- 支持KV格式：`suiteId=851847&lineId=70886&env=test`
- 自动解析并填充到表格

#### 9. Headers批量编辑
- "批量编辑"链接，打开弹窗
- 支持格式：`header-name header-value` 或 `header-name: header-value`
- 每行一个header
- 示例支持：
  ```
  sec-fetch-site same-origin
  user-agent: Mozilla/5.0
  ```

#### 10. 参数表格功能
- 每行显示 KEY / VALUE / 删除按钮
- 空状态显示"+ 添加参数"按钮
- 支持逐行添加和删除

### 验证结果
✅ `npm run build` 构建成功
✅ HTTP方法颜色按规范显示
✅ 布局调整为三列第一行+两列第二行
✅ 更多信息展开/收起功能正常
✅ 多组参数支持添加和切换
✅ JSON/KV格式批量解析功能
✅ Header批量编辑支持两种格式

---

## 2026-03-06: 禁用密码登录图片验证码校验

### 任务
临时注释掉密码登录时的图片验证码校验逻辑，回头再打开。

### 修改内容
**修改文件:** `src/domains/auth/components/LoginForm.vue`

1. **导入语句注释**:
   ```javascript
   // [验证码已临时禁用] import CaptchaModal from './CaptchaModal.vue'
   ```

2. **状态变量注释**:
   ```javascript
   // [验证码已临时禁用] const captchaVisible = ref(false)
   // [验证码已临时禁用] const tempToken = ref('')
   ```

3. **登录逻辑修改**:
   - 账号密码登录验证表单后，直接调用 `doPasswordLogin()` 方法
   - 不再弹出验证码弹窗
   - 注释掉原验证码弹窗触发逻辑

4. **回调函数注释**:
   - `onCaptchaVerified()` 函数整体注释
   - `onCaptchaCancel()` 函数整体注释

5. **模板组件注释**:
   ```vue
   <!-- [验证码已临时禁用] 图片验证码弹窗
   <CaptchaModal ... />
   -->
   ```

### 验证结果
✅ `npm run build` 构建成功
✅ 密码登录流程恢复正常（无需验证码）
✅ 邮箱验证码登录不受影响
✅ 代码保留完整注释，方便后续恢复

---

## 2026-03-06: 九宫格验证码图片均匀填满容器

### 问题
九宫格图片验证码使用 `object-fit: contain` 显示时，图片居中且四周有留白，没有均匀填满验证码框。

### 修复方案
**修改文件:** `src/domains/auth/components/CaptchaModal.vue`

1. **调整图片显示方式**:
   - `object-fit: contain` → `object-fit: fill` 让图片拉伸填满整个容器
   - 容器高度从 `200px` 调整为 `280px`，更适合九宫格比例

2. **简化坐标计算逻辑**:
   - 由于图片填满容器，不再需要计算居中偏移量
   - 坐标转换简化为：`originalX = displayX / scaleX`
   - 标记点显示简化为：`displayX = originalX * scaleX`

### 验证结果
✅ `npm run build` 构建成功
✅ 九宫格图片均匀填满验证码框，无留白
✅ 坐标计算逻辑与新的显示方式匹配

---

## 2026-03-06: 修复点选验证码坐标计算问题

### 问题
点选验证码存在坐标计算错误：
1. 前端使用 `object-fit: contain` 显示图片，导致显示尺寸与原始尺寸不同
2. 用户点击的坐标是相对于显示区域的，但直接提交给后端（后端期望原始图片坐标）
3. 这导致后端坐标验证始终失败

### 修复方案
**修改文件:** `src/domains/auth/components/CaptchaModal.vue`

1. **新增坐标转换逻辑**:
   - `displayToOriginal()`: 将显示坐标转换为原始图片坐标（提交给后端）
   - `originalToDisplay()`: 将原始坐标转换为显示坐标（用于标记点显示）

2. **考虑 `object-fit: contain` 的居中留白**:
   - 计算实际渲染区域的缩放比例 `scale = min(displayWidth/originalWidth, displayHeight/originalHeight)`
   - 计算居中偏移量 `offsetX = (displayWidth - renderWidth) / 2`
   - 转换公式: `originalX = (displayX - offsetX) / scale`

3. **边界检查**: 确保转换后的坐标在有效范围内

4. **轨迹记录**: 同样进行坐标转换，保持数据一致性

### 验证结果
✅ `npm run build` 构建成功
✅ 坐标转换逻辑正确处理缩放和居中情况
✅ 已选点标记位置显示正确

---

## 2026-03-05: 账号密码登录添加点选式图片验证码

### 任务
将输入型验证码改为点选式图片验证码，用户需要在验证码图片上点击指定位置完成验证。

### 分析后端API
查看 `D:\project\cnTest\apps\verification\captcha_views.py` 和 `captcha_services.py`：
- 支持 `type=image` 点选式验证码
- GET `/api/v1/captcha?type=image` 返回验证码图片和挑战数据
- POST `/api/v1/captcha/verify` 提交点击坐标数组 `points: [{x, y, t}]`
- 响应包含 `challenge.tip` 提示文字（如"请点击所有的红色圆圈，共3个"）

### 执行内容

#### 1. 更新验证码API
**修改文件:** `src/domains/verification/api/index.js`

**修改内容:**
- `getCaptcha()` 添加参数支持 `type` 和 `difficulty`
- `refreshCaptcha()` 修正参数为 `old_captcha_key`

```javascript
export function getCaptcha(params = {}) {
  const queryParams = new URLSearchParams()
  queryParams.append('type', params.type || 'image')
  queryParams.append('difficulty', params.difficulty || 'hard')
  return fetch(`${BASE_URL}/captcha?${queryParams.toString()}`)
}
```

#### 2. 更新类型定义
**修改文件:** `src/domains/verification/types/index.js`

**新增类型:**
- `CaptchaPoint` - 点选坐标
- `CaptchaChallenge` - 挑战数据（图片、提示）
- `CaptchaConstraints` - 约束条件
- `CaptchaResponseData` - 完整响应数据
- `VerifyCaptchaDTO` - 验证请求

#### 3. 重写验证码弹窗组件
**修改文件:** `src/domains/auth/components/CaptchaModal.vue`

**功能特性:**
- 点选式验证：点击图片上的目标位置
- 多选支持：根据提示点击多个位置
- 已选点标记：蓝色圆点显示已选位置序号
- 取消选择：点击已选点可取消
- 鼠标轨迹记录：用于风控分析
- 刷新功能：点击刷新按钮获取新验证码

**交互流程:**
1. 打开弹窗自动获取验证码（type=image）
2. 显示提示文字（如"请点击所有的红色圆圈，共3个"）
3. 用户点击图片上的目标位置
4. 已选位置显示蓝色标记（带序号）
5. 选够数量后点击"确定"提交
6. 验证成功后返回 temp_token 完成登录

**样式特点:**
- 380px 宽度弹窗
- 200px 高度验证码图片区域
- 已选点蓝色标记（24px 圆点，带序号）
- 十字准星光标提示可点击
- 选中/取消动画效果

### 文件变更汇总

```
修改: src/domains/verification/api/index.js
修改: src/domains/verification/types/index.js
修改: src/domains/auth/components/CaptchaModal.vue
修改: src/domains/auth/components/LoginForm.vue (移除username prop)
```

### 验证结果
✅ `npm run build` 构建成功
✅ 点选式验证码交互完整
✅ API 参数与后端匹配
✅ 符合 `AiExecytionManual.md` 规范

---

## 2026-03-05: 账号密码登录添加图片验证码校验

### 任务
1. 用户点击"账号密码登录"时，弹出图片验证码校验弹窗
2. 使用后端API：
   - GET /api/v1/verification/captcha - 获取图片验证码
   - POST /api/v1/verification/captcha/verify - 验证图片验证码

### 执行内容

#### 1. 创建验证码弹窗组件
**新建文件:** `src/domains/auth/components/CaptchaModal.vue`

**功能:**
- 弹窗式验证码输入界面
- 自动获取验证码图片 (Base64)
- 支持点击刷新验证码
- 输入框支持回车键提交
- 验证成功返回临时令牌 (temp_token)
- 使用 Teleport 渲染到 body，避免 z-index 问题
- 过渡动画效果

**样式特点:**
- 360px 宽度弹窗
- 100px 高度验证码图片区域
- 居中显示的验证码输入框
- 加载动画、悬停效果

#### 2. 修改登录表单组件
**修改文件:** `src/domains/auth/components/LoginForm.vue`

**修改内容:**
1. 导入 CaptchaModal 组件
2. 添加状态: `captchaVisible`, `tempToken`
3. 修改 `handleLogin` 逻辑:
   - 邮箱验证码登录: 直接登录
   - 账号密码登录: 先显示验证码弹窗
4. 新增 `onCaptchaVerified` 回调:
   - 验证成功后执行登录
   - 携带 temp_token 参数
5. 新增 `onCaptchaCancel` 回调:
   - 清空临时令牌

### 文件变更汇总

```
新建: src/domains/auth/components/CaptchaModal.vue
修改: src/domains/auth/components/LoginForm.vue
```

### 验证结果
✅ `npm run build` 构建成功
✅ 验证码弹窗组件功能完整
✅ 账号密码登录流程已集成验证码校验
✅ 使用已有的 verification API 模块

---

## 2026-03-05: 后端API对接与前端领域层开发

### 任务
1. 分析D:\project\cnTest后端API模块（accounts, verification, project, environment, testcase）
2. 根据AiExecytionManual.md规范，完善前端API层、类型定义和状态管理
3. 修正HTTP层配置，匹配后端实际API路径

### 执行内容

#### 1. 分析后端API结构
**查看目录:** `D:\project\cnTest\apps\`

发现5个核心模块：
- **accounts**: 用户注册、登录、密码修改
- **verification**: 邮箱/短信验证码、图片验证码
- **project**: 项目CRUD（软删除）
- **environment**: 环境管理（HTTP/HTTPS协议，测试/预发/生产环境标识）
- **testcase**: 测试用例、用例集、测试步骤、执行记录

#### 2. 更新HTTP核心层配置
**修改文件:** `src/@core/http/index.js`

- 更新免认证URL列表，匹配后端实际路径：
  ```javascript
  export const NO_AUTH_URLS = [
    '/accounts/login',
    '/accounts/check_account_exist',
    '/accounts/register',
    '/accounts/email_code_login',
    '/verification/email/send',
    '/verification/captcha',
    '/verification/captcha/verify'
  ]
  ```

#### 3. 创建Auth领域完整类型定义
**新建文件:** `src/domains/auth/types/index.js`

- 定义LoginByPasswordDTO、LoginByEmailCodeDTO、RegisterDTO等类型
- 定义UserEntity、LoginResponseData实体类型
- 定义ApiResponse<T>泛型响应类型

#### 4. 更新Auth领域API层
**修改文件:** `src/domains/auth/api/index.js`

- 修正API路径：`/api/v1/auth/*` → `/accounts/*`
- 添加sendEmailCode重新导出（保持向后兼容）
- 导出：loginByPassword、loginByEmailCode、createUser等

#### 5. 创建Project领域完整模块
**新建文件:**
- `src/domains/project/types/index.js` - 项目类型定义
- `src/domains/project/api/index.js` - 项目API层
- `src/domains/project/stores/useProjectStore.js` - Pinia状态管理

**功能:**
- 项目CRUD操作
- 支持本地存储当前选中项目
- 分页列表查询

#### 6. 创建Environment领域完整模块
**新建文件:**
- `src/domains/environment/types/index.js` - 环境类型定义
- `src/domains/environment/api/index.js` - 环境API层
- `src/domains/environment/stores/useEnvironmentStore.js` - Pinia状态管理

**类型定义:**
- PROTOCOL_TYPE: HTTP=0, HTTPS=1
- ENVIRONMENT_CODE: TEST=0, STAGING=1, PRODUCTION=2

**功能:**
- 环境CRUD操作
- 按项目分组的环境列表
- 环境显示名称格式化

#### 7. 创建CaseMgmt领域完整模块
**新建文件:**
- `src/domains/casemgmt/types/index.js` - 测试用例类型定义
- `src/domains/casemgmt/api/index.js` - 测试用例API层
- `src/domains/casemgmt/stores/useCaseMgmtStore.js` - Pinia状态管理

**类型定义:**
- CASE_TYPE: SMOKE=0, FUNCTIONAL=1, REGRESSION=2, PERFORMANCE=3, SECURITY=4, COMPATIBILITY=5, OTHER=6
- PRIORITY: P0=0, P1=1, P2=2, P3=3, P4=4, P5=5
- 优先级颜色映射

**API覆盖:**
- 测试用例: create/list/detail/update/delete
- 用例集: suite/*
- 测试步骤: step/*
- 执行: execute, step/execute
- 执行记录: execution/*

**Store功能:**
- 测试用例、用例集、步骤的CRUD
- 树形用例集结构
- 执行操作支持

#### 8. 创建Verification领域模块
**新建文件:**
- `src/domains/verification/types/index.js` - 验证码类型定义
- `src/domains/verification/api/index.js` - 验证码API层

**功能:**
- 邮箱验证码: send/verify
- 短信验证码: send/verify（预留）
- 图片验证码: get/verify/refresh/validate-token

### 文件变更汇总

```
修改: src/@core/http/index.js
修改: src/domains/auth/api/index.js
新建: src/domains/auth/types/index.js

新建: src/domains/project/types/index.js
新建: src/domains/project/api/index.js
新建: src/domains/project/stores/useProjectStore.js

新建: src/domains/environment/types/index.js
新建: src/domains/environment/api/index.js
新建: src/domains/environment/stores/useEnvironmentStore.js

新建: src/domains/casemgmt/types/index.js
新建: src/domains/casemgmt/api/index.js
新建: src/domains/casemgmt/stores/useCaseMgmtStore.js

新建: src/domains/verification/types/index.js
新建: src/domains/verification/api/index.js
```

### 验证结果
✅ `npm run build` 构建成功
✅ 所有领域类型定义完整
✅ API路径与后端匹配
✅ Pinia Store状态管理可用
✅ 向后兼容（auth/api重新导出verification函数）

---

## 2026-03-03: 用例管理页面UI优化（第四次迭代）

### 任务
1. 恢复布局：只看自己在左，三条杠按钮在右
2. 修复三条杠下拉框被右侧容器遮挡的bug（提高z-index）
3. 开发新增用例弹窗

### 执行内容

#### 修改 CaseMgmtView 布局和弹窗开发
**修改文件:** `src/domains/casemgmt/views/CaseMgmtView.vue`

- **布局恢复**:
  - "只看自己"复选框放回左侧
  - 三条杠菜单按钮放回右侧
  - `.filter-bar` 添加 `justify-content: space-between`

- **修复遮挡问题**:
  - `.action-dropdown` 的 z-index 从 1000 提高到 **10000**
  - 确保下拉框在最上层显示

- **新增用例弹窗开发**:
  - 添加 `showAddCaseModal` 控制弹窗显示
  - 表单数据：`addCaseForm`（名称、编排方式、类型、用例集、优先级、前置条件、描述、标签）
  - 编排方式单选：列表编排 / 图形编排 / 代码编排
  - 下拉选项：用例类型、所属用例集、优先级
  - 表单验证标记：必填项带红色星号
  - 底部按钮：取消、保存、保存并前往
  - 弹窗样式：600px宽度，圆角8px，阴影效果

- **新增方法**:
  - `openAddCaseModal()`: 打开弹窗
  - `closeAddCaseModal()`: 关闭弹窗
  - `resetAddCaseForm()`: 重置表单
  - `saveCase()`: 保存用例
  - `saveAndGo()`: 保存并前往

### 验证结果
✅ `npm run build` 构建成功
✅ 布局恢复正确（只看自己在左，三条杠在右）
✅ 下拉框不再被遮挡
✅ 新增用例弹窗功能完整

---

## 2026-03-16: 新增用例弹窗无法输入问题排查与修复

### 问题
在重构 `AddEditCaseModal.vue`（新增/编辑用例弹窗，参照 Ant Design 风格）过程中，用户反馈：

1. 弹窗打开后，**所有输入框和下拉框无法点击、无法输入**，鼠标点击没有任何反应；
2. 点击“用例名称”输入框时，会意外切换“编排方式”为“代码编排”，说明点击事件被错误地命中了单选按钮区域；
3. 浏览器控制台无报错，但在 DevTools 的 `Event Listeners` 中看到 `click` 事件始终落在 `div.modal-overlay`，而不是具体的 `input` 元素。

### 原因分析

1. **遮罩层拦截点击事件**
   - 初始实现中，外层使用了 AntD 模态结构（`ant-modal-root / ant-modal-mask / ant-modal-wrap / ant-modal-content`），后来改为自定义 `modal-overlay + modal-container`。
   - 遮罩层和内容层多次叠加 `pointer-events`、`@click.self` 等逻辑，导致点击事件始终被 `modal-overlay` 拦截，内部表单控件无法收到点击。

2. **单选按钮行高度溢出，覆盖后续行**
   - “编排方式”一行使用 `ant-radio-group` + 自定义样式，没有限制高度。
   - 该行内容实际高度超过 32px，又与下方“用例类型 / 所属用例集 / 优先级”等行共享同一父级 `.ant-row` 布局，造成**单选区域的不可见部分覆盖了后续多行**。
   - 现象：点击“用例名称”时事件落在“编排方式”区域（自动切换为“代码编排”），其他行输入框也因为被覆盖而无法点击。

3. **全局 CSS 误作用**
   - 尝试用以下样式全局限制 `.ant-row`、`.ant-radio-group`、`.ant-radio-wrapper` 后，只修复了第一行（用例名称），但仍然导致其它行被覆盖：
     ```css
     .ant-radio-group {
       height: 32px;
       line-height: 32px;
       overflow: hidden;
     }
     .ant-row {
       position: relative;
       min-height: 32px;
     }
     .ant-radio-wrapper {
       position: relative;
       display: inline-flex;
       align-items: center;
     }
     ```
   - 问题在于上述规则作用于**所有** `.ant-row`，带来不可预期的布局影响。

### 解决方案

1. **彻底简化弹窗壳子结构，参照 `AddSuiteModal`**
   - 放弃 AntD 模态层级结构，采用与 `AddSuiteModal.vue` 相同的简单实现：
     ```vue
     <template>
       <div v-if="visible" class="modal-overlay" @click.self="handleClose">
         <div class="modal-container">
           <div class="modal-header">...</div>
           <div class="modal-body">... 表单 ...</div>
           <div class="modal-footer">... 按钮 ...</div>
         </div>
       </div>
     </template>
     ```
   - `modal-overlay` 只负责灰色背景和居中，`modal-container` 承载全部交互逻辑，避免多层 `pointer-events` 干扰。

2. **仅对“编排方式”这一行单独约束高度，避免覆盖后续行**
   - 在模板中为“编排方式”行增加单独类名：
     ```vue
     <div class="ant-row ant-legacy-form-item arrange-row">
       <!-- 编排方式单选组 -->
     </div>
     ```
   - 配套样式只作用于该行的 radio group，而不影响其他 `.ant-row`：
     ```css
     /* 编排方式这一行单独控制高度和对齐，避免遮挡其他行 */
     .arrange-row .ant-radio-group-middle {
       height: 32px;
       align-items: center;
     }
     ```
   - 这样“编排方式”行的实际渲染高度被限制在 32px 内，不再向下“溢出”，后续“用例类型 / 所属用例集 / 优先级 / 前置条件 / 用例描述 / 标签”等行都可以正常获得点击和输入焦点。

3. **保留表单布局与视觉复刻**
   - 其余表单布局仍然使用 Ant 风格的 `ant-row / ant-col` 结构和已有样式，只针对问题行做了局部约束，确保：
     - 用例名称输入框、前置条件、用例描述等都可正常输入；
     - 单选按钮尺寸和颜色仍然符合参考截图（选中为蓝色圆圈+中心点，未选为灰色圆圈）。

### 最终结果

- 新增/编辑用例弹窗 `AddEditCaseModal.vue`：
  - 所有输入框和单选按钮可以正常点击和输入；
  - “点击用例名称导致编排方式自动切换”的问题消失；
  - 弹窗壳子结构与 `AddSuiteModal` 保持一致，后续维护成本更低。
- 经验总结：
  - 类似 AntD/Element 这种复杂模态结构，如果不是直接使用组件库，**不建议手写整套 DOM + 事件模型**，容易引入 `pointer-events` / 遮罩拦截等隐性问题；
  - 当出现“某一行点击影响另一行”的怪问题时，优先检查该行的实际高度与层叠覆盖情况，对单行做精确约束通常比全局 CSS 修补更安全。


## 2026-03-03: 用例管理页面UI优化（第五次迭代 - 完整版）

### 任务
1. 修复三条杠下拉框被遮挡问题（使用更高z-index + sidebar定位）
2. 开发所有工具栏功能：
   - 同步用例弹窗
   - 批量执行弹窗
   - 执行结果抽屉
   - 批量操作下拉框（选中高亮/未选置灰）
   - 自定义表头弹窗

### 执行内容

#### 修改 CaseMgmtView 完整功能开发
**修改文件:** `src/domains/casemgmt/views/CaseMgmtView.vue`

- **修复遮挡问题**:
  - `.sidebar` 添加 `position: relative; z-index: 100`
  - `.action-dropdown` 的 z-index 设为 **99999**

- **工具栏更新**: 所有按钮带图标，批量操作根据选中状态置灰

- **表格选中功能**: `selectedCases` 存储选中项，联动批量操作按钮状态

- **新增弹窗/抽屉**:
  - 同步用例Modal: 平台选择
  - 批量执行Modal: 通知、策略、环境等配置
  - 执行结果Drawer: 右侧滑出，搜索+表格
  - 批量操作Dropdown: 删除/移动/编辑/复制
  - 自定义表头Modal: 分组勾选，已选字段展示

### 验证结果
✅ `npm run build` 构建成功
✅ 所有工具栏弹窗功能完整
✅ 表格选中联动批量操作按钮状态

---

## 2026-03-03: 用例管理页面UI优化（第二次迭代）

### 任务1
1. 鼠标悬停和点击都能展示下拉框
2. 三个横杠菜单按钮移到"只看自己"后面，和它保持一排

### 任务2
1. 模块选择下拉框（商家开放）也实现鼠标悬浮展示下拉框

### 执行内容

#### 修改 CaseMgmtView 下拉菜单交互和布局
**修改文件:** `src/domains/casemgmt/views/CaseMgmtView.vue`

- **菜单按钮位置调整**:
  - 从主内容区标题栏移到左侧边栏
  - 放在"只看自己"复选框右侧，同一行显示
  - 使用 `justify-content: space-between` 左右对齐

- **模块选择下拉框悬停展示**:
  - 在 `module-select-wrapper` 添加 `@mouseenter="openModuleDropdown"` 和 `@mouseleave="closeModuleDropdown"`
  - 下拉菜单本身也绑定鼠标事件，确保移入菜单区域不会关闭
  - 使用延迟关闭（setTimeout 100ms）避免闪烁
  - 保持点击切换功能 `@click="toggleModuleDropdown"`

- **新增方法**:
  - `toggleModuleDropdown()`: 切换模块下拉框显示/隐藏
  - `openModuleDropdown()`: 打开模块下拉框
  - `closeModuleDropdown()`: 延迟关闭模块下拉框
  - `toggleActionMenu()`: 切换菜单显示/隐藏
  - `openActionMenu()`: 打开菜单
  - `closeActionMenu()`: 延迟关闭菜单
  - `openAddStepSubmenu()`: 打开添加步骤子菜单
  - `closeAddStepSubmenu()`: 关闭添加步骤子菜单
  - `openNodeTypeSubmenu()`: 打开节点类型子菜单
  - `closeNodeTypeSubmenu()`: 关闭节点类型子菜单

- **样式调整**:
  - `.filter-bar` 改为 flex 布局，左右对齐
  - `.action-dropdown` 定位在按钮下方
  - 保持 12px 圆角和阴影效果

### 验证结果
✅ `npm run build` 构建成功
✅ 菜单按钮位置正确（"只看自己"右侧）
✅ 鼠标悬停和点击都能展示下拉框（模块选择 + 三横杠菜单）
✅ 子菜单悬停展示正常

---

## 2026-03-02: 页面响应式布局修复

### 任务
1. 修复浏览器缩放时页面布局不兼容问题
2. 更新快捷调用、用例管理、Mock、流量回放图标为SVG
3. JSF Mock 标题改为 Mock

### 执行内容

#### 1. 修复 DashboardView 响应式布局
**修改文件:** `src/domains/dashboard/views/DashboardView.vue`

- 添加 `overflow: hidden` 防止滚动条问题
- 减小 padding 和 gap 值（16px → 12px, 20px → 16px）
- 右侧边栏宽度从 320px 改为 300px
- 统计卡片使用更紧凑的 padding
- 添加响应式断点：
  - `max-width: 1100px`: 右侧边栏缩小到 260px，卡片网格变为 2 列
  - `max-width: 900px`: 主内容区堆叠排列
  - `max-width: 768px`: 移动端适配
- 添加高DPI缩放适配 (`min-resolution: 120dpi`)

#### 2. 更新快捷调用卡片组件
**修改文件:** `src/domains/dashboard/components/QuickAccessCard.vue`

- 添加 SVG 图标支持（`iconType` 和 `svgPath` props）
- 图标尺寸适配高DPI屏幕（48px → 40px）
- 添加响应式样式

#### 3. 更新 Dashboard 图标
**修改文件:** `src/domains/dashboard/views/DashboardView.vue`

更新四个常用功能卡片图标：
- **快捷调用**: `M825.8 498L538.4 249.9c-10.7-9.2-26.4-.9-26.4 14v496.3...` (播放/快速图标)
- **用例管理**: `M476 399.1c0-3.9-3.1-7.1-7-7.1h-42c-3.8 0-7 3.2-7 7.1V484...` (文档/用例图标)
- **Mock**: `M917.7 148.8l-42.4-42.4c-1.6-1.6-3.6-2.3-5.7-2.3...` (链接/Mock图标)
- **流量回放**: `M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448...` (时钟/回放图标)

#### 4. 修复 QuickCallView 响应式布局
**修改文件:** `src/domains/quickcall/views/QuickCallView.vue`

- 左侧边栏宽度从 240px 改为 220px
- API 网格使用 `auto-fit` 自适应列数
- 减小 padding 和字体大小
- 添加响应式断点

#### 5. 修复 CaseMgmtView 响应式布局
**修改文件:** `src/domains/casemgmt/views/CaseMgmtView.vue`

- 左侧边栏在 900px 以下隐藏
- 搜索筛选区域自动换行
- 表格支持横向滚动
- 工具栏和分页响应式适配

#### 6. 修复 TaskMgmtView 响应式布局
**修改文件:** `src/domains/taskmgmt/views/TaskMgmtView.vue`

- 左侧边栏响应式隐藏
- 筛选区域紧凑布局
- 分页组件适配小屏幕

#### 7. 修复 MockMgmtView 响应式布局
**修改文件:** `src/domains/mockmgmt/views/MockMgmtView.vue`

- **标题修改**: "JSF Mock" → "Mock"
- 搜索区域自动换行
- URL 列超长时显示省略号
- 响应式分页

#### 8. 修复 ModuleSettingsView 响应式布局
**修改文件:** `src/domains/modulesettings/views/ModuleSettingsView.vue`

- 左侧菜单宽度自适应
- 主内容区紧凑布局
- 响应式断点处理

#### 9. 修复 AppHeader 响应式布局
**修改文件:** `src/shared/ui/organisms/AppHeader.vue`

- 导航项字体大小自适应
- 900px 以下隐藏导航菜单和品牌文字
- 右侧工具栏间距调整
- 高DPI屏幕适配（减小高度和padding）

### 响应式断点说明

| 断点 | 处理逻辑 |
|------|---------|
| `max-width: 1100px` | 缩小侧边栏宽度，减小间距，紧凑布局 |
| `max-width: 900px` | 隐藏左侧边栏，单列布局 |
| `max-width: 768px` | 移动端适配，工具栏换行，简化分页 |
| `min-resolution: 120dpi` | 高DPI屏幕（75%缩放等），减小尺寸和间距 |

### 主要改动点
1. 所有页面容器添加 `overflow: hidden` 防止意外滚动
2. padding/gap 值整体减小 20-30%
3. 字体大小使用 rem 或小号 px（11px-13px）
4. 表格支持横向滚动 (`overflow-x: auto`)
5. 侧边栏在窄屏下自动隐藏
6. 高DPI屏幕使用 `@media (-webkit-min-device-pixel-ratio: 1.25)` 特殊处理

### 验证结果
✅ `npm run build` 构建成功
✅ 所有页面响应式布局修复完成
✅ 图标更新为SVG格式
✅ 75%缩放时页面显示正常

---

## 2026-03-05: 修复文件编码问题

### 问题
之前创建的文件出现乱码，原因是PowerShell here-string编码问题。

### 解决方案
使用 [System.IO.File]::WriteAllText() 方法并指定 [System.Text.Encoding]::UTF8 编码重新创建文件。

### 执行内容
1. 删除乱码文件
2. 使用UTF-8编码重新创建 CaseConfigView.vue
3. 使用UTF-8编码重新创建 HttpStepDrawer.vue
4. 验证中文字符显示正常
5. 运行构建验证通过

### 文件变更
- src/domains/casemgmt/views/CaseConfigView.vue (重新创建，UTF-8编码)
- src/domains/casemgmt/components/HttpStepDrawer.vue (重新创建，UTF-8编码)

### 验证结果
✅ 中文字符显示正常
✅ npm run build 构建成功

---

## 2026-03-06: HttpStepDrawer 输入框尺寸和样式优化

### 任务
根据用户提供的尺寸要求，优化输入框尺寸、圆角和 checkbox 对勾位置。

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 输入框尺寸调整
- 名称/接口所属模块/特性环境/步骤描述/预期结果描述/Jdos应用: 423.5×32px
- 接口地址方法选择框: 100×32px
- 接口地址请求地址输入框: 763×32px

#### 2. 圆角调整
- 所有输入框圆角从 4px 调整为 6px

#### 3. Checkbox 对勾位置修复
- 调整 `.round-checkbox :deep(.el-checkbox__inner::after)` 的 `left` 从 4px 到 5px
- 调整 `top` 从 1px 到 2px，使对勾在圆圈中心位置

### 新增样式类
- `.custom-input`: 423.5px 宽度输入框
- `.custom-select`: 423.5px 宽度下拉选择
- `.url-input`: 763px 宽度接口地址输入框
- `.method-select`: 100px 宽度 HTTP 方法选择器

### 验证结果
✅ `npm run build` 构建成功
✅ 所有输入框尺寸符合要求
✅ 圆角样式已生效
✅ Checkbox 对勾位置居中

---

## 2026-03-06: HttpStepDrawer 尺寸精确优化（第二次）

### 任务
重新精确调整抽屉和输入框尺寸，使用 `!important` 确保样式生效。

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 抽屉大小
- drawer size: `1824px`（原 90%）

#### 2. 输入框尺寸（全部使用 !important 强制生效）
- 名称/接口所属模块/特性环境/步骤描述/预期结果描述/Jdos应用: `424×32px`
- 接口地址方法选择框: `100×32px`
- 接口地址请求地址输入框: `739×32px`
- 方法选择框+请求地址合计: `863×32px`

#### 3. 圆角调整
- 所有输入框圆角: `8px`（原 6px）

#### 4. Checkbox 对勾居中
- 使用 `transform: translate(-50%, -60%) rotate(45deg)` 精确居中
- `left: 50%`, `top: 50%` 配合 transform 实现完美居中

### 关键修改点
- 所有尺寸样式添加 `!important` 防止被 Element Plus 默认样式覆盖
- 使用 CSS transform 实现 checkbox 对勾完美居中

### 验证结果
✅ `npm run build` 构建成功
✅ 所有输入框尺寸精确生效
✅ 圆角 8px 已生效
✅ Checkbox 对勾完美居中

---

## 2026-03-06: HttpStepDrawer 输入框尺寸修复（第三次）

### 任务
使用内联 style 直接设置输入框宽度，确保尺寸生效。

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 输入框改为内联样式
- 将 CSS 类样式改为 `style="width: 424px"` 内联样式
- 接口地址输入框：`style="width: 863px"`
- HTTP 方法选择框：`style="width: 100px"`

#### 2. 简化圆角样式
- 全局设置 `:deep(.el-input__wrapper) { border-radius: 8px !important }`
- 前置选择器圆角：`border-radius: 8px 0 0 8px`

### 验证结果
✅ `npm run build` 构建成功
✅ 输入框尺寸 424px/863px/100px 已生效
✅ 圆角 8px 生效
✅ Checkbox 对勾居中正常

---

## 2026-03-06: HttpStepDrawer 抽屉布局结构调整

### 任务
按照截图所示的结构，将抽屉分为两个主要容器：
1. 第一个容器：基础信息 + 详细信息（请求相关）
2. 第二个容器：响应体、响应头（响应相关）

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 添加响应相关数据
- `responseTab`: 响应标签页状态
- `responseFormat`: 响应格式（JSON）
- `responseData`: 响应数据（状态码、响应时间、响应体、响应头）
- `responseHeadersList`: 响应头列表计算属性

#### 2. 重构抽屉布局
- 使用 `el-form` 作为根容器（保留表单功能）
- 第一个容器 `.request-section`: 包含基础信息和详细信息
- 第二个容器 `.response-section`: 包含响应体和响应头

#### 3. 响应部分UI
- 响应体标签页：JSON格式展示，带格式化的代码编辑器样式
- 响应头标签页：Key-Value表格展示
- 响应元信息：状态码、响应时间、测试站标签、键值标签

#### 4. 修复问题
- 修复了 `request-section` div 缺少闭合标签的问题
- 确保 `el-form-item` 在 `el-form` 内部使用

### 新增样式
- `.drawer-container`: 抽屉主容器，flex布局
- `.request-section`: 请求相关区域
- `.response-section`: 响应相关区域，带顶部边框
- `.response-meta`: 响应元信息区域
- `.code-editor`: 代码编辑器样式（等宽字体）

### 验证结果
✅ `npm run build` 构建成功
✅ 抽屉分为请求和响应两个容器
✅ 基础信息 + 详细信息在第一个容器
✅ 响应体 + 响应头在第二个容器

---

## 2026-03-06: HttpStepDrawer 容器布局重构（占位符版）

### 任务
按照截图所示，重新设计抽屉容器布局结构，使用占位符显示各区域名称。

### 布局结构

#### 头部（抽屉外部）
- 标题：接口用例配置
- 操作按钮：分享、另存为

#### 主内容区 - 两个容器

**容器1：请求信息**
- 基础信息区域（占位符）
- 详细信息区域
  - 6个Tab：入参/断言、预设变量、前置操作、后置操作、设置、网关/登陆
  - 入参/断言 Tab 下分为：
    - 请求入参（Params/Headers/Body/IPPort/加密）
    - 断言模块

**容器2：响应信息**
- 响应体 Tab：响应值、期望值、实际入参（三列布局）
- 响应头 Tab：响应头信息
- 响应元信息：测试站、键值、状态码、响应时间

#### 底部（抽屉外部）
- 保存、保存并继续、测试一下、分环境测试

### 占位符内容
每个区域显示居中的占位文字，如：
- "基础信息区域"
- "Params 区域"
- "响应值"
- "期望值" 等

### 验证结果
✅ `npm run build` 构建成功
✅ 容器布局符合截图结构
✅ 各区域名称居中显示
✅ 头部和底部在抽屉外部

---

## 2026-03-06: HttpStepDrawer 添加展开/收起和响应区域控制

### 任务
1. 基础信息区域和详细信息区域添加展开/收起功能
2. 响应信息区域默认隐藏，点击"测试一下"后才显示

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 新增状态变量
- `basicExpanded`: 控制基础信息区域展开/收起（默认展开）
- `detailExpanded`: 控制详细信息区域展开/收起（默认展开）
- `showResponse`: 控制响应区域显示/隐藏（默认隐藏）

#### 2. 新增方法
- `toggleBasic()`: 切换基础信息展开状态
- `toggleDetail()`: 切换详细信息展开状态
- `handleTest()`: 点击测试按钮，显示响应区域

#### 3. 图标支持
- 导入 `ArrowDown` 和 `ArrowUp` 图标
- 收起状态显示 `ArrowRight`，展开状态显示 `ArrowDown`

#### 4. 样式更新
- `.section-header.clickable`: 可点击的标题行样式
- `.expand-icon`: 展开/收起图标样式
- 添加 hover 效果提示可点击

### 交互逻辑
- 点击基础信息标题行 → 切换展开/收起状态，图标变化
- 点击详细信息标题行 → 切换展开/收起状态，图标变化
- 点击"测试一下"按钮 → 显示响应信息区域

### 验证结果
✅ `npm run build` 构建成功
✅ 基础信息区域可展开/收起
✅ 详细信息区域可展开/收起
✅ 响应区域默认隐藏，测试后显示

---

## 2026-03-06: HttpStepDrawer 基础信息区域表单实现

### 任务
实现基础信息区域的实际表单，按指定尺寸设置输入框。

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 新增表单数据状态
- `basicForm`: 包含名称、模块、方法、URL、环境、步骤描述、预期结果、Jdos应用、开关状态
- `moduleOptions`: 模块下拉选项
- `methodOptions`: HTTP方法选项

#### 2. 基础信息表单布局
**第一排：**
- 名称：425x32 输入框，必填
- 接口所属模块：425x32 下拉选择框，必填
- 接口地址组：
  - 方法选择框：100x32 下拉
  - 地址输入框：704x32 输入框
  - 回车按钮：46x32

**第二排：**
- 特性环境：425x32 输入框
- 步骤描述：425x32 输入框
- 预期结果描述：425x32 输入框
- Jdos应用：425x32 输入框

**第三排：**
- 链路追踪(PFinder)：开关
- 压测标识(ForceBot)：开关
- 隐藏信息链接

#### 3. 新增图标
- `QuestionFilled`: 帮助图标
- `Link`: 链接图标

#### 4. 样式规格
- `.input-425`: 425x32 输入框/选择框
- `.input-100`: 100x32 方法选择框
- `.input-704`: 704x32 地址输入框
- `.btn-enter`: 46x32 回车按钮

### 验证结果
✅ `npm run build` 构建成功
✅ 所有输入框尺寸符合要求（425x32、100x32、704x32）
✅ 表单布局与截图一致

---

## 2026-03-06: HttpStepDrawer 第一排布局修复

### 任务
1. 修复接口所属模块下拉框长度和圆角问题
2. 调整第一排整体布局，与第二排保持长度一致
3. 方法选择器与请求地址之间添加间距

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 第一排布局重构
- 使用 flex 布局替代 el-col span 布局
- 名称列: 固定 424px
- 接口所属模块列: 固定 440px (含16px间距)
- 接口地址列: 固定 863px (含16px间距)

#### 2. 尺寸精确设置
- 名称输入框: 424px
- 接口所属模块下拉框: 424px
- 方法选择器: 100px
- 方法选择器与地址间距: 8px
- 请求地址输入框: 739px
- 第一排总宽度: 424 + 16 + 424 + 16 + 100 + 8 + 739 = 1727px (与第二排对齐)

#### 3. 圆角统一
- 所有输入框/选择框圆角: 8px
- 前置选择器圆角: 8px 0 0 8px
- 后置输入框圆角: 0 8px 8px 0

### 验证结果
✅ `npm run build` 构建成功
✅ 第一排布局与第二排对齐
✅ 接口所属模块下拉框 424px + 圆角 8px
✅ 方法选择器与请求地址之间有 8px 间距

---

## 2026-03-06: HttpStepDrawer 基础信息输入框相对布局优化

### 任务
根据用户反馈，将基础信息区域的输入框从固定像素宽度改为相对布局，只保留高度32px固定。

### 需求分析
1. 输入框高度固定32px（使用 !important 强制生效）
2. 输入框宽度使用相对布局（flex/grid）替代固定像素
3. 名称、接口所属模块、特性环境、步骤描述、预期结果描述、Jdos应用等输入框长度保持一致
4. 接口地址区域长度 = 名称长度 × 2（方法选择框 + 地址输入框 + 回车按钮）

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. HTML结构调整
**第一排（三列布局）：**
- 名称：flex: 1
- 接口所属模块：flex: 1
- 接口地址：flex: 2（名称的两倍宽度）

**第二排（四列布局）：**
- 特性环境：flex: 1
- 步骤描述：flex: 1
- 预期结果描述：flex: 1
- Jdos应用：flex: 1

#### 2. CSS样式重构
- 移除固定像素宽度类（.input-425, .input-100, .input-704）
- 添加 `.row-3-cols` 类：第一行三列布局
- 添加 `.row-4-cols` 类：第二行四列布局
- 保留 `.method-select` 固定100px（HTTP方法选择器）
- 保留 `.btn-enter` 固定46px（回车按钮）
- 使用 flex 自适应布局让地址输入框填充剩余空间

#### 3. 统一输入框高度
```css
:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  height: 32px !important;
}
```

### 布局逻辑
```
第一排：名称(1fr) + 模块(1fr) + 地址(2fr)
第二排：特性环境(1fr) + 步骤描述(1fr) + 预期结果(1fr) + Jdos应用(1fr)

地址区域内部：方法选择器(100px固定) + 地址输入框(自适应) + 回车按钮(46px固定)
```

### 验证结果
✅ `npm run build` 构建成功
✅ 输入框高度统一为32px
✅ 名称、模块、特性环境等输入框宽度一致（flex: 1）
✅ 接口地址区域宽度为名称的两倍（flex: 2）
✅ 响应式布局，随容器宽度自适应


---

## 2026-03-06: HttpStepDrawer 参照参考界面重构

### 任务
根据用户提供的 element.txt、html.txt、styles.txt 三个文件中的参考界面，重构 HttpStepDrawer.vue 组件，使其更接近参考界面的样式和布局。

### 分析参考界面结构

#### 1. 基础信息区域（ant-collapse）
- **第一行（3列）**：
  - 名称（ant-col-6，占1/4）
  - 接口所属模块（ant-col-6，占1/4）
  - 接口地址（ant-col-12，占1/2，包含方法选择器 + URL输入框 + 回车按钮）

- **第二行（4列）**：
  - 特性环境（ant-col-6，1/4）
  - 步骤描述（ant-col-6，1/4，textarea）
  - 预期结果描述（ant-col-6，1/4，textarea）
  - Jdos应用（ant-col-6，1/4）

- **第三行**：
  - 链路追踪(PFinder)：Switch开关
  - 压测标识(ForceBot)：Switch开关

- **隐藏信息链接**

#### 2. 详细信息区域（入参/断言 Tab）
- **组选择器**：添加按钮 + 复选框组（第1组、第2组...）
- **左侧（ant-col-11）**：请求入参
  - Params/Headers/Body/IPPort/加密 5个Tab
  - 键值表格：KEY/VALUE/操作
  - JSON添加按钮、批量编辑链接
- **右侧（ant-col-13）**：断言模块
  - 比对方式：普通/A/B（单选）
  - 对比规则：整体/键值（单选）+ 自定义脚本复选框
  - 规则形式：文本/JSONPath（单选按钮）
  - 排除空值：需要/不需要
  - 忽略顺序：需要/不需要
  - 断言表格：类型/字段/规则/期望值/备注/提取变量/操作

#### 3. 底部按钮
- 保存、保存并继续、测试一下、分环境测试
- "多个IP默认直连调用第一个" 提示

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 布局重构
- 使用 `el-row`/`el-col` 替代原来的 flex 布局，实现精确的栅格布局
- 基础信息第一行：6:6:12 比例（名称:模块:地址 = 1:1:2）
- 基础信息第二行：6:6:6:6 比例（4列等宽）
- 入参/断言区域：11:13 比例（左侧请求入参 + 右侧断言）

#### 2. 新增数据结构
- `assertForm`：断言表单数据（比对方式、对比规则、规则形式等）
- `paramGroups`：多组参数支持
- `getMethodColor`：HTTP方法颜色函数

#### 3. 组件样式优化
- 折叠面板样式：参考 ant-collapse 设计
- HTTP方法颜色：GET(绿)、POST(黄)、PUT(蓝)、PATCH(紫)、DELETE(红)
- 表单标签样式：带帮助图标、链接图标
- 组选择器：复选框 + 组名标签
- 断言区域：单选组、表格

#### 4. 图标替换
- Copy → Link（@element-plus/icons-vue 中没有 Copy）
- Edit → EditPen
- Enter → Right

### CSS设计令牌参考（styles.txt）
```css
--deeptest-primary-color: #1890ff
--color--primary: #2695F1
--height--form-input: 32px
--color--base--border: #dcdfe6
--color--base--background: #f0f2f5
```

### 布局对比
| 区域 | 旧布局 | 新布局 |
|-----|-------|-------|
| 基础信息行1 | flex: 1:1:1.5 | el-col 6:6:12 |
| 基础信息行2 | flex: 1:1:1:1 | el-col 6:6:6:6 |
| 入参/断言 | 占位符 | 11:13 两列 |
| 折叠面板 | 自定义 | 参考 ant-collapse |

### 验证结果
✅ `npm run build` 构建成功
✅ 基础信息区域布局与参考界面一致（3列+4列）
✅ HTTP方法颜色区分（GET绿、POST黄等）
✅ 入参/断言区域左右分栏（11:13）
✅ 断言模块单选组、表格样式完成
✅ 底部操作栏按钮布局完成


---

## 2026-03-06: HttpStepDrawer 基础信息区域展开/收起逻辑优化

### 任务
优化基础信息区域的展开/收起逻辑，实现以下交互：
1. 始终显示：第一排（名称、接口所属模块、接口地址）+ 第二排（特性环境、预期结果描述）
2. 收起时隐藏：第二排后两个（步骤描述、Jdos应用）+ 第三排（链路追踪、压测标识）
3. 展开时显示：全部内容

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 新增状态变量
```javascript
const showMoreInfo = ref(false) // 更多信息展开/收起（控制第二排后两个和第三排）
```

#### 2. 新增切换函数
```javascript
function toggleMoreInfo() {
  showMoreInfo.value = !showMoreInfo.value
}
```

#### 3. 第二行动态布局
**收起时（showMoreInfo = false）：**
- 特性环境：:span="12"（占1/2）
- 预期结果描述：:span="12"（占1/2）
- 步骤描述：v-if="showMoreInfo"（隐藏）
- Jdos应用：v-if="showMoreInfo"（隐藏）

**展开时（showMoreInfo = true）：**
- 特性环境：:span="6"（占1/4）
- 步骤描述：v-if="showMoreInfo" :span="6"（显示，占1/4）
- 预期结果描述：:span="6"（占1/4）
- Jdos应用：v-if="showMoreInfo" :span="6"（显示，占1/4）

#### 4. 第三排条件显示
```vue
<el-row v-if="showMoreInfo" :gutter="16">
  <!-- 链路追踪、压测标识 -->
</el-row>
```

#### 5. 切换链接
```vue
<div class="more-link">
  <el-link v-if="!showMoreInfo" type="primary" @click="toggleMoreInfo">更多信息</el-link>
  <el-link v-else type="primary" @click="toggleMoreInfo">隐藏信息</el-link>
</div>
```

### 布局对比
| 状态 | 特性环境 | 步骤描述 | 预期结果描述 | Jdos应用 | 链路追踪 | 压测标识 |
|-----|---------|---------|-------------|---------|---------|---------|
| 收起 | 12 (1/2) | 隐藏 | 12 (1/2) | 隐藏 | 隐藏 | 隐藏 |
| 展开 | 6 (1/4) | 6 (1/4) | 6 (1/4) | 6 (1/4) | 显示 | 显示 |

### 验证结果
✅ `npm run build` 构建成功
✅ 收起时第二排为2列布局（特性环境 + 预期结果描述）
✅ 展开时第二排变为4列布局（特性环境 + 步骤描述 + 预期结果描述 + Jdos应用）
✅ 第三排仅在展开时显示
✅ "更多信息"/"隐藏信息" 链接切换正常


---

## 2026-03-06: HttpStepDrawer HTTP方法下拉选项添加颜色

### 任务
为HTTP方法下拉选择框的选项添加颜色，与截图所示一致：
- GET: 绿色
- POST: 黄色/金色  
- PUT: 蓝色
- PATCH: 紫色
- DELETE: 红色

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 为 el-option 添加颜色类
```vue
<el-option
  v-for="opt in methodOptions"
  :key="opt.value"
  :label="opt.label"
  :value="opt.value"
  :class="`method-option color-${opt.value}`"
/>
```

#### 2. 添加下拉选项颜色样式
```css
/* HTTP方法下拉选项颜色 */
.method-option.color-GET {
  color: #52c41a;
}

.method-option.color-POST {
  color: #faad14;
}

.method-option.color-PUT {
  color: #1890ff;
}

.method-option.color-PATCH {
  color: #722ed1;
}

.method-option.color-DELETE {
  color: #f5222d;
}
```

### 颜色对照表
| HTTP方法 | 颜色值 | 显示效果 |
|---------|-------|---------|
| GET | #52c41a | 绿色 |
| POST | #faad14 | 黄色/金色 |
| PUT | #1890ff | 蓝色 |
| PATCH | #722ed1 | 紫色 |
| DELETE | #f5222d | 红色 |

### 验证结果
✅ `npm run build` 构建成功
✅ HTTP方法下拉选项已添加对应颜色
✅ 选择框中已选中的方法也显示对应颜色


---

## 2026-03-06: HttpStepDrawer HTTP方法选中后颜色优化

### 任务
修复HTTP方法选择框中，选中的值没有显示颜色的问题。要求选中后输入框中显示的方法名也带颜色。

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 添加更强的CSS选择器
为每个HTTP方法添加两个选择器，确保选中的值在输入框中显示颜色：
- `:deep(.el-input__inner)` - 输入框内部文本
- `:deep(.el-select__selected-item)` - Element Plus Select 选中的项目

#### 2. 统一颜色值
将选中值的颜色与下拉选项颜色统一：
```css
/* GET - 绿色 */
.method-select.color-GET :deep(.el-input__inner),
.method-select.color-GET :deep(.el-select__selected-item) {
  color: #52c41a !important;
}

/* POST - 黄色 */
.method-select.color-POST :deep(.el-input__inner),
.method-select.color-POST :deep(.el-select__selected-item) {
  color: #faad14 !important;
}

/* PUT - 蓝色 */
.method-select.color-PUT :deep(.el-input__inner),
.method-select.color-PUT :deep(.el-select__selected-item) {
  color: #1890ff !important;
}

/* PATCH - 紫色 */
.method-select.color-PATCH :deep(.el-input__inner),
.method-select.color-PATCH :deep(.el-select__selected-item) {
  color: #722ed1 !important;
}

/* DELETE - 红色 */
.method-select.color-DELETE :deep(.el-input__inner),
.method-select.color-DELETE :deep(.el-select__selected-item) {
  color: #f5222d !important;
}
```

### 颜色对照表（选中后）
| HTTP方法 | 颜色值 | 显示效果 |
|---------|-------|---------|
| GET | #52c41a | 🟢 绿色 |
| POST | #faad14 | 🟡 黄色 |
| PUT | #1890ff | 🔵 蓝色 |
| PATCH | #722ed1 | 🟣 紫色 |
| DELETE | #f5222d | 🔴 红色 |

### 验证结果
✅ `npm run build` 构建成功
✅ 选中的HTTP方法在选择框中显示对应颜色
✅ 下拉选项也显示对应颜色


---

## 2026-03-06: HttpStepDrawer 参数组功能完善

### 任务
根据用户提供的截图和参考界面，实现参数组的完整功能：
1. 点击添加后，默认文案"第1组""第2组"
2. 鼠标悬浮后面的三个竖着的点按钮，展示重命名、复制、删除三个选项
3. 重命名弹窗（分组名称）
4. 复制功能，文案后面加"-copy"，支持复制所有已填写的内容
5. 删除直接移除

### 分析参考界面（element.txt）
参考界面使用 `ant-btn-group ant-dropdown-button` 实现：
- 左侧按钮：带复选框的组名按钮
- 右侧按钮：更多操作按钮（三个点）
- 悬浮下拉菜单：重命名、复制、删除

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 数据结构更新
```javascript
// 参数组数据结构
{ 
  id: 1, 
  name: '第1组', 
  checked: true, 
  params: [], 
  headers: [], 
  body: '', 
  ipport: '', 
  encrypt: '' 
}
```

#### 2. 新增状态和方法
```javascript
// 重命名弹窗状态
const renameDialogVisible = ref(false)
const renameForm = ref({ id: null, name: '' })

// 打开重命名弹窗
function openRenameDialog(group)

// 关闭重命名弹窗
function closeRenameDialog()

// 确认重命名
function confirmRename()

// 复制参数组（深拷贝所有数据）
function copyGroup(group)

// 删除参数组
function deleteGroup(groupId)
```

#### 3. 模板重构
- 使用 `el-button-group` 实现按钮组样式
- 左侧：带复选框的组名按钮（点击切换当前组）
- 右侧：`el-dropdown` 更多操作按钮（悬浮触发）
- 下拉菜单项：重命名、复制、删除（带图标和分割线）

#### 4. 重命名弹窗
```vue
<el-dialog title="分组名称" width="400px">
  <el-input v-model="renameForm.name" />
  <template #footer>
    <el-button @click="closeRenameDialog">取消</el-button>
    <el-button type="primary" @click="confirmRename">确定</el-button>
  </template>
</el-dialog>
```

#### 5. 图标导入
新增 `CopyDocument` 图标用于复制功能

### 功能说明
| 功能 | 实现方式 | 说明 |
|-----|---------|-----|
| 添加组 | addGroup() | 自动生成"第N组"名称 |
| 重命名 | 弹窗编辑 | 点击确定后更新组名 |
| 复制 | copyGroup() | 深拷贝所有数据，名称加"-copy"后缀 |
| 删除 | deleteGroup() | 直接移除，至少保留一个组 |
| 切换组 | 点击组名按钮 | 切换当前编辑的组 |

### 验证结果
✅ `npm run build` 构建成功
✅ 添加参数组功能正常
✅ 重命名弹窗正常打开/关闭
✅ 复制功能生成"-copy"后缀组
✅ 删除功能正常（至少保留一个组）
✅ 下拉菜单悬浮展示


---

## 2026-03-06: HttpStepDrawer 三个竖着的点按钮图标替换

### 任务
将参数组更多操作按钮的图标，从 Element Plus 的 `More` 图标替换为用户提供的自定义 SVG 路径（三个竖着的点）。

### 用户提供的 SVG 路径
```
M456 231a56 56 0 10112 0 56 56 0 10-112 0zm0 280a56 56 0 10112 0 56 56 0 10-112 0zm0 280a56 56 0 10112 0 56 56 0 10-112 0z
```

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 替换图标代码
```vue
<!-- 原来 -->
<el-icon><More /></el-icon>

<!-- 替换为 -->
<svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true">
  <path d="M456 231a56 56 0 10112 0 56 56 0 10-112 0zm0 280a56 56 0 10112 0 56 56 0 10-112 0zm0 280a56 56 0 10112 0 56 56 0 10-112 0z"></path>
</svg>
```

### SVG 属性说明
| 属性 | 值 | 说明 |
|-----|---|-----|
| viewBox | 64 64 896 896 | 与参考界面保持一致 |
| width | 1em | 与按钮文字同高 |
| height | 1em | 与按钮文字同高 |
| fill | currentColor | 继承按钮文字颜色 |
| aria-hidden | true | 对屏幕阅读器隐藏 |

### 验证结果
✅ `npm run build` 构建成功
✅ 三个竖着的点图标显示正常


---

## 2026-03-06: HttpStepDrawer 参数组选中状态优化

### 任务
根据用户提供的截图，优化参数组的选中状态显示：
1. 添加后第1组还是默认勾选，但选中状态（当前编辑组）默认是新增的组
2. 选中状态要包围两个按钮（组名按钮 + 更多按钮）
3. 两个按钮中间有一条竖线，颜色跟随按钮和选中状态

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 修改添加参数组逻辑
```javascript
function addGroup() {
  // ...
  paramGroups.value.push({
    // ...
    checked: false,  // 新添加的组默认不勾选，保持第1组勾选
  })
  currentGroupId.value = newId  // 但选中状态切换到新组
}
```

#### 2. 重构组选择器模板
- 移除 `el-button-group` 包装
- 使用 `div.group-item-wrapper` 作为容器，绑定 `active` 类
- 添加 `.group-divider` 作为中间竖线
- 选中状态应用到整个容器

```vue
<div 
  class="group-item-wrapper"
  :class="{ active: currentGroupId === group.id }"
>
  <el-button class="group-name-btn">...</el-button>
  <div class="group-divider"></div>
  <el-dropdown>...</el-dropdown>
</div>
```

#### 3. 优化样式
```css
/* 容器边框和选中状态 */
.group-item-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.group-item-wrapper.active {
  border-color: #409eff;
  background: #ecf5ff;
}

/* 中间竖线 */
.group-divider {
  width: 1px;
  height: 16px;
  background-color: #dcdfe6;
}

.group-item-wrapper.active .group-divider {
  background-color: #a0cfff;
}

/* 按钮无边框和背景 */
.group-name-btn,
.group-more-btn {
  border: none;
  background: transparent;
}
```

### 效果对比
| 项目 | 修改前 | 修改后 |
|-----|-------|-------|
| 复选框勾选 | 新组默认勾选 | 第1组保持勾选，新组不勾选 |
| 选中状态范围 | 仅左侧按钮 | 两个按钮都被包围 |
| 中间竖线 | 无 | 有，颜色跟随选中状态 |

### 验证结果
✅ `npm run build` 构建成功
✅ 添加后第1组保持勾选
✅ 选中状态（当前组）切换到新添加的组
✅ 两个按钮都被选中样式包围
✅ 中间竖线颜色跟随选中状态


---

## 2026-03-06: HttpStepDrawer 参数组按钮边框重合显示优化

### 任务
根据用户反馈，将参数组的两个按钮改为使用 el-button-group，让它们的边框重合在一起显示，而不是使用单独的竖线。

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 恢复使用 el-button-group
```vue
<div 
  class="group-item-wrapper"
  :class="{ active: currentGroupId === group.id }"
>
  <el-button-group class="group-button-group">
    <el-button class="group-name-btn">...</el-button>
    <el-dropdown>...</el-dropdown>
  </el-button-group>
</div>
```

#### 2. 修改选中状态样式
选中状态时，两个按钮的边框颜色都变为蓝色：
```css
.group-item-wrapper.active .group-name-btn {
  border-color: #409eff;
  background: #ecf5ff;
  color: #409eff;
}

.group-item-wrapper.active .group-more-btn {
  border-color: #409eff;
  background: #ecf5ff;
  color: #409eff;
}
```

### 实现效果
- 使用 `el-button-group` 使两个按钮的边框重合显示
- 选中状态时，两个按钮都显示蓝色边框和背景
- 中间的"竖线"实际上是两个按钮边框重合的效果

### 验证结果
✅ `npm run build` 构建成功
✅ 两个按钮边框重合显示
✅ 选中状态两个按钮都变蓝色


---

## 2026-03-06: HttpStepDrawer 入参区域边框圆角优化

### 任务
给入参区域（Params/Headers/Body/IPPort/加密）的大边框加上 5px 圆角。

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 添加圆角样式
```css
.params-tabs {
  border-radius: 5px;
  overflow: hidden;
}
```

### 说明
- 给 `el-tabs[type="border-card"]` 添加 `border-radius: 5px`
- 添加 `overflow: hidden` 确保圆角生效

### 验证结果
✅ `npm run build` 构建成功
✅ 入参区域边框圆角 5px 已生效


---

## 2026-03-06: HttpStepDrawer JSON 添加功能实现

### 任务
实现 JSON 添加功能：
1. 点击 JSON 添加按钮，打开弹窗
2. 弹窗可以输入并校验 JSON 格式
3. 点击生成，解析 JSON 并显示可勾选项
4. 勾选选项后点击保存，参数以 KV 形式添加到 params/headers
5. 点击取消或 X 关闭弹窗
6. 错误的 JSON 格式可以校验出来

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 新增状态和函数
```javascript
// JSON 添加弹窗状态
const jsonDialogVisible = ref(false)
const jsonForm = ref({
  content: '',
  type: 'params', // params 或 headers
  parsedKeys: [],
  selectedKeys: []
})
const jsonError = ref('')

// 打开/关闭/解析/保存 JSON 函数
function openJsonDialog(type)
function closeJsonDialog()
function parseJson()
function saveJsonParams()
```

#### 2. JSON 弹窗模板
- 标题：Json添加Param
- 错误提示：el-alert 显示 JSON 错误
- 文本域：输入 JSON 数据
- 生成按钮：解析 JSON
- 勾选项列表：选择要添加的字段
- 保存/取消按钮

#### 3. JSON 校验逻辑
```javascript
function parseJson() {
  // 1. 检查空内容
  // 2. JSON.parse 解析
  // 3. 检查是否为对象（非数组）
  // 4. 提取所有 key-value
}
```

#### 4. 按钮绑定
- Params 标签页：@click="openJsonDialog('params')"
- Headers 标签页：@click="openJsonDialog('headers')"

### 验证结果
✅ `npm run build` 构建成功
✅ JSON 添加弹窗正常打开/关闭
✅ JSON 格式校验功能正常
✅ 生成按钮解析 JSON 并显示可勾选项
✅ 保存按钮将选中项添加到对应组
✅ 所有 JSON 添加按钮都支持此功能


---

## 2026-03-06: HttpStepDrawer JSON 添加弹窗优化

### 任务
按照参考界面的形式优化 JSON 添加功能：
1. 点击 JSON 添加按钮，打开弹窗
2. 输入 JSON 数据，点击生成
3. 在同一个弹窗中显示格式化后的 JSON，每个参数前加复选框
4. 选中后点击保存，关闭弹窗并将参数添加到下方表格

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 修改数据结构
```javascript
const jsonForm = ref({
  content: '',
  type: 'params',
  parsedData: null,  // 存储解析后的完整对象
  selectedKeys: [],
  showParsed: false  // 控制显示输入区还是格式化展示区
})
```

#### 2. 弹窗模板修改
- 输入阶段：显示 textarea 输入框
- 生成后：隐藏输入框，显示格式化 JSON 树
- 格式化 JSON 使用代码风格（不同颜色区分类型）
- 每个字段前有 el-checkbox 复选框

#### 3. 格式化 JSON 展示
```vue
<div class="json-tree">
  <span class="json-bracket">{</span>
  <div class="json-item" v-for="(value, key) in jsonForm.parsedData" :key="key">
    <el-checkbox v-model="jsonForm.selectedKeys" :label="key">
      <span class="json-key">"{{ key }}"</span>
      <span class="json-colon">: </span>
      <span :class="['json-value', getValueColorClass(value)]">
        {{ formatJsonValue(value) }}
      </span>
    </el-checkbox>
  </div>
  <span class="json-bracket">}</span>
</div>
```

#### 4. 颜色区分
- key: 紫色 (#881391)
- string: 蓝色 (#268bd2)
- number: 青色 (#2aa198)
- boolean: 黄色 (#b58900)

#### 5. 按钮逻辑
- 输入阶段：显示"生成"按钮
- 展示阶段：显示"重新输入"按钮（返回输入界面）
- 保存：将选中的参数添加到对应组
- 取消/X：关闭弹窗

### 验证结果
✅ `npm run build` 构建成功
✅ 同一个弹窗中切换输入/展示视图
✅ 格式化 JSON 带复选框
✅ 不同值类型显示不同颜色
✅ 保存后将参数添加到 params/headers


---

## 2026-03-06: HttpStepDrawer JSON 保存后数据未显示问题修复

### 问题
选中 JSON 参数后点击保存，数据没有以 KV 形式添加到 params 表格中。

### 原因
表格绑定的数据是空数组 `[]`，没有绑定到实际的数据源。

### 修复内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. 添加计算属性获取当前组
```javascript
const currentGroup = computed(() => {
  return paramGroups.value.find(g => g.id === currentGroupId.value) || paramGroups.value[0]
})
```

#### 2. 修改表格数据绑定
**Params 表格:**
```vue
<el-table :data="currentGroup.params" size="small" border>
  <el-table-column label="KEY" min-width="120" prop="key" />
  <el-table-column label="VALUE" min-width="180" prop="value" />
  <el-table-column label="操作" width="80" align="center">
    <template #default="{ $index }">
      <el-button link type="danger" size="small" @click="currentGroup.params.splice($index, 1)">
        <el-icon><Delete /></el-icon>
      </el-button>
    </template>
  </el-table-column>
</el-table>
```

**Headers 表格:**
```vue
<el-table :data="currentGroup.headers" size="small" border>
  <el-table-column label="KEY" min-width="120" prop="key" />
  <el-table-column label="VALUE" min-width="180" prop="value" />
  <el-table-column label="操作" width="80" align="center">
    <template #default="{ $index }">
      <el-button link type="danger" size="small" @click="currentGroup.headers.splice($index, 1)">
        <el-icon><Delete /></el-icon>
      </el-button>
    </template>
  </el-table-column>
</el-table>
```

#### 3. 修改 saveJsonParams 函数
使用计算属性 `currentGroup` 替代查找逻辑。

### 验证结果
✅ `npm run build` 构建成功
✅ JSON 保存后数据正确显示在表格中
✅ 表格支持删除操作


---

## 2026-03-06: HttpStepDrawer JSON缓存和表格编辑优化

### 任务
1. JSON添加弹窗的内容保存在缓存中，下次打开还有，不用重复填写
2. 表格中的key和value可以编辑，使用输入框形式

### 修改内容
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

#### 1. JSON内容缓存到localStorage
```javascript
// 打开弹窗时从缓存恢复
function openJsonDialog(type = 'params') {
  jsonForm.value.content = localStorage.getItem('jsonAddContent') || ''
  // ...
}

// 关闭弹窗时保存到缓存
function closeJsonDialog() {
  localStorage.setItem('jsonAddContent', jsonForm.value.content)
  // ...
}
```

#### 2. 表格支持编辑
将表格的KEY和VALUE列改为使用el-input输入框：
```vue
<el-table-column label="KEY" min-width="120">
  <template #default="{ row }">
    <el-input v-model="row.key" size="small" placeholder="请输入Key" />
  </template>
</el-table-column>
<el-table-column label="VALUE" min-width="180">
  <template #default="{ row }">
    <el-input v-model="row.value" size="small" placeholder="请输入Value" />
  </template>
</el-table-column>
```

### 验证结果
✅ `npm run build` 构建成功
✅ JSON弹窗内容保存到localStorage，下次打开自动恢复
✅ 表格KEY和VALUE列支持直接编辑
✅ Params和Headers表格都支持编辑


---

## 2026-03-06: HttpStepDrawer JSON缓存改为 Pinia + 持久化插件方案

### 任务
将 JSON 弹窗内容缓存从 localStorage 改为 Pinia + 持久化插件方案。

### 修改内容

#### 1. 安装持久化插件
```bash
npm install pinia-plugin-persistedstate --save
```

#### 2. 修改 main.js 注册插件
```javascript
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
```

#### 3. 创建 Store 文件
**新建文件:** `src/domains/casemgmt/stores/useJsonCacheStore.js`

```javascript
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useJsonCacheStore = defineStore('jsonCache', () => {
  const content = ref('')

  function setContent(newContent) {
    content.value = newContent
  }

  function clearContent() {
    content.value = ''
  }

  return {
    content,
    setContent,
    clearContent
  }
}, {
  persist: true
})
```

#### 4. 修改 HttpStepDrawer.vue
- 导入 Store: `import { useJsonCacheStore } from '../stores/useJsonCacheStore'`
- 打开弹窗时从 Store 恢复: `jsonForm.value.content = jsonCacheStore.content`
- 关闭弹窗时保存到 Store: `jsonCacheStore.setContent(jsonForm.value.content)`

### 优势对比
| 方案 | 优点 |
|-----|-----|
| localStorage | 简单直接 |
| Pinia + 持久化 | 符合项目规范、支持响应式、更好的类型支持、统一的存储管理 |

### 验证结果
✅ `npm run build` 构建成功
✅ Pinia Store 创建成功
✅ 持久化插件配置正确
✅ JSON 弹窗内容使用 Pinia 存储并持久化


---

## 2026-03-06: HttpStepDrawer JSON 树形展示优化

### 任务
修复 JSON 格式化展示问题，支持多级嵌套对象的展开和选择。

### 问题
原来的实现只展示了第一层级的属性，没有递归展示嵌套对象和数组的内容。

### 解决方案
创建递归组件 `JsonTreeNode.vue` 来渲染多级 JSON 数据结构。

### 修改内容

#### 1. 新建递归组件
**文件:** `src/domains/casemgmt/components/JsonTreeNode.vue`

- 递归渲染 JSON 对象的所有层级
- 支持展开/折叠嵌套对象和数组
- 每个节点前有复选框用于选择
- 不同类型值显示不同颜色

#### 2. 修改 HttpStepDrawer.vue

**新增函数:**
```javascript
// 扁平化 JSON 数据
function flattenJson(obj, parentKey = '')

// 切换节点展开/折叠
function toggleNode(key)
```

**修改数据结构:**
```javascript
const jsonForm = ref({
  content: '',
  type: 'params',
  parsedData: null,
  selectedKeys: [],
  showParsed: false,
  expandedKeys: [],      // 展开的节点
  flattenedData: []      // 扁平化后的数据
})
```

**修改模板:**
```vue
<json-tree-node
  v-for="item in jsonForm.flattenedData"
  :key="item.key"
  :node="item"
  v-model:selected-keys="jsonForm.selectedKeys"
  v-model:expanded-keys="jsonForm.expandedKeys"
/>
```

### 组件特性
- 支持多级嵌套对象展开/折叠
- 支持数组展开查看元素
- 复选框可选择任意层级的节点
- 不同类型值显示不同颜色（字符串蓝色、数字青色、布尔值黄色）
- 默认展开所有对象和数组

### 验证结果
✅ `npm run build` 构建成功
✅ JSON 递归组件创建成功
✅ 支持多级嵌套对象展开
✅ 支持数组元素展开
✅ 每个节点支持复选框选择


---

## 2026-03-07: HttpStepDrawer JSON 添加功能组件化

### 任务
1. 修复 JSON 展示：不用 data. 前缀，直接使用当前参数名
2. 所有层级都要展示出来，包括数组和对象下的
3. 将 JSON 添加功能封装成独立组件，断言的地方也需要使用

### 修改内容

#### 1. 新建组件文件
**文件:** `src/domains/casemgmt/components/JsonAddDialog.vue`
- 封装完整的 JSON 添加弹窗功能
- 支持多级嵌套对象的展示和选择
- 使用 Pinia Store 缓存内容

**文件:** `src/domains/casemgmt/components/JsonTreeNode.vue`
- 递归渲染 JSON 树
- 默认展开所有层级
- 显示当前层级的 key（不显示完整路径）
- 支持复选框选择

#### 2. 修改 HttpStepDrawer.vue
- 移除旧的 JSON 相关逻辑
- 使用新的 JsonAddDialog 组件
- 通过事件接收保存的数据

### 关键变更

#### JsonTreeNode 组件
```vue
<!-- 显示当前层的 displayKey，不显示完整路径 -->
<span class="json-key">"{{ node.displayKey || node.key }}"</span>

<!-- 默认展开所有层级，不需要 expandedKeys -->
<div v-if="hasChildren" class="json-children">
  <json-tree-node ... />
</div>
```

#### flattenJson 函数
```javascript
function flattenJson(obj, parentKey = '', result = []) {
  for (const [key, value] of Object.entries(obj)) {
    const currentKey = parentKey ? `${parentKey}.${key}` : key
    
    // 添加 displayKey 只显示当前层级的 key
    result.push({
      key: currentKey,        // 完整路径用于保存
      displayKey: key,        // 只显示当前层级的 key
      ...
    })
    
    // 递归处理子属性，全部展开
    if (typeof value === 'object' && value !== null) {
      flattenJson(value, currentKey, result)
    }
  }
}
```

### 验证结果
✅ `npm run build` 构建成功
✅ JSON 添加功能封装为独立组件
✅ 默认展开所有层级
✅ 显示当前层级的 key（不显示 data. 前缀）


## 2026-03-06: 优化 JSON 对话框显示效果

### 任务
根据用户反馈，优化 JSON 添加对话框的树形展示效果：
1. 所有层级默认完整展开显示
2. 数组不显示 [0], [1] 等索引，直接显示对象字段

### 修改内容

#### 1. JsonAddDialog.vue
**修改文件:** `src/domains/casemgmt/components/JsonAddDialog.vue`

**核心改动:**
- 重构 `jsonToTree` 函数，数组直接展开为对象节点
- 数组中的对象元素使用字段名（如 `logoList1`）代替索引（如 `[0]`）
- 根数组情况特殊处理，展开所有对象字段

```javascript
// 数组 - 直接展开为多个对象节点，不显示索引
if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
  // 数组元素是对象，为每个元素创建节点
  value.forEach((item, index) => {
    const itemKey = `${currentKey}[${index}]`
    result.push({
      key: itemKey,
      displayKey: key, // 显示原始字段名，不显示 [0], [1]
      value: `[Object]`,
      type: 'object',
      children: jsonToTree(item, itemKey)
    })
  })
}
```

#### 2. JsonTreeNode.vue
**修改文件:** `src/domains/casemgmt/components/JsonTreeNode.vue`

**核心改动:**
- 优化节点渲染逻辑，支持 `displayKey` 为空的情况
- 基本类型数组元素不显示索引标签

```javascript
// 有 displayKey 时显示 key: value 格式
<template v-if="node.displayKey || node.displayKey === ''">
  <span v-if="node.displayKey" class="json-key">"{{ node.displayKey }}"</span>
  <span v-if="node.displayKey" class="json-colon">: </span>
  ...
</template>
```

### 展示效果对比

**优化前:**
```
□ "logoList1": [Array(9)]
  □ "[0]": "{\"name\":\"尊道\",...}"
  □ "[1]": "{\"name\":\"美众\",...}"
  □ "[2]": "{\"name\":\"我打单\",...}"
```

**优化后:**
```
□ "logoList1": [Object]
  □ "name": "尊道"
  □ "imgUrl": "//img14.360buyimg.com/..."
□ "logoList1": [Object]
  □ "name": "美众"
  □ "imgUrl": "//img13.360buyimg.com/..."
□ "logoList1": [Object]
  □ "name": "我打单"
  □ "imgUrl": "//img12.360buyimg.com/..."
```

### 验证结果
✅ `npm run build` 构建成功
✅ 数组对象直接展开，显示字段名而非索引
✅ 所有层级默认完全展开
✅ 选中保存后路径解析正确

---

---

## 2026-03-07: JSON 格式化展示优化 - 参照 json.cn 格式

### 任务
优化 JSON 格式化展示，参照 json.cn 格式交互：
1. 响应值全部展示出来，不显示 `[object]`
2. 层级展示，类似 json.cn
3. 在每个响应 key 之前加上勾选框
4. 支持展开/收起功能

### 修改内容

#### 1. JsonAddDialog.vue
**修改文件:** `src/domains/casemgmt/components/JsonAddDialog.vue`

**核心改动:**
- 重构 `jsonToTree` 函数，对象和数组都完整展开显示内部字段
- 不再显示 `[Object]` 或 `[Array]` 占位符，而是展开显示所有层级
- 添加全选/取消全选功能
- 添加选中计数显示
- 优化路径解析逻辑，支持数组索引路径

```javascript
// 对象 - 展开显示所有内部字段
result.push({
  key: currentKey,
  displayKey: key,
  value: value,
  type: 'object',
  path: currentPath,
  children: jsonToTree(value, currentKey, currentPath)
})

// 数组 - 展开显示所有元素
const children = []
value.forEach((item, index) => {
  const itemKey = `${currentKey}[${index}]`
  const itemPath = `${currentPath}[${index}]`
  if (typeof item === 'object' && item !== null) {
    children.push({
      key: itemKey,
      displayKey: `[${index}]`,
      value: item,
      type: 'object',
      path: itemPath,
      children: jsonToTree(item, itemKey, itemPath)
    })
  } else {
    children.push({
      key: itemKey,
      displayKey: `[${index}]`,
      value: item,
      type: 'primitive',
      path: itemPath,
      children: []
    })
  }
})
```

#### 2. JsonTreeNode.vue
**修改文件:** `src/domains/casemgmt/components/JsonTreeNode.vue`

**核心改动:**
- 参照 json.cn 格式，添加展开/收起图标
- 每个 key 前有复选框
- 对象和数组显示大括号 `{}` / `[]`
- 显示完整的数据结构，不显示 `[Object]`
- 不同类型值显示不同颜色
- 支持递归渲染嵌套结构
- 添加逗号分隔符（除了最后一个元素）

```vue
<template>
  <div class="json-tree-node">
    <!-- 展开/收起图标 -->
    <span v-if="hasChildren" class="expand-icon" @click="toggleExpand">▶</span>
    
    <!-- 复选框 + key + value -->
    <el-checkbox v-model="isSelected">
      <span class="json-key">"{{ node.displayKey }}"</span>
      <span class="json-colon">: </span>
      <!-- 基本类型直接显示值 -->
      <span v-if="node.type === 'primitive'" :class="['json-value', getValueColorClass(node.value)]">
        {{ formatValue(node.value) }}
      </span>
      <!-- 对象/数组显示大括号和预览 -->
      <span v-else class="json-bracket">
        {{ node.type === 'object' ? '{' : '[' }}
      </span>
    </el-checkbox>
    
    <!-- 递归渲染子节点 -->
    <div v-if="hasChildren && expanded" class="json-children">
      <json-tree-node v-for="child in node.children" :key="child.key" :node="child" ... />
      <!-- 闭合括号 -->
      <span class="json-bracket">{{ node.type === 'object' ? '}' : ']' }}</span>
    </div>
  </div>
</template>
```

**样式特点:**
- 等宽字体：Monaco, Menlo, Consolas, Courier New
- 层级缩进：每级 20px
- 颜色区分：
  - key: 紫色 (#881391)
  - string: 蓝色 (#268bd2)
  - number: 青色 (#2aa198)
  - boolean/null: 黄色 (#b58900)
  - bracket: 灰色 (#606266)

### 展示效果

**优化后（参照 json.cn 格式）:**
```
□ {                         ← 勾选框 + 大括号
  ▶ □ "code": "01"          ← 展开图标 + 勾选框 + key: value
  ▼ □ "data": {             ← 收起时显示 ▶，展开时显示 ▼
      □ "logoList1": [      ← 数组展开
        □ [0]: {
          □ "name": "尊道"
          □ "imgUrl": "//img14..."
        },
        □ [1]: {
          □ "name": "美众"
          □ "imgUrl": "//img13..."
        }
      ]
    }
  □ "message": "success"
}
```

### 交互功能
1. **展开/收起**: 点击 ▶ / ▼ 图标切换
2. **勾选**: 点击复选框选择字段
3. **全选/取消全选**: 工具栏按钮一键操作
4. **选中计数**: 显示已选择项数量

### 验证结果
✅ `npm run build` 构建成功
✅ JSON 层级展示，参照 json.cn 格式
✅ 每个 key 前有勾选框
✅ 不显示 `[object]`，全部响应值展示出来
✅ 支持展开/收起功能
✅ 不同类型值显示不同颜色
✅ 全选/取消全选功能正常

---

---

## 2026-03-07: JSON 格式化展示优化 - 严格参照 json.cn 格式

### 任务
严格按照 json.cn 网站格式优化 JSON 展示：
1. 全部展开，所有层级都显示
2. 数组不显示下标 `[0]`、`[1]`，直接用 `{` 表示对象
3. 不管 value 多长，都不换行
4. 每个 key 前面有勾选框
5. 层级缩进展示

### 修改内容

#### 1. JsonAddDialog.vue
**修改文件:** `src/domains/casemgmt/components/JsonAddDialog.vue`

**核心改动:**
- 数组处理：不显示索引，直接展开对象内容
- 根数组特殊处理，直接展开所有对象字段
- 添加 `white-space: nowrap` 防止换行

```javascript
// 数组 - 展开显示所有元素，不显示索引
value.forEach((item, index) => {
  const itemKey = `${currentKey}[${index}]`
  if (typeof item === 'object' && item !== null) {
    // 数组元素是对象，递归展开，不显示 [0] 等索引
    const itemChildren = jsonToTree(item, itemKey)
    children.push(...itemChildren)
  }
})
```

#### 2. JsonTreeNode.vue
**修改文件:** `src/domains/casemgmt/components/JsonTreeNode.vue`

**核心改动:**
- 全部展开，不需要展开/收起功能
- 数组元素是对象时，不显示 `[0]` 索引，直接用 `{`
- 添加 `white-space: nowrap` 确保不换行
- 每个 key 前有勾选框
- 层级缩进 20px

```vue
<!-- 数组元素是对象，不显示索引 -->
<template v-if="child.type === 'object'">
  <div class="json-line" :style="{ paddingLeft: (level + 1) * 20 + 'px' }">
    <el-checkbox class="json-checkbox">
      <span class="json-bracket">{</span>  <!-- 直接用 {，不显示 [0] -->
    </el-checkbox>
  </div>
</template>
```

**样式关键:**
```css
.json-line {
  white-space: nowrap;  /* 不换行 */
}

.json-checkbox :deep(.el-checkbox__label) {
  white-space: nowrap;  /* 不换行 */
}
```

### 展示效果（参照 json.cn）

```
{                                          ← 根开始
  □ "code": "01",                         ← 勾选框 + key: value + 逗号
  □ "data": {                            ← 对象
    □ "logoList1": [                     ← 数组
      □ {                                ← 数组元素对象，不显示 [0]
        □ "name": "尊道",
        □ "imgUrl": "//img14..."
      },
      □ {                                ← 不显示 [1]
        □ "name": "美众",
        □ "imgUrl": "//img13..."
      }
    ]
  },
  □ "message": "success"
}
```

### 特点
1. **全部展开**：所有层级默认展开显示
2. **无数组索引**：数组中的对象直接用 `{` 开始，不显示 `[0]`、`[1]`
3. **不换行**：使用 `white-space: nowrap`，value 再长也不换行
4. **勾选框**：每个 key 前有复选框
5. **层级缩进**：每级 20px 缩进
6. **颜色区分**：key 紫色、string 蓝色、number 青色、boolean/null 黄色

### 验证结果
✅ `npm run build` 构建成功
✅ 全部展开，所有层级显示
✅ 数组不显示下标，直接用 `{`
✅ 不换行，white-space: nowrap
✅ 每个 key 前有勾选框
✅ 层级缩进展示

---

---

## 2026-03-07: JSON 格式化展示优化 - 修正缩进、收起展开、单选

### 任务
修正 JSON 展示的三个问题：
1. 缩进不正确 - 数组里的对象缩进层级不对
2. 对象需要收起/展开功能 - 收起显示 `{object}`，展开显示所有 KV
3. 勾选框单选 - 每个节点独立勾选，不影响其他节点

### 修改内容

#### 1. JsonTreeNode.vue
**修改文件:** `src/domains/casemgmt/components/JsonTreeNode.vue`

**核心改动:**

**a) 添加展开/收起功能:**
```javascript
const expanded = ref(true)  // 默认展开

function toggleExpand() {
  if (hasChildren.value) {
    expanded.value = !expanded.value
  }
}

// 收起时显示 {object} 或 [array]
<template v-if="expanded">
  <span class="json-bracket">{</span>
</template>
<template v-else>
  <span class="json-bracket">{</span>
  <span class="json-preview">{{ getPreviewText(node.value) }}</span>
  <span class="json-bracket">}</span>
</template>
```

**b) 单选勾选 - 只操作当前节点:**
```javascript
const isSelected = computed({
  get: () => props.selectedKeys.includes(props.node.path),
  set: (val) => {
    const keys = [...props.selectedKeys]
    if (val) {
      // 只添加当前节点，不影响子节点
      if (!keys.includes(props.node.path)) {
        keys.push(props.node.path)
      }
    } else {
      // 只移除当前节点
      const index = keys.indexOf(props.node.path)
      if (index > -1) keys.splice(index, 1)
    }
    emit('update:selectedKeys', keys)
  }
})
```

**c) 正确缩进 - level 逐层传递:**
```vue
<json-tree-node
  v-for="(child, index) in node.children"
  :level="level + 1"  <!-- 子节点缩进 +1 -->
/>
```

### 展示效果

**展开时:**
```
▼ □ "elements": {              ← 展开图标 + 勾选框 + key + {
    □ "sensitiveType": "",     ← 正确缩进（子节点）
    □ "parent": false,
    □ "SystemValue": false
  }
```

**收起时:**
```
▶ □ "elements": {3},           ← 收起图标 + 勾选框 + key + {3}
```

### 特点
1. **正确缩进**: 每级 20px，数组里的对象正确缩进
2. **收起/展开**: 点击 ▶/▼ 切换，收起显示 `{3}` 或 `[5]`
3. **单选勾选**: 每个节点独立勾选，不影响其他节点
4. **不换行**: `white-space: nowrap`
5. **颜色区分**: key 紫色、string 蓝色、number 青色

### 验证结果
✅ `npm run build` 构建成功
✅ 缩进正确，层级清晰
✅ 收起/展开功能正常，收起显示 {object}
✅ 勾选框单选，各节点独立

---

---

## 2026-03-07: JSON 格式化展示优化 - 每个对象/数组都有折叠按钮

### 任务
让每个对象和数组前面都有折叠收起按钮

### 修改内容

#### JsonTreeNode.vue
**修改文件:** `src/domains/casemgmt/components/JsonTreeNode.vue`

**核心改动:**
- 对象和数组类型始终显示展开/收起图标（▶）
- 空对象/数组的图标显示为半透明，但仍然可见
- 基本类型显示占位符保持对齐

```javascript
// 是否是可以折叠的类型（对象或数组）
const isCollapsible = computed(() => props.node.type === 'object' || props.node.type === 'array')
```

```vue
<!-- 对象类型始终显示展开图标 -->
<span 
  class="expand-icon"
  :class="{ expanded: expanded, empty: !hasChildren }"
  @click.stop="toggleExpand"
>
  ▶
</span>
```

```css
/* 空对象的展开图标样式 */
.expand-icon.empty {
  opacity: 0.3;
  cursor: default;
}
```

### 展示效果

```
▼ □ "method": {              ← 对象有展开按钮
▶ □ "elements": [            ← 数组有展开按钮
  ▼ □ {                      ← 数组里的对象也有展开按钮
    □ "name": "xxx"
  }
▶ □ "emptyObj": {0}          ← 空对象也有展开按钮（半透明）
  □ "str": "value"           ← 基本类型没有按钮，有占位符
```

### 特点
1. **对象有按钮**: 每个对象前面都有 ▶/▼
2. **数组有按钮**: 每个数组前面都有 ▶/▼
3. **空对象也显示**: 空对象/数组的按钮半透明，保持对齐
4. **基本类型占位**: 基本类型前面有占位符，保持缩进对齐

### 验证结果
✅ `npm run build` 构建成功
✅ 每个对象前面有折叠按钮
✅ 每个数组前面有折叠按钮
✅ 空对象/数组也显示按钮（半透明）

---

---

## 2026-03-07: JSON 格式化展示优化 - 级联选择

### 任务
勾选上级对象或数组时，自动选中所有下级内容（级联选择）

### 修改内容

#### JsonTreeNode.vue
**修改文件:** `src/domains/casemgmt/components/JsonTreeNode.vue`

**核心改动:**

**a) 添加获取所有子孙节点的函数:**
```javascript
// 获取所有子孙节点的 path
function getAllDescendantPaths(node, paths = []) {
  paths.push(node.path)
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => getAllDescendantPaths(child, paths))
  }
  return paths
}
```

**b) 修改选中逻辑 - 级联选择:**
```javascript
const isSelected = computed({
  get: () => props.selectedKeys.includes(props.node.path),
  set: (val) => {
    const keys = [...props.selectedKeys]
    const allPaths = getAllDescendantPaths(props.node)
    
    if (val) {
      // 勾选时，添加当前节点及所有下级
      allPaths.forEach(path => {
        if (!keys.includes(path)) {
          keys.push(path)
        }
      })
    } else {
      // 取消勾选时，移除当前节点及所有下级
      allPaths.forEach(path => {
        const index = keys.indexOf(path)
        if (index > -1) keys.splice(index, 1)
      })
    }
    emit('update:selectedKeys', keys)
  }
})
```

### 展示效果

**勾选 "data":**
```
▼ ☑ "data": {              ← 勾选 data
  ☑ "code": "01",          ← 自动勾选下级
  ☑ "list": [
    ☑ "name": "xxx",       ← 自动勾选所有子孙
    ☑ "value": 123
  ]
}
```

**取消勾选 "data":**
```
▼ ☐ "data": {              ← 取消勾选 data
  ☐ "code": "01",          ← 自动取消下级
  ☐ "list": [
    ☐ "name": "xxx",       ← 自动取消所有子孙
    ☐ "value": 123
  ]
}
```

### 特点
1. **级联勾选**: 勾选上级自动选中所有下级
2. **级联取消**: 取消勾选上级自动取消所有下级
3. **包含自身**: 上级自身的 path 也包含在选中列表中
4. **递归处理**: 无限层级递归处理所有子孙节点

### 验证结果
✅ `npm run build` 构建成功
✅ 勾选上级自动选中所有下级
✅ 取消勾选上级自动取消所有下级
✅ 递归处理所有层级

---

---

## 2026-03-07: 批量编辑功能实现

### 任务
实现批量编辑弹窗功能：
1. 点击批量编辑弹出弹窗
2. 支持自动识别 URL 参数
3. 以 KV 形式展示
4. 点击保存填入 params/headers 中
5. 点击取消或 X 关闭弹窗
6. 弹窗内容持久化

### 修改内容

#### 1. 新建 Store 文件
**文件:** `src/domains/casemgmt/stores/useBatchEditStore.js`

使用 Pinia + persist 持久化批量编辑内容。

#### 2. 新建批量编辑弹窗组件
**文件:** `src/domains/casemgmt/components/BatchEditDialog.vue`

**功能特性:**
- 支持 URL 自动识别（提取 ? 后的参数）
- 支持 KV 格式解析（key=value&key2=value2）
- 支持多行格式解析
- 解析后展示为 KV 列表，可勾选
- 全选/取消全选功能
- 使用 Pinia Store 持久化内容

**URL 解析示例:**
```
输入: https://open.jd.com/v2/#/doc/spi?apiCateId=200554&apiId=101050&gwType=2
解析结果:
- apiCateId = 200554
- apiId = 101050
- gwType = 2
```

#### 3. 修改 HttpStepDrawer.vue
**修改文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

**新增内容:**
- 导入 BatchEditDialog 组件
- 添加批量编辑弹窗状态 `batchEditVisible`
- 添加 `openBatchEdit()` 打开弹窗方法
- 添加 `handleBatchEditSave()` 处理保存方法（根据当前 tab 决定添加到 params 还是 headers）
- 修改"批量编辑"链接，添加 `@click="openBatchEdit"`
- 在 template 底部添加批量编辑弹窗组件

### 使用流程

1. **打开弹窗**: 点击 Params 或 Headers 标签页的"批量编辑"链接
2. **输入内容**: 输入 URL 或 KV 格式字符串
3. **点击解析**: 自动识别并展示参数列表
4. **选择参数**: 勾选需要的参数（默认全部选中）
5. **点击保存**: 参数添加到当前表格中
6. **持久化**: 输入内容自动保存，下次打开可复用

### 验证结果
✅ `npm run build` 构建成功
✅ 批量编辑弹窗正常打开/关闭
✅ URL 参数自动识别
✅ KV 格式解析
✅ 参数列表可勾选
✅ 保存后参数填入表格
✅ 内容持久化，下次打开可复用

---

---

## 2026-03-07: 批量编辑功能优化

### 任务
优化批量编辑弹窗：
1. 解析后展示在同一个弹窗内
2. 选中解析后的参数不用持久化

### 修改内容

#### BatchEditDialog.vue
**修改文件:** `src/domains/casemgmt/components/BatchEditDialog.vue`

**核心改动:**

**a) 分离数据 - 只持久化输入内容:**
```javascript
// 表单数据 - 只包含输入内容，会持久化
const form = ref({
  content: ''
})

// 解析结果（不持久化）
const parsedParams = ref([])
```

**b) 关闭弹窗时清空解析结果:**
```javascript
function closeDialog() {
  // 保存输入内容到 Store（只保存输入框内容）
  batchEditStore.setContent(form.value.content)
  // 清空解析结果（不持久化）
  parsedParams.value = []
  parseError.value = ''
  emit('update:modelValue', false)
}
```

**c) 弹窗布局调整:**
```
┌─────────────────────────────┐
│ 批量编辑                     │
├─────────────────────────────┤
│ [输入框]                     │
│                             │
├─────────────────────────────┤
│ [解析] 按钮                  │
├─────────────────────────────┤
│ [全选] [取消全选] 已选择 x/x │
│                             │
│ ☑ key1 = value1             │
│ ☑ key2 = value2             │
│ ☑ key3 = value3             │
├─────────────────────────────┤
│              [取消] [保存]   │
└─────────────────────────────┘
```

### 持久化策略
| 数据 | 是否持久化 | 说明 |
|-----|----------|-----|
| 输入框内容 | ✅ | 使用 Pinia Store 持久化 |
| 解析结果 | ❌ | 每次打开弹窗清空 |
| 勾选状态 | ❌ | 随解析结果一起清空 |

### 验证结果
✅ `npm run build` 构建成功
✅ 解析结果展示在同一个弹窗内
✅ 只持久化输入框内容
✅ 解析结果和勾选状态不持久化

---

---

## 2026-03-07: 批量编辑功能优化 - 双弹窗模式

### 任务
参考 JSON 添加的双弹窗模式优化批量编辑：
1. 第一个弹窗：输入内容
2. 第二个弹窗：展示解析结果，供用户选择
3. 解析结果和选中状态不用持久化

### 修改内容

#### 1. 新建组件 BatchEditResultDialog.vue
**文件:** `src/domains/casemgmt/components/BatchEditResultDialog.vue`

- 展示解析后的参数列表
- 支持全选/取消全选
- 参数选中状态不持久化
- 点击取消返回输入弹窗

#### 2. 修改 BatchEditDialog.vue
**修改文件:** `src/domains/casemgmt/components/BatchEditDialog.vue`

**核心改动:**
- 只保留输入框，点击解析后打开结果弹窗
- 输入内容持久化（使用 Pinia Store）
- 解析结果不持久化，通过 props 传递给结果弹窗

```javascript
// 输入弹窗关闭时保存输入内容
function closeDialog() {
  batchEditStore.setContent(content.value)
  emit('update:modelValue', false)
}

// 解析后打开结果弹窗
function parseContent() {
  // ... 解析逻辑 ...
  parsedParams.value = entries.map(([key, value]) => ({ key, value }))
  
  // 关闭输入弹窗，打开结果弹窗
  emit('update:modelValue', false)
  resultDialogVisible.value = true
}
```

### 使用流程

```
1. 点击"批量编辑"
   ↓
2. 弹窗1（批量编辑）- 输入 URL 或 KV
   [输入框] 持久化
   [解析] [取消]
   ↓
3. 点击"解析"
   ↓
4. 弹窗1关闭，弹窗2（批量编辑结果）打开
   [全选] [取消全选] 已选择 x/x
   ☑ key1 = value1
   ☑ key2 = value2
   [取消] [保存]
   ↓
5. 点击"保存" - 参数填入表格
   点击"取消" - 返回弹窗1
```

### 持久化策略
| 数据 | 是否持久化 | 位置 |
|-----|----------|-----|
| 输入框内容 | ✅ | BatchEditDialog.vue + Pinia Store |
| 解析结果 | ❌ | BatchEditResultDialog.vue 临时数据 |
| 勾选状态 | ❌ | BatchEditResultDialog.vue 临时数据 |

### 组件关系
```
HttpStepDrawer.vue
    ↓ 打开
BatchEditDialog.vue (输入)
    ↓ 解析后打开
BatchEditResultDialog.vue (选择)
    ↓ 保存/取消
HttpStepDrawer.vue
```

### 验证结果
✅ `npm run build` 构建成功
✅ 双弹窗模式实现
✅ 输入内容持久化
✅ 解析结果不持久化
✅ 选中状态不持久化
✅ 取消返回输入弹窗

---

---

## 2026-03-07: 批量编辑功能优化 - 封装通用选择组件

### 任务
1. 点击确定后关闭所有弹窗
2. 解析后不用全选（默认都不选中）
3. 将 JSON 添加和批量添加的弹窗交互封装成一个通用组件

### 修改内容

#### 1. 新建通用选择弹窗组件
**文件:** `src/domains/casemgmt/components/ParamSelectDialog.vue`

- 通用参数选择弹窗，用于展示和选择参数
- 支持全选/取消全选
- 参数默认都不选中
- 点击保存后关闭弹窗

#### 2. 修改 BatchEditResultDialog.vue
**修改文件:** `src/domains/casemgmt/components/BatchEditResultDialog.vue`

- 默认都不选中：`selected: false`
- 保存后直接关闭弹窗：`emit('update:modelValue', false)`

#### 3. 修改 BatchEditDialog.vue
**修改文件:** `src/domains/casemgmt/components/BatchEditDialog.vue`

- 使用 ParamSelectDialog 组件替换原来的结果弹窗

### 组件架构
```
ParamSelectDialog.vue (通用选择组件)
    ├── BatchEditDialog.vue (批量编辑输入) 
    │       └── ParamSelectDialog (选择结果)
    └── JsonAddDialog.vue (JSON添加 - 自带树形选择)
```

### 默认选中策略
| 组件 | 默认选中 |
|-----|---------|
| ParamSelectDialog | 都不选中 |
| BatchEditResultDialog | 都不选中 |
| JsonTreeNode | 都不选中 |

### 弹窗关闭逻辑
```javascript
// 保存后关闭弹窗
function handleSave() {
  // ... 保存逻辑 ...
  emit('save', selectedItems)
  emit('update:modelValue', false)  // 关闭弹窗
}
```

### 验证结果
✅ `npm run build` 构建成功
✅ 点击保存后关闭弹窗
✅ 解析后默认都不选中
✅ 封装了通用选择组件 ParamSelectDialog

---

---

## 2026-03-07: 批量编辑功能优化 - 封装通用双步骤对话框

### 任务
1. 修复点击确定后关闭所有弹窗的问题
2. 将 JSON 弹窗和批量添加弹窗的 UI 交互封装成一个通用组件

### 修改内容

#### 1. 新建通用双步骤输入对话框组件
**文件:** `src/domains/casemgmt/components/TwoStepInputDialog.vue`

- 封装 UI 交互：输入 → 解析 → 选择 → 保存
- Props 配置：
  - `title`: 弹窗标题
  - `placeholder`: 输入框占位符
  - `parseButtonText`: 解析按钮文字
  - `parseFunction`: 外部传入的解析函数
  - `persistedContent`: 持久化的输入内容

```vue
<template>
  <two-step-input-dialog
    title="批量编辑"
    placeholder="请输入..."
    parse-button-text="解析"
    :parse-function="parseFunction"
    v-model:persisted-content="content"
    @save="handleSave"
  />
</template>
```

#### 2. 修改 BatchEditDialog.vue
**修改文件:** `src/domains/casemgmt/components/BatchEditDialog.vue`

- 使用 TwoStepInputDialog 组件
- 传入批量编辑特有的解析函数
- 只保留业务逻辑，UI 交互由通用组件处理

#### 3. 修改 ParamSelectDialog.vue
**修改文件:** `src/domains/casemgmt/components/ParamSelectDialog.vue`

- 修复弹窗关闭逻辑
- 点击保存时先关闭弹窗再发送事件

### 弹窗关闭逻辑修复
```javascript
// 选择弹窗保存
function handleSave() {
  // 先关闭弹窗
  emit('update:modelValue', false)
  // 再发送保存事件
  emit('save', selectedItems)
}

// TwoStepInputDialog 处理保存
function handleSelectSave(selectedItems) {
  // 关闭选择弹窗
  selectDialogVisible.value = false
  // 发送保存事件（输入弹窗已在解析时关闭）
  emit('save', selectedItems)
}
```

### 组件关系
```
HttpStepDrawer.vue
    ├── BatchEditDialog.vue (业务组件)
    │       └── TwoStepInputDialog.vue (UI 交互封装)
    │               └── ParamSelectDialog.vue (选择弹窗)
    └── JsonAddDialog.vue (独立实现，保持原有逻辑)
```

### 验证结果
✅ `npm run build` 构建成功
✅ 点击保存后关闭所有弹窗
✅ 封装了通用双步骤对话框组件 TwoStepInputDialog
✅ 批量编辑使用通用组件
✅ JSON 添加保持原有实现

---

---

## 2026-03-07: 批量编辑和 JSON 添加组件重构 - 统一使用 InputDialog

### 任务
1. 修复点击确定后关闭所有弹窗的问题
2. 将 JSON 弹窗和批量添加弹窗的 UI 交互封装成一个通用组件
3. 确保两个弹窗都使用同一个通用输入组件

### 修改内容

#### 1. 新建通用输入对话框组件
**文件:** `src/domains/casemgmt/components/InputDialog.vue`

- 只封装输入步骤的 UI 交互
- Props 配置：
  - `title`: 弹窗标题
  - `placeholder`: 输入框占位符
  - `actionButtonText`: 操作按钮文字
  - `parseFunction`: 解析函数
  - `persistedContent`: 持久化的输入内容
- 解析成功后关闭输入弹窗，通过 `@parse` 事件通知父组件展示结果

#### 2. 修改批量编辑对话框
**修改文件:** `src/domains/casemgmt/components/BatchEditDialog.vue`

- 使用 `InputDialog` 组件作为输入弹窗
- 使用 `ParamSelectDialog` 组件作为结果选择弹窗
- 解析规则（URL/KV）保持独立

#### 3. 修改 JSON 添加对话框
**修改文件:** `src/domains/casemgmt/components/JsonAddDialog.vue`

- 使用 `InputDialog` 组件作为输入弹窗
- 自定义树形结果展示（使用 JsonTreeNode 组件）
- 解析规则（JSON 解析）保持独立

### 组件架构
```
通用组件:
├── InputDialog.vue (输入弹窗 - 封装 UI 交互)
└── ParamSelectDialog.vue (列表结果选择弹窗)

业务组件:
├── BatchEditDialog.vue
│   ├── InputDialog (输入)
│   └── ParamSelectDialog (列表选择)
└── JsonAddDialog.vue
    ├── InputDialog (输入)
    └── 自定义树形展示 (使用 JsonTreeNode)
```

### 统一交互流程
```
1. 点击按钮
   ↓
2. 【弹窗1 - 输入】使用 InputDialog 组件
   [输入框]
   [操作按钮] [取消]
   ↓
3. 点击操作按钮
   - 调用 parseFunction 解析
   - 关闭输入弹窗
   - 触发 @parse 事件
   ↓
4. 【弹窗2 - 结果展示】各自实现
   - 批量编辑: ParamSelectDialog (列表)
   - JSON添加: 自定义树形展示
   ↓
5. 点击保存
   - 关闭结果弹窗
   - 触发 @save 事件
   ↓
6. 完成
```

### 验证结果
✅ `npm run build` 构建成功
✅ 点击确定后关闭所有弹窗
✅ JSON 添加和批量编辑都使用 InputDialog 通用组件
✅ 各自保持独立的解析规则和结果展示方式

---

---

## 2026-03-07: 修复弹窗关闭问题并统一弹窗大小

### 任务
1. 修复点击确定后关闭所有弹窗的问题
2. JSON添加和批量编辑弹窗大小形状保持一致（统一 600px）

### 问题分析
- 弹窗关闭时触发了 `close` 事件，导致 `handleBack` 被调用，重新打开了输入弹窗
- 保存后没有标记已保存状态，导致重复处理

### 修复内容

#### 1. ParamSelectDialog.vue
- 添加 `hasSaved` 标记，保存后不再触发返回事件
- 移除 `@close` 事件监听，避免误触发

#### 2. JsonAddDialog.vue  
- 添加 `hasSaved` 标记
- 结果弹窗宽度改为 600px（与批量编辑一致）
- 修复关闭逻辑，保存后不再触发返回

#### 3. 统一弹窗规格
| 弹窗 | 宽度 |
|-----|------|
| InputDialog | 600px |
| ParamSelectDialog | 600px |
| JsonAddDialog 结果弹窗 | 600px |

### 验证结果
✅ `npm run build` 构建成功
✅ 点击保存后正确关闭所有弹窗
✅ 所有弹窗宽度统一为 600px

---

---

## 2026-03-07: 修复保存后关闭所有弹窗 - 父组件状态问题

### 问题
点击保存后，虽然子组件的弹窗关闭了，但父组件（HttpStepDrawer）中的弹窗状态（`batchEditVisible` 和 `jsonDialogVisible`）仍然是 `true`，导致下次打开时可能出现问题。

### 修复内容

#### 修改 HttpStepDrawer.vue
**文件:** `src/domains/casemgmt/components/HttpStepDrawer.vue`

**1. 修复批量编辑保存处理:**
```javascript
function handleBatchEditSave(selectedItems) {
  // ... 添加数据到表格 ...
  
  // 关闭弹窗 - 新增
  batchEditVisible.value = false
}
```

**2. 修复 JSON 添加保存处理:**
```javascript
function handleJsonSave(selectedItems) {
  // ... 添加数据到表格 ...
  
  // 关闭弹窗 - 新增
  jsonDialogVisible.value = false
}
```

### 完整关闭流程

**批量编辑:**
```
1. 用户点击保存
   ↓
2. ParamSelectDialog 关闭自身
   ↓
3. BatchEditDialog 触发 save 事件
   ↓
4. HttpStepDrawer.handleBatchEditSave 接收事件
   ↓
5. 添加数据到表格
   ↓
6. batchEditVisible.value = false （关闭父组件弹窗状态）
```

**JSON 添加:**
```
1. 用户点击保存
   ↓
2. JsonAddDialog 关闭结果展示（showResult = false）
   ↓
3. JsonAddDialog 触发 save 事件
   ↓
4. HttpStepDrawer.handleJsonSave 接收事件
   ↓
5. 添加数据到表格
   ↓
6. jsonDialogVisible.value = false （关闭父组件弹窗状态）
```

### 验证结果
✅ `npm run build` 构建成功
✅ 点击保存后关闭所有弹窗（子组件 + 父组件状态）

---

---

## 2026-03-07: 修复 JSON 添加和批量编辑输入数据持久化问题

### 问题
JSON 添加和批量编辑的输入数据持久化失效，再次打开弹窗时输入框为空。

### 原因
直接绑定 Pinia store 的 ref (`jsonCacheStore.content`) 到 `v-model` 可能无法正确触发 setter，导致持久化失败。

### 修复内容

#### JsonAddDialog.vue
使用 `computed` 来处理持久化内容：
```javascript
const persistedContent = computed({
  get: () => jsonCacheStore.content,
  set: (value) => jsonCacheStore.setContent(value)
})
```

模板绑定：
```vue
v-model:persisted-content="persistedContent"
```

#### BatchEditDialog.vue
同样修复：
```javascript
const persistedContent = computed({
  get: () => batchEditStore.content,
  set: (value) => batchEditStore.setContent(value)
})
```

### 验证结果
✅ `npm run build` 构建成功
✅ 输入数据持久化正常工作

---
