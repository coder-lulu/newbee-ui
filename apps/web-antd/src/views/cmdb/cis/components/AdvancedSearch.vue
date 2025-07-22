<script setup lang="ts">
import type {
  CiAttributeFilter,
  CiFacetSearch,
  CiFilterGroup,
  CiInheritanceSearch,
  CiMetadataFilter,
  CiRelationFilter,
  CisListRequest,
  CiSortField,
  CiTagFilter,
  CiTimeRangeSearch,
} from '#/api/cmdb/cis/model';

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
} from 'ant-design-vue';

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
const searchForm = ref<{
  // 属性过滤
  attributeFilters: CiAttributeFilter[];
  facetSearch: CiFacetSearch;

  filterGroups: CiFilterGroup[];
  forceEnhancedSearch: boolean;

  inheritanceSearch: CiInheritanceSearch;
  metadataFilters: CiMetadataFilter[];
  // 增强搜索
  relationFilters: CiRelationFilter[];
  // 基础搜索
  search: string;
  searchFields: number[];
  // 排序
  sortFields: CiSortField[];

  tagFilters: CiTagFilter[];

  timeRangeSearch: CiTimeRangeSearch;
  // 控制选项
  withAggregations: boolean;
}>({
  search: '',
  searchFields: [],
  attributeFilters: [],
  filterGroups: [],
  relationFilters: [],
  inheritanceSearch: {},
  tagFilters: [],
  metadataFilters: [],
  timeRangeSearch: {},
  facetSearch: { fields: [], size: 10 },
  sortFields: [],
  withAggregations: false,
  forceEnhancedSearch: false,
});

// 当前展开的搜索面板
const expandedPanels = ref<string[]>(['basic']);

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

