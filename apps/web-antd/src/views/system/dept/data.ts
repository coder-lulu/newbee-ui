import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';
import { getPopupContainer } from '@vben/utils';

import dayjs from 'dayjs';

import { z } from '#/adapter/form';
import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '部门名称',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: getDictOptions(DictEnum.SYS_NORMAL_DISABLE),
    },
    fieldName: 'status',
    label: '部门状态',
  },
];

export const columns: VxeGridProps['columns'] = [
  {
    field: 'name',
    title: '部门名称',
    treeNode: true,
    width: 200,
  },
  {
    field: 'ancestors',
    title: '类别编码',
  },
  {
    field: 'sort',
    title: '排序',
    resizable: false,
    width: 'auto',
  },
  {
    field: 'status',
    resizable: false,
    width: 'auto',
    title: '状态',
    slots: {
      default: ({ row }) => {
        return renderDict(row.status, DictEnum.SYS_NORMAL_DISABLE);
      },
    },
  },
  {
    field: 'createdAt',
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
    width: 200,
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
  },
  {
    component: 'TreeSelect',
    componentProps: {
      getPopupContainer,
    },
    dependencies: {
      show: (model) => model.parentId !== 0,
      triggerFields: ['parentId'],
    },
    fieldName: 'parentId',
    label: '上级部门',
    rules: 'selectRequired',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '部门名称',
    rules: 'required',
  },
  {
    component: 'InputNumber',
    fieldName: 'sort',
    label: '显示排序',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'ancestors',
    label: '类别编码',
  },
  {
    component: 'Select',
    componentProps: {
      // 选中了就只能修改 不能重置为无负责人
      allowClear: false,
      getPopupContainer,
    },
    fieldName: 'leader',
    label: '负责人',
  },
  {
    component: 'Input',
    fieldName: 'phone',
    label: '联系电话',
    rules: z
      .string()
      .regex(/^1[3,4578]\d{9}$/, { message: '请输入正确的手机号' })
      .optional()
      .or(z.literal('')),
  },
  {
    component: 'Input',
    fieldName: 'email',
    label: '邮箱',
    rules: z
      .string()
      .email({ message: '请输入正确的邮箱' })
      .optional()
      .or(z.literal('')),
  },
  {
    component: 'RadioGroup',
    // componentProps: {
    //   buttonStyle: 'solid',
    //   options: getDictOptions(DictEnum.SYS_NORMAL_DISABLE),
    //   optionType: 'button',
    // },
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
  },
];
