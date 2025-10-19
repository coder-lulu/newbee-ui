import { requestClient } from '#/api/request';
import type { PageQuery } from '#/api/common';

// === 类型定义 ===

/**
 * CI关系信息
 */
export interface CiRelationInfo {
  id?: number;
  created_at?: number; // 毫秒时间戳，与Proto保持一致
  updated_at?: number; // 毫秒时间戳，与Proto保持一致
  source_ci_id?: number;
  target_ci_id?: number;
  relation_type_id?: number;
  more?: number;
  discovery_source?: string;
  ancestor_ids?: string;
  properties?: string; // JSON字符串，与Proto保持一致
  attribute_mappings?: AttributeMappingData[];
  status?: string;
  validation_result?: ValidationResult;
  last_validated_at?: number; // 毫秒时间戳
  auto_sync_enabled?: boolean;
  sync_config?: SyncConfig;
  relation_strength?: string;
  
  // 前端显示用的冗余字段
  sourceCiName?: string;
  targetCiName?: string;
  relationTypeName?: string;
}

/**
 * 属性映射数据
 */
export interface AttributeMappingData {
  source_attr_id: number;
  target_attr_id: number;
  source_value?: string;
  target_value?: string;
  last_sync_at?: number; // 毫秒时间戳
  sync_status?: string;
  conflict_reason?: string;
  
  // 前端显示用的冗余字段
  sourceAttrName?: string;
  targetAttrName?: string;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  validated_at: number; // 毫秒时间戳
  validation_type: string;
}

/**
 * 同步配置
 */
export interface SyncConfig {
  sync_direction: string;
  sync_frequency: string;
  conflict_policy: string;
  retry_attempts: number;
  retry_interval: number; // 秒
  enabled_mappings: number[];
}

/**
 * CI关系查询结果
 */
export interface CiRelationQueryResult {
  centerCi?: {
    id: number;
    name: string;
    typeName: string;
  };
  sourceRelations: CiRelationInfo[];
  targetRelations: CiRelationInfo[];
  totalCount: number;
}

/**
 * CI关系创建信息
 */
export interface CiRelationCreateInfo {
  target_ci_id: number;
  relation_type_id: number;
  direction: 'source_to_target' | 'target_to_source';
  more_ci_id?: number;
  discovery_source?: string;
  properties?: string; // JSON字符串
  attribute_mappings?: AttributeMappingData[];
  status?: string;
  relation_strength?: string;
}

/**
 * CI关系更新信息
 */
export interface CiRelationUpdateInfo {
  relation_id: number;
  target_ci_id?: number;
  relation_type_id?: number;
  more_ci_id?: number;
  properties?: string; // JSON字符串
  attribute_mappings?: AttributeMappingData[];
  status?: string;
  relation_strength?: string;
}

/**
 * CI关系数据容器
 */
export interface CiRelationsData {
  create_relations?: CiRelationCreateInfo[];
  update_relations?: CiRelationUpdateInfo[];
  delete_relation_ids?: number[];
  query_result?: CiRelationQueryResult;
}

/**
 * 查询CI关系请求
 */
export interface GetCiRelationsRequest {
  id: number; // CI ID
  depth?: number; // 关系深度，默认为2
  relationTypes?: number[]; // 筛选的关系类型ID
  includeInactive?: boolean; // 是否包含非激活关系
}

/**
 * 创建CI关系请求
 */
export interface CreateCiRelationRequest {
  sourceCiId: number;
  relationInfo: CiRelationCreateInfo;
}

/**
 * 更新CI关系请求
 */
export interface UpdateCiRelationRequest {
  relationInfo: CiRelationUpdateInfo;
}

/**
 * 删除CI关系请求
 */
export interface DeleteCiRelationRequest {
  relationIds: number[];
}

/**
 * 批量操作CI关系请求
 */
export interface CiRelationBatchRequest {
  ciId: number;
  relations: CiRelationsData;
}

/**
 * CI关系验证结果
 */
export interface RelationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  constraintId?: number;
}

/**
 * 验证CI关系请求
 */
export interface ValidateCiRelationRequest {
  sourceCiId: number;
  targetCiId: number;
  relationTypeId: number;
}

/**
 * CI关系批量查询请求
 */
export interface CiRelationBatchQueryReq {
  ci_ids: number[];
  direction?: string; // source, target, both
  relation_type_ids?: number[];
  include_attribute_mappings?: boolean;
  active_only?: boolean;
  status_filter?: string[];
  discovery_source_filter?: string[];
  depth_limit?: number;
}

/**
 * CI关系批量查询响应
 */
export interface CiRelationBatchQueryResp {
  relations_by_ci: Record<number, CiRelationGroup>;
  total_relations: number;
  total_cis: number;
}

/**
 * 单个CI的关系分组
 */
export interface CiRelationGroup {
  ci_id: number;
  source_relations: CiRelationInfo[];
  target_relations: CiRelationInfo[];
  total_count: number;
}

