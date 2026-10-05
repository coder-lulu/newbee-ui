<script setup lang="ts">
import type {
  WorkerReadRow,
  WorkerSelection,
} from "#/api/ops-center/workers-read";

import { computed, onMounted, ref } from "vue";

import { Page } from "@vben/common-ui";

import { Alert, Button, Card, Select, Space, Table } from "ant-design-vue";

import {
  previewWorkerSelection,
  readWorkers,
} from "#/api/ops-center/workers-read";

const workers = ref<WorkerReadRow[]>([]);
const strategy = ref("least_connections");
const region = ref<string>();
const result = ref<WorkerSelection>();
const loading = ref(false);
const regions = computed(() =>
  [...new Set(workers.value.map((row) => row.region).filter(Boolean))].map(
    (value) => ({ label: value, value }),
  ),
);
const visible = computed(() =>
  workers.value.filter((row) => !region.value || row.region === region.value),
);
const strategies = [
  { label: "最少连接", value: "least_connections" },
  { label: "轮询", value: "round_robin" },
  { label: "权重", value: "weighted" },
  { label: "随机", value: "random" },
];
const columns = [
  { title: "节点", dataIndex: "name" },
  { title: "代理标识", dataIndex: "proxyId" },
  { title: "区域", dataIndex: "region" },
  { title: "运行状态", dataIndex: "proxyStatus" },
  { title: "权重", dataIndex: "weight" },
  { title: "活跃会话", dataIndex: "activeSessions" },
];
async function preview() {
  loading.value = true;
  result.value = undefined;
  try {
    result.value = await previewWorkerSelection(strategy.value, region.value);
  } finally {
    loading.value = false;
  }
}
onMounted(async () => {
  workers.value = await readWorkers();
});
</script>
<template>
  <Page title="代理选择预览">
    <Alert
      class="mb-4"
      show-icon
      type="info"
      message="预览只查询已启用的在线代理，不创建任务或会话。演示代理保持离线，不参与实际选择。"
    />
    <Card class="mb-4" title="选择条件">
      <Space wrap>
        <Select v-model:value="strategy" :options="strategies" class="w-44" />
        <Select
          v-model:value="region"
          :options="regions"
          allow-clear
          placeholder="全部区域"
          class="w-44"
        />
        <Button :loading="loading" @click="preview">预览选择结果</Button>
      </Space>
      <Alert
        v-if="result"
        class="mt-4"
        type="success"
        :message="`${result.name} · ${result.proxy_id} · ${result.ip}:${result.port}`"
      />
    </Card>
    <Card title="代理清单与状态">
      <Table
        :columns="columns"
        :data-source="visible"
        :pagination="{ pageSize: 20, showSizeChanger: false }"
        row-key="id"
        :scroll="{ x: 900 }"
      />
    </Card>
  </Page>
</template>
