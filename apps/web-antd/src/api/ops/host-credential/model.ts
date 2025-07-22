/**
 * OPS主机凭证管理相关的数据结构定义
 * 根据OPS API接口对接文档定义
 */

import type { ID, IDS } from '#/api/common';

// === 基础数据结构 ===

// 主机凭证标签
export interface OpsHostCredentialTag {
  key: string;
  value: string;
}

// 主机凭证信息
export interface OpsHostCredential {
  id?: ID;
  createdAt?: number;
  updatedAt?: number;
  status: number; // 1:正常 2:禁用
  name: string; // 凭据名称
  description: string; // 凭据描述
  hostPattern: string; // 主机匹配模式（支持通配符）
  username: string; // 用户名
  authType: string; // 认证方式：password/key/mixed
  authData: string; // 认证数据（加密存储）
  tags: OpsHostCredentialTag[]; // 标签
  isDefault: boolean; // 是否为默认凭据
  priority: number; // 优先级（数字越大优先级越高）
}

// === 请求数据结构 ===

// 创建主机凭证请求
export interface CreateOpsHostCredentialRequest {
  status: number;
  name: string;
  description: string;
  hostPattern: string;
  username: string;
  authType: string;
  authData: string;
  tags: OpsHostCredentialTag[];
  isDefault: boolean;
  priority: number;
}

// 更新主机凭证请求
export interface UpdateOpsHostCredentialRequest
  extends CreateOpsHostCredentialRequest {
  id: ID;
}

// 根据ID获取主机凭证请求
export interface GetOpsHostCredentialByIdRequest {
  id: ID;
}

// 删除主机凭证请求
export interface DeleteOpsHostCredentialRequest {
  ids: IDS;
}

// 主机凭证列表查询请求（筛选条件）
export interface OpsHostCredentialListQuery {
  status?: number;
  name?: string;
  hostPattern?: string;
  username?: string;
  authType?: string;
  isDefault?: boolean;
}

// === 响应数据结构 ===

// 基础响应
export interface BaseResponse {
  code: number;
  msg: string;
}

// 主机凭证信息响应
export interface OpsHostCredentialInfoResponse extends BaseResponse {
  data: OpsHostCredential;
}

// === 前端使用的数据结构 ===

// 主机凭证表单数据
export interface OpsHostCredentialFormData {
  id?: ID;
  status: number;
  name: string;
  description: string;
  hostPattern: string;
  username: string;
  authType: string;
  authData: string;
  tags: OpsHostCredentialTag[];
  isDefault: boolean;
  priority: number;
}

// 主机凭证验证数据（用于测试连接）
export interface OpsHostCredentialTestData {
  hostPattern: string;
  username: string;
  authType: string;
  authData: string;
  testHost?: string; // 可选的测试主机地址
  testPort?: number; // 可选的测试端口
}

// 枚举定义
export enum OpsHostCredentialStatus {
  DISABLED = 2,
  NORMAL = 1,
}

export enum OpsHostCredentialAuthType {
  KEY = 'key',
  MIXED = 'mixed',
  PASSWORD = 'password',
}

export enum OpsHostCredentialPriority {
  HIGH = 10,
  HIGHEST = 20,
  LOW = 1,
  NORMAL = 5,
}
