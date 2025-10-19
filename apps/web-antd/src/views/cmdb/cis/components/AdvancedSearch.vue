<script setup lang="ts">
import { computed, ref } from 'vue';

import {
  CloseOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Drawer,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Tag,
  TimePicker,
  Collapse,
  Row,
  Col,
} from 'ant-design-vue';

// 简化的类型定义，避免模块导入错误
interface CiAttributeFilter {
  attrId: number;
  attrName: string;
  valueType: string;
  operator: string;
  value?: any;
  values?: string[];
}

interface CiRelationFilter {
  relationType: string;
  direction: 'outgoing' | 'incoming';
  relationDepth: number;
  includeIndirect: boolean;
}

interface CiTagFilter {
  key: string;
  operator: string;
  values: string[];
}

interface CiMetadataFilter {
  path: string;
  operator: string;
  value: any;
}

interface CiTimeRangeSearch {
  field?: string;
  startTime?: any;
  endTime?: any;
  interval?: string;
}

interface CiFacetSearch {
  fields: string[];
  size: number;
}

interface CiSortField {
  attrId?: number;
  fieldName?: string;
  direction: 'asc' | 'desc';
}

interface CisListRequest {
  page: number;
  pageSize: number;
  typeId?: number;
  withAttributes: boolean;
  search?: string;
  searchFields?: number[];
  attributeFilters?: CiAttributeFilter[];
  relationFilters?: CiRelationFilter[];
  tagFilters?: CiTagFilter[];
  metadataFilters?: CiMetadataFilter[];
  timeRangeSearch?: CiTimeRangeSearch;
  facetSearch?: CiFacetSearch;
  sortFields?: CiSortField[];
  withAggregations?: boolean;
  forceEnhancedSearch?: boolean;
}

interface Props {
  open: boolean;
  typeId?: number;
  attributeOptions?: Array<{
    choices?: Array<{
      label: string;
      value: string;
    }>;
    label: string;
    value: number;
    valueType: string;
  }>;
}

