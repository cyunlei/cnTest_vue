Vue3 开发规范
一、核心原则
    显式优先：完整类型声明，不依赖隐式推断
    契约先行：先定义 Props/Types/ 接口，再实现逻辑
    分层隔离：领域 / 共享 / 核心层无循环依赖
    标准统一：Composables/Stores 遵循固定返回格式
    语义命名：命名即文档，拒绝缩写 / 泛称
二、文件组织（核心分层）
    src/
    ├── @core/        # 核心基础设施（http/cache/auth/i18n）
    ├── domains/      # 领域驱动（按业务模块聚合，含api/stores/components/types）
    ├── shared/       # 共享层（ui/composables/utils/constants）
    └── app/          # 应用层（路由/布局/入口）
三、命名规范（关键规则）
    表格
    类型	规范示例
    组件	PascalCase + 语义后缀（UserProfileCard）
    Composables	camelCase+use 前缀（usePagination）
    Store	use+Domain+Store（useUserStore）
    类型	PascalCase + 后缀（UserEntity/OrderDTO）
    常量	SCREAMING_SNAKE_CASE（API_TIMEOUT）
    事件	动词时态（submitted/update:modelValue）
    样式类	BEM 简化版（.card/.card--active/.card__title）
四、核心模块规范
    1. 组件设计
        文件结构：SFC 顺序 → script setup → template → style scoped；复杂组件拆分子目录
        Props：必填标required: true，可选给默认值，复杂对象用工厂函数，类型化定义 + 运行时校验
        Emits：类型化声明（Vue3.3+），事件名区分更新 / 动作 / 状态 / 错误（如 update:xxx/submitted/loaded/xxx-error）
        插槽：具名插槽语义化（header/footer/item），作用域插槽仅暴露必要数据
        通信：父子用 Props/Emits，跨层级用 Provide/Inject，全局状态用 Pinia
    2. 状态管理（分层职责）
        Global Store：跨会话持久化（用户 / 主题）
        Domain Store：领域状态（订单列表 / 筛选条件），必含 State/Getters/Actions/$reset
        Local Store：组件级状态（弹窗显隐 / 临时表单）
        Composables：派生状态 + 副作用封装
    3. API 层（统一协议）
        命名：fetchXxxList（查列表）、createXxx（创建）、updateXxx（更新）、deleteXxx（删除）
        返回：统一包装 ApiResult<T>，全局拦截错误，不重复写 try-catch
    4. 类型系统（核心规则）
        分层：domain（领域实体）/shared（API / 通用工具）
        规范：用 type 而非 interface，枚举用 const 对象，复杂对象导出 DTO/Entity 变体
    5. 逻辑复用（Composables）
        分类：数据获取（useFetch）、表单处理（useForm）、交互状态（useToggle）、副作用（useEventListener）、业务逻辑（useCart）
        返回结构：统一返回 data/error/loading/execute
    6. 样式架构（设计令牌）
        变量分层：tokens（颜色 / 间距 / 字体）→ mixins（响应式 / 截断）→ components（组件样式）
        规范：用 CSS 变量实现主题切换，不硬编码数值，响应式优先容器查询
五、工程化优化
    异步加载：路由 / 重型组件异步导入，配置加载 / 错误状态 + 超时
    性能优化：静态内容用 v-once，长列表用 virtual-scroller，大型对象用 shallowRef，派生状态用 computed
    可测试性：依赖注入便于 mock，添加 data-testid，逻辑避免随机性
    通用逻辑：超过 50 行 / 多组件共享的逻辑，强制封装为 Composables / 组件
六、通用约束
    第三方组件库需封装后使用，不直接引用
    层级遮挡问题用 Portal/Teleport 挂载到 body
    项目强制 UTF-8 编码
    图标优先从 Iconify/Heroicons/Lucide 等库选择并下载
