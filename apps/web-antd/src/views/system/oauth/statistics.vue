<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue';
import { Page } from '@vben/common-ui';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Select, 
  DatePicker, 
  Space, 
  Tag,
  Button,
  Tooltip,
  Progress,
  Table,
  Avatar
} from 'ant-design-vue';
import { 
  UserOutlined, 
  LoginOutlined, 
  ApiOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  TrophyOutlined,
  FileTextOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue';

// 导入图表组件
import LoginChart from './components/login-chart.vue';
import ProviderUsage from './components/provider-usage.vue';
import RealTimeMonitor from './components/real-time-monitor.vue';

import { getOauthStatistics } from '#/api/system/oauth';

// 统计数据
const statistics = ref<any>({});
// 时间范围
const timeRange = ref('7d');
// 图表数据
const loginTrendData = ref<any[]>([]);
const hourlyDistributionData = ref<any[]>([]);
const providerStatsData = ref<any[]>([]);
// 详细统计数据
const detailedStats = ref<any[]>([]);
const topProviders = ref<any[]>([]);
// 加载状态
const loading = ref(false);

// 时间范围选项
const timeRangeOptions = [
  { label: '最近7天', value: '7d' },
  { label: '最近30天', value: '30d' },
  { label: '最近90天', value: '90d' },
  { label: '最近1年', value: '1y' },
];

// 获取小时颜色
function getHourColor(hour: number, count: number): string {
  // 根据时间段返回不同颜色
  if (hour >= 9 && hour <= 17) {
    return '#1890ff'; // 工作时间 - 蓝色
  } else if (hour >= 19 && hour <= 22) {
    return '#52c41a'; // 晚上活跃时间 - 绿色
  } else if (hour >= 0 && hour <= 6) {
    return '#ff4d4f'; // 深夜时间 - 红色
  } else {
    return '#722ed1'; // 其他时间 - 紫色
  }
}

// 表格列定义
const providerColumns = [
  {
    title: '排名',
    dataIndex: 'rank',
    width: 60,
    customRender: ({ record, index }: any) => {
      const rankColors = ['#faad14', '#a0a0a0', '#d48806'];
      const color = rankColors[index] || '#1890ff';
      return h('div', { style: { textAlign: 'center' } }, [
        h(TrophyOutlined, { style: { color, fontSize: '16px' } }),
        h('span', { style: { marginLeft: '4px', fontWeight: 'bold' } }, index + 1)
      ]);
    },
  },
  {
    title: '提供商',
    dataIndex: 'provider',
    customRender: ({ record }: any) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h(Avatar, { 
          src: record.iconUrl, 
          size: 24 
        }, record.displayName?.charAt(0)),
        h('span', { class: 'font-medium' }, record.displayName)
      ]);
    },
  },
  {
    title: '类型',
    dataIndex: 'type',
    customRender: ({ record }: any) => {
      const colors: Record<string, string> = {
        google: 'red',
        github: 'purple',
        wechat: 'green',
        qq: 'cyan',
        custom: 'default',
      };
      return h(Tag, { color: colors[record.type] || 'default' }, record.type);
    },
  },
  {
    title: '总使用次数',
    dataIndex: 'totalUsage',
    sorter: (a: any, b: any) => a.totalUsage - b.totalUsage,
    customRender: ({ text }: any) => {
      return h('span', { class: 'font-medium text-blue-600' }, text.toLocaleString());
    },
  },
  {
    title: '成功率',
    dataIndex: 'successRate',
    sorter: (a: any, b: any) => a.successRate - b.successRate,
    customRender: ({ record }: any) => {
      const rate = record.successRate;
      const color = rate >= 95 ? '#52c41a' : rate >= 90 ? '#faad14' : '#ff4d4f';
      return h(Progress, {
        percent: rate,
        size: 'small',
        strokeColor: color,
        format: () => `${rate}%`,
      });
    },
  },
  {
    title: '平均响应时间',
    dataIndex: 'avgResponseTime',
    sorter: (a: any, b: any) => a.avgResponseTime - b.avgResponseTime,
    customRender: ({ text }: any) => {
      const color = text <= 100 ? '#52c41a' : text <= 200 ? '#faad14' : '#ff4d4f';
      return h('span', { style: { color, fontWeight: 'bold' } }, `${text}ms`);
    },
  },
  {
    title: '最后使用',
    dataIndex: 'lastUsed',
    customRender: ({ text }: any) => {
      return text ? new Date(text).toLocaleDateString() : '从未使用';
    },
  },
];

