<template>
  <Modal
    :open="open"
    :title="title"
    :width="width"
    :closable="true"
    :mask-closable="false"
    :class="['asset-selector-modal', className]"
    :style="style"
    @cancel="handleCancel"
  >
    <div class="asset-selector-container">
      <!-- 插件工具栏 -->
      <div v-if="pluginToolbar" class="plugin-toolbar">
        <component :is="pluginToolbar" :context="pluginContext" />
      </div>

      <!-- 资产类型过滤面板 -->
      <div v-if="computedConfig.showTypeFilter" class="asset-types-panel">
        <AssetTypeFilter
          :asset-types="assetTypes"
          :selected-type-id="selectedTypeId"
          :loading="typesLoading"
          @type-change="handleTypeChange"
        />
      </div>

      <!-- 主内容区域 -->
      <div class="asset-content-panel">
        <!-- 搜索工具栏 -->
        <div class="search-toolbar">
          <AssetSearchToolbar
            :config="computedConfig"
            :search-value="searchValue"
            :filter-count="activeFilterCount"
            :loading="assetsLoading"
            @search="handleSearch"
            @open-advanced-search="openAdvancedSearch"
            @reset="handleReset"
          />
        </div>

        <!-- 资产列表 -->
        <div class="asset-list-container">
          <AssetList
            :display-mode="computedConfig.displayMode"
            :assets="assets"
            :columns="dynamicColumns"
            :loading="assetsLoading"
            :pagination="pagination"
            :row-selection="rowSelection"
            :selected-assets="selectedAssets"
            @change="handleAssetListChange"
            @selection-change="handleSelectionChange"
          />
        </div>

        <!-- 插件过滤器 -->
        <div v-if="pluginFilter" class="plugin-filter">
          <component :is="pluginFilter" :context="pluginContext" />
        </div>
      </div>
    </div>

    <!-- 已选择资产显示 -->
    <AssetSelectionSummary
      v-if="selectedAssets.length > 0"
      :selected-assets="selectedAssets"
      :multiple="computedConfig.multiSelect"
      :max-selection="maxSelection"
      @remove="handleRemoveAsset"
      @clear="handleClearSelection"
    />

    <!-- 高级搜索抽屉 -->
    <AdvancedSearchDrawer
      :open="searchDrawerVisible"
      :asset-types="assetTypes"
      :current-type-id="selectedTypeId"
      :search-value="searchValue"
      :filters="attributeFilters"
      @close="closeAdvancedSearch"
      @search="handleAdvancedSearch"
      @reset="handleReset"
    />

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="footer-actions">
        <Space>
          <Button @click="handleCancel">
            {{ $t('cancel') }}
          </Button>
          <Button
            type="primary"
            :disabled="!isSelectionValid"
            :loading="validating"
            @click="handleConfirm"
          >
            {{ $t('confirm') }} ({{ selectedAssets.length }})
          </Button>
        </Space>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, provide } from 'vue'
import { Modal, Button, Space, message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

// 子组件导入
import AssetTypeFilter from './components/AssetTypeFilter.vue'
import AssetSearchToolbar from './components/AssetSearchToolbar.vue'
import AssetList from './components/AssetList.vue'
import AssetSelectionSummary from './components/AssetSelectionSummary.vue'
import AdvancedSearchDrawer from './components/AdvancedSearchDrawer.vue'

// 类型导入
import type {
  Asset,
  AssetType,
  AssetQuery,
  AssetSelectorProps,
  AssetSelectorConfig,
  SelectorPlugin,
  PluginContext,
  AssetSelectorRef,
  AttributeFilter,
  AssetSelectorEvent
} from './types'

// 服务导入
import { useAssetService } from './composables/useAssetService'
import { useAssetSelectorConfig } from './composables/useAssetSelectorConfig'
import { usePluginManager } from './composables/usePluginManager'
import { useAssetValidation } from './composables/useAssetValidation'

const { t } = useI18n()

// Props 定义
const props = withDefaults(defineProps<AssetSelectorProps>(), {
  title: () => t('selectAssets'),
  width: 1200,
  height: 800,
  multiple: false,
  selectedAssets: () => [],
  allowedTypes: () => [],
  maxSelection: 0,
  minSelection: 0,
  className: '',
  style: () => ({})
})

// Emits 定义
const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': [assets: Asset[]]
  'cancel': []
  'selection-change': [assets: Asset[]]
  'type-change': [typeId: string]
  'error': [error: Error]
}>()

