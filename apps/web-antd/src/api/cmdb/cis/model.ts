import type { CiRelationsData } from './relation';

/**
 * CI实例相关的数据结构定义
 * 根据后端API使用指南定义
 */

// === 基础数据结构 ===

// CI属性值 - 与API Gateway保持一致（camelCase）
export interface CiAttributeValue {
  attrId: number;
  attrName: string;
  attrAlias: string;
  valueType: string;
  value: string;
  rawValue?: any;
  relatedChildTypeId?: number; // 关联的子模型类型ID（用于关联模型属性）
}

// CI实例信息 - 与API Gateway保持一致（camelCase）
export interface CisInfo {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  typeId?: number;
  status?: number;
  heartbeat?: number;
  available?: boolean;
  createdBy?: string;
  tags?: string[];
  metadata?: Array<{ key?: string; value?: string }>;
  customFields?: Array<{ key?: string; value?: string }>;
  attributes?: CiAttributeValue[];
  relations?: CiRelationsData; // 关系数据
}

// === 请求数据结构 ===

// 创建CI实例请求 - 与API Gateway保持一致（camelCase）
export interface CreateCisRequest {
  typeId: number;
  status?: number;
  available?: boolean;
  createdBy?: string;
  tags?: string[];
  metadata?: Array<{ key?: string; value?: string }>;
  customFields?: Array<{ key?: string; value?: string }>;
  attributes: CiAttributeValue[];
  relations?: CiRelationsData; // 关系数据
}

// 更新CI实例请求 - 与API Gateway保持一致（camelCase）
export interface UpdateCisRequest {
  id: number;
  status?: number;
  available?: boolean;
  createdBy?: string;
  tags?: string[];
  metadata?: Array<{ key?: string; value?: string }>;
  customFields?: Array<{ key?: string; value?: string }>;
  attributes?: CiAttributeValue[];
  relations?: CiRelationsData; // 关系数据
}

// 根据ID获取CI实例请求
export interface GetCiByIdRequest {
  id: number;
}

// 删除CI实例请求
export interface DeleteCisRequest {
  ids: number[];
}

// === 高级查询相关 ===

// 属性过滤条件 - 与API Gateway保持一致（camelCase）
export interface CiAttributeFilter {
  attrId: number;
  attrName?: string;
  valueType: string;
  operator: string;
  value?: any;
  values?: any[];
  listMode?: string;
}

// 过滤条件组
export interface CiFilterGroup {
  logic: string; // "and" | "or"
  filters?: CiAttributeFilter[];
  groups?: CiFilterGroup[];
}

// === 增强搜索功能接口定义 ===

// 关系过滤条件
export interface CiRelationFilter {
  relationType: string; // 关系类型编码
  direction: 'incoming' | 'outgoing'; // 关系方向
  targetTypeIds?: number[]; // 目标CI类型
  targetCiIds?: number[]; // 特定目标CI ID
  relationDepth?: number; // 关系深度
  includeIndirect?: boolean; // 包含间接关系
}

// 继承搜索条件
export interface CiInheritanceSearch {
  includeChildren?: boolean; // 包含子类型
  includeParents?: boolean; // 包含父类型
  typeHierarchy?: number[]; // 指定类型层级
}

// 标签过滤条件
export interface CiTagFilter {
  key: string; // 标签键
  operator: 'eq' | 'exists' | 'in'; // 操作符
  values?: string[]; // 标签值列表
}

// 元数据过滤条件
export interface CiMetadataFilter {
  path: string; // JSON路径
  operator: 'contains' | 'eq' | 'exists' | 'gt' | 'lt'; // 操作符
  value?: any; // 过滤值
}

// 时间范围搜索条件
export interface CiTimeRangeSearch {
  field: 'created_at' | 'updated_at'; // 时间字段
  startTime?: number; // 开始时间（毫秒时间戳）
  endTime?: number; // 结束时间（毫秒时间戳）
  interval?: 'day' | 'hour' | 'month' | 'week'; // 时间间隔
}

// 分面搜索条件
export interface CiFacetSearch {
  fields: string[]; // 分面字段列表
  size?: number; // 每个分面返回的项目数
}

// 排序字段 - 与API Gateway保持一致（camelCase）
export interface CiSortField {
  attrId: number;
  fieldName?: string;
  direction: string; // "asc" | "desc"
  valueType?: string;
}

// CI列表查询请求
export interface CisListRequest {
  page: number;
  pageSize: number;

  // === 基础字段过滤 ===
  createdAt?: number;
  updatedAt?: number;
  typeId?: number;
  status?: number;
  available?: boolean;
  createdBy?: string;

