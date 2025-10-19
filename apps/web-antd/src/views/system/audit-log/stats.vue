<script setup lang="ts">
// 审计日志统计页面 - 带有完整模拟数据展示
// 该页面展示多维度的审计日志统计信息，包括操作类型、资源类型、用户活跃度等
// 当前使用模拟数据进行展示，便于查看完整的UI效果
// TODO: 后续需要替换为真实的API调用

import { ref, reactive, onMounted } from 'vue';
import type { EchartsUIType } from '@vben/plugins/echarts';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { Page } from '@vben/common-ui';
import { message } from 'ant-design-vue';

import {
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Space,
  Statistic,
} from 'ant-design-vue';

import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TrophyOutlined,
} from '@ant-design/icons-vue';

import { getAuditLogStats } from '#/api/system/audit-log';
import type { AuditLogStatsQuery, AuditLogStatsItem } from '#/api/system/audit-log/model';

const { RangePicker } = DatePicker;

// 查询参数
const queryParams = reactive<AuditLogStatsQuery>({
  groupBy: 'operation_type',
});

// 数据状态
const loading = ref(false);
const statsData = ref<AuditLogStatsItem[]>([]);

// 概览数据
const overviewData = reactive({
  totalOperations: 0,
  successRate: 0,
  activeUsers: 0,
  errorCount: 0,
});

// 图表容器引用
const operationChartRef = ref<EchartsUIType>();
const statusChartRef = ref<EchartsUIType>();
const trendChartRef = ref<EchartsUIType>();
const userChartRef = ref<EchartsUIType>();

// 初始化图表
const { renderEcharts: setOperationOptions } = useEcharts(operationChartRef);
const { renderEcharts: setStatusOptions } = useEcharts(statusChartRef);
const { renderEcharts: setTrendOptions } = useEcharts(trendChartRef);
const { renderEcharts: setUserOptions } = useEcharts(userChartRef);

// 分组选项
const groupByOptions = [
  { label: '操作类型', value: 'operation_type' },
  { label: '资源类型', value: 'resource_type' },
  { label: '用户', value: 'user_id' },
  { label: '响应状态', value: 'response_status' },
  { label: 'IP地址', value: 'ip_address' },
];

// 时间范围预设
const timeRangeOptions = [
  { label: '最近1小时', value: 1 },
  { label: '最近24小时', value: 24 },
  { label: '最近7天', value: 24 * 7 },
  { label: '最近30天', value: 24 * 30 },
];

