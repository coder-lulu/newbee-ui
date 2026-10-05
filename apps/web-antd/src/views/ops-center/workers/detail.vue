<script setup lang="ts">
import type { WorkerReadRow } from "#/api/ops-center/workers-read";

import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { Page } from "@vben/common-ui";

import {
  Alert,
  Card,
  Descriptions,
  DescriptionsItem,
  Select,
  Table,
} from "ant-design-vue";

import { readWorkers } from "#/api/ops-center/workers-read";

const route = useRoute();
const workers = ref<WorkerReadRow[]>([]);
const selected = ref<number>();
const current = computed(() =>
  workers.value.find((row) => row.id === selected.value),
);
const options = computed(() =>
  workers.value.map((row) => ({
    label: `${row.name} · ${row.proxyId}`,
    value: row.id,
  })),
);
const columns = [
  { title: "节点", dataIndex: "name" },
  { title: "代理标识", dataIndex: "proxyId" },
  { title: "地址", dataIndex: "ip" },
  { title: "区域", dataIndex: "region" },
  { title: "状态", dataIndex: "proxyStatus" },
];
onMounted(async () => {
  workers.value = await readWorkers();
  const requested = String(
    route.params.id ?? route.query.id ?? route.query.proxyId ?? "",
  );
  selected.value =
    workers.value.find(
      (row) => String(row.id) === requested || row.proxyId === requested,
    )?.id ?? workers.value[0]?.id;
});
</script>
<template>
  <Page title="代理节点详情">
    <Card class="mb-4" title="节点运行概况">
      <Select
        v-model:value="selected"
        :options="options"
        show-search
        option-filter-prop="label"
        class="mb-4 w-96"
        placeholder="选择代理节点"
      />
      <Descriptions v-if="current" bordered :column="2">
        <DescriptionsItem label="名称">{{ current.name }}</DescriptionsItem>
        <DescriptionsItem label="代理标识">
          {{ current.proxyId }}
        </DescriptionsItem>
        <DescriptionsItem label="服务地址">
          {{ current.ip }}:{{ current.port }}
        </DescriptionsItem>
        <DescriptionsItem label="运行状态">
          {{ current.proxyStatus }}
        </DescriptionsItem>
        <DescriptionsItem label="区域">{{ current.region }}</DescriptionsItem>
        <DescriptionsItem label="可用区">
          {{ current.zone || "—" }}
        </DescriptionsItem>
        <DescriptionsItem label="最近心跳">
          {{
            current.lastHeartbeat
              ? new Date(current.lastHeartbeat).toLocaleString()
              : "尚无心跳记录"
          }}
        </DescriptionsItem>
        <DescriptionsItem label="会话容量">
          {{ current.activeSessions }} /
          {{ current.maxSessions }}
        </DescriptionsItem>
        <DescriptionsItem label="最近 CPU">
          {{ current.cpuUsage }}%
        </DescriptionsItem>
        <DescriptionsItem label="最近内存">
          {{ current.memoryUsage }}%
        </DescriptionsItem>
        <DescriptionsItem label="累计请求">
          {{ current.totalRequests }}
        </DescriptionsItem>
        <DescriptionsItem label="成功请求">
          {{ current.successCount }}
        </DescriptionsItem>
      </Descriptions>
      <Alert v-else type="info" message="当前租户暂无可查看的代理节点。" />
    </Card>
    <Card title="可查看的代理节点">
      <Table
        :columns="columns"
        :data-source="workers"
        :pagination="{ pageSize: 20, showSizeChanger: false }"
        row-key="id"
        :scroll="{ x: 900 }"
      />
    </Card>
  </Page>
</template>
