import type { PageQuery, PageResult } from '#/api/common';

/**
 * 审计日志信息
 */
export interface AuditLogInfo {
  id?: string;
  createdAt?: number;
  updatedAt?: number;
  status?: number;
  tenantId?: string;
  userId?: string;
  userName?: string;
  operationType?: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  resourceType?: string;
  resourceId?: string;
  requestMethod?: string;
  requestPath?: string;
  requestData?: string;
  responseStatus?: number;
  responseData?: string;
  ipAddress?: string;
  userAgent?: string;
  durationMs?: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * 审计日志查询参数
 */
export interface AuditLogQuery extends PageQuery {
  userId?: string;
  userName?: string;
  operationType?: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  resourceType?: string;
  resourceId?: string;
  requestMethod?: string;
  requestPath?: string;
  ipAddress?: string;
  responseStatus?: number;
  startTime?: number;
  endTime?: number;
  minDuration?: number;
  maxDuration?: number;
}

/**
 * 审计日志统计查询参数
 */
export interface AuditLogStatsQuery {
  startTime?: number;
  endTime?: number;
  groupBy?: 'operation_type' | 'resource_type' | 'user_id' | 'response_status' | 'ip_address';
}

/**
 * 审计日志统计项
 */
export interface AuditLogStatsItem {
  label: string;
  count: number;
  percentage: number;
}

/**
 * 审计日志统计响应
 */
export interface AuditLogStatsResult {
  data: AuditLogStatsItem[];
}

/**
 * 操作类型选项
 */
export interface OperationTypeOption {
  label: string;
  value: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  color: string;
}

/**
 * 响应状态选项
 */
export interface ResponseStatusOption {
  label: string;
  value: number;
  color: string;
  type: 'success' | 'warning' | 'error';
}