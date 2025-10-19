/**
 * CI权限管理相关的数据结构定义
 * 根据后端CI权限前端对接文档定义
 */

import type {
  BaseDataInfo,
  BaseIDInfo,
  BaseListInfo,
  PageQuery,
} from '#/api/common';

// ==================== 枚举定义 ====================

/**
 * 权限范围类型
 */
export enum ScopeType {
  ATTRIBUTE = 'attribute',
  CI_INSTANCE = 'ci_instance',
  CI_TYPE = 'ci_type',
  FIELD = 'field',
  GLOBAL = 'global',
}

/**
 * 权限主体类型
 */
export enum SubjectType {
  DEPARTMENT = 'department',
  GROUP = 'group',
  ROLE = 'role',
  SYSTEM = 'system',
  USER = 'user',
}

/**
 * 权限类型
 */
export enum PermissionType {
  ALLOW = 'allow',
  DENY = 'deny',
}

/**
 * 权限级别
 */
export enum PermissionLevel {
  ADMIN = 'admin',
  NONE = 'none',
  READ = 'read',
  SUPER_ADMIN = 'super_admin',
  WRITE = 'write',
}

/**
 * 风险等级
 */
export enum RiskLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  LOW = 'low',
  MEDIUM = 'medium',
}

/**
 * 权限状态
 */
export enum PermissionStatus {
  ACTIVE = 1,
  EXPIRED = 3,
  INACTIVE = 0,
  PENDING = 2,
}

// ==================== 基础数据结构 ====================

/**
 * 权限操作定义
 */
export interface CiPermissionOperation {
  operation: string;
  description: string;
}

/**
 * 权限操作集合
 */
export interface CiPermissionOperations {
  operations: CiPermissionOperation[];
}

/**
 * 权限条件定义
 */
export interface CiPermissionConditions {
  conditions?: Record<string, any>;
}

/**
 * 权限过滤规则
 */
export interface CiPermissionFilterRule {
  field: string;
  operator: string;
  value: string;
}

/**
 * 权限数据过滤
 */
export interface CiPermissionDataFilters {
  rules: CiPermissionFilterRule[];
  logic: string;
}

/**
 * 权限字段掩码
 */
export interface CiPermissionFieldMasks {
  fields: string[];
}

/**
 * CI权限完整信息
 */
export interface CiPermissionInfo extends BaseIDInfo {
  permission_id?: string;
  department_id?: number;
  scope_type?: ScopeType | string;
  ci_type_id?: number;
  ci_id?: number;
  attribute_id?: number;
  field_name?: string;
  subject_type?: string | SubjectType;
  subject_id?: string;
  subject_name?: string;
  subject_code?: string;
  permission_type?: PermissionType | string;
  operations?: CiPermissionOperations;
  conditions?: CiPermissionConditions;
  priority?: number;
  permission_level?: PermissionLevel | string;
  effective_from?: number;
  effective_to?: number;
  is_temporary?: boolean;
  require_approval?: boolean;
  granted_by?: string;
  granted_by_name?: string;
  granted_at?: number;
  usage_count?: number;
  last_used_at?: number;
  status?: number | PermissionStatus;
  risk_level?: RiskLevel | string;
  require_mfa?: boolean;
  inheritable?: boolean;
  description?: string;
  comments?: string;
  created_by?: string;
  updated_by?: string;
}

// ==================== 请求数据结构 ====================

/**
 * 创建权限请求
 */
export interface CreateCiPermissionRequest {
  permission_id?: string;
  department_id?: number;
  scope_type: ScopeType | string;
  ci_type_id?: number;
  ci_id?: number;
  attribute_id?: number;
  field_name?: string;
  subject_type: string | SubjectType;
  subject_id?: string;
  subject_name: string;
  subject_code?: string;
  permission_type?: PermissionType | string;
  operations?: CiPermissionOperations;
  conditions?: CiPermissionConditions;
  priority?: number;
  permission_level: PermissionLevel | string;
  effective_from?: number;
  effective_to?: number;
  is_temporary?: boolean;
  require_approval?: boolean;
  risk_level?: RiskLevel | string;
  require_mfa?: boolean;
  inheritable?: boolean;
  description?: string;
  comments?: string;
}

/**
 * 更新权限请求
 */
export interface UpdateCiPermissionRequest {
  id: number;
  permission_id?: string;
  department_id?: number;
  scope_type?: ScopeType | string;
  ci_type_id?: number;
  ci_id?: number;
  attribute_id?: number;
  field_name?: string;
  subject_type?: string | SubjectType;
  subject_id?: string;
  subject_name?: string;
  subject_code?: string;
  permission_type?: PermissionType | string;
  operations?: CiPermissionOperations;
  conditions?: CiPermissionConditions;
  priority?: number;
  permission_level?: PermissionLevel | string;
  effective_from?: number;
  effective_to?: number;
  is_temporary?: boolean;
  require_approval?: boolean;
  risk_level?: RiskLevel | string;
  require_mfa?: boolean;
  inheritable?: boolean;
  description?: string;
  comments?: string;
  updated_by?: string;
}

