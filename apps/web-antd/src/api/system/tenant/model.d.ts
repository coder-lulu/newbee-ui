// 基于 core/api/desc/core/tenant.api 定义的租户接口

// 租户信息
export interface TenantInfo {
  id?: number;
  status?: number;
  name?: string;
  code?: string;
  description?: string;
  expiredAt?: number;
  config?: string;
  createdBy?: number;
  createdAt?: number;
  updatedAt?: number;
}

// 租户列表请求参数
export interface TenantListReq {
  page?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  status?: number;
  createdBy?: number;
}

// 租户列表响应
export interface TenantListInfo {
  total?: number;
  data?: TenantInfo[];
}

export interface TenantListResp {
  code?: number;
  msg?: string;
  data?: TenantListInfo;
}

// 租户信息响应
export interface TenantInfoResp {
  code?: number;
  msg?: string;
  data?: TenantInfo;
}

// 根据租户码获取租户请求
export interface TenantCodeReq {
  code: string;
}

// 更新租户状态请求
export interface TenantStatusReq {
  id: number;
  status: number;
}

// 初始化租户请求
export interface TenantInitReq {
  tenantId: number;
  adminUsername?: string;
  adminPassword?: string;
  adminEmail?: string;
}

// 基础响应
export interface BaseMsgResp {
  code?: number;
  msg?: string;
}

// 租户配置接口
export interface TenantConfig {
  maxUsers?: number;
  features?: string[];
  settings?: Record<string, any>;
}

// 为了向后兼容，保留原有的 Tenant 接口作为别名
export type Tenant = TenantInfo;
