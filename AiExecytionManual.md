一.你是一名资深vue3开发工程师，能够准确的理解我提的要求
二.文件组织：语义化层级，示例:
    src/
    ├── @core/              # 核心基础设施（AI 优先识别）
    │   ├── http/           # 请求层：拦截器、错误码、重试策略
    │   ├── cache/          # 缓存策略：内存、localStorage、IndexedDB
    │   ├── auth/           # 认证逻辑：Token 管理、权限守卫
    │   └── i18n/           # 国际化：语言包、动态加载
    ├── domains/            # 领域驱动：按业务模块聚合
    │   ├── user/
    │   │   ├── api/        # 领域 API（不与 @core/http 耦合）
    │   │   ├── stores/     # 领域状态（Pinia 模块）
    │   │   ├── components/ # 领域组件（仅本域使用）
    │   │   └── types/      # 领域类型定义
    │   └── order/
    ├── shared/             # 共享层：跨领域复用
    │   ├── ui/             # 通用 UI 组件（原子设计）
    │   ├── composables/    # 通用逻辑（命名：useXxx）
    │   ├── utils/          # 纯函数工具（无副作用）
    │   └── constants/      # 枚举、配置键
    └── app/                # 应用层：路由、布局、入口
三.命名约定：自解释系统
    1. 组件：PascalCase + 语义后缀 
        示例： UserProfileCard 、 OrderSubmitForm 
    2. Composables：camelCase + use 前缀
        示例： usePagination 、 useFormValidation 
    3. Store：use + Domain + Store
        示例： useUserStore 、 useCartStore 
    4. 类型：PascalCase + 后缀
        示例： UserEntity 、 OrderDTO 、 ApiResponse<T> 
    5. 常量：SCREAMING_SNAKE_CASE
        示例： API_TIMEOUT 、 MAX_RETRY_COUNT 
    6. 事件：动词过去式/现在式
        示例： submitted 、 update:modelValue 
    7. 样式类：BEM 简化版
        示例： .card 、 .card--active 、 .card__title
三.组件契约：Props/Emits 协议
    3.1 Props 设计原则
        1. 必需项： required: true  或提供  default 
        2. 复杂对象：使用  type  导入而非内联定义
        3. 回调函数：命名以  on  开头，类型明确
    3.2 Emits 协议
        1. 使用类型化声明（Vue 3.3+）
        2. 事件名与回调 Props 对称  
四. 状态管理：分层 Store 模式
    4.1 层级职责
        1. Global Store：跨会话持久化（用户、主题）
        2. Domain Store：领域状态（订单列表、筛选条件）
        3. Local Store：组件级状态（弹窗显隐、临时表单）
        4. Composables：派生状态与副作用
    4.2 Store 必含方法
        1. State 定义
        2. Getters（计算属性）
        3. Actions（异步操作）
        4. $reset  重置方法
五.API 层：统一协议,示例：
    5.1 请求函数命名规范
        1. 查询列表： fetchXxxList 
        2. 创建资源： createXxx 
        3. 更新资源： updateXxx 
        4. 删除资源： deleteXxx 
    5.2 返回格式
        1. 统一包装  ApiResult<T> 
        2. 错误处理使用全局拦截器
        3. 不重复写 try-catch   
六.类型系统：领域驱动类型
    6.1 类型分层
        1.  types/domain/ ：领域实体（业务核心）
        2.  types/shared/ ：共享类型（API、通用工具）
    6.2 类型定义规范
        1. 使用  type  而非  interface  定义别名
        2. 枚举使用  const  对象（tree-shaking 友好）
        3. 复杂对象导出 DTO 和 Entity 两种变体
七.逻辑复用：Composables 分类,示例
    7.1 分类规则
        1. 数据获取： useFetch  /  useQuery 
        2. 表单处理： useForm 
        3. 交互状态： useToggle  /  useModal 
        4. 副作用： useEventListener 
        5. 业务逻辑： useCart  /  useCheckout 
    7.2 返回结构标准
        1.  data ：响应数据
        2.  error ：错误对象
        3.  loading ：加载状态
        4.  execute ：执行函数