// === API枚举 ===
enum Api {
  // CI关系查询
  getCiRelations = '/cmdb-api/cis/relations',
  getCiRelationDetail = '/cmdb-api/cis/relation/detail',
  getCiRelationsBatch = '/cmdb-api/cis/relations/batch-query',
  
  // CI关系操作
  createCiRelation = '/cmdb-api/cis/relation/create',
  updateCiRelation = '/cmdb-api/cis/relation/update',
  deleteCiRelation = '/cmdb-api/cis/relation/delete',
  batchUpdateCiRelations = '/cmdb-api/cis/relations/batch',
  
  // CI关系验证
  validateCiRelation = '/cmdb-api/cis/relation/validate',
  
  // 关系类型
  getRelationTypes = '/cmdb-api/relation_type/list',
}

// === 查询API ===

/**
 * 获取CI的关系图数据
 * @param data 查询请求
 * @returns CI关系数据
 */
export function getCiRelationsApi(
  data: GetCiRelationsRequest,
): Promise<CiRelationQueryResult> {
  return requestClient.post<CiRelationQueryResult>(Api.getCiRelations, data);
}

/**
 * 获取关系详情
 * @param relationId 关系ID
 * @returns 关系详情
 */
export function getCiRelationDetailApi(
  relationId: number,
): Promise<CiRelationInfo> {
  return requestClient.post<CiRelationInfo>(Api.getCiRelationDetail, {
    relationId,
  });
}

/**
 * 批量查询CI关系
 * @param data 批量查询请求
 * @returns 批量查询结果
 */
export function getCiRelationsBatchApi(
  data: CiRelationBatchQueryReq,
): Promise<{ data: CiRelationBatchQueryResp }> {
  return requestClient.post<{ data: CiRelationBatchQueryResp }>(
    Api.getCiRelationsBatch,
    data,
  );
}

// === 操作API ===

/**
 * 创建CI关系
 * @param data 创建请求
 * @returns 创建结果
 */
export function createCiRelationApi(data: CreateCiRelationRequest) {
  return requestClient.postWithMsg<void>(Api.createCiRelation, data);
}

/**
 * 更新CI关系
 * @param data 更新请求
 * @returns 更新结果
 */
export function updateCiRelationApi(data: UpdateCiRelationRequest) {
  return requestClient.postWithMsg<void>(Api.updateCiRelation, data);
}

/**
 * 删除CI关系
 * @param data 删除请求
 * @returns 删除结果
 */
export function deleteCiRelationApi(data: DeleteCiRelationRequest) {
  return requestClient.postWithMsg<void>(Api.deleteCiRelation, data);
}

/**
 * 批量操作CI关系
 * @param data 批量操作请求
 * @returns 操作结果
 */
export function batchUpdateCiRelationsApi(data: CiRelationBatchRequest) {
  return requestClient.postWithMsg<void>(Api.batchUpdateCiRelations, data);
}

// === 验证API ===

/**
 * 验证CI关系是否可以创建
 * @param data 验证请求
 * @returns 验证结果
 */
export function validateCiRelationApi(
  data: ValidateCiRelationRequest,
): Promise<{ data: RelationValidationResult }> {
  return requestClient.post<{ data: RelationValidationResult }>(
    Api.validateCiRelation,
    data,
  );
}

// === 辅助API ===

/**
 * 获取关系类型列表
 * @returns 关系类型列表
 */
export function getRelationTypesApi(params: PageQuery = { page: 1, pageSize: 1000 }): Promise<{
  data: Array<{
    id: number;
    name: string;
    alias: string;
    description?: string;
  }>;
}> {
  return requestClient.post<{
    data: Array<{
      id: number;
      name: string;
      alias: string;
      description?: string;
    }>;
  }>(Api.getRelationTypes, params);
}

// === 工具函数 ===

/**
 * 根据CI ID获取关系图数据（简化版）
 * @param ciId CI ID
 * @param depth 关系深度
 * @returns 关系图数据
 */
export function getCiRelationsByIdApi(params: { id: number; depth?: number }) {
  return getCiRelationsApi({
    id: params.id,
    depth: params.depth || 2,
  });
}

/**
 * 创建单个CI关系（简化版）
 * @param sourceCiId 源CI ID
 * @param targetCiId 目标CI ID
 * @param relationTypeId 关系类型ID
 * @param options 其他选项
 * @returns 创建结果
 */
export function createSimpleCiRelationApi(
  sourceCiId: number,
  targetCiId: number,
  relationTypeId: number,
  options: Partial<CiRelationCreateInfo> = {},
) {
  return createCiRelationApi({
    sourceCiId,
    relationInfo: {
      target_ci_id: targetCiId,
      relation_type_id: relationTypeId,
      direction: 'source_to_target',
      status: 'active',
      relation_strength: 'normal',
      ...options,
    },
  });
}

/**
 * 删除单个CI关系（简化版）
 * @param relationId 关系ID
 * @returns 删除结果
 */
export function deleteSimpleCiRelationApi(relationId: number) {
  return deleteCiRelationApi({
    relationIds: [relationId],
  });
}

