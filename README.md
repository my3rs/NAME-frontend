# NAME 博客前端

基于 SvelteKit 5 构建的现代化博客管理系统前端，支持双界面：公共博客展示和后台管理系统。

## 项目特性

- 🎨 **现代化 UI** - 基于 shadcn-svelte 组件库和 Tailwind CSS
- 🔐 **完整认证系统** - JWT 令牌自动刷新，角色权限管理
- 📝 **内容管理** - 文章、标签、分类的完整 CRUD 操作
- 💬 **评论系统** - 支持嵌套回复和审核工作流
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🌙 **暗色主题** - 支持主题切换
- 🚀 **高性能** - SvelteKit 5 + Vite 构建优化

## 技术栈

- **框架**: SvelteKit 5 + TypeScript
- **样式**: Tailwind CSS + shadcn-svelte
- **状态管理**: Svelte Stores
- **HTTP 客户端**: Axios + JWT 自动处理
- **表单验证**: Zod + Formsnap
- **Markdown**: Carta-md 编辑器
- **图标**: Lucide Svelte

## 快速开始

### 环境要求

- Node.js 18+ 
- 后端 API 服务运行在 `http://localhost:8000`

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
# 启动开发服务器
npm run dev

# 在浏览器中打开应用
npm run dev -- --open
```

访问 http://localhost:5173 查看应用

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 代码检查

```bash
# 类型检查和 lint
npm run check

# 监听模式
npm run check:watch
```

## 项目结构

```
src/
├── lib/
│   ├── components/          # 组件库
│   │   ├── ui/             # shadcn-svelte 组件
│   │   │   └── custom/     # 自定义组件
│   │   └── *.svelte        # 布局组件
│   ├── stores/             # 状态管理
│   │   ├── auth.ts         # 认证状态
│   │   └── posts.ts        # 文章数据
│   ├── api.ts              # API 接口
│   ├── model.ts            # 数据模型
│   ├── scheme.ts           # 验证模式
│   └── utils.ts            # 工具函数
└── routes/
    ├── (backend)/          # 后台管理界面
    │   └── admin/          # 管理功能页面
    ├── (front)/            # 公共博客界面
    ├── login/              # 登录页面
    └── settings/           # 设置页面
```

## 主要功能

### 公共博客界面
- 文章列表和详情展示
- 分页浏览
- 标签和分类筛选
- 评论互动

### 后台管理系统
- 文章管理（创建、编辑、发布）
- 分类和标签管理
- 评论审核
- 用户权限管理
- 系统调试工具

## 开发说明

- 后台路由使用 `export const ssr = false` 禁用 SSR
- 认证令牌自动管理，过期前 5 分钟自动刷新
- API 基础地址可通过环境变量配置
- 支持批量操作和数据导入导出

## License

MIT
