<template>
  <div class="provider-usage">
    <div class="usage-header mb-4">
      <h3 class="text-lg font-medium">OAuth提供商使用情况</h3>
      <Button 
        size="small" 
        @click="refreshData"
        :loading="loading"
      >
        刷新
      </Button>
    </div>
    
    <div class="usage-content">
      <!-- 使用统计图表 -->
      <div class="usage-chart mb-4">
        <div ref="chartContainer" style="height: 280px;"></div>
      </div>
      
      <!-- 提供商详情列表 -->
      <div class="provider-details">
        <List
          :data-source="usageData"
          size="small"
        >
          <template #renderItem="{ item }">
            <ListItem>
              <div class="provider-item w-full">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <Avatar 
                      :src="item.iconUrl" 
                      :size="24"
                    >
                      {{ item.displayName?.charAt(0) }}
                    </Avatar>
                    <div>
                      <div class="font-medium text-sm">{{ item.displayName }}</div>
                      <div class="text-xs text-gray-500">{{ item.type }}</div>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-4">
                    <div class="text-center">
                      <div class="text-sm font-medium text-green-600">{{ item.successCount }}</div>
                      <div class="text-xs text-gray-500">成功</div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm font-medium text-red-500">{{ item.failureCount }}</div>
                      <div class="text-xs text-gray-500">失败</div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm font-medium">{{ getSuccessRate(item) }}%</div>
                      <div class="text-xs text-gray-500">成功率</div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm font-medium">{{ item.avgResponseTime || 0 }}ms</div>
                      <div class="text-xs text-gray-500">响应时间</div>
                    </div>
                  </div>
                </div>
                
                <!-- 进度条显示使用率 -->
                <div class="mt-2">
                  <Progress 
                    :percent="getUsagePercent(item)"
                    :show-info="false"
                    :stroke-width="4"
                    :stroke-color="getProgressColor(item)"
                  />
                </div>
              </div>
            </ListItem>
          </template>
        </List>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { Avatar, Button, List, ListItem, Progress } from 'ant-design-vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册ECharts组件
echarts.use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
]);

interface Props {
  usageData?: any[];
}

interface Emits {
  (e: 'refresh'): void;
}

const props = withDefaults(defineProps<Props>(), {
  usageData: () => [],
});

const emit = defineEmits<Emits>();

const chartContainer = ref<HTMLDivElement>();
const loading = ref(false);
let chartInstance: echarts.ECharts | null = null;

// 计算总使用次数
const totalUsage = computed(() => {
  return props.usageData.reduce((sum, item) => sum + item.successCount + item.failureCount, 0);
});

// 获取成功率
function getSuccessRate(item: any): number {
  const total = item.successCount + item.failureCount;
  if (total === 0) return 0;
  return Math.round((item.successCount / total) * 100);
}

// 获取使用百分比
function getUsagePercent(item: any): number {
  const usage = item.successCount + item.failureCount;
  if (totalUsage.value === 0) return 0;
  return Math.round((usage / totalUsage.value) * 100);
}

// 获取进度条颜色
function getProgressColor(item: any): string {
  const successRate = getSuccessRate(item);
  if (successRate >= 90) return '#52c41a'; // green
  if (successRate >= 70) return '#faad14'; // yellow
  return '#ff4d4f'; // red
}

// 获取提供商类型颜色
function getProviderColor(type: string): string {
  const colorMap: Record<string, string> = {
    google: '#4285f4',
    github: '#333',
    facebook: '#1877f2',
    wechat: '#07c160',
    qq: '#12b7f5',
    feishu: '#00d6b9',
    dingtalk: '#ff7a00',
    custom: '#722ed1',
  };
  return colorMap[type] || '#1890ff';
}

// 刷新数据
function refreshData() {
  loading.value = true;
  emit('refresh');
  setTimeout(() => {
    loading.value = false;
  }, 1000);
}

// 初始化图表
function initChart() {
  if (!chartContainer.value) return;
  
  chartInstance = echarts.init(chartContainer.value);
  updateChart();
}

// 更新图表
function updateChart() {
  if (!chartInstance) return;
  
  const pieData = props.usageData.map(item => ({
    name: item.displayName,
    value: item.successCount + item.failureCount,
    itemStyle: {
      color: getProviderColor(item.type),
    },
  }));
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        const percent = ((params.value / totalUsage.value) * 100).toFixed(1);
        return `
          <div style="margin-bottom: 4px; font-weight: bold;">${params.name}</div>
          <div>使用次数: ${params.value}</div>
          <div>占比: ${percent}%</div>
        `;
      },
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 0,
      data: pieData.map(item => item.name),
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '12',
            fontWeight: 'bold',
          },
        },
        data: pieData,
      },
    ],
  };
  
  chartInstance.setOption(option);
}

// 处理窗口大小变化
function handleResize() {
  if (chartInstance) {
    chartInstance.resize();
  }
}

// 监听数据变化
function watchUsageData() {
  nextTick(() => {
    updateChart();
  });
}

onMounted(() => {
  nextTick(() => {
    initChart();
    window.addEventListener('resize', handleResize);
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

// 监听props变化
import { watch } from 'vue';
watch(() => props.usageData, watchUsageData, { deep: true });
</script>

<style scoped>
.provider-usage {
  background: #fff;
  border-radius: 8px;
}

.usage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.usage-header h3 {
  margin: 0;
  color: #262626;
}

.provider-item {
  padding: 8px 0;
}

.provider-item:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}
</style>