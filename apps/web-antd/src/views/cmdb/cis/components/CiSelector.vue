<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue';

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
  Divider,
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
import {
  getCiTypeList,
  listAttributeGroupWithAttribute,
} from '#/api/cmdb/ci_types';
// @ts-ignore
import { getCisList } from '#/api/cmdb/cis';

// 使用any类型避免类型冲突
type AttributeGroup = any;
type AttributeItem = any;
type ChoiceItem = any;
type CisInfo = any;
type CisListRequest = any;
type ConfigItem = any;
type CiType = any;

// 定义Key类型
type Key = number | string;

// 选中的CI项
interface SelectedCiItem {
  id: number;
  typeId: number;
  typeName: string;
  displayName: string; // 用于显示的名称
  [key: string]: any; // 其他属性
}

// 处理后的属性类型
interface ProcessedAttribute {
  id: number;
  name: string;
  alias: string;
  valueType: string;
  required: boolean;
  defaultShow: boolean;
  sort: number;
  isChoice: boolean;
  choices?: ChoiceItem[];
  itemSort: number;
  groupSort: number;
}

interface Props {
  open: boolean;
  multiple?: boolean; // 是否支持多选，默认false
  title?: string; // 弹窗标题
  selectedCis?: SelectedCiItem[]; // 已选中的CI列表
  allowedTypes?: number[]; // 允许选择的CI类型ID列表，为空表示所有类型
}

interface Emits {
  (e: 'update:open', value: boolean): void;
  (e: 'confirm', selectedCis: SelectedCiItem[]): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  title: '选择配置项',
  selectedCis: () => [],
  allowedTypes: () => [],
});

const emit = defineEmits<Emits>();

// 响应式数据
const loading = ref(false);
const tableData = ref<ConfigItem[]>([]);
const attributeGroups = ref<AttributeGroup[]>([]);
const processedAttributes = ref<ProcessedAttribute[]>([]);
const ciTypes = ref<CiType[]>([]);

// 当前选中的CI类型
const selectedTypeId = ref<null | number>(null);
const selectedTypeName = ref<string>('');

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
const selectedCiItems = ref<SelectedCiItem[]>([]);

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
  { value: 'empty', label: '为空', types: ['text', 'int', 'float', 'bool'] },
];

// 处理属性数据
function processAttributeData(groups: AttributeGroup[]): ProcessedAttribute[] {
  const attributes: ProcessedAttribute[] = [];

  const sortedGroups = [...groups].sort(
    (a, b) => (a.sort || 0) - (b.sort || 0),
  );

  sortedGroups.forEach((group) => {
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
          defaultShow: item.defaultShow,
          sort: item.attribute.id,
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
    case 'time':
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

  // 只显示defaultShow为true的属性
  const dynamicColumns: TableColumnsType = processedAttributes.value
    .filter((attr) => attr.defaultShow)
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

  return [...baseColumns, ...dynamicColumns];
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
      configItem[attr.attrName] = attr.value;
    });
  }

  return configItem;
}

// 生成显示名称
function generateDisplayName(configItem: ConfigItem): string {
  // 优先使用name、hostname、ip等常见标识字段
  const nameFields = ['name', 'hostname', 'ip', 'title', 'label'];
  for (const field of nameFields) {
    if (configItem[field]) {
      return String(configItem[field]);
    }
  }
  // 如果没有找到合适的字段，使用ID
  return `CI-${configItem.id}`;
}

// 加载CI类型列表
async function loadCiTypes() {
  try {
    const response = await getCiTypeList({ page: 1, pageSize: 1000 });

    // 处理API响应数据结构
    let types: any[] = [];
    if (response) {
      if (Array.isArray(response)) {
        // 如果响应直接是数组
        types = response;
      } else if (response.data && Array.isArray(response.data)) {
        // 如果响应是 { total, data } 结构
        types = response.data;
      }
    }

    // 如果指定了允许的类型，进行过滤
    if (props.allowedTypes.length > 0) {
      types = types.filter((type: any) => props.allowedTypes.includes(type.id));
    }

    ciTypes.value = types;

    // 默认选择第一个类型
    if (types.length > 0) {
      selectedTypeId.value = types[0]?.id || null;
      selectedTypeName.value = types[0]?.alias || types[0]?.name || '';
      await loadAttributes();
    }
  } catch (error) {
    console.error('加载CI类型失败:', error);
    message.error('加载CI类型失败');
  }
}

