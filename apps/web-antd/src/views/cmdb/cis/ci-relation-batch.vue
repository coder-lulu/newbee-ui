<template>
  <div class="ci-relation-batch h-full flex flex-col">
    <!-- 页面标题 -->
    <div class="mb-4">
      <h2 class="text-2xl font-bold text-gray-800">CI关系批量操作</h2>
      <p class="text-gray-600 mt-1">批量管理CI实例之间的关系，支持批量查询、创建、修改和删除操作</p>
    </div>

    <!-- 操作工具栏 -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow-sm">
      <div class="flex flex-col gap-4">
        <!-- 第一行：CI选择和查询选项 -->
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium mb-1">选择CI实例</label>
            <a-select
              v-model:value="selectedCiIds"
              mode="multiple"
              placeholder="选择或搜索CI实例"
              :options="ciOptions"
              :filter-option="filterCiOptions"
              show-search
              class="w-full"
              :max-tag-count="3"
            >
              <template #maxTagPlaceholder="omittedValues">
                <span class="text-gray-500">+{{ omittedValues.length }}个CI</span>
              </template>
            </a-select>
          </div>
          
          <div class="w-32">
            <label class="block text-sm font-medium mb-1">关系方向</label>
            <a-select v-model:value="queryDirection" :options="directionOptions" />
          </div>
          
          <div class="w-32">
            <label class="block text-sm font-medium mb-1">关系深度</label>
            <a-input-number v-model:value="queryDepth" :min="1" :max="5" />
          </div>
        </div>

        <!-- 第二行：过滤选项 -->
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium mb-1">关系类型筛选</label>
            <a-select
              v-model:value="selectedRelationTypes"
              mode="multiple"
              placeholder="选择关系类型"
              :options="relationTypeOptions"
              class="w-full"
            />
          </div>
          
          <div class="w-40">
            <label class="block text-sm font-medium mb-1">关系状态</label>
            <a-select
              v-model:value="selectedStatuses"
              mode="multiple"
              placeholder="选择状态"
              :options="statusOptions"
            />
          </div>
          
          <div class="w-40">
            <label class="block text-sm font-medium mb-1">发现来源</label>
            <a-select
              v-model:value="selectedDiscoverySources"
              mode="multiple"
              placeholder="选择来源"
              :options="discoverySourceOptions"
            />
          </div>
        </div>

        <!-- 第三行：操作按钮 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <a-button type="primary" @click="queryRelations" :loading="querying">
              <template #icon><SearchOutlined /></template>
              批量查询关系
            </a-button>
            <a-button @click="resetFilters">
              <template #icon><ReloadOutlined /></template>
              重置筛选
            </a-button>
            <a-button @click="loadSampleData" type="dashed">
              <template #icon><ExperimentOutlined /></template>
              加载示例数据
            </a-button>
          </div>
          
          <div class="flex items-center gap-3">
            <a-button @click="showBatchCreateModal = true" :disabled="!hasSelectedCis">
              <template #icon><PlusOutlined /></template>
              批量创建关系
            </a-button>
            <a-button @click="showBatchUpdateModal = true" :disabled="!hasSelectedRelations">
              <template #icon><EditOutlined /></template>
              批量修改关系
            </a-button>
            <a-button danger @click="batchDeleteRelations" :disabled="!hasSelectedRelations" :loading="deleting">
              <template #icon><DeleteOutlined /></template>
              批量删除关系
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 查询结果统计 -->
    <div v-if="queryResult" class="mb-4 grid grid-cols-4 gap-4">
      <a-card size="small" class="text-center">
        <a-statistic title="总CI数量" :value="queryResult.total_cis" />
      </a-card>
      <a-card size="small" class="text-center">
        <a-statistic title="总关系数量" :value="queryResult.total_relations" />
      </a-card>
      <a-card size="small" class="text-center">
        <a-statistic title="选中关系" :value="selectedRelationIds.length" />
      </a-card>
      <a-card size="small" class="text-center">
        <a-statistic title="平均关系数" :value="averageRelationsPerCi" :precision="1" />
      </a-card>
    </div>

    <!-- 关系数据表格 -->
    <div class="flex-1 bg-white rounded-lg shadow-sm">
      <a-table
        :columns="relationColumns"
        :data-source="flattenedRelations"
        :row-selection="rowSelection"
        :pagination="paginationConfig"
        :loading="querying"
        size="small"
        :scroll="{ y: 400 }"
      >
        <!-- 自定义渲染 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'source_ci'">
            <div class="flex items-center gap-2">
              <a-tag color="blue">{{ record.sourceCiName }}</a-tag>
              <span class="text-xs text-gray-500">(ID: {{ record.source_ci_id }})</span>
            </div>
          </template>
          
          <template v-if="column.key === 'target_ci'">
            <div class="flex items-center gap-2">
              <a-tag color="green">{{ record.targetCiName }}</a-tag>
              <span class="text-xs text-gray-500">(ID: {{ record.target_ci_id }})</span>
            </div>
          </template>
          
          <template v-if="column.key === 'relation_type'">
            <a-tag color="purple">{{ record.relationTypeName }}</a-tag>
          </template>
          
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
          </template>
          
          <template v-if="column.key === 'relation_strength'">
            <a-tag :color="getStrengthColor(record.relation_strength)">{{ record.relation_strength }}</a-tag>
          </template>
          
          <template v-if="column.key === 'discovery_source'">
            <a-tag :color="getDiscoverySourceColor(record.discovery_source)">{{ record.discovery_source }}</a-tag>
          </template>
          
          <template v-if="column.key === 'actions'">
            <div class="flex items-center gap-1">
              <a-button size="small" @click="viewRelationDetail(record)">
                <template #icon><EyeOutlined /></template>
              </a-button>
              <a-button size="small" @click="editRelation(record)">
                <template #icon><EditOutlined /></template>
              </a-button>
              <a-button size="small" danger @click="deleteRelation(record)">
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 批量创建关系模态框 -->
    <a-modal
      v-model:open="showBatchCreateModal"
      title="批量创建关系"
      width="800px"
      @ok="handleBatchCreate"
      :confirm-loading="creating"
    >
      <div class="space-y-4">
        <a-alert
          message="批量创建提示"
          description="将为选中的CI实例批量创建关系。请选择目标CI和关系类型。"
          type="info"
          show-icon
        />
        
        <a-form layout="vertical">
          <a-form-item label="关系类型" required>
            <a-select v-model:value="batchCreateForm.relationTypeId" placeholder="选择关系类型" :options="relationTypeOptions" />
          </a-form-item>
          
          <a-form-item label="目标CI" required>
            <a-select v-model:value="batchCreateForm.targetCiId" placeholder="选择目标CI" :options="ciOptions" show-search />
          </a-form-item>
          
          <a-form-item label="关系方向" required>
            <a-radio-group v-model:value="batchCreateForm.direction">
              <a-radio value="source_to_target">源 → 目标</a-radio>
              <a-radio value="target_to_source">目标 → 源</a-radio>
            </a-radio-group>
          </a-form-item>
          
          <a-form-item label="关系强度">
            <a-select v-model:value="batchCreateForm.relationStrength" :options="strengthOptions" />
          </a-form-item>
          
          <a-form-item label="发现来源">
            <a-select v-model:value="batchCreateForm.discoverySource" :options="discoverySourceOptions" />
          </a-form-item>
        </a-form>
        
        <div>
          <p class="text-sm text-gray-600 mb-2">将创建的关系预览：</p>
          <div class="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
            <div v-for="ciId in selectedCiIds" :key="ciId" class="text-sm">
              {{ getCiNameById(ciId) }} → {{ getCiNameById(batchCreateForm.targetCiId) }}
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 批量修改关系模态框 -->
    <a-modal
      v-model:open="showBatchUpdateModal"
      title="批量修改关系"
      width="600px"
      @ok="handleBatchUpdate"
      :confirm-loading="updating"
    >
      <div class="space-y-4">
        <a-alert
          message="批量修改提示"
          description="将批量修改选中的关系属性。空值表示不修改该属性。"
          type="warning"
          show-icon
        />
        
        <a-form layout="vertical">
          <a-form-item label="关系状态">
            <a-select v-model:value="batchUpdateForm.status" placeholder="选择新状态" :options="statusOptions" allow-clear />
          </a-form-item>
          
          <a-form-item label="关系强度">
            <a-select v-model:value="batchUpdateForm.relationStrength" placeholder="选择新强度" :options="strengthOptions" allow-clear />
          </a-form-item>
          
          <a-form-item label="发现来源">
            <a-select v-model:value="batchUpdateForm.discoverySource" placeholder="选择新来源" :options="discoverySourceOptions" allow-clear />
          </a-form-item>
        </a-form>
        
        <div>
          <p class="text-sm text-gray-600 mb-2">将修改 {{ selectedRelationIds.length }} 个关系</p>
        </div>
      </div>
    </a-modal>

    <!-- 关系详情抽屉 -->
    <a-drawer
      v-model:open="showDetailDrawer"
      title="关系详情"
      width="500px"
      placement="right"
    >
      <div v-if="currentRelation" class="space-y-4">
        <a-descriptions title="基本信息" :column="1" bordered size="small">
          <a-descriptions-item label="关系ID">{{ currentRelation.id }}</a-descriptions-item>
          <a-descriptions-item label="源CI">{{ currentRelation.sourceCiName }}</a-descriptions-item>
          <a-descriptions-item label="目标CI">{{ currentRelation.targetCiName }}</a-descriptions-item>
          <a-descriptions-item label="关系类型">{{ currentRelation.relationTypeName }}</a-descriptions-item>
          <a-descriptions-item label="关系状态">
            <a-tag :color="getStatusColor(currentRelation.status)">{{ currentRelation.status }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="关系强度">
            <a-tag :color="getStrengthColor(currentRelation.relation_strength)">{{ currentRelation.relation_strength }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="发现来源">{{ currentRelation.discovery_source }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ formatTimestamp(currentRelation.created_at) }}</a-descriptions-item>
          <a-descriptions-item label="更新时间">{{ formatTimestamp(currentRelation.updated_at) }}</a-descriptions-item>
        </a-descriptions>
        
        <div v-if="currentRelation.attribute_mappings?.length">
          <h4 class="font-medium mb-2">属性映射</h4>
          <a-table
            :columns="mappingColumns"
            :data-source="currentRelation.attribute_mappings"
            size="small"
            :pagination="false"
          />
        </div>
        
        <div v-if="currentRelation.properties">
          <h4 class="font-medium mb-2">关系属性</h4>
          <pre class="bg-gray-100 p-2 rounded text-sm">{{ JSON.stringify(JSON.parse(currentRelation.properties), null, 2) }}</pre>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { message } from 'ant-design-vue';
import {
  SearchOutlined,
  ReloadOutlined,
  ExperimentOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons-vue';

// API导入
import {
  getCiRelationsBatchApi,
  createCiRelationApi,
  updateCiRelationApi,
  deleteCiRelationApi,
  getRelationTypesApi,
  type CiRelationBatchQueryReq,
  type CiRelationBatchQueryResp,
  type CiRelationInfo,
  type CiRelationCreateInfo,
} from '#/api/cmdb/cis/relation';

// 响应式数据
const selectedCiIds = ref<number[]>([]);
const queryDirection = ref('both');
const queryDepth = ref(2);
const selectedRelationTypes = ref<number[]>([]);
const selectedStatuses = ref<string[]>([]);
const selectedDiscoverySources = ref<string[]>([]);

const queryResult = ref<CiRelationBatchQueryResp>();
const flattenedRelations = ref<CiRelationInfo[]>([]);
const selectedRelationIds = ref<number[]>([]);

const querying = ref(false);
const creating = ref(false);
const updating = ref(false);
const deleting = ref(false);

const showBatchCreateModal = ref(false);
const showBatchUpdateModal = ref(false);
const showDetailDrawer = ref(false);
const currentRelation = ref<CiRelationInfo>();

// 表单数据
const batchCreateForm = reactive({
  relationTypeId: undefined as number | undefined,
  targetCiId: undefined as number | undefined,
  direction: 'source_to_target' as 'source_to_target' | 'target_to_source',
  relationStrength: 'normal',
  discoverySource: 'manual',
});

const batchUpdateForm = reactive({
  status: undefined as string | undefined,
  relationStrength: undefined as string | undefined,
  discoverySource: undefined as string | undefined,
});

// 选项数据
const ciOptions = ref<Array<{ label: string; value: number }>>([]);
const relationTypeOptions = ref<Array<{ label: string; value: number }>>([]);

const directionOptions = [
  { label: '双向', value: 'both' },
  { label: '作为源', value: 'source' },
  { label: '作为目标', value: 'target' },
];

const statusOptions = [
  { label: '激活', value: 'active' },
  { label: '非激活', value: 'inactive' },
  { label: '暂停', value: 'suspended' },
];

const strengthOptions = [
  { label: '弱', value: 'weak' },
  { label: '正常', value: 'normal' },
  { label: '强', value: 'strong' },
];

const discoverySourceOptions = [
  { label: '手动', value: 'manual' },
  { label: '自动发现', value: 'auto_discovery' },
  { label: '导入', value: 'import' },
];

// 计算属性
const hasSelectedCis = computed(() => selectedCiIds.value.length > 0);
const hasSelectedRelations = computed(() => selectedRelationIds.value.length > 0);

const averageRelationsPerCi = computed(() => {
  if (!queryResult.value || queryResult.value.total_cis === 0) return 0;
  return queryResult.value.total_relations / queryResult.value.total_cis;
});

// 表格配置
const relationColumns = [
  {
    title: '关系ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
    sorter: true,
  },
  {
    title: '源CI',
    key: 'source_ci',
    width: 200,
  },
  {
    title: '目标CI',
    key: 'target_ci',
    width: 200,
  },
  {
    title: '关系类型',
    key: 'relation_type',
    width: 120,
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
  },
  {
    title: '强度',
    key: 'relation_strength',
    width: 80,
  },
  {
    title: '发现来源',
    key: 'discovery_source',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 150,
    customRender: ({ text }: { text: number }) => formatTimestamp(text),
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right' as const,
  },
];

const mappingColumns = [
  {
    title: '源属性',
    dataIndex: 'sourceAttrName',
    key: 'sourceAttrName',
  },
  {
    title: '目标属性',
    dataIndex: 'targetAttrName',
    key: 'targetAttrName',
  },
  {
    title: '同步状态',
    dataIndex: 'sync_status',
    key: 'sync_status',
  },
];

const rowSelection = {
  selectedRowKeys: selectedRelationIds,
  onChange: (selectedRowKeys: number[]) => {
    selectedRelationIds.value = selectedRowKeys;
  },
};

const paginationConfig = {
  pageSize: 20,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
};

// 方法
const filterCiOptions = (input: string, option: any) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

const queryRelations = async () => {
  if (selectedCiIds.value.length === 0) {
    message.warning('请先选择CI实例');
    return;
  }

  querying.value = true;
  try {
    const queryData: CiRelationBatchQueryReq = {
      ci_ids: selectedCiIds.value,
      direction: queryDirection.value,
      depth_limit: queryDepth.value,
    };

    if (selectedRelationTypes.value.length > 0) {
      queryData.relation_type_ids = selectedRelationTypes.value;
    }
    if (selectedStatuses.value.length > 0) {
      queryData.status_filter = selectedStatuses.value;
    }
    if (selectedDiscoverySources.value.length > 0) {
      queryData.discovery_source_filter = selectedDiscoverySources.value;
    }

    const response = await getCiRelationsBatchApi(queryData);
    queryResult.value = response.data;

    // 扁平化关系数据以供表格显示
    flattenedRelations.value = [];
    Object.values(response.data.relations_by_ci).forEach((group) => {
      flattenedRelations.value.push(...group.source_relations, ...group.target_relations);
    });

    // 去重
    const uniqueRelations = new Map();
    flattenedRelations.value.forEach((relation) => {
      uniqueRelations.set(relation.id, relation);
    });
    flattenedRelations.value = Array.from(uniqueRelations.values());

    message.success(`查询完成，共找到 ${flattenedRelations.value.length} 个关系`);
  } catch (error) {
    console.error('查询关系失败:', error);
    message.error('查询关系失败');
  } finally {
    querying.value = false;
  }
};

const resetFilters = () => {
  selectedCiIds.value = [];
  queryDirection.value = 'both';
  queryDepth.value = 2;
  selectedRelationTypes.value = [];
  selectedStatuses.value = [];
  selectedDiscoverySources.value = [];
  queryResult.value = undefined;
  flattenedRelations.value = [];
  selectedRelationIds.value = [];
};

const loadSampleData = () => {
  // 加载一些示例CI ID
  selectedCiIds.value = [1, 2, 3, 4, 5];
  selectedRelationTypes.value = [1, 2];
  selectedStatuses.value = ['active'];
  message.info('已加载示例数据，点击"批量查询关系"查看结果');
};

const handleBatchCreate = async () => {
  if (!batchCreateForm.relationTypeId || !batchCreateForm.targetCiId) {
    message.warning('请完整填写表单');
    return;
  }

  creating.value = true;
  try {
    const promises = selectedCiIds.value.map((ciId) => {
      const createInfo: CiRelationCreateInfo = {
        target_ci_id: batchCreateForm.targetCiId!,
        relation_type_id: batchCreateForm.relationTypeId!,
        direction: batchCreateForm.direction,
        relation_strength: batchCreateForm.relationStrength,
        discovery_source: batchCreateForm.discoverySource,
        status: 'active',
      };

      return createCiRelationApi({
        sourceCiId: ciId,
        relationInfo: createInfo,
      });
    });

    await Promise.all(promises);
    message.success(`成功创建 ${selectedCiIds.value.length} 个关系`);
    showBatchCreateModal.value = false;
    queryRelations(); // 重新查询
  } catch (error) {
    console.error('批量创建关系失败:', error);
    message.error('批量创建关系失败');
  } finally {
    creating.value = false;
  }
};

const handleBatchUpdate = async () => {
  if (!hasSelectedRelations.value) {
    message.warning('请先选择要修改的关系');
    return;
  }

  updating.value = true;
  try {
    const promises = selectedRelationIds.value.map((relationId) => {
      const updateInfo: any = { relation_id: relationId };
      
      if (batchUpdateForm.status) updateInfo.status = batchUpdateForm.status;
      if (batchUpdateForm.relationStrength) updateInfo.relation_strength = batchUpdateForm.relationStrength;
      if (batchUpdateForm.discoverySource) updateInfo.discovery_source = batchUpdateForm.discoverySource;

      return updateCiRelationApi({ relationInfo: updateInfo });
    });

    await Promise.all(promises);
    message.success(`成功修改 ${selectedRelationIds.value.length} 个关系`);
    showBatchUpdateModal.value = false;
    queryRelations(); // 重新查询
  } catch (error) {
    console.error('批量修改关系失败:', error);
    message.error('批量修改关系失败');
  } finally {
    updating.value = false;
  }
};

const batchDeleteRelations = async () => {
  if (!hasSelectedRelations.value) {
    message.warning('请先选择要删除的关系');
    return;
  }

  deleting.value = true;
  try {
    await deleteCiRelationApi({ relationIds: selectedRelationIds.value });
    message.success(`成功删除 ${selectedRelationIds.value.length} 个关系`);
    selectedRelationIds.value = [];
    queryRelations(); // 重新查询
  } catch (error) {
    console.error('批量删除关系失败:', error);
    message.error('批量删除关系失败');
  } finally {
    deleting.value = false;
  }
};

const viewRelationDetail = (relation: CiRelationInfo) => {
  currentRelation.value = relation;
  showDetailDrawer.value = true;
};

const editRelation = (relation: CiRelationInfo) => {
  // 编辑单个关系的逻辑
  message.info('编辑功能开发中...');
};

const deleteRelation = async (relation: CiRelationInfo) => {
  try {
    await deleteCiRelationApi({ relationIds: [relation.id!] });
    message.success('删除关系成功');
    queryRelations(); // 重新查询
  } catch (error) {
    console.error('删除关系失败:', error);
    message.error('删除关系失败');
  }
};

// 工具函数
const getCiNameById = (ciId: number) => {
  const ci = ciOptions.value.find(option => option.value === ciId);
  return ci ? ci.label : `CI-${ciId}`;
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'active': return 'green';
    case 'inactive': return 'red';
    case 'suspended': return 'orange';
    default: return 'default';
  }
};

const getStrengthColor = (strength?: string) => {
  switch (strength) {
    case 'weak': return 'cyan';
    case 'normal': return 'blue';
    case 'strong': return 'purple';
    default: return 'default';
  }
};

const getDiscoverySourceColor = (source?: string) => {
  switch (source) {
    case 'manual': return 'blue';
    case 'auto_discovery': return 'green';
    case 'import': return 'orange';
    default: return 'default';
  }
};

const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleString();
};

// 初始化
onMounted(async () => {
  try {
    // 加载关系类型
    const relationTypesResponse = await getRelationTypesApi();
    relationTypeOptions.value = relationTypesResponse.data.map(type => ({
      label: type.name,
      value: type.id,
    }));

    // 模拟加载CI选项（实际应该从API获取）
    ciOptions.value = [
      { label: 'Web服务器-001', value: 1 },
      { label: '数据库服务器-002', value: 2 },
      { label: '负载均衡器-003', value: 3 },
      { label: '应用服务器-004', value: 4 },
      { label: '缓存服务器-005', value: 5 },
      { label: '文件服务器-006', value: 6 },
    ];
  } catch (error) {
    console.error('初始化数据失败:', error);
    message.error('初始化数据失败');
  }
});
</script>

<style scoped>
.ci-relation-batch {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 16px;
}
</style>