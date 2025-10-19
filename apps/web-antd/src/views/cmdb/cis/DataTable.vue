<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue';

// 导入新的搜索相关类型
// @ts-ignore
import type { CisListRequest } from '#/api/cmdb/cis/model';

import { computed, h, ref, watch } from 'vue';

import {
  DeleteOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  TimePicker,
} from 'ant-design-vue';

// 导入CI类型API和数据结构
// @ts-ignore
import { listAttributeGroupWithAttribute } from '#/api/cmdb/ci_types';
// 导入CIS API
// @ts-ignore
import { batchDeleteCis, getCisList } from '#/api/cmdb/cis';

// 导入高级搜索组件

// 使用any类型避免类型冲突
type AttributeGroup = any;
type AttributeItem = any;
type ChoiceItem = any;
type CisInfo = any;
type ConfigItem = any;

// 定义Key类型
type Key = number | string;

// 处理后的属性类型，用于表格显示和查询
interface ProcessedAttribute {
  id: number;
  name: string;
  alias: string;
  valueType: string;
  required: boolean;
  listShow: boolean;
  sort: number;
  isChoice: boolean;
  choices?: ChoiceItem[];
  itemSort: number;
  groupSort: number;
}

interface Props {
  typeId: null | number;
}

interface Emits {
  (e: 'edit', id: number): void;
  (e: 'view', id: number, typeId: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const loading = ref(false);
const tableData = ref<ConfigItem[]>([]);
const attributeGroups = ref<AttributeGroup[]>([]); // 存储原始分组数据
const processedAttributes = ref<ProcessedAttribute[]>([]); // 处理后的属性列表

// 分页参数
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
});

// 选中的行
const selectedRowKeys = ref<Key[]>([]);

// 搜索相关状态
const searchDrawerVisible = ref(false);
const searchValue = ref('');
const searchFilters = ref<any[]>([]);

// 操作符选项
const operators = [
  { value: 'eq', label: '等于', types: ['text', 'int', 'float', 'bool'] },
  { value: 'ne', label: '不等于', types: ['text', 'int', 'float', 'bool'] },
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
  { value: 'empty', label: '为空', types: ['text', 'int', 'float', 'bool'] },
  {
    value: 'not_empty',
    label: '不为空',
    types: ['text', 'int', 'float', 'bool'],
  },
  { value: 'today', label: '今天', types: ['date', 'datetime'] },
  { value: 'yesterday', label: '昨天', types: ['date', 'datetime'] },
  { value: 'contains', label: 'JSON包含', types: ['json'] },
];

// 处理属性数据：从分组数据中提取所有属性并排序
function processAttributeData(groups: AttributeGroup[]): ProcessedAttribute[] {
  const attributes: ProcessedAttribute[] = [];

  // 按分组排序
  const sortedGroups = [...groups].sort(
    (a, b) => (a.sort || 0) - (b.sort || 0),
  );

  sortedGroups.forEach((group) => {
    // 按item排序
    const sortedItems = [...(group.items || [])].sort(
      (a, b) => (a.sort || 0) - (b.sort || 0),
    );

    sortedItems.forEach((item: AttributeItem) => {
      if (item.attribute) {
        attributes.push({
          id: item.attribute.id,
          name: item.attribute.name,
          alias: item.attribute.alias,
          valueType: item.attribute.valueType,
          required: item.isRequired || false,
          listShow: item.listShow,
          sort: item.attribute.id, // 使用属性ID作为排序
          isChoice: item.attribute.isChoice,
          choices: item.attribute.choices || undefined,
          itemSort: item.sort || 0,
          groupSort: group.sort || 0,
        });
      }
    });
  });

  return attributes;
}

// 计算属性选项
const attributeOptions = computed(() => {
  return processedAttributes.value.map((attr) => ({
    value: attr.id,
    label: attr.alias || attr.name,
    valueType: attr.valueType,
    choices: attr.choices?.map((choice) => ({
      label: choice.meta?.label || choice.value || '',
      value: choice.value || '',
    })),
  }));
});

// 获取支持的操作符
const getSupportedOperators = (valueType: string) => {
  return operators.filter((op) => op.types.includes(valueType));
};

