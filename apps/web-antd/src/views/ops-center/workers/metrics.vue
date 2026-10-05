<script setup lang="ts">
import type {
  WorkerMetricSample,
  WorkerReadRow,
} from "#/api/ops-center/workers-read";

import { computed, onMounted, ref } from "vue";

import { Page } from "@vben/common-ui";

import { Alert, Button, Card, Select, Space, Table } from "ant-design-vue";

import { readWorkerMetrics, readWorkers } from "#/api/ops-center/workers-read";

const workers = ref<WorkerReadRow[]>([]);
const samples = ref<WorkerMetricSample[]>([]);
const selected = ref<string>();
const loading = ref(false);
const options = computed(() =>
  workers.value.map((row) => ({
    label: `${row.name} · ${row.proxyId}`,
    value: row.proxyId,
  })),
);
const ranking = computed(() =>
  [...workers.value].sort((a, b) => b.cpuUsage - a.cpuUsage),
);
const columns = [
  {
    title: "采样时间",
    dataIndex: "timestamp",
    customRender: ({ text }: { text: number }) =>
      new Date(text * 1000).toLocaleString(),
  },
  { title: "状态", dataIndex: "proxy_status" },
  { title: "CPU (%)", dataIndex: "cpu_usage" },
  { title: "内存 (%)", dataIndex: "memory_usage" },
  { title: "会话数", dataIndex: "active_sessions" },
  { title: "请求数", dataIndex: "request_delta" },
  { title: "成功数", dataIndex: "success_delta" },
  { title: "平均延迟 (ms)", dataIndex: "avg_latency_ms" },
];
const rankColumns = [
  { title: "节点", dataIndex: "name" },
  { title: "区域", dataIndex: "region" },
  { title: "当前状态", dataIndex: "proxyStatus" },
  { title: "CPU (%)", dataIndex: "cpuUsage" },
  { title: "内存 (%)", dataIndex: "memoryUsage" },
  { title: "活跃会话", dataIndex: "activeSessions" },
];
async function loadMetrics() {
  samples.value = [];
  if (!selected.value) return;
  loading.value = true;
  try {
    samples.value = await readWorkerMetrics(selected.value);
  } finally {
    loading.value = false;
  }
}
onMounted(async () => {
  workers.value = await readWorkers();
  selected.value =
    workers.value.find((row) => row.proxyId === "demo-proxy-01")?.proxyId ??
    workers.value[0]?.proxyId;
  await loadMetrics();
});
</script>
<template>
  <Page title="代理节点指标">
    <Alert
      class="mb-4"
      type="info"
      show-icon
      message="展示运维代理的历史采样与最近上报值。离线节点的历史指标不代表当前在线负载。"
    />
    <Card title="历史采样（最近 1000 条）" class="mb-4">
      <Space class="mb-4" wrap>
        <Select
          v-model:value="selected"
          :options="options"
          class="w-96"
          show-search
          option-filter-prop="label"
          placeholder="选择代理节点"
          @change="loadMetrics"
        />
        <Button :loading="loading" @click="loadMetrics">刷新历史</Button>
        <span>已加载 {{ samples.length }} 条历史采样</span>
      </Space>
      <Table
        :columns="columns"
        :data-source="samples"
        :loading="loading"
        :pagination="{ pageSize: 20, showSizeChanger: false }"
        row-key="timestamp"
        :scroll="{ x: 1000 }"
      />
    </Card>
    <Card title="节点最近上报 CPU 排行">
      <Table
        :columns="rankColumns"
        :data-source="ranking"
        :pagination="{ pageSize: 20, showSizeChanger: false }"
        row-key="id"
      />
    </Card>
  </Page>
</template>