// 响应式状态
const typesLoading = ref(false)
const assetsLoading = ref(false)
const validating = ref(false)
const searchDrawerVisible = ref(false)

const assetTypes = ref<AssetType[]>([])
const assets = ref<Asset[]>([])
const selectedAssets = ref<Asset[]>([...props.selectedAssets])
const selectedTypeId = ref<string>('')

const searchValue = ref('')
const attributeFilters = ref<AttributeFilter[]>([])
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} / ${total}`
})

// Composables
const { computedConfig } = useAssetSelectorConfig(props.config)
const { assetService } = useAssetService(props.serviceConfig)
const { pluginManager, pluginContext } = usePluginManager()
const { validateSelection } = useAssetValidation()

// 计算属性
const activeFilterCount = computed(() => attributeFilters.value.length)

const isSelectionValid = computed(() => {
  const count = selectedAssets.value.length
  
  if (props.minSelection > 0 && count < props.minSelection) {
    return false
  }
  
  if (props.maxSelection > 0 && count > props.maxSelection) {
    return false
  }
  
  return count > 0
})

const dynamicColumns = computed(() => {
  if (!selectedTypeId.value) return []
  
  const assetType = assetTypes.value.find(t => t.id === selectedTypeId.value)
  if (!assetType) return []
  
  // 基础列
  const baseColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left' as const
    }
  ]
  
  // 动态字段列
  const fieldColumns = assetType.fields
    .filter(field => field.displayInList && computedConfig.value.displayFields.includes(field.name))
    .sort((a, b) => a.order - b.order)
    .map(field => ({
      title: field.displayName,
      dataIndex: field.name,
      key: field.name,
      width: field.width || getDefaultColumnWidth(field.type),
      sorter: field.sortable,
      customRender: getFieldRenderer(field)
    }))
  
  return [...baseColumns, ...fieldColumns]
})

const rowSelection = computed(() => ({
  type: props.multiple ? 'checkbox' : 'radio' as 'checkbox' | 'radio',
  selectedRowKeys: selectedAssets.value.map(asset => asset.id),
  onChange: handleRowSelectionChange,
  getCheckboxProps: (record: Asset) => ({
    disabled: !isAssetSelectable(record)
  })
}))

// 插件相关计算属性
const pluginToolbar = computed(() => {
  return pluginManager.value?.getToolbarComponent()
})

const pluginFilter = computed(() => {
  return pluginManager.value?.getFilterComponent()
})

// 方法实现
const loadAssetTypes = async () => {
  try {
    typesLoading.value = true
    
    const filter = {
      allowedTypes: props.allowedTypes
    }
    
    const types = await assetService.value.getAssetTypes(filter)
    assetTypes.value = types
    
    // 设置默认选中的类型
    if (types.length > 0 && !selectedTypeId.value) {
      const defaultType = computedConfig.value.defaultTypeIds.length > 0
        ? types.find(t => computedConfig.value.defaultTypeIds.includes(t.id))
        : types[0]
      
      if (defaultType) {
        selectedTypeId.value = defaultType.id
      }
    }
  } catch (error) {
    console.error('加载资产类型失败:', error)
    emit('error', error as Error)
    message.error(t('loadAssetTypesFailed'))
  } finally {
    typesLoading.value = false
  }
}

const loadAssets = async () => {
  if (!selectedTypeId.value) return
  
  try {
    assetsLoading.value = true
    
    const query: AssetQuery = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      typeIds: [selectedTypeId.value],
      search: searchValue.value || undefined,
      searchFields: computedConfig.value.searchFields,
      attributeFilters: attributeFilters.value.length > 0 ? attributeFilters.value : undefined,
      includeFields: computedConfig.value.displayFields,
      userId: props.userId,
      tenantId: props.tenantId
    }
    
    // 插件钩子：搜索前处理
    const processedQuery = await pluginManager.value?.beforeSearch(query) || query
    
    const response = await assetService.value.getAssets(processedQuery)
    
    // 插件钩子：搜索后处理
    const processedResponse = await pluginManager.value?.afterSearch(response) || response
    
    assets.value = processedResponse.assets
    pagination.value.total = processedResponse.total
    
  } catch (error) {
    console.error('加载资产列表失败:', error)
    emit('error', error as Error)
    message.error(t('loadAssetsFailed'))
  } finally {
    assetsLoading.value = false
  }
}

const handleTypeChange = async (typeId: string) => {
  if (typeId === selectedTypeId.value) return
  
  selectedTypeId.value = typeId
  pagination.value.current = 1
  
  // 清空当前类型的选择
  if (props.multiple) {
    selectedAssets.value = selectedAssets.value.filter(
      asset => asset.typeId !== typeId
    )
  } else {
    selectedAssets.value = []
  }
  
  emit('type-change', typeId)
  await loadAssets()
}

const handleSearch = async (value: string) => {
  searchValue.value = value
  pagination.value.current = 1
  await loadAssets()
}

const handleAdvancedSearch = async (filters: AttributeFilter[]) => {
  attributeFilters.value = filters
  pagination.value.current = 1
  searchDrawerVisible.value = false
  await loadAssets()
}

const handleReset = async () => {
  searchValue.value = ''
  attributeFilters.value = []
  pagination.value.current = 1
  await loadAssets()
}

const handleAssetListChange = async (pag: any) => {
  pagination.value = { ...pagination.value, ...pag }
  await loadAssets()
}

const handleRowSelectionChange = async (selectedRowKeys: string[], selectedRows: Asset[]) => {
  // 插件钩子：选择前验证
  const canSelect = await pluginManager.value?.beforeSelect(selectedRows) ?? true
  if (!canSelect) return
  
  if (props.multiple) {
    // 多选模式：合并不同类型的选择
    const existingOtherTypes = selectedAssets.value.filter(
      asset => asset.typeId !== selectedTypeId.value
    )
    selectedAssets.value = [...existingOtherTypes, ...selectedRows]
  } else {
    // 单选模式
    selectedAssets.value = selectedRows
  }
  
  emit('selection-change', selectedAssets.value)
  
  // 插件钩子：选择后处理
  await pluginManager.value?.afterSelect(selectedAssets.value)
}

const handleSelectionChange = (assets: Asset[]) => {
  selectedAssets.value = assets
  emit('selection-change', assets)
}

const handleRemoveAsset = (assetId: string) => {
  selectedAssets.value = selectedAssets.value.filter(asset => asset.id !== assetId)
  emit('selection-change', selectedAssets.value)
}

const handleClearSelection = () => {
  selectedAssets.value = []
  emit('selection-change', selectedAssets.value)
}

const handleConfirm = async () => {
  try {
    validating.value = true
    
    // 验证选择
    const validationResult = await validateSelection(selectedAssets.value)
    
    if (!validationResult.valid) {
      const errorMessages = validationResult.errors.map(e => e.message).join('\n')
      message.error(errorMessages)
      return
    }
    
    // 显示警告（如果有）
    if (validationResult.warnings.length > 0) {
      const warningMessages = validationResult.warnings.map(w => w.message).join('\n')
      message.warning(warningMessages)
    }
    
    emit('confirm', selectedAssets.value)
    handleClose()
    
  } catch (error) {
    console.error('验证选择失败:', error)
    emit('error', error as Error)
    message.error(t('validationFailed'))
  } finally {
    validating.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
  handleClose()
}

const handleClose = () => {
  emit('update:open', false)
}

const openAdvancedSearch = () => {
  searchDrawerVisible.value = true
}

const closeAdvancedSearch = () => {
  searchDrawerVisible.value = false
}

// 工具方法
const isAssetSelectable = (asset: Asset): boolean => {
  // 检查资产状态
  if (asset.status === 'deleted' || asset.status === 'retired') {
    return false
  }
  
  // 检查最大选择数量
  if (props.maxSelection > 0 && selectedAssets.value.length >= props.maxSelection) {
    return selectedAssets.value.some(selected => selected.id === asset.id)
  }
  
  return true
}

const getDefaultColumnWidth = (fieldType: string): number => {
  const widthMap: Record<string, number> = {
    boolean: 80,
    date: 180,
    datetime: 200,
    number: 100,
    integer: 100,
    float: 120,
    text: 200
  }
  
  return widthMap[fieldType] || 150
}

const getFieldRenderer = (field: any) => {
  // 根据字段类型返回渲染函数
  if (field.type === 'enum' && field.options) {
    return ({ text }: any) => {
      const option = field.options.find((o: any) => o.value === text)
      if (option && option.style) {
        return h('span', {
          style: option.style
        }, option.label || text)
      }
      return text
    }
  }
  
  return undefined
}

// 暴露的方法（用于 ref）
const reset = () => {
  selectedAssets.value = []
  searchValue.value = ''
  attributeFilters.value = []
  pagination.value.current = 1
}

const refresh = async () => {
  await Promise.all([loadAssetTypes(), loadAssets()])
}

const clearSelection = () => {
  selectedAssets.value = []
  emit('selection-change', selectedAssets.value)
}

const selectAssets = (assets: Asset[]) => {
  selectedAssets.value = [...assets]
  emit('selection-change', selectedAssets.value)
}

const getSelectedAssets = () => selectedAssets.value

// 生命周期
onMounted(async () => {
  // 初始化插件
  await pluginManager.value?.init(pluginContext.value)
  
  // 加载数据
  if (props.open) {
    await loadAssetTypes()
    if (selectedTypeId.value) {
      await loadAssets()
    }
  }
})

onUnmounted(() => {
  pluginManager.value?.destroy()
})

// 监听器
watch(
  () => props.open,
  async (newVal) => {
    if (newVal) {
      selectedAssets.value = [...props.selectedAssets]
      await loadAssetTypes()
      if (selectedTypeId.value) {
        await loadAssets()
      }
    } else {
      reset()
    }
  },
  { immediate: true }
)

watch(
  () => props.selectedAssets,
  (newAssets) => {
    selectedAssets.value = [...newAssets]
  },
  { deep: true }
)

// 提供给子组件的上下文
provide('assetSelectorContext', {
  config: computedConfig,
  assetService,
  selectedAssets,
  currentQuery: computed(() => ({
    page: pagination.value.current,
    pageSize: pagination.value.pageSize,
    typeIds: selectedTypeId.value ? [selectedTypeId.value] : [],
    search: searchValue.value,
    attributeFilters: attributeFilters.value
  }))
})

// 导出 ref 方法
defineExpose<AssetSelectorRef>({
  reset,
  refresh,
  clearSelection,
  selectAssets,
  getSelectedAssets,
  isLoading: computed(() => typesLoading.value || assetsLoading.value),
  selectedCount: computed(() => selectedAssets.value.length),
  totalCount: computed(() => pagination.value.total)
})
</script>

<style scoped>
.asset-selector-modal {
  .ant-modal-content {
    height: v-bind(height + 'px');
    display: flex;
    flex-direction: column;
  }
  
  .ant-modal-body {
    flex: 1;
    padding: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.asset-selector-container {
  display: flex;
  gap: 16px;
  height: 100%;
  min-height: 600px;
}

.plugin-toolbar {
  margin-bottom: 16px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 6px;
}

.asset-types-panel {
  width: 200px;
  flex-shrink: 0;
  overflow: hidden;
}

.asset-content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-toolbar {
  margin-bottom: 16px;
}

.asset-list-container {
  flex: 1;
  overflow: hidden;
}

.plugin-filter {
  margin-top: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .asset-selector-container {
    flex-direction: column;
    height: auto;
  }
  
  .asset-types-panel {
    width: 100%;
    height: 200px;
  }
}
</style>