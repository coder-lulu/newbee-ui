// ================================
// 基础响应类型
// ================================

export interface BaseMsgResp {
  code: number;
  msg: string;
}

export interface BaseDataResp<T = any> {
  code: number;
  msg: string;
  data: T;
}

export interface BaseListResp<T = any> {
  data: T[];
  total: number;
}

// ================================
// 全局拦截器处理后的返回类型
// ================================

// 全局拦截器处理后，直接返回data部分
export interface ProcessedListResp<T = any> {
  data: T[];
  total: number;
}

// ================================
// 通用请求参数
// ================================

export interface PageInfo {
  page: number;
  pageSize: number;
}

export interface IDReq {
  id: number;
}

export interface IDsReq {
  ids: number[];
}

export interface BaseIDInfo {
  id: number;
  createdAt: number;
  updatedAt: number;
}

// ================================
// 枚举定义
// ================================

export enum DomainType {
  BUSINESS = '业务域',
  CUSTOM = '自定义',
  SECURITY = '安全域',
}

export enum IPStatus {
  ALLOCATED = 'allocated',
  CONFLICT = 'conflict',
  FREE = 'free',
  RECYCLING = 'recycling',
  RESERVED = 'reserved',
}

export enum OnlineStatus {
  OFFLINE = 'offline',
  ONLINE = 'online',
  UNKNOWN = 'unknown',
}

export enum AllocationStrategy {
  CUSTOM = 'custom',
  RANDOM = 'random',
  SEQUENTIAL = 'sequential',
}

export enum ActionType {
  ALLOCATE = 'allocate',
  BATCH_ALLOCATE = 'batch_allocate',
  BATCH_RELEASE = 'batch_release',
  RELEASE = 'release',
}

export enum Status {
  DISABLED = 2,
  NORMAL = 1,
}

// ================================
// 网域管理类型
// ================================

export interface IpamDomain extends BaseIDInfo {
  name: string;
  type: DomainType;
  cidrRanges: string; // JSON格式字符串
  description?: string;
  status: Status;
}

export interface DomainCreateReq {
  name: string;
  type: DomainType;
  cidrRanges: string;
  description?: string;
  status: Status;
}

export interface DomainUpdateReq extends DomainCreateReq {
  id: number;
}

export interface DomainListReq extends PageInfo {
  name?: string;
  type?: DomainType;
  status?: Status;
}

export type DomainListResp = BaseListResp<IpamDomain>;
export type DomainDetailResp = BaseDataResp<IpamDomain>;

// 处理后的返回类型
export type ProcessedDomainListResp = ProcessedListResp<IpamDomain>;

// ================================
// 网段管理类型
// ================================

// 网段统计信息
export interface SubnetStatistics {
  totalIps: number; // 总IP地址数量
  allocatedIps: number; // 已分配IP数量
  availableIps: number; // 可用IP数量
  reservedIps: number; // 保留IP数量
  conflictIps: number; // 冲突IP数量
  onlineIps: number; // 在线IP数量
  offlineIps: number; // 离线IP数量
  unknownIps: number; // 未知状态IP数量
  allocationRate: number; // 分配率（百分比）
  onlineRate: number; // 在线率（百分比）
}

// IP租约信息
export interface IpLease {
  type: string; // 租约类型：static/dhcp/manual
  expiresAt?: number; // DHCP租约过期时间戳（毫秒），静态分配为null
}

// IP分配详情
export interface IpAllocation {
  id: number; // IP记录ID
  ipAddr: string; // IP地址
  status: string; // IP状态：allocated/free/reserved/conflict
  onlineStatus: string; // 在线状态：online/offline/unknown
  macAddr?: string; // MAC地址
  hostname?: string; // 主机名
  assetId?: number; // 资产ID
  assetName?: string; // 资产名称
  assetType?: string; // 资产类型
  lastPingAt?: number; // 最后PING时间戳（毫秒）
  assignedAt?: number; // IP分配时间戳（毫秒）
  description?: string; // 描述
  lease?: IpLease; // 租约信息
}

export interface IpamSubnet extends BaseIDInfo {
  domainId: number;
  cidr: string;
  vlanId?: number;
  name?: string;
  gateway?: string;
  allocationStrategy: AllocationStrategy;
  description?: string;
  status: Status;
  // 扩展字段
  domainName?: string;
  vlanName?: string;
  // 统计信息
  statistics?: SubnetStatistics;
  // IP分配详情列表
  ipAllocations?: IpAllocation[];
}