interface Emits {
  (e: 'update:open', value: boolean): void;
  (e: 'search', searchParams: CisListRequest): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 搜索表单数据
const searchForm = ref({
  search: '',
  searchFields: [],
  attributeFilters: [] as CiAttributeFilter[],
  relationFilters: [] as CiRelationFilter[],
  tagFilters: [] as CiTagFilter[],
  metadataFilters: [] as CiMetadataFilter[],
  timeRangeSearch: {} as CiTimeRangeSearch,
  facetSearch: { fields: [], size: 10 } as CiFacetSearch,
  sortFields: [] as CiSortField[],
  withAggregations: false,
  forceEnhancedSearch: false,
});

// 当前展开的搜索面板 - 使用字符串数组而不是单个值
const activeKey = ref<string[]>(['1']);

// 操作符选项
const operatorOptions = [
  {
    value: 'eq',
    label: '等于',
    types: ['text', 'int', 'float', 'bool', 'date', 'datetime'],
  },
  {
    value: 'ne',
    label: '不等于',
    types: ['text', 'int', 'float', 'bool', 'date', 'datetime'],
  },
  { value: 'like', label: '包含', types: ['text'] },
  { value: 'not_like', label: '不包含', types: ['text'] },
  { value: 'gt', label: '大于', types: ['int', 'float', 'date', 'datetime'] },
  { value: 'lt', label: '小于', types: ['int', 'float', 'date', 'datetime'] },
  {
    value: 'gte',
    label: '大于等于',
    types: ['int', 'float', 'date', 'datetime'],
  },
  {
    value: 'lte',
    label: '小于等于',
    types: ['int', 'float', 'date', 'datetime'],
  },
  { value: 'in', label: '在列表中', types: ['text', 'int', 'float'] },
  { value: 'not_in', label: '不在列表中', types: ['text', 'int', 'float'] },
  { value: 'empty', label: '为空', types: ['text', 'int', 'float'] },
  { value: 'not_empty', label: '不为空', types: ['text', 'int', 'float'] },
  { value: 'today', label: '今天', types: ['date', 'datetime'] },
  { value: 'yesterday', label: '昨天', types: ['date', 'datetime'] },
  { value: 'contains', label: 'JSON包含', types: ['json'] },
];

// 关系类型选项（示例）
const relationTypeOptions = [
  { value: 'deployed_on', label: '部署在' },
  { value: 'depends_on', label: '依赖于' },
  { value: 'connects_to', label: '连接到' },
  { value: 'manages', label: '管理' },
];

// 获取支持的操作符
const getSupportedOperators = (valueType: string) => {
  return operatorOptions.filter((op) => op.types.includes(valueType));
};

// 添加属性过滤条件
const addAttributeFilter = () => {
  searchForm.value.attributeFilters.push({
    attrId: 0,
    attrName: '',
    valueType: 'text',
    operator: 'eq',
    value: undefined,
  });
};

// 移除属性过滤条件
const removeAttributeFilter = (index: number) => {
  searchForm.value.attributeFilters.splice(index, 1);
};

// 添加关系过滤条件
const addRelationFilter = () => {
  searchForm.value.relationFilters.push({
    relationType: '',
    direction: 'outgoing',
    relationDepth: 1,
    includeIndirect: false,
  });
};

// 移除关系过滤条件
const removeRelationFilter = (index: number) => {
  searchForm.value.relationFilters.splice(index, 1);
};



// 构建搜索参数
const buildSearchParams = (): CisListRequest => {
  const params: CisListRequest = {
    page: 1,
    pageSize: 20,
    typeId: props.typeId,
    withAttributes: true,
  };

  // 基础搜索
  if (searchForm.value.search) {
    params.search = searchForm.value.search;
  }
  if (searchForm.value.searchFields.length > 0) {
    params.searchFields = searchForm.value.searchFields;
  }

  // 属性过滤
  if (searchForm.value.attributeFilters.length > 0) {
    params.attributeFilters = searchForm.value.attributeFilters.filter(
      (filter) =>
        filter.attrId &&
        filter.operator &&
        (filter.operator === 'empty' ||
          filter.operator === 'not_empty' ||
          filter.value !== undefined),
    );
  }

  // 关系搜索
  if (searchForm.value.relationFilters.length > 0) {
    params.relationFilters = searchForm.value.relationFilters.filter(
      (filter) => filter.relationType,
    );
    params.forceEnhancedSearch = true;
  }


  // 标签搜索
  if (searchForm.value.tagFilters.length > 0) {
    params.tagFilters = searchForm.value.tagFilters.filter(
      (filter) => filter.key && filter.operator,
    );
    params.forceEnhancedSearch = true;
  }

  // 元数据搜索
  if (searchForm.value.metadataFilters.length > 0) {
    params.metadataFilters = searchForm.value.metadataFilters.filter(
      (filter) => filter.path && filter.operator,
    );
    params.forceEnhancedSearch = true;
  }

  // 时间范围搜索
  if (searchForm.value.timeRangeSearch.field) {
    params.timeRangeSearch = searchForm.value.timeRangeSearch;
    params.forceEnhancedSearch = true;
  }

  // 分面搜索
  if (searchForm.value.facetSearch.fields.length > 0) {
    params.facetSearch = searchForm.value.facetSearch;
    params.forceEnhancedSearch = true;
  }

  // 排序
  if (searchForm.value.sortFields.length > 0) {
    params.sortFields = searchForm.value.sortFields.filter(
      (field) => field.attrId || field.fieldName,
    );
  }

  // 聚合
  if (searchForm.value.withAggregations) {
    params.withAggregations = true;
  }

  // 强制增强搜索
  if (searchForm.value.forceEnhancedSearch) {
    params.forceEnhancedSearch = true;
  }

  return params;
};

// 执行搜索
const handleSearch = () => {
  const searchParams = buildSearchParams();
  emit('search', searchParams);
  message.success('搜索条件已应用');
};

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    search: '',
    searchFields: [],
    attributeFilters: [],
    relationFilters: [],
    tagFilters: [],
    metadataFilters: [],
    timeRangeSearch: {},
    facetSearch: { fields: [], size: 10 },
    sortFields: [],
    withAggregations: false,
    forceEnhancedSearch: false,
  };
  message.success('搜索条件已重置');
};

// 关闭抽屉
const handleClose = () => {
  emit('update:open', false);
};

// 面板展开状态管理
const handleCollapseChange = (keys: string | string[]) => {
  activeKey.value = Array.isArray(keys) ? keys : [keys];
};

