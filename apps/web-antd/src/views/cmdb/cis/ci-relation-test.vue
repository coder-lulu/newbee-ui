<template>
  <div class="ci-relation-test p-6">
    <h2 class="text-2xl font-bold mb-4">CI关系图测试页面</h2>
    
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">功能测试</h3>
      
      <!-- 基础功能测试 -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">选择CI实例:</label>
          <a-select
            v-model:value="selectedCiId"
            :options="mockCiOptions"
            placeholder="选择一个CI实例"
            style="width: 300px"
            @change="handleCiChange"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">关系深度:</label>
          <a-select
            v-model:value="depth"
            :options="depthOptions"
            style="width: 150px"
          />
        </div>
        
        <div>
          <a-button type="primary" @click="testLoadRelations" :loading="loading">
            测试加载关系
          </a-button>
          <a-button @click="testValidation" class="ml-2">
            测试关系验证
          </a-button>
        </div>
      </div>
      
      <!-- 测试结果显示 -->
      <div v-if="testResult" class="mt-6">
        <h4 class="text-md font-semibold mb-2">测试结果:</h4>
        <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{ testResult }}</pre>
      </div>
      
      <!-- 图形展示区域 -->
      <div class="mt-6">
        <h4 class="text-md font-semibold mb-2">关系图预览:</h4>
        <div ref="chartContainer" class="w-full h-96 border border-gray-200 rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import * as echarts from 'echarts';

// 模拟数据
const selectedCiId = ref<number>(1);
const depth = ref(2);
const loading = ref(false);
const testResult = ref('');
const chartContainer = ref<HTMLElement>();

const mockCiOptions = [
  { label: 'Web服务器-001 (1)', value: 1 },
  { label: '数据库服务器-002 (2)', value: 2 },
  { label: '负载均衡器-003 (3)', value: 3 },
  { label: '应用服务器-004 (4)', value: 4 },
];

const depthOptions = [
  { label: '1层', value: 1 },
  { label: '2层', value: 2 },
  { label: '3层', value: 3 },
];

// 处理CI选择变化
const handleCiChange = (ciId: number) => {
  selectedCiId.value = ciId;
  testResult.value = `已选择CI: ${ciId}`;
};

// 测试加载关系
const testLoadRelations = async () => {
  loading.value = true;
  testResult.value = '正在加载关系数据...';
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockRelationData = {
      centerCi: {
        id: selectedCiId.value,
        name: `CI-${selectedCiId.value}`,
        typeName: '服务器'
      },
      sourceRelations: [
        {
          id: 1,
          targetCiId: selectedCiId.value + 1,
          targetCiName: `CI-${selectedCiId.value + 1}`,
          relationTypeName: '依赖',
          status: 'active'
        },
        {
          id: 2,
          targetCiId: selectedCiId.value + 2,
          targetCiName: `CI-${selectedCiId.value + 2}`,
          relationTypeName: '连接',
          status: 'active'
        }
      ],
      targetRelations: [
        {
          id: 3,
          sourceCiId: selectedCiId.value - 1,
          sourceCiName: `CI-${selectedCiId.value - 1}`,
          relationTypeName: '监控',
          status: 'active'
        }
      ],
      totalCount: 3
    };
    
    testResult.value = JSON.stringify(mockRelationData, null, 2);
    drawMockGraph(mockRelationData);
    message.success('关系数据加载成功');
    
  } catch (error) {
    testResult.value = `加载失败: ${error}`;
    message.error('关系数据加载失败');
  } finally {
    loading.value = false;
  }
};

// 测试关系验证
const testValidation = async () => {
  testResult.value = '正在验证关系...';
  
  try {
    // 模拟验证API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockValidationResult = {
      isValid: true,
      errors: [],
      warnings: ['属性映射数组长度不同'],
      constraintId: 123
    };
    
    testResult.value = JSON.stringify(mockValidationResult, null, 2);
    message.success('关系验证成功');
    
  } catch (error) {
    testResult.value = `验证失败: ${error}`;
    message.error('关系验证失败');
  }
};

// 绘制模拟图形
const drawMockGraph = (relationData: any) => {
  if (!chartContainer.value) return;
  
  const chartInstance = echarts.init(chartContainer.value);
  
  const nodes = [
    {
      id: selectedCiId.value.toString(),
      name: relationData.centerCi.name,
      category: 0,
      symbolSize: 80,
      itemStyle: { color: '#4f46e5' }
    }
  ];
  
  const links: any[] = [];
  
  // 添加出向关系节点和边
  relationData.sourceRelations.forEach((rel: any) => {
    nodes.push({
      id: rel.targetCiId.toString(),
      name: rel.targetCiName,
      category: 1,
      symbolSize: 60,
      itemStyle: { color: '#10b981' }
    });
    
    links.push({
      source: selectedCiId.value.toString(),
      target: rel.targetCiId.toString(),
      value: rel.relationTypeName,
      lineStyle: { color: '#ef4444', width: 2 }
    });
  });
  
  // 添加入向关系节点和边
  relationData.targetRelations.forEach((rel: any) => {
    if (!nodes.find(n => n.id === rel.sourceCiId.toString())) {
      nodes.push({
        id: rel.sourceCiId.toString(),
        name: rel.sourceCiName,
        category: 1,
        symbolSize: 60,
        itemStyle: { color: '#10b981' }
      });
    }
    
    links.push({
      source: rel.sourceCiId.toString(),
      target: selectedCiId.value.toString(),
      value: rel.relationTypeName,
      lineStyle: { color: '#3b82f6', width: 2 }
    });
  });
  
  const option = {
    title: {
      text: 'CI关系图测试',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          return `${params.name}<br/>类型: ${params.data.category === 0 ? '当前CI' : '关联CI'}`;
        } else {
          return `关系: ${params.value}<br/>从: ${params.data.source}<br/>到: ${params.data.target}`;
        }
      }
    },
    legend: {
      data: ['当前CI', '关联CI'],
      orient: 'vertical',
      right: 20,
      top: 50
    },
    series: [
      {
        name: 'CI关系图',
        type: 'graph',
        layout: 'force',
        data: nodes,
        links: links,
        categories: [
          { name: '当前CI' },
          { name: '关联CI' }
        ],
        roam: true,
        label: {
          show: true,
          position: 'right'
        },
        force: {
          repulsion: 800,
          gravity: 0.1,
          edgeLength: 200
        },
        emphasis: {
          focus: 'adjacency'
        }
      }
    ]
  };
  
  chartInstance.setOption(option);
  
  // 监听点击事件
  chartInstance.on('click', (params: any) => {
    if (params.dataType === 'node') {
      message.info(`点击了节点: ${params.name}`);
    } else if (params.dataType === 'edge') {
      message.info(`点击了关系: ${params.value}`);
    }
  });
};

// 初始化
onMounted(async () => {
  await nextTick();
  testResult.value = '页面已加载，选择CI实例并点击测试按钮';
});
</script>

<style scoped>
.ci-relation-test {
  background-color: #f5f5f5;
  min-height: 100vh;
}
</style>