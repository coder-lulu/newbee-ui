/**
 * OPS命令管理相关的数据结构定义
 * 根据OPS API接口对接文档定义
 */

import type { ID, IDS } from '#/api/common';

// === 基础数据结构 ===

// 命令标签
export interface OpsCommandTag {
  key: string;
  value: string;
}

// 命令版本历史
export interface OpsCommandVersionHistory {
  version: string;
  change_log: string;
  date?: number;
}

// 命令信息
export interface OpsCommand {
  id?: ID;
  createdAt?: number;
  updatedAt?: number;
  status: number; // 1:正常 2:禁用
  name: string; // 命令名称
  description: string; // 命令描述
  version: string; // 命令版本（语义化版本）
  commandContent: string; // 命令内容
  defaultParams: string; // 默认参数配置（JSON格式）
  paramSchema: string; // 参数验证规则（JSON Schema）
  interpreterType: string; // 解释器类型
  commandType: string; // 命令类型
  commandCategory: string; // 命令分类
  defaultTimeoutSeconds: number; // 默认超时时间（秒）
  requireSudo: boolean; // 是否需要sudo权限
  workingDir: string; // 默认工作目录
  envVars: string; // 默认环境变量（JSON格式）
  requireConfirmation: boolean; // 是否需要执行确认
  outputFormat: string; // 默认输出格式
  accessLevel: string; // 访问级别
  allowedUsers: string; // 允许使用的用户ID列表
  allowedRoles: string; // 允许使用的角色列表
  isApproved: boolean; // 是否已审核通过
  approvedBy: string; // 审核者ID
  approvedAt?: number; // 审核时间戳
  contentChecksum: string; // 命令内容校验和
  validationRules: string; // 验证规则（JSON格式）
  isDeprecated: boolean; // 是否已废弃
  deprecationReason: string; // 废弃原因
  replacementCommandId: string; // 替代命令ID
  groupId?: ID; // 所属命令组ID
  tags: OpsCommandTag[]; // 标签信息
  metadata: string; // 扩展元数据（JSON格式）
  icon: string; // 图标标识
  usageExample: string; // 使用示例
  notes: string; // 备注说明
  retryPolicy: string; // 重试策略（JSON格式）
  dependencies: string; // 依赖命令（JSON数组）
  extraParams: string; // 额外参数配置（JSON格式）
  versionHistory: OpsCommandVersionHistory[]; // 版本历史记录
}

// === 请求数据结构 ===

// 创建命令请求
export interface CreateOpsCommandRequest {
  status: number;
  name: string;
  description: string;
  version: string;
  commandContent: string;
  defaultParams: string;
  paramSchema: string;
  interpreterType: string;
  commandType: string;
  commandCategory: string;
  defaultTimeoutSeconds: number;
  requireSudo: boolean;
  workingDir: string;
  envVars: string;
  requireConfirmation: boolean;
  outputFormat: string;
  accessLevel: string;
  allowedUsers: string;
  allowedRoles: string;
  isApproved: boolean;
  approvedBy: string;
  approvedAt?: number;
  contentChecksum: string;
  validationRules: string;
  isDeprecated: boolean;
  deprecationReason: string;
  replacementCommandId: string;
  groupId?: ID;
  tags: OpsCommandTag[];
  metadata: string;
  icon: string;
  usageExample: string;
  notes: string;
  retryPolicy: string;
  dependencies: string;
  extraParams: string;
  versionHistory: OpsCommandVersionHistory[];
}

// 更新命令请求
export interface UpdateOpsCommandRequest extends CreateOpsCommandRequest {
  id: ID;
}

// 根据ID获取命令请求
export interface GetOpsCommandByIdRequest {
  id: ID;
}

// 删除命令请求
export interface DeleteOpsCommandRequest {
  ids: IDS;
}

// 命令列表查询请求（筛选条件）
export interface OpsCommandListQuery {
  createdAt?: number;
  updatedAt?: number;
  status?: number;
  name?: string;
  description?: string;
  version?: string;
  commandType?: string;
  commandCategory?: string;
  interpreterType?: string;
  requireSudo?: boolean;
  isApproved?: boolean;
  isDeprecated?: boolean;
  groupId?: ID;
  accessLevel?: string;
}

// === 响应数据结构 ===

// 基础响应
export interface BaseResponse {
  code: number;
  msg: string;
}

// 命令信息响应
export interface OpsCommandInfoResponse extends BaseResponse {
  data: OpsCommand;
}

// 命令列表信息
export interface OpsCommandListInfo {
  total: number;
  data: OpsCommand[];
}

// 命令列表响应
export interface OpsCommandListResponse extends BaseResponse {
  data: OpsCommandListInfo;
}

// === 前端使用的数据结构 ===

// 命令表单数据
export interface OpsCommandFormData {
  id?: ID;
  status: number;
  name: string;
  description: string;
  version: string;
  commandContent: string;
  defaultParams: string;
  paramSchema: string;
  interpreterType: string;
  commandType: string;
  commandCategory: string;
  defaultTimeoutSeconds: number;
  requireSudo: boolean;
  workingDir: string;
  envVars: string;
  requireConfirmation: boolean;
  outputFormat: string;
  accessLevel: string;
  allowedUsers: string;
  allowedRoles: string;
  isApproved: boolean;
  approvedBy: string;
  approvedAt?: number;
  contentChecksum: string;
  validationRules: string;
  isDeprecated: boolean;
  deprecationReason: string;
  replacementCommandId: string;
  groupId?: ID;
  tags: OpsCommandTag[];
  metadata: string;
  icon: string;
  usageExample: string;
  notes: string;
  retryPolicy: string;
  dependencies: string;
  extraParams: string;
  versionHistory: OpsCommandVersionHistory[];
}

