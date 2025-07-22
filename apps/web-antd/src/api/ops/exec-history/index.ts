import type {
  CreateOpsCommandExecHistoryRequest,
  DeleteOpsCommandExecHistoryRequest,
  GetOpsCommandExecHistoryByIdRequest,
  OpsCommandExecHistory,
  OpsCommandExecHistoryGroupStats,
  OpsCommandExecHistoryInfoResponse,
  OpsCommandExecHistoryListQuery,
  OpsCommandExecHistorySimple,
  OpsCommandExecHistoryStats,
  UpdateOpsCommandExecHistoryRequest,
} from './model';

import type { IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  // 命令执行历史管理
  createExecHistory = '/ops-api/ops_command_exec_history/create',
  deleteExecHistory = '/ops-api/ops_command_exec_history/delete',
  getExecHistoryById = '/ops-api/ops_command_exec_history',
  getExecHistoryGroupStats = '/ops-api/ops_command_exec_history/group-stats',
  getExecHistoryList = '/ops-api/ops_command_exec_history/list',
  getExecHistorySimpleList = '/ops-api/ops_command_exec_history/simple-list',

  // 统计接口
  getExecHistoryStats = '/ops-api/ops_command_exec_history/stats',
  updateExecHistory = '/ops-api/ops_command_exec_history/update',
}

// === 命令执行历史管理 API ===

/**
 * 创建执行历史记录
 * @param data 创建请求数据 (必须)
 * @returns void
 */
export function createOpsCommandExecHistory(
  data: CreateOpsCommandExecHistoryRequest,
) {
  return requestClient.postWithMsg<void>(Api.createExecHistory, data);
}

/**
 * 删除执行历史记录
 * @param data 删除请求数据 (必须)
 * @returns void
 */
export function deleteOpsCommandExecHistory(
  data: DeleteOpsCommandExecHistoryRequest,
) {
  return requestClient.postWithMsg<void>(Api.deleteExecHistory, data);
}

/**
 * 根据ID获取执行历史详情
 * @param data 查询请求数据 (必须)
 * @returns 执行历史详情
 */
export function getOpsCommandExecHistoryById(
  data: GetOpsCommandExecHistoryByIdRequest,
): Promise<OpsCommandExecHistoryInfoResponse> {
  return requestClient.post<OpsCommandExecHistoryInfoResponse>(
    Api.getExecHistoryById,
    data,
  );
}

/**
 * 获取执行历史分组统计信息
 * @param params 查询参数 (可选)
 * @returns 分组统计信息
 */
export function getOpsCommandExecHistoryGroupStats(params?: {
  endTime?: number;
  startTime?: number;
  userId?: string;
}): Promise<OpsCommandExecHistoryGroupStats[]> {
  return requestClient.post<OpsCommandExecHistoryGroupStats[]>(
    Api.getExecHistoryGroupStats,
    params,
  );
}

/**
 * 分页查询执行历史列表
 * @param params 分页查询参数 (可选)
 * @returns 分页结果
 */
export function getOpsCommandExecHistoryList(
  params?: OpsCommandExecHistoryListQuery & PageQuery,
): Promise<PageResult<OpsCommandExecHistory>> {
  return requestClient.post<PageResult<OpsCommandExecHistory>>(
    Api.getExecHistoryList,
    params,
  );
}

/**
 * 获取执行历史简单列表
 * @param params 查询参数 (可选)
 * @returns 简单列表
 */
export function getOpsCommandExecHistorySimpleList(
  params?: OpsCommandExecHistoryListQuery & PageQuery,
): Promise<PageResult<OpsCommandExecHistorySimple>> {
  return requestClient.post<PageResult<OpsCommandExecHistorySimple>>(
    Api.getExecHistorySimpleList,
    params,
  );
}

/**
 * 获取执行历史统计信息
 * @param params 查询参数 (可选)
 * @returns 统计信息
 */
export function getOpsCommandExecHistoryStats(params?: {
  commandId?: string;
  endTime?: number;
  startTime?: number;
  userId?: string;
}): Promise<OpsCommandExecHistoryStats> {
  return requestClient.post<OpsCommandExecHistoryStats>(
    Api.getExecHistoryStats,
    params,
  );
}

