<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { Modal, Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  deletePermission,
  getPermissionList,
  updatePermissionStatus,
} from '#/api/cmdb/ci-permission';

import PermissionDetailDrawer from './components/PermissionDetailDrawer.vue';
import PermissionEditDrawer from './components/PermissionEditDrawer.vue';
import { columns, querySchema } from './data';

defineOptions({
  name: 'CiPermissionIndex',
});

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
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const result = await getPermissionList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });

        return {
          result: result.data,
          page: {
            total: result.total,
          },
        };
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'id',
  },
  id: 'cmdb-permission-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [PermissionEditDrawerComp, editDrawerApi] = useVbenDrawer({
  connectedComponent: PermissionEditDrawer,
});

const [PermissionDetailDrawerComp, detailDrawerApi] = useVbenDrawer({
  connectedComponent: PermissionDetailDrawer,
});

function handleAdd() {
  editDrawerApi.setData({});
  editDrawerApi.open();
}

function handleEdit(record: any) {
  editDrawerApi.setData({ id: record.id });
  editDrawerApi.open();
}

function handleView(record: any) {
  detailDrawerApi.setData({ id: record.id });
  detailDrawerApi.open();
}

async function handleDelete(row: any) {
  await deletePermission([row.id]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await deletePermission(ids);
      await tableApi.query();
    },
  });
}

async function handleToggleStatus(record: any) {
  const newStatus = record.status === 1 ? 0 : 1;
  await updatePermissionStatus([record.id], newStatus);
  await tableApi.query();
}

function handleReload() {
  tableApi.query();
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="CI权限管理">
      <template #toolbar-tools>
        <Space>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            @click="handleMultiDelete"
          >
            批量删除
          </a-button>
          <a-button type="primary" @click="handleAdd"> 新增权限 </a-button>
        </Space>
      </template>

      <template #action="{ row }">
        <Space>
          <a-button size="small" type="link" @click="handleView(row)">
            详情
          </a-button>
          <a-button size="small" type="link" @click="handleEdit(row)">
            编辑
          </a-button>
          <a-button
            size="small"
            type="link"
            :style="{ color: row.status === 1 ? '#ff4d4f' : '#52c41a' }"
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 1 ? '禁用' : '启用' }}
          </a-button>
          <Popconfirm
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <a-button size="small" type="link" danger @click.stop="">
              删除
            </a-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>

    <PermissionEditDrawerComp @reload="handleReload" />
    <PermissionDetailDrawerComp />
  </Page>
</template>
