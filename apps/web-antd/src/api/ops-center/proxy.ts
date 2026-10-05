import { requestClient } from '#/api/request';
import type { PageResult } from '#/api/common.d.ts';

// ==================== Worker 数据模型 ====================

export interface ProxyItem {
  id: number;
  createdAt: number;
  updatedAt: number;
  status: 0 | 1 | 2; // 0=disabled, 1=enabled, 2=deleted
  proxyId: string; // worker-001
  name: string;
  ip: string;
  port: number;
  version?: string;
  region: string;
  zone: string;
  capabilities: string[]; // ['ssh', 'telnet', 'rdp']
  tags: string[]; // ['production', 'beijing']
  endpoints: Record<string, string>; // {"http": "http://...", "grpc": "..."}
  metadata: Record<string, any>;
  proxyStatus: 'online' | 'degraded' | 'offline';
  lastHeartbeat: number; // Unix timestamp
  registerTime: number;
  weight: number; // 1-1000
  priority: number;
  cpuUsage: number; // 35.2
  memoryUsage: number;
  diskUsage: number;
  networkIn: number; // bytes
  networkOut: number;
  activeSessions: number;
  maxSessions: number;
  totalRequests: number;
  successCount: number;
  failureCount: number;
  healthCheckUrl?: string;
  healthCheckFailures: number;
  lastHealthCheck?: number;
  localIp?: string;
  publicIp?: string;
  networkSegments: string[]; // ['192.168.1.0/24']
}

export interface ProxyDetail extends ProxyItem {
  // 完整的26个字段（与ProxyItem相同）
}

export interface WorkerMetricsItem {
  id: number;
  proxyId: string;
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkInDelta: number;
  networkOutDelta: number;
  activeSessions: number;
  requestDelta: number;
  successDelta: number;
  failureDelta: number;
  avgLatencyMs: number;
  proxyStatus: string;
}

export interface WorkerMetricsStats {
  proxyId: string;
  startTime: number;
  endTime: number;
  dataPoints: number;
  avgCpu: number;
  maxCpu: number;
  avgMemory: number;
  maxMemory: number;
  avgSessions: number;
  maxSessions: number;
  totalRequests: number;
  totalSuccess: number;
  totalFailure: number;
  successRate: number; // 99.8
  avgLatency: number;
}

// ==================== 请求参数 ====================

export interface ProxyListParams {
  page: number;
  pageSize: number;
  status?: 0 | 1 | 2;
  proxyStatus?: 'online' | 'degraded' | 'offline';
  region?: string;
  zone?: string;
  name?: string;
  tags?: string[];
}

export interface UpdateWorkerWeightReq {
  id: number;
  weight: number; // 1-1000
}

export interface WorkerPickReq {
  strategy?:
    | 'least_connections'
    | 'round_robin'
    | 'weighted_round_robin'
    | 'consistent_hash'
    | 'geo_nearest'
    | 'priority'
    | 'random';
  requiredCapabilities?: string[];
  preferredRegion?: string;
  preferredZone?: string;
  requiredTags?: string[];
  minWeight?: number;
  sessionId?: string; // for consistent_hash
  excludeWorkerIds?: string[];
}

export interface WorkerPickResp {
  proxyId: string;
  name: string;
  ip: string;
  port: number;
  endpoints: Record<string, string>;
}

export interface WorkerMetricsReq {
  proxyId: string;
  startTime: number; // Unix timestamp
  endTime: number;
  limit?: number; // default 60
}

export interface WorkerMetricsStatsReq {
  proxyId: string;
  startTime: number;
  endTime: number;
}

// ==================== API 函数 ====================

/**
 * 获取Worker列表
 */
export async function listProxies(
  params: ProxyListParams,
): Promise<PageResult<ProxyItem>> {
  // 注意：后端返回格式为 { code, msg, data: { total, data: [] } }
  const ret = await requestClient.get<any>('/ops-api/proxy/list', { params });
  return {
    data: ret?.data ?? [],
    total: ret?.total ?? 0,
  };
}

/**
 * 根据ID获取Worker详情
 */
export async function getProxyById(id: number): Promise<ProxyDetail> {
  return requestClient.get<ProxyDetail>(`/ops-api/proxy/${id}`);
}

/**
 * 更新Worker权重
 */
export async function updateProxyWeight(
  data: UpdateWorkerWeightReq,
): Promise<any> {
  return requestClient.postWithMsg('/ops-api/proxy/weight', data);
}

/**
 * 激活Worker
 */
export async function activateProxy(id: number): Promise<any> {
  return requestClient.postWithMsg(`/ops-api/proxy/${id}/activate`, {});
}

/**
 * 停用Worker
 */
export async function deactivateProxy(id: number): Promise<any> {
  return requestClient.postWithMsg(`/ops-api/proxy/${id}/deactivate`, {});
}

/**
 * 批量删除Workers
 */
export async function deleteProxies(ids: number[]): Promise<any> {
  return requestClient.deleteWithMsg('/ops-api/proxy/delete', { data: { ids } });
}

/**
 * 选择Worker（智能路由）
 */
export async function pickProxy(data: WorkerPickReq): Promise<WorkerPickResp> {
  return requestClient.post<WorkerPickResp>('/ops-api/proxy/pick', data);
}

/**
 * 获取Worker指标数据
 */
export async function getProxyMetrics(
  params: WorkerMetricsReq,
): Promise<PageResult<WorkerMetricsItem>> {
  const ret = await requestClient.get<any>('/ops-api/proxy/metrics', { params });
  return {
    data: ret?.data ?? [],
    total: ret?.data?.length ?? 0,
  };
}

/**
 * 获取Worker指标统计
 */
export async function getProxyMetricsStats(
  params: WorkerMetricsStatsReq,
): Promise<WorkerMetricsStats> {
  return requestClient.get<WorkerMetricsStats>('/ops-api/proxy/metrics/stats', {
    params,
  });
}
