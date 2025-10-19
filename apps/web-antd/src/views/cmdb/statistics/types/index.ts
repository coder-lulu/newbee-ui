/**
 * CMDB统计分析前端类型定义
 * 支持动态字段、多维度分析、图表展示、权限控制等
 */

// ============ 基础数据类型 ============

export interface CIAttribute {
  id: number;
  name: string;
  alias?: string;
  valueType: 'text' | 'integer' | 'float' | 'datetime' | 'json' | 'boolean';
  description?: string;
  isRequired: boolean;
  defaultValue?: string;
  options?: string[]; // 选项值（枚举类型）
  validation?: AttributeValidation;
  qualityScore?: number; // 数据质量评分
  completenessRate?: number; // 完整性百分比
}

export interface AttributeValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minValue?: number;
  maxValue?: number;
  allowedValues?: string[];
}

export interface CIType {
  id: number;
  name: string;
  alias: string;
  category: string;
  attributes: CIAttribute[];
  icon?: string;
  color?: string;
  description?: string;
}

// ============ 统计配置类型 ============

export interface DimensionConfig {
  field: string; // 字段名或属性ID
  alias: string; // 显示别名
  displayName: string; // 显示名称
  type: 'attribute' | 'base_field' | 'calculated'; // 维度类型
  dataType: 'string' | 'number' | 'date' | 'boolean';
  groupBy?: string; // 分组方式：如按月、按天等
  format?: string; // 显示格式
  sortOrder?: 'asc' | 'desc';
  drillDownConfig?: DrillDownConfig; // 钻取配置
}

export interface MeasureConfig {
  field: string;
  function: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct_count';
  alias: string;
  displayName: string;
  format?: string; // 数值格式化
  precision?: number; // 精度
  unit?: string; // 单位
}

export interface DrillDownConfig {
  enabled: boolean;
  targetDimension?: string;
  maxLevels: number;
  breadcrumbEnabled: boolean;
}

export interface FilterCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in' | 'like' | 'contains' | 'between' | 'exists';
  value?: any;
  values?: any[]; // 多值过滤
  dataType: string;
  displayName: string;
}

export interface FilterGroup {
  logic: 'and' | 'or';
  conditions: FilterCondition[];
  groups?: FilterGroup[]; // 嵌套过滤组
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
  priority: number; // 排序优先级
}

export interface TimeRangeConfig {
  field: string; // 时间字段
  rangeType: 'absolute' | 'relative';
  startTime?: Date;
  endTime?: Date;
  relativeRange?: string; // 如：'last_7_days', 'this_month'等
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  timezone?: string;
}

// ============ 查询配置 ============

export interface StatisticsQueryConfig {
  id?: number;
  name: string;
  alias?: string;
  description?: string;
  configType: 'dashboard' | 'report' | 'alert' | 'custom';
  
  // 数据源配置
  ciTypeIds: number[]; // 支持多CI类型统计
  includeRelations?: boolean; // 是否包含关系数据
  
  // 维度和指标
  dimensions: DimensionConfig[];
  measures: MeasureConfig[];
  
  // 过滤和时间
  filters?: FilterGroup;
  timeRange?: TimeRangeConfig;
  
  // 显示配置
  chartType: ChartType;
  chartConfig?: ChartConfiguration;
  tableConfig?: TableConfiguration;
  
  // 排序和分页
  sorts: SortConfig[];
  pagination?: {
    pageSize: number;
    maxPages?: number;
  };
  
  // 权限和缓存
  cacheEnabled: boolean;
  cacheTTL?: number; // 缓存时间（秒）
  shareLevel: 'private' | 'department' | 'tenant' | 'public';
  
  // 刷新配置
  autoRefresh?: {
    enabled: boolean;
    interval: number; // 秒
  };
  
  // 钻取配置
  drillDownEnabled: boolean;
  
