import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getPopupContainer } from '@vben/utils';

import { Tag } from 'ant-design-vue';
import dayjs from 'dayjs';

/**
 * authScopeOptions user也会用到
 */
export const authScopeOptions = [
  { color: 'green', label: '全部数据权限', value: 1 },
  { color: 'default', label: '自定数据权限', value: 2 },
  { color: 'orange', label: '本部门数据权限', value: 4 },
  { color: 'cyan', label: '本部门及以下数据权限', value: 3 },
  { color: 'error', label: '仅本人数据权限', value: 5 },
];

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '角色名称',
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: '权限字符',
  },
  // {
  //   component: 'Select',
  //   componentProps: {
  //     options: getDictOptions(DictEnum.SYS_NORMAL_DISABLE),
  //   },
  //   fieldName: 'status',
  //   label: '状态',
  // },
  // {
  //   component: 'RangePicker',
  //   fieldName: 'createdAt',
  //   label: '创建时间',
  // },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '角色名称',
    field: 'name',
  },
  {
    title: '权限字符',
    field: 'code',
    slots: {
      default: ({ row }) => {
        return <Tag color="processing">{row.code}</Tag>;
      },
    },
  },
  {
    title: '数据权限',
    field: 'dataScope',
    slots: {
      default: ({ row }) => {
        const found = authScopeOptions.find(
          (item) => item.value === row.dataScope,
        );
        if (found) {
          return <Tag color={found.color}>{found.label}</Tag>;
        }
        return <Tag>{row.dataScope}</Tag>;
      },
    },
  },
  {
    title: '排序',
    field: 'sort',
  },
  {
    title: '状态',
    field: 'status',
    slots: { default: 'status' },
  },
  {
    title: '创建时间',
    field: 'createdAt',
    // 时间戳转换
    formatter: ({ cellValue }) => {
      return cellValue ? dayjs(cellValue).format('YYYY-MM-DD') : '';
    },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 'auto',
  },
];

export const drawerSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'id',
    label: '角色ID',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '角色名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'code',
    help: '如: test simpleUser等',
    label: '权限标识',
    rules: 'required',
  },
  {
    component: 'InputNumber',
    fieldName: 'sort',
    label: '角色排序',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'defaultRouter',
    defaultValue: 'dashboard',
    help: '默认路由',
    label: '默认路由',
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: false,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
      getPopupContainer,
    },
    defaultValue: 1,
    fieldName: 'status',
    help: '修改后, 拥有该角色的用户将自动下线.',
    label: '角色状态',
    rules: 'required',
  },
  {
    component: 'Radio',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'menuCheckStrictly',
    label: '菜单权限',
  },
  {
    component: 'Input',
    defaultValue: [],
    fieldName: 'menuIds',
    label: '菜单权限',
    formItemClass: 'col-span-2',
  },
  {
    component: 'Textarea',
    defaultValue: '',
    fieldName: 'remark',
    formItemClass: 'col-span-2',
    label: '备注',
  },
];

export const authModalSchemas: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'id',
    label: '角色ID',
  },
  {
    component: 'Radio',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'deptCheckStrictly',
    label: 'deptCheckStrictly',
  },
  {
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    fieldName: 'name',
    label: '角色名称',
  },
  {
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    fieldName: 'code',
    label: '权限标识',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: false,
      getPopupContainer,
      options: authScopeOptions,
    },
    fieldName: 'dataScope',
    help: '更改后需要用户重新登录才能生效',
    label: '权限范围',
  },
  {
    component: 'TreeSelect',
    defaultValue: [],
    dependencies: {
      show: (values) => values.dataScope === 2,
      triggerFields: ['dataScope'],
    },
    fieldName: 'customDeptIds',
    help: '更改后立即生效',
    label: '部门权限',
  },
];
