# NewBee Admin UI

[![Vue](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Ant Design Vue](https://img.shields.io/badge/Ant%20Design%20Vue-4.x-blue.svg)](https://antdv.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)](https://github.com/coder-lulu/newbee-ui/releases)

NewBee Admin UI 是基于 Vue 3 + TypeScript + Vite + Ant Design Vue 构建的企业级后台管理系统前端解决方案，为 NewBee 微服务生态系统提供现代化的用户界面。

## 核心特性

### 🎨 现代化技术栈
- **Vue 3** - 采用 Composition API 和 `<script setup>` 语法
- **TypeScript** - 完整的类型安全支持
- **Vite** - 极速的开发体验和构建性能
- **Ant Design Vue** - 企业级 UI 组件库
- **Pinia** - 新一代状态管理方案

### 🔐 完整的权限系统
- **RBAC 权限控制** - 基于角色的访问控制
- **动态路由** - 根据权限动态生成路由
- **按钮级权限** - 细粒度的操作权限控制
- **数据权限** - 五级数据权限过滤（全部/自定义部门/本部门及下级/本部门/仅本人）

### 🏢 多租户支持
- **租户隔离** - 完整的 SaaS 多租户架构
- **租户切换** - 支持管理员跨租户管理
- **租户配置** - 独立的租户级别配置

### 🛡️ 安全特性
- **JWT 认证** - 基于 Token 的身份验证
- **请求加密** - 支持 API 请求/响应加密
- **XSS 防护** - 内置 XSS 攻击防护
- **CSRF 防护** - 跨站请求伪造防护

### ⚡ 性能优化
- **路由懒加载** - 按需加载页面组件
- **组件懒加载** - 优化首屏加载速度
- **图片懒加载** - 减少初始加载资源
- **Gzip 压缩** - 生产环境资源压缩
- **CDN 加速** - 静态资源 CDN 分发

### 🎯 开发体验
- **Monorepo 架构** - 基于 pnpm workspace 的单仓多包管理
- **Turbo 构建** - 高性能的增量构建系统
- **热更新** - 极速的 HMR 开发体验
- **TypeScript** - 完整的类型提示和检查
- **ESLint + Prettier** - 统一的代码规范

## 快速开始

### 环境要求

- Node.js >= 20.10.0
- pnpm >= 9.12.0

### 安装依赖

```bash
# 安装 pnpm (如果未安装)
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 开发

```bash
# 启动开发服务器
pnpm dev:antd

# 或使用 turbo 启动
pnpm dev
```

访问 http://localhost:5555

### 构建

```bash
# 构建生产环境
pnpm build:antd

# 构建并分析包大小
pnpm build:analyze

# 预览生产构建
pnpm preview
```

### 代码检查

```bash
# 运行 ESLint
pnpm lint

# 格式化代码
pnpm format

# 类型检查
pnpm check:type

# 完整检查（循环依赖、依赖版本、类型、拼写）
pnpm check
```

## 项目结构

```
newbee-ui/
├── apps/                    # 应用目录
│   └── web-antd/           # Ant Design Vue 版本
│       ├── src/
│       │   ├── api/        # API 接口定义
│       │   ├── assets/     # 静态资源
│       │   ├── components/ # 业务组件
│       │   ├── layouts/    # 布局组件
│       │   ├── locales/    # 国际化
│       │   ├── router/     # 路由配置
│       │   ├── store/      # 状态管理
│       │   ├── utils/      # 工具函数
│       │   └── views/      # 页面视图
│       └── package.json
├── packages/               # 公共包目录
│   ├── @core/             # 核心功能包
│   │   ├── base/          # 基础功能
│   │   ├── composables/   # 组合式函数
│   │   ├── design/        # 设计系统
│   │   └── ui-kit/        # UI 组件库
│   ├── effects/           # 副作用处理
│   │   ├── access/        # 权限控制
│   │   ├── common-ui/     # 通用 UI
│   │   ├── hooks/         # React Hooks 风格
│   │   ├── layouts/       # 布局系统
│   │   └── request/       # HTTP 请求
│   ├── locales/           # 国际化资源
│   ├── preferences/       # 用户偏好设置
│   ├── stores/            # 全局状态
│   ├── styles/            # 全局样式
│   ├── types/             # TypeScript 类型
│   └── utils/             # 工具函数
├── internal/              # 内部工具包
│   ├── lint-configs/      # Lint 配置
│   ├── node-utils/        # Node 工具
│   ├── tailwind-config/   # Tailwind 配置
│   ├── tsconfig/          # TypeScript 配置
│   └── vite-config/       # Vite 配置
├── scripts/               # 构建脚本
├── docs/                  # 文档
├── package.json           # 根配置
├── pnpm-workspace.yaml    # pnpm 工作空间配置
└── turbo.json            # Turbo 配置
```

## 核心功能模块

### 系统管理
- **用户管理** - 用户增删改查、角色分配、密码重置
- **角色管理** - 角色权限配置、数据权限设置
- **部门管理** - 组织架构树形管理
- **岗位管理** - 岗位信息维护
- **菜单管理** - 动态菜单配置、权限标识
- **字典管理** - 系统字典数据维护
- **参数配置** - 系统参数动态配置
- **通知公告** - 系统通知发布管理
- **日志管理** - 操作日志、登录日志查询

### 租户管理
- **租户列表** - 租户信息管理
- **租户套餐** - 套餐配置和权限分配
- **租户审计** - 租户操作审计追踪

### 监控中心
- **在线用户** - 在线用户监控和强制下线
- **服务监控** - 服务健康状态监控
- **缓存监控** - Redis 缓存监控
- **定时任务** - 任务调度管理

### 工具集成
- **代码生成** - 基于数据表的代码生成
- **表单构建** - 可视化表单设计器
- **系统接口** - Swagger API 文档

## 技术栈

### 核心框架
- **Vue 3.5+** - 渐进式 JavaScript 框架
- **TypeScript 5.x** - JavaScript 的超集
- **Vite 6.x** - 下一代前端构建工具

### UI 组件
- **Ant Design Vue 4.x** - 企业级 UI 设计语言
- **@iconify/vue** - 统一的图标解决方案
- **TinyMCE** - 富文本编辑器
- **ECharts** - 数据可视化图表库

### 状态管理
- **Pinia** - Vue 3 官方推荐状态管理
- **@vueuse/core** - Vue 组合式 API 工具集

### 路由
- **Vue Router 4.x** - Vue 官方路由管理器

### HTTP 客户端
- **Axios** - 基于 Promise 的 HTTP 客户端

### 工具库
- **dayjs** - 轻量级日期处理库
- **lodash-es** - JavaScript 实用工具库
- **crypto-js** - 加密算法库
- **jsencrypt** - RSA 加密库

### 开发工具
- **Turbo** - 高性能构建系统
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Stylelint** - CSS 代码检查
- **Vitest** - 单元测试框架
- **Playwright** - E2E 测试框架

## 配置说明

### 环境变量

创建 `.env.development` 文件用于开发环境：

```bash
# API 基础路径
VITE_GLOB_API_URL=http://localhost:9100

# 应用标题
VITE_GLOB_APP_TITLE=NewBee Admin

# 是否启用加密
VITE_ENABLE_ENCRYPTION=false
```

创建 `.env.production` 文件用于生产环境：

```bash
# API 基础路径
VITE_GLOB_API_URL=https://api.yourdomain.com

# 应用标题
VITE_GLOB_APP_TITLE=NewBee Admin

# 是否启用加密
VITE_ENABLE_ENCRYPTION=true
```

### 代理配置

在 `apps/web-antd/vite.config.ts` 中配置开发代理：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:9100',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

## 浏览器支持

现代浏览器和 IE11+

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Safari |
| --------- | --------- | --------- | --------- |
| IE11, Edge | last 2 versions | last 2 versions | last 2 versions |

## 贡献指南

欢迎贡献代码和文档！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 开发规范

- 遵循 ESLint 和 Prettier 配置
- 使用 TypeScript 编写代码
- 编写单元测试覆盖核心功能
- 提交信息遵循 Conventional Commits 规范

## 相关项目

- [NewBee Core](https://github.com/coder-lulu/newbee-core) - 核心后端服务
- [NewBee Common](https://github.com/coder-lulu/newbee-common) - 公共库

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目主页: https://github.com/coder-lulu/newbee-ui
- 问题反馈: https://github.com/coder-lulu/newbee-ui/issues
- 在线演示: https://demo.newbee.com (待部署)

## 致谢

本项目基于以下优秀开源项目：
- [Vue Vben Admin](https://github.com/vbenjs/vue-vben-admin) - 现代化的后台管理系统框架
- [Ant Design Vue](https://antdv.com/) - 企业级 UI 组件库
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

---

**开始您的企业级前端开发之旅！** 🚀
