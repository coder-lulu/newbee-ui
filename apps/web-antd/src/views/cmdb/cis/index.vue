<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { PlusOutlined } from '@ant-design/icons-vue';
import { Button, message } from 'ant-design-vue';

import CiDetailDrawer from './components/CiDetailDrawer.vue';
import ConfigItemForm from './components/ConfigItemForm.vue';
import DataTable from './DataTable.vue';
import TypeTree from './type-tree.vue';

// 路由实例
const route = useRoute();

// 当前选中的CI类型ID和名称
const selectedTypeId = ref<null | number>(null);
const selectedTypeName = ref<string>('');
const searchValue = ref('');

// 树过滤参数
const treeFilterParams = ref<{
  excludeTypeNames?: string[];
}>({});

treeFilterParams.value.excludeTypeNames = ['基类', '其它'];

// 配置项表单相关
const configFormOpen = ref(false);
const editConfigId = ref<number | undefined>(undefined);

// 详情抽屉相关
const detailStacks = ref<Array<{ ciId: number; typeId: number; typeName?: string }>>([]);

const currentDetail = computed(() => detailStacks.value[detailStacks.value.length - 1]);

const detailDrawerOpen = computed(() => detailStacks.value.length > 0);
const detailCiId = computed(() => currentDetail.value?.ciId);
const detailTypeId = computed(() => currentDetail.value?.typeId);

const pushDetail = (ciId: number, typeId: number, typeName?: string) => {
  detailStacks.value = detailStacks.value
    .filter((entry) => entry.ciId !== ciId || entry.typeId !== typeId)
    .concat({ ciId, typeId, typeName });
};

const popDetail = () => {
  detailStacks.value = detailStacks.value.slice(0, -1);
};

// 左侧面板宽度
const leftWidth = ref(150);
const isResizing = ref(false);

// DataTable组件引用
const dataTableRef = ref();


// 搜索管理器类
class CmdbSearchManager {
  searchConfig: {
    defaultPageSize: number;
    useEnhancedSearch: boolean;
  };

  constructor() {
    this.searchConfig = {
      useEnhancedSearch: false,
      defaultPageSize: 20,
    };
  }

  // 构建属性过滤
  buildAttributeFilters(attributeFilters: any[]) {
    return attributeFilters.map((filter) => ({
      attrId: filter.attrId,
      valueType: filter.valueType,
      operator: filter.operator,
      value: filter.value,
      values: filter.values ? JSON.stringify(filter.values) : undefined,
    }));
  }

  // 构建基础查询
  buildBasicQuery(filters: any) {
    const query: any = {
      page: filters.page || 1,
      pageSize: filters.pageSize || this.searchConfig.defaultPageSize,
      withAttributes: true,
    };

    // 添加基础字段过滤
    if (filters.typeId) query.typeId = filters.typeId;
    if (filters.status !== undefined) query.status = filters.status;

    return query;
  }

  // 构建复合查询
  buildComplexQuery(searchCriteria: any) {
    const query = this.buildBasicQuery(searchCriteria.basic || {});

    // 属性过滤
    if (searchCriteria.attributes) {
      query.attributeFilters = this.buildAttributeFilters(
        searchCriteria.attributes,
      );
    }

    // 关系搜索
    if (searchCriteria.relations) {
      query.relationFilters = searchCriteria.relations;
      query.forceEnhancedSearch = true;
    }

    // 标签搜索
    if (searchCriteria.tags) {
      query.tagFilters = searchCriteria.tags;
      query.forceEnhancedSearch = true;
    }

    // 时间范围搜索
    if (searchCriteria.timeRange) {
      query.timeRangeSearch = searchCriteria.timeRange;
      query.forceEnhancedSearch = true;
    }

    // 分面搜索
    if (searchCriteria.facets) {
      query.facetSearch = searchCriteria.facets;
      query.forceEnhancedSearch = true;
    }

    // 全文搜索
    if (searchCriteria.search) {
      query.search = searchCriteria.search;
    }

    return query;
  }