/**
 * 更新执行历史记录
 * @param data 更新请求数据 (必须)
 * @returns void
 */
export function updateOpsCommandExecHistory(
  data: UpdateOpsCommandExecHistoryRequest,
) {
  return requestClient.postWithMsg<void>(Api.updateExecHistory, data);
}

// === 工具函数 ===

/**
 * 批量删除执行历史记录
 * @param historyIds 执行历史记录ID列表 (必须)
 * @returns void
 */
export function batchDeleteOpsCommandExecHistory(historyIds: IDS) {
  return deleteOpsCommandExecHistory({ ids: historyIds });
}

/**
 * 根据批次ID获取执行历史列表
 * @param batchId 批次ID (必须)
 * @param params 其他查询参数 (可选)
 * @returns 分页结果
 */
export function getOpsCommandExecHistoryByBatchId(
  batchId: string,
  params?: Omit<OpsCommandExecHistoryListQuery, 'batchId'> & PageQuery,
): Promise<PageResult<OpsCommandExecHistory>> {
  return getOpsCommandExecHistoryList({
    page: 1,
    pageSize: 20,
    ...params,
    batchId,
  });
}

/**
 * 根据命令ID获取执行历史列表
 * @param commandId 命令ID (必须)
 * @param params 其他查询参数 (可选)
 * @returns 分页结果
 */
export function getOpsCommandExecHistoryByCommandId(
  commandId: string,
  params?: Omit<OpsCommandExecHistoryListQuery, 'commandId'> & PageQuery,
): Promise<PageResult<OpsCommandExecHistory>> {
  return getOpsCommandExecHistoryList({
    page: 1,
    pageSize: 20,
    ...params,
    commandId,
  });
}

/**
 * 根据主机获取执行历史列表
 * @param targetHost 目标主机 (必须)
 * @param params 其他查询参数 (可选)
 * @returns 分页结果
 */
export function getOpsCommandExecHistoryByHost(
  targetHost: string,
  params?: Omit<OpsCommandExecHistoryListQuery, 'targetHost'> & PageQuery,
): Promise<PageResult<OpsCommandExecHistory>> {
  return getOpsCommandExecHistoryList({
    page: 1,
    pageSize: 20,
    ...params,
    targetHost,
  });
}

/**
 * 根据执行状态获取执行历史列表
 * @param commandStatus 执行状态 (必须)
 * @param params 其他查询参数 (可选)
 * @returns 分页结果
 */
export function getOpsCommandExecHistoryByStatus(
  commandStatus: string,
  params?: Omit<OpsCommandExecHistoryListQuery, 'commandStatus'> & PageQuery,
): Promise<PageResult<OpsCommandExecHistory>> {
  return getOpsCommandExecHistoryList({
    page: 1,
    pageSize: 20,
    ...params,
    commandStatus,
  });
}

/**
 * 根据用户ID获取执行历史列表
 * @param userId 用户ID (必须)
 * @param params 其他查询参数 (可选)
 * @returns 分页结果
 */
export function getOpsCommandExecHistoryByUserId(
  userId: string,
  params?: Omit<OpsCommandExecHistoryListQuery, 'userId'> & PageQuery,
): Promise<PageResult<OpsCommandExecHistory>> {
  return getOpsCommandExecHistoryList({
    page: 1,
    pageSize: 20,
    ...params,
    userId,
  });
}

/**
 * 搜索执行历史
 * @param keyword 搜索关键词 (必须)
 * @param params 其他查询参数 (可选)
 * @returns 分页结果
 */
export function searchOpsCommandExecHistory(
  keyword: string,
  params?: Omit<OpsCommandExecHistoryListQuery, 'commandName'> & PageQuery,
): Promise<PageResult<OpsCommandExecHistory>> {
  return getOpsCommandExecHistoryList({
    page: 1,
    pageSize: 20,
    ...params,
    commandName: keyword,
  });
}
