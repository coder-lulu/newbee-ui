// 通用资产选择器类型定义

export interface AssetType {
  id: string
  name: string
  displayName: string
  icon?: string
  category?: string
  searchable: boolean
  selectable: boolean
  fields: AssetField[]
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}

export interface AssetField {
  id: string
  name: string
  displayName: string
  type: FieldType
  required: boolean
  searchable: boolean
  displayInList: boolean
  displayInCard: boolean
  sortable: boolean
  width?: number
  order: number
  validation?: FieldValidation
  options?: FieldOption[]
  formatter?: FieldFormatter
  metadata?: Record<string, any>
}

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'integer' 
  | 'float' 
  | 'boolean' 
  | 'date' 
  | 'datetime' 
  | 'time' 
  | 'enum' 
  | 'array' 
  | 'object' 
  | 'json' 
  | 'url' 
  | 'email' 
  | 'ip' 
  | 'mac' 
  | 'uuid'

export interface FieldValidation {
  minLength?: number
  maxLength?: number
  minValue?: number
  maxValue?: number
  pattern?: string
  customRules?: string[]
}

export interface FieldOption {
  value: any
  label: string
  description?: string
  color?: string
  icon?: string
  disabled: boolean
  style?: Record<string, any>
}

export interface FieldFormatter {
  type: string
  template?: string
  dateFormat?: string
  precision?: number
  unit?: string
  options?: Record<string, any>
}

export interface Asset {
  id: string
  typeId: string
  typeName: string
  displayName: string
  status: AssetStatus
  attributes: Record<string, AssetAttributeValue>
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  tenantId?: string
  departmentId?: string
  ownerId?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export type AssetStatus = 'active' | 'inactive' | 'maintenance' | 'retired' | 'deleted'

export interface AssetAttributeValue {
  fieldId: string
  fieldName: string
  fieldType: FieldType
  value: any
  displayValue: string
  rawValue?: any
}

export interface AssetQuery {
  page: number
  pageSize: number
  typeIds?: string[]
  search?: string
  searchFields?: string[]
  attributeFilters?: AttributeFilter[]
  filterGroups?: FilterGroup[]
  sortFields?: SortField[]
  includeFields?: string[]
  excludeFields?: string[]
  withDetails?: boolean
  userId?: string
  tenantId?: string
}

export interface AttributeFilter {
  fieldId: string
  fieldName?: string
  operator: FilterOperator
  value?: any
  values?: any[]
}

export type FilterOperator = 
  | 'eq' 
  | 'ne' 
  | 'gt' 
  | 'lt' 
  | 'gte' 
  | 'lte' 
  | 'like' 
  | 'not_like' 
  | 'in' 
  | 'not_in' 
  | 'empty' 
  | 'not_empty'

export interface FilterGroup {
  logic: 'and' | 'or'
  filters: AttributeFilter[]
  groups?: FilterGroup[]
}

export interface SortField {
  fieldId: string
  fieldName?: string
  direction: 'asc' | 'desc'
  priority?: number
}

export interface AssetListResponse {
  total: number
  assets: Asset[]
  aggregations?: Record<string, any>
}

export interface AssetSelectorConfig {
  id: string
  name: string
  description: string
  
  // 显示配置
  displayMode: 'table' | 'card' | 'list'
  pageSize: number
  enableSearch: boolean
  enableFilter: boolean
  multiSelect: boolean
  showTypeFilter: boolean
  defaultTypeIds: string[]
  
  // 字段配置
  displayFields: string[]
  searchFields: string[]
  sortFields: SortField[]
  
  // 权限配置
  requirePermission: boolean
  allowedTypes: string[]
  
  // UI配置
  theme: string
  customStyles: Record<string, any>
  
  // 业务配置
  validationRules: string[]
  metadata: Record<string, any>
}

export interface AssetServiceConfig {
  // 服务端点配置
  endpoints: {
    getAssetTypes: string
    getAssets: string
    getAssetDetail: string
    getSearchSuggestions: string
    validateAssetSelection: string
  }
  
  // 认证配置
  authentication?: {
    type: 'jwt' | 'api_key' | 'oauth'
    config: Record<string, any>
  }
  
