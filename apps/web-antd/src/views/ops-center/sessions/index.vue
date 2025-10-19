<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listSessions, closeSession, type SessionItem } from '#/api/ops-center/session';
import { Modal, message } from 'ant-design-vue';

const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 80 },
  schema: [
    {
      fieldName: 'ciId',
      label: 'CI ID',
      component: 'Input',
      componentProps: { allowClear: true, placeholder: '如 ci-123' },
    },
    {
      fieldName: 'status',
      label: '状态',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: 'active', value: 'active' },
          { label: 'closed', value: 'closed' },
        ],
      },
    },
    {
      fieldName: 'protocol',
      label: '协议',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: 'ssh', value: 'ssh' },
          { label: 'telnet', value: 'telnet' },
          { label: 'rdp', value: 'rdp' },
          { label: 'vnc', value: 'vnc' },
        ],
      },
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const columns: VxeGridProps['columns'] = [
  { type: 'seq', width: 60, title: '#' },
  { field: 'id', title: 'Session ID', minWidth: 220 },
  { field: 'ciId', title: 'CI', minWidth: 140 },
  { field: 'protocol', title: '协议', minWidth: 80 },
  { field: 'proxyId', title: '代理', minWidth: 140 },
  { field: 'status', title: '状态', minWidth: 90 },
  { field: 'action', title: '操作', width: 140, slots: { default: 'action' } },
  {
    field: 'createdAt',
    title: '创建时间',
    minWidth: 160,
    formatter: ({ cellValue }) =>
      cellValue ? new Date(Number(cellValue) * 1000).toLocaleString() : '',
  },
  {
    field: 'expiresAt',
    title: '过期时间',
    minWidth: 160,
    formatter: ({ cellValue }) =>
      cellValue ? new Date(Number(cellValue) * 1000).toLocaleString() : '',
  },
];

const gridOptions: VxeGridProps = {
  id: 'ops-center-sessions',
  columns,
  height: 'auto',
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async (_params, formValues = {}) => {
        const page = _params?.page?.currentPage ?? 1;
        const size = _params?.page?.pageSize ?? 10;
        return listSessions({ ...formValues, page, size });
      },
    },
  },
  pagerConfig: { enabled: true },
  rowConfig: { keyField: 'id' },
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

function handleClose(row: SessionItem) {
  if (!row?.id) return;
  Modal.confirm({
    title: `确认关闭会话 ${row.id}?`,
    onOk: async () => {
      await closeSession({ sessionId: row.id, reason: 'manual', force: true });
      message.success('会话已关闭');
      await tableApi.query();
    },
  });
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable>
      <template #action="{ row }">
        <a-button type="link" danger @click="handleClose(row)">关闭</a-button>
      </template>
    </BasicTable>
  </Page>
  
</template>