export interface SubnetCreateReq {
  domainId: number;
  cidr: string;
  vlanId?: number;
  name?: string;
  gateway?: string;
  allocationStrategy: AllocationStrategy;
  description?: string;
  status: Status;
}

export interface SubnetUpdateReq extends SubnetCreateReq {
  id: number;
}

export interface SubnetListReq extends PageInfo {
  domainId?: number;
  cidr?: string;
  vlanId?: number;
  name?: string;
  status?: Status;
}

export type SubnetListResp = BaseListResp<IpamSubnet>;
export type SubnetDetailResp = BaseDataResp<IpamSubnet>;

// 处理后的返回类型
export type ProcessedSubnetListResp = ProcessedListResp<IpamSubnet>;

// ================================
// IP地址管理类型
// ================================

export interface IpamIP extends BaseIDInfo {
  subnetId: number;
  ipAddr: string;
  macAddr?: string;
  assetId?: number;
  ipStatus: IPStatus;
  onlineStatus: OnlineStatus;
  description?: string;
  lastPingAt?: number;
  status: Status;
}

export interface IPCreateReq {
  subnetId: number;
  ipAddr: string;
  macAddr?: string;
  assetId?: number;
  ipStatus: IPStatus;
  onlineStatus: OnlineStatus;
  description?: string;
  lastPingAt?: number;
  status: Status;
}

export interface IPUpdateReq extends IPCreateReq {
  id: number;
}

export interface IPListReq extends PageInfo {
  subnetId?: number;
  ipAddr?: string;
  macAddr?: string;
  assetId?: number;
  ipStatus?: IPStatus;
  onlineStatus?: OnlineStatus;
  status?: Status;
}

export type IPListResp = BaseListResp<IpamIP>;
export type IPDetailResp = BaseDataResp<IpamIP>;

// 处理后的返回类型
export type ProcessedIPListResp = ProcessedListResp<IpamIP>;

// ================================
// VLAN管理类型
// ================================

export interface IpamVlan extends BaseIDInfo {
  vlanId: number;
  name: string;
  domainId: number;
  description?: string;
  status: Status;
}

export interface VlanCreateReq {
  vlanId: number;
  name: string;
  domainId: number;
  description?: string;
  status: Status;
}

export interface VlanUpdateReq extends VlanCreateReq {
  id: number;
}

export interface VlanListReq extends PageInfo {
  vlanId?: number;
  name?: string;
  domainId?: number;
  status?: Status;
}

export type VlanListResp = BaseListResp<IpamVlan>;
export type VlanDetailResp = BaseDataResp<IpamVlan>;

// 处理后的返回类型
export type ProcessedVlanListResp = ProcessedListResp<IpamVlan>;

// ================================
// IP操作记录类型
// ================================

export interface IpamIPRecord extends BaseIDInfo {
  ipId: number;
  subnetId: number;
  domainId: number;
  action: ActionType;
  operator: string;
  assetId?: number;
  remark?: string;
  // 后端返回的关联字段
  ipAddr?: string;
  domainName?: string;
  subnetName?: string;
}

export interface IPRecordCreateReq {
  ipId: number;
  subnetId: number;
  domainId: number;
  action: ActionType;
  operator: string;
  assetId?: number;
  remark?: string;
}

export interface IPRecordUpdateReq extends IPRecordCreateReq {
  id: number;
}

export interface IPRecordListReq extends PageInfo {
  ipId?: number;
  subnetId?: number;
  domainId?: number;
  action?: ActionType;
  operator?: string;
  assetId?: number;
}

export type IPRecordListResp = BaseListResp<IpamIPRecord>;
export type IPRecordDetailResp = BaseDataResp<IpamIPRecord>;

// 处理后的返回类型
export type ProcessedIPRecordListResp = ProcessedListResp<IpamIPRecord>;

// ================================
// 统计数据类型
// ================================

export interface IPAMStatistics {
  totalDomains: number;
  totalSubnets: number;
  totalIPs: number;
  allocatedIPs: number;
  availableIPs: number;
  onlineIPs: number;
  offlineIPs: number;
  allocationRate: number;
  onlineRate: number;
}
