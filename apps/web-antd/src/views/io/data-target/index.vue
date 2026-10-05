<script setup lang="ts">
import type { VxeGridProps } from "#/adapter/vxe-table";
import type { DataTargetInfo } from "#/api/io/data-target";

import { Page } from "@vben/common-ui";

import { useVbenVxeGrid } from "#/adapter/vxe-table";
import { getDataTargetList } from "#/api/io/data-target";

const gridOptions: VxeGridProps<DataTargetInfo> = {
  columns: [
    { type: "seq", title: "序号", width: 70 },
    { field: "targetName", title: "目标名称", minWidth: 150 },
    { field: "targetType", title: "目标类型", minWidth: 150 },
    { field: "description", title: "说明", minWidth: 150 },
  ],
  pagerConfig: { pageSize: 20 },
  rowConfig: { keyField: "id" },
  proxyConfig: {
    ajax: {
      query: async ({ page }, filters) =>
        getDataTargetList({
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
        fieldName: "keyword",
        label: "目标名称",
        component: "Input",
        componentProps: { allowClear: true },
      },
      {
        fieldName: "targetType",
        label: "目标类型",
        component: "Select",
        componentProps: {
          allowClear: true,
          options: [
            { label: "文件", value: "file" },
            { label: "接口", value: "api" },
            { label: "数据库", value: "database" },
            { label: "消息队列", value: "mq" },
            { label: "缓存", value: "cache" },
          ],
        },
      },
    ],
    wrapperClass: "grid-cols-1 md:grid-cols-3",
  },
});
</script>
<template>
  <Page auto-content-height title="数据目标"><Grid /></Page>
</template>
