import type { 
  AuditLogInfo, 
  AuditLogQuery, 
  AuditLogStatsQuery, 
  AuditLogStatsResult 
} from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  GetAuditLogList = '/sys-api/audit-log/list',
  GetAuditLogById = '/sys-api/audit-log',
  DeleteAuditLog = '/sys-api/audit-log/delete',
  GetAuditLogStats = '/sys-api/audit-log/stats',
  ExportAuditLog = '/sys-api/audit-log/export',
}

/**
 * 获取审计日志列表
 * @param params 查询参数
 * @returns 审计日志列表
 */
export function getAuditLogList(params?: AuditLogQuery) {
  return requestClient.post<PageResult<AuditLogInfo>>(Api.GetAuditLogList, {
    ...params,
  });
}

/**
 * 根据ID获取审计日志详情
 * @param id 审计日志ID
 * @returns 审计日志详情
 */
export function getAuditLogById(id: ID) {
  return requestClient.post<AuditLogInfo>(Api.GetAuditLogById, { id });
}

/**
 * 删除审计日志
 * @param ids 审计日志ID数组
 * @returns void
 */
export function deleteAuditLog(ids: IDS) {
  return requestClient.postWithMsg<void>(Api.DeleteAuditLog, { ids });
}

/**
 * 获取审计日志统计
 * @param params 统计查询参数
 * @returns 统计结果
 */
export function getAuditLogStats(params?: AuditLogStatsQuery) {
  return requestClient.post<AuditLogStatsResult>(Api.GetAuditLogStats, {
    ...params,
  });
}

/**
 * 导出审计日志
 * @param params 查询参数
 * @returns blob
 */
export function exportAuditLog(params?: AuditLogQuery) {
  return requestClient.post<Blob>(Api.ExportAuditLog, params, {
    responseType: 'blob',
    isTransformResponse: false,
  });
}