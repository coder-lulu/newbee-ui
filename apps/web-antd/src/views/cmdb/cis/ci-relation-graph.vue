<template>
  <div class="ci-relation-graph h-full flex flex-col">
    <!-- 工具栏 -->
    <div class="mb-4 bg-white p-4 rounded-lg shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a-select
            v-model:value="selectedCiId"
            :options="ciOptions"
            placeholder="选择CI实例"
            style="width: 200px"
            @change="handleCiChange"
            show-search
            :filter-option="filterOption"
          />
          <a-select
            v-model:value="relationDepth"
            :options="depthOptions"
            style="width: 120px"
            @change="loadCiRelations"
          />
          <a-select
            v-model:value="layoutType"
            :options="layoutOptions"
            style="width: 120px"
            @change="updateLayout"
          />
        </div>
        <div class="flex items-center gap-2">
          <a-button type="primary" @click="refreshGraph" :loading="loading">
            <template #icon>
              <ReloadOutlined />
            </template>
            刷新
          </a-button>
          <a-button @click="resetZoom">
            <template #icon>
              <ExpandOutlined />
            </template>
            重置缩放
          </a-button>
          <a-button @click="showLegend = !showLegend">
            <template #icon>
              <InfoCircleOutlined />
            </template>
            图例
          </a-button>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div v-if="showLegend" class="mb-4 bg-white p-4 rounded-lg shadow-sm">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-full bg-blue-500"></div>
          <span>当前CI</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-full bg-green-500"></div>
          <span>关联CI</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-1 bg-red-500"></div>
          <span>出向关系</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-1 bg-blue-500"></div>
          <span>入向关系</span>
        </div>
      </div>
    </div>

    <!-- 图形区域 -->
    <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
      <div ref="chartContainer" class="w-full h-full min-h-96"></div>
    </div>

    <!-- 关系详情抽屉 -->
    <a-drawer
      v-model:open="relationDetailVisible"
      title="关系详情"
      width="500"
      :destroy-on-close="true"
    >
      <div v-if="selectedRelation">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="关系ID">
            {{ selectedRelation.id }}
          </a-descriptions-item>
          <a-descriptions-item label="源CI">
            {{ selectedRelation.sourceCiName }} ({{ selectedRelation.sourceCiId }})
          </a-descriptions-item>
          <a-descriptions-item label="目标CI">
            {{ selectedRelation.targetCiName }} ({{ selectedRelation.targetCiId }})
          </a-descriptions-item>
          <a-descriptions-item label="关系类型">
            {{ selectedRelation.relationTypeName }}
          </a-descriptions-item>
          <a-descriptions-item label="关系强度">
            <a-tag :color="getRelationStrengthColor(selectedRelation.relationStrength)">
              {{ getRelationStrengthText(selectedRelation.relationStrength) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="selectedRelation.status === 'active' ? 'green' : 'red'">
              {{ selectedRelation.status === 'active' ? '激活' : '非激活' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="发现来源" v-if="selectedRelation.discoverySource">
            {{ selectedRelation.discoverySource }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ dayjs(selectedRelation.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
          </a-descriptions-item>
          <a-descriptions-item label="更新时间">
            {{ dayjs(selectedRelation.updatedAt).format('YYYY-MM-DD HH:mm:ss') }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 属性映射信息 -->
        <div v-if="selectedRelation.attributeMappings && selectedRelation.attributeMappings.length > 0" class="mt-4">
          <h4 class="mb-2">属性映射</h4>
          <a-table
            :dataSource="selectedRelation.attributeMappings"
            :columns="attributeMappingColumns"
            :pagination="false"
            size="small"
          />
        </div>
      </div>
    </a-drawer>

    <!-- CI详情抽屉 -->
    <a-drawer
      v-model:open="ciDetailVisible"
      title="CI详情"
      width="600"
      :destroy-on-close="true"
    >
      <div v-if="selectedCi">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="CI ID">{{ selectedCi.id }}</a-descriptions-item>
          <a-descriptions-item label="CI名称">{{ selectedCi.name }}</a-descriptions-item>
          <a-descriptions-item label="CI类型">{{ selectedCi.typeName }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="selectedCi.status === 'active' ? 'green' : 'red'">
              {{ selectedCi.status === 'active' ? '激活' : '非激活' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="描述" v-if="selectedCi.description">
            {{ selectedCi.description }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ dayjs(selectedCi.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, watch } from 'vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import {
  ReloadOutlined,
  ExpandOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons-vue';

// API导入
import { getCisList } from '#/api/cmdb/cis';
import { getCiRelationsByIdApi } from '#/api/cmdb/cis/relation';

// 类型定义
interface CiNode {
  id: string;
  name: string;
  category: number;
  value: number;
  x?: number;
  y?: number;
  itemStyle?: any;
  label?: any;
  symbolSize?: number;
}

interface RelationEdge {
  source: string;
  target: string;
  value: string;
  lineStyle?: any;
  label?: any;
  emphasis?: any;
}

interface RelationDetail {
  id: number;
  sourceCiId: number;
  sourceCiName: string;
  targetCiId: number;
  targetCiName: string;
  relationTypeName: string;
  relationStrength: string;
  status: string;
  discoverySource?: string;
  createdAt: string;
  updatedAt: string;
  attributeMappings?: any[];
}

interface CiDetail {
  id: number;
  name: string;
  typeName: string;
  status: string;
  description?: string;
  createdAt: string;
}

// 响应式数据
const chartContainer = ref<HTMLElement>();
const loading = ref(false);
const selectedCiId = ref<number>();
const relationDepth = ref(2);
const layoutType = ref('force');
const showLegend = ref(true);
const ciOptions = ref<Array<{ label: string; value: number }>>([]);

// 抽屉相关
const relationDetailVisible = ref(false);
const selectedRelation = ref<RelationDetail>();
const ciDetailVisible = ref(false);
const selectedCi = ref<CiDetail>();

// 图形数据
const chartInstance = ref<echarts.ECharts>();
const graphData = ref<{
  nodes: CiNode[];
  edges: RelationEdge[];
  categories: Array<{ name: string }>;
}>({
  nodes: [],
  edges: [],
  categories: [
    { name: '当前CI' },
    { name: '关联CI' }
  ]
});

// 配置选项
const depthOptions = [
  { label: '1层', value: 1 },
  { label: '2层', value: 2 },
  { label: '3层', value: 3 },
  { label: '4层', value: 4 },
];

const layoutOptions = [
  { label: '力导向布局', value: 'force' },
  { label: '圆形布局', value: 'circular' },
  { label: '网格布局', value: 'grid' },
];

// 属性映射表格列
const attributeMappingColumns = [
  { title: '源属性', dataIndex: 'sourceAttrName', key: 'sourceAttrName' },
  { title: '目标属性', dataIndex: 'targetAttrName', key: 'targetAttrName' },
  { title: '同步状态', dataIndex: 'syncStatus', key: 'syncStatus' },
  { title: '最后同步', dataIndex: 'lastSyncAt', key: 'lastSyncAt' },
];

// 方法
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

const getRelationStrengthColor = (strength: string) => {
  const colorMap: Record<string, string> = {
    'strong': 'red',
    'normal': 'blue',
    'weak': 'orange',
  };
  return colorMap[strength] || 'default';
};

const getRelationStrengthText = (strength: string) => {
  const textMap: Record<string, string> = {
    'strong': '强',
    'normal': '正常',
    'weak': '弱',
  };
  return textMap[strength] || strength;
};

// 加载CI列表
const loadCiList = async () => {
  try {
    const response = await getCisList({
      current: 1,
      size: 1000,
    });
    
    if (response.data?.list) {
      ciOptions.value = response.data.list.map((ci: any) => ({
        label: `${ci.name} (${ci.id})`,
        value: ci.id,
      }));
    }
  } catch (error) {
    console.error('加载CI列表失败:', error);
    message.error('加载CI列表失败');
  }
};

// 处理CI选择变化
const handleCiChange = (ciId: number) => {
  selectedCiId.value = ciId;
  loadCiRelations();
};

// 加载CI关系数据
const loadCiRelations = async () => {
  if (!selectedCiId.value) {
    message.warning('请先选择一个CI实例');
    return;
  }

  loading.value = true;
  try {
    const relationData = await getCiRelationsByIdApi({
      id: selectedCiId.value,
      depth: relationDepth.value,
    });

    if (relationData) {
      buildGraphData(relationData);
      updateChart();
    }
  } catch (error) {
    console.error('加载CI关系失败:', error);
    message.error('加载CI关系失败');
  } finally {
    loading.value = false;
  }
};

// 构建图形数据
const buildGraphData = (relationData: any) => {
  const nodes: CiNode[] = [];
  const edges: RelationEdge[] = [];
  const nodeMap = new Map<string, CiNode>();

  // 添加中心CI节点
  const centerNode: CiNode = {
    id: selectedCiId.value!.toString(),
    name: relationData.centerCi?.name || `CI-${selectedCiId.value}`,
    category: 0, // 当前CI
    value: 100,
    symbolSize: 80,
    itemStyle: {
      color: '#4f46e5'
    },
    label: {
      fontSize: 14,
      fontWeight: 'bold'
    }
  };
  nodes.push(centerNode);
  nodeMap.set(centerNode.id, centerNode);

  // 处理出向关系
  if (relationData.sourceRelations) {
    relationData.sourceRelations.forEach((relation: any) => {
      const targetId = relation.targetCiId.toString();
      
      // 添加目标节点
      if (!nodeMap.has(targetId)) {
        const targetNode: CiNode = {
          id: targetId,
          name: relation.targetCiName || `CI-${relation.targetCiId}`,
          category: 1, // 关联CI
          value: 50,
          symbolSize: 60,
          itemStyle: {
            color: '#10b981'
          }
        };
        nodes.push(targetNode);
        nodeMap.set(targetId, targetNode);
      }

      // 添加边
      edges.push({
        source: selectedCiId.value!.toString(),
        target: targetId,
        value: relation.relationTypeName || '关联',
        lineStyle: {
          color: '#ef4444',
          width: 2,
          type: relation.status === 'active' ? 'solid' : 'dashed'
        },
        label: {
          show: true,
          formatter: '{c}',
          fontSize: 12
        }
      });
    });
  }

  // 处理入向关系
  if (relationData.targetRelations) {
    relationData.targetRelations.forEach((relation: any) => {
      const sourceId = relation.sourceCiId.toString();
      
      // 添加源节点
      if (!nodeMap.has(sourceId)) {
        const sourceNode: CiNode = {
          id: sourceId,
          name: relation.sourceCiName || `CI-${relation.sourceCiId}`,
          category: 1, // 关联CI
          value: 50,
          symbolSize: 60,
          itemStyle: {
            color: '#10b981'
          }
        };
        nodes.push(sourceNode);
        nodeMap.set(sourceId, sourceNode);
      }

      // 添加边
      edges.push({
        source: sourceId,
        target: selectedCiId.value!.toString(),
        value: relation.relationTypeName || '关联',
        lineStyle: {
          color: '#3b82f6',
          width: 2,
          type: relation.status === 'active' ? 'solid' : 'dashed'
        },
        label: {
          show: true,
          formatter: '{c}',
          fontSize: 12
        }
      });
    });
  }

  graphData.value = { nodes, edges, categories: graphData.value.categories };
};

// 更新图表
const updateChart = () => {
  if (!chartInstance.value) return;

  const option = {
    title: {
      text: 'CI关系图',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          return `${params.name}<br/>类型: ${params.data.category === 0 ? '当前CI' : '关联CI'}`;
        } else if (params.dataType === 'edge') {
          return `关系: ${params.value}<br/>从: ${params.data.source}<br/>到: ${params.data.target}`;
        }
        return '';
      }
    },
    legend: {
      data: graphData.value.categories.map(cat => cat.name),
      orient: 'vertical',
      right: 20,
      top: 50
    },
    series: [
      {
        name: 'CI关系图',
        type: 'graph',
        layout: layoutType.value,
        data: graphData.value.nodes,
        links: graphData.value.edges,
        categories: graphData.value.categories,
        roam: true,
        label: {
          show: true,
          position: 'right',
          formatter: '{b}'
        },
        labelLayout: {
          hideOverlap: true
        },
        scaleLimit: {
          min: 0.4,
          max: 2
        },
        lineStyle: {
          color: 'source',
          curveness: 0.1
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 10
          }
        },
        force: layoutType.value === 'force' ? {
          repulsion: 1000,
          gravity: 0.1,
          edgeLength: [100, 300],
          layoutAnimation: true
        } : undefined,
        circular: layoutType.value === 'circular' ? {
          rotateLabel: true
        } : undefined
      }
    ]
  };

  chartInstance.value.setOption(option, true);
};

// 更新布局
const updateLayout = () => {
  updateChart();
};

// 刷新图形
const refreshGraph = () => {
  loadCiRelations();
};

// 重置缩放
const resetZoom = () => {
  if (chartInstance.value) {
    chartInstance.value.dispatchAction({
      type: 'restore'
    });
  }
};

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return;

  chartInstance.value = echarts.init(chartContainer.value);
  
  // 绑定点击事件
  chartInstance.value.on('click', (params: any) => {
    if (params.dataType === 'node') {
      // 点击节点，显示CI详情
      const ciId = parseInt(params.data.id);
      loadCiDetail(ciId);
    } else if (params.dataType === 'edge') {
      // 点击边，显示关系详情
      loadRelationDetail(params.data);
    }
  });

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chartInstance.value?.resize();
  });
};

// 加载CI详情
const loadCiDetail = async (ciId: number) => {
  try {
    // 这里应该调用获取CI详情的API
    // const response = await getCiDetailApi(ciId);
    
    // 模拟数据
    selectedCi.value = {
      id: ciId,
      name: `CI-${ciId}`,
      typeName: '服务器',
      status: 'active',
      description: '这是一个服务器CI实例',
      createdAt: new Date().toISOString(),
    };
    
    ciDetailVisible.value = true;
  } catch (error) {
    console.error('加载CI详情失败:', error);
    message.error('加载CI详情失败');
  }
};

// 加载关系详情
const loadRelationDetail = (edgeData: any) => {
  // 模拟关系详情数据
  selectedRelation.value = {
    id: Math.floor(Math.random() * 1000),
    sourceCiId: parseInt(edgeData.source),
    sourceCiName: `CI-${edgeData.source}`,
    targetCiId: parseInt(edgeData.target),
    targetCiName: `CI-${edgeData.target}`,
    relationTypeName: edgeData.value,
    relationStrength: 'normal',
    status: 'active',
    discoverySource: 'manual',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attributeMappings: []
  };
  
  relationDetailVisible.value = true;
};

// 生命周期钩子
onMounted(async () => {
  await loadCiList();
  await nextTick();
  initChart();
});

// 监听容器大小变化
watch(() => chartContainer.value, () => {
  if (chartInstance.value) {
    chartInstance.value.resize();
  }
});

// 导出供模板使用的方法和数据
defineExpose({
  refreshGraph,
  resetZoom,
});
</script>

<style scoped>
.ci-relation-graph {
  background-color: #f5f5f5;
}

:deep(.ant-drawer-body) {
  padding: 16px;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 600;
  width: 120px;
}
</style>
