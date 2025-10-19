import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getPopupContainer } from '@vben/utils';
import dayjs from 'dayjs';

import { z } from '#/adapter/form';

// 组件在模板中通过slot使用，不需要在这里导入

// 查询表单配置
export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'userId',
    label: '用户ID',
    componentProps: {
      placeholder: '请输入用户ID',
    },
  },
  {
    component: 'Input',
    fieldName: 'userName',
    label: '用户名',
    componentProps: {
      placeholder: '请输入用户名',
    },
  },
  {
    component: 'Select',
    fieldName: 'operationType',
    label: '操作类型',
    componentProps: {
      getPopupContainer,
      placeholder: '请选择操作类型',
      allowClear: true,
      showArrow: true,
      showSearch: false,
      options: [
        { label: '创建', value: 'CREATE' },
        { label: '查看', value: 'READ' },
        { label: '更新', value: 'UPDATE' },
        { label: '删除', value: 'DELETE' },
      ],
    },
  },
  {
    component: 'Input',
    fieldName: 'resourceType',
    label: '资源类型',
    componentProps: {
      placeholder: '请输入资源类型',
    },
  },
  {
    component: 'Select',
    fieldName: 'requestMethod',
    label: '请求方法',
    componentProps: {
      getPopupContainer,
      placeholder: '请选择请求方法',
      allowClear: true,
      showArrow: true,
      showSearch: false,
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
        { label: 'PATCH', value: 'PATCH' },
      ],
    },
  },
  {
    component: 'Input',
    fieldName: 'requestPath',
    label: '请求路径',
    componentProps: {
      placeholder: '请输入请求路径',
    },
  },
  {
    component: 'Input',
    fieldName: 'ipAddress',
    label: 'IP地址',
    componentProps: {
      placeholder: '请输入IP地址',
    },
  },
  {
    component: 'Select',
    fieldName: 'responseStatus',
    label: '响应状态',
    componentProps: {
      getPopupContainer,
      placeholder: '请选择响应状态',
      allowClear: true,
      showArrow: true,
      options: [
        { label: '200 OK', value: 200 },
        { label: '201 Created', value: 201 },
        { label: '204 No Content', value: 204 },
        { label: '400 Bad Request', value: 400 },
        { label: '401 Unauthorized', value: 401 },
        { label: '403 Forbidden', value: 403 },
        { label: '404 Not Found', value: 404 },
        { label: '422 Unprocessable Entity', value: 422 },
        { label: '500 Internal Server Error', value: 500 },
        { label: '502 Bad Gateway', value: 502 },
        { label: '503 Service Unavailable', value: 503 },
      ],
    },
  },
  {
    component: 'RangePicker',
    fieldName: 'createdAt',
    label: '创建时间',
    componentProps: {
      getPopupContainer,
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      placeholder: ['开始时间', '结束时间'],
    },
  },
];

// 表格列配置
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    field: 'userName',
    title: '用户',
    minWidth: 100,
    showOverflow: 'tooltip',
    // 移除表头筛选，只保留表单筛选
  },
  {
    field: 'operationType',
    title: '操作类型',
    width: 100,
    slots: { default: 'operationType' },
    filters: [
      { label: '创建', value: 'CREATE' },
      { label: '查看', value: 'READ' },
      { label: '更新', value: 'UPDATE' },
      { label: '删除', value: 'DELETE' },
    ],
    filterConfig: {
      getPopupContainer,
    },
  },
  {
    field: 'resourceId',
    title: '资源类型',
    minWidth: 120,
    showOverflow: 'tooltip',
    // 移除表头筛选，只保留表单筛选
  },
  {
    field: 'requestMethod',
    title: '方法',
    width: 80,
    slots: { default: 'requestMethod' },
    filters: [
      { label: 'GET', value: 'GET' },
      { label: 'POST', value: 'POST' },
      { label: 'PUT', value: 'PUT' },
      { label: 'DELETE', value: 'DELETE' },
      { label: 'PATCH', value: 'PATCH' },
    ],
    filterConfig: {
      getPopupContainer,
    },
  },
  {
    field: 'requestPath',
    title: '请求路径',
    minWidth: 200,
    showOverflow: 'tooltip',
    // 移除表头筛选，只保留表单筛选
  },
  {
    field: 'responseStatus',
    title: '状态',
    width: 120,
    slots: { default: 'responseStatus' },
    filters: [
      { label: '200', value: 200 },
      { label: '201', value: 201 },
      { label: '204', value: 204 },
      { label: '400', value: 400 },
      { label: '401', value: 401 },
      { label: '403', value: 403 },
      { label: '404', value: 404 },
      { label: '500', value: 500 },
    ],
    filterConfig: {
      getPopupContainer,
    },
  },
  {
    field: 'durationMs',
    title: '耗时',
    width: 80,
    slots: { default: 'duration' },
  },
  {
    field: 'ipAddress',
    title: 'IP地址',
    width: 120,
    showOverflow: 'tooltip',
    // 移除表头筛选，只保留表单筛选
  },
  {
    field: 'createdAt',
    title: '操作时间',
    width: 160,
    formatter: ({ cellValue }) => {
      return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '';
    },
  },
  {
    field: 'action',
    title: '操作',
    width: 150,
    fixed: 'right',
    slots: { default: 'action' },
  },
];

// 表单验证规则
export const formSchema = z.object({
  userId: z.string().optional(),
  userName: z.string().optional(),
  operationType: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE']).optional(),
  resourceType: z.string().optional(),
  requestMethod: z.string().optional(),
  requestPath: z.string().optional(),
  ipAddress: z.string().optional(),
  responseStatus: z.number().optional(),
  createdAt: z.array(z.any()).optional(),
});

export type FormValues = z.infer<typeof formSchema>;