  // 缓存配置
  cache?: {
    enabled: boolean
    ttl: number
    strategy: 'memory' | 'localStorage' | 'sessionStorage'
  }
  
  // 请求配置
  request?: {
    timeout: number
    retryCount: number
    retryDelay: number
  }
}

export interface AssetSelectorProps {
  // 基础配置
  open: boolean
  title?: string
  width?: number | string
  height?: number | string
  
  // 选择配置
  multiple?: boolean
  selectedAssets?: Asset[]
  allowedTypes?: string[]
  maxSelection?: number
  minSelection?: number
  
  // 显示配置
  config?: Partial<AssetSelectorConfig>
  
  // 服务配置
  serviceConfig?: AssetServiceConfig
  
  // 权限配置
  userId?: string
  tenantId?: string
  
  // 事件处理
  onConfirm?: (assets: Asset[]) => void
  onCancel?: () => void
  onSelectionChange?: (assets: Asset[]) => void
  onTypeChange?: (typeId: string) => void
  onError?: (error: Error) => void
  
  // 样式配置
  className?: string
  style?: React.CSSProperties
}

export interface AssetSelectorRef {
  // 方法
  reset: () => void
  refresh: () => void
  clearSelection: () => void
  selectAssets: (assets: Asset[]) => void
  getSelectedAssets: () => Asset[]
  
  // 状态
  isLoading: boolean
  selectedCount: number
  totalCount: number
}

// 插件相关类型
export interface SelectorPlugin {
  name: string
  version: string
  description?: string
  
  // 生命周期钩子
  onInit?: (context: PluginContext) => void | Promise<void>
  onDestroy?: (context: PluginContext) => void | Promise<void>
  
  // 事件钩子
  onBeforeSearch?: (query: AssetQuery, context: PluginContext) => AssetQuery | Promise<AssetQuery>
  onAfterSearch?: (response: AssetListResponse, context: PluginContext) => AssetListResponse | Promise<AssetListResponse>
  onBeforeSelect?: (assets: Asset[], context: PluginContext) => boolean | Promise<boolean>
  onAfterSelect?: (assets: Asset[], context: PluginContext) => void | Promise<void>
  
  // UI扩展
  renderToolbar?: (context: PluginContext) => React.ReactNode
  renderFilter?: (context: PluginContext) => React.ReactNode
  renderAssetCard?: (asset: Asset, context: PluginContext) => React.ReactNode
  
  // 配置
  config?: Record<string, any>
}

export interface PluginContext {
  // 选择器实例
  selector: AssetSelectorRef
  
  // 当前状态
  currentQuery: AssetQuery
  currentAssets: Asset[]
  selectedAssets: Asset[]
  
  // 配置
  config: AssetSelectorConfig
  serviceConfig: AssetServiceConfig
  
  // 工具方法
  updateQuery: (query: Partial<AssetQuery>) => void
  refreshAssets: () => Promise<void>
  showMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void
  
  // 服务方法
  assetService: AssetService
}

export interface AssetService {
  getAssetTypes(filter?: Partial<AssetQuery>): Promise<AssetType[]>
  getAssets(query: AssetQuery): Promise<AssetListResponse>
  getAssetDetail(id: string): Promise<Asset>
  getSearchSuggestions(input: string, context?: any): Promise<Suggestion[]>
  validateAssetSelection(assets: Asset[]): Promise<ValidationResult>
}

export interface Suggestion {
  value: string
  label: string
  type: string
  description?: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  code: string
  message: string
  field?: string
  assetId?: string
}

export interface ValidationWarning {
  code: string
  message: string
  assetId?: string
}

// 主题相关类型
export interface AssetSelectorTheme {
  name: string
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  typography: {
    fontSize: {
      xs: number
      sm: number
      md: number
      lg: number
      xl: number
    }
    fontWeight: {
      normal: number
      medium: number
      bold: number
    }
  }
  borderRadius: {
    sm: number
    md: number
    lg: number
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
}

// 事件类型
export interface AssetSelectorEvent {
  type: 'selection_change' | 'type_change' | 'search' | 'filter' | 'error'
  data: any
  timestamp: number
}

export type AssetSelectorEventHandler = (event: AssetSelectorEvent) => void