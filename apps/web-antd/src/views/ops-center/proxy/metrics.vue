<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';

import { Page } from '@vben/common-ui';

import {
  getProxyMetrics,
  getProxyMetricsStats,
  type WorkerMetricsItem,
  type WorkerMetricsStats,
} from '#/api/ops-center/proxy';

use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
]);

const route = useRoute();
const workerId = ref(route.query.workerId as string);
const timeRange = ref<'1h' | '6h' | '24h' | '7d'>('1h');
const metricsData = ref<WorkerMetricsItem[]>([]);
const stats = ref<WorkerMetricsStats | null>(null);
const loading = ref(false);

async function fetchMetrics() {
  loading.value = true;
  try {
    const now = Math.floor(Date.now() / 1000);
    const ranges = { '1h': 3600, '6h': 21_600, '24h': 86_400, '7d': 604_800 };
    const startTime = now - ranges[timeRange.value];

    const result = await getProxyMetrics({
      workerId: workerId.value,
      startTime,
      endTime: now,
      limit: 60,
    });
    metricsData.value = result.data;

    const statsResult = await getProxyMetricsStats({
      workerId: workerId.value,
      startTime,
      endTime: now,
    });
    stats.value = statsResult;
  } finally {
    loading.value = false;
  }
}

// CPU使用率图表配置
const cpuChartOption = computed(() => ({
  title: { text: 'CPU使用率', left: 'center' },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: metricsData.value.map((m) =>
      new Date(m.timestamp * 1000).toLocaleTimeString(),
    ),
  },
  yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
  series: [
    {
      name: 'CPU',
      type: 'line',
      smooth: true,
      data: metricsData.value.map((m) => m.cpuUsage),
      itemStyle: { color: '#1890ff' },
      markLine: {
        data: [
          {
            yAxis: 80,
            label: { formatter: '警告: 80%' },
            lineStyle: { color: '#faad14' },
          },
          {
            yAxis: 90,
            label: { formatter: '危险: 90%' },
            lineStyle: { color: '#ff4d4f' },
          },
        ],
      },
    },
  ],
}));

// 内存使用率图表配置
const memoryChartOption = computed(() => ({
  title: { text: '内存使用率', left: 'center' },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: metricsData.value.map((m) =>
      new Date(m.timestamp * 1000).toLocaleTimeString(),
    ),
  },
  yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
  series: [
    {
      name: '内存',
      type: 'line',
      smooth: true,
      data: metricsData.value.map((m) => m.memoryUsage),
      itemStyle: { color: '#52c41a' },
      markLine: {
        data: [
          {
            yAxis: 80,
            label: { formatter: '警告: 80%' },
            lineStyle: { color: '#faad14' },
          },
          {
            yAxis: 90,
            label: { formatter: '危险: 90%' },
            lineStyle: { color: '#ff4d4f' },
          },
        ],
      },
    },
  ],
}));

// 活跃会话图表配置
const sessionsChartOption = computed(() => ({
  title: { text: '活跃会话数', left: 'center' },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: metricsData.value.map((m) =>
      new Date(m.timestamp * 1000).toLocaleTimeString(),
    ),
  },
  yAxis: { type: 'value', axisLabel: { formatter: '{value}' } },
  series: [
    {
      name: '活跃会话',
      type: 'line',
      smooth: true,
      data: metricsData.value.map((m) => m.activeSessions),
      itemStyle: { color: '#722ed1' },
    },
  ],
}));

// 网络流量图表配置
const networkChartOption = computed(() => ({
  title: { text: '网络流量增量', left: 'center' },
  tooltip: { trigger: 'axis' },
  legend: { top: 30 },
  xAxis: {
    type: 'category',
    data: metricsData.value.map((m) =>
      new Date(m.timestamp * 1000).toLocaleTimeString(),
    ),
  },
  yAxis: { type: 'value', axisLabel: { formatter: '{value} bytes' } },
  series: [
    {
      name: '入站流量',
      type: 'line',
      smooth: true,
      data: metricsData.value.map((m) => m.networkInDelta),
      itemStyle: { color: '#13c2c2' },
    },
    {
      name: '出站流量',
      type: 'line',
      smooth: true,
      data: metricsData.value.map((m) => m.networkOutDelta),
      itemStyle: { color: '#eb2f96' },
    },
  ],
}));

onMounted(() => {
  fetchMetrics();
});
</script>

<template>
  <Page :loading="loading" title="Worker指标监控">
    <!-- 时间范围选择器 -->
    <a-space style="margin-bottom: 16px">
      <a-radio-group
        v-model:value="timeRange"
        button-style="solid"
        @change="fetchMetrics"
      >
        <a-radio-button value="1h">最近1小时</a-radio-button>
        <a-radio-button value="6h">最近6小时</a-radio-button>
        <a-radio-button value="24h">最近24小时</a-radio-button>
        <a-radio-button value="7d">最近7天</a-radio-button>
      </a-radio-group>
      <a-button @click="fetchMetrics">刷新</a-button>
    </a-space>

    <!-- 统计卡片 -->
    <a-row :gutter="[16, 16]" style="margin-bottom: 16px">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="平均CPU"
            :value="stats?.avgCpu"
            suffix="%"
            :precision="1"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="最大CPU"
            :value="stats?.maxCpu"
            suffix="%"
            :precision="1"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="平均内存"
            :value="stats?.avgMemory"
            suffix="%"
            :precision="1"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="成功率"
            :value="stats?.successRate"
            suffix="%"
            :precision="2"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="最大内存"
            :value="stats?.maxMemory"
            suffix="%"
            :precision="1"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="平均会话"
            :value="stats?.avgSessions"
            :precision="0"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="最大会话"
            :value="stats?.maxSessions"
            :precision="0"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="总请求数"
            :value="stats?.totalRequests"
            :precision="0"
          />
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="[16, 16]">
      <a-col :span="12">
        <a-card title="CPU使用率趋势">
          <v-chart :option="cpuChartOption" style="height: 300px" autoresize />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="内存使用率趋势">
          <v-chart
            :option="memoryChartOption"
            style="height: 300px"
            autoresize
          />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="活跃会话趋势">
          <v-chart
            :option="sessionsChartOption"
            style="height: 300px"
            autoresize
          />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="网络流量趋势">
          <v-chart
            :option="networkChartOption"
            style="height: 300px"
            autoresize
          />
        </a-card>
      </a-col>
    </a-row>
  </Page>
</template>
