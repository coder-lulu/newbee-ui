# CMDB 配置项管理模块

## 概述

本模块用于管理 CMDB 系统中的配置项（CI），包括资产的增删改查、搜索、批量操作等功能。

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **UI 组件库**: Ant Design Vue (vben5 自带)
- **表格组件**: Ant Design Vue Table (已完全迁移)
- **表单组件**: Ant Design Vue Form
- **状态管理**: Vue 3 Composition API

## 组件架构

### 主要组件

1. **index.vue** - 主页面，包含类型树和数据表格
2. **DataTable.vue** - 数据表格组件（✅ 已使用 Ant Design Vue Table）
3. **ConfigItemForm.vue** - 配置项新建/编辑表单
4. **CiDetailDrawer.vue** - 配置项详情抽屉
5. **CiSelector.vue** - 配置项选择器（✅ 已使用 Ant Design Vue Table）
6. **AdvancedSearch.vue** - 高级搜索组件

### 表格组件迁移状态

✅ **已完成迁移到 vben5 自带组件**

- **DataTable.vue**: 使用 `<Table>` 组件，支持分页、排序、筛选
- **CiSelector.vue**: 使用 `<Table>` 组件，支持单选/多选
- **样式优化**: 移除了旧的 vxe-table 样式，使用 Ant Design Vue 样式

### 表格特性

- **响应式设计**: 支持移动端和桌面端
- **动态列配置**: 根据 CI 类型动态生成表格列
- **行选择**: 支持单选和多选模式
- **分页**: 支持前端和后端分页
- **排序**: 支持多列排序
- **筛选**: 支持高级搜索和快速筛选
- **导出**: 支持数据导出功能

## 功能特性

### 1. 资产列表管理
- 树形结构显示 CI 类型
- 表格展示配置项数据
- 支持快速搜索和高级搜索
- 批量操作（删除、编辑等）

### 2. 配置项操作
- 新建配置项
- 编辑配置项
- 查看配置项详情
- 删除配置项

### 3. 高级搜索
- 属性过滤
- 关系搜索
- 标签搜索
- 时间范围搜索
- 分面搜索

### 4. 配置项选择器
- 支持单选/多选模式
- 跨类型选择
- 搜索和筛选功能

## 使用指南

### 基本用法

```vue
<template>
  <!-- 数据表格 -->
  <DataTable
    :type-id="selectedTypeId"
    @edit="handleEdit"
    @view="handleView"
  />
  
  <!-- 配置项选择器 -->
  <CiSelector
    :open="visible"
    :multiple="true"
    :selected-cis="selectedItems"
    @confirm="handleConfirm"
  />
</template>
```

### 表格配置

DataTable 组件支持以下配置：

```typescript
interface DataTableProps {
  typeId: number | null; // CI 类型 ID
}

interface DataTableEmits {
  (e: 'edit', id: number): void;
  (e: 'view', id: number, typeId: number): void;
}
```

### 搜索功能

支持多种搜索方式：

1. **快速搜索**: 在所有文本字段中搜索
2. **属性过滤**: 基于具体属性值进行精确搜索
3. **高级搜索**: 支持复合条件和关系搜索

## 性能优化

### 表格优化
- **虚拟滚动**: 大数据量时使用虚拟滚动
- **分页加载**: 支持服务端分页
- **列宽自适应**: 根据内容自动调整列宽
- **固定列**: 支持左右固定列

### 搜索优化
- **防抖搜索**: 避免频繁请求
- **搜索缓存**: 缓存搜索结果
- **条件重置**: 快速重置搜索条件

## 样式规范

遵循 vben5 设计规范：

```scss
// 表格样式
:deep(.ant-table) {
  border: 1px solid #f0f0f0;
}

:deep(.ant-table-thead > tr > th) {
  font-weight: 600;
  background: #fafafa;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: #f5f5f5;
}
```

## API 接口

### 数据接口
- `getCisList()` - 获取配置项列表
- `createConfigItem()` - 创建配置项
- `updateConfigItem()` - 更新配置项
- `deleteConfigItem()` - 删除配置项
- `getConfigItemById()` - 获取配置项详情

### 类型接口
- `getCiTypeList()` - 获取 CI 类型列表
- `listAttributeGroupWithAttribute()` - 获取属性分组

## 注意事项

1. **数据绑定**: 必须使用 `v-model:value` 形式
2. **响应式**: 所有组件都支持响应式设计
3. **类型安全**: 使用 TypeScript 确保类型安全
4. **性能**: 大数据量时注意性能优化

## 更新日志

### v2.0.0 (最新)
- ✅ 完全迁移到 vben5 自带的 Ant Design Vue Table 组件
- ✅ 移除 vxe-table 依赖和相关样式
- ✅ 优化表格响应式设计
- ✅ 改进搜索和筛选功能
- ✅ 增强用户体验和性能
