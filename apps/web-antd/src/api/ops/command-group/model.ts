/**
 * OPS命令组管理相关的数据结构定义
 * 根据OPS API接口对接文档定义
 */

import type { ID, IDS } from '#/api/common';

// === 基础数据结构 ===

// 命令组标签
export interface OpsCommandGroupTag {
  key: string;
  value: string;
}

// 命令组信息
export interface OpsCommandGroup {
  id?: ID;
  createdAt?: number;
  updatedAt?: number;
  status: number; // 1:正常 2:禁用
  name: string; // 命令组名称
  description: string; // 命令组描述
  category: string; // 命令组分类
  createdBy: string; // 创建者ID
  accessLevel: string; // 访问级别
  allowedUsers: string; // 允许使用的用户ID列表
  allowedRoles: string; // 允许使用的角色列表
  tags: OpsCommandGroupTag[]; // 标签信息
  metadata: string; // 扩展元数据（JSON格式）
  icon: string; // 图标标识
  sortOrder: number; // 排序顺序
}

// === 请求数据结构 ===

// 创建命令组请求
export interface CreateOpsCommandGroupRequest {
  status: number;
  name: string;
  description: string;
  category: string;
  createdBy: string;
  accessLevel: string;
  allowedUsers: string;
  allowedRoles: string;
  tags: OpsCommandGroupTag[];
  metadata: string;
  icon: string;
  sortOrder: number;
}

// 更新命令组请求
export interface UpdateOpsCommandGroupRequest
  extends CreateOpsCommandGroupRequest {
  id: ID;
}

// 根据ID获取命令组请求
export interface GetOpsCommandGroupByIdRequest {
  id: ID;
}

// 删除命令组请求
export interface DeleteOpsCommandGroupRequest {
  ids: IDS;
}

// 命令组列表查询请求（筛选条件）
export interface OpsCommandGroupListQuery {
  status?: number;
  name?: string;
  category?: string;
  createdBy?: string;
  accessLevel?: string;
}

// === 响应数据结构 ===

// 基础响应
export interface BaseResponse {
  code: number;
  msg: string;
}

// 命令组信息响应
export interface OpsCommandGroupInfoResponse extends BaseResponse {
  data: OpsCommandGroup;
}

// === 前端使用的数据结构 ===

// 命令组表单数据
export interface OpsCommandGroupFormData {
  id?: ID;
  status: number;
  name: string;
  description: string;
  category: string;
  createdBy: string;
  accessLevel: string;
  allowedUsers: string;
  allowedRoles: string;
  tags: OpsCommandGroupTag[];
  metadata: string;
  icon: string;
  sortOrder: number;
}

// 枚举定义
export enum OpsCommandGroupStatus {
  DISABLED = 2,
  NORMAL = 1,
}

export enum OpsCommandGroupAccessLevel {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  USER = 'user',
}

export enum OpsCommandGroupCategory {
  APPLICATION = 'application',
  AUTOMATION = 'automation',
  BACKUP = 'backup',
  DATABASE = 'database',
  DEPLOYMENT = 'deployment',
  MAINTENANCE = 'maintenance',
  MONITORING = 'monitoring',
  NETWORK = 'network',
  SECURITY = 'security',
  SYSTEM = 'system',
}
