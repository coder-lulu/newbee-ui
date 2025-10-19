<script setup lang="ts">
import { useVbenDrawer } from '@vben/common-ui';

import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import { getCiPermissionById, type CiPermissionInfo } from '#/api/cmdb/cipermission';

// 组件事件定义
interface Emits {
  (e: 'close'): void;
}

defineOptions({
  name: 'PermissionDetailDrawer',
});

const emit = defineEmits<Emits>();

// 详情表单Schema（只读）
const detailSchema = () => [
  {
    component: 'Input',
    fieldName: 'permission_id',
    label: '权限ID',
    componentProps: {
      readonly: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'permission_type_display',
    label: '权限类型',
    componentProps: {
      readonly: true,
    },
  },
  {
    component: 'RadioGroup',
    fieldName: 'status',
    label: '状态',
    componentProps: {
      disabled: true,
      buttonStyle: 'solid',
      options: [
        { label: '激活', value: 1 },
        { label: '非激活', value: 0 },
        { label: '暂停', value: 2 },
        { label: '撤销', value: 3 },
        { label: '过期', value: 4 },
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
      readonly: true,
      rows: 3,
    },
  },

  // 权限主体
  {
    component: 'Input',
    fieldName: 'subject_type_display',
    label: '主体类型',
    componentProps: {
      readonly: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'subject_name',
    label: '主体名称',
    componentProps: {
      readonly: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'subject_id',
    label: '主体ID',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.subject_id,
      triggerFields: ['subject_id'],
    },
  },
  {
    component: 'Input',
    fieldName: 'department_id',
    label: '部门ID',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.department_id,
      triggerFields: ['department_id'],
    },
  },

  // 权限配置
  {
    component: 'Input',
    fieldName: 'permission_level_display',
    label: '权限级别',
    componentProps: {
      readonly: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'scope_type_display',
    label: '权限范围',
    componentProps: {
      readonly: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'scope_target_type',
    label: '范围目标类型',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.scope_target_type,
      triggerFields: ['scope_target_type'],
    },
  },
  {
    component: 'Input',
    fieldName: 'scope_target_id',
    label: '范围目标ID',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.scope_target_id,
      triggerFields: ['scope_target_id'],
    },
  },
  {
    component: 'Input',
    fieldName: 'scope_field_name',
    label: '范围字段名',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.scope_field_name,
      triggerFields: ['scope_field_name'],
    },
  },
  {
    component: 'Input',
    fieldName: 'ci_type_id',
    label: 'CI类型ID',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.ci_type_id,
      triggerFields: ['ci_type_id'],
    },
  },
  {
    component: 'Input',
    fieldName: 'ci_id',
    label: 'CI实例ID',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.ci_id,
      triggerFields: ['ci_id'],
    },
  },
  {
    component: 'Input',
    fieldName: 'attribute_id',
    label: '属性ID',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.attribute_id,
      triggerFields: ['attribute_id'],
    },
  },
  {
    component: 'Input',
    fieldName: 'field_name',
    label: '字段名称',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.field_name,
      triggerFields: ['field_name'],
    },
  },

  // 时间设置
  {
    component: 'Input',
    fieldName: 'effective_from_display',
    label: '生效时间',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.effective_from_display,
      triggerFields: ['effective_from_display'],
    },
  },
  {
    component: 'Input',
    fieldName: 'effective_to_display',
    label: '失效时间',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.effective_to_display,
      triggerFields: ['effective_to_display'],
    },
  },

  // 高级设置
  {
    component: 'InputNumber',
    fieldName: 'priority',
    label: '优先级',
    componentProps: {
      disabled: true,
      readonly: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'risk_level_display',
    label: '风险等级',
    componentProps: {
      readonly: true,
    },
  },
  {
    component: 'RadioGroup',
    fieldName: 'inheritable',
    label: '可继承',
    componentProps: {
      disabled: true,
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
    fieldName: 'require_mfa',
    label: '需要MFA',
    componentProps: {
      disabled: true,
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
    fieldName: 'require_approval',
    label: '需要审批',
    componentProps: {
      disabled: true,
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
    fieldName: 'is_temporary',
    label: '临时权限',
    componentProps: {
      disabled: true,
      buttonStyle: 'solid',
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
      optionType: 'button',
    },
  },
  {
    component: 'Input',
    fieldName: 'parent_permission_id',
    label: '父权限ID',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.parent_permission_id,
      triggerFields: ['parent_permission_id'],
    },
  },
  {
    component: 'InputNumber',
    fieldName: 'usage_count',
    label: '使用次数',
    componentProps: {
      disabled: true,
      readonly: true,
    },
    dependencies: {
      show: (values) => values.usage_count !== undefined,
      triggerFields: ['usage_count'],
    },
  },
  {
    component: 'Input',
    fieldName: 'last_used_at_display',
    label: '最后使用时间',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.last_used_at_display,
      triggerFields: ['last_used_at_display'],
    },
  },
  {
    component: 'Textarea',
    fieldName: 'operations_display',
    label: '操作权限',
    formItemClass: 'col-span-2',
    componentProps: {
      readonly: true,
      rows: 3,
    },
    dependencies: {
      show: (values) => values.operations_display,
      triggerFields: ['operations_display'],
    },
  },
  {
    component: 'Textarea',
    fieldName: 'data_filters_display',
    label: '数据过滤规则',
    formItemClass: 'col-span-2',
    componentProps: {
      readonly: true,
      rows: 3,
    },
    dependencies: {
      show: (values) => values.data_filters_display,
      triggerFields: ['data_filters_display'],
    },
  },
  {
    component: 'Textarea',
    fieldName: 'field_masks_display',
    label: '字段掩码',
    formItemClass: 'col-span-2',
    componentProps: {
      readonly: true,
      rows: 2,
    },
    dependencies: {
      show: (values) => values.field_masks_display,
      triggerFields: ['field_masks_display'],
    },
  },
  {
    component: 'Textarea',
    fieldName: 'comments',
    label: '备注',
    formItemClass: 'col-span-2',
    componentProps: {
      readonly: true,
      rows: 3,
    },
    dependencies: {
      show: (values) => values.comments,
      triggerFields: ['comments'],
    },
  },
  {
    component: 'DatePicker',
    fieldName: 'created_at_display',
    label: '创建时间',
    componentProps: {
      disabled: true,
      readonly: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
      style: { width: '100%' },
    },
  },
  {
    component: 'DatePicker',
    fieldName: 'updated_at_display',
    label: '更新时间',
    componentProps: {
      disabled: true,
      readonly: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
      style: { width: '100%' },
    },
  },
  {
    component: 'Input',
    fieldName: 'creator',
    label: '创建者',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.creator,
      triggerFields: ['creator'],
    },
  },
  {
    component: 'Input',
    fieldName: 'updater',
    label: '更新者',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.updater,
      triggerFields: ['updater'],
    },
  },
];

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
      disabled: true, // 全局禁用所有表单组件
    },
    formItemClass: 'col-span-1',
    labelWidth: 100,
  },
  layout: 'vertical',
  schema: detailSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2 gap-x-4',
  disabled: true, // 表单级别禁用
});

