import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'username',
    label: '用户账号',
  },
  {
    component: 'Input',
    fieldName: 'mobile',
    label: '手机号码',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '用户账号',
    field: 'username',
  },
  {
    title: '用户昵称',
    field: 'nickname',
  },
  {
    title: '邮箱',
    field: 'email',
  },
  {
    title: '手机号',
    field: 'mobile',
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