// 根据值类型转换值
function convertValueByType(value: any, valueType: string): any {
  // 如果值为空，直接返回
  if (value === null || value === undefined) {
    return null;
  }

  // 空字符串根据类型处理
  if (value === '') {
    switch (valueType) {
      case 'float':
      case 'int': {
        return null;
      }
      default: {
        return '';
      }
    }
  }

  switch (valueType) {
    case 'bool':
    case 'boolean': {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        return (
          lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes'
        );
      }
      if (typeof value === 'number') {
        return value !== 0;
      }
      return Boolean(value);
    }
    case 'char':
    case 'string':
    case 'text':
    case 'varchar': {
      // 文本类型转换为字符串
      return String(value);
    }
    case 'date': {
      // 日期类型，确保格式正确
      if (value instanceof Date) {
        return value.toISOString().split('T')[0];
      }
      if (typeof value === 'string') {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
      return value;
    }
    case 'datetime': {
      // 日期时间类型
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (typeof value === 'string') {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          return date.toISOString();
        }
      }
      return value;
    }
    case 'decimal':
    case 'float':
    case 'number': {
      if (typeof value === 'number') {
        return value;
      }
      const num = Number(value);
      if (Number.isNaN(num)) {
        console.warn(`无法将值 "${value}" 转换为浮点数`);
        return null;
      }
      return num;
    }
    case 'int':
    case 'integer': {
      if (typeof value === 'number') {
        return Math.floor(value);
      }
      const num = Number(value);
      if (Number.isNaN(num)) {
        console.warn(`无法将值 "${value}" 转换为整数`);
        return null;
      }
      return Math.floor(num);
    }
    case 'time': {
      // 时间类型
      if (typeof value === 'string' && /^\d{2}:\d{2}(?::\d{2})?$/.test(value)) {
        return value;
      }
      return value;
    }
    default: {
      // 文本类型转换为字符串
      return String(value);
    }
  }
}

// 生成表格列配置
const columns = computed<TableColumnsType>(() => {
  const baseColumns: TableColumnsType = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
    },
  ];

  // 只显示listShow为true的属性
  const dynamicColumns: TableColumnsType = processedAttributes.value
    .filter((attr) => attr.listShow)
    .map((attr) => ({
      title: attr.alias,
      dataIndex: attr.name,
      key: attr.name,
      width: getColumnWidth(attr.valueType),
      customRender: attr.isChoice
        ? ({ text }) => {
            const choice = attr.choices?.find((c) => c.value === text);
            if (choice && choice.meta?.style) {
              const style = choice.meta.style;
              return h(
                Tag,
                {
                  style: {
                    backgroundColor: style.bgColor || undefined,
                    color: style.fontColor || undefined,
                    fontWeight: style.fontWeight || undefined,
                    fontStyle: style.fontStyle || undefined,
                    textDecoration: style.textDecoration || undefined,
                  },
                },
                { default: () => choice.meta?.label || choice.value },
              );
            }
            return text;
          }
        : undefined,
    }));

  const actionColumn: TableColumnsType = [
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      customRender: ({ record }) =>
        h(
          Space,
          {},
          {
            default: () => [
              h(
                Button,
                {
                  type: 'link',
                  size: 'small',
                  onClick: () => handleView(record.id),
                },
                { default: () => '查看' },
              ),
              h(
                Button,
                {
                  type: 'link',
                  size: 'small',
                  onClick: () => handleEdit(record.id),
                },
                { default: () => '编辑' },
              ),
              h(
                Button,
                {
                  type: 'link',
                  size: 'small',
                  danger: true,
                  onClick: () => handleDelete(record.id),
                },
                { default: () => '删除' },
              ),
            ],
          },
        ),
    },
  ];

  return [...baseColumns, ...dynamicColumns, ...actionColumn];
});

// 获取列宽
function getColumnWidth(valueType: string): number {
  switch (valueType) {
    case 'boolean': {
      return 80;
    }
    case 'date': {
      return 180;
    }
    case 'number': {
      return 100;
    }
    case 'select': {
      return 120;
    }
    case 'text': {
      return 200;
    }
    default: {
      return 120;
    }
  }
}

// 转换CisInfo到ConfigItem
function transformCisInfoToConfigItem(cisInfo: CisInfo): ConfigItem {
  console.log(cisInfo);
  const configItem: ConfigItem = {
    id: cisInfo.id || 0,
    typeId: cisInfo.typeId || 0,
    status: cisInfo.status,
    available: cisInfo.available,
    createdAt: cisInfo.createdAt,
    updatedAt: cisInfo.updatedAt,
    updatedBy: cisInfo.updatedBy,
  };

  // 将属性值转换为动态属性
  if (cisInfo.attributes) {
    (cisInfo.attributes as any[]).forEach((attr) => {
      // 如果碰到ID字段，跳过
      if (attr.attrName === 'id') {
        configItem['o_id'] = attr.value;
        return;
      }
      configItem[attr.attrName] = attr.value;
    });
  }

  return configItem;
}