// 获取统计数据
const fetchStats = async () => {
  loading.value = true;
  try {
    // 使用模拟数据替代真实API调用进行展示
    const mockData = generateMockStatsData();
    
    // 根据当前分组方式处理数据
    statsData.value = getMockStatsByGroupBy(queryParams.groupBy || 'operation_type');
    
    // 设置概览数据
    overviewData.totalOperations = mockData.overview.totalOperations;
    overviewData.activeUsers = mockData.overview.activeUsers;
    overviewData.errorCount = mockData.overview.errorCount;
    overviewData.successRate = mockData.overview.successRate;
    
    updateCharts();
    
    // TODO: 后续替换为真实API调用
    // const result = await getAuditLogStats(queryParams);
    // 处理真实API响应...
    
  } catch (error: any) {
    console.error('获取统计数据失败:', error);
    message.error('获取统计数据失败: ' + (error?.response?.data?.msg || error?.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 生成模拟统计数据
const generateMockStatsData = () => {
  const now = Date.now();
  const timeRange = queryParams.endTime && queryParams.startTime 
    ? (queryParams.endTime - queryParams.startTime) / (1000 * 60 * 60 * 24)  // 天数
    : 7; // 默认7天

  // 基础数据量（根据时间范围调整）
  const baseOperations = Math.floor(timeRange * 150 + Math.random() * 500);
  
  return {
    overview: {
      totalOperations: baseOperations,
      activeUsers: Math.floor(baseOperations * 0.15 + Math.random() * 20), // 活跃用户数
      errorCount: Math.floor(baseOperations * 0.08 + Math.random() * 10), // 8%左右的错误率
      successRate: 92.5 + Math.random() * 5, // 92-97%的成功率
    },
    // 按操作类型统计
    operationStats: [
      { label: '查看(READ)', count: Math.floor(baseOperations * 0.45), percentage: 45 },
      { label: '创建(create)', count: Math.floor(baseOperations * 0.25), percentage: 25 },
      { label: '更新(update)', count: Math.floor(baseOperations * 0.20), percentage: 20 },
      { label: '删除(delete)', count: Math.floor(baseOperations * 0.10), percentage: 10 },
    ],
    // 按资源类型统计
    resourceStats: [
      { label: '用户管理', count: Math.floor(baseOperations * 0.30), percentage: 30 },
      { label: '角色权限', count: Math.floor(baseOperations * 0.20), percentage: 20 },
      { label: '部门组织', count: Math.floor(baseOperations * 0.18), percentage: 18 },
      { label: '系统配置', count: Math.floor(baseOperations * 0.15), percentage: 15 },
      { label: '数据字典', count: Math.floor(baseOperations * 0.10), percentage: 10 },
      { label: '其他', count: Math.floor(baseOperations * 0.07), percentage: 7 },
    ],
    // 按用户统计（Top 10）
    userStats: [
      { label: 'admin', count: Math.floor(baseOperations * 0.20), percentage: 20 },
      { label: 'zhangsan', count: Math.floor(baseOperations * 0.15), percentage: 15 },
      { label: 'lisi', count: Math.floor(baseOperations * 0.12), percentage: 12 },
      { label: 'wangwu', count: Math.floor(baseOperations * 0.10), percentage: 10 },
      { label: 'zhaoliu', count: Math.floor(baseOperations * 0.08), percentage: 8 },
      { label: 'sunqi', count: Math.floor(baseOperations * 0.07), percentage: 7 },
      { label: 'chenba', count: Math.floor(baseOperations * 0.06), percentage: 6 },
      { label: 'yangjiu', count: Math.floor(baseOperations * 0.05), percentage: 5 },
      { label: 'liushi', count: Math.floor(baseOperations * 0.04), percentage: 4 },
      { label: 'wangyi', count: Math.floor(baseOperations * 0.03), percentage: 3 },
    ],
    // 按响应状态统计
    responseStats: [
      { label: '200 成功', count: Math.floor(baseOperations * 0.85), percentage: 85 },
      { label: '201 创建', count: Math.floor(baseOperations * 0.05), percentage: 5 },
      { label: '400 请求错误', count: Math.floor(baseOperations * 0.04), percentage: 4 },
      { label: '401 未授权', count: Math.floor(baseOperations * 0.03), percentage: 3 },
      { label: '403 禁止访问', count: Math.floor(baseOperations * 0.02), percentage: 2 },
      { label: '500 服务器错误', count: Math.floor(baseOperations * 0.01), percentage: 1 },
    ],
    // 按IP地址统计（Top 10）
    ipStats: [
      { label: '192.168.1.100', count: Math.floor(baseOperations * 0.25), percentage: 25 },
      { label: '192.168.1.101', count: Math.floor(baseOperations * 0.20), percentage: 20 },
      { label: '192.168.1.102', count: Math.floor(baseOperations * 0.15), percentage: 15 },
      { label: '10.0.0.15', count: Math.floor(baseOperations * 0.12), percentage: 12 },
      { label: '172.16.0.25', count: Math.floor(baseOperations * 0.10), percentage: 10 },
      { label: '192.168.1.103', count: Math.floor(baseOperations * 0.08), percentage: 8 },
      { label: '10.0.0.20', count: Math.floor(baseOperations * 0.05), percentage: 5 },
      { label: '172.16.0.30', count: Math.floor(baseOperations * 0.03), percentage: 3 },
      { label: '192.168.1.104', count: Math.floor(baseOperations * 0.02), percentage: 2 },
    ],
  };
};

// 根据分组方式获取对应的模拟数据
const getMockStatsByGroupBy = (groupBy: string) => {
  const mockData = generateMockStatsData();
  
  switch (groupBy) {
    case 'operation_type':
      return mockData.operationStats;
    case 'resource_type':
      return mockData.resourceStats;
    case 'user_id':
      return mockData.userStats;
    case 'response_status':
      return mockData.responseStats;
    case 'ip_address':
      return mockData.ipStats;
    default:
      return mockData.operationStats;
  }
};

// 更新图表
const updateCharts = () => {
  updateOperationChart();
  updateStatusChart();
  updateTrendChart();
  updateUserChart();
};

// 操作类型分布图
const updateOperationChart = () => {
  const chartData = statsData.value.map(item => ({
    name: item.label,
    value: item.count,
  }));

  // 根据分组类型设置不同的图表标题
  let chartTitle = '操作类型分布';
  switch (queryParams.groupBy) {
    case 'resource_type':
      chartTitle = '资源类型分布';
      break;
    case 'user_id':
      chartTitle = '用户活跃度分布';
      break;
    case 'response_status':
      chartTitle = '响应状态分布';
      break;
    case 'ip_address':
      chartTitle = 'IP地址分布';
      break;
    default:
      chartTitle = '操作类型分布';
  }

  setOperationOptions({
    title: {
      text: chartTitle,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        return `${params.name}<br/>数量: ${params.value}<br/>占比: ${params.percent}%`;
      },
    },
    legend: {
      orient: 'vertical',
      left: 10,
      top: 40,
      itemWidth: 12,
      itemHeight: 12,
      formatter: function(name: string) {
        // 如果名称太长，进行截断
        return name.length > 12 ? name.substring(0, 12) + '...' : name;
      },
    },
    series: [
      {
        name: chartTitle,
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '55%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold',
            formatter: function(params: any) {
              return `${params.name}\n${params.percent}%`;
            },
          },
        },
        labelLine: {
          show: false,
        },
        data: chartData,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 1,
        },
      },
    ],
    color: getChartColors(chartData.length),
  });
};

