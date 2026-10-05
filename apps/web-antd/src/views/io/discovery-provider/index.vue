<script setup lang="ts">
import type { VxeGridProps } from "#/adapter/vxe-table";

import { Page } from "@vben/common-ui";

import { useVbenVxeGrid } from "#/adapter/vxe-table";
import { DiscoveryProviderAPI } from "#/api/io/discovery-provider";

const gridOptions: VxeGridProps<DiscoveryProviderAPI.ProviderMetadata> = {
  columns: [
    { type: "seq", title: "序号", width: 70 },
    { field: "id", title: "Provider ID", minWidth: 180 },
    { field: "name", title: "名称", minWidth: 180 },
    { field: "category", title: "分类", minWidth: 120 },
    { field: "version", title: "版本", width: 100 },
    { field: "description", title: "说明", minWidth: 220 },
  ],
  pagerConfig: { pageSize: 20 },
  rowConfig: { keyField: "id" },
  proxyConfig: {
    ajax: {
      query: async (
        { page },
        filters: { category?: string; keyword?: string },
      ) => {
        const providers = await DiscoveryProviderAPI.listProviders();
        const keyword = (filters.keyword ?? "").trim().toLocaleLowerCase();
        const category = (filters.category ?? "").trim().toLocaleLowerCase();
        const data = providers.filter(
          (item) =>
            (!keyword ||
              `${item.id} ${item.name} ${item.description ?? ""}`
                .toLocaleLowerCase()
                .includes(keyword)) &&
            (!category ||
              (item.category ?? "").toLocaleLowerCase().includes(category)),
        );
        const start = (page.currentPage - 1) * page.pageSize;
        return {
          data: data.slice(start, start + page.pageSize),
          total: data.length,
        };
      },
    },
  },
};
const [Grid] = useVbenVxeGrid({
  gridOptions,
  formOptions: {
    schema: [
      {
        fieldName: "keyword",
        label: "名称或编码",
        component: "Input",
        componentProps: { allowClear: true },
      },
      {
        fieldName: "category",
        label: "分类",
        component: "Input",
        componentProps: { allowClear: true },
      },
    ],
    wrapperClass: "grid-cols-1 md:grid-cols-3",
  },
});
</script>
<template>
  <Page auto-content-height title="发现提供者"><Grid /></Page>
</template>
