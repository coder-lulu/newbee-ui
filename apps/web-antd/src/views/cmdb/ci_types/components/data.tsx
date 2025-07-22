import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';
import { getPopupContainer } from '@vben/utils';

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

export const ciAttributeGroupModalSchema: FormSchemaGetter = () => [
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
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'typeId',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '分组名称',
    rules: 'required',
  },
];

export const drawerCiTypeSchema: FormSchemaGetter = () => [
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
    label: '模型名(英文)',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'alias',
    label: '别名',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'icon',
    label: '图标',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
    },
    defaultValue: false,
    fieldName: 'isInherited',
    label: '是否继承',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      mode: 'multiple',
      placeholder: '请选择继承模型（多选）',
      allowClear: true,
    },
    dependencies: {
      show: () => false,
      triggerFields: ['isInherited'],
    },
    fieldName: 'inheritedModels',
    label: '继承模型',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      optionFilterProp: 'label',
      optionLabelProp: 'label',
      placeholder: '请选择唯一标识',
    },
    rules: 'required',
    style: {
      width: '100%',
      marginBottom: '16px',
    },
    fieldName: 'uniqueId',
    label: '唯一标识',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      optionFilterProp: 'label',
      optionLabelProp: 'label',
      placeholder: '请选择显示属性',
    },
    style: {
      width: '100%',
      marginBottom: '16px',
    },
    fieldName: 'showId',
    label: '显示属性',
  },
  {
    component: 'Input',
    fieldName: 'groupId',
    label: '分组ID',
    hidden: true,
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
  },
];