// 计算总体统计
const overallStats = computed(() => ({
  totalLogins: statistics.value.totalLogins || 0,
  totalUsers: statistics.value.totalUsers || 0,
  totalProviders: statistics.value.totalProviders || 0,
  avgResponseTime: statistics.value.avgResponseTime || 0,
  successRate: statistics.value.successRate || 0,
  todayLogins: statistics.value.todayLogins || 0,
}));

// 生成模拟数据
function generateMockData() {
  // 登录趋势数据
  loginTrendData.value = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 200) + 50,
    };
  });

  // 小时分布数据
  hourlyDistributionData.value = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: Math.floor(Math.random() * 100) + 10,
  }));

  // 提供商统计数据
  providerStatsData.value = [
    {
      displayName: 'Google',
      type: 'google',
      iconUrl: '',
      successCount: 2150,
      failureCount: 45,
      avgResponseTime: 85,
    },
    {
      displayName: '微信',
      type: 'wechat',
      iconUrl: '',
      successCount: 1890,
      failureCount: 78,
      avgResponseTime: 120,
    },
    {
      displayName: 'GitHub',
      type: 'github',
      iconUrl: '',
      successCount: 1245,
      failureCount: 23,
      avgResponseTime: 95,
    },
    {
      displayName: 'QQ',
      type: 'qq',
      iconUrl: '',
      successCount: 856,
      failureCount: 34,
      avgResponseTime: 110,
    },
    {
      displayName: 'Facebook',
      type: 'facebook',
      iconUrl: '',
      successCount: 567,
      failureCount: 19,
      avgResponseTime: 140,
    },
  ];

  // Top提供商排行
  topProviders.value = providerStatsData.value.map((item, index) => ({
    rank: index + 1,
    provider: item.displayName,
    displayName: item.displayName,
    type: item.type,
    iconUrl: item.iconUrl,
    totalUsage: item.successCount + item.failureCount,
    successRate: Math.round((item.successCount / (item.successCount + item.failureCount)) * 100),
    avgResponseTime: item.avgResponseTime,
    lastUsed: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
  })).sort((a, b) => b.totalUsage - a.totalUsage);

  // 统计数据
  statistics.value = {
    totalLogins: 15678,
    totalUsers: 3456,
    totalProviders: 8,
    avgResponseTime: 108,
    successRate: 96.8,
    todayLogins: 234,
    weeklyGrowth: 12.5,
    monthlyGrowth: 8.3,
  };
}

// 加载统计数据
async function loadStatistics() {
  loading.value = true;
  try {
    // const data = await getOauthStatistics();
    // statistics.value = data;
    generateMockData();
  } catch (error) {
    console.error('Failed to load statistics:', error);
    generateMockData();
  } finally {
    loading.value = false;
  }
}

// 刷新数据
function refreshData() {
  loadStatistics();
}

// 导出数据
function exportData() {
  console.log('导出统计数据...');
}

// 处理时间范围变化
function handleTimeRangeChange() {
  loadStatistics();
}

// 处理实时统计更新
function handleRealtimeStatsUpdate(stats: any) {
  // 更新总体统计中的实时数据
  statistics.value = {
    ...statistics.value,
    currentLogins: stats.currentLogins,
    onlineUsers: stats.onlineUsers,
    avgResponseTime: stats.avgResponseTime,
  };
}

// Vue组件渲染函数

onMounted(() => {
  loadStatistics();
});
</script>

