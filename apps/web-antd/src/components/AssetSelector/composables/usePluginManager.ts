import { ref, computed, type Ref } from 'vue'
import type { 
  SelectorPlugin, 
  PluginContext, 
  AssetSelectorRef,
  AssetQuery,
  AssetListResponse,
  Asset,
  AssetSelectorConfig,
  AssetServiceConfig
} from '../types'

export interface PluginManager {
  // 插件管理
  registerPlugin(plugin: SelectorPlugin): void
  unregisterPlugin(name: string): void
  getPlugin(name: string): SelectorPlugin | undefined
  getAllPlugins(): SelectorPlugin[]
  
  // 生命周期
  init(context: PluginContext): Promise<void>
  destroy(): void
  
  // 事件钩子
  beforeSearch(query: AssetQuery): Promise<AssetQuery>
  afterSearch(response: AssetListResponse): Promise<AssetListResponse>
  beforeSelect(assets: Asset[]): Promise<boolean>
  afterSelect(assets: Asset[]): Promise<void>
  
  // UI 组件
  getToolbarComponent(): any
  getFilterComponent(): any
  renderAssetCard(asset: Asset): any
}

class DefaultPluginManager implements PluginManager {
  private plugins = new Map<string, SelectorPlugin>()
  private context: PluginContext | null = null
  
  registerPlugin(plugin: SelectorPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`插件 ${plugin.name} 已存在，将被覆盖`)
    }
    
    this.plugins.set(plugin.name, plugin)
    
    // 如果已经初始化，立即初始化新插件
    if (this.context) {
      plugin.onInit?.(this.context)
    }
  }
  
  unregisterPlugin(name: string): void {
    const plugin = this.plugins.get(name)
    if (plugin) {
      if (this.context) {
        plugin.onDestroy?.(this.context)
      }
      this.plugins.delete(name)
    }
  }
  
  getPlugin(name: string): SelectorPlugin | undefined {
    return this.plugins.get(name)
  }
  
  getAllPlugins(): SelectorPlugin[] {
    return Array.from(this.plugins.values())
  }
  
  async init(context: PluginContext): Promise<void> {
    this.context = context
    
    // 初始化所有插件
    for (const plugin of this.plugins.values()) {
      try {
        await plugin.onInit?.(context)
      } catch (error) {
        console.error(`插件 ${plugin.name} 初始化失败:`, error)
      }
    }
  }
  
  destroy(): void {
    if (!this.context) return
    
    // 销毁所有插件
    for (const plugin of this.plugins.values()) {
      try {
        plugin.onDestroy?.(this.context)
      } catch (error) {
        console.error(`插件 ${plugin.name} 销毁失败:`, error)
      }
    }
    
    this.context = null
  }
  
  async beforeSearch(query: AssetQuery): Promise<AssetQuery> {
    if (!this.context) return query
    
    let processedQuery = { ...query }
    
    for (const plugin of this.plugins.values()) {
      if (plugin.onBeforeSearch) {
        try {
          processedQuery = await plugin.onBeforeSearch(processedQuery, this.context) || processedQuery
        } catch (error) {
          console.error(`插件 ${plugin.name} beforeSearch 钩子执行失败:`, error)
        }
      }
    }
    
    return processedQuery
  }
  
  async afterSearch(response: AssetListResponse): Promise<AssetListResponse> {
    if (!this.context) return response
    
    let processedResponse = { ...response }
    
    for (const plugin of this.plugins.values()) {
      if (plugin.onAfterSearch) {
        try {
          processedResponse = await plugin.onAfterSearch(processedResponse, this.context) || processedResponse
        } catch (error) {
          console.error(`插件 ${plugin.name} afterSearch 钩子执行失败:`, error)
        }
      }
    }
    
    return processedResponse
  }
  
  async beforeSelect(assets: Asset[]): Promise<boolean> {
    if (!this.context) return true
    
    for (const plugin of this.plugins.values()) {
      if (plugin.onBeforeSelect) {
        try {
          const result = await plugin.onBeforeSelect(assets, this.context)
          if (result === false) {
            return false
          }
        } catch (error) {
          console.error(`插件 ${plugin.name} beforeSelect 钩子执行失败:`, error)
          return false
        }
      }
    }
    
    return true
  }
  
  async afterSelect(assets: Asset[]): Promise<void> {
    if (!this.context) return
    
    for (const plugin of this.plugins.values()) {
      if (plugin.onAfterSelect) {
        try {
          await plugin.onAfterSelect(assets, this.context)
        } catch (error) {
          console.error(`插件 ${plugin.name} afterSelect 钩子执行失败:`, error)
        }
      }
    }
  }
  
  getToolbarComponent(): any {
    if (!this.context) return null
    
    const toolbarPlugins = Array.from(this.plugins.values())
      .filter(plugin => plugin.renderToolbar)
    
    if (toolbarPlugins.length === 0) return null
    
    // 返回组合工具栏组件
    return {
      render: () => {
        return toolbarPlugins.map(plugin => {
          try {
            return plugin.renderToolbar!(this.context!)
          } catch (error) {
            console.error(`插件 ${plugin.name} renderToolbar 失败:`, error)
            return null
          }
        }).filter(Boolean)
      }
    }
  }
  
  getFilterComponent(): any {
    if (!this.context) return null
    
    const filterPlugins = Array.from(this.plugins.values())
      .filter(plugin => plugin.renderFilter)
    
    if (filterPlugins.length === 0) return null
    
    // 返回组合过滤器组件
    return {
      render: () => {
        return filterPlugins.map(plugin => {
          try {
            return plugin.renderFilter!(this.context!)
          } catch (error) {
            console.error(`插件 ${plugin.name} renderFilter 失败:`, error)
            return null
          }
        }).filter(Boolean)
      }
    }
  }
  
  renderAssetCard(asset: Asset): any {
    if (!this.context) return null
    
    const cardPlugins = Array.from(this.plugins.values())
      .filter(plugin => plugin.renderAssetCard)
    
    // 找到第一个能渲染该资产的插件
    for (const plugin of cardPlugins) {
      try {
        const rendered = plugin.renderAssetCard!(asset, this.context)
        if (rendered) return rendered
      } catch (error) {
        console.error(`插件 ${plugin.name} renderAssetCard 失败:`, error)
      }
    }
    
    return null
  }
}