// 加载CI类型属性定义
async function loadAttributes() {
  if (!props.typeId) return;

  try {
    loading.value = true;
    const response = await listAttributeGroupWithAttribute(props.typeId);
    console.log('属性分组响应:', response);

    if (response && Array.isArray(response)) {
      // 存储原始分组数据
      attributeGroups.value = response;

      // 处理属性数据
      processedAttributes.value = processAttributeData(response);
      console.log('处理后的属性:', processedAttributes.value);
    } else {
      console.log('没有获取到属性分组数据或数据格式不正确');
      attributeGroups.value = [];
      processedAttributes.value = [];
    }

    // 无论是否有属性都要加载数据
    await loadData();
  } catch (error) {
    console.error('加载属性定义失败:', error);
    message.error('加载属性定义失败');
  } finally {
    loading.value = false;
  }
}

// 加载表格数据
async function loadData() {
  if (!props.typeId) return;

  try {
    loading.value = true;

    // 构建查询参数
    const params: CisListRequest = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      typeId: props.typeId,
      withAttributes: true,
    };

    // 添加搜索条件
    if (searchValue.value) {
      params.search = searchValue.value;
    }

    // 添加高级过滤条件
    if (searchFilters.value.length > 0) {
      params.attributeFilters = searchFilters.value
        .filter((filter) => {
          // 过滤掉无效的条件
          return (
            filter.attrId &&
            filter.operator &&
            (filter.operator === 'empty' ||
              (filter.operator === 'in' &&
                filter.values &&
                filter.values.length > 0) ||
              (filter.operator !== 'in' &&
                filter.value !== undefined &&
                filter.value !== null &&
                filter.value !== ''))
          );
        })
        .map((filter) => {
          // 清理和转换数据
          const cleanFilter: any = {
            attrId: filter.attrId,
            attrName: filter.attrName,
            valueType: filter.valueType,
            operator: filter.operator,
          };

          // 根据操作符类型添加相应的值字段
          if (filter.operator === 'empty') {
            // empty操作符不需要value字段
          } else if (filter.operator === 'in') {
            // in操作符使用values字段
            if (filter.values && filter.values.length > 0) {
              cleanFilter.values = filter.values.map((val: any) =>
                convertValueByType(val, filter.valueType),
              );
            }
          } else {
            // 其他操作符使用value字段
            if (
              filter.value !== undefined &&
              filter.value !== null &&
              filter.value !== ''
            ) {
              cleanFilter.value = convertValueByType(
                filter.value,
                filter.valueType,
              );
            }
          }

          return cleanFilter;
        });
    }

    const response = await getCisList(params);
    console.log('API响应:', response);

    // 直接处理data数据（全局请求已处理code/msg）
    if (response && typeof response === 'object') {
      // 处理返回的数据结构 { total: number, data: array, aggregations: any }
      if ('total' in response) {
        tableData.value =
          response.data && Array.isArray(response.data)
            ? response.data.map((cisInfo: any) =>
                transformCisInfoToConfigItem(cisInfo),
              )
            : [];
        pagination.value.total = Number(response.total) || 0;
      } else {
        // 兜底处理
        tableData.value = [];
        pagination.value.total = 0;
      }
    } else {
      tableData.value = [];
      pagination.value.total = 0;
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

// 处理分页变化
function handleTableChange(pag: any) {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  loadData();
}

// 处理批量删除
function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的数据');
    return;
  }

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条数据吗？`,
    async onOk() {
      try {
        const ids = selectedRowKeys.value.map(Number);
        await batchDeleteCis(ids);
        selectedRowKeys.value = [];
        loadData();
      } catch (error) {
        console.error('删除失败:', error);
      }
    },
  });
}

// 处理单个删除
function handleDelete(id: number) {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条数据吗？',
    async onOk() {
      try {
        await batchDeleteCis([id]);
        loadData();
      } catch (error) {
        console.error('删除失败:', error);
      }
    },
  });
}

// 处理编辑
function handleEdit(id: number) {
  emit('edit', id);
}

// 处理查看详情
function handleView(id: number) {
  emit('view', id, props.typeId!);
}

// 表格行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: Key[]) => {
    selectedRowKeys.value = keys;
  },
}));

// === 搜索功能 ===

// 打开搜索抽屉
const openSearchDrawer = () => {
  searchDrawerVisible.value = true;
};

// 关闭搜索抽屉
const closeSearchDrawer = () => {
  searchDrawerVisible.value = false;
};

// 添加过滤条件
const addFilter = () => {
  searchFilters.value.push({
    attrId: undefined,
    attrName: '',
    valueType: 'text',
    operator: 'eq',
    value: undefined,
  });
};

// 删除过滤条件
const removeFilter = (index: number) => {
  searchFilters.value.splice(index, 1);
};

// 处理属性变化
const handleAttributeChange = (filter: any, attrId: any) => {
  const attr = attributeOptions.value.find((a) => a.value === attrId);
  if (attr) {
    filter.attrId = attrId;
    filter.attrName = attr.label;
    filter.valueType = attr.valueType;
    filter.operator = 'eq';
    filter.value = undefined;
    filter.values = undefined;
  }
};

// 处理操作符变化
const handleOperatorChange = (filter: any, operator: any) => {
  filter.operator = operator;
  filter.value = undefined;
  filter.values = undefined;
};

// 渲染值输入组件
const renderValueInput = (filter: any) => {
  const attr = attributeOptions.value.find((a) => a.value === filter.attrId);
  if (!attr) return null;

  if (filter.operator === 'empty') {
    return null;
  }

  if (filter.operator === 'in') {
    return h(Select, {
      mode: 'tags',
      placeholder: '输入多个值，回车分隔',
      style: 'width: 100%; min-width: 200px',
      size: 'small',
      value: filter.values,
      'onUpdate:value': (value: any) => {
        filter.values = value;
      },
    });
  }

  // 选择类型
  if (attr.choices && attr.choices.length > 0) {
    return h(
      Select,
      {
        allowClear: true,
        placeholder: '请选择',
        style: 'width: 100%; min-width: 200px',
        size: 'small',
        value: filter.value,
        'onUpdate:value': (value: any) => {
          filter.value = value;
        },
      },
      () =>
        attr.choices!.map((choice) =>
          h(
            Select.Option,
            {
              key: choice.value,
              value: choice.value,
            },
            () => choice.label,
          ),
        ),
    );
  }

  // 根据类型渲染不同输入组件
  switch (attr.valueType) {
    case 'bool': {
      return h(
        Select,
        {
          allowClear: true,
          placeholder: '请选择',
          style: 'width: 100%; min-width: 200px',
          size: 'small',
          value: filter.value,
          'onUpdate:value': (value: any) => {
            filter.value = value;
          },
        },
        () => [
          h(Select.Option, { value: true }, () => '是'),
          h(Select.Option, { value: false }, () => '否'),
        ],
      );
    }
    case 'date': {
      return h(DatePicker, {
        placeholder: '请选择日期',
        style: 'width: 100%; min-width: 200px',
        size: 'small',
        value: filter.value,
        'onUpdate:value': (value: any) => {
          filter.value = value;
        },
      });
    }
    case 'datetime': {
      return h(DatePicker, {
        placeholder: '请选择日期时间',
        showTime: true,
        style: 'width: 100%; min-width: 200px',
        size: 'small',
        value: filter.value,
        'onUpdate:value': (value: any) => {
          filter.value = value;
        },
      });
    }
    case 'float': {
      return h(InputNumber, {
        placeholder: '请输入小数',
        step: 0.1,
        style: 'width: 100%; min-width: 200px',
        size: 'small',
        value: filter.value,
        'onUpdate:value': (value: any) => {
          filter.value = value;
        },
      });
    }
    case 'int': {
      return h(InputNumber, {
        placeholder: '请输入数字',
        style: 'width: 100%; min-width: 200px',
        size: 'small',
        value: filter.value,
        'onUpdate:value': (value: any) => {
          filter.value = value;
        },
      });
    }
    case 'time': {
      return h(TimePicker, {
        placeholder: '请选择时间',
        style: 'width: 100%; min-width: 200px',
        size: 'small',
        value: filter.value,
        'onUpdate:value': (value: any) => {
          filter.value = value;
        },
      });
    }
    default: {
      return h(Input, {
        placeholder: '请输入值',
        style: 'width: 100%; min-width: 200px',
        size: 'small',
        value: filter.value,
        'onUpdate:value': (value: any) => {
          filter.value = value;
        },
      });
    }
  }
};

// 执行搜索
const handleSearch = () => {
  pagination.value.current = 1;
  loadData();
  closeSearchDrawer();
};

// 重置搜索
const handleReset = () => {
  searchValue.value = '';
  searchFilters.value = [];
  pagination.value.current = 1;
  loadData();
};

// 快速搜索（回车）
const handleQuickSearch = () => {
  pagination.value.current = 1;
  loadData();
};

// 监听typeId变化
watch(
  () => props.typeId,
  (newTypeId) => {
    if (newTypeId) {
      // 重置状态
      tableData.value = [];
      attributeGroups.value = [];
      processedAttributes.value = [];
      selectedRowKeys.value = [];
      searchValue.value = '';
      searchFilters.value = [];
      pagination.value.current = 1;

      // 加载新的属性定义
      loadAttributes();
    }
  },
  { immediate: true },
);

// 暴露方法给父组件
defineExpose({
  loadData,
  loadAttributes,
  getAttributeGroups: () => attributeGroups.value,
  getProcessedAttributes: () => processedAttributes.value,
});
</script>

<script lang="ts">
export default {
  name: 'DataTable',
};
</script>

<template>
  <div class="data-table-container h-full">
    <!-- 搜索工具栏 -->
    <div class="search-toolbar mb-4">
      <Card>
        <div class="search-content">
          <Space size="middle">
            <!-- 快速搜索 -->
            <Input
              :value="searchValue"
              placeholder="搜索配置项..."
              style="width: 300px"
              allow-clear
              @update:value="(value) => (searchValue = value)"
              @press-enter="handleQuickSearch"
            >
              <template #prefix>
                <SearchOutlined />
              </template>
            </Input>

            <!-- 搜索按钮 -->
            <Button type="primary" @click="handleQuickSearch">
              <SearchOutlined />
              搜索
            </Button>

            <!-- 高级搜索按钮 -->
            <Button
              v-if="processedAttributes.length > 0"
              @click="openSearchDrawer"
            >
              <FilterOutlined />
              高级搜索
              <span v-if="searchFilters.length > 0" class="filter-count">
                ({{ searchFilters.length }})
              </span>
            </Button>

            <!-- 重置按钮 -->
            <Button @click="handleReset">重置</Button>

            <!-- 批量删除 -->
            <Button
              v-if="selectedRowKeys.length > 0"
              type="primary"
              danger
              @click="handleBatchDelete"
            >
              批量删除 ({{ selectedRowKeys.length }})
            </Button>
          </Space>
        </div>
      </Card>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper flex-1">
      <Table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        :scroll="{ x: 'max-content', y: 'calc(100vh - 400px)' }"
        :locale="{
          emptyText:
            tableData.length === 0 && !loading
              ? processedAttributes.length === 0
                ? '当前CI类型暂无属性定义，无法显示数据'
                : '暂无数据'
              : '暂无数据',
        }"
        row-key="id"
        size="middle"
        bordered
        @change="handleTableChange"
      />
    </div>

    <!-- 高级搜索抽屉 -->
    <Drawer
      :open="searchDrawerVisible"
      title="高级搜索"
      width="800"
      placement="right"
      :closable="true"
      @close="closeSearchDrawer"
    >
      <div class="advanced-search-container">
        <!-- 搜索卡片 -->
        <Card class="search-card" size="small">
          <template #title>
            <div class="card-title">
              <SearchOutlined class="title-icon" />
              <span>基础搜索</span>
            </div>
          </template>
          
          <div class="basic-search-content">
            <Input
              :value="searchValue"
              placeholder="在所有文本字段中搜索..."
              allow-clear
              @update:value="(value) => (searchValue = value)"
            >
              <template #prefix>
                <SearchOutlined />
              </template>
            </Input>
          </div>
        </Card>

        <!-- 过滤条件卡片 -->
        <Card class="filter-card" size="small">
          <template #title>
            <div class="card-title">
              <FilterOutlined class="title-icon" />
              <span>过滤条件</span>
              <Tag v-if="searchFilters.length > 0" color="blue" size="small">
                {{ searchFilters.length }}
              </Tag>
            </div>
          </template>
          
          <template #extra>
            <Button type="primary" size="small" @click="addFilter">
              <PlusOutlined />
              添加条件
            </Button>
          </template>

          <div class="filter-content">
            <div class="filter-list">
              <div
                v-for="(filter, index) in searchFilters"
                :key="index"
                class="filter-item"
              >
                <div class="filter-header">
                  <span class="filter-index">条件 {{ index + 1 }}</span>
                  <Button
                    type="text"
                    danger
                    size="small"
                    @click="removeFilter(index)"
                  >
                    <DeleteOutlined />
                    删除
                  </Button>
                </div>
                
                <div class="filter-controls">
                  <div class="control-row">
                    <div class="control-group">
                      <label class="control-label">属性</label>
                      <Select
                        :value="filter.attrId"
                        @update:value="(value) => handleAttributeChange(filter, value)"
                        placeholder="选择属性"
                        size="small"
                        show-search
                        style="width: 200px"
                        :filter-option="
                          (input, option) =>
                            String(option?.children || '')
                              .toLowerCase()
                              .includes(input.toLowerCase())
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
                    </div>

                    <div class="control-group">
                      <label class="control-label">操作符</label>
                      <Select
                        :value="filter.operator"
                        @update:value="(value) => handleOperatorChange(filter, value)"
                        placeholder="选择操作符"
                        size="small"
                        style="width: 120px"
                      >
                        <Select.Option
                          v-for="op in getSupportedOperators(filter.valueType)"
                          :key="op.value"
                          :value="op.value"
                        >
                          {{ op.label }}
                        </Select.Option>
                      </Select>
                    </div>

                    <div v-if="filter.operator !== 'empty'" class="control-group value-flex">
                      <label class="control-label">值</label>
                      <div class="value-input">
                        <component :is="() => renderValueInput(filter)" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="searchFilters.length === 0" class="empty-state">
                <div class="empty-content">
                  <FilterOutlined class="empty-icon" />
                  <p class="empty-text">暂无过滤条件</p>
                  <p class="empty-desc">点击"添加条件"开始设置过滤规则</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- 操作按钮 -->
        <div class="action-footer">
          <Space size="middle">
            <Button type="primary" @click="handleSearch">
              <SearchOutlined />
              执行搜索
            </Button>
            <Button @click="handleReset">
              重置条件
            </Button>
            <Button @click="closeSearchDrawer">
              取消
            </Button>
          </Space>
        </div>
      </div>
    </Drawer>
  </div>
</template>

<style scoped>
/* 响应式设计 */
@media (max-width: 768px) {
  .search-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .filter-item {
    padding: 12px;
  }
}

.data-table-container {
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.search-toolbar {
  margin-bottom: 16px;
}

.search-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-count {
  font-weight: 500;
  color: #1890ff;
}

.table-wrapper {
  padding: 16px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

/* 高级搜索容器样式 */
.advanced-search-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
  padding: 0;
}

/* 卡片样式 */
.search-card,
.filter-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
  transition: all 0.3s ease;
}

.search-card:hover,
.filter-card:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.title-icon {
  color: #1890ff;
  font-size: 16px;
}

/* 基础搜索内容 */
.basic-search-content {
  padding: 8px 0;
}

/* 过滤内容 */
.filter-content {
  padding: 8px 0;
}

.filter-list {
  max-height: calc(100vh - 350px);
  overflow-y: auto;
  overflow-x: hidden;
}

/* 滚动条样式 */
.filter-list::-webkit-scrollbar {
  width: 6px;
}

.filter-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.filter-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.filter-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 过滤条件项 */
.filter-item {
  padding: 16px;
  margin-bottom: 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.filter-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgb(24 144 255 / 10%);
  background: #f6fafe;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.filter-index {
  font-size: 14px;
  font-weight: 500;
  color: #1890ff;
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-row,
.value-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.control-label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
}

.value-input {
  min-width: 260px;
  max-width: 420px;
}

.value-flex {
  flex: 1;
  min-width: 220px;
}

/* 空状态 */
.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon {
  font-size: 48px;
  color: #d9d9d9;
}

.empty-text {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #8c8c8c;
}

.empty-desc {
  margin: 0;
  font-size: 14px;
  color: #bfbfbf;
}

/* 操作区域 */
.action-footer {
  margin-top: auto;
  padding: 16px 0;
  text-align: center;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  border-radius: 0 0 8px 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .control-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    width: 100%;
  }
  
  .value-input {
    min-width: auto;
    max-width: none;
  }
}
</style>
