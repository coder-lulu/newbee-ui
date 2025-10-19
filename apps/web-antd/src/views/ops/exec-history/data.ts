import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getPopupContainer } from '@vben/utils';

import dayjs from 'dayjs';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'commandName',
    label: '命令名称',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: [
        { label: '成功', value: 'success' },
        { label: '失败', value: 'failed' },
        { label: '运行中', value: 'running' },
        { label: '超时', value: 'timeout' },
        { label: '待执行', value: 'pending' },
        { label: '已取消', value: 'cancelled' },
      ],
    },
    fieldName: 'commandStatus',
    label: '执行状态',
  },
  {
    component: 'Input',
    fieldName: 'targetHost',
    label: '目标主机',
  },
  {
    component: 'Input',
    fieldName: 'userId',
    label: '执行用户ID',
  },
  {
    component: 'Input',
    fieldName: 'batchId',
    label: '批次ID',
  },
  {
    component: 'RangePicker',
    fieldName: 'createdAt',
    label: '创建时间',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
    },
  },
];

const commandStatusOptions = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
  { label: '运行中', value: 'running' },
  { label: '超时', value: 'timeout' },
  { label: '待执行', value: 'pending' },
  { label: '已取消', value: 'cancelled' },
];

export const columns: VxeGridProps['columns'] = [
  {
    field: 'commandName',
    title: '命令名称',
  },
  {
    field: 'commandStatus',
    title: '执行状态',
  },
  {
    field: 'targetHost',
    title: '目标主机',
  },
  {
    field: 'targetPort',
    title: '目标端口',
  },
  {
    field: 'userId',
    title: '执行用户',
    width: 120,
  },
  {
    field: 'batchId',
    title: '批次ID',
    width: 150,
  },
  {
    field: 'correlationId',
    title: '跟踪ID',
    width: 150,
  },
  {
    field: 'createdAt',
    title: '创建时间',
    width: 160,
    formatter: ({ cellValue }) => {
      return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '';
    },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 150,
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
    fieldName: 'commandContent',
    label: '命令',
    rules: 'required',
    componentProps: {
      disabled: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'commandName',
    label: '命令名称',
    rules: 'required',
    componentProps: {
      disabled: true,
    },
  },
  {
    component: 'Select',
    fieldName: 'commandStatus',
    label: '执行状态',
    rules: 'required',
    componentProps: {
      options: commandStatusOptions,
      getPopupContainer,
      disabled: true,
    },
  },
  {
    component: 'Textarea',
    fieldName: 'commandParams',
    label: '命令参数',
    componentProps: {
      rows: 4,
      disabled: true,
    },
  },
  {
    component: 'CodeMirror',
    fieldName: 'commandResult',
    label: '命令结果',
    componentProps: {
      height: 400,
      readonly: true,
      language: 'shell',
      theme: 'material',
      lineNumbers: true,
      lineWrapping: true,
      autoCloseBrackets: true,
      autoCloseTags: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'targetHost',
    label: '目标主机',
    rules: 'required',
    componentProps: {
      disabled: true,
    },
  },
  {
    component: 'InputNumber',
    fieldName: 'targetPort',
    label: '目标端口',
    rules: 'required',
    componentProps: {
      disabled: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'userId',
    label: '执行用户ID',
    componentProps: {
      disabled: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'sessionId',
    label: '会话ID',
    componentProps: {
      disabled: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'correlationId',
    label: '跟踪ID',
    componentProps: {
      disabled: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'workflowId',
    label: '工作流ID',
    componentProps: {
      disabled: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'batchId',
    label: '批次ID',
    componentProps: {
      disabled: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'hostRef',
    label: '主机引用',
    componentProps: {
      disabled: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'credentialRef',
    label: '凭据引用',
    componentProps: {
      disabled: true,
    },
  },
];
