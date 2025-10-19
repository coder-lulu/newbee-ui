import { ref, computed } from 'vue'
import type { 
  AssetService, 
  AssetType, 
  Asset, 
  AssetQuery, 
  AssetListResponse, 
  Suggestion, 
  ValidationResult,
  AssetServiceConfig 
} from '../types'

// 默认服务配置
const defaultServiceConfig: AssetServiceConfig = {
  endpoints: {
    getAssetTypes: '/api/v1/assets/types',
    getAssets: '/api/v1/assets',
    getAssetDetail: '/api/v1/assets/:id',
    getSearchSuggestions: '/api/v1/assets/suggestions',
    validateAssetSelection: '/api/v1/assets/validate'
  },
  request: {
    timeout: 30000,
    retryCount: 3,
    retryDelay: 1000
  },
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    strategy: 'memory'
  }
}

class DefaultAssetService implements AssetService {
  private config: AssetServiceConfig
  private cache = new Map<string, { data: any; expiry: number }>()
  
  constructor(config?: Partial<AssetServiceConfig>) {
    this.config = { ...defaultServiceConfig, ...config }
  }
  
  async getAssetTypes(filter?: Partial<AssetQuery>): Promise<AssetType[]> {
    const cacheKey = `asset_types_${JSON.stringify(filter || {})}`
    
    // 检查缓存
    if (this.config.cache?.enabled) {
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached
    }
    
    try {
      const response = await this.request('GET', this.config.endpoints.getAssetTypes, {
        params: filter
      })
      
      const assetTypes = response.data || response
      
      // 设置缓存
      if (this.config.cache?.enabled) {
        this.setCache(cacheKey, assetTypes)
      }
      
      return assetTypes
    } catch (error) {
      console.error('获取资产类型失败:', error)
      throw new Error('获取资产类型失败')
    }
  }
  
  async getAssets(query: AssetQuery): Promise<AssetListResponse> {
    const cacheKey = `assets_${JSON.stringify(query)}`
    
    // 检查缓存（资产列表缓存时间较短）
    if (this.config.cache?.enabled && query.page === 1) {
      const cached = this.getFromCache(cacheKey, 60000) // 1分钟缓存
      if (cached) return cached
    }
    
    try {
      const response = await this.request('POST', this.config.endpoints.getAssets, {
        data: query
      })
      
      const result: AssetListResponse = {
        total: response.total || 0,
        assets: response.data || response.assets || [],
        aggregations: response.aggregations
      }
      
      // 设置缓存
      if (this.config.cache?.enabled && query.page === 1) {
        this.setCache(cacheKey, result, 60000)
      }
      
      return result
    } catch (error) {
      console.error('获取资产列表失败:', error)
      throw new Error('获取资产列表失败')
    }
  }
  
  async getAssetDetail(id: string): Promise<Asset> {
    const cacheKey = `asset_detail_${id}`
    
    // 检查缓存
    if (this.config.cache?.enabled) {
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached
    }
    
    try {
      const url = this.config.endpoints.getAssetDetail.replace(':id', id)
      const response = await this.request('GET', url)
      
      const asset = response.data || response
      
      // 设置缓存
      if (this.config.cache?.enabled) {
        this.setCache(cacheKey, asset)
      }
      
      return asset
    } catch (error) {
      console.error('获取资产详情失败:', error)
      throw new Error('获取资产详情失败')
    }
  }
  
  async getSearchSuggestions(input: string, context?: any): Promise<Suggestion[]> {
    if (!input || input.length < 2) {
      return []
    }
    
    try {
      const response = await this.request('GET', this.config.endpoints.getSearchSuggestions, {
        params: { 
          input,
          context: context ? JSON.stringify(context) : undefined
        }
      })
      
      return response.data || response || []
    } catch (error) {
      console.error('获取搜索建议失败:', error)
      return []
    }
  }
  