八.样式架构：设计令牌
    8.1 变量层级
        1.  styles/tokens/ ：颜色、间距、字体、阴影、断点
        2.  styles/mixins/ ：响应式、文本截断、可访问性
        3.  styles/components/ ：组件样式
    8.2 组件样式规范
        1. 使用 CSS 变量实现主题切换
        2. 不硬编码数值
        3. 颜色引用  color-  前缀变量
        4. 响应式使用容器查询优先
九.Vue 组件化规范
    1. 组件分类体系
    1.1 按层级分类
        1.原子组件（Atoms）：最小不可再分单元
            示例： BaseButton 、 BaseInput 、 BaseIcon 
            位置： shared/ui/atoms/ 
        2.分子组件（Molecules）：原子组合
            示例： SearchBar 、 FormItem 、 NavItem 
            位置： shared/ui/molecules/ 
        3.有机体组件（Organisms）：独立功能模块
            示例： UserCard 、 OrderTable 、 CommentList 
            位置： shared/ui/organisms/  或  domains/xxx/components/ 
        4.模板组件（Templates）：页面级布局
            示例： DashboardLayout 、 DetailLayout 
            位置： app/layouts/ 
        5.页面组件（Pages）：路由级入口
            示例： UserListPage 、 OrderDetailPage 
            位置： domains/xxx/views/  或  app/views/ 
    1.2 按作用域分类
        1.全局组件：跨域复用，注册于  app/components/ 
        2.领域组件：单域内复用，位于  domains/xxx/components/ 
        3.页面组件：单页面使用，位于  views/xxx/components/ 
    2. 文件结构规范
        2.1 单文件组件（SFC）顺序
            1.<script setup> ：组合式 API 逻辑
            2.<template> ：模板结构
            3.<style scoped> ：作用域样式
    2.2 多文件组件（复杂组件）
        ComponentName/
        ├── index.vue           # 入口（仅导入组装）
        ├── ComponentName.vue   # 主组件逻辑
        ├── components/         # 子组件（仅当前组件使用）
        │   ├── ComponentNameHeader.vue
        │   └── ComponentNameItem.vue
        ├── composables/        # 组件专属逻辑
        │   └── useComponentLogic.ts
        ├── types.ts            # 组件专属类型
        └── constants.ts        # 组件专属常量
    3. Props 设计规范
        3.1 基础规则
            1. 使用  type  定义 Props 接口
            2. 必填项标记  required: true 
            3. 可选项提供合理默认值
            4. 复杂对象使用工厂函数返回默认值
        3.2 类型规范
            1. 基础类型： String 、 Number 、 Boolean 、 Array 、 Object 、 Function 、 Date 、 Symbol 
            2. 自定义类型：导入外部接口
            3. 联合类型：限定可选值
            4. 泛型支持：列表组件使用  T 
        3.3 验证规则
            1. 使用  validator  进行运行时校验
            2. 自定义校验函数纯函数化
            3. 错误提示明确具体
    4. Emits 设计规范
        4.1 事件命名
            1. 更新事件： update:modelValue 、 update:xxx 
            2. 动作事件：动词过去式  submitted 、 deleted 
            3. 状态事件： opened 、 closed 、 loaded 
            4. 错误事件： error 、 xxx-error 
        4.2 类型定义
            1. 使用类型化声明（Vue 3.3+）
            2. 参数使用元组语法
            3. 复杂参数定义独立类型
    5. 插槽（Slots）设计规范
        5.1 命名规范
            1. 默认插槽：匿名  <slot /> 
            2. 具名插槽：语义化命名  header 、 footer 、 item 、 empty 
            3. 作用域插槽：暴露必要数据
        5.2 插槽类型
            1. 渲染插槽：自定义内容渲染
            2. 状态插槽：空状态、加载状态、错误状态
            3. 动作插槽：操作按钮区域
    6. 组件通信规范
        6.1 父子通信
            1. Props 向下传递（单向数据流）
            2. Emits 向上通知
            3.  v-model  双向绑定语法糖
        6.2 跨层级通信
            1. Provide/Inject：主题、配置、依赖注入
            2. 事件总线：避免使用（用 Pinia 替代）
        6.3 全局状态
            1. 跨组件共享状态：Pinia Store
            2. 临时全局状态： shallowRef  +  readonly      
    7. 组件逻辑复用
        7.1 Composables 提取原则
            1. 逻辑超过 50 行提取
            2. 多组件共享逻辑提取
            3. 副作用逻辑独立封装
            4. 纯计算逻辑独立封装
        7.2 常用 Composables 类型
            1. 数据类： useFetchList 、 useFormData 、 usePagination 
            2. 交互类： useModal 、 useDrawer 、 useContextMenu 
            3. DOM 类： useScroll 、 useResize 、 useIntersection 
            4. 业务类： useUser 、 usePermission 、 useCart 
    8. 样式设计规范
        8.1 作用域策略
            1.组件级： scoped （默认）
            2. 全局样式： :global()  或单独文件
            3. 深度选择器： :deep() （谨慎使用）
        8.2 CSS 变量使用
            1. 设计令牌： var(--color-primary) 
            2. 组件变量： var(--component-name-property) 
            3. 主题覆盖：通过 CSS 变量实现
        8.3 类名规范
            1. BEM 简化： .block__element--modifier 
            2. 状态类： .is-active 、 .is-disabled 、 .is-loading 
            3. 工具类： .text-center 、 .flex-between
    9. 异步组件与代码分割
        9.1 路由级懒加载
            1. 页面组件异步导入
            2. 加载状态组件
            3. 错误处理组件
            4. 超时配置
        9.2 组件级异步
            1. 重型组件异步加载
            2. 弹窗组件按需加载
            3. 图表组件异步加载
    10. 性能优化规范
        10.1 渲染优化
            1.  v-once ：静态内容
            2.  v-memo ：条件缓存
            3.  shallowRef ：大型对象
            4.  computed ：派生状态缓存
        10.2 列表优化
            1.  key  使用唯一标识
            2.  virtual-scroller  长列表
            3. 分页/无限滚动
        10.3 加载优化
            1. 异步组件
            2. 骨架屏
            3. 图片懒加载
    11. 组件审查清单
        1. 组件名是否语义明确？
        2. Props 是否有完整类型定义？
        3. 是否提供合理的默认值？
        4. Emits 是否类型化声明？
        5. 插槽是否有默认内容？
        6. 样式是否使用 CSS 变量？
        7. 逻辑是否可提取为 Composable？
        8. 是否支持异步加载？
        9. 类型是否对外导出？
        10. 是否有使用示例？