<template>
  <Page :auto-content-height="true">
    <!-- 页面头部 -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">OAuth统计分析</h2>
        <p class="text-gray-600">全面的OAuth使用情况分析和统计报告</p>
      </div>
      <Space>
        <Select 
          v-model:value="timeRange"
          :options="timeRangeOptions"
          style="width: 120px"
          @change="handleTimeRangeChange"
        />
        <Button 
          :loading="loading"
          @click="refreshData"
        >
          <template #icon>
            <ReloadOutlined />
          </template>
          刷新
        </Button>
        <Button 
          type="primary"
          @click="exportData"
        >
          <template #icon>
            <DownloadOutlined />
          </template>
          导出
        </Button>
      </Space>
    </div>

    <!-- 总体统计卡片 -->
    <Row :gutter="16" class="mb-6">
      <Col :span="6">
        <Card>
          <Statistic
            title="总登录次数"
            :value="overallStats.totalLogins"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <LoginOutlined />
            </template>
            <template #suffix>
              <Tooltip title="较上周增长12.5%">
                <Tag color="green" size="small">+12.5%</Tag>
              </Tooltip>
            </template>
          </Statistic>
        </Card>
      </Col>
      <Col :span="6">
        <Card>
          <Statistic
            title="活跃用户数"
            :value="overallStats.totalUsers"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <UserOutlined />
            </template>
            <template #suffix>
              <Tooltip title="较上月增长8.3%">
                <Tag color="blue" size="small">+8.3%</Tag>
              </Tooltip>
            </template>
          </Statistic>
        </Card>
      </Col>
      <Col :span="6">
        <Card>
          <Statistic
            title="平均响应时间"
            :value="overallStats.avgResponseTime"
            suffix="ms"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <ClockCircleOutlined />
            </template>
            <template #suffix>
              <span class="text-xs text-gray-500 ml-1">ms</span>
              <Tooltip title="较上周优化5ms">
                <Tag color="purple" size="small">-5ms</Tag>
              </Tooltip>
            </template>
          </Statistic>
        </Card>
      </Col>
      <Col :span="6">
        <Card>
          <Statistic
            title="成功率"
            :value="overallStats.successRate"
            suffix="%"
            :precision="1"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <CheckCircleOutlined />
            </template>
            <template #suffix>
              <span class="text-xs text-gray-500 ml-1">%</span>
              <Tooltip title="较上周提升0.3%">
                <Tag color="green" size="small">+0.3%</Tag>
              </Tooltip>
            </template>
          </Statistic>
        </Card>
      </Col>
    </Row>

    <!-- 图表区域 -->
    <Row :gutter="16" class="mb-6">
      <!-- 登录趋势图 -->
      <Col :span="16">
        <Card title="登录趋势分析" :loading="loading">
          <LoginChart 
            :chart-data="loginTrendData"
            :height="350"
            chart-type="line"
            title=""
            @time-range-change="handleTimeRangeChange"
          />
        </Card>
      </Col>
      <!-- 提供商使用分布 -->
      <Col :span="8">
        <Card title="提供商使用分布" :loading="loading">
          <ProviderUsage 
            :usage-data="providerStatsData"
            @refresh="refreshData"
          />
        </Card>
      </Col>
    </Row>

    <!-- 小时分布图 -->
    <Row :gutter="16" class="mb-6">
      <Col :span="24">
        <Card title="登录时间分布" :loading="loading">
          <div class="hourly-chart">
            <div class="chart-grid">
              <div 
                v-for="hour in hourlyDistributionData" 
                :key="hour.hour"
                class="hour-bar"
                :style="{ 
                  height: `${(hour.count / Math.max(...hourlyDistributionData.map(h => h.count))) * 100}%`,
                  backgroundColor: getHourColor(hour.hour, hour.count)
                }"
              >
                <Tooltip :title="`${hour.hour}:00 - ${hour.count}次登录`">
                  <div class="bar-content"></div>
                </Tooltip>
              </div>
            </div>
            <div class="hour-labels">
              <span v-for="i in 24" :key="i" class="hour-label">
                {{ i - 1 }}
              </span>
            </div>
          </div>
        </Card>
      </Col>
    </Row>

    <!-- 实时监控和提供商排行榜 -->
    <Row :gutter="16">
      <Col :span="8">
        <RealTimeMonitor @stats-update="handleRealtimeStatsUpdate" />
      </Col>
      <Col :span="16">
        <Card title="提供商使用排行榜" :loading="loading">
          <Table
            :columns="providerColumns"
            :data-source="topProviders"
            :pagination="false"
            size="middle"
            :scroll="{ x: 800 }"
          />
        </Card>
      </Col>
    </Row>
  </Page>
</template>

<style scoped>
.hourly-chart {
  padding: 20px 0;
}

.chart-grid {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 150px;
  margin-bottom: 8px;
  padding: 0 4px;
}

.hour-bar {
  flex: 1;
  margin: 0 1px;
  border-radius: 2px 2px 0 0;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 4px;
}

.hour-bar:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}

.bar-content {
  width: 100%;
  height: 100%;
}

.hour-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
}

.hour-label {
  flex: 1;
  text-align: center;
  font-size: 10px;
  color: #8c8c8c;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hour-label:nth-child(odd) {
    display: none;
  }
}
</style>