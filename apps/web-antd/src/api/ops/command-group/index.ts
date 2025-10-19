import type {
  CreateOpsCommandGroupRequest,
  DeleteOpsCommandGroupRequest,
  GetOpsCommandGroupByIdRequest,
  OpsCommandGroup,
  OpsCommandGroupInfoResponse,
  OpsCommandGroupListQuery,
  UpdateOpsCommandGroupRequest,
} from './model';

import type { IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  // 命令组管理
  createCommandGroup = '/ops-api/ops_command_group/create',
  deleteCommandGroup = '/ops-api/ops_command_group/delete',
  getCommandGroupById = '/ops-api/ops_command_group',
  getCommandGroupList = '/ops-api/ops_command_group/list',
  updateCommandGroup = '/ops-api/ops_command_group/update',
}

// === 命令组管理 API ===

/**
 * 创建命令组
 * @param data 创建请求数据 (必须)
 * @returns void
 */
export function createOpsCommandGroup(data: CreateOpsCommandGroupRequest) {
  return requestClient.postWithMsg<void>(Api.createCommandGroup, data);
}

/**
 * 删除命令组
 * @param data 删除请求数据 (必须)
 * @returns void
 */
export function deleteOpsCommandGroup(data: DeleteOpsCommandGroupRequest) {
  return requestClient.postWithMsg<void>(Api.deleteCommandGroup, data);
}

/**
 * 根据ID获取命令组详情
 * @param data 查询请求数据 (必须)
 * @returns 命令组详情
 */
export function getOpsCommandGroupById(
  data: GetOpsCommandGroupByIdRequest,
): Promise<OpsCommandGroupInfoResponse> {
  return requestClient.post<OpsCommandGroupInfoResponse>(
    Api.getCommandGroupById,
    data,
  );
}

/**
 * 分页查询命令组列表
 * @param params 分页查询参数 (可选)
 * @returns 分页结果
 */
export function getOpsCommandGroupList(
  params?: OpsCommandGroupListQuery & PageQuery,
): Promise<PageResult<OpsCommandGroup>> {
  return requestClient.post<PageResult<OpsCommandGroup>>(
    Api.getCommandGroupList,
    params,
  );
}

/**
 * 更新命令组
 * @param data 更新请求数据 (必须)
 * @returns void
 */
export function updateOpsCommandGroup(data: UpdateOpsCommandGroupRequest) {
  return requestClient.postWithMsg<void>(Api.updateCommandGroup, data);
}

// === 工具函数 ===

/**
 * 批量删除命令组
 * @param groupIds 命令组ID列表 (必须)
 * @returns void
 */
export function batchDeleteOpsCommandGroup(groupIds: IDS) {
  return deleteOpsCommandGroup({ ids: groupIds });
}

/**
 * 创建命令组（表单数据）
 * @param formData 表单数据
 * @returns 创建结果
 */
export function createOpsCommandGroupFromForm(
  formData: CreateOpsCommandGroupRequest,
) {
  return createOpsCommandGroup(formData);
}

/**
 * 更新命令组（表单数据）
 * @param formData 表单数据
 * @returns 更新结果
 */
export function updateOpsCommandGroupFromForm(
  formData: UpdateOpsCommandGroupRequest,
) {
  return updateOpsCommandGroup(formData);
}

/**
 * 获取命令组简要信息列表（仅包含基本字段）
 * @param params 查询参数
 * @returns 命令组列表
 */
export function getOpsCommandGroupSimpleList(params: {
  category?: string;
  name?: string;
  page?: number;
  pageSize?: number;
  status?: number;
}) {
  const { page = 1, pageSize = 20, ...filters } = params;
  return getOpsCommandGroupList({
    page,
    pageSize,
    ...filters,
  });
}

/**
 * 根据分类获取命令组列表
 * @param category 命令组分类 (必须)
 * @param params 其他查询参数 (可选)
 * @returns 分页结果
 */
export function getOpsCommandGroupsByCategory(
  category: string,
  params?: Omit<OpsCommandGroupListQuery, 'category'> & PageQuery,
): Promise<PageResult<OpsCommandGroup>> {
  return getOpsCommandGroupList({
    page: 1,
    pageSize: 20,
    ...params,
    category,
  });
}

/**
 * 搜索命令组
 * @param keyword 搜索关键词 (必须)
 * @param params 其他查询参数 (可选)
 * @returns 分页结果
 */
export function searchOpsCommandGroups(
  keyword: string,
  params?: Omit<OpsCommandGroupListQuery, 'name'> & PageQuery,
): Promise<PageResult<OpsCommandGroup>> {
  return getOpsCommandGroupList({
    page: 1,
    pageSize: 20,
    ...params,
    name: keyword,
  });
}

/**
 * 获取所有可用的命令组（用于下拉选择）
 * @returns 分页结果
 */
export function getAllActiveOpsCommandGroups(): Promise<
  PageResult<OpsCommandGroup>
> {
  return getOpsCommandGroupList({
    page: 1,
    pageSize: 1000,
    status: 1, // 只获取正常状态的命令组
  });
}