十.测试策略：可测试性设计
    9.1 测试分层
        1. Unit：Composables、Utils
        2. Component：组件交互
        3. Integration：Store + API 组合
        4. E2E：关键用户路径
    9.2 可测试性规范
        1. 依赖注入：便于 mock
        2. 测试 ID： data-testid="xxx" 
        3. 避免随机性：使用可预测值
十一.核心原则总结
    1. 显式优于隐式：类型声明完整，不依赖推断
    2. 契约先于实现：先定义 Props/Types/接口，再写逻辑
    3. 分层隔离：领域、共享、核心层不循环依赖
    4. 标准结构：Composables、Stores 遵循统一返回格式
    5. 语义命名：命名即文档，避免缩写和泛称

十二.在你写完代码后，请自己先测试一下你的代码，是否存在BUG，如果存在则修复
十三.关于文件、文件夹的创建，编辑，删除，执行相关的命令，不用问我，直接操作就行
十四.需要的依赖，自行下载安装
十五.你的执行记录和我的提问记录，请记录在kimicode_executor_log.md文件中
十六.每次问答时，请先查看一下kimicode_executor_log.md文件，再作答
十七.需要的icon，自行查找相似的icon，然后下载，网站推荐：Iconify (https://iconify.design/)，Icones (https://icones.js.org/)，Heroicons (https://heroicons.com/)，Lucide (https://lucide.dev/)，SVGPorn (https://svgporn.com/)，Phosphor Icons (https://phosphoricons.com/)，Remix Icon (https://remixicon.com/)，Tabler Icons (https://tabler-icons.io/)
十八.项目强制使用中文编码（utf-8），请勿使用其他编码）
十九.如果有共用的逻辑处，请封装成组件，谢谢，如果有共用的逻辑处，请封装成组件，谢谢，如果有共用的逻辑处，请封装成组件，谢谢 重要的事情说三遍:
二十.再使用第三方组件库时，请自行判断是否满足你的需求，如果满足你的需求，请自行选择，使用时，请自行封装组件，不要直接使用第三方组件库的组件，请自行安装