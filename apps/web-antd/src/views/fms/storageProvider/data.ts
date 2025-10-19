import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import dayjs from 'dayjs';

import { z } from '#/adapter/form';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '名称',
    rules: z.string().max(200).optional(),
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '名称',
    field: 'name',
  },
  {
    title: '备注',
    field: 'isDefault',
    slots: {
      default: ({ row }) => {
        return renderDict(row.isDefault, 'sys_yes_no');
      },
    },
  },
  {
    title: '状态',
    field: 'status',
    slots: {
      default: ({ row }) => {
        return renderDict(row.status, 'sys_show_hide');
      },
    },
  },
  {
    title: '创建时间',
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
    fieldName: 'bucket',
    label: '存储桶',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'region',
    label: '区域',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'secretId',
    label: 'secretId',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'secretKey',
    label: 'secretKey',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'endpoint',
    label: '服务器地址',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'folder',
    label: '云服务文件夹',
    rules: '',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
      optionType: 'button',
    },
    defaultValue: 1,
    fieldName: 'status',
    label: '状态',
    formItemClass: 'col-span-1 items-baseline',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
      optionType: 'button',
    },
    defaultValue: false,
    fieldName: 'isDefault',
    label: '是否默认',
    formItemClass: 'col-span-1 items-baseline',
  },
];
