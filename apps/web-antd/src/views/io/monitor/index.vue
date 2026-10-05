<script setup lang="ts">
import type { VxeGridProps } from "#/adapter/vxe-table";
import type { WorkerMetricsInfo } from "#/api/io/monitor";

import { Page } from "@vben/common-ui";

import dayjs from "dayjs";

import { useVbenVxeGrid } from "#/adapter/vxe-table";
import { getWorkerMetricsList } from "#/api/io/monitor";

const gridOptions: VxeGridProps<WorkerMetricsInfo> = {
  columns: [
    { type: "seq", title: "序号", width: 70 },
    { field: "workerId", title: "Worker ID", minWidth: 150 },
    { field: "cpuUsagePercent", title: "CPU 使用率 (%)", minWidth: 150 },
    { field: "memoryUsagePercent", title: "内存使用率 (%)", minWidth: 150 },
    { field: "currentTaskCount", title: "当前任务数", minWidth: 150 },
    {
      field: "metricTime",
      title: "最后心跳",
      minWidth: 180,
      formatter: ({ row }) =>
        row.metricTime
          ? dayjs(row.metricTime).format("YYYY-MM-DD HH:mm:ss")
          : "—",
    },
  ],
  pagerConfig: { pageSize: 20 },
  rowConfig: { keyField: "id" },
  proxyConfig: {
    ajax: {
      query: async ({ page }, filters) =>
        getWorkerMetricsList({
          ...filters,
          page: page.currentPage,
          pageSize: page.pageSize,
        }),
    },
  },
};
const [Grid] = useVbenVxeGrid({
  gridOptions,
  formOptions: {
    schema: [
      {
        fieldName: "workerId",
        label: "Worker ID",
        component: "Input",
        componentProps: { allowClear: true },
      },
    ],
    wrapperClass: "grid-cols-1 md:grid-cols-3",
  },
});
</script>
<template>
  <Page auto-content-height title="监控与指标"><Grid /></Page>
</template>
