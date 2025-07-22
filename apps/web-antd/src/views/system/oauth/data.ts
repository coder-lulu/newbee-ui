import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import dayjs from 'dayjs';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '名称',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '名称',
    field: 'name',
  },
  {
    title: '客户端ID',
    field: 'clientId',
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
    width: 180,
  },
];

export const modalSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'id',
    label: '参数主键',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'clientId',
    label: '客户端ID',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'clientSecret',
    label: '客户端密钥',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'redirectUrl',
    label: '重定向地址',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'scopes',
    label: '权限范围',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'authUrl',
    label: '鉴权地址',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'tokenUrl',
    label: '获取Token地址',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'infoUrl',
    label: '个人信息地址',
    rules: 'required',
  },
  {
    component: 'Select',
    fieldName: 'authStyle',
    label: '鉴权方式',
    rules: 'required',
    componentProps: {
      options: [
        { label: '参数模式', value: 1 },
        { label: 'Header模式', value: 2 },
      ],
      class: 'w-full',
    },
    defaultValue: 2,
  },
];
