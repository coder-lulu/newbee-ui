/**
 * IP业务逻辑API接口
 */
import { requestClient } from '#/api/request';

// ============= 类型定义 =============

export interface BaseDataInfo {
  code: number;
  msg: string;
}

export interface BaseMsgResp {
  code: number;
  msg: string;
}

// IP分配相关
export interface AllocateIpReq {
  subnetId: number;
  assetId?: number;
  operator?: string;
  remark?: string;
  ipAddr?: string;
}

export interface AllocateIpData {
  ipId: number;
  ipAddr: string;
}

export interface AllocateIpResp extends BaseDataInfo {
  data: AllocateIpData;
}

// IP回收相关
export interface ReleaseIpReq {
  ipId: number;
  operator?: string;
  remark?: string;
}

// 批量分配
export interface BatchAllocateIpReq {
  subnetId: number;
  count: number;
  assetId?: number;
  operator?: string;
  remark?: string;
}

export interface BatchAllocateIpData {
  ips: AllocateIpData[];
}

export interface BatchAllocateIpResp extends BaseDataInfo {
  data: BatchAllocateIpData;
}

// 批量回收
export interface BatchReleaseIpReq {
  ipIds: number[];
  operator?: string;
  remark?: string;
}

// PING检测
export interface PingIpReq {
  ipIds: number[];
}

export interface IpPingResult {
  ipId: number;
  ipAddr: string;
  isOnline: boolean;
  pingTime: number;
  errorMsg?: string;
}

export interface PingIpData {
  results: IpPingResult[];
}

export interface PingIpResp extends BaseDataInfo {
  data: PingIpData;
}

// 网段统计
export interface SubnetStatsReq {
  subnetId: number;
}

export interface SubnetStatsData {
  subnetId: number;
  cidr: string;
  totalIps: number;
  allocatedIps: number;
  availableIps: number;
  reservedIps: number;
  conflictIps: number;
  usageRate: number;
}

export interface SubnetStatsResp extends BaseDataInfo {
  data: SubnetStatsData;
}

// 冲突检测
export interface DetectIpConflictReq {
  subnetId?: number;
  domainId?: number;
}

export interface IpConflictInfo {
  ipAddr: string;
  ipIds: number[];
  assetIds: number[];
  conflictType: string;
}

export interface DetectIpConflictData {
  conflicts: IpConflictInfo[];
}

export interface DetectIpConflictResp extends BaseDataInfo {
  data: DetectIpConflictData;
}

// IP分配记录查询
export interface IpAllocationListReq {
  subnetId?: number;
  assetId?: number;
  status?: string;
  ipAddr?: string;
  page?: number;
  pageSize?: number;
}

export interface IpAllocationRecord {
  id: number;
  ipAddr: string;
  subnetId: number;
  assetId?: number;
  status: 'allocated' | 'available' | 'conflict' | 'reserved';
  onlineStatus: 'offline' | 'online' | 'unknown';
  macAddr?: string;
  hostname?: string;
  assetName?: string;
  assetType?: string;
  assignedAt?: number;
  lastPingAt?: number;
  operator?: string;
  remark?: string;
  createdAt: number;
  updatedAt: number;
}

export interface IpAllocationListData {
  data: IpAllocationRecord[];
  total: number;
}

export interface IpAllocationListResp extends BaseDataInfo {
  data: IpAllocationListData;
}

// ============= API接口 =============

export const IpBusinessApi = {
  /**
   * 分配IP地址
   */
  allocateIp: (data: AllocateIpReq): Promise<AllocateIpResp> => {
    return requestClient.post('/ipam-api/ip/business/allocate', data);
  },

  /**
   * 回收IP地址
   */
  releaseIp: (data: ReleaseIpReq): Promise<BaseMsgResp> => {
    return requestClient.post('/ipam-api/ip/business/release', data);
  },

  /**
   * 批量分配IP地址
   */
  batchAllocateIp: (data: BatchAllocateIpReq): Promise<BatchAllocateIpResp> => {
    return requestClient.post('/ipam-api/ip/business/batch_allocate', data);
  },

  /**
   * 批量回收IP地址
   */
  batchReleaseIp: (data: BatchReleaseIpReq): Promise<BaseMsgResp> => {
    return requestClient.post('/ipam-api/ip/business/batch_release', data);
  },

  /**
   * IP连通性检测
   */
  pingIp: (data: PingIpReq): Promise<PingIpResp> => {
    return requestClient.post('/ipam-api/ip/business/ping', data);
  },

  /**
   * 获取网段统计信息
   */
  getSubnetStats: (data: SubnetStatsReq): Promise<SubnetStatsResp> => {
    return requestClient.post('/ipam-api/ip/business/stats', data);
  },

  /**
   * 检测IP冲突
   */
  detectIpConflict: (
    data: DetectIpConflictReq,
  ): Promise<DetectIpConflictResp> => {
    return requestClient.post('/ipam-api/ip/business/conflict_detect', data);
  },

  /**
   * 获取IP分配记录列表
   */
  getIpAllocationList: (
    data: IpAllocationListReq,
  ): Promise<IpAllocationListResp> => {
    return requestClient.post('/ipam-api/ip/business/allocations', data);
  },
};
