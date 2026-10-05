<script setup lang="ts">
import type { VxeGridProps } from "#/adapter/vxe-table";
import type { DiscoveryTemplateInfo } from "#/api/io/discovery-template";

import { Page } from "@vben/common-ui";

import { useVbenVxeGrid } from "#/adapter/vxe-table";
import { getDiscoveryTemplateList } from "#/api/io/discovery-template";

const gridOptions: VxeGridProps<DiscoveryTemplateInfo> = {
  columns: [
    { type: "seq", title: "序号", width: 70 },
    { field: "templateName", title: "模板名称", minWidth: 150 },
    { field: "templateCode", title: "模板编码", minWidth: 150 },
    { field: "templateType", title: "模板类型", minWidth: 150 },
    { field: "version", title: "版本", minWidth: 150 },
    { field: "description", title: "说明", minWidth: 150 },
    { field: "usageCount", title: "使用次数", minWidth: 150 },
  ],
  pagerConfig: { pageSize: 20 },
  rowConfig: { keyField: "id" },
  proxyConfig: {
    ajax: {
      query: async ({ page }, filters) =>
        getDiscoveryTemplateList({
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
        label: "模板名称或编码",
        component: "Input",
        componentProps: { allowClear: true },
      },
      {
        fieldName: "templateType",
        label: "模板类型",
        component: "Input",
        componentProps: { allowClear: true },
      },
      {
        fieldName: "isPublic",
        label: "可见范围",
        component: "Select",
        componentProps: {
          allowClear: true,
          options: [
            { label: "公开", value: true },
            { label: "租户内", value: false },
          ],
        },
      },
    ],
    wrapperClass: "grid-cols-1 md:grid-cols-3",
  },
});
</script>
<template>
  <Page auto-content-height title="发现模板"><Grid /></Page>
</template>
