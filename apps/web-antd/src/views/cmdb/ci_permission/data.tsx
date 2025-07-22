import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getPopupContainer } from '@vben/utils';

import { Tag } from 'ant-design-vue';
import dayjs from 'dayjs';

// 查询表单Schema
export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'permission_id',
    label: '权限ID',
    componentProps: {
      placeholder: '请输入权限ID',
    },
  },
  {
    component: 'Input',
    fieldName: 'subject_name',
    label: '权限主体',
    componentProps: {
      placeholder: '请输入主体名称',
    },
  },
  {
    component: 'Select',
    fieldName: 'subject_type',
    label: '主体类型',
    componentProps: {
      placeholder: '请选择主体类型',
      getPopupContainer,
      options: [
        { label: '用户', value: 'user' },
        { label: '角色', value: 'role' },
        { label: '部门', value: 'department' },
        { label: '用户组', value: 'group' },
        { label: '系统', value: 'system' },
      ],
    },
  },
  {
    component: 'Select',
    fieldName: 'permission_level',
    label: '权限级别',
    componentProps: {
      placeholder: '请选择权限级别',
      getPopupContainer,
      options: [
        { label: '无权限', value: 'none' },
        { label: '只读', value: 'read' },
        { label: '读写', value: 'write' },
        { label: '管理员', value: 'admin' },
        { label: '超级管理员', value: 'super_admin' },
      ],
    },
  },
  {
    component: 'Select',
    fieldName: 'scope_type',
    label: '权限范围',
    componentProps: {
      placeholder: '请选择权限范围',
      getPopupContainer,
      options: [
        { label: '全局权限', value: 'global' },
        { label: 'CI类型权限', value: 'ci_type' },
        { label: 'CI实例权限', value: 'ci_instance' },
        { label: '属性权限', value: 'attribute' },
        { label: '字段权限', value: 'field' },
      ],
    },
  },
  {
    component: 'Select',
    fieldName: 'status',
    label: '状态',
    componentProps: {
      placeholder: '请选择状态',
      getPopupContainer,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
];

// 表格列配置
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '权限ID',
    field: 'permission_id',
    width: 180,
  },
  {
    title: '权限主体',
    field: 'subject_name',
    width: 120,
  },
  {
    title: '主体类型',
    field: 'subject_type',
    width: 100,
    slots: {
      default: ({ row }) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          user: { color: 'blue', text: '用户' },
          role: { color: 'green', text: '角色' },
          department: { color: 'orange', text: '部门' },
          group: { color: 'purple', text: '用户组' },
          system: { color: 'red', text: '系统' },
        };
        const config = typeMap[row.subject_type] || {
          color: 'default',
          text: row.subject_type,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  },
  {
    title: '权限级别',
    field: 'permission_level',
    width: 120,
    slots: {
      default: ({ row }) => {
        const levelMap: Record<string, { color: string; text: string }> = {
          none: { color: 'default', text: '无权限' },
          read: { color: 'blue', text: '只读' },
          write: { color: 'green', text: '读写' },
          admin: { color: 'orange', text: '管理员' },
          super_admin: { color: 'red', text: '超级管理员' },
        };
        const config = levelMap[row.permission_level] || {
          color: 'default',
          text: row.permission_level,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  },
  {
    title: '权限范围',
    field: 'scope_type',
    width: 140,
    slots: {
      default: ({ row }) => {
        const scopeMap: Record<string, { color: string; text: string }> = {
          global: { color: 'red', text: '全局权限' },
          ci_type: { color: 'blue', text: 'CI类型权限' },
          ci_instance: { color: 'green', text: 'CI实例权限' },
          attribute: { color: 'orange', text: '属性权限' },
          field: { color: 'purple', text: '字段权限' },
        };
        const config = scopeMap[row.scope_type] || {
          color: 'default',
          text: row.scope_type,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  },
  {
    title: '状态',
    field: 'status',
    width: 80,
    slots: {
      default: ({ row }) => {
        return (
          <Tag color={row.status === 1 ? 'green' : 'red'}>
            {row.status === 1 ? '启用' : '禁用'}
          </Tag>
        );
      },
    },
  },
  {
    title: '描述',
    field: 'description',
    width: 200,
    showOverflow: 'tooltip',
  },
  {
    title: '创建时间',
    field: 'created_at',
    width: 160,
    formatter: ({ cellValue }) => {
      return cellValue
        ? dayjs(cellValue * 1000).format('YYYY-MM-DD HH:mm')
        : '';
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

// 编辑表单Schema
export const drawerSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'id',
    label: 'ID',
  },
  {
    component: 'Input',
    fieldName: 'permission_id',
    label: '权限ID',
    rules: 'required',
    componentProps: {
      placeholder: '请输入权限ID',
    },
  },
  {
    component: 'RadioGroup',
    fieldName: 'status',
    label: '状态',
    rules: 'required',
    defaultValue: 1,
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
      optionType: 'button',
    },
  },
  {
    component: 'Textarea',
    fieldName: 'description',
    label: '描述',
    formItemClass: 'col-span-2',
    componentProps: {
      placeholder: '请输入权限描述',
      rows: 3,
    },
  },

  // 权限主体
  {
    component: 'Select',
    fieldName: 'subject_type',
    label: '主体类型',
    rules: 'required',
    componentProps: {
      placeholder: '请选择主体类型',
      getPopupContainer,
      options: [
        { label: '用户', value: 'user' },
        { label: '角色', value: 'role' },
        { label: '部门', value: 'department' },
        { label: '用户组', value: 'group' },
        { label: '系统', value: 'system' },
      ],
    },
  },
  {
    component: 'Input',
    fieldName: 'subject_name',
    label: '主体名称',
    rules: 'required',
    componentProps: {
      placeholder: '请输入主体名称',
    },
  },

  // 权限配置
  {
    component: 'Select',
    fieldName: 'permission_level',
    label: '权限级别',
    rules: 'required',
    componentProps: {
      placeholder: '请选择权限级别',
      getPopupContainer,
      options: [
        { label: '无权限', value: 'none' },
        { label: '只读', value: 'read' },
        { label: '读写', value: 'write' },
        { label: '管理员', value: 'admin' },
        { label: '超级管理员', value: 'super_admin' },
      ],
    },
  },
  {
    component: 'Select',
    fieldName: 'scope_type',
    label: '权限范围',
    rules: 'required',
    componentProps: {
      placeholder: '请选择权限范围',
      getPopupContainer,
      options: [
        { label: '全局权限', value: 'global' },
        { label: 'CI类型权限', value: 'ci_type' },
        { label: 'CI实例权限', value: 'ci_instance' },
        { label: '属性权限', value: 'attribute' },
        { label: '字段权限', value: 'field' },
      ],
    },
  },
  {
    component: 'Input',
    fieldName: 'ci_type_id',
    label: 'CI类型ID',
    dependencies: {
      show: (values) => ['ci_instance', 'ci_type'].includes(values.scope_type),
      triggerFields: ['scope_type'],
    },
    componentProps: {
      placeholder: '请输入CI类型ID',
    },
  },
  {
    component: 'Input',
    fieldName: 'ci_instance_id',
    label: 'CI实例ID',
    dependencies: {
      show: (values) => values.scope_type === 'ci_instance',
      triggerFields: ['scope_type'],
    },
    componentProps: {
      placeholder: '请输入CI实例ID',
    },
  },

  // 时间设置
  {
    component: 'DatePicker',
    fieldName: 'effective_from',
    label: '生效时间',
    componentProps: {
      placeholder: '请选择生效时间',
      format: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
      getPopupContainer,
    },
  },
  {
    component: 'DatePicker',
    fieldName: 'effective_to',
    label: '失效时间',
    componentProps: {
      placeholder: '请选择失效时间',
      format: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
      getPopupContainer,
    },
  },

  // 高级设置
  {
    component: 'InputNumber',
    fieldName: 'priority',
    label: '优先级',
    defaultValue: 1,
    componentProps: {
      placeholder: '请输入优先级',
      min: 0,
      max: 999,
    },
  },
  {
    component: 'Select',
    fieldName: 'risk_level',
    label: '风险等级',
    defaultValue: 'low',
    componentProps: {
      placeholder: '请选择风险等级',
      getPopupContainer,
      options: [
        { label: '低风险', value: 'low' },
        { label: '中风险', value: 'medium' },
        { label: '高风险', value: 'high' },
        { label: '极高风险', value: 'critical' },
      ],
    },
  },
  {
    component: 'RadioGroup',
    fieldName: 'inherit_enabled',
    label: '继承权限',
    defaultValue: false,
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
      optionType: 'button',
    },
  },
  {
    component: 'RadioGroup',
    fieldName: 'mfa_required',
    label: '需要MFA',
    defaultValue: false,
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
      optionType: 'button',
    },
  },
  {
    component: 'RadioGroup',
    fieldName: 'approval_required',
    label: '需要审批',
    defaultValue: false,
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
      optionType: 'button',
    },
  },
  {
    component: 'Textarea',
    fieldName: 'conditions',
    label: '权限条件',
    formItemClass: 'col-span-2',
    componentProps: {
      placeholder: '请输入权限条件（JSON格式）',
      rows: 4,
    },
  },
];