  // === 属性过滤 ===
  attributeFilters?: CiAttributeFilter[];
  filterGroups?: CiFilterGroup[];

  // === 全文搜索 ===
  search?: string;
  searchFields?: number[];

  // === 增强搜索功能 ===
  relationFilters?: CiRelationFilter[];
  inheritanceSearch?: CiInheritanceSearch;
  tagFilters?: CiTagFilter[];
  metadataFilters?: CiMetadataFilter[];
  timeRangeSearch?: CiTimeRangeSearch;
  facetSearch?: CiFacetSearch;

  // === 排序和聚合 ===
  sortFields?: CiSortField[];
  withAggregations?: boolean;
  aggregationFields?: number[];

  // === 返回字段控制 ===
  withAttributes?: boolean;
  includeAttributes?: number[];
  excludeAttributes?: number[];

  // === 搜索引擎控制 ===
  forceEnhancedSearch?: boolean;
}

// === 批量操作相关 ===

// 批量操作请求 - 与API Gateway保持一致（camelCase）
export interface CisBatchOperationRequest {
  operation: string;
  ciIds: number[];
  params?: string; // JSON字符串
}

// === 验证相关 ===

// 属性验证请求 - 与API Gateway保持一致（camelCase）
export interface CisAttributeValidateRequest {
  typeId: number;
  attributes: CiAttributeValue[];
}

// 属性错误信息 - 与API Gateway保持一致（camelCase）
export interface CiAttributeError {
  attrId: number;
  attrName: string;
  errorType: string;
  message: string;
}

// === 响应数据结构 ===

// 基础响应
export interface BaseResponse {
  code: number;
  msg: string;
}

// CI实例信息响应
export interface CisInfoResponse extends BaseResponse {
  data: CisInfo;
}

// CI实例详情（包含类型信息） - 与API Gateway保持一致（camelCase）
export interface CisDetailInfo {
  ciInfo: CisInfo;
  ciTypeName: string;
  ciTypeAlias: string;
}

// CI实例详情响应
export interface CisDetailResponse extends BaseResponse {
  data: CisDetailInfo;
}

// CI列表信息
export interface CisListInfo {
  total: number;
  data: CisInfo[];
  aggregations?: string; // JSON格式的聚合统计数据
}

// 增强聚合数据结构
export interface EnhancedAggregations {
  total: number;
  status_stats?: Record<string, number>;
  enhanced?: {
    [key: string]: any; // 其他聚合数据
    currentPage: number; // 当前页
    facets?: Record<
      string,
      Array<{
        // 分面统计
        count: number;
        value: string;
      }>
    >;
    relatedCis?: Array<{
      // 关联CI信息
      distance: number;
      relationId: number;
      relationType: string;
      targetCiId: number;
    }>;
    searchTime: number; // 搜索耗时(ms)
    totalPages: number; // 总页数
  };
  [key: string]: any; // 兼容其他聚合字段
}

// 增强的CI列表响应
export interface EnhancedCisListResponse extends BaseResponse {
  data: {
    aggregations?: EnhancedAggregations;
    data: CisInfo[];
    total: number;
  };
}

// 原始响应保持兼容
export interface CisListResponse extends BaseResponse {
  data: CisListInfo;
}

// 属性验证响应
export interface CisAttributeValidateResponse extends BaseResponse {
  valid: boolean;
  errors?: CiAttributeError[];
}

// === 前端使用的数据结构 ===

// 配置项实例（前端使用）
export interface ConfigItem {
  id: number;
  name?: string;
  typeId: number;
  typeName?: string;
  status?: number;
  available?: boolean;
  createdAt?: number;
  updatedAt?: number;
  updatedBy?: string;
  // 动态属性，根据CI类型的属性定义来确定
  [key: string]: any;
}

