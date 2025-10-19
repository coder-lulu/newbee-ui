import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';
import { getPopupContainer } from '@vben/utils';

import dayjs from 'dayjs';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'code',
    label: '岗位编码',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '岗位名称',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: getDictOptions(DictEnum.SYS_NORMAL_DISABLE),
    },
    fieldName: 'status',
    label: '状态',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '岗位编码',
    field: 'code',
  },
  // {
  //   title: '类别编码',
  //   field: 'postCategory',
  // },
  {
    title: '岗位名称',
    field: 'name',
  },
  {
    title: '排序',
    field: 'sort',
  },
  {
    title: '状态',
    field: 'status',
    slots: {
      default: ({ row }) => {
        return renderDict(row.status, DictEnum.SYS_NORMAL_DISABLE);
      },
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
    label: 'ID',
  },
  {
    component: 'TreeSelect',
    componentProps: {
      getPopupContainer,
    },
    fieldName: 'deptId',
    label: '所属部门',
    rules: 'selectRequired',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '岗位名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: '岗位编码',
    rules: 'required',
  },
  // {
  //   component: 'Input',
  //   fieldName: 'postCategory',
  //   label: '类别编码',
  // },
  {
    component: 'InputNumber',
    fieldName: 'sort',
    label: '岗位排序',
    rules: 'required',
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
    label: '岗位状态',
    rules: 'required',
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'items-start',
    label: '备注',
  },
];