// 全局插件管理器实例
const globalPluginManager = new DefaultPluginManager()

export function usePluginManager() {
  const pluginManager = ref<PluginManager>(globalPluginManager)
  
  // 插件上下文
  const pluginContext = ref<PluginContext>({
    selector: {} as AssetSelectorRef,
    currentQuery: {} as AssetQuery,
    currentAssets: [],
    selectedAssets: [],
    config: {} as AssetSelectorConfig,
    serviceConfig: {} as AssetServiceConfig,
    updateQuery: () => {},
    refreshAssets: async () => {},
    showMessage: () => {},
    assetService: {} as any
  })
  
  return {
    pluginManager,
    pluginContext
  }
}

// 默认插件注册函数
export function registerDefaultPlugins() {
  // CMDB 插件
  const cmdbPlugin: SelectorPlugin = {
    name: 'cmdb',
    version: '1.0.0',
    description: 'CMDB 资产选择器插件',
    
    async onBeforeSelect(assets: Asset[], context: PluginContext): Promise<boolean> {
      // 检查 CMDB 特定的选择规则
      for (const asset of assets) {
        if (asset.status === 'maintenance') {
          context.showMessage('warning', `资产 ${asset.displayName} 正在维护中，可能无法正常使用`)
        }
      }
      return true
    },
    
    async onAfterSelect(assets: Asset[], context: PluginContext): Promise<void> {
      // 记录 CMDB 选择日志
      console.log('CMDB 资产选择:', assets.map(a => a.id))
    }
  }
  
  // 权限验证插件
  const permissionPlugin: SelectorPlugin = {
    name: 'permission',
    version: '1.0.0',
    description: '权限验证插件',
    
    async onBeforeSelect(assets: Asset[], context: PluginContext): Promise<boolean> {
      // 检查权限
      const restrictedAssets = assets.filter(asset => 
        asset.metadata?.restricted === true
      )
      
      if (restrictedAssets.length > 0) {
        context.showMessage('error', '您没有权限选择某些受限资产')
        return false
      }
      
      return true
    }
  }
  
  // 数据验证插件
  const validationPlugin: SelectorPlugin = {
    name: 'validation',
    version: '1.0.0',
    description: '数据验证插件',
    
    async onBeforeSelect(assets: Asset[], context: PluginContext): Promise<boolean> {
      // 验证资产数据完整性
      const invalidAssets = assets.filter(asset => !asset.id || !asset.typeId)
      
      if (invalidAssets.length > 0) {
        context.showMessage('error', '选择的资产数据不完整，请刷新后重试')
        return false
      }
      
      return true
    }
  }
  
  // 注册默认插件
  globalPluginManager.registerPlugin(cmdbPlugin)
  globalPluginManager.registerPlugin(permissionPlugin)
  globalPluginManager.registerPlugin(validationPlugin)
}

