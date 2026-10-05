import { requestClient } from '#/api/request';
import type { PageResult } from '#/api/common.d.ts';

// ==================== ProxyGroup 数据模型 ====================

export interface ProxyGroupItem {
  id: number;
  name: string;
  description: string;
  selectionStrategy: 'round_robin' | 'least_connections' | 'weighted' | 'random' | 'consistent_hash';
  healthCheckInterval: number; // seconds
  autoFailover: boolean;
  memberCount: number;
  onlineCount: number;
  totalWeight: number;
  status: 0 | 1 | 2; // 0=disabled, 1=enabled, 2=deleted
}

export interface ProxyGroupDetail {
  id: number;
  createdAt: number;
  updatedAt: number;
  status: 0 | 1 | 2;
  name: string;
  description: string;
  selectionStrategy: string;
  healthCheckInterval: number;
  autoFailover: boolean;
  maxRetryCount: number;
  minHealthyWorkers: number;
  members?: Array<{  // 成员列表（包含完整的worker信息）
    id: number;  // worker的数字ID
    proxyId: string;  // worker的字符串标识符
    name: string;
    ip: string;
    port: number;
    workerStatus: 'online' | 'degraded' | 'offline';
    weight: number;
    priority: number;
    cpuUsage: number;
    memoryUsage: number;
    activeSessions: number;
    lastHeartbeat: number;
  }>;
  stats?: {
    totalMembers: number;
    onlineMembers: number;
    degradedMembers: number;
    offlineMembers: number;
    totalWeight: number;
    avgCpuUsage: number;
    avgMemoryUsage: number;
    totalSessions: number;
  };
}

export interface ProxyGroupMemberItem {
  id: number;
  proxyId: number;
  workerName: string;
  workerIp: string;
  workerPort: number;
  weight: number;
  priority: number;
  joinedAt: number;
  isBackup: boolean;
  selectCount: number;
  workerStatus: 'online' | 'degraded' | 'offline';
}

// ==================== 请求参数 ====================

export interface ProxyGroupListParams {
  page: number;
  pageSize: number;
  name?: string;
  status?: 0 | 1 | 2;
}

export interface CreateProxyGroupReq {
  name: string;
  description?: string;
  selectionStrategy: 'round_robin' | 'least_connections' | 'weighted' | 'random' | 'consistent_hash';
  healthCheckInterval?: number;
  autoFailover?: boolean;
  maxRetryCount?: number;
  minHealthyWorkers?: number;
}

export interface UpdateProxyGroupReq extends CreateProxyGroupReq {
  id: number;
}

export interface AddWorkersToGroupReq {
  groupId: number;
  proxyIds: number[];
  weight?: number;
  priority?: number;
}

export interface RemoveWorkersFromGroupReq {
  groupId: number;
  proxyIds: number[];
}

export interface UpdateGroupMembersReq {
  groupId: number;
  proxyIds: number[]; // 新的完整成员列表
  weight?: number; // 新增成员的默认权重
  priority?: number; // 新增成员的默认优先级
}

export interface UpdateGroupMembersData {
  addedCount: number; // 新增成员数
  removedCount: number; // 删除成员数
  totalCount: number; // 最终成员数
}

export interface UpdateGroupMembersResp {
  code: number;
  msg: string;
  data: UpdateGroupMembersData;
}

export interface UpdateGroupMemberWeightReq {
  groupId: number;
  proxyId: number;
  weight: number;
}

export interface PickWorkerFromGroupReq {
  groupId: number;
  requiredCapabilities?: string[];
  preferredRegion?: string;
  requiredTags?: string[];
  sessionId?: string;
}

export interface PickWorkerFromGroupResp {
  proxyId: string;
  name: string;
  ip: string;
  port: number;
  endpoints: Record<string, string>;
}

// ==================== API 函数 ====================

/**
 * 获取ProxyGroup列表
 */
export async function listProxyGroups(
  params: ProxyGroupListParams,
): Promise<PageResult<ProxyGroupItem>> {
  // 注意：后端返回格式为 { code, msg, data: { total, data: [] } }
  const ret = await requestClient.get<any>('/ops-api/proxygroup/list', { params });
  return {
    data: ret?.data ?? [],
    total: ret?.total ?? 0,
  };
}

/**
 * 根据ID获取ProxyGroup详情
 */
export async function getProxyGroupById(id: number): Promise<ProxyGroupDetail> {
  return requestClient.get<ProxyGroupDetail>(`/ops-api/proxygroup/${id}`);
}

/**
 * 创建ProxyGroup
 */
export async function createProxyGroup(data: CreateProxyGroupReq): Promise<any> {
  return requestClient.postWithMsg('/ops-api/proxygroup/create', data);
}

/**
 * 更新ProxyGroup
 */
export async function updateProxyGroup(data: UpdateProxyGroupReq): Promise<any> {
  return requestClient.postWithMsg('/ops-api/proxygroup/update', data);
}

/**
 * 删除ProxyGroup
 */
export async function deleteProxyGroups(ids: number[]): Promise<any> {
  return requestClient.deleteWithMsg('/ops-api/proxygroup/delete', { data: { ids } });
}

/**
 * 添加Workers到分组
 */
export async function addProxiesToGroup(data: AddWorkersToGroupReq): Promise<any> {
  return requestClient.postWithMsg('/ops-api/proxygroup/members/add', data);
}

/**
 * 从分组移除Workers
 */
export async function removeProxiesFromGroup(data: RemoveWorkersFromGroupReq): Promise<any> {
  return requestClient.postWithMsg('/ops-api/proxygroup/members/remove', data);
}

/**
 * 批量更新分组成员（替换式更新，自动处理增删）
 */
export async function updateGroupMembers(data: UpdateGroupMembersReq): Promise<UpdateGroupMembersResp> {
  return requestClient.post<UpdateGroupMembersResp>(
    '/ops-api/proxygroup/members/update',
    data,
  );
}

/**
 * 更新分组成员权重
 */
export async function updateGroupMemberWeight(data: UpdateGroupMemberWeightReq): Promise<any> {
  return requestClient.postWithMsg('/ops-api/proxygroup/members/weight', data);
}

/**
 * 从分组选择Worker
 */
export async function pickProxyFromGroup(
  data: PickWorkerFromGroupReq,
): Promise<PickWorkerFromGroupResp> {
  return requestClient.post<PickWorkerFromGroupResp>(
    '/ops-api/proxygroup/pick',
    data,
  );
}
