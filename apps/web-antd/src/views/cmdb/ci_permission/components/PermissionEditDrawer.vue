<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';
import { message } from 'ant-design-vue';

import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import {
  createCiPermission,
  getCiPermissionById,
  updateCiPermission,
  type CiPermissionInfo,
  type CiPermissionOperations,
  type CiPermissionDataFilters,
  type CiPermissionFieldMasks,
} from '#/api/cmdb/cipermission';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { drawerSchema } from '../data';

const emit = defineEmits<{ reload: [] }>();

defineOptions({
  name: 'PermissionEditDrawer',
});

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? '编辑权限' : '新增权限';
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-1',
    labelWidth: 100,
  },
  layout: 'vertical',
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2 gap-x-4',
});

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(formApi),
    currentGetter: defaultFormValueGetter(formApi),
  },
);

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onBeforeClose,
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }
    drawerApi.drawerLoading(true);

    const { id, template } = drawerApi.getData() as { id?: number | string; template?: any };
    isUpdate.value = !!id;

    // 使用模板数据
    if (template) {
      try {
        await formApi.setValues(template);
      } catch (error) {
        console.error('应用模板失败:', error);
      }
    }
    // 更新 && 赋值
    else if (isUpdate.value && id) {
      try {
        const record = await getCiPermissionById(id);

        // 转换后端camelCase数据为前端camelCase表单字段（保持一致）
        const formData = {
          // 基础字段映射 camelCase -> camelCase（与data.tsx中的fieldName保持一致）
          id: record.id,
          permissionId: record.permissionId,
          departmentId: record.departmentId,
          scopeType: record.scopeType,
          ciTypeId: record.ciTypeId,
          ciId: record.ciId,
          attributeId: record.attributeId,
          fieldName: record.fieldName,
          subjectType: record.subjectType,
          subjectId: record.subjectId,
          subjectName: record.subjectName,
          subjectCode: record.subjectCode,
          permissionType: record.permissionType,
          priority: record.priority,
          permissionLevel: record.permissionLevel,
          isTemporary: record.isTemporary,
          requireApproval: record.requireApproval,
          grantedBy: record.grantedBy,
          grantedByName: record.grantedByName,
          grantedAt: record.grantedAt,
          usageCount: record.usageCount,
          lastUsedAt: record.lastUsedAt,
          status: record.status,
          riskLevel: record.riskLevel,
          requireMfa: record.requireMfa,
          inheritable: record.inheritable,
          description: record.description,
          comments: record.comments,
          createdBy: record.createdBy,
          updatedBy: record.updatedBy,
          
          // 时间字段转换
          effectiveFrom: record.effectiveFrom
            ? dayjs(record.effectiveFrom * 1000)
            : undefined,
          effectiveTo: record.effectiveTo
            ? dayjs(record.effectiveTo * 1000)
            : undefined,
            
          // 新增字段的回填
          grantReason: record.grantReason,
          parentPermissionId: record.parentPermissionId,
          statusReason: record.statusReason,
          
          // 处理权限条件 - 转换为文本
          conditions: record.conditions ? 
            `${record.conditions.field} ${record.conditions.operator} ${record.conditions.value}` : '',
            
          // 处理操作权限数据 - 简化为字符串数组
          operations: record.operations?.operations?.map(op => op.operation) || [],
          // 处理数据过滤规则 - 转换为文本
          dataFiltersText: record.dataFilters ? 
            record.dataFilters.rules.map(rule => `${rule.field} ${rule.operator} ${rule.value}`).join(` ${record.dataFilters.logic} `) : '',
          // 处理字段掩码 - 简化为字符串数组
          fieldMasks: record.fieldMasks?.fields || [],
        };

        await formApi.setValues(formData);
      } catch (error) {
        console.error('获取权限信息失败:', error);
      }
    } else {
      // 新增时设置默认值
      const timestamp = Date.now();
      await formApi.setValues({
        permissionId: `perm_${timestamp}`, // 自动生成权限ID
        permissionType: 'allow',
        permissionLevel: 'read',
        scopeType: 'global',
        subjectType: 'user',
        status: 1,
        priority: 100,
        riskLevel: 'low',
        requireApproval: false,
        requireMfa: false,
        inheritable: false,
        isTemporary: false,
        operations: [],
        dataFiltersText: '',
        fieldMasks: [],
        grantReason: '',
        parentPermissionId: '',
        statusReason: '',
        conditions: '',
      });
    }

    await markInitialized();
    drawerApi.drawerLoading(false);
  },
});

