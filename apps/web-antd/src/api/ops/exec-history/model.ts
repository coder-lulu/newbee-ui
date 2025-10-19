/**
 * OPS命令执行历史相关的数据结构定义
 * 根据OPS API接口对接文档定义
 */

import type { ID, IDS } from '#/api/common';

// === 基础数据结构 ===

// 命令执行历史信息
export interface OpsCommandExecHistory {
  id?: ID;
  createdAt?: number;
  updatedAt?: number;
  status: number; // 1:正常 2:禁用
  commandId: string; // 命令ID
  commandName: string; // 命令名称
  commandVersion: string; // 命令版本
  commandParams: string; // 命令参数（JSON格式）
  commandResult: string; // 命令结果
  commandStatus: string; // 命令状态：success/failed/running/timeout
  userId: string; // 执行用户ID
  sessionId: string; // 用户会话ID
  correlationId: string; // 跨服务追踪ID
  workflowId: string; // 工作流ID
  batchId: string; // 批次ID（用于批量执行）
  hostRef: string; // 目标主机引用（CMDB主机ID）
  credentialRef: string; // 使用的凭据引用ID
  targetHost: string; // 实际目标主机IP
  targetPort: number; // 实际目标端口
}

export interface OpsCommandExecHistorySimple {
  id?: ID;
  commandId: string;
  commandName: string;
  commandContent: string;
}

// === 请求数据结构 ===

// 创建执行历史记录请求
export interface CreateOpsCommandExecHistoryRequest {
  status: number;
  commandId: string;
  commandName: string;
  commandVersion: string;
  commandParams: string;
  commandResult: string;
  commandStatus: string;
  userId: string;
  sessionId: string;
  correlationId: string;
  workflowId: string;
  batchId: string;
  hostRef: string;
  credentialRef: string;
  targetHost: string;
  targetPort: number;
}

// 更新执行历史记录请求
export interface UpdateOpsCommandExecHistoryRequest
  extends CreateOpsCommandExecHistoryRequest {
  id: ID;
}

// 根据ID获取执行历史记录请求
export interface GetOpsCommandExecHistoryByIdRequest {
  id: ID;
}

// 删除执行历史记录请求
export interface DeleteOpsCommandExecHistoryRequest {
  ids: IDS;
}

// 执行历史列表查询请求（筛选条件）
export interface OpsCommandExecHistoryListQuery {
  createdAt?: number;
  status?: number;
  commandId?: string;
  commandName?: string;
  commandStatus?: string;
  userId?: string;
  sessionId?: string;
  workflowId?: string;
  batchId?: string;
  hostRef?: string;
  targetHost?: string;
}

// === 响应数据结构 ===

// 基础响应
export interface BaseResponse {
  code: number;
  msg: string;
}

// 执行历史信息响应
export interface OpsCommandExecHistoryInfoResponse extends BaseResponse {
  data: OpsCommandExecHistory;
}

// === 前端使用的数据结构 ===

// 执行历史表单数据
export interface OpsCommandExecHistoryFormData {
  id?: ID;
  status: number;
  commandId: string;
  commandName: string;
  commandVersion: string;
  commandParams: string;
  commandResult: string;
  commandStatus: string;
  userId: string;
  sessionId: string;
  correlationId: string;
  workflowId: string;
  batchId: string;
  hostRef: string;
  credentialRef: string;
  targetHost: string;
  targetPort: number;
}

// 执行历史统计数据
export interface OpsCommandExecHistoryStats {
  totalCount: number;
  successCount: number;
  failedCount: number;
  runningCount: number;
  timeoutCount: number;
  successRate: number;
}

// 执行历史分组统计
export interface OpsCommandExecHistoryGroupStats {
  commandId: string;
  commandName: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  successRate: number;
  lastExecuteTime: number;
}

// 枚举定义
export enum OpsCommandExecHistoryStatus {
  DISABLED = 2,
  NORMAL = 1,
}

export enum OpsCommandExecStatus {
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  TIMEOUT = 'timeout',
}