// 分页结果（前端使用）
export interface PageResult<T> {
  list: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

// === 搜索和过滤相关 ===

// 过滤操作符
export interface FilterOperator {
  value: string;
  label: string;
  description: string;
  supportedTypes: string[];
  requiresValue: boolean;
  requiresValues: boolean;
}

// 搜索表单数据
export interface SearchFormData {
  search?: string;
  attributeFilters: CiAttributeFilter[];
  filterGroups: CiFilterGroup[];
  sortFields: CiSortField[];
}

// === 表格相关 ===

// CI类型属性定义（用于生成表格列）
export interface CiTypeAttribute {
  id: number;
  name: string;
  alias: string;
  valueType: string;
  required: boolean;
  defaultShow: boolean;
  sort: number;
  option?: string;
  choices?: Array<{
    id: number;
    label: string;
    meta?: {
      style?: {
        bgColor?: string;
        fontColor?: string;
        fontWeight?: string;
      };
    };
    value: string;
  }>;
}

// 表格列配置
export interface TableColumn {
  title: string;
  dataIndex: string;
  key: string;
  width?: number;
  fixed?: 'left' | 'right';
  sorter?: boolean;
  valueType?: string;
  choices?: Array<{
    color?: string;
    label: string;
    value: string;
  }>;
}

// 查询表单Schema
export interface QueryFormSchema {
  field: string;
  label: string;
  component: string;
  colProps?: {
    span?: number;
  };
  componentProps?: {
    options?: Array<{
      label: string;
      value: number | string;
    }>;
    placeholder?: string;
  };
}

// === 兼容性类型别名 ===

// 分页信息
export interface PageInfo {
  page: number;
  pageSize: number;
}

// === 常量定义 ===

// 错误码
export enum ErrorCode {
  FORBIDDEN = 403,
  INTERNAL_ERROR = 500,
  INVALID_PARAMS = 400,
  NOT_FOUND = 404,
  SUCCESS = 0,
  UNAUTHORIZED = 401,
}

// 操作符类型
export enum OperatorType {
  // 范围操作符
  BETWEEN = 'between', // 在范围内
  // JSON操作符
  CONTAINS = 'contains', // 包含（JSON类型）
  // 空值操作符
  EMPTY = 'empty', // 为空
  // 基础比较操作符
  EQ = 'eq', // 等于
  GT = 'gt', // 大于
  GTE = 'gte', // 大于等于

  // 列表操作符
  IN = 'in', // 在列表中
  // 文本操作符
  LIKE = 'like', // 模糊匹配

  LT = 'lt', // 小于
  LTE = 'lte', // 小于等于

  NE = 'ne', // 不等于
  NOT_EMPTY = 'not_empty', // 不为空

  NOT_IN = 'not_in', // 不在列表中
  NOT_LIKE = 'not_like', // 不匹配

  // 日期操作符
  TODAY = 'today', // 今天

  YESTERDAY = 'yesterday', // 昨天
}

// 逻辑操作符
export enum LogicOperator {
  AND = 'and',
  OR = 'or',
}

// 排序方向
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

// 批量操作类型
export enum BatchOperationType {
  DELETE = 'delete',
  UPDATE_ATTRIBUTES = 'update_attributes',
  UPDATE_STATUS = 'update_status',
}

// 状态映射
export const StatusMap = {
  1: '运行中',
  2: '已停止',
  3: '维护中',
  4: '故障',
} as const;

// 支持的操作符配置
export const SupportedOperators: FilterOperator[] = [
  {
    value: 'eq',
    label: '等于',
    description: '精确匹配',
    supportedTypes: ['text', 'int', 'float', 'bool', 'date', 'datetime'],
    requiresValue: true,
    requiresValues: false,
  },
  {
    value: 'ne',
    label: '不等于',
    description: '不等于指定值',
    supportedTypes: ['text', 'int', 'float', 'bool', 'date', 'datetime'],
    requiresValue: true,
    requiresValues: false,
  },
  {
    value: 'like',
    label: '包含',
    description: '模糊匹配',
    supportedTypes: ['text'],
    requiresValue: true,
    requiresValues: false,
  },
  {
    value: 'not_like',
    label: '不包含',
    description: '不包含指定文本',
    supportedTypes: ['text'],
    requiresValue: true,
    requiresValues: false,
  },
  {
    value: 'gt',
    label: '大于',
    description: '大于指定值',
    supportedTypes: ['int', 'float', 'date', 'datetime'],
    requiresValue: true,
    requiresValues: false,
  },
  {
    value: 'lt',
    label: '小于',
    description: '小于指定值',
    supportedTypes: ['int', 'float', 'date', 'datetime'],
    requiresValue: true,
    requiresValues: false,
  },
  {
    value: 'gte',
    label: '大于等于',
    description: '大于或等于指定值',
    supportedTypes: ['int', 'float', 'date', 'datetime'],
    requiresValue: true,
    requiresValues: false,
  },
  {
    value: 'lte',
    label: '小于等于',
    description: '小于或等于指定值',
    supportedTypes: ['int', 'float', 'date', 'datetime'],
    requiresValue: true,
    requiresValues: false,
  },
  {
    value: 'in',
    label: '在列表中',
    description: '值在指定列表中',
    supportedTypes: ['text', 'int', 'float'],
    requiresValue: false,
    requiresValues: true,
  },
  {
    value: 'empty',
    label: '为空',
    description: '值为空或null',
    supportedTypes: ['text', 'int', 'float', 'bool', 'date', 'datetime'],
    requiresValue: false,
    requiresValues: false,
  },
];
