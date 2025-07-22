<script setup lang="ts">
import { useVbenDrawer } from '@vben/common-ui';

import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import { getPermissionInfo } from '#/api/cmdb/ci-permission';

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
    component: 'RadioGroup',
    fieldName: 'status',
    label: '状态',
    componentProps: {
      disabled: true,
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
    fieldName: 'ci_instance_id',
    label: 'CI实例ID',
    componentProps: {
      readonly: true,
    },
    dependencies: {
      show: (values) => values.ci_instance_id,
      triggerFields: ['ci_instance_id'],
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
    fieldName: 'inherit_enabled',
    label: '继承权限',
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
    fieldName: 'mfa_required',
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
    fieldName: 'approval_required',
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
    component: 'Textarea',
    fieldName: 'conditions',
    label: '权限条件',
    formItemClass: 'col-span-2',
    componentProps: {
      readonly: true,
      rows: 4,
    },
    dependencies: {
      show: (values) => values.conditions,
      triggerFields: ['conditions'],
    },
  },
  {
    component: 'Input',
    fieldName: 'created_at_display',
    label: '创建时间',
    componentProps: {
      readonly: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'updated_at_display',
    label: '更新时间',
    componentProps: {
      readonly: true,
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
    },
    formItemClass: 'col-span-1',
    labelWidth: 100,
  },
  layout: 'vertical',
  schema: detailSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2 gap-x-4',
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
      const permission = await getPermissionInfo(id);

      // 处理显示数据
      const displayData = {
        ...permission,
        subject_type_display: getSubjectTypeText(permission.subject_type || ''),
        permission_level_display: getLevelText(
          permission.permission_level || '',
        ),
        scope_type_display: getScopeText(permission.scope_type || ''),
        risk_level_display: getRiskLevelText(permission.risk_level || ''),
        effective_from_display: formatTimestamp(permission.effective_from),
        effective_to_display: formatTimestamp(permission.effective_to),
        created_at_display: formatTimestamp(permission.created_at),
        updated_at_display: formatTimestamp(permission.updated_at),
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
