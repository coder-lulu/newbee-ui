<template>
  <div class="login-chart">
    <div class="chart-header mb-4">
      <h3 class="text-lg font-medium">{{ title }}</h3>
      <div class="chart-controls">
        <a-radio-group 
          v-model:value="timeRange" 
          size="small"
          @change="handleTimeRangeChange"
        >
          <a-radio-button value="7d">最近7天</a-radio-button>
          <a-radio-button value="30d">最近30天</a-radio-button>
          <a-radio-button value="90d">最近90天</a-radio-button>
        </a-radio-group>
      </div>
    </div>
    
    <div ref="chartContainer" class="chart-container" :style="{ height: height + 'px' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts/core';
import {
  LineChart,
  BarChart
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册ECharts组件
echarts.use([
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer
]);

interface Props {
  title?: string;
  height?: number;
  chartData?: any[];
  chartType?: 'line' | 'bar';
}

interface Emits {
  (e: 'timeRangeChange', range: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: '登录统计',
  height: 300,
  chartData: () => [],
  chartType: 'line',
});

const emit = defineEmits<Emits>();

const chartContainer = ref<HTMLDivElement>();
const timeRange = ref('7d');
let chartInstance: echarts.ECharts | null = null;

// 处理时间范围变化
function handleTimeRangeChange() {
  emit('timeRangeChange', timeRange.value);
}

// 初始化图表
function initChart() {
  if (!chartContainer.value) return;
  
  chartInstance = echarts.init(chartContainer.value);
  updateChart();
}

// 更新图表数据
function updateChart() {
  if (!chartInstance) return;
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        let tooltip = `<div style="margin-bottom: 4px;">${params[0].name}</div>`;
        params.forEach((param: any) => {
          tooltip += `
            <div style="display: flex; align-items: center; margin-bottom: 2px;">
              <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>
              <span style="margin-right: 8px;">${param.seriesName}:</span>
              <span style="font-weight: bold;">${param.value}</span>
            </div>
          `;
        });
        return tooltip;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: props.chartType === 'bar',
      data: props.chartData.map(item => item.date),
      axisLabel: {
        formatter: function(value: string) {
          return new Date(value).toLocaleDateString('zh-CN', { 
            month: 'short', 
            day: 'numeric' 
          });
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: '登录次数',
        type: props.chartType,
        smooth: true,
        itemStyle: {
          color: '#1890ff',
        },
        areaStyle: props.chartType === 'line' ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
            ],
          },
        } : undefined,
        data: props.chartData.map(item => item.count),
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
watch(
  () => props.chartData,
  () => {
    nextTick(() => {
      updateChart();
    });
  },
  { deep: true }
);

// 监听图表类型变化
watch(
  () => props.chartType,
  () => {
    nextTick(() => {
      updateChart();
    });
  }
);

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
</script>

<style scoped>
.login-chart {
  background: #fff;
  border-radius: 8px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h3 {
  margin: 0;
  color: #262626;
}

.chart-container {
  width: 100%;
}
</style>