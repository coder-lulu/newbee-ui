<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { TenantInfo } from '#/api/system/tenant/model';

import { computed, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Fallback, Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';

import { Modal, Popconfirm, Space, Tag } from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  getTenantList,
  deleteTenant,
  updateTenantStatus,
  initTenant,
  tenantExport,
} from '#/api/system/tenant';
import { TableSwitch } from '#/components/table';

import { columns, querySchema, tenantStatusOptions, initTenantSchema } from './data';
import tenantDrawer from './tenant-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
    checkMethod: ({ row }) => row?.id !== 1,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await getTenantList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'id',
  },
  id: 'system-tenant-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [TenantDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: tenantDrawer,
});

// 创建独立的表单实例
const [InitTenantForm, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 120,
  },
  schema: initTenantSchema(),
  showDefaultActions: false, // 不显示表单默认的操作按钮组
});

// 创建简单的模态框
const [InitTenantModal, initModalApi] = useVbenModal({
  title: '初始化租户数据',
  fullscreenButton: false,
  onCancel: () => initModalApi.close(),
  onConfirm: async () => {
    try {
      const { valid } = await formApi.validate();
      if (!valid) {
        return;
      }
      
      const values = await formApi.getValues();
      console.log('表单验证通过，提交数据:', values);
      
      // 确保 tenantId 被包含（因为是隐藏字段，手动确认）
      if (!values.tenantId) {
        throw new Error('租户ID不能为空');
      }
      
      await initTenant(values);
      await tableApi.query();
      initModalApi.close();
    } catch (error) {
      console.error('租户初始化失败:', error);
      throw error;
    }
  },
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: TenantInfo) {
  drawerApi.setData({ id: record.id });
  drawerApi.open();
}

async function handleDelete(row: TenantInfo) {
  await deleteTenant([row.id!]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: TenantInfo) => row.id!);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await deleteTenant(ids);
      await tableApi.query();
    },
  });
}

function handleDownloadExcel() {
  // TODO: 实现导出功能
  console.log('导出租户数据', tableApi.formApi.form.values);
}

async function handleStatusChange(record: TenantInfo) {
  await updateTenantStatus({
    id: record.id!,
    status: record.status!,
  });
  await tableApi.query();
}

async function handleInitTenantData(record: TenantInfo) {
  // 设置表单的初始值
  formApi.setValues({ tenantId: record.id });
  initModalApi.open();
}

const { hasAccessByCodes, hasAccessByRoles } = useAccess();

const isSuperAdmin = computed(() => {
  return hasAccessByRoles(['superadmin']);
});

function getStatusTag(status: number) {
  const option = tenantStatusOptions.find(item => item.value === status);
  return option || { label: '未知', color: 'default' };
}
</script>

<template>
  <Page v-if="isSuperAdmin" :auto-content-height="true">
    <BasicTable table-title="租户管理">
      <template #toolbar-tools>
        <Space>
          <a-button
            v-access:code="['system:tenant:export']"
            @click="handleDownloadExcel"
          >
            导出
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            v-access:code="['system:tenant:remove']"
            @click="handleMultiDelete"
          >
            批量删除
          </a-button>
          <a-button
            type="primary"
            v-access:code="['system:tenant:add']"
            @click="handleAdd"
          >
            新增租户
          </a-button>
        </Space>
      </template>
      <template #status="{ row }">
        <Tag :color="getStatusTag(row.status).color">
          {{ getStatusTag(row.status).label }}
        </Tag>
      </template>
      <template #action="{ row }">
        <Space v-if="row.id !== 1">
          <a-button
            size="small"
            type="link"
            v-access:code="['system:tenant:edit']"
            @click="handleEdit(row)"
          >
            编辑
          </a-button>
          <a-button
            size="small"
            type="link"
            class="text-orange-500"
            v-access:code="['system:tenant:init']"
            @click="handleInitTenantData(row)"
          >
            初始化
          </a-button>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除该租户吗？"
            @confirm="handleDelete(row)"
          >
            <a-button
              size="small"
              type="link"
              danger
              v-access:code="['system:tenant:remove']"
            >
              删除
            </a-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    
    <!-- 租户编辑抽屉 -->
    <TenantDrawer @reload="tableApi.query()" />
    
    <!-- 租户初始化模态框 -->
    <InitTenantModal>
      <InitTenantForm />
    </InitTenantModal>
  </Page>
  <Fallback v-else description="您没有租户管理权限" status="403" />
</template>
