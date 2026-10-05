<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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
import {
  Drawer,
  Descriptions,
  Tabs,
  Space,
  RadioGroup,
  RadioButton,
  Row,
  Col,
  Card,
  Statistic,
  Badge,
  Tag,
  Progress,
  Button
} from 'ant-design-vue';

import {
  getProxyMetrics,
  getProxyMetricsStats,
  type ProxyItem,
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

const props = defineProps<{
  open: boolean;
  worker: ProxyItem | null;
}>();

const emit = defineEmits(['update:open', 'close']);

const activeTab = ref('overview');
const timeRange = ref<'1h' | '6h' | '24h' | '7d'>('1h');
const metricsData = ref<WorkerMetricsItem[]>([]);
const stats = ref<WorkerMetricsStats | null>(null);
const loading = ref(false);

const cpuChartOption = computed(() => ({
  title: { text: 'CPU使用率', left: 'center' },
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
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

const memoryChartOption = computed(() => ({
  title: { text: '内存使用率', left: 'center' },
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
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

const sessionsChartOption = computed(() => ({
  title: { text: '活跃会话数', left: 'center' },
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
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

const networkChartOption = computed(() => ({
  title: { text: '网络流量增量', left: 'center' },
  tooltip: { trigger: 'axis' },
  legend: { top: 30 },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
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

async function fetchMetrics() {
  if (!props.worker) return;
  loading.value = true;
  try {
    const now = Math.floor(Date.now() / 1000);
    const ranges = { '1h': 3600, '6h': 21_600, '24h': 86_400, '7d': 604_800 };
    const startTime = now - ranges[timeRange.value];

    const result = await getProxyMetrics({
      workerId: props.worker.workerId,
      startTime,
      endTime: now,
      limit: 60,
    });
    metricsData.value = result.data;

    const statsResult = await getProxyMetricsStats({
      workerId: props.worker.workerId,
      startTime,
      endTime: now,
    });
    stats.value = statsResult;
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.open,
  (val) => {
    if (val && props.worker) {
      fetchMetrics();
    }
  },
);

function onClose() {
  emit('update:open', false);
  emit('close');
}

function formatTime(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString();
}
</script>

<template>
  <Drawer
    :open="open"
    :title="`Worker详情: ${worker?.name || ''}`"
    width="80%"
    placement="right"
    @close="onClose"
  >
    <Tabs v-model:activeKey="activeTab">
      <Tabs.TabPane key="overview" tab="概览">
        <!-- 上方：Proxy详情信息 -->
        <Card title="基本信息" :bordered="false" class="mb-4">
          <Descriptions bordered :column="{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }">
            <Descriptions.Item label="Worker ID">{{ worker?.workerId }}</Descriptions.Item>
            <Descriptions.Item label="名称">{{ worker?.name }}</Descriptions.Item>
            <Descriptions.Item label="状态">
               <Badge
                :status="worker?.workerStatus === 'online' ? 'success' : worker?.workerStatus === 'degraded' ? 'warning' : 'error'"
                :text="worker?.workerStatus === 'online' ? '在线' : worker?.workerStatus === 'degraded' ? '降级' : '离线'"
              />
            </Descriptions.Item>
            <Descriptions.Item label="IP地址">{{ worker?.ip }}:{{ worker?.port }}</Descriptions.Item>
            <Descriptions.Item label="地区/可用区">{{ worker?.region }} / {{ worker?.zone }}</Descriptions.Item>
            <Descriptions.Item label="权重">{{ worker?.weight }}</Descriptions.Item>
            <Descriptions.Item label="活跃会话">{{ worker?.activeSessions }} / {{ worker?.maxSessions }}</Descriptions.Item>
            <Descriptions.Item label="注册时间">{{ worker?.registerTime ? formatTime(worker.registerTime) : '-' }}</Descriptions.Item>
            <Descriptions.Item label="最后心跳">{{ worker?.lastHeartbeat ? formatTime(worker.lastHeartbeat) : '-' }}</Descriptions.Item>
            <Descriptions.Item label="版本">{{ worker?.version || '-' }}</Descriptions.Item>
            <Descriptions.Item label="标签">
              <Tag v-for="tag in worker?.tags" :key="tag">{{ tag }}</Tag>
            </Descriptions.Item>
             <Descriptions.Item label="能力">
              <Tag v-for="cap in worker?.capabilities" :key="cap" color="blue">{{ cap }}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <!-- 下方：Proxy性能信息 -->
        <Card title="性能监控" :bordered="false">
           <template #extra>
             <Space>
              <RadioGroup
                v-model:value="timeRange"
                button-style="solid"
                size="small"
                @change="fetchMetrics"
              >
                <RadioButton value="1h">1小时</RadioButton>
                <RadioButton value="6h">6小时</RadioButton>
                <RadioButton value="24h">24小时</RadioButton>
                <RadioButton value="7d">7天</RadioButton>
              </RadioGroup>
              <Button size="small" @click="fetchMetrics">刷新</Button>
            </Space>
           </template>

           <!-- 统计卡片 -->
          <Row :gutter="[16, 16]" class="mb-4">
            <Col :span="6">
              <Card size="small">
                <Statistic title="平均CPU" :value="stats?.avgCpu" suffix="%" :precision="1" />
              </Card>
            </Col>
            <Col :span="6">
              <Card size="small">
                <Statistic title="平均内存" :value="stats?.avgMemory" suffix="%" :precision="1" />
              </Card>
            </Col>
            <Col :span="6">
              <Card size="small">
                <Statistic title="成功率" :value="stats?.successRate" suffix="%" :precision="2" />
              </Card>
            </Col>
            <Col :span="6">
              <Card size="small">
                <Statistic title="总请求数" :value="stats?.totalRequests" :precision="0" />
              </Card>
            </Col>
          </Row>

          <!-- 图表区域 -->
          <Row :gutter="[16, 16]">
            <Col :span="12">
              <Card title="CPU使用率趋势" size="small" :bordered="false">
                <VChart :option="cpuChartOption" style="height: 300px" autoresize />
              </Card>
            </Col>
            <Col :span="12">
              <Card title="内存使用率趋势" size="small" :bordered="false">
                <VChart :option="memoryChartOption" style="height: 300px" autoresize />
              </Card>
            </Col>
            <Col :span="12">
              <Card title="活跃会话趋势" size="small" :bordered="false">
                <VChart :option="sessionsChartOption" style="height: 300px" autoresize />
              </Card>
            </Col>
            <Col :span="12">
              <Card title="网络流量趋势" size="small" :bordered="false">
                <VChart :option="networkChartOption" style="height: 300px" autoresize />
              </Card>
            </Col>
          </Row>
        </Card>
      </Tabs.TabPane>
      <Tabs.TabPane key="logs" tab="日志 (开发中)" disabled>
        <div class="p-4 text-center text-gray-500">
          日志功能即将上线
        </div>
      </Tabs.TabPane>
    </Tabs>
  </Drawer>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
</style>
