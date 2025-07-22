<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { getVxePopupContainer } from '@vben/utils';

import { Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteOpsCommand, getOpsCommandList } from '#/api/ops/command';

import commandDrawer from './command-drawer.vue';
import { columns, querySchema } from './data';

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
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {
    enabled: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const resp = await getOpsCommandList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
        return resp;
      },
    },
  },
  /**
   * 虚拟滚动  默认关闭
   */
  scrollY: {
    enabled: false,
    gt: 0,
  },
  rowConfig: {
    isHover: true,
    keyField: 'id',
  },
  id: 'id',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});
const [CommandDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: commandDrawer,
});

function handleAdd() {
  drawerApi.setData({ update: false });
  drawerApi.open();
}

async function handleEdit(record: Recordable<any>) {
  drawerApi.setData({ id: record.id, update: true });
  drawerApi.open();
}

async function handleDelete(row: Recordable<any>) {
  await deleteOpsCommand(row.id);
  await tableApi.query();
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="命令列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            type="primary"
            v-access:code="['ops:command:create']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button
            v-access:code="['ops:command:update']"
            @click="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </ghost-button>
          <Popconfirm
            v-if="row.id !== 1"
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <ghost-button
              danger
              v-access:code="['ops:command:delete']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <CommandDrawer @reload="tableApi.query()" />
  </Page>
</template>
