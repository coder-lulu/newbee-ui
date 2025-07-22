import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import dayjs from 'dayjs';

import { renderDictTag } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'title',
    label: '字典标签',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '字典标签',
    field: 'cssClass',
    slots: {
      default: ({ row }) => {
        const { value } = row;
        return renderDictTag(value, [row as any]);
      },
    },
  },
  {
    title: '字典键值',
    field: 'value',
  },
  {
    title: '字典排序',
    field: 'sort',
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
  },
  {
    component: 'Input',
    componentProps: {
      disabled: true,
      hidden: true,
    },
    fieldName: 'dictionaryId',
  },
  {
    component: 'Input',
    fieldName: 'listClass',
    slots: 'default',
    label: '标签样式',
  },
  {
    component: 'Input',
    fieldName: 'title',
    label: '数据标签',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'value',
    label: '数据键值',
    rules: 'required',
  },
  {
    component: 'Textarea',
    componentProps: {
      placeholder: '可使用tailwind类名 如bg-blue w-full h-full等',
    },
    fieldName: 'cssClass',
    formItemClass: 'items-start',
    help: '标签的css样式, 可添加已经编译的css类名',
    label: 'css类名',
  },
  {
    component: 'InputNumber',
    fieldName: 'sort',
    label: '显示排序',
    rules: 'required',
  },
  // {
  //   component: 'Textarea',
  //   fieldName: 'remark',
  //   formItemClass: 'items-start',
  //   label: '备注',
  // },
];
