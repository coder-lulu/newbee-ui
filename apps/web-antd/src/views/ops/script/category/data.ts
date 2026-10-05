import type { VxeGridPropTypes } from '#/adapter/vxe-table';

import type { VbenFormSchema } from '@vben/common-ui';

import { $t } from '@vben/locales';

export const categoryColumns: VxeGridPropTypes.Columns = [
  {
    field: 'name',
    title: $t('ops.script.category.name'),
    treeNode: true,
    minWidth: 200,
  },
  {
    field: 'code',
    title: $t('ops.script.category.code'),
    minWidth: 150,
  },
  {
    field: 'sortOrder',
    title: $t('ops.script.category.sortOrder'),
    width: 100,
  },
  {
    field: 'description',
    title: $t('ops.script.category.description'),
    minWidth: 200,
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: $t('common.action'),
    width: 200,
  },
];

export const categoryQuerySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('ops.script.category.namePlaceholder'),
    },
    fieldName: 'name',
    label: $t('ops.script.category.name'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('ops.script.category.codePlaceholder'),
    },
    fieldName: 'code',
    label: $t('ops.script.category.code'),
  },
];

export const categoryModalSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('ops.script.category.namePlaceholder'),
    },
    dependencies: {
      trigger(values, form) {
        if (values.name) {
          form.setValues({ code: values.name });
        }
      },
      triggerFields: ['name'],
    },
    fieldName: 'name',
    label: $t('ops.script.category.name'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('ops.script.category.codePlaceholder'),
    },
    fieldName: 'code',
    label: $t('ops.script.category.code'),
    rules: 'required',
  },
  {
    component: 'TreeSelect',
    componentProps: {
      allowClear: true,
      fieldNames: {
        children: 'children',
        label: 'name',
        value: 'id',
      },
      placeholder: $t('ops.script.category.parentIdPlaceholder'),
      showSearch: true,
      treeDefaultExpandAll: true,
      treeNodeFilterProp: 'name',
    },
    fieldName: 'parentId',
    label: $t('ops.script.category.parentId'),
  },
  {
    component: 'InputNumber',
    componentProps: {
      min: 0,
      placeholder: $t('ops.script.category.sortOrderPlaceholder'),
    },
    defaultValue: 0,
    fieldName: 'sortOrder',
    label: $t('ops.script.category.sortOrder'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('ops.script.category.iconPlaceholder'),
    },
    fieldName: 'icon',
    label: $t('ops.script.category.icon'),
  },
  {
    component: 'Textarea',
    componentProps: {
      placeholder: $t('ops.script.category.descriptionPlaceholder'),
      rows: 3,
    },
    fieldName: 'description',
    label: $t('ops.script.category.description'),
  },
];