// 分页信息
export interface OpsPageInfo {
  page: number;
  pageSize: number;
}

// 枚举定义
export enum OpsCommandStatus {
  DISABLED = 2,
  NORMAL = 1,
}

export enum OpsCommandAccessLevel {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  USER = 'user',
}

export enum OpsCommandType {
  APPLICATION = 'application',
  BACKUP = 'backup',
  DATABASE = 'database',
  DEPLOYMENT = 'deployment',
  MONITORING = 'monitoring',
  NETWORK = 'network',
  SECURITY = 'security',
  SYSTEM = 'system',
}

export enum OpsCommandCategory {
  BACKUP = 'backup',
  DEPLOYMENT = 'deployment',
  MAINTENANCE = 'maintenance',
  MONITORING = 'monitoring',
  OPTIMIZATION = 'optimization',
  SECURITY = 'security',
  TROUBLESHOOTING = 'troubleshooting',
}

export enum InterpreterType {
  ANSIBLE = 'ansible',
  BASH = 'bash',
  CMD = 'cmd',
  POWERSHELL = 'powershell',
  PYTHON = 'python',
  SH = 'sh',
  TERRAFORM = 'terraform',
}

export enum OutputFormat {
  CSV = 'csv',
  JSON = 'json',
  TABLE = 'table',
  TEXT = 'text',
  XML = 'xml',
}

// 命令执行状态枚举
export enum ExecutionStatus {
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  TIMEOUT = 'timeout',
}

// 退出代码常量
export const ExitCode = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  PERMISSION_DENIED: 126,
  COMMAND_NOT_FOUND: 127,
  TIMEOUT: 124,
  INTERRUPTED: 130,
} as const;

// === 命令执行相关数据结构 ===

// 执行命令请求
export interface ExecuteOpsCommandRequest {
  targetHosts: string[]; // 目标主机ID列表
  commandContent: string; // 命令内容
  credentialId: number; // 凭证ID
  description?: string; // 执行描述
  timeout?: number; // 超时时间（秒）
  params?: Record<string, any>; // 执行参数
  envVars?: Record<string, string>; // 环境变量
  workingDir?: string; // 工作目录
  useCustomParams?: boolean; // 是否使用自定义参数
}

// 执行结果信息
// 执行结果（与后端 OpsExecCommandResult 保持一致）
export interface ExecuteResult {
  hostIp?: string; // 主机IP
  result?: string; // 执行结果
  stdOut?: string; // 标准输出
  stdErr?: string; // 标准错误输出
  status?: string; // 执行状态
  startTime?: number; // 开始时间戳
  endTime?: number; // 结束时间戳
  exitCode?: number; // 退出代码

  // 兼容性字段（前端可能需要的扩展字段）
  hostId?: string; // 主机ID（前端扩展）
  duration?: number; // 执行耗时（毫秒，前端计算）
  errorMsg?: string; // 错误信息（兼容字段）
  output?: string; // 输出内容（兼容字段）
}

// === 辅助类型和工具函数 ===

// 执行结果工具函数
export const ExecuteResultUtils = {
  /**
   * 判断命令是否执行成功
   */
  isSuccess(result: ExecuteResult): boolean {
    return result.exitCode === ExitCode.SUCCESS;
  },

  /**
   * 获取主要输出内容（优先 stdOut，其次 result，最后 output）
   */
  getPrimaryOutput(result: ExecuteResult): string {
    return result.stdOut || result.result || result.output || '';
  },

  /**
   * 获取错误信息（优先 stdErr，其次 errorMsg）
   */
  getErrorMessage(result: ExecuteResult): string {
    return result.stdErr || result.errorMsg || '';
  },

  /**
   * 计算执行耗时
   */
  calculateDuration(result: ExecuteResult): number {
    if (result.startTime && result.endTime) {
      return result.endTime - result.startTime;
    }
    return result.duration || 0;
  },

  /**
   * 格式化执行状态显示
   */
  formatStatus(result: ExecuteResult): string {
    const status = result.status || ExecutionStatus.PENDING;
    const exitCode = result.exitCode;

    if (status === ExecutionStatus.SUCCESS && exitCode === ExitCode.SUCCESS) {
      return '成功';
    } else
      switch (status) {
        case ExecutionStatus.CANCELLED: {
          return '已取消';
        }
        case ExecutionStatus.FAILED: {
          return `失败 (${exitCode || 'N/A'})`;
        }
        case ExecutionStatus.RUNNING: {
          return '执行中';
        }
        case ExecutionStatus.TIMEOUT: {
          return '超时';
        }
        default: {
          return '等待中';
        }
      }
  },

  /**
   * 转换为兼容的旧格式（用于向后兼容）
   */
  toLegacyFormat(result: ExecuteResult): ExecuteResult {
    return {
      ...result,
      output: result.stdOut || result.result || result.output || '',
      errorMsg: result.stdErr || result.errorMsg || '',
      duration: this.calculateDuration(result),
    };
  },
};
