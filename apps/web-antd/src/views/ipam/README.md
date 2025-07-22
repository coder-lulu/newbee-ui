# IPAM（IP地址管理）系统前端实现

## 概述

IPAM（IP Address Management）是一个企业级IP地址管理系统的前端实现，提供网域、网段、IP地址、VLAN等网络资源的全生命周期管理功能。

## 功能模块

### 1. IPAM概览 (`/ipam/dashboard`)
- **文件路径**: `index.vue`
- **功能**:
  - 统计卡片展示：网域统计、地址段统计、分配统计、在线统计
  - 左侧网域树形导航
  - 右侧网段表格展示
  - 支持网域选择和网段筛选
  - 实时数据刷新

### 2. 网域管理 (`/ipam/domain`)
- **文件路径**: `domain/index.vue`
- **功能**:
  - 网域列表查看、搜索、分页
  - 新建网域：名称、类型（安全域/业务域/自定义）、CIDR范围、描述
  - 编辑网域信息
  - 删除网域
  - 状态管理（正常/禁用）
- **组件**:
  - `domain/components/DomainModal.vue` - 新建/编辑模态框

### 3. 网段管理 (`/ipam/subnet`)
- **文件路径**: `subnet/index.vue`
- **功能**:
  - 网段列表查看、搜索、分页
  - 新建网段：网域、CIDR、网关、VLAN ID、分配策略、描述
  - 编辑网段信息
  - 删除网段
  - 显示地址数、使用率进度条
  - 分配策略标签展示
- **组件**:
  - `subnet/components/SubnetModal.vue` - 新建/编辑模态框

### 4. IP地址管理 (`/ipam/ip`)
- **文件路径**: `ip/index.vue`
- **功能**:
  - IP地址列表查看、搜索、分页
  - 新建IP：网段、IP地址、MAC地址、资产ID、IP状态、在线状态、描述
  - 编辑IP地址信息
  - 删除IP地址
  - IP状态标签（已分配/空闲/保留/回收中/冲突）
  - 在线状态标签（在线/离线/未知）
  - 最后ping时间显示
- **组件**:
  - `ip/components/IPModal.vue` - 新建/编辑模态框

### 5. VLAN管理 (`/ipam/vlan`)
- **文件路径**: `vlan/index.vue`
- **功能**:
  - VLAN列表查看、搜索、分页
  - 新建VLAN：VLAN ID、名称、所属网域、描述
  - 编辑VLAN信息
  - 删除VLAN
  - VLAN ID范围验证（1-4094）
- **组件**:
  - `vlan/components/VlanModal.vue` - 新建/编辑模态框

### 6. 操作记录 (`/ipam/record`)
- **文件路径**: `record/index.vue`
- **功能**:
  - 操作记录列表查看、搜索、分页
  - 按操作人搜索
  - 时间范围筛选
  - 操作类型标签（分配/回收/批量分配/批量回收）
  - 记录详情查看
- **组件**:
  - `record/components/RecordModal.vue` - 记录详情模态框

## 公共组件

### 1. 网域树组件
- **文件路径**: `components/DomainTree.vue`
- **功能**:
  - 树形结构展示网域
  - 支持网域选择
  - 图标区分网域类型
  - 自动刷新数据

### 2. 网段表格组件
- **文件路径**: `components/SubnetTable.vue`
- **功能**:
  - 网段列表展示
  - 在线率进度条
  - 操作按钮（查看/编辑/删除）
  - 支持网域筛选

### 3. 网段模态框组件
- **文件路径**: `components/SubnetModal.vue`
- **功能**:
  - 新建/编辑网段
  - 表单验证
  - 网域选项加载

## 技术实现

### 1. 技术栈
- **Vue 3** + **Composition API**
- **TypeScript** - 类型安全
- **Ant Design Vue** - UI组件库
- **Vue Router** - 路由管理

### 2. API集成
- 使用统一的API类进行数据交互
- 支持请求/响应拦截
- 错误处理和提示
- 类型安全的API调用

### 3. 状态管理
- 使用Vue 3的响应式系统
- 组件间数据通信
- 表单状态管理

### 4. 样式规范
- Scoped CSS样式
- 统一的间距和布局
- 响应式设计
- 主题色彩体系

## 数据流设计

```
用户操作 → 组件事件 → API调用 → 后端处理 → 响应数据 → 状态更新 → 视图刷新
```

### 1. 列表页面流程
1. 组件挂载时加载数据
2. 支持搜索、分页、排序
3. 操作按钮触发相应功能
4. 成功操作后刷新列表

### 2. 模态框流程
1. 打开模态框并初始化表单
2. 表单验证和数据提交
3. API调用和错误处理
4. 成功后关闭模态框并刷新

### 3. 数据联动
- 网域选择影响网段筛选
- 网段选择影响IP地址筛选
- 操作记录关联IP、网段、网域信息

## 路由配置

```typescript
/ipam
├── /dashboard     # IPAM概览
├── /domain        # 网域管理
├── /subnet        # 网段管理
├── /ip            # IP地址管理
├── /vlan          # VLAN管理
└── /record        # 操作记录
```

## 权限控制

- 基于角色的访问控制
- 页面级权限验证
- 操作级权限控制
- JWT Token认证

## 开发规范

### 1. 文件组织
```
ipam/
├── index.vue                 # 概览页面
├── domain/
│   ├── index.vue            # 网域管理页面
│   └── components/
│       └── DomainModal.vue  # 网域模态框
├── subnet/                  # 网段管理模块
├── ip/                      # IP地址管理模块
├── vlan/                    # VLAN管理模块
├── record/                  # 操作记录模块
└── components/              # 公共组件
```

### 2. 命名规范
- 组件名使用PascalCase
- 文件名使用kebab-case
- 变量名使用camelCase
- 常量使用UPPER_CASE

### 3. 代码规范
- 使用ESLint和Prettier
- TypeScript严格模式
- 组件Props类型定义
- API响应类型定义

## 部署说明

### 1. 开发环境
```bash
npm run dev
```

### 2. 生产构建
```bash
npm run build
```

### 3. 环境变量
- `VITE_API_BASE_URL` - API基础URL
- `VITE_API_TOKEN` - API认证Token

## 后续优化

1. **性能优化**
   - 虚拟滚动支持大数据量
   - 组件懒加载
   - 图片压缩和CDN

2. **用户体验**
   - 骨架屏加载
   - 操作确认提示
   - 批量操作功能

3. **功能扩展**
   - 数据导入导出
   - 图表统计分析
   - 告警通知功能

4. **国际化**
   - 多语言支持
   - 时区处理
   - 本地化配置

## 联调说明

1. **API对接**
   - 确认API端点地址
   - 验证请求/响应格式
   - 处理错误码映射

2. **数据验证**
   - IP地址格式验证
   - CIDR格式验证
   - MAC地址格式验证

3. **权限验证**
   - JWT Token有效性
   - 角色权限检查
   - 操作权限验证

4. **兼容性测试**
   - 浏览器兼容性
   - 响应式布局
   - 网络异常处理 