// 辅助函数
const getSubjectTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    user: '用户',
    role: '角色',
    department: '部门',
    group: '用户组',
    system: '系统',
  };
  return typeMap[type] || type;
};

const getPermissionTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    allow: '允许',
    deny: '拒绝',
  };
  return typeMap[type] || type;
};

const getLevelText = (level: string): string => {
  const levelMap: Record<string, string> = {
    none: '无权限',
    read: '只读',
    write: '读写',
    admin: '管理员',
    super_admin: '超级管理员',
  };
  return levelMap[level] || level;
};

const getScopeText = (scope: string): string => {
  const scopeMap: Record<string, string> = {
    global: '全局权限',
    ci_type: 'CI类型权限',
    ci_instance: 'CI实例权限',
    attribute: '属性权限',
    field: '字段权限',
  };
  return scopeMap[scope] || scope;
};

const formatOperations = (operations?: { operations: Array<{ operation: string; description?: string }> }): string => {
  if (!operations?.operations?.length) return '';
  return operations.operations
    .map(op => `${op.operation}${op.description ? ` (${op.description})` : ''}`)
    .join('\n');
};

const formatDataFilters = (filters?: { rules: Array<{ field: string; operator: string; value: string }>; logic: string }): string => {
  if (!filters?.rules?.length) return '';
  const rulesText = filters.rules
    .map(rule => `${rule.field} ${rule.operator} ${rule.value}`)
    .join(` ${filters.logic} `);
  return rulesText;
};

