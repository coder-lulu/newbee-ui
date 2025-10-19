import type {
  CisAttributeValidateRequest,
  CisAttributeValidateResponse,
  CisBatchOperationRequest,
  CisDetailResponse,
  CisInfoResponse,
  CisListRequest,
  CisListResponse,
  CiTypeAttribute,
  ConfigItem,
  CreateCisRequest,
  DeleteCisRequest,
  GetCiByIdRequest,
  PageResult,
  UpdateCisRequest,
} from './model';

import type { ID } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  // 批量操作
  cisBatch = '/cmdb-api/cis/batch',
  // CI实例管理
  createCis = '/cmdb-api/cis/create',
  deleteCis = '/cmdb-api/cis/delete',
  getCisById = '/cmdb-api/cis',
  getCisDetail = '/cmdb-api/cis/detail',
  getCisList = '/cmdb-api/cis/list',

  // CI类型属性（保持兼容）
  getCiTypeAttributes = '/cmdb-api/ci_type/attributes',

  updateCis = '/cmdb-api/cis/update',

  // 验证
  validateCisAttributes = '/cmdb-api/cis/validate',

  // 数据库初始化
  initDatabase = '/cmdb-api/init/database',
}

// === CI实例管理 API ===

/**
 * 创建CI实例
 * @param data 创建请求数据
 * @returns 创建结果
 */
export function createCis(data: CreateCisRequest) {
  return requestClient.postWithMsg<void>(Api.createCis, data);
}

/**
 * 更新CI实例
 * @param data 更新请求数据（包含id）
 * @returns 更新结果
 */
export function updateCis(data: UpdateCisRequest) {
  return requestClient.postWithMsg<void>(Api.updateCis, data);
}

/**
 * 根据ID获取CI实例
 * @param data 查询请求数据
 * @returns CI实例信息
 */
export function getCisById(data: GetCiByIdRequest): Promise<CisInfoResponse> {
  return requestClient.post<CisInfoResponse>(Api.getCisById, data);
}

/**
 * 获取CI实例详情（包含类型信息）
 * @param data 查询请求数据
 * @returns CI实例详情
 */
export function getCisDetail(
  data: GetCiByIdRequest,
): Promise<CisDetailResponse> {
  return requestClient.post<CisDetailResponse>(Api.getCisDetail, data);
}

/**
 * 获取CI实例列表（支持复杂查询）
 * @param data 查询请求数据
 * @returns CI实例列表
 */
export function getCisList(data: CisListRequest): Promise<CisListResponse> {
  return requestClient.post<CisListResponse>(Api.getCisList, data);
}

/**
 * 删除CI实例
 * @param data 删除请求数据
 * @returns 删除结果
 */
export function deleteCis(data: DeleteCisRequest) {
  return requestClient.postWithMsg<void>(Api.deleteCis, data);
}

// === 批量操作 API ===

/**
 * 批量操作CI实例
 * @param data 批量操作请求数据
 * @returns 操作结果
 */
export function cisBatchOperation(data: CisBatchOperationRequest) {
  return requestClient.postWithMsg<void>(Api.cisBatch, data);
}

// === 验证 API ===

/**
 * 验证CI实例属性
 * @param data 验证请求数据
 * @returns 验证结果
 */
export function validateCisAttributes(
  data: CisAttributeValidateRequest,
): Promise<CisAttributeValidateResponse> {
  return requestClient.post<CisAttributeValidateResponse>(
    Api.validateCisAttributes,
    data,
  );
}

// === 兼容性API（保持向后兼容） ===

/**
 * 获取CI类型的属性定义列表
 * @param typeId CI类型ID
 * @returns CI类型属性定义
 */
export function getCiTypeAttributes(typeId: ID) {
  return requestClient.post<CiTypeAttribute[]>(Api.getCiTypeAttributes, {
    typeId,
  });
}

/**
 * 获取配置项实例列表（兼容旧版本）
 * @param params 查询参数
 * @returns 配置项实例列表
 */
export function getConfigItems(params: CisListRequest) {
  return requestClient.post<PageResult<ConfigItem>>(Api.getCisList, params);
}

/**
 * 获取配置项实例详情（兼容旧版本）
 * @param id 配置项ID
 * @returns 配置项实例详情
 */
export function getConfigItemById(id: ID) {
  return requestClient.post<ConfigItem>(Api.getCisById, {
    id,
  });
}

/**
 * 创建配置项实例（兼容旧版本）
 * @param data 配置项数据
 * @returns void
 */
export function createConfigItem(data: CreateCisRequest) {
  return requestClient.postWithMsg<void>(Api.createCis, data);
}

/**
 * 更新配置项实例（兼容旧版本）
 * @param id 配置项ID
 * @param data 配置项数据
 * @returns void
 */
export function updateConfigItem(id: ID, data: Omit<UpdateCisRequest, 'id'>) {
  return requestClient.postWithMsg<void>(Api.updateCis, {
    id,
    ...data,
  });
}

/**
 * 删除配置项实例（兼容旧版本）
 * @param ids 配置项ID列表
 * @returns void
 */
export function deleteConfigItems(ids: ID[]) {
  return requestClient.postWithMsg<void>(Api.deleteCis, {
    ids,
  });
}

// === 工具函数 ===

/**
 * 批量删除CI实例
 * @param ciIds CI实例ID列表
 * @returns 删除结果
 */
export function batchDeleteCis(ciIds: number[]) {
  return cisBatchOperation({
    operation: 'delete',
    ciIds,
  });
}

/**
 * 批量更新CI实例状态
 * @param ciIds CI实例ID列表
 * @param status 新状态
 * @returns 更新结果
 */
export function batchUpdateCisStatus(ciIds: number[], status: number) {
  return cisBatchOperation({
    operation: 'update_status',
    ciIds,
    params: { status },
  });
}

/**
 * 批量更新CI实例属性
 * @param ciIds CI实例ID列表
 * @param attributes 属性列表
 * @returns 更新结果
 */
export function batchUpdateCisAttributes(ciIds: number[], attributes: any[]) {
  return cisBatchOperation({
    operation: 'update_attributes',
    ciIds,
    params: { attributes },
  });
}

// === 数据库初始化 API ===

/**
 * 初始化CMDB数据库（创建示例数据）
 * @returns 初始化结果
 */
export function initCmdbDatabase() {
  return requestClient.get<{ msg: string }>(Api.initDatabase);
}

// 重新导出类型
export type {
  CiAttributeFilter,
  CiAttributeValue,
  CiFilterGroup,
  CisAttributeValidateRequest,
  CisAttributeValidateResponse,
  CisBatchOperationRequest,
  CisDetailInfo,
  CisDetailResponse,
  CisInfo,
  CisInfoResponse,
  CisListInfo,
  CisListRequest,
  CisListResponse,
  CiSortField,
  CreateCisRequest,
  DeleteCisRequest,
  FilterOperator,
  GetCiByIdRequest,
  SearchFormData,
  StatusMap,
  SupportedOperators,
  UpdateCisRequest,
} from './model';
