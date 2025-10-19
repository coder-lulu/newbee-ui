import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';

import dayjs from 'dayjs';

import { z } from '#/adapter/form';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'username',
    label: '用户名',
    rules: z.string().max(30).optional(),
  },
  {
    component: 'Input',
    fieldName: 'nickname',
    label: '昵称',
    rules: z.string().max(30).optional(),
  },
  {
    component: 'Input',
    fieldName: 'email',
    label: '邮箱',
    rules: z.string().max(50).optional(),
  },
  {
    component: 'Input',
    fieldName: 'uuid',
    label: 'UUID',
    rules: z.string().max(50).optional(),
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '用户名',
    field: 'username',
  },
  {
    title: 'Token',
    field: 'token',
    // 如果参数超过指定长度则省略，并且鼠标放上后气泡形式显示内容
    // 添加tooltip
    showOverflow: 'ellipsis',
  },
  {
    title: '来源',
    field: 'source',
  },
  {
    title: '状态',
    field: 'status',
    width: 100,
    slots: { default: 'status' },
  },
  {
    title: '过期时间',
    field: 'expiredAt',
    // 时间戳转换
    formatter: ({ cellValue }) => {
      return cellValue ? dayjs(cellValue).format('YYYY-MM-DD') : '';
    },
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