// 加载CI类型属性定义
async function loadAttributes() {
  if (!selectedTypeId.value) return;

  try {
    loading.value = true;
    const response = await listAttributeGroupWithAttribute(
      selectedTypeId.value,
    );

    if (response && Array.isArray(response)) {
      attributeGroups.value = response;
      processedAttributes.value = processAttributeData(response);
    } else {
      attributeGroups.value = [];
      processedAttributes.value = [];
    }

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
  if (!selectedTypeId.value) return;

  try {
    loading.value = true;

    const params: CisListRequest = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      typeId: selectedTypeId.value,
      withAttributes: true,
    };

    if (searchValue.value) {
      params.search = searchValue.value;
    }

    if (searchFilters.value.length > 0) {
      params.attributeFilters = searchFilters.value
        .filter((filter) => {
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
          const cleanFilter: any = {
            attrId: filter.attrId,
            attrName: filter.attrName,
            valueType: filter.valueType,
            operator: filter.operator,
          };

          if (filter.operator === 'empty') {
            // empty操作符不需要value字段
          } else if (filter.operator === 'in') {
            if (filter.values && filter.values.length > 0) {
              cleanFilter.values = filter.values.map((val: any) =>
                convertValueByType(val, filter.valueType),
              );
            }
          } else {
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

    if (response && typeof response === 'object') {
      if ('total' in response) {
        tableData.value =
          response.data && Array.isArray(response.data)
            ? response.data.map((cisInfo: any) =>
                transformCisInfoToConfigItem(cisInfo),
              )
            : [];
        pagination.value.total = Number(response.total) || 0;
      } else {
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

// 处理CI类型切换
async function handleTypeChange(typeId: number) {
  const type = ciTypes.value.find((t) => t.id === typeId);
  if (type) {
    selectedTypeId.value = typeId;
    selectedTypeName.value = type.alias || type.name;

    // 重置分页和搜索
    pagination.value.current = 1;
    searchValue.value = '';
    searchFilters.value = [];
    selectedRowKeys.value = [];

    await loadAttributes();
  }
}

// 表格行选择配置
const rowSelection = computed(() => ({
  type: (props.multiple ? 'checkbox' : 'radio') as 'checkbox' | 'radio',
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: Key[], selectedRows: ConfigItem[]) => {
    selectedRowKeys.value = keys;

    // 更新选中的CI项
    const newSelectedItems = selectedRows.map((row) => ({
      id: row.id,
      typeId: row.typeId,
      typeName: selectedTypeName.value,
      displayName: generateDisplayName(row),
      ...row,
    }));

    if (props.multiple) {
      // 多选模式：合并不同类型的选择
      const existingItems = selectedCiItems.value.filter(
        (item) => item.typeId !== selectedTypeId.value,
      );
      selectedCiItems.value = [...existingItems, ...newSelectedItems];
    } else {
      // 单选模式：只保留当前选择
      selectedCiItems.value = newSelectedItems;
    }
  },
}));

// 搜索功能
const openSearchDrawer = () => {
  searchDrawerVisible.value = true;
};

const closeSearchDrawer = () => {
  searchDrawerVisible.value = false;
};

const addFilter = () => {
  searchFilters.value.push({
    attrId: undefined,
    attrName: '',
    valueType: 'text',
    operator: 'eq',
    value: undefined,
  });
};

const removeFilter = (index: number) => {
  searchFilters.value.splice(index, 1);
};

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
      size: 'large',
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
        size: 'large',
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
          size: 'large',
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
        size: 'large',
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
        size: 'large',
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
        size: 'large',
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
        size: 'large',
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
        size: 'large',
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
        size: 'large',
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
  message.success('搜索条件已应用');
};

// 重置搜索
const handleReset = () => {
  searchValue.value = '';
  searchFilters.value = [];
  pagination.value.current = 1;
  loadData();
  message.success('搜索条件已重置');
};

// 快速搜索
const handleQuickSearch = () => {
  pagination.value.current = 1;
  loadData();
};

// 移除已选中的CI
const removeSelectedCi = (ciId: number, typeId: number) => {
  selectedCiItems.value = selectedCiItems.value.filter(
    (item) => !(item.id === ciId && item.typeId === typeId),
  );

  // 如果是当前类型的CI，同时更新表格选择
  if (typeId === selectedTypeId.value) {
    selectedRowKeys.value = selectedRowKeys.value.filter((key) => key !== ciId);
  }
};

// 确认选择
const handleConfirm = () => {
  emit('confirm', selectedCiItems.value);
  handleClose();
};

// 取消选择
const handleCancel = () => {
  emit('cancel');
  handleClose();
};

// 关闭弹窗
const handleClose = () => {
  emit('update:open', false);
};

// 监听弹窗打开状态
watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      // 初始化选中状态
      selectedCiItems.value = [...props.selectedCis];

      // 加载CI类型列表
      loadCiTypes();
    } else {
      // 重置状态
      selectedRowKeys.value = [];
      selectedCiItems.value = [];
      searchValue.value = '';
      searchFilters.value = [];
      pagination.value.current = 1;
    }
  },
  { immediate: true },
);

// 监听当前类型变化，更新表格选择状态
watch(
  () => [selectedTypeId.value, selectedCiItems.value],
  () => {
    if (selectedTypeId.value) {
      // 找出当前类型下已选中的CI
      const currentTypeSelectedIds = selectedCiItems.value
        .filter((item) => item.typeId === selectedTypeId.value)
        .map((item) => item.id);

      selectedRowKeys.value = currentTypeSelectedIds;
    }
  },
  { deep: true },
);
</script>

<script lang="ts">
export default {
  name: 'CiSelector',
};
</script>

<template>
  <Modal
    :open="open"
    :title="title"
    width="1200"
    :closable="true"
    :mask-closable="false"
    @cancel="handleCancel"
  >
    <div class="ci-selector-container">
      <!-- 左侧：CI类型选择 -->
      <div class="ci-types-panel">
        <div class="panel-title">CI类型</div>
        <div class="ci-types-list">
          <div
            v-for="type in ciTypes"
            :key="type.id"
            class="ci-type-item"
            :class="{ active: selectedTypeId === type.id }"
            @click="handleTypeChange(type.id)"
          >
            {{ type.alias || type.name }}
          </div>
        </div>
      </div>

      <!-- 右侧：CI列表和搜索 -->
      <div class="ci-list-panel">
        <!-- 搜索工具栏 -->
        <div class="search-toolbar">
          <Card size="small">
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
              </Space>
            </div>
          </Card>
        </div>

        <!-- 数据表格 -->
        <div class="table-wrapper">
          <Table
            :columns="columns"
            :data-source="tableData"
            :loading="loading"
            :pagination="pagination"
            :row-selection="rowSelection"
            :scroll="{ x: 'max-content', y: 400 }"
            :locale="{
              emptyText:
                tableData.length === 0 && !loading
                  ? processedAttributes.length === 0
                    ? '当前CI类型暂无属性定义，无法显示数据'
                    : '暂无数据'
                  : '暂无数据',
            }"
            row-key="id"
            size="small"
            bordered
            @change="handleTableChange"
          />
        </div>
      </div>
    </div>

    <!-- 已选择的CI列表 -->
    <div v-if="selectedCiItems.length > 0" class="selected-cis">
      <div class="selected-title">
        已选择 {{ selectedCiItems.length }} 个配置项
        <span v-if="!multiple" class="selection-mode">(单选模式)</span>
        <span v-else class="selection-mode">(多选模式)</span>
      </div>
      <div class="selected-list">
        <Tag
          v-for="item in selectedCiItems"
          :key="`${item.typeId}-${item.id}`"
          closable
          class="selected-tag"
          @close="removeSelectedCi(item.id, item.typeId)"
        >
          {{ item.typeName }}: {{ item.displayName }}
        </Tag>
      </div>
    </div>

    <!-- 弹窗底部按钮 -->
    <template #footer>
      <Space>
        <Button @click="handleCancel">取消</Button>
        <Button
          type="primary"
          :disabled="selectedCiItems.length === 0"
          @click="handleConfirm"
        >
          确定 ({{ selectedCiItems.length }})
        </Button>
      </Space>
    </template>

    <!-- 高级搜索抽屉 -->
    <Drawer
      :open="searchDrawerVisible"
      title="高级搜索"
      width="680"
      placement="right"
      :closable="true"
      @close="closeSearchDrawer"
    >
      <div class="advanced-search-content">
        <!-- 基础搜索 -->
        <div class="search-section">
          <div class="section-title">
            <SearchOutlined class="title-icon" />
            <span>基础搜索</span>
          </div>
          <Input
            :value="searchValue"
            placeholder="在所有文本字段中搜索..."
            size="large"
            allow-clear
            @update:value="(value) => (searchValue = value)"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </Input>
        </div>

        <Divider />

        <!-- 高级过滤 -->
        <div class="filter-section">
          <div class="section-header">
            <div class="section-title">
              <FilterOutlined class="title-icon" />
              <span>过滤条件</span>
            </div>
            <Button type="primary" ghost size="small" @click="addFilter">
              <PlusOutlined />
              添加条件
            </Button>
          </div>

          <div class="filter-list">
            <div
              v-for="(filter, index) in searchFilters"
              :key="index"
              class="filter-item"
            >
              <div class="filter-row">
                <div class="filter-controls">
                  <!-- 属性选择 -->
                  <div class="control-group">
                    <label class="control-label">属性</label>
                    <Select
                      :value="filter.attrId"
                      @update:value="
                        (value) => handleAttributeChange(filter, value)
                      "
                      placeholder="选择属性"
                      style="width: 160px"
                      show-search
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

                  <!-- 操作符选择 -->
                  <div class="control-group">
                    <label class="control-label">操作符</label>
                    <Select
                      :value="filter.operator"
                      @update:value="
                        (value) => handleOperatorChange(filter, value)
                      "
                      placeholder="选择操作符"
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

                  <!-- 删除按钮 -->
                  <Button
                    type="text"
                    danger
                    size="small"
                    class="delete-btn"
                    @click="removeFilter(index)"
                  >
                    <DeleteOutlined />
                  </Button>
                </div>

                <!-- 值输入 -->
                <div v-if="filter.operator !== 'empty'" class="value-input">
                  <label class="control-label">值</label>
                  <component :is="() => renderValueInput(filter)" />
                </div>
              </div>
            </div>

            <div v-if="searchFilters.length === 0" class="empty-filters">
              <div class="empty-content">
                <FilterOutlined class="empty-icon" />
                <p class="empty-text">暂无过滤条件</p>
                <p class="empty-desc">点击"添加条件"开始设置过滤规则</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="drawer-footer">
          <Space size="middle">
            <Button type="primary" size="large" @click="handleSearch">
              <SearchOutlined />
              执行搜索
            </Button>
            <Button size="large" @click="handleReset">重置所有条件</Button>
            <Button size="large" @click="closeSearchDrawer">取消</Button>
          </Space>
        </div>
      </div>
    </Drawer>
  </Modal>
</template>

<style scoped>
/* 响应式设计 */
@media (max-width: 768px) {
  .ci-selector-container {
    flex-direction: column;
    height: auto;
  }

  .ci-types-panel {
    width: 100%;
    height: 200px;
  }

  .search-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .filter-item {
    padding: 12px;
  }
}

.ci-selector-container {
  display: flex;
  gap: 16px;
  height: 600px;
}

/* 左侧CI类型面板 */
.ci-types-panel {
  width: 200px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.panel-title {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.ci-types-list {
  height: calc(100% - 45px);
  overflow-y: auto;
}

.ci-type-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  transition: all 0.2s ease;
}

.ci-type-item:hover {
  background: #f5f5f5;
}

.ci-type-item.active {
  font-weight: 500;
  color: #1890ff;
  background: #e6f7ff;
}

/* 右侧CI列表面板 */
.ci-list-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
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
  flex: 1;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

/* 已选择的CI列表 */
.selected-cis {
  padding: 16px;
  margin-top: 16px;
  background: #f9f9f9;
  border-radius: 6px;
}

.selected-title {
  margin-bottom: 12px;
  font-weight: 600;
  color: #262626;
}

.selection-mode {
  font-size: 12px;
  font-weight: normal;
  color: #8c8c8c;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-tag {
  padding: 4px 8px;
  margin: 0;
  font-size: 12px;
}

/* 高级搜索样式 */
.advanced-search-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px 0;
}

.search-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.title-icon {
  margin-right: 8px;
  font-size: 16px;
  color: #1890ff;
}

.filter-section {
  flex: 1;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filter-list {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.filter-item {
  padding: 20px;
  margin-bottom: 16px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.filter-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgb(24 144 255 / 10%);
}

.filter-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: auto;
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.delete-btn:hover {
  color: #fff;
  background-color: #ff4d4f;
}

.value-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.empty-filters {
  padding: 60px 20px;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
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

.drawer-footer {
  padding: 20px 0;
  margin-top: auto;
  text-align: center;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}
</style>