async function handleConfirm() {
  try {
    drawerApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }

    const data = cloneDeep(await formApi.getValues());

    // 转换dayjs对象为时间戳
    if (data.effectiveFrom) {
      data.effectiveFrom = dayjs(data.effectiveFrom).unix();
    }
    if (data.effectiveTo) {
      data.effectiveTo = dayjs(data.effectiveTo).unix();
    }

    // 构建复杂对象结构，确保类型转换正确
    const submitData = {
      // 基础字段映射，确保数字类型正确转换
      id: data.id,
      permissionId: data.permissionId || '',
      
      // 数字类型字段转换 - 确保后端接收到正确的数字类型
      departmentId: data.departmentId ? Number(data.departmentId) : undefined,
      ciTypeId: data.ciTypeId ? Number(data.ciTypeId) : undefined,
      ciId: data.ciId ? Number(data.ciId) : undefined,
      attributeId: data.attributeId ? Number(data.attributeId) : undefined,
      priority: data.priority ? Number(data.priority) : 100,
      status: data.status ? Number(data.status) : 1,
      usageCount: data.usageCount ? Number(data.usageCount) : 0,
      lastUsedAt: data.lastUsedAt ? Number(data.lastUsedAt) : undefined,
      grantedAt: data.grantedAt ? Number(data.grantedAt) : undefined,
      
      // 字符串字段
      scopeType: data.scopeType || 'global',
      fieldName: data.fieldName || '',
      subjectType: data.subjectType || 'user',
      subjectId: data.subjectId || '',
      subjectName: data.subjectName || '',
      subjectCode: data.subjectCode || '',
      permissionType: data.permissionType || 'allow',
      permissionLevel: data.permissionLevel || 'read',
      riskLevel: data.riskLevel || 'low',
      description: data.description || '',
      comments: data.comments || '',
      createdBy: data.createdBy || '',
      updatedBy: data.updatedBy || '',
      grantedBy: data.grantedBy || '',
      grantedByName: data.grantedByName || '',
      
      // 时间戳字段 - 已在上面转换为unix时间戳
      effectiveFrom: data.effectiveFrom,
      effectiveTo: data.effectiveTo,
      
      // 布尔字段
      isTemporary: Boolean(data.isTemporary),
      requireApproval: Boolean(data.requireApproval),
      requireMfa: Boolean(data.requireMfa),
      inheritable: Boolean(data.inheritable),
      
      // 新增缺失的重要字段
      grantReason: data.grantReason || '',
      parentPermissionId: data.parentPermissionId || '',
      statusReason: data.statusReason || '',
      
      // 构建操作权限对象 - 确保结构正确
      operations: data.operations && data.operations.length > 0 ? {
        operations: data.operations.map((op: string) => ({
          operation: op,
          description: '',
        })),
      } : undefined,
      
      // 构建权限条件对象 - 按照后端CiPermissionConditions结构
      conditions: data.conditions && data.conditions.trim() ? {
        field: 'default',
        operator: 'eq',
        value: data.conditions,
        logic: 'AND',
      } : undefined,
      
      // 构建数据过滤对象 - 按照后端CiPermissionDataFilters结构
      dataFilters: data.dataFiltersText && data.dataFiltersText.trim() ? {
        rules: [{
          field: 'department_id',
          operator: 'eq',
          value: '1',
        }],
        logic: 'AND',
      } : undefined,
      
      // 构建字段掩码对象
      fieldMasks: data.fieldMasks && data.fieldMasks.length > 0 ? {
        fields: data.fieldMasks,
      } : undefined,
    };

    await (isUpdate.value ? updateCiPermission(submitData as any) : createCiPermission(submitData as any));
    message.success(isUpdate.value ? '权限更新成功' : '权限创建成功');
    resetInitialized();
    emit('reload');
    drawerApi.close();
  } catch (error) {
    console.error('保存权限失败:', error);
  } finally {
    drawerApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.resetForm();
  resetInitialized();
}

// 定义开放的API
defineExpose({
  open: (id?: number | string) => {
    drawerApi.setData({ id });
    drawerApi.open();
  },
});
</script>

<template>
  <BasicDrawer :title="title" class="w-[800px]">
    <BasicForm />
  </BasicDrawer>
</template>
