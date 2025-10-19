import type {
  CreateOpsCommandRequest,
  DeleteOpsCommandRequest,
  ExecuteOpsCommandRequest,
  ExecuteResult,
  GetOpsCommandByIdRequest,
  OpsCommand,
  OpsCommandInfoResponse,
  OpsCommandListQuery,
  UpdateOpsCommandRequest,
} from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  // 命令管理
  createCommand = '/ops-api/ops_command/create',
  deleteCommand = '/ops-api/ops_command/delete',
  executeCommand = '/ops-api/ops_command/execute',
  getCommandById = '/ops-api/ops_command',
  getCommandList = '/ops-api/ops_command/list',
  updateCommand = '/ops-api/ops_command/update',
}

// === 命令管理 API ===

/**
 * 创建命令
 * @param data 创建请求数据 (必须)
 * @returns void
 */
export function createOpsCommand(data: CreateOpsCommandRequest) {
  return requestClient.postWithMsg<void>(Api.createCommand, data);
}

/**
 * 删除命令
 * @param data 删除请求数据 (必须)
 * @returns void
 */
export function deleteOpsCommand(data: DeleteOpsCommandRequest) {
  return requestClient.postWithMsg<void>(Api.deleteCommand, data);
}

/**
 * 根据ID获取命令详情
 * @param data 查询请求数据 (必须)
 * @returns 命令详情
 */
export function getOpsCommandById(
  data: GetOpsCommandByIdRequest,
): Promise<OpsCommandInfoResponse> {
  return requestClient.post<OpsCommandInfoResponse>(Api.getCommandById, data);
}

/**
 * 分页查询命令列表
 * @param params 分页查询参数 (可选)
 * @returns 分页结果
 */
export function getOpsCommandList(params?: PageQuery) {
  return requestClient.post<PageResult<OpsCommand>>(Api.getCommandList, {
    ...params,
  });
}

/**
 * 更新命令
 * @param data 更新请求数据 (必须)
 * @returns void
 */
export function updateOpsCommand(data: UpdateOpsCommandRequest) {
  return requestClient.postWithMsg<void>(Api.updateCommand, data);
}

/**
 * 执行命令
 * @param data 执行请求数据 (必须)
 * @returns 执行结果
 */
export function executeOpsCommand(data: ExecuteOpsCommandRequest) {
  return requestClient.post<ExecuteResult[]>(Api.executeCommand, data, {
    timeout: 30_000,
  });
}

// === 工具函数 ===

/**
 * 批量删除命令
 * @param commandIds 命令ID列表 (必须)
 * @returns void
 */
export function batchDeleteOpsCommand(commandIds: IDS) {
  return deleteOpsCommand({ ids: commandIds });
}

/**
 * 创建命令（表单数据）
 * @param formData 表单数据
 * @returns 创建结果
 */
export function createOpsCommandFromForm(formData: CreateOpsCommandRequest) {
  return createOpsCommand(formData);
}

/**
 * 更新命令（表单数据）
 * @param formData 表单数据
 * @returns 更新结果
 */
export function updateOpsCommandFromForm(formData: UpdateOpsCommandRequest) {
  return updateOpsCommand(formData);
}

/**
 * 获取命令简要信息列表（仅包含基本字段）
 * @param params 查询参数
 * @returns 命令列表
 */
export function getOpsCommandSimpleList(params: {
  groupId?: number;
  name?: string;
  page?: number;
  pageSize?: number;
  status?: number;
}) {
  const { page = 1, pageSize = 20, ...filters } = params;
  return getOpsCommandList({
    page,
    pageSize,
    ...filters,
  });
}

/**
 * 根据命令组ID获取命令列表
 * @param groupId 命令组ID (必须)
 * @param params 其他查询参数 (可选)
 * @returns 分页结果
 */
export function getOpsCommandsByGroupId(
  groupId: ID,
  params?: Omit<OpsCommandListQuery, 'groupId'> & PageQuery,
): Promise<PageResult<OpsCommand>> {
  return getOpsCommandList({
    page: 1,
    pageSize: 20,
    ...params,
    groupId,
  });
}

/**
 * 搜索命令
 * @param keyword 搜索关键词 (必须)
 * @param params 其他查询参数 (可选)
 * @returns 分页结果
 */
export function searchOpsCommands(
  keyword: string,
  params?: Omit<OpsCommandListQuery, 'name'> & PageQuery,
): Promise<PageResult<OpsCommand>> {
  return getOpsCommandList({
    page: 1,
    pageSize: 20,
    ...params,
    name: keyword,
  });
}