  // 处理搜索结果
  processSearchResult(result: any) {
    if (result.code !== 0) {
      throw new Error(result.msg || '搜索失败');
    }

    const processedResult: any = {
      total: result.data.total,
      data: result.data.data,
      pagination: {
        total: result.data.total,
        current: 1,
        pageSize: 20,
      },
    };

    // 处理聚合数据
    if (result.data.aggregations) {
      try {
        processedResult.aggregations =
          typeof result.data.aggregations === 'string'
            ? JSON.parse(result.data.aggregations)
            : result.data.aggregations;
      } catch (error) {
        console.warn('解析聚合数据失败:', error);
      }
    }

    return processedResult;
  }
}

// 搜索管理器实例（如果需要可以使用）
// const searchManager = new CmdbSearchManager();

// 处理URL参数，支持分享链接直接打开资产详情
const handleUrlParams = () => {
  const { ciId, typeId, typeName, action } = route.query;

  if (action === 'viewDetail' && ciId && typeId) {
    try {
      const parsedCiId = Number(ciId);
      const parsedTypeId = Number(typeId);

      if (!Number.isNaN(parsedCiId) && !Number.isNaN(parsedTypeId)) {
        // 设置类型信息
        selectedTypeId.value = parsedTypeId;
        selectedTypeName.value = String(typeName || 'CI');

        // 延迟打开详情抽屉，确保页面已初始化
        setTimeout(() => {
          handleViewConfig(parsedCiId, parsedTypeId);
          message.success('已通过分享链接打开资产详情');
        }, 500);
      }
    } catch (error) {
      console.error('解析URL参数失败:', error);
      message.error('无效的分享链接参数');
    }
  }
};

// 处理左侧树选择事件
function handleTreeSelect(typeId: number, typeName: string) {
  selectedTypeId.value = typeId;
  selectedTypeName.value = typeName;
}



// 搜索功能（可选）
function updateFilteredData() {
  // 这里可以添加搜索逻辑，或者将搜索功能交给DataTable组件处理
  console.log('搜索值:', searchValue.value);
}

// 打开新建配置项表单
function handleCreateConfig() {
  if (!selectedTypeId.value) {
    console.warn('请先选择CI类型');
    return;
  }
  editConfigId.value = undefined;
  configFormOpen.value = true;
}

// 打开编辑配置项表单
function handleEditConfig(id: number) {
  editConfigId.value = id;
  configFormOpen.value = true;
}

// 打开详情抽屉
function handleViewConfig(id: number, typeId: number, typeName?: string) {
  const resolvedName =
    typeName !== undefined && typeName !== null
      ? typeName
      : selectedTypeName.value
        ? selectedTypeName.value
        : 'CI';
  pushDetail(id, typeId, resolvedName);
}

function handleViewRelatedCi(payload: { ciId: number; typeId?: number }) {
  const targetTypeId = payload.typeId ?? detailTypeId.value ?? selectedTypeId.value ?? 0;
  const resolvedName =
    currentDetail.value?.typeName
      ? currentDetail.value.typeName
      : selectedTypeName.value
        ? selectedTypeName.value
        : 'CI';
  pushDetail(payload.ciId, Number(targetTypeId), resolvedName);
}

// 表单提交成功处理
function handleFormSuccess() {
  configFormOpen.value = false;
  // 刷新表格数据
  if (dataTableRef.value && dataTableRef.value.loadData) {
    dataTableRef.value.loadData();
  }
}

// 处理拖拽调整宽度
function handleMouseDown(event: MouseEvent) {
  isResizing.value = true;
  const startX = event.clientX;
  const startWidth = leftWidth.value;

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) return;

    const deltaX = e.clientX - startX;
    const newWidth = Math.max(200, Math.min(500, startWidth + deltaX));
    leftWidth.value = newWidth;
  };

  const handleMouseUp = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
}

// 生命周期钩子
onMounted(() => {
  handleUrlParams();
});