  // 元数据
  tags?: string[];
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============ 图表配置 ============

export type ChartType = 'table' | 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'heatmap' | 'funnel' | 'radar' | 'gauge';

export interface ChartConfiguration {
  title?: {
    text: string;
    show: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
  legend?: {
    show: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
    orient: 'horizontal' | 'vertical';
  };
  tooltip?: {
    show: boolean;
    trigger: 'item' | 'axis';
    formatter?: string;
  };
  grid?: {
    left: number | string;
    top: number | string;
    right: number | string;
    bottom: number | string;
  };
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  series?: SeriesConfig[];
  color?: string[]; // 颜色主题
  theme?: string; // ECharts主题
  responsive?: boolean;
  animation?: boolean;
}

export interface AxisConfig {
  show: boolean;
  name?: string;
  type: 'category' | 'value' | 'time' | 'log';
  position?: 'left' | 'right' | 'top' | 'bottom';
  min?: number | string;
  max?: number | string;
  interval?: number;
  rotate?: number; // 标签旋转角度
  formatter?: string;
}

export interface SeriesConfig {
  name: string;
  type: ChartType;
  data: any[];
  smooth?: boolean;
  stack?: string;
  itemStyle?: any;
  lineStyle?: any;
  areaStyle?: any;
  label?: {
    show: boolean;
    position: string;
    formatter?: string;
  };
}

export interface TableConfiguration {
  columns: TableColumnConfig[];
  pagination: boolean;
  pageSize: number;
  showHeader: boolean;
  striped: boolean;
  bordered: boolean;
  size: 'small' | 'middle' | 'large';
  expandable?: {
    enabled: boolean;
    childrenColumnName: string;
  };
  selection?: {
    enabled: boolean;
    type: 'checkbox' | 'radio';
  };
  sorting?: boolean;
  filtering?: boolean;
}

export interface TableColumnConfig {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  align: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  sortable: boolean;
  filterable: boolean;
  render?: 'text' | 'number' | 'date' | 'percentage' | 'badge' | 'link';
  precision?: number; // 数值精度
  format?: string;
}

// ============ 查询结果类型 ============

export interface StatisticsQueryResult {
  success: boolean;
  data: StatisticsResultData;
  pagination?: PaginationInfo;
  aggregations?: AggregationResult;
  metadata: ResultMetadata;
  cacheInfo?: CacheInfo;
  executionTime: number; // 毫秒
}

export interface StatisticsResultData {
  rows: StatisticsDataRow[];
  summary?: SummaryData;
  dimensions: string[]; // 维度字段列表
  measures: string[]; // 度量字段列表
}

export interface StatisticsDataRow {
  [key: string]: any;
  _meta?: {
    canDrillDown: boolean;
    drillDownParams?: Record<string, any>;
    level: number; // 钻取层级
    parentId?: string;
  };
}

export interface SummaryData {
  totalCount: number;
  subtotals?: Record<string, number>;
  averages?: Record<string, number>;
  percentages?: Record<string, number>;
}

export interface AggregationResult {
  facets?: FacetResult[];
  trends?: TrendResult[];
  comparisons?: ComparisonResult[];
}

export interface FacetResult {
  field: string;
  displayName: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
  percentage: number;
}

export interface TrendResult {
  field: string;
  periods: TrendPeriod[];
  trend: 'up' | 'down' | 'stable';
  changeRate: number; // 变化率
}

export interface TrendPeriod {
  period: string;
  value: number;
  timestamp: Date;
}

export interface ComparisonResult {
  field: string;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
}

export interface PaginationInfo {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ResultMetadata {
  queryId: string;
  configId?: number;
  dataSourceTables: string[];
  fieldsUsed: string[];
  filtersApplied: FilterCondition[];
  querySQL?: string; // 调试用
  executionPlan?: string; // 查询执行计划
}

export interface CacheInfo {
  hit: boolean;
  key: string;
  ttl: number;
  createdAt: Date;
  source: 'memory' | 'redis' | 'database';
}

// ============ 权限相关类型 ============

export interface PermissionContext {
  userId: number;
  tenantId: number;
  departmentId: number;
  roles: string[];
  permissions: Permission[];
  dataScope: DataScope;
}

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface DataScope {
  level: 'all' | 'department' | 'self' | 'custom';
  departmentIds?: number[];
  userIds?: number[];
  customFilters?: FilterCondition[];
}

// ============ UI状态类型 ============

export interface StatisticsPageState {
  // 配置状态
  currentConfig: StatisticsQueryConfig | null;
  savedConfigs: StatisticsQueryConfig[];
  
  // 查询状态
  queryResult: StatisticsQueryResult | null;
  isLoading: boolean;
  error: string | null;
  
  // UI状态
  activeTab: 'data' | 'chart' | 'config';
  selectedRows: StatisticsDataRow[];
  drillDownStack: DrillDownLevel[];
  
  // 筛选器状态
  fieldSelectorVisible: boolean;
  filterPanelVisible: boolean;
  
  // 图表状态
  chartLoading: boolean;
  chartError: string | null;
  
  // 权限状态
  permissions: PermissionContext | null;
  
  // 缓存状态
  cacheStats: CacheStats;
}

export interface DrillDownLevel {
  level: number;
  title: string;
  filters: FilterCondition[];
  config: StatisticsQueryConfig;
}

export interface CacheStats {
  hitRate: number;
  totalQueries: number;
  cachedQueries: number;
  avgResponseTime: number;
}

// ============ API请求类型 ============

export interface StatisticsQueryRequest {
  config: StatisticsQueryConfig;
  forceRefresh?: boolean; // 强制刷新缓存
  debugMode?: boolean; // 调试模式，返回SQL等信息
}

export interface StatisticsConfigSaveRequest {
  config: StatisticsQueryConfig;
  saveAsNew?: boolean;
}

export interface FieldMetadataRequest {
  ciTypeIds: number[];
  includeAttributes?: boolean;
  includeRelations?: boolean;
}

export interface FieldMetadataResponse {
  fields: FieldMetadata[];
  ciTypes: CIType[];
}

export interface FieldMetadata {
  name: string;
  displayName: string;
  type: 'base_field' | 'attribute' | 'relation';
  dataType: string;
  ciTypeId?: number;
  attributeId?: number;
  description?: string;
  allowedValues?: string[];
  statistics?: FieldStatistics;
}

export interface FieldStatistics {
  totalCount: number;
  nullCount: number;
  uniqueCount: number;
  completenessRate: number;
  qualityScore: number;
  topValues?: Array<{ value: string; count: number; percentage: number }>;
  distribution?: any;
}

// ============ 响应式设计类型 ============

export interface ResponsiveConfig {
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  currentBreakpoint: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface ResponsiveLayout {
  mobile: LayoutConfig;
  tablet: LayoutConfig;
  desktop: LayoutConfig;
}

export interface LayoutConfig {
  cols: number;
  rows: number;
  margin: [number, number];
  padding: [number, number];
  rowHeight: number;
}

// ============ 导出类型汇总 ============

export type {
  // 核心配置
  StatisticsQueryConfig,
  DimensionConfig,
  MeasureConfig,
  FilterCondition,
  FilterGroup,
  
  // 图表相关
  ChartType,
  ChartConfiguration,
  TableConfiguration,
  
  // 查询结果
  StatisticsQueryResult,
  StatisticsResultData,
  StatisticsDataRow,
  
  // UI状态
  StatisticsPageState,
  DrillDownLevel,
  
  // API请求
  StatisticsQueryRequest,
  FieldMetadataResponse,
  
  // 权限
  PermissionContext,
  DataScope,
  
  // 响应式
  ResponsiveConfig,
  ResponsiveLayout,
};