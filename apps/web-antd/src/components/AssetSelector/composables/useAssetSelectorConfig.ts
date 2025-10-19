import { ref, computed, type Ref } from 'vue'
import type { AssetSelectorConfig } from '../types'

// 默认配置
const defaultConfig: AssetSelectorConfig = {
  id: 'default',
  name: '默认资产选择器',
  description: '通用资产选择器默认配置',
  
  // 显示配置
  displayMode: 'table',
  pageSize: 20,
  enableSearch: true,
  enableFilter: true,
  multiSelect: false,
  showTypeFilter: true,
  defaultTypeIds: [],
  
  // 字段配置
  displayFields: ['name', 'ip', 'hostname', 'status'],
  searchFields: ['name', 'ip', 'hostname'],
  sortFields: [
    {
      fieldId: 'id',
      fieldName: 'id',
      direction: 'desc',
      priority: 1
    }
  ],
  
  // 权限配置
  requirePermission: true,
  allowedTypes: [],
  
  // UI配置
  theme: 'default',
  customStyles: {},
  
  // 业务配置
  validationRules: [],
  metadata: {},
  
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// 预设配置模板
const configTemplates: Record<string, Partial<AssetSelectorConfig>> = {
  // 简单模式
  simple: {
    displayMode: 'card',
    enableFilter: false,
    showTypeFilter: false,
    displayFields: ['name', 'status'],
    searchFields: ['name']
  },
  
  // 高级模式
  advanced: {
    displayMode: 'table',
    enableFilter: true,
    showTypeFilter: true,
    displayFields: ['name', 'ip', 'hostname', 'status', 'owner', 'department'],
    searchFields: ['name', 'ip', 'hostname', 'description']
  },
  
  // 紧凑模式
  compact: {
    displayMode: 'list',
    pageSize: 50,
    showTypeFilter: false,
    displayFields: ['name', 'status'],
    searchFields: ['name']
  },
  
  // 只读模式
  readonly: {
    multiSelect: false,
    enableFilter: false,
    displayFields: ['name', 'type', 'status'],
    searchFields: ['name']
  },
  
  // CMDB特定配置
  cmdb: {
    displayMode: 'table',
    enableFilter: true,
    showTypeFilter: true,
    displayFields: ['name', 'ip', 'hostname', 'status', 'heartbeat'],
    searchFields: ['name', 'ip', 'hostname'],
    requirePermission: true,
    validationRules: ['cmdb_validation'],
    metadata: {
      source: 'cmdb',
      enableRelationship: true
    }
  },
  
  // 移动端优化
  mobile: {
    displayMode: 'card',
    pageSize: 10,
    showTypeFilter: false,
    displayFields: ['name', 'status'],
    searchFields: ['name'],
    customStyles: {
      cardSize: 'small',
      responsive: true
    }
  }
}

export function useAssetSelectorConfig(userConfig?: Partial<AssetSelectorConfig>) {
  const config = ref<AssetSelectorConfig>({ ...defaultConfig })
  
  // 合并用户配置
  const computedConfig = computed(() => {
    if (!userConfig) return config.value
    
    return {
      ...config.value,
      ...userConfig,
      // 深度合并某些对象字段
      customStyles: {
        ...config.value.customStyles,
        ...userConfig.customStyles
      },
      metadata: {
        ...config.value.metadata,
        ...userConfig.metadata
      }
    }
  })
  
  // 应用配置模板
  const applyTemplate = (templateName: string) => {
    const template = configTemplates[templateName]
    if (template) {
      config.value = {
        ...config.value,
        ...template,
        id: `${templateName}_${Date.now()}`,
        name: `${template.name || templateName} 配置`,
        updatedAt: new Date().toISOString()
      }
    }
  }
  
  // 重置配置
  const resetConfig = () => {
    config.value = { ...defaultConfig }
  }
  
  // 保存配置到本地存储
  const saveConfig = (configId: string) => {
    try {
      const configToSave = {
        ...computedConfig.value,
        id: configId,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem(`asset_selector_config_${configId}`, JSON.stringify(configToSave))
      return true
    } catch (error) {
      console.error('保存配置失败:', error)
      return false
    }
  }
  
  // 从本地存储加载配置
  const loadConfig = (configId: string): boolean => {
    try {
      const saved = localStorage.getItem(`asset_selector_config_${configId}`)
      if (saved) {
        const parsedConfig = JSON.parse(saved)
        config.value = { ...defaultConfig, ...parsedConfig }
        return true
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    }
    return false
  }
  
  // 导出配置
  const exportConfig = (): string => {
    return JSON.stringify(computedConfig.value, null, 2)
  }
  
  // 导入配置
  const importConfig = (configJson: string): boolean => {
    try {
      const importedConfig = JSON.parse(configJson)
      // 验证配置格式
      if (validateConfig(importedConfig)) {
        config.value = { ...defaultConfig, ...importedConfig }
        return true
      }
    } catch (error) {
      console.error('导入配置失败:', error)
    }
    return false
  }
  
  // 配置验证
  const validateConfig = (configToValidate: any): boolean => {
    const requiredFields = ['displayMode', 'pageSize', 'displayFields']
    
    for (const field of requiredFields) {
      if (!(field in configToValidate)) {
        console.error(`配置缺少必需字段: ${field}`)
        return false
      }
    }
    
    // 验证displayMode
    const validDisplayModes = ['table', 'card', 'list']
    if (!validDisplayModes.includes(configToValidate.displayMode)) {
      console.error(`无效的显示模式: ${configToValidate.displayMode}`)
      return false
    }
    
    // 验证pageSize
    if (typeof configToValidate.pageSize !== 'number' || configToValidate.pageSize <= 0) {
      console.error(`无效的页面大小: ${configToValidate.pageSize}`)
      return false
    }
    
    // 验证displayFields
    if (!Array.isArray(configToValidate.displayFields)) {
      console.error('displayFields 必须是数组')
      return false
    }
    
    return true
  }
  
  // 获取可用的模板列表
  const getTemplates = () => {
    return Object.keys(configTemplates).map(key => ({
      id: key,
      name: configTemplates[key].name || key,
      description: configTemplates[key].description || `${key} 模式配置`
    }))
  }
  
  // 创建自定义配置
  const createCustomConfig = (options: {
    name: string
    description?: string
    baseTemplate?: string
    overrides?: Partial<AssetSelectorConfig>
  }) => {
    let baseConfig = { ...defaultConfig }
    
    // 如果指定了基础模板，先应用模板
    if (options.baseTemplate && configTemplates[options.baseTemplate]) {
      baseConfig = { ...baseConfig, ...configTemplates[options.baseTemplate] }
    }
    
    // 应用自定义覆盖
    if (options.overrides) {
      baseConfig = { ...baseConfig, ...options.overrides }
    }
    
    // 设置基本信息
    baseConfig.id = `custom_${Date.now()}`
    baseConfig.name = options.name
    baseConfig.description = options.description || ''
    baseConfig.createdAt = new Date().toISOString()
    baseConfig.updatedAt = new Date().toISOString()
    
    config.value = baseConfig
    return baseConfig
  }
  
  // 配置比较
  const compareConfig = (otherConfig: AssetSelectorConfig) => {
    const current = computedConfig.value
    const differences: Array<{
      field: string
      current: any
      other: any
    }> = []
    
    const compareFields = [
      'displayMode', 'pageSize', 'enableSearch', 'enableFilter',
      'multiSelect', 'showTypeFilter', 'displayFields', 'searchFields'
    ]
    
    compareFields.forEach(field => {
      const currentValue = (current as any)[field]
      const otherValue = (otherConfig as any)[field]
      
      if (JSON.stringify(currentValue) !== JSON.stringify(otherValue)) {
        differences.push({
          field,
          current: currentValue,
          other: otherValue
        })
      }
    })
    
    return differences
  }
  
  // 配置统计
  const getConfigStats = () => {
    const cfg = computedConfig.value
    
    return {
      displayFieldCount: cfg.displayFields.length,
      searchFieldCount: cfg.searchFields.length,
      sortFieldCount: cfg.sortFields.length,
      hasCustomStyles: Object.keys(cfg.customStyles).length > 0,
      hasMetadata: Object.keys(cfg.metadata).length > 0,
      hasValidationRules: cfg.validationRules.length > 0,
      permissionEnabled: cfg.requirePermission,
      features: {
        search: cfg.enableSearch,
        filter: cfg.enableFilter,
        multiSelect: cfg.multiSelect,
        typeFilter: cfg.showTypeFilter
      }
    }
  }
  
  return {
    config,
    computedConfig,
    applyTemplate,
    resetConfig,
    saveConfig,
    loadConfig,
    exportConfig,
    importConfig,
    validateConfig,
    getTemplates,
    createCustomConfig,
    compareConfig,
    getConfigStats
  }
}

// 配置构建器
export class AssetSelectorConfigBuilder {
  private config: Partial<AssetSelectorConfig> = {}
  
  static create() {
    return new AssetSelectorConfigBuilder()
  }
  
  displayMode(mode: 'table' | 'card' | 'list') {
    this.config.displayMode = mode
    return this
  }
  
  pageSize(size: number) {
    this.config.pageSize = size
    return this
  }
  
  enableSearch(enabled: boolean = true) {
    this.config.enableSearch = enabled
    return this
  }
  
  enableFilter(enabled: boolean = true) {
    this.config.enableFilter = enabled
    return this
  }
  
  multiSelect(enabled: boolean = true) {
    this.config.multiSelect = enabled
    return this
  }
  
  showTypeFilter(show: boolean = true) {
    this.config.showTypeFilter = show
    return this
  }
  
  displayFields(fields: string[]) {
    this.config.displayFields = [...fields]
    return this
  }
  
  searchFields(fields: string[]) {
    this.config.searchFields = [...fields]
    return this
  }
  
  allowedTypes(types: string[]) {
    this.config.allowedTypes = [...types]
    return this
  }
  
  theme(themeName: string) {
    this.config.theme = themeName
    return this
  }
  
  customStyle(key: string, value: any) {
    if (!this.config.customStyles) {
      this.config.customStyles = {}
    }
    this.config.customStyles[key] = value
    return this
  }
  
  metadata(key: string, value: any) {
    if (!this.config.metadata) {
      this.config.metadata = {}
    }
    this.config.metadata[key] = value
    return this
  }
  
  validation(rules: string[]) {
    this.config.validationRules = [...rules]
    return this
  }
  
  build(): AssetSelectorConfig {
    const finalConfig = {
      ...defaultConfig,
      ...this.config,
      id: `builder_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return finalConfig
  }
}

// 便捷的配置创建函数
export function createAssetSelectorConfig() {
  return AssetSelectorConfigBuilder.create()
}

// 响应式配置管理
export function useResponsiveConfig(baseConfig?: Partial<AssetSelectorConfig>) {
  const { config, computedConfig, applyTemplate } = useAssetSelectorConfig(baseConfig)
  const screenWidth = ref(window.innerWidth)
  
  // 监听屏幕大小变化
  const updateScreenWidth = () => {
    screenWidth.value = window.innerWidth
  }
  
  window.addEventListener('resize', updateScreenWidth)
  
  // 响应式配置
  const responsiveConfig = computed(() => {
    const base = computedConfig.value
    const width = screenWidth.value
    
    // 移动端适配
    if (width < 768) {
      return {
        ...base,
        displayMode: 'card' as const,
        pageSize: Math.min(base.pageSize, 10),
        showTypeFilter: false,
        displayFields: base.displayFields.slice(0, 3), // 只显示前3个字段
        customStyles: {
          ...base.customStyles,
          responsive: true,
          mobile: true
        }
      }
    }
    
    // 平板适配
    if (width < 1024) {
      return {
        ...base,
        pageSize: Math.min(base.pageSize, 15),
        displayFields: base.displayFields.slice(0, 5), // 只显示前5个字段
        customStyles: {
          ...base.customStyles,
          responsive: true,
          tablet: true
        }
      }
    }
    
    // 桌面端
    return {
      ...base,
      customStyles: {
        ...base.customStyles,
        responsive: true,
        desktop: true
      }
    }
  })
  
  return {
    config,
    responsiveConfig,
    screenWidth,
    applyTemplate
  }
}