/**
 * 删除权限请求
 */
export interface DeleteCiPermissionRequest {
  ids: number[];
}

/**
 * 获取权限详情请求
 */
export interface GetCiPermissionRequest {
  id: number;
}

/**
 * 权限列表查询请求
 */
export interface CiPermissionListRequest extends PageQuery {
  department_id?: number;
  permission_id?: string;
  scope_type?: ScopeType | string;
  subject_type?: string | SubjectType;
  subject_name?: string;
  permission_level?: PermissionLevel | string;
  risk_level?: RiskLevel | string;
  status?: number | PermissionStatus;
  is_temporary?: boolean;
  require_approval?: boolean;
  effective_from?: number;
  effective_to?: number;
  created_by?: string;
  updated_by?: string;
}

// ==================== 响应数据结构 ====================

/**
 * 权限信息响应
 */
export type CiPermissionInfoResponse = BaseDataInfo<CiPermissionInfo>;

/**
 * 权限列表响应
 */
export type CiPermissionListResponse = BaseListInfo<CiPermissionInfo>;

/**
 * 创建权限响应
 */
export type CreateCiPermissionResponse = BaseDataInfo<{
  id: number;
  msg: string;
}>;

/**
 * 批量删除权限响应
 */
export type DeleteCiPermissionResponse = BaseDataInfo<{
  deleted_count: number;
  failed_ids?: number[];
}>;

// ==================== 辅助类型 ====================

/**
 * 权限范围选项
 */
export interface ScopeTypeOption {
  label: string;
  value: ScopeType;
  description: string;
}

/**
 * 权限主体选项
 */
export interface SubjectTypeOption {
  label: string;
  value: SubjectType;
  description: string;
}

/**
 * 权限级别选项
 */
export interface PermissionLevelOption {
  label: string;
  value: PermissionLevel;
  description: string;
  color?: string;
}

/**
 * 风险等级选项
 */
export interface RiskLevelOption {
  label: string;
  value: RiskLevel;
  description: string;
  color?: string;
}

// ==================== 常量定义 ====================

/**
 * 权限范围类型选项
 */
export const SCOPE_TYPE_OPTIONS: ScopeTypeOption[] = [
  { label: '全局权限', value: ScopeType.GLOBAL, description: '对所有CI的权限' },
  {
    label: 'CI类型权限',
    value: ScopeType.CI_TYPE,
    description: '对特定CI类型的权限',
  },
  {
    label: 'CI实例权限',
    value: ScopeType.CI_INSTANCE,
    description: '对特定CI实例的权限',
  },
  {
    label: '属性权限',
    value: ScopeType.ATTRIBUTE,
    description: '对特定属性的权限',
  },
  {
    label: '字段权限',
    value: ScopeType.FIELD,
    description: '对特定字段的权限',
  },
];

/**
 * 权限主体类型选项
 */
export const SUBJECT_TYPE_OPTIONS: SubjectTypeOption[] = [
  { label: '用户', value: SubjectType.USER, description: '授权给特定用户' },
  { label: '角色', value: SubjectType.ROLE, description: '授权给角色' },
  { label: '部门', value: SubjectType.DEPARTMENT, description: '授权给部门' },
  { label: '用户组', value: SubjectType.GROUP, description: '授权给用户组' },
  { label: '系统', value: SubjectType.SYSTEM, description: '系统级权限' },
];

/**
 * 权限级别选项
 */
export const PERMISSION_LEVEL_OPTIONS: PermissionLevelOption[] = [
  {
    label: '无权限',
    value: PermissionLevel.NONE,
    description: '无任何权限',
    color: '#999',
  },
  {
    label: '只读',
    value: PermissionLevel.READ,
    description: '只能查看',
    color: '#52c41a',
  },
  {
    label: '读写',
    value: PermissionLevel.WRITE,
    description: '可以查看和编辑',
    color: '#1890ff',
  },
  {
    label: '管理员',
    value: PermissionLevel.ADMIN,
    description: '管理权限',
    color: '#fa8c16',
  },
  {
    label: '超级管理员',
    value: PermissionLevel.SUPER_ADMIN,
    description: '所有权限',
    color: '#f5222d',
  },
];

/**
 * 风险等级选项
 */
export const RISK_LEVEL_OPTIONS: RiskLevelOption[] = [
  {
    label: '低风险',
    value: RiskLevel.LOW,
    description: '低风险操作',
    color: '#52c41a',
  },
  {
    label: '中风险',
    value: RiskLevel.MEDIUM,
    description: '中风险操作',
    color: '#fa8c16',
  },
  {
    label: '高风险',
    value: RiskLevel.HIGH,
    description: '高风险操作',
    color: '#f5222d',
  },
  {
    label: '严重风险',
    value: RiskLevel.CRITICAL,
    description: '严重风险操作',
    color: '#ad2102',
  },
];

