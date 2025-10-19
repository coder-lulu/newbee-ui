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
    fieldName: 'name',
    label: '参数名称',
  },
  {
    component: 'Input',
    fieldName: 'key',
    label: '参数键名',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: getDictOptions(DictEnum.SYS_CONFIG_TYPE),
    },
    fieldName: 'category',
    label: '系统内置',
  },
  // {
  //   component: 'RangePicker',
  //   fieldName: 'createdAt',
  //   label: '创建时间',
  // },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '参数名称',
    field: 'name',
  },
  {
    title: '参数KEY',
    field: 'key',
  },
  {
    title: '参数Value',
    field: 'value',
    // 如果参数超过指定长度则省略，并且鼠标放上后气泡形式显示内容
    // 添加tooltip
    showOverflow: 'ellipsis',
  },
  {
    title: '系统内置',
    field: 'category',
    width: 120,
    slots: {
      default: ({ row }) => {
        return renderDict(row.category, DictEnum.SYS_CONFIG_TYPE);
      },
    },
  },
  {
    title: '备注',
    field: 'remark',
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
    label: '参数主键',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '参数名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'key',
    label: '参数键名',
    rules: 'required',
  },
  {
    component: 'Textarea',
    formItemClass: 'items-start',
    fieldName: 'value',
    label: '参数键值',
    componentProps: {
      autoSize: true,
    },
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: getDictOptions(DictEnum.SYS_CONFIG_TYPE),
      optionType: 'button',
    },
    defaultValue: 'internal',
    fieldName: 'category',
    label: '是否内置',
    rules: 'required',
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'items-start',
    label: '备注',
  },
];
