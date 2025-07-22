import type {
  CreateOpsHostCredentialRequest,
  DeleteOpsHostCredentialRequest,
  GetOpsHostCredentialByIdRequest,
  OpsHostCredential,
  OpsHostCredentialInfoResponse,
  OpsHostCredentialListQuery,
  OpsHostCredentialTestData,
  UpdateOpsHostCredentialRequest,
} from './model';

import type { IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  // 主机凭证管理
  createHostCredential = '/ops-api/ops_host_credential/create',
  deleteHostCredential = '/ops-api/ops_host_credential/delete',
  getHostCredentialById = '/ops-api/ops_host_credential',
  getHostCredentialList = '/ops-api/ops_host_credential/list',
  testHostCredential = '/ops-api/ops_host_credential/test', // 测试凭证连接
  updateHostCredential = '/ops-api/ops_host_credential/update',
}

// === 主机凭证管理 API ===

/**
 * 创建主机凭证
 * @param data 创建请求数据 (必须)
 * @returns void
 */
export function createOpsHostCredential(data: CreateOpsHostCredentialRequest) {
  return requestClient.postWithMsg<void>(Api.createHostCredential, data);
}

/**
 * 删除主机凭证
 * @param data 删除请求数据 (必须)
 * @returns void
 */
export function deleteOpsHostCredential(data: DeleteOpsHostCredentialRequest) {
  return requestClient.postWithMsg<void>(Api.deleteHostCredential, data);
}

/**
 * 根据ID获取主机凭证详情
 * @param data 查询请求数据 (必须)
 * @returns 主机凭证详情
 */
export function getOpsHostCredentialById(
  data: GetOpsHostCredentialByIdRequest,
): Promise<OpsHostCredentialInfoResponse> {
  return requestClient.post<OpsHostCredentialInfoResponse>(
    Api.getHostCredentialById,
    data,
  );
}

/**
 * 分页查询主机凭证列表
 * @param params 分页查询参数 (可选)
 * @returns 分页结果
 */
export function getOpsHostCredentialList(
  params?: OpsHostCredentialListQuery & PageQuery,
): Promise<PageResult<OpsHostCredential>> {
  return requestClient.post<PageResult<OpsHostCredential>>(
    Api.getHostCredentialList,
    params,
  );
}

/**
 * 测试主机凭证连接
 * @param data 测试数据 (必须)
 * @returns void
 */
export function testOpsHostCredential(data: OpsHostCredentialTestData) {
  return requestClient.postWithMsg<void>(Api.testHostCredential, data);
}

/**
 * 更新主机凭证
 * @param data 更新请求数据 (必须)
 * @returns void
 */
export function updateOpsHostCredential(data: UpdateOpsHostCredentialRequest) {
  return requestClient.postWithMsg<void>(Api.updateHostCredential, data);
}

// === 工具函数 ===

/**
 * 批量删除主机凭证
 * @param credentialIds 主机凭证ID列表 (必须)
 * @returns void
 */
export function batchDeleteOpsHostCredential(credentialIds: IDS) {
  return deleteOpsHostCredential({ ids: credentialIds });
}

/**
 * 根据主机模式获取凭证列表
 * @param hostPattern 主机模式 (必须)
 * @param params 其他查询参数 (可选)
 * @returns 分页结果
 */
export function getOpsHostCredentialsByPattern(
  hostPattern: string,
  params?: Omit<OpsHostCredentialListQuery, 'hostPattern'> & PageQuery,
): Promise<PageResult<OpsHostCredential>> {
  return getOpsHostCredentialList({
    page: 1,
    pageSize: 20,
    ...params,
    hostPattern,
  });
}

/**
 * 根据用户名获取凭证列表
 * @param username 用户名 (必须)
 * @param params 其他查询参数 (可选)
 * @returns 分页结果
 */
export function getOpsHostCredentialsByUsername(
  username: string,
  params?: Omit<OpsHostCredentialListQuery, 'username'> & PageQuery,
): Promise<PageResult<OpsHostCredential>> {
  return getOpsHostCredentialList({
    page: 1,
    pageSize: 20,
    ...params,
    username,
  });
}

/**
 * 搜索主机凭证
 * @param keyword 搜索关键词 (必须)
 * @param params 其他查询参数 (可选)
 * @returns 分页结果
 */
export function searchOpsHostCredentials(
  keyword: string,
  params?: Omit<OpsHostCredentialListQuery, 'name'> & PageQuery,
): Promise<PageResult<OpsHostCredential>> {
  return getOpsHostCredentialList({
    page: 1,
    pageSize: 20,
    ...params,
    name: keyword,
  });
}

/**
 * 获取默认主机凭证列表
 * @param params 其他查询参数 (可选)
 * @returns 分页结果
 */
export function getDefaultOpsHostCredentials(
  params?: Omit<OpsHostCredentialListQuery, 'isDefault'> & PageQuery,
): Promise<PageResult<OpsHostCredential>> {
  return getOpsHostCredentialList({
    page: 1,
    pageSize: 100,
    ...params,
    isDefault: true,
  });
}

/**
 * 获取所有可用的主机凭证（用于下拉选择）
 * @returns 分页结果
 */
export function getAllActiveOpsHostCredentials(): Promise<
  PageResult<OpsHostCredential>
> {
  return getOpsHostCredentialList({
    page: 1,
    pageSize: 1000,
    status: 1, // 只获取正常状态的凭证
  });
}