  async validateAssetSelection(assets: Asset[]): Promise<ValidationResult> {
    try {
      const response = await this.request('POST', this.config.endpoints.validateAssetSelection, {
        data: { assets }
      })
      
      return response.data || response || { valid: true, errors: [], warnings: [] }
    } catch (error) {
      console.error('验证资产选择失败:', error)
      return {
        valid: false,
        errors: [{ code: 'VALIDATION_ERROR', message: '验证失败，请重试' }],
        warnings: []
      }
    }
  }
  
  private async request(method: string, url: string, options: any = {}): Promise<any> {
    const { timeout = 30000, retryCount = 3, retryDelay = 1000 } = this.config.request || {}
    
    let lastError: Error
    
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)
        
        const requestOptions: RequestInit = {
          method,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders()
          }
        }
        
        if (method === 'POST' && options.data) {
          requestOptions.body = JSON.stringify(options.data)
        }
        
        let requestUrl = url
        if (method === 'GET' && options.params) {
          const params = new URLSearchParams()
          Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, String(value))
            }
          })
          if (params.toString()) {
            requestUrl += (url.includes('?') ? '&' : '?') + params.toString()
          }
        }
        
        const response = await fetch(requestUrl, requestOptions)
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        return await response.json()
        
      } catch (error) {
        lastError = error as Error
        
        if (attempt < retryCount) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
          continue
        }
        
        break
      }
    }
    
    throw lastError!
  }
  
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}
    
    if (this.config.authentication) {
      switch (this.config.authentication.type) {
        case 'jwt':
          const token = this.config.authentication.config.token || 
                       localStorage.getItem('access_token') ||
                       sessionStorage.getItem('access_token')
          if (token) {
            headers.Authorization = `Bearer ${token}`
          }
          break
        
        case 'api_key':
          const apiKey = this.config.authentication.config.apiKey
          const headerName = this.config.authentication.config.headerName || 'X-API-Key'
          if (apiKey) {
            headers[headerName] = apiKey
          }
          break
      }
    }
    
    return headers
  }
  
  private getFromCache(key: string, customTtl?: number): any {
    if (!this.config.cache?.enabled) return null
    
    const cached = this.cache.get(key)
    if (!cached) return null
    
    const ttl = customTtl || this.config.cache.ttl || 300000
    if (Date.now() > cached.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }
  
  private setCache(key: string, data: any, customTtl?: number): void {
    if (!this.config.cache?.enabled) return
    
    const ttl = customTtl || this.config.cache.ttl || 300000
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    })
  }
  
  // 清理过期缓存
  private cleanupCache(): void {
    const now = Date.now()
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

// CMDB 适配服务
class CMDBAssetService extends DefaultAssetService {
  constructor(config?: Partial<AssetServiceConfig>) {
    // CMDB 特定的端点配置
    const cmdbConfig: Partial<AssetServiceConfig> = {
      endpoints: {
        getAssetTypes: '/api/cmdb/v1/ci-types',
        getAssets: '/api/cmdb/v1/cis',
        getAssetDetail: '/api/cmdb/v1/cis/:id/detail',
        getSearchSuggestions: '/api/cmdb/v1/cis/suggestions',
        validateAssetSelection: '/api/cmdb/v1/cis/validate'
      },
      ...config
    }
    
    super(cmdbConfig)
  }
  
  async getAssetTypes(filter?: Partial<AssetQuery>): Promise<AssetType[]> {
    // 调用父类方法获取原始数据
    const response = await super.getAssetTypes(filter)
    
    // 转换 CMDB 数据格式为通用格式
    return this.transformCiTypesToAssetTypes(response)
  }
  
  async getAssets(query: AssetQuery): Promise<AssetListResponse> {
    // 转换查询参数为 CMDB 格式
    const cmdbQuery = this.transformQueryToCmdbFormat(query)
    
    // 调用父类方法
    const response = await super.getAssets(cmdbQuery)
    
    // 转换响应数据为通用格式
    return this.transformCmdbResponseToAssetResponse(response)
  }
  
  private transformCiTypesToAssetTypes(ciTypes: any[]): AssetType[] {
    return ciTypes.map(ciType => ({
      id: String(ciType.id),
      name: ciType.name,
      displayName: ciType.alias || ciType.name,
      icon: ciType.icon,
      category: ciType.category,
      searchable: true,
      selectable: true,
      fields: [], // 字段定义需要额外请求
      createdAt: new Date(ciType.createdAt).toISOString(),
      updatedAt: new Date(ciType.updatedAt).toISOString(),
      metadata: {
        originalData: ciType
      }
    }))
  }
  
  private transformQueryToCmdbFormat(query: AssetQuery): AssetQuery {
    return {
      ...query,
      // 转换类型ID为数字
      typeIds: query.typeIds?.map(id => id),
      // 其他 CMDB 特定转换
    }
  }
  
  private transformCmdbResponseToAssetResponse(response: any): AssetListResponse {
    return {
      total: response.total,
      assets: response.data?.map(this.transformCisToAsset) || [],
      aggregations: response.aggregations
    }
  }
  
  private transformCisToAsset(cisInfo: any): Asset {
    const attributes: Record<string, any> = {}
    
    // 转换属性值
    if (cisInfo.attributes) {
      cisInfo.attributes.forEach((attr: any) => {
        attributes[attr.attrName] = {
          fieldId: String(attr.attrId),
          fieldName: attr.attrName,
          fieldType: this.mapCmdbValueType(attr.valueType),
          value: attr.value,
          displayValue: attr.value,
          rawValue: attr.rawValue
        }
      })
    }
    
    return {
      id: String(cisInfo.id),
      typeId: String(cisInfo.typeId),
      typeName: cisInfo.typeName || '',
      displayName: this.generateDisplayName(cisInfo, attributes),
      status: this.mapCisStatus(cisInfo.status),
      attributes,
      createdAt: new Date(cisInfo.createdAt).toISOString(),
      updatedAt: new Date(cisInfo.updatedAt).toISOString(),
      createdBy: cisInfo.createdBy || '',
      updatedBy: cisInfo.updatedBy || '',
      tenantId: cisInfo.tenantId ? String(cisInfo.tenantId) : undefined,
      metadata: {
        originalData: cisInfo
      }
    }
  }
  
  private mapCmdbValueType(valueType: string): string {
    const typeMap: Record<string, string> = {
      'text': 'text',
      'varchar': 'text',
      'int': 'integer',
      'integer': 'integer',
      'float': 'float',
      'decimal': 'float',
      'bool': 'boolean',
      'boolean': 'boolean',
      'date': 'date',
      'datetime': 'datetime',
      'time': 'time',
      'json': 'json'
    }
    
    return typeMap[valueType.toLowerCase()] || 'text'
  }
  
  private mapCisStatus(status: number): string {
    const statusMap: Record<number, string> = {
      1: 'active',
      2: 'inactive',
      3: 'maintenance',
      4: 'retired',
      5: 'deleted'
    }
    
    return statusMap[status] || 'active'
  }
  
  private generateDisplayName(cisInfo: any, attributes: Record<string, any>): string {
    // 优先使用常见的名称字段
    const nameFields = ['name', 'hostname', 'ip', 'title', 'label']
    
    for (const field of nameFields) {
      const attr = attributes[field]
      if (attr && attr.value) {
        return String(attr.value)
      }
    }
    
    return `Asset-${cisInfo.id}`
  }
}

// 模拟服务（用于开发和测试）
class MockAssetService implements AssetService {
  private mockAssetTypes: AssetType[] = [
    {
      id: '1',
      name: 'server',
      displayName: '服务器',
      icon: 'server',
      category: 'infrastructure',
      searchable: true,
      selectable: true,
      fields: [
        {
          id: '1',
          name: 'hostname',
          displayName: '主机名',
          type: 'text',
          required: true,
          searchable: true,
          displayInList: true,
          displayInCard: true,
          sortable: true,
          order: 1
        },
        {
          id: '2',
          name: 'ip',
          displayName: 'IP地址',
          type: 'ip',
          required: true,
          searchable: true,
          displayInList: true,
          displayInCard: true,
          sortable: true,
          order: 2
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
  
  private mockAssets: Asset[] = [
    {
      id: '1',
      typeId: '1',
      typeName: 'server',
      displayName: 'web-server-01',
      status: 'active',
      attributes: {
        hostname: {
          fieldId: '1',
          fieldName: 'hostname',
          fieldType: 'text',
          value: 'web-server-01',
          displayValue: 'web-server-01'
        },
        ip: {
          fieldId: '2',
          fieldName: 'ip',
          fieldType: 'ip',
          value: '192.168.1.100',
          displayValue: '192.168.1.100'
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin'
    }
  ]
  
  async getAssetTypes(): Promise<AssetType[]> {
    await this.delay(300)
    return [...this.mockAssetTypes]
  }
  
  async getAssets(query: AssetQuery): Promise<AssetListResponse> {
    await this.delay(500)
    
    let filteredAssets = [...this.mockAssets]
    
    // 应用类型过滤
    if (query.typeIds?.length) {
      filteredAssets = filteredAssets.filter(asset => 
        query.typeIds!.includes(asset.typeId)
      )
    }
    
    // 应用搜索过滤
    if (query.search) {
      const searchLower = query.search.toLowerCase()
      filteredAssets = filteredAssets.filter(asset =>
        asset.displayName.toLowerCase().includes(searchLower) ||
        Object.values(asset.attributes).some(attr =>
          String(attr.value).toLowerCase().includes(searchLower)
        )
      )
    }
    
    // 分页
    const start = (query.page - 1) * query.pageSize
    const end = start + query.pageSize
    const pageAssets = filteredAssets.slice(start, end)
    
    return {
      total: filteredAssets.length,
      assets: pageAssets
    }
  }
  
  async getAssetDetail(id: string): Promise<Asset> {
    await this.delay(200)
    
    const asset = this.mockAssets.find(a => a.id === id)
    if (!asset) {
      throw new Error(`Asset not found: ${id}`)
    }
    
    return { ...asset }
  }
  
  async getSearchSuggestions(input: string): Promise<Suggestion[]> {
    await this.delay(200)
    
    if (input.length < 2) return []
    
    const suggestions: Suggestion[] = []
    
    // 基于资产名称生成建议
    this.mockAssets.forEach(asset => {
      if (asset.displayName.toLowerCase().includes(input.toLowerCase())) {
        suggestions.push({
          value: asset.displayName,
          label: asset.displayName,
          type: 'asset',
          description: `${asset.typeName} - ${asset.displayName}`
        })
      }
    })
    
    return suggestions.slice(0, 10)
  }
  
  async validateAssetSelection(assets: Asset[]): Promise<ValidationResult> {
    await this.delay(100)
    
    const errors = []
    const warnings = []
    
    // 检查重复选择
    const assetIds = assets.map(a => a.id)
    const duplicates = assetIds.filter((id, index) => assetIds.indexOf(id) !== index)
    if (duplicates.length > 0) {
      errors.push({
        code: 'DUPLICATE_ASSETS',
        message: '存在重复选择的资产'
      })
    }
    
    // 检查状态
    const inactiveAssets = assets.filter(a => a.status !== 'active')
    if (inactiveAssets.length > 0) {
      warnings.push({
        code: 'INACTIVE_ASSETS',
        message: `${inactiveAssets.length} 个资产状态非活跃`
      })
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export function useAssetService(config?: Partial<AssetServiceConfig>) {
  const serviceConfig = ref({ ...defaultServiceConfig, ...config })
  
  // 根据配置创建不同的服务实例
  const assetService = computed(() => {
    const mode = serviceConfig.value.mode || 'default'
    
    switch (mode) {
      case 'cmdb':
        return new CMDBAssetService(serviceConfig.value)
      case 'mock':
        return new MockAssetService()
      default:
        return new DefaultAssetService(serviceConfig.value)
    }
  })
  
  return {
    assetService,
    serviceConfig
  }
}