// 监听路由查询参数变化
watch(
  () => route.query,
  () => {
    handleUrlParams();
  },
  { deep: true },
);

watch(searchValue, updateFilteredData);

</script>

<template>
  <div class="cis-page">
    <div class="cis-left" :style="{ width: `${leftWidth}px` }">
      <TypeTree 
        :query-params="treeFilterParams" 
        @select-attribute="handleTreeSelect"
      />
    </div>

    <!-- 拖拽分割条 -->
    <div
      class="resize-handle"
      :class="{ active: isResizing }"
      @mousedown="handleMouseDown"
    >
      <div class="resize-button">
        <div class="resize-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <div class="cis-right">
      <div class="table-header">
        <div class="table-title">资源数据</div>
        <div class="table-toolbar">
          <Button
            type="primary"
            :disabled="!selectedTypeId"
            @click="handleCreateConfig"
            v-access:code="['cmdb:cis:create']"
          >
            <PlusOutlined />
            新建
          </Button>
        </div>
      </div>
      <div class="table-container">
        <DataTable
          ref="dataTableRef"
          :type-id="selectedTypeId"
          @edit="handleEditConfig"
          @view="handleViewConfig"
        />
      </div>
    </div>

    <!-- 配置项表单 -->
    <ConfigItemForm
      :open="configFormOpen"
      :type-id="selectedTypeId"
      :type-name="selectedTypeName"
      :id="editConfigId"
      @update:open="(val) => (configFormOpen = val)"
      @success="handleFormSuccess"
    />

    <!-- CI详情抽屉 -->
    <CiDetailDrawer
      :open="detailDrawerOpen"
      :ci-id="detailCiId"
      :type-id="detailTypeId"
      :type-name="currentDetail?.typeName ?? selectedTypeName"
      :stack-size="detailStacks.length"
      @update:open="(val) => {
        if (!val) {
          popDetail();
        }
      }"
      @view-ci="handleViewRelatedCi"
    />

  </div>
</template>

<style scoped>
.cis-page {
  display: flex;
  height: 100%;
  background: #fff;
}

.cis-left {
  min-width: 200px;
  max-width: 500px;
  height: 100%;
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  transition: width 0.1s ease;
}


/* 拖拽分割条 */
.resize-handle {
  position: relative;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  transition: background-color 0.2s ease;
}

.resize-handle:hover {
  background-color: rgb(24 144 255 / 10%);
}

.resize-handle.active {
  background-color: rgb(24 144 255 / 20%);
}

.resize-handle::before {
  position: absolute;
  inset: 0 -4px;
  content: '';
  background: transparent;
}

.resize-button {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 40px;
  padding: 0;
  cursor: col-resize;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 10%);
  opacity: 0.6;
  transition: all 0.2s ease;
  transform: translate(-50%, -50%);
}

.resize-handle:hover .resize-button {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgb(24 144 255 / 20%);
  opacity: 1;
}

.resize-handle.active .resize-button {
  background: #e6f7ff;
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgb(24 144 255 / 30%);
  opacity: 1;
}

.resize-dots {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
}

.resize-dots span {
  display: block;
  width: 3px;
  height: 3px;
  background-color: #8c8c8c;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.resize-handle:hover .resize-dots span {
  background-color: #1890ff;
}

.resize-handle.active .resize-dots span {
  background-color: #1890ff;
}

.cis-right {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding: 24px;
  overflow: hidden;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.table-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-container {
  flex: 1;
  overflow: hidden;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgb(0 0 0 / 3%);
}

/* 移除 vxe-table 相关样式，改为 Ant Design Table 样式 */
:deep(.ant-table) {
  border: 1px solid #f0f0f0;
}

:deep(.ant-table-thead > tr > th) {
  font-weight: 600;
  background: #fafafa;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: #f5f5f5;
}

/* 拖拽时禁用选择 */
.cis-page.resizing {
  user-select: none;
}

.cis-page.resizing * {
  cursor: col-resize !important;
}

</style>
