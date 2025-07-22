import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';

import { renderDict } from '#/utils/render';

export const columns: VxeGridProps['columns'] = [
  {
    field: 'name',
    title: 'CI类型名称',
    minWidth: 120,
  },
  {
    field: 'alias',
    title: '别名',
    minWidth: 120,
  },
  {
    field: 'status',
    title: '状态',
    minWidth: 80,
    slots: {
      default: ({ row }) => {
        return renderDict(row.status, DictEnum.SYS_NORMAL_DISABLE);
      },
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

export const ciTypeGroupModalSchema: FormSchemaGetter = () => [
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
    fieldName: 'name',
    label: '分组名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'description',
    rules: 'required',
    label: '描述',
  },
  {
    component: 'Input',
    fieldName: 'icon',
    label: '图标',
  },
];
