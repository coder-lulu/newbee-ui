import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { OpsHostCredentialTag } from '#/api/ops/host-credential/model';

import { DictEnum } from '@vben/constants';
import { getPopupContainer } from '@vben/utils';

import dayjs from 'dayjs';

import { getDictOptions } from '#/utils/dict';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '凭据名称',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: getDictOptions(DictEnum.SYS_NORMAL_DISABLE),
    },
    fieldName: 'status',
    label: '凭据状态',
  },
  {
    component: 'Input',
    fieldName: 'username',
    label: '用户名',
  },
];
const authTypeOptions = [
  { label: '密码', value: 'password' },
  { label: '密钥', value: 'key' },
  { label: '密钥密码', value: 'key_password' },
  { label: '证书', value: 'cert' },
];

export const columns: VxeGridProps['columns'] = [
  {
    field: 'name',
    title: '凭据名称',
    treeNode: true,
    width: 200,
  },
  {
    field: 'hostPattern',
    title: '主机匹配模式',
    width: 200,
  },
  {
    field: 'username',
    title: '用户名',
    width: 200,
  },
  {
    field: 'authType',
    title: '认证方式',
    width: 200,
  },
  {
    field: 'tags',
    title: '标签',
    width: 200,
    slots: {
      default: ({ row }) => {
        if (!row.tags) {
          return '';
        }
        return row.tags
          .map((tag: OpsHostCredentialTag) => `${tag.key}:${tag.value}`)
          .join(',');
      },
    },
  },
  {
    field: 'isDefault',
    title: '是否为默认凭据',
    width: 200,
    slots: {
      default: ({ row }) => {
        return row.isDefault ? '是' : '否';
      },
    },
  },
  {
    field: 'priority',
    title: '优先级',
    width: 200,
    slots: {
      default: ({ row }) => {
        return row.priority;
      },
    },
  },
  {
    field: 'createdAt',
    title: '创建时间',
    width: 110,
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
    component: 'Input',
    fieldName: 'name',
    label: '凭据名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'description',
    label: '凭据描述',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'hostPattern',
    label: '主机匹配模式',
  },
  {
    component: 'Input',
    fieldName: 'username',
    label: '用户名',
  },
  {
    component: 'Select',
    fieldName: 'authType',
    label: '认证方式',
    rules: 'required',
    componentProps: {
      options: authTypeOptions,
    },
  },
  {
    component: 'Textarea',
    fieldName: 'authData',
    label: '认证数据',
    rules: 'required',
    componentProps: {
      rows: 4,
    },
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
      optionType: 'button',
    },
    fieldName: 'isDefault',
    label: '是否为默认凭据',
    defaultValue: false,
  },
  {
    component: 'InputNumber',
    fieldName: 'priority',
    label: '优先级',
    rules: 'required',
    defaultValue: 0,
  },
  {
    component: 'Input',
    fieldName: 'tags',
    label: '标签',
    componentProps: {
      options: getDictOptions(DictEnum.SYS_NORMAL_DISABLE),
    },
  },
];