const formatFieldMasks = (masks?: { fields: string[] }): string => {
  if (!masks?.fields?.length) return '';
  return masks.fields.join(', ');
};

const getRiskLevelText = (level: string): string => {
  const levelMap: Record<string, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
    critical: '极高风险',
  };
  return levelMap[level] || level;
};

const formatTimestamp = (timestamp?: number): string => {
  if (!timestamp) return '';
  return dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss');
};

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onClosed: handleClosed,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }

    drawerApi.drawerLoading(true);

    try {
      const { id } = drawerApi.getData() as { id: number | string };
      const permission = await getCiPermissionById(id);

      // 处理显示数据 - 使用正确的驼峰字段名
      const displayData = {
        // 基础字段映射：后端驼峰 → 前端表单字段（下划线用于显示）
        permission_id: permission.permissionId,
        subject_name: permission.subjectName,
        subject_id: permission.subjectId,
        department_id: permission.departmentId,
        ci_type_id: permission.ciTypeId,
        ci_id: permission.ciId,
        attribute_id: permission.attributeId,
        field_name: permission.fieldName,
        priority: permission.priority,
        inheritable: permission.inheritable,
        require_mfa: permission.requireMfa,
        require_approval: permission.requireApproval,
        is_temporary: permission.isTemporary,
        parent_permission_id: permission.parentPermissionId,
        usage_count: permission.usageCount,
        comments: permission.comments,
        status: permission.status,
        description: permission.description,
        
        // 显示用的格式化字段
        permission_type_display: getPermissionTypeText(permission.permissionType || ''),
        subject_type_display: getSubjectTypeText(permission.subjectType || ''),
        permission_level_display: getLevelText(permission.permissionLevel || ''),
        scope_type_display: getScopeText(permission.scopeType || ''),
        risk_level_display: getRiskLevelText(permission.riskLevel || ''),
        effective_from_display: formatTimestamp(permission.effectiveFrom),
        effective_to_display: formatTimestamp(permission.effectiveTo),
        last_used_at_display: formatTimestamp(permission.lastUsedAt),
        // 时间组件需要dayjs对象，而不是格式化字符串
        created_at_display: permission.createdAt ? dayjs(permission.createdAt * 1000) : null,
        updated_at_display: permission.updatedAt ? dayjs(permission.updatedAt * 1000) : null,
        operations_display: formatOperations(permission.operations),
        data_filters_display: formatDataFilters(permission.dataFilters),
        field_masks_display: formatFieldMasks(permission.fieldMasks),
        
        // 创建者信息
        creator: permission.createdBy,
        updater: permission.updatedBy,
      };

      await formApi.setValues(displayData);
    } catch (error) {
      console.error('获取权限详情失败:', error);
    } finally {
      drawerApi.drawerLoading(false);
    }
  },
});

async function handleClosed() {
  await formApi.resetForm();
  emit('close');
}

// 定义开放的API
defineExpose({
  open: (id: number | string) => {
    drawerApi.setData({ id });
    drawerApi.open();
  },
});
</script>

<template>
  <BasicDrawer title="权限详情" class="w-[800px]">
    <BasicForm />
  </BasicDrawer>
</template>