// 分面字段选项
const facetFieldOptions = [
  { value: 'status', label: '状态' },
  { value: 'type_id', label: 'CI类型' },
  { value: 'environment', label: '环境' },
  { value: 'team', label: '团队' },
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

// 添加标签过滤条件
const addTagFilter = () => {
  searchForm.value.tagFilters.push({
    key: '',
    operator: 'eq',
    values: [],
  });
};

// 移除标签过滤条件
const removeTagFilter = (index: number) => {
  searchForm.value.tagFilters.splice(index, 1);
};

// 添加元数据过滤条件
const addMetadataFilter = () => {
  searchForm.value.metadataFilters.push({
    path: '',
    operator: 'eq',
    value: undefined,
  });
};

// 移除元数据过滤条件
const removeMetadataFilter = (index: number) => {
  searchForm.value.metadataFilters.splice(index, 1);
};

// 添加排序字段
const addSortField = () => {
  searchForm.value.sortFields.push({
    attrId: 0,
    direction: 'desc',
  });
};

// 移除排序字段
const removeSortField = (index: number) => {
  searchForm.value.sortFields.splice(index, 1);
};

// 渲染值输入组件
const renderValueInput = (filter: CiAttributeFilter) => {
  const attr = props.attributeOptions?.find((a) => a.value === filter.attrId);
  if (!attr) return null;

  if (filter.operator === 'empty' || filter.operator === 'not_empty') {
    return null;
  }

  if (filter.operator === 'in' || filter.operator === 'not_in') {
    return (
      <Select
        mode="tags"
        onUpdate:value={(value: string[]) => {
          filter.values = value;
        }}
        placeholder="输入多个值，回车分隔"
        style="width: 100%"
        value={filter.values}
      />
    );
  }

  // 选择类型
  if (attr.choices && attr.choices.length > 0) {
    return (
      <Select
        allowClear
        onUpdate:value={(value: any) => {
          filter.value = value;
        }}
        placeholder="请选择"
        style="width: 100%"
        value={filter.value}
      >
        {attr.choices.map((choice) => (
          <Select.Option key={choice.value} value={choice.value}>
            {choice.label}
          </Select.Option>
        ))}
      </Select>
    );
  }

  // 根据类型渲染不同输入组件
  switch (attr.valueType) {
    case 'bool': {
      return (
        <Select
          allowClear
          onUpdate:value={(value: any) => {
            filter.value = value;
          }}
          placeholder="请选择"
          style="width: 100%"
          value={filter.value}
        >
          <Select.Option value={true}>是</Select.Option>
          <Select.Option value={false}>否</Select.Option>
        </Select>
      );
    }
    case 'date': {
      return (
        <DatePicker
          onUpdate:value={(value: any) => {
            filter.value = value;
          }}
          placeholder="请选择日期"
          style="width: 100%"
          value={filter.value}
        />
      );
    }
    case 'datetime': {
      return (
        <DatePicker
          onUpdate:value={(value: any) => {
            filter.value = value;
          }}
          placeholder="请选择日期时间"
          showTime
          style="width: 100%"
          value={filter.value}
        />
      );
    }
    case 'float': {
      return (
        <InputNumber
          onUpdate:value={(value: any) => {
            filter.value = value;
          }}
          placeholder="请输入小数"
          step={0.1}
          style="width: 100%"
          value={filter.value}
        />
      );
    }
    case 'int': {
      return (
        <InputNumber
          onUpdate:value={(value: any) => {
            filter.value = value;
          }}
          placeholder="请输入数字"
          style="width: 100%"
          value={filter.value}
        />
      );
    }
    case 'time': {
      return (
        <TimePicker
          onUpdate:value={(value: any) => {
            filter.value = value;
          }}
          placeholder="请选择时间"
          style="width: 100%"
          value={filter.value}
        />
      );
    }
    default: {
      return (
        <Input
          onUpdate:value={(value: any) => {
            filter.value = value;
          }}
          placeholder="请输入值"
          style="width: 100%"
          value={filter.value}
        />
      );
    }
  }
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

  // 继承搜索
  if (Object.keys(searchForm.value.inheritanceSearch).length > 0) {
    params.inheritanceSearch = searchForm.value.inheritanceSearch;
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
    filterGroups: [],
    relationFilters: [],
    inheritanceSearch: {},
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
const togglePanel = (panel: string) => {
  const index = expandedPanels.value.indexOf(panel);
  if (index === -1) {
    expandedPanels.value.push(panel);
  } else {
    expandedPanels.value.splice(index, 1);
  }
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
    width="800"
    placement="right"
    @close="handleClose"
  >
    <div class="advanced-search-content">
      <!-- 基础搜索面板 -->
      <Card
        size="small"
        class="search-panel"
        :class="{ active: expandedPanels.includes('basic') }"
      >
        <template #title>
          <div class="panel-title" @click="togglePanel('basic')">
            <SearchOutlined class="title-icon" />
            <span>基础搜索</span>
          </div>
        </template>

        <div v-show="expandedPanels.includes('basic')" class="panel-content">
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">搜索关键词</label>
              <Input
                v-model:value="searchForm.search"
                placeholder="在所有文本字段中搜索..."
                allow-clear
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-item">
              <label class="form-label">搜索范围</label>
              <Select
                v-model:value="searchForm.searchFields"
                mode="multiple"
                placeholder="选择搜索字段（为空表示搜索所有字段）"
                allow-clear
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
          </div>
        </div>
      </Card>

      <!-- 属性过滤面板 -->
      <Card
        size="small"
        class="search-panel"
        :class="{ active: expandedPanels.includes('attributes') }"
      >
        <template #title>
          <div class="panel-title" @click="togglePanel('attributes')">
            <FilterOutlined class="title-icon" />
            <span>属性过滤</span>
            <Tag
              v-if="searchForm.attributeFilters.length > 0"
              color="blue"
              size="small"
            >
              {{ searchForm.attributeFilters.length }}
            </Tag>
          </div>
        </template>
        <template #extra>
          <Button type="link" size="small" @click="addAttributeFilter">
            <PlusOutlined />
            添加
          </Button>
        </template>

        <div
          v-show="expandedPanels.includes('attributes')"
          class="panel-content"
        >
          <div
            v-for="(filter, index) in searchForm.attributeFilters"
            :key="index"
            class="filter-item"
          >
            <div class="filter-controls">
              <Select
                v-model:value="filter.attrId"
                placeholder="选择属性"
                style="width: 140px"
                @change="
                  (value) => {
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
              >
                <Select.Option
                  v-for="attr in attributeOptions"
                  :key="attr.value"
                  :value="attr.value"
                >
                  {{ attr.label }}
                </Select.Option>
              </Select>

              <Select
                v-model:value="filter.operator"
                placeholder="操作符"
                style="width: 100px"
                @change="
                  () => {
                    filter.value = undefined;
                    filter.values = undefined;
                  }
                "
              >
                <Select.Option
                  v-for="op in getSupportedOperators(filter.valueType)"
                  :key="op.value"
                  :value="op.value"
                >
                  {{ op.label }}
                </Select.Option>
              </Select>

              <Button
                type="text"
                danger
                size="small"
                @click="removeAttributeFilter(index)"
              >
                <CloseOutlined />
              </Button>
            </div>

            <div
              v-if="
                filter.operator !== 'empty' && filter.operator !== 'not_empty'
              "
              class="filter-value"
            >
              <component :is="renderValueInput(filter)" />
            </div>
          </div>

          <div
            v-if="searchForm.attributeFilters.length === 0"
            class="empty-state"
          >
            <p>暂无属性过滤条件</p>
          </div>
        </div>
      </Card>

      <!-- 关系搜索面板 -->
      <Card
        size="small"
        class="search-panel"
        :class="{ active: expandedPanels.includes('relations') }"
      >
        <template #title>
          <div class="panel-title" @click="togglePanel('relations')">
            <FilterOutlined class="title-icon" />
            <span>关系搜索</span>
            <Tag
              v-if="searchForm.relationFilters.length > 0"
              color="orange"
              size="small"
            >
              {{ searchForm.relationFilters.length }}
            </Tag>
          </div>
        </template>
        <template #extra>
          <Button type="link" size="small" @click="addRelationFilter">
            <PlusOutlined />
            添加
          </Button>
        </template>

        <div
          v-show="expandedPanels.includes('relations')"
          class="panel-content"
        >
          <div
            v-for="(filter, index) in searchForm.relationFilters"
            :key="index"
            class="filter-item"
          >
            <div class="filter-controls">
              <Select
                v-model:value="filter.relationType"
                placeholder="关系类型"
                style="width: 120px"
              >
                <Select.Option
                  v-for="type in relationTypeOptions"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </Select.Option>
              </Select>

              <Select v-model:value="filter.direction" style="width: 80px">
                <Select.Option value="outgoing">出关系</Select.Option>
                <Select.Option value="incoming">入关系</Select.Option>
              </Select>

              <InputNumber
                v-model:value="filter.relationDepth"
                :min="1"
                :max="5"
                placeholder="深度"
                style="width: 80px"
              />

              <Checkbox v-model:checked="filter.includeIndirect">
                间接关系
              </Checkbox>

              <Button
                type="text"
                danger
                size="small"
                @click="removeRelationFilter(index)"
              >
                <CloseOutlined />
              </Button>
            </div>
          </div>

          <div
            v-if="searchForm.relationFilters.length === 0"
            class="empty-state"
          >
            <p>暂无关系搜索条件</p>
          </div>
        </div>
      </Card>

      <!-- 标签搜索面板 -->
      <Card
        size="small"
        class="search-panel"
        :class="{ active: expandedPanels.includes('tags') }"
      >
        <template #title>
          <div class="panel-title" @click="togglePanel('tags')">
            <FilterOutlined class="title-icon" />
            <span>标签搜索</span>
            <Tag
              v-if="searchForm.tagFilters.length > 0"
              color="green"
              size="small"
            >
              {{ searchForm.tagFilters.length }}
            </Tag>
          </div>
        </template>
        <template #extra>
          <Button type="link" size="small" @click="addTagFilter">
            <PlusOutlined />
            添加
          </Button>
        </template>

        <div v-show="expandedPanels.includes('tags')" class="panel-content">
          <div
            v-for="(filter, index) in searchForm.tagFilters"
            :key="index"
            class="filter-item"
          >
            <div class="filter-controls">
              <Input
                v-model:value="filter.key"
                placeholder="标签键"
                style="width: 120px"
              />

              <Select v-model:value="filter.operator" style="width: 80px">
                <Select.Option value="eq">等于</Select.Option>
                <Select.Option value="in">包含</Select.Option>
                <Select.Option value="exists">存在</Select.Option>
              </Select>

              <Select
                v-if="filter.operator !== 'exists'"
                v-model:value="filter.values"
                mode="tags"
                placeholder="标签值"
                style="width: 150px"
              />

              <Button
                type="text"
                danger
                size="small"
                @click="removeTagFilter(index)"
              >
                <CloseOutlined />
              </Button>
            </div>
          </div>

          <div v-if="searchForm.tagFilters.length === 0" class="empty-state">
            <p>暂无标签搜索条件</p>
          </div>
        </div>
      </Card>

      <!-- 时间范围搜索面板 -->
      <Card
        size="small"
        class="search-panel"
        :class="{ active: expandedPanels.includes('timeRange') }"
      >
        <template #title>
          <div class="panel-title" @click="togglePanel('timeRange')">
            <FilterOutlined class="title-icon" />
            <span>时间范围搜索</span>
            <Tag
              v-if="searchForm.timeRangeSearch.field"
              color="purple"
              size="small"
            >
              已设置
            </Tag>
          </div>
        </template>

        <div
          v-show="expandedPanels.includes('timeRange')"
          class="panel-content"
        >
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">时间字段</label>
              <Select
                v-model:value="searchForm.timeRangeSearch.field"
                placeholder="选择时间字段"
                allow-clear
              >
                <Select.Option value="created_at">创建时间</Select.Option>
                <Select.Option value="updated_at">更新时间</Select.Option>
              </Select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-item">
              <label class="form-label">开始时间</label>
              <DatePicker
                v-model:value="searchForm.timeRangeSearch.startTime"
                show-time
                placeholder="选择开始时间"
                style="width: 100%"
              />
            </div>
            <div class="form-item">
              <label class="form-label">结束时间</label>
              <DatePicker
                v-model:value="searchForm.timeRangeSearch.endTime"
                show-time
                placeholder="选择结束时间"
                style="width: 100%"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-item">
              <label class="form-label">时间间隔</label>
              <Select
                v-model:value="searchForm.timeRangeSearch.interval"
                placeholder="选择时间间隔"
                allow-clear
              >
                <Select.Option value="hour">小时</Select.Option>
                <Select.Option value="day">天</Select.Option>
                <Select.Option value="week">周</Select.Option>
                <Select.Option value="month">月</Select.Option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <!-- 分面搜索面板 -->
      <Card
        size="small"
        class="search-panel"
        :class="{ active: expandedPanels.includes('facets') }"
      >
        <template #title>
          <div class="panel-title" @click="togglePanel('facets')">
            <FilterOutlined class="title-icon" />
            <span>分面搜索</span>
            <Tag
              v-if="searchForm.facetSearch.fields.length > 0"
              color="cyan"
              size="small"
            >
              {{ searchForm.facetSearch.fields.length }}
            </Tag>
          </div>
        </template>

        <div v-show="expandedPanels.includes('facets')" class="panel-content">
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">分面字段</label>
              <Select
                v-model:value="searchForm.facetSearch.fields"
                mode="multiple"
                placeholder="选择分面字段"
                allow-clear
              >
                <Select.Option
                  v-for="field in facetFieldOptions"
                  :key="field.value"
                  :value="field.value"
                >
                  {{ field.label }}
                </Select.Option>
              </Select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-item">
              <label class="form-label">每个分面返回项目数</label>
              <InputNumber
                v-model:value="searchForm.facetSearch.size"
                :min="1"
                :max="100"
                placeholder="默认10"
                style="width: 100%"
              />
            </div>
          </div>
        </div>
      </Card>

      <!-- 高级选项面板 -->
      <Card
        size="small"
        class="search-panel"
        :class="{ active: expandedPanels.includes('advanced') }"
      >
        <template #title>
          <div class="panel-title" @click="togglePanel('advanced')">
            <FilterOutlined class="title-icon" />
            <span>高级选项</span>
          </div>
        </template>

        <div v-show="expandedPanels.includes('advanced')" class="panel-content">
          <div class="form-row">
            <div class="form-item">
              <Checkbox v-model:checked="searchForm.withAggregations">
                启用聚合统计
              </Checkbox>
            </div>
          </div>

          <div class="form-row">
            <div class="form-item">
              <Checkbox v-model:checked="searchForm.forceEnhancedSearch">
                强制使用增强搜索引擎
              </Checkbox>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 底部操作栏 -->
    <template #footer>
      <div class="search-footer">
        <div class="search-info">
          <span>活跃条件: {{ activeFiltersCount }}</span>
        </div>
        <Space>
          <Button @click="handleReset">重置</Button>
          <Button type="primary" @click="handleSearch">
            <SearchOutlined />
            搜索
          </Button>
        </Space>
      </div>
    </template>
  </Drawer>
</template>

<style scoped>


/* 响应式设计 */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 8px;
  }

  .filter-controls {
    flex-wrap: wrap;
    gap: 4px;
  }

  .search-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}

.advanced-search-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 60px;
}

.search-panel {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.search-panel.active {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgb(24 144 255 / 10%);
}

.panel-title {
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.title-icon {
  color: #1890ff;
}

.panel-content {
  padding-top: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-item {
  flex: 1;
  min-width: 0;
}

.form-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.filter-item {
  padding: 12px;
  margin-bottom: 8px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.filter-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.filter-value {
  margin-top: 8px;
}

.empty-state {
  padding: 20px;
  color: #999;
  text-align: center;
}

.search-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
}

.search-info {
  font-size: 12px;
  color: #666;
}
</style>
