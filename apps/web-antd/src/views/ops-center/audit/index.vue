<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listAudit } from '#/api/ops-center/audit';

const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 80 },
  schema: [
    { fieldName: 'type', label: '类型', component: 'Input', componentProps: { allowClear: true } },
    { fieldName: 'subjectUser', label: '用户', component: 'Input', componentProps: { allowClear: true } },
    { fieldName: 'subjectCI', label: 'CI', component: 'Input', componentProps: { allowClear: true } },
  ],
};

const columns: VxeGridProps['columns'] = [
  { type: 'seq', width: 60, title: '#' },
  { field: 'eventID', title: '事件ID', minWidth: 220 },
  { field: 'type', title: '类型', minWidth: 120 },
  { field: 'subjectUser', title: '用户', minWidth: 120 },
  { field: 'subjectCI', title: 'CI', minWidth: 160 },
  { field: 'subjectProxy', title: '代理', minWidth: 160 },
  {
    field: 'occurAt',
    title: '发生时间',
    minWidth: 160,
    formatter: ({ cellValue }) => (cellValue ? new Date(Number(cellValue) * 1000).toLocaleString() : ''),
  },
  {
    field: 'meta',
    title: '元数据',
    minWidth: 200,
    formatter: ({ cellValue }) => (cellValue ? JSON.stringify(cellValue) : ''),
  },
];

const gridOptions: VxeGridProps = {
  id: 'ops-center-audit',
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: { enabled: false },
  proxyConfig: {
    ajax: {
      query: async () => listAudit(),
    },
  },
  rowConfig: { keyField: 'eventID' },
};

const [BasicTable] = useVbenVxeGrid({ formOptions, gridOptions });
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable />
  </Page>
</template>

