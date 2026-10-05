<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { use } from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';

import { Page } from '@vben/common-ui';

import { listProxies, type ProxyItem } from '#/api/ops-center/proxy';

use([
  PieChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
]);

const workers = ref<ProxyItem[]>([]);
const loading = ref(false);

const stats = computed(() => {
  const online = workers.value.filter((w) => w.workerStatus === 'online')
    .length;
  const degraded = workers.value.filter((w) => w.workerStatus === 'degraded')
    .length;
  const offline = workers.value.filter((w) => w.workerStatus === 'offline')
    .length;
  const total = workers.value.length;

  const activeSessions = workers.value.reduce(
    (sum, w) => sum + w.activeSessions,
    0,
  );

  const avgCpu =
    workers.value.length > 0
      ? workers.value.reduce((sum, w) => sum + w.cpuUsage, 0) /
        workers.value.length
      : 0;

  const avgMemory =
    workers.value.length > 0
      ? workers.value.reduce((sum, w) => sum + w.memoryUsage, 0) /
        workers.value.length
      : 0;

  const totalRequests = workers.value.reduce(
    (sum, w) => sum + w.totalRequests,
    0,
  );

  const totalSuccess = workers.value.reduce(
    (sum, w) => sum + w.successCount,
    0,
  );

  const successRate =
    totalRequests > 0 ? (totalSuccess / totalRequests) * 100 : 0;

  return {
    online,
    degraded,
    offline,
    total,
    activeSessions,
    avgCpu,
    avgMemory,
    totalRequests,
    totalSuccess,
    successRate,
  };
});

// Worker状态分布饼图
const statusPieOption = computed(() => ({
  title: { text: 'Worker状态分布', left: 'center' },
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', left: 'left' },
  series: [
    {
      name: '状态',
      type: 'pie',
      radius: '50%',
      data: [
        { value: stats.value.online, name: '在线', itemStyle: { color: '#52c41a' } },
        { value: stats.value.degraded, name: '降级', itemStyle: { color: '#faad14' } },
        { value: stats.value.offline, name: '离线', itemStyle: { color: '#ff4d4f' } },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
}));

// 地区分布柱状图
const regionBarOption = computed(() => {
  const regionMap = new Map<string, number>();
  for (const worker of workers.value) {
    const count = regionMap.get(worker.region) || 0;
    regionMap.set(worker.region, count + 1);
  }

  const regions = [...regionMap.keys()];
  const counts = [...regionMap.values()];

  return {
    title: { text: 'Worker地区分布', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: regions },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}' } },
    series: [
      {
        name: 'Worker数量',
        type: 'bar',
        data: counts,
        itemStyle: { color: '#1890ff' },
      },
    ],
  };
});

// CPU使用率分布柱状图
const cpuDistributionOption = computed(() => {
  const ranges = ['0-50%', '50-80%', '80-90%', '90-100%'];
  const counts = [
    workers.value.filter((w) => w.cpuUsage <= 50).length,
    workers.value.filter((w) => w.cpuUsage > 50 && w.cpuUsage <= 80).length,
    workers.value.filter((w) => w.cpuUsage > 80 && w.cpuUsage <= 90).length,
    workers.value.filter((w) => w.cpuUsage > 90).length,
  ];

  return {
    title: { text: 'CPU使用率分布', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ranges },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}' } },
    series: [
      {
        name: 'Worker数量',
        type: 'bar',
        data: counts,
        itemStyle: {
          color: (params: any) => {
            const colors = ['#52c41a', '#1890ff', '#faad14', '#ff4d4f'];
            return colors[params.dataIndex];
          },
        },
      },
    ],
  };
});

async function fetchData() {
  loading.value = true;
  try {
    const result = await listProxies({ page: 1, pageSize: 1000 });
    workers.value = result.data;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <Page :loading="loading" title="运维中心概览">
    <!-- 统计卡片 -->
    <a-row :gutter="[16, 16]" style="margin-bottom: 24px">
      <a-col :span="6">
        <a-card>
          <a-statistic title="Worker总数" :value="stats.total">
            <template #suffix>
              <div style="font-size: 14px; color: #52c41a">
                在线: {{ stats.online }}
              </div>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="活跃会话" :value="stats.activeSessions" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="平均CPU"
            :value="stats.avgCpu"
            suffix="%"
            :precision="1"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="平均内存"
            :value="stats.avgMemory"
            suffix="%"
            :precision="1"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="降级Worker"
            :value="stats.degraded"
            :value-style="{ color: '#faad14' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="离线Worker"
            :value="stats.offline"
            :value-style="{ color: '#ff4d4f' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="总请求数" :value="stats.totalRequests" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="成功率"
            :value="stats.successRate"
            suffix="%"
            :precision="2"
          />
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表 -->
    <a-row :gutter="[16, 16]">
      <a-col :span="12">
        <a-card title="Worker状态分布">
          <v-chart
            :option="statusPieOption"
            style="height: 300px"
            autoresize
          />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="Worker地区分布">
          <v-chart
            :option="regionBarOption"
            style="height: 300px"
            autoresize
          />
        </a-card>
      </a-col>
      <a-col :span="24">
        <a-card title="CPU使用率分布">
          <v-chart
            :option="cpuDistributionOption"
            style="height: 300px"
            autoresize
          />
        </a-card>
      </a-col>
    </a-row>
  </Page>
</template>