// 动态获取图表颜色
const getChartColors = (count: number) => {
  const baseColors = ['#52c41a', '#1890ff', '#fa8c16', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#faad14', '#a0d911', '#2f54eb'];
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // 如果数据项多于预设颜色，生成更多颜色
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 360 / count) % 360;
    colors.push(`hsl(${hue}, 65%, 55%)`);
  }
  return colors;
};

// 响应状态分布图
const updateStatusChart = () => {
  // 使用模拟数据中的响应状态统计
  const mockData = generateMockStatsData();
  const statusData = mockData.responseStats.map(item => ({
    name: item.label,
    value: item.count,
  }));

  setStatusOptions({
    title: {
      text: '响应状态分布',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        return `${params.name}<br/>数量: ${params.value}<br/>占比: ${params.percent}%`;
      },
    },
    legend: {
      bottom: 10,
      itemWidth: 12,
      itemHeight: 12,
    },
    series: [
      {
        name: '响应状态',
        type: 'pie',
        radius: ['30%', '60%'],
        center: ['50%', '45%'],
        data: statusData,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 1,
        },
        label: {
          formatter: '{b}\n{d}%',
          fontSize: 12,
        },
        labelLine: {
          length: 15,
          length2: 10,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
    color: ['#52c41a', '#1890ff', '#faad14', '#fa8c16', '#ff4d4f', '#722ed1'],
  });
};

// 操作趋势图
const updateTrendChart = () => {
  // 生成更真实的24小时趋势数据
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const trendData = hours.map(hour => {
    // 模拟业务高峰期（9-12点，14-18点）的数据分布
    let baseValue = 20;
    if ((hour >= 9 && hour <= 12) || (hour >= 14 && hour <= 18)) {
      baseValue = 80 + Math.random() * 40; // 高峰期
    } else if (hour >= 19 && hour <= 22) {
      baseValue = 50 + Math.random() * 30; // 次高峰
    } else if (hour >= 0 && hour <= 7) {
      baseValue = 5 + Math.random() * 15; // 凌晨低谷
    } else {
      baseValue = 30 + Math.random() * 25; // 其他时间
    }
    return Math.floor(baseValue);
  });

  setTrendOptions({
    title: {
      text: '操作趋势图',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        const dataPoint = params[0];
        return `${dataPoint.axisValue}<br/>操作次数: ${dataPoint.value}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: hours.map(h => `${h.toString().padStart(2, '0')}:00`),
      axisLabel: {
        interval: 2, // 每3个小时显示一个标签
      },
    },
    yAxis: {
      type: 'value',
      name: '操作次数',
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: '操作次数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        areaStyle: {
          opacity: 0.3,
        },
        data: trendData,
        itemStyle: {
          color: '#1890ff',
        },
        lineStyle: {
          width: 2,
        },
      },
    ],
  });
};

// 用户活跃度图
const updateUserChart = () => {
  // 使用模拟数据中的用户统计
  const mockData = generateMockStatsData();
  const userData = mockData.userStats.map(item => ({
    name: item.label,
    value: item.count,
  }));

  setUserOptions({
    title: {
      text: 'Top 用户活跃度',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function(params: any) {
        const dataPoint = params[0];
        return `${dataPoint.axisValue}<br/>操作次数: ${dataPoint.value}`;
      },
    },
    grid: {
      left: '15%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      name: '操作次数',
      axisLabel: {
        formatter: '{value}',
      },
    },
    yAxis: {
      type: 'category',
      data: userData.map(item => item.name),
      axisLabel: {
        interval: 0,
      },
    },
    series: [
      {
        name: '操作次数',
        type: 'bar',
        data: userData.map((item, index) => ({
          value: item.value,
          itemStyle: {
            color: getUserColor(index),
          },
        })),
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
        },
        barWidth: '60%',
        label: {
          show: true,
          position: 'right',
          formatter: '{c}',
          color: '#666',
          fontSize: 12,
        },
      },
    ],
  });
};

// 获取用户柱状图颜色
const getUserColor = (index: number) => {
  const colors = [
    '#1890ff', '#52c41a', '#fa8c16', '#ff4d4f', '#722ed1',
    '#13c2c2', '#eb2f96', '#faad14', '#a0d911', '#2f54eb'
  ];
  return colors[index % colors.length];
};

// 设置时间范围
const setTimeRange = (hours: number) => {
  const endTime = Date.now();
  const startTime = endTime - hours * 60 * 60 * 1000;
  queryParams.startTime = startTime;
  queryParams.endTime = endTime;
  fetchStats();
};

// 处理时间范围变化
const handleTimeRangeChange = (dates: any) => {
  if (dates && dates.length === 2) {
    queryParams.startTime = dates[0].valueOf();
    queryParams.endTime = dates[1].valueOf();
  } else {
    queryParams.startTime = undefined;
    queryParams.endTime = undefined;
  }
};

// 查询统计
const handleQuery = () => {
  fetchStats();
};

// 导出统计
const handleExport = () => {
  const data = {
    overview: overviewData,
    stats: statsData.value,
    params: queryParams,
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `audit-stats-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  message.success('导出成功');
};

onMounted(() => {
  // 默认查询最近7天数据
  setTimeRange(24 * 7);
});
</script>

<template>
  <Page
    auto-content-height
    description="审计日志统计分析，多维度展示系统操作数据"
    title="审计统计"
  >
    <!-- 查询条件 -->
    <Card class="mb-4">
      <Row :gutter="[16, 16]" align="middle">
        <Col :xs="24" :sm="12" :md="6">
          <div class="query-item">
            <span class="query-label">时间范围:</span>
            <Space wrap>
              <Button
                v-for="option in timeRangeOptions"
                :key="option.value"
                size="small"
                @click="setTimeRange(option.value)"
              >
                {{ option.label }}
              </Button>
            </Space>
          </div>
        </Col>
        <Col :xs="24" :sm="12" :md="6">
          <div class="query-item">
            <span class="query-label">自定义时间:</span>
            <RangePicker
              size="small"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              @change="handleTimeRangeChange"
            />
          </div>
        </Col>
        <Col :xs="24" :sm="12" :md="6">
          <div class="query-item">
            <span class="query-label">分组方式:</span>
            <Select
              v-model="queryParams.groupBy"
              size="small"
              style="width: 100%"
              :options="groupByOptions"
            />
          </div>
        </Col>
        <Col :xs="24" :sm="12" :md="6">
          <div class="query-item">
            <Space>
              <Button type="primary" size="small" :loading="loading" @click="handleQuery">
                查询
              </Button>
              <Button size="small" @click="handleExport">
                导出
              </Button>
            </Space>
          </div>
        </Col>
      </Row>
    </Card>

    <!-- 数据概览 -->
    <Row :gutter="[16, 16]" class="mb-4">
      <Col :xs="12" :sm="6" :md="6" :lg="6">
        <Card>
          <Statistic
            title="总操作数"
            :value="overviewData.totalOperations"
            :precision="0"
          >
            <template #prefix>
              <BarChartOutlined style="color: #1890ff" />
            </template>
          </Statistic>
        </Card>
      </Col>
      <Col :xs="12" :sm="6" :md="6" :lg="6">
        <Card>
          <Statistic
            title="成功率"
            :value="overviewData.successRate"
            suffix="%"
            :precision="1"
          >
            <template #prefix>
              <TrophyOutlined style="color: #52c41a" />
            </template>
          </Statistic>
        </Card>
      </Col>
      <Col :xs="12" :sm="6" :md="6" :lg="6">
        <Card>
          <Statistic
            title="活跃用户"
            :value="overviewData.activeUsers"
            :precision="0"
          >
            <template #prefix>
              <LineChartOutlined style="color: #fa8c16" />
            </template>
          </Statistic>
        </Card>
      </Col>
      <Col :xs="12" :sm="6" :md="6" :lg="6">
        <Card>
          <Statistic
            title="错误次数"
            :value="overviewData.errorCount"
            :precision="0"
          >
            <template #prefix>
              <PieChartOutlined style="color: #ff4d4f" />
            </template>
          </Statistic>
        </Card>
      </Col>
    </Row>

    <!-- 图表展示 -->
    <Row :gutter="[16, 16]" class="mb-4">
      <Col :xs="24" :sm="24" :md="12" :lg="12">
        <Card title="操作类型分布" class="mb-4">
          <EchartsUI ref="operationChartRef" style="height: 300px" />
        </Card>
      </Col>
      <Col :xs="24" :sm="24" :md="12" :lg="12">
        <Card title="操作趋势图" class="mb-4">
          <EchartsUI ref="trendChartRef" style="height: 300px" />
        </Card>
      </Col>
    </Row>
    
    <Row :gutter="[16, 16]">
      <Col :xs="24" :sm="24" :md="12" :lg="12">
        <Card title="响应状态分布" class="mb-4">
          <EchartsUI ref="statusChartRef" style="height: 300px" />
        </Card>
      </Col>
      <Col :xs="24" :sm="24" :md="12" :lg="12">
        <Card title="Top用户活跃度" class="mb-4">
          <EchartsUI ref="userChartRef" style="height: 300px" />
        </Card>
      </Col>
    </Row>
  </Page>
</template>

<style scoped>
.query-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.query-label {
  min-width: 80px;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

:deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 600;
}

:deep(.ant-statistic-title) {
  font-size: 14px;
  color: #666;
}

:deep(.ant-statistic-content) {
  font-size: 24px;
  font-weight: 600;
}

/* 响应式布局优化 */
@media (max-width: 768px) {
  .query-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .query-label {
    min-width: auto;
    margin-bottom: 4px;
  }
  
  :deep(.ant-statistic-content) {
    font-size: 20px;
  }
}
</style>