<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteOpsCommandExecHistory,
  getOpsCommandExecHistoryList,
} from '#/api/ops/exec-history';

import { columns, querySchema } from './data';
import execCommandDrawer from './exec-command-drawer.vue';
import historyDrawer from './history-drawer.vue';
import terminalDrawer from './terminal-drawer.vue';

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
        const resp = await getOpsCommandExecHistoryList({
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
const [HistoryDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: historyDrawer,
});

const [ExecCommandDrawer, execDrawerApi] = useVbenDrawer({
  connectedComponent: execCommandDrawer,
});

// Terminal组件现在使用内部的useVbenDrawer，所以这里只需要引用组件
const TerminalDrawer = terminalDrawer;
const terminalDrawerRef = ref();

function handleExecCommand(record: Recordable<any>) {
  execDrawerApi.setData({
    commandId: record.commandId,
    commandName: record.commandName,
  });
  execDrawerApi.open();
}

function handleOpenTerminal() {
  terminalDrawerRef.value?.open();
}

async function handleDetail(record: Recordable<any>) {
  drawerApi.setData({ id: record.id, update: true });
  drawerApi.open();
}

async function handleDelete(row: Recordable<any>) {
  await deleteOpsCommandExecHistory(row.id);
  await tableApi.query();
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="执行历史">
      <template #toolbar-tools>
        <Space>
          <a-button
            type="primary"
            v-access:code="['ops:command:exec']"
            @click="() => handleExecCommand({})"
          >
            执行命令
          </a-button>
          <a-button
            type="default"
            v-access:code="['ops:command:exec']"
            @click="handleOpenTerminal"
          >
            连接终端
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button
            v-access:code="['ops:exec-history:detail']"
            @click="handleDetail(row)"
          >
            查看详情
          </ghost-button>
        </Space>
      </template>
    </BasicTable>
    <HistoryDrawer @reload="tableApi.query()" />
    <ExecCommandDrawer @reload="tableApi.query()" />
    <TerminalDrawer ref="terminalDrawerRef" />
  </Page>
</template>
