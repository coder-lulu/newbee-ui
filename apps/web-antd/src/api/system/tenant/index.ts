import type { 
  TenantInfo, 
  TenantListReq, 
  TenantListResp, 
  TenantInfoResp, 
  TenantCodeReq, 
  TenantStatusReq, 
  TenantInitReq, 
  BaseMsgResp 
} from './model';

import type { ID, IDS } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

// 基于 core/api/desc/core/tenant.api 定义的API路径
enum Api {
  // 核心租户API
  tenantCreate = '/sys-api/tenant/create',
  tenantUpdate = '/sys-api/tenant/update', 
  tenantDelete = '/sys-api/tenant/delete',
  tenantList = '/sys-api/tenant/list',
  tenantById = '/sys-api/tenant',
  tenantByCode = '/sys-api/tenant/code',
  tenantStatus = '/sys-api/tenant/status',
  tenantInit = '/sys-api/tenant/init',
  
  // 扩展功能API (向后兼容)
  dictSync = '/sys-api/tenant/syncTenantDict',
  tenantSwitch = '/sys-api/tenant/switch',
  tenantDynamicClear = '/sys-api/tenant/dynamic/clear',
  tenantExport = '/sys-api/tenant/export',
  tenantSyncPackage = '/sys-api/tenant/syncTenantPackage',
}

// 基于 core/api/desc/core/tenant.api 实现的API函数

/**
 * 创建租户
 * @param data 租户信息
 * @returns 基础响应
 */
export function createTenant(data: TenantInfo) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.tenantCreate, data);
}

/**
 * 更新租户
 * @param data 租户信息
 * @returns 基础响应
 */
export function updateTenant(data: TenantInfo) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.tenantUpdate, data);
}

/**
 * 删除租户
 * @param ids 租户ID数组
 * @returns 基础响应
 */
export function deleteTenant(ids: IDS) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.tenantDelete, { ids });
}

/**
 * 获取租户列表
 * @param params 查询参数
 * @returns 租户列表响应
 */
export function getTenantList(params?: TenantListReq) {
  return requestClient.post<TenantListResp>(Api.tenantList, params);
}

/**
 * 通过ID获取租户
 * @param id 租户ID
 * @returns 租户信息响应
 */
export function getTenantById(id: ID) {
  return requestClient.post<TenantInfo>(Api.tenantById, { id });
}

/**
 * 通过租户码获取租户
 * @param data 租户码请求
 * @returns 租户信息响应
 */
export function getTenantByCode(data: TenantCodeReq) {
  return requestClient.post<TenantInfo>(Api.tenantByCode, data);
}

/**
 * 更新租户状态
 * @param data 状态更新请求
 * @returns 基础响应
 */
export function updateTenantStatus(data: TenantStatusReq) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.tenantStatus, data);
}

/**
 * 初始化租户
 * @param data 初始化请求
 * @returns 基础响应
 */
export function initTenant(data: TenantInitReq) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.tenantInit, data);
}

// 向后兼容的API函数别名
export const tenantList = getTenantList;
export const tenantInfo = getTenantById;
export const tenantAdd = createTenant;
export const tenantUpdate = updateTenant;
export const tenantRemove = deleteTenant;
export const tenantStatusChange = updateTenantStatus;
// 为了向后兼容，提供接受简单ID参数的版本
export function tenantInitData(id: string | number) {
  const tenantId = typeof id === 'string' ? parseInt(id, 10) : id;
  return initTenant({ tenantId });
}

/**
 * 租户导出
 * @param data 导出参数
 * @returns void
 */
export function tenantExport(data: Partial<TenantInfo>) {
  return commonExport(Api.tenantExport, data);
}

/**
 * 动态切换租户
 * @param tenantId 租户ID
 * @returns void
 */
export function tenantDynamicToggle(tenantId: string) {
  return requestClient.post<void>(Api.tenantSwitch, { tenantId });
}

/**
 * 清除 动态切换租户
 * @returns void
 */
export function tenantDynamicClear() {
  return requestClient.get<void>(Api.tenantDynamicClear);
}

/**
 * 租户套餐同步
 * @param tenantId 租户id
 * @param packageId 套餐id
 * @returns void
 */
export function tenantSyncPackage(tenantId: string, packageId: string) {
  return requestClient.get<void>(Api.tenantSyncPackage, {
    params: { packageId, tenantId },
    successMessageMode: 'message',
  });
}

/**
 * 同步租户字典
 * @param tenantId 租户ID
 * @returns void
 */
export function dictSyncTenant(tenantId?: string) {
  return requestClient.get<void>(Api.dictSync, {
    params: { tenantId },
    successMessageMode: 'message',
  });
}

/**
 * 获取当前激活租户信息
 * @returns 当前租户信息
 */
export function getCurrentTenant() {
  return requestClient.get<any>('/sys-api/tenant/current');
}