// 计算当前活跃的搜索条件数量
const activeFiltersCount = computed(() => {
  let count = 0;
  if (searchForm.value.search) count++;
  count += searchForm.value.attributeFilters.length;
  count += searchForm.value.relationFilters.length;
  count += searchForm.value.tagFilters.length;
  count += searchForm.value.metadataFilters.length;
  if (searchForm.value.timeRangeSearch.field) count++;
  if (searchForm.value.facetSearch.fields.length > 0) count++;
  return count;
});
</script>

<script lang="ts">
export default {
  name: 'AdvancedSearch',
};
</script>

<template>
  <Drawer
    :open="open"
    title="高级搜索"
    width="1000"
    placement="right"
    @close="handleClose"
  >
    <div class="advanced-search-container">
      <!-- 搜索条件卡片 -->
      <Card class="search-card" size="small">
        <template #title>
          <div class="card-title">
            <FilterOutlined class="title-icon" />
            <span>搜索条件</span>
            <Tag v-if="activeFiltersCount > 0" color="blue" size="small">
              {{ activeFiltersCount }}
            </Tag>
          </div>
        </template>
        
        <template #extra>
          <Space>
            <Button size="small" @click="handleReset">
              重置
            </Button>
            <Button type="primary" size="small" @click="handleSearch">
              <SearchOutlined />
              搜索
            </Button>
          </Space>
        </template>

        <Collapse :active-key="activeKey" ghost @change="handleCollapseChange">
          <!-- 基础搜索 -->
          <Collapse.Panel key="1" header="基础搜索">
            <Row :gutter="[16, 16]">
              <Col :span="12">
                <div class="form-item">
                  <label class="form-label">搜索关键词</label>
                  <Input
                    :value="searchForm.search"
                    @input="(e) => searchForm.search = e.target.value"
                    placeholder="在所有文本字段中搜索..."
                    allow-clear
                    size="small"
                  />
                </div>
              </Col>
              <Col :span="12">
                <div class="form-item">
                  <label class="form-label">搜索范围</label>
                  <Select
                    :value="searchForm.searchFields"
                    @change="(value) => searchForm.searchFields = value"
                    mode="multiple"
                    placeholder="选择搜索字段（为空表示搜索所有字段）"
                    allow-clear
                    size="small"
                  >
                    <Select.Option
                      v-for="attr in attributeOptions"
                      :key="attr.value"
                      :value="attr.value"
                    >
                      {{ attr.label }}
                    </Select.Option>
                  </Select>
                </div>
              </Col>
            </Row>
          </Collapse.Panel>

          <!-- 属性过滤 -->
          <Collapse.Panel key="2">
            <template #header>
              <div class="panel-header">
                <span>属性过滤</span>
                <Tag v-if="searchForm.attributeFilters.length > 0" color="blue" size="small">
                  {{ searchForm.attributeFilters.length }}
                </Tag>
              </div>
            </template>
            <template #extra>
              <Button type="link" size="small" @click.stop="addAttributeFilter">
                <PlusOutlined />
                添加条件
              </Button>
            </template>

            <div class="filter-list">
              <div
                v-for="(filter, index) in searchForm.attributeFilters"
                :key="index"
                class="filter-row"
              >
                <Row :gutter="8" align="middle">
                  <Col :span="6">
                    <Select
                      :value="filter.attrId"
                      @change="
                        (value) => {
                          filter.attrId = value;
                          const attr = attributeOptions?.find(
                            (a) => a.value === value,
                          );
                          if (attr) {
                            filter.attrName = attr.label;
                            filter.valueType = attr.valueType;
                            filter.operator = 'eq';
                            filter.value = undefined;
                          }
                        }
                      "
                      placeholder="选择属性"
                      size="small"
                    >
                      <Select.Option
                        v-for="attr in attributeOptions"
                        :key="attr.value"
                        :value="attr.value"
                      >
                        {{ attr.label }}
                      </Select.Option>
                    </Select>
                  </Col>
                  <Col :span="4">
                    <Select
                      :value="filter.operator"
                      @change="
                        (value) => {
                          filter.operator = value;
                          filter.value = undefined;
                          filter.values = undefined;
                        }
                      "
                      placeholder="操作符"
                      size="small"
                    >
                      <Select.Option
                        v-for="op in getSupportedOperators(filter.valueType)"
                        :key="op.value"
                        :value="op.value"
                      >
                        {{ op.label }}
                      </Select.Option>
                    </Select>
                  </Col>
                  <Col :span="10">
                    <div v-if="filter.operator !== 'empty' && filter.operator !== 'not_empty'">
                      <!-- 多值输入 -->
                      <Select
                        v-if="filter.operator === 'in' || filter.operator === 'not_in'"
                        :value="filter.values || []"
                        @change="(value) => filter.values = value"
                        mode="tags"
                        placeholder="输入多个值，回车分隔"
                        size="small"
                      />
                      <!-- 布尔值选择 -->
                      <Select
                        v-else-if="filter.valueType === 'bool'"
                        :value="filter.value"
                        @change="(value) => filter.value = value"
                        allow-clear
                        placeholder="请选择"
                        size="small"
                      >
                        <Select.Option :value="true">是</Select.Option>
                        <Select.Option :value="false">否</Select.Option>
                      </Select>
                      <!-- 日期选择 -->
                      <DatePicker
                        v-else-if="filter.valueType === 'date'"
                        :value="filter.value"
                        @change="(value) => filter.value = value"
                        placeholder="请选择日期"
                        size="small"
                        style="width: 100%"
                      />
                      <!-- 日期时间选择 -->
                      <DatePicker
                        v-else-if="filter.valueType === 'datetime'"
                        :value="filter.value"
                        @change="(value) => filter.value = value"
                        show-time
                        placeholder="请选择日期时间"
                        size="small"
                        style="width: 100%"
                      />
                      <!-- 数字输入 -->
                      <InputNumber
                        v-else-if="filter.valueType === 'int' || filter.valueType === 'float'"
                        :value="filter.value"
                        @change="(value) => filter.value = value"
                        :step="filter.valueType === 'float' ? 0.1 : 1"
                        :placeholder="filter.valueType === 'float' ? '请输入小数' : '请输入数字'"
                        size="small"
                        style="width: 100%"
                      />
                      <!-- 时间选择 -->
                      <TimePicker
                        v-else-if="filter.valueType === 'time'"
                        :value="filter.value"
                        @change="(value) => filter.value = value"
                        placeholder="请选择时间"
                        size="small"
                        style="width: 100%"
                      />
                      <!-- 默认文本输入 -->
                      <Input
                        v-else
                        :value="filter.value"
                        @input="(e) => filter.value = e.target.value"
                        placeholder="请输入值"
                        size="small"
                      />
                    </div>
                  </Col>
                  <Col :span="4">
                    <Button
                      type="text"
                      danger
                      size="small"
                      @click="removeAttributeFilter(index)"
                    >
                      <CloseOutlined />
                      删除
                    </Button>
                  </Col>
                </Row>
              </div>
              
              <div v-if="searchForm.attributeFilters.length === 0" class="empty-state">
                <p>暂无属性过滤条件，点击上方"添加条件"按钮开始</p>
              </div>
            </div>
          </Collapse.Panel>

          <!-- 关系搜索 -->
          <Collapse.Panel key="3">
            <template #header>
              <div class="panel-header">
                <span>关系搜索</span>
                <Tag v-if="searchForm.relationFilters.length > 0" color="orange" size="small">
                  {{ searchForm.relationFilters.length }}
                </Tag>
              </div>
            </template>
            <template #extra>
              <Button type="link" size="small" @click.stop="addRelationFilter">
                <PlusOutlined />
                添加条件
              </Button>
            </template>

            <div class="filter-list">
              <div
                v-for="(filter, index) in searchForm.relationFilters"
                :key="index"
                class="filter-row"
              >
                <Row :gutter="8" align="middle">
                  <Col :span="6">
                    <Select
                      :value="filter.relationType"
                      @change="(value) => filter.relationType = value"
                      placeholder="关系类型"
                      size="small"
                    >
                      <Select.Option
                        v-for="type in relationTypeOptions"
                        :key="type.value"
                        :value="type.value"
                      >
                        {{ type.label }}
                      </Select.Option>
                    </Select>
                  </Col>
                  <Col :span="4">
                    <Select 
                      :value="filter.direction" 
                      @change="(value) => filter.direction = value"
                      size="small"
                    >
                      <Select.Option value="outgoing">出关系</Select.Option>
                      <Select.Option value="incoming">入关系</Select.Option>
                    </Select>
                  </Col>
                  <Col :span="4">
                    <InputNumber
                      :value="filter.relationDepth"
                      @change="(value) => filter.relationDepth = value"
                      :min="1"
                      :max="5"
                      placeholder="深度"
                      size="small"
                    />
                  </Col>
                  <Col :span="6">
                    <Checkbox 
                      :checked="filter.includeIndirect"
                      @change="(e) => filter.includeIndirect = e.target.checked"
                    >
                      包含间接关系
                    </Checkbox>
                  </Col>
                  <Col :span="4">
                    <Button
                      type="text"
                      danger
                      size="small"
                      @click="removeRelationFilter(index)"
                    >
                      <CloseOutlined />
                      删除
                    </Button>
                  </Col>
                </Row>
              </div>
              
              <div v-if="searchForm.relationFilters.length === 0" class="empty-state">
                <p>暂无关系搜索条件，点击上方"添加条件"按钮开始</p>
              </div>
            </div>
          </Collapse.Panel>

          <!-- 时间范围搜索 -->
          <Collapse.Panel key="4">
            <template #header>
              <div class="panel-header">
                <span>时间范围搜索</span>
                <Tag v-if="searchForm.timeRangeSearch.field" color="purple" size="small">
                  已设置
                </Tag>
              </div>
            </template>

            <Row :gutter="[16, 16]">
              <Col :span="8">
                <div class="form-item">
                  <label class="form-label">时间字段</label>
                  <Select
                    :value="searchForm.timeRangeSearch.field"
                    @change="(value) => searchForm.timeRangeSearch.field = value"
                    placeholder="选择时间字段"
                    allow-clear
                    size="small"
                  >
                    <Select.Option value="created_at">创建时间</Select.Option>
                    <Select.Option value="updated_at">更新时间</Select.Option>
                  </Select>
                </div>
              </Col>
              <Col :span="8">
                <div class="form-item">
                  <label class="form-label">开始时间</label>
                  <DatePicker
                    :value="searchForm.timeRangeSearch.startTime"
                    @change="(value) => searchForm.timeRangeSearch.startTime = value"
                    show-time
                    placeholder="选择开始时间"
                    size="small"
                    style="width: 100%"
                  />
                </div>
              </Col>
              <Col :span="8">
                <div class="form-item">
                  <label class="form-label">结束时间</label>
                  <DatePicker
                    :value="searchForm.timeRangeSearch.endTime"
                    @change="(value) => searchForm.timeRangeSearch.endTime = value"
                    show-time
                    placeholder="选择结束时间"
                    size="small"
                    style="width: 100%"
                  />
                </div>
              </Col>
            </Row>
          </Collapse.Panel>

          <!-- 高级选项 -->
          <Collapse.Panel key="5" header="高级选项">
            <Row :gutter="[16, 16]">
              <Col :span="12">
                <Checkbox 
                :checked="searchForm.withAggregations"
                @change="(e) => searchForm.withAggregations = e.target.checked"
              >
                  启用聚合统计
                </Checkbox>
              </Col>
              <Col :span="12">
                <Checkbox 
                :checked="searchForm.forceEnhancedSearch"
                @change="(e) => searchForm.forceEnhancedSearch = e.target.checked"
              >
                  强制使用增强搜索引擎
                </Checkbox>
              </Col>
            </Row>
          </Collapse.Panel>
        </Collapse>
      </Card>
    </div>
  </Drawer>
</template>

<style scoped>
.advanced-search-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-card {
  flex: 1;
  height: 100%;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: #1890ff;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-item {
  margin-bottom: 8px;
}

.form-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.filter-list {
  min-height: 60px;
}

.filter-row {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.filter-row:last-child {
  border-bottom: none;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  background: #fafafa;
  border-radius: 6px;
  margin: 8px 0;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-row :deep(.ant-col) {
    margin-bottom: 8px;
  }
}

/* 折叠面板样式优化 */
:deep(.ant-collapse-ghost > .ant-collapse-item > .ant-collapse-header) {
  padding: 12px 0;
  font-weight: 500;
}

:deep(.ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box) {
  padding: 16px 0;
}

/* 卡片内容区域 */
:deep(.ant-card-body) {
  padding: 16px;
}

/* Tag 样式 */
:deep(.ant-tag) {
  margin-left: 8px;
}
</style>
