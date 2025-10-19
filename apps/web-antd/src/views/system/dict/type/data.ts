import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import dayjs from 'dayjs';

import { z } from '#/adapter/form';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'title',
    label: '字典名称',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '字典类型',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '字典名称',
    field: 'title',
  },
  {
    title: '字典类型',
    field: 'name',
  },
  {
    title: '备注',
    field: 'desc',
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

export const modalSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'id',
    label: 'id',
  },
  {
    component: 'Input',
    fieldName: 'title',
    label: '字典名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'name',
    help: '使用英文/下划线命名, 如:sys_normal_disable',
    label: '字典类型',
    rules: z
      .string()
      .regex(/^[a-z_]+$/i, { message: '字典类型只能使用英文/下划线命名' }),
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    label: '备注',
  },
];
