import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getPopupContainer } from '@vben/utils';
import { Tag } from 'ant-design-vue';
import dayjs from 'dayjs';

import { z } from '#/adapter/form';

// 租户状态选项
export const tenantStatusOptions = [
  { label: '正常', value: 1, color: 'success' },
  { label: '禁用', value: 2, color: 'error' },
  { label: '过期', value: 3, color: 'warning' },
];

// 查询表单配置
export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '租户名称',
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: '租户代码',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: tenantStatusOptions,
    },
    fieldName: 'status',
    label: '租户状态',
  },
  {
    component: 'RangePicker',
    fieldName: 'createdAt',
    label: '创建时间',
  },
];

// 表格列配置
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    field: 'id',
    title: 'ID',
    width: 80,
  },
  {
    field: 'name',
    title: '租户名称',
    minWidth: 120,
  },
  {
    field: 'code',
    title: '租户代码',
    minWidth: 100,
    slots: {
      default: ({ row }) => {
        return <Tag color="processing">{row.code}</Tag>;
      },
    },
  },
  {
    field: 'description',
    title: '描述',
    minWidth: 150,
    formatter({ cellValue }) {
      return cellValue || '暂无';
    },
  },
  {
    field: 'status',
    title: '状态',
    width: 80,
    slots: { default: 'status' },
  },
  {
    field: 'expiredAt',
    title: '过期时间',
    minWidth: 160,
    formatter({ cellValue }) {
      if (!cellValue) {
        return '永不过期';
      }
      const expiredDate = dayjs.unix(cellValue);
      const now = dayjs();
      const isExpired = expiredDate.isBefore(now);
      return isExpired ? 
        `已过期 (${expiredDate.format('YYYY-MM-DD')})` : 
        expiredDate.format('YYYY-MM-DD HH:mm');
    },
  },
  {
    field: 'createdBy',
    title: '创建者',
    width: 100,
    formatter({ cellValue }) {
      return cellValue || '系统';
    },
  },
  {
    field: 'createdAt',
    title: '创建时间',
    minWidth: 160,
    formatter({ cellValue }) {
      return cellValue ? dayjs.unix(cellValue).format('YYYY-MM-DD HH:mm') : '暂无';
    },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 200,
  },
];

// 抽屉表单配置
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
    label: '租户名称',
    rules: z.string().min(1, '租户名称不能为空').max(100, '租户名称不能超过100个字符'),
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: '租户代码',
    rules: z.string().min(1, '租户代码不能为空').max(50, '租户代码不能超过50个字符'),
  },
  {
    component: 'Textarea',
    fieldName: 'description',
    formItemClass: 'items-start',
    label: '描述',
    rules: z.string().max(255, '描述不能超过255个字符').optional().or(z.literal('')),
  },
  {
    component: 'DatePicker',
    componentProps: {
      format: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
      valueFormat: 'X',
      getPopupContainer,
    },
    fieldName: 'expiredAt',
    help: '设置租户过期时间，留空表示永不过期',
    label: '过期时间',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: false,
      getPopupContainer,
      options: tenantStatusOptions,
    },
    defaultValue: 1,
    fieldName: 'status',
    label: '状态',
    rules: 'required',
  },
  {
    component: 'Textarea',
    fieldName: 'config',
    formItemClass: 'items-start',
    label: '配置信息',
    help: 'JSON格式配置信息，可为空',
    rules: z.string().optional().refine((val) => {
      if (!val) return true;
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, '配置信息必须是有效的JSON格式'),
  },
];

// 租户初始化表单配置
export const initTenantSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false, // 隐藏字段，但会包含在表单数据中
      triggerFields: [''],
    },
    fieldName: 'tenantId',
    defaultValue: '', // 设置默认值，避免 undefined
  },
  {
    component: 'Input',
    fieldName: 'adminUsername',
    label: '管理员用户名',
    help: '租户管理员账号，留空使用默认值',
    rules: z.string().max(50, '用户名不能超过50个字符').optional().or(z.literal('')),
  },
  {
    component: 'InputPassword',
    fieldName: 'adminPassword',
    label: '管理员密码',
    help: '租户管理员密码，留空使用默认值',
    rules: z.string().min(6, '密码至少6位').max(30, '密码不能超过30个字符').optional().or(z.literal('')),
  },
  {
    component: 'Input',
    fieldName: 'adminEmail',
    label: '管理员邮箱',
    help: '租户管理员邮箱，留空使用默认值',
    rules: z.string().email('请输入正确的邮箱格式').max(100, '邮箱不能超过100个字符').optional().or(z.literal('')),
  },
];
