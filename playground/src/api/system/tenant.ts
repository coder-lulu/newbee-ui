import { requestClient } from '#/api/request';

export namespace SystemTenantApi {
  /** 租户信息 */
  export interface SystemTenant {
    id?: string;
    status?: number;
    name?: string;
    code?: string;
    domain?: string;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
    description?: string;
    expireTime?: number;
    maxUsers?: number;
    settings?: TenantSettings[];
    createTime?: string;
    updateTime?: string;
  }

  /** 租户配置 */
  export interface TenantSettings {
    key?: string;
    value?: string;
  }

  /** 租户列表请求参数 */
  export interface TenantListParams {
    page?: number;
    pageSize?: number;
    name?: string;
    code?: string;
    domain?: string;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
    description?: string;
    expireTime?: number;
    maxUsers?: number;
  }

  /** 租户列表响应 */
  export interface TenantListResult {
    total: number;
    data: SystemTenant[];
  }
}

/**
 * 获取租户列表
 */
export async function getTenantList(params: SystemTenantApi.TenantListParams) {
  return requestClient.post<SystemTenantApi.TenantListResult>('/tenant/list', params);
}

/**
 * 创建租户
 */
export async function createTenant(data: SystemTenantApi.SystemTenant) {
  return requestClient.post('/tenant/create', data);
}

/**
 * 更新租户
 */
export async function updateTenant(data: SystemTenantApi.SystemTenant) {
  return requestClient.post('/tenant/update', data);
}

/**
 * 删除租户
 */
export async function deleteTenant(ids: string[]) {
  return requestClient.post('/tenant/delete', { ids });
}

/**
 * 根据ID获取租户
 */
export async function getTenantById(id: string) {
  return requestClient.post<{ data: SystemTenantApi.SystemTenant }>('/tenant', { id });
}

/**
 * 初始化租户数据
 */
export async function initTenantData(data: { id: string }) {
  return requestClient.post('/tenant/init', data);
}