// 插件工厂函数
export function createPlugin(options: {
  name: string
  version?: string
  description?: string
  config?: Record<string, any>
  hooks?: Partial<Pick<SelectorPlugin, 'onInit' | 'onDestroy' | 'onBeforeSearch' | 'onAfterSearch' | 'onBeforeSelect' | 'onAfterSelect'>>
  renders?: Partial<Pick<SelectorPlugin, 'renderToolbar' | 'renderFilter' | 'renderAssetCard'>>
}): SelectorPlugin {
  return {
    name: options.name,
    version: options.version || '1.0.0',
    description: options.description,
    config: options.config,
    ...options.hooks,
    ...options.renders
  }
}

// 插件装饰器（用于类组件）
export function AssetSelectorPlugin(options: {
  name: string
  version?: string
  description?: string
}) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    const instance = new constructor()
    
    const plugin: SelectorPlugin = {
      name: options.name,
      version: options.version || '1.0.0',
      description: options.description,
      
      onInit: instance.onInit?.bind(instance),
      onDestroy: instance.onDestroy?.bind(instance),
      onBeforeSearch: instance.onBeforeSearch?.bind(instance),
      onAfterSearch: instance.onAfterSearch?.bind(instance),
      onBeforeSelect: instance.onBeforeSelect?.bind(instance),
      onAfterSelect: instance.onAfterSelect?.bind(instance),
      renderToolbar: instance.renderToolbar?.bind(instance),
      renderFilter: instance.renderFilter?.bind(instance),
      renderAssetCard: instance.renderAssetCard?.bind(instance),
      
      config: instance.config
    }
    
    globalPluginManager.registerPlugin(plugin)
    
    return constructor
  }
}

// 插件状态管理
export function usePluginState<T = any>(pluginName: string, initialState: T) {
  const state = ref<T>(initialState)
  const stateKey = `plugin_${pluginName}_state`
  
  // 从 localStorage 恢复状态
  const savedState = localStorage.getItem(stateKey)
  if (savedState) {
    try {
      state.value = JSON.parse(savedState)
    } catch (error) {
      console.warn(`恢复插件 ${pluginName} 状态失败:`, error)
    }
  }
  
  // 保存状态到 localStorage
  const saveState = () => {
    try {
      localStorage.setItem(stateKey, JSON.stringify(state.value))
    } catch (error) {
      console.warn(`保存插件 ${pluginName} 状态失败:`, error)
    }
  }
  
  // 清除状态
  const clearState = () => {
    state.value = initialState
    localStorage.removeItem(stateKey)
  }
  
  return {
    state,
    saveState,
    clearState
  }
}

// 插件配置管理
export function usePluginConfig<T = any>(pluginName: string, defaultConfig: T) {
  const config = ref<T>({ ...defaultConfig })
  const configKey = `plugin_${pluginName}_config`
  
  // 加载配置
  const loadConfig = () => {
    const savedConfig = localStorage.getItem(configKey)
    if (savedConfig) {
      try {
        config.value = { ...defaultConfig, ...JSON.parse(savedConfig) }
      } catch (error) {
        console.warn(`加载插件 ${pluginName} 配置失败:`, error)
      }
    }
  }
  
  // 保存配置
  const saveConfig = () => {
    try {
      localStorage.setItem(configKey, JSON.stringify(config.value))
    } catch (error) {
      console.warn(`保存插件 ${pluginName} 配置失败:`, error)
    }
  }
  
  // 重置配置
  const resetConfig = () => {
    config.value = { ...defaultConfig }
    localStorage.removeItem(configKey)
  }
  
  // 初始加载
  loadConfig()
  
  return {
    config,
    loadConfig,
    saveConfig,
    resetConfig
  }
}

// 插件通信
export function usePluginCommunication() {
  const eventBus = new Map<string, Array<(data: any) => void>>()
  
  const emit = (event: string, data?: any) => {
    const listeners = eventBus.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`插件事件 ${event} 处理失败:`, error)
        }
      })
    }
  }
  
  const on = (event: string, listener: (data: any) => void) => {
    if (!eventBus.has(event)) {
      eventBus.set(event, [])
    }
    eventBus.get(event)!.push(listener)
  }
  
  const off = (event: string, listener: (data: any) => void) => {
    const listeners = eventBus.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }
  
  const clear = () => {
    eventBus.clear()
  }
  
  return {
    emit,
    on,
    off,
    clear
  }
}