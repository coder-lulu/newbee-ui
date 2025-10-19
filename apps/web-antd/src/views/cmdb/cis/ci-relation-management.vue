<template>
  <div class="ci-relation-management h-full flex flex-col">
    <!-- 头部工具栏 -->
    <div class="mb-4 bg-white p-4 rounded-lg shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a-select
            v-model:value="selectedCiId"
            :options="ciOptions"
            placeholder="选择CI实例查看关系"
            style="width: 250px"
            show-search
            :filter-option="filterOption"
            @change="handleCiChange"
          />
          <a-select
            v-model:value="filterRelationType"
            :options="relationTypeFilterOptions"
            placeholder="筛选关系类型"
            style="width: 180px"
            allow-clear
            @change="loadRelationList"
          />
          <a-select
            v-model:value="filterStatus"
            :options="statusFilterOptions"
            placeholder="筛选状态"
            style="width: 120px"
            allow-clear
            @change="loadRelationList"
          />
        </div>
        <div class="flex items-center gap-2">
          <a-button type="primary" @click="showCreateModal" :disabled="!selectedCiId">
            <template #icon>
              <PlusOutlined />
            </template>
            创建关系
          </a-button>
          <a-button @click="loadRelationList" :loading="loading">
            <template #icon>
              <ReloadOutlined />
            </template>
            刷新
          </a-button>
          <a-button @click="showGraphView" :disabled="!selectedCiId">
            <template #icon>
              <PartitionOutlined />
            </template>
            图形视图
          </a-button>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="mb-4 grid grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="bg-blue-100 p-3 rounded-full mr-3">
            <ArrowRightOutlined class="text-blue-600 text-lg" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ statistics.outgoingCount }}</div>
            <div class="text-sm text-gray-500">出向关系</div>
          </div>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="bg-green-100 p-3 rounded-full mr-3">
            <ArrowLeftOutlined class="text-green-600 text-lg" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ statistics.incomingCount }}</div>
            <div class="text-sm text-gray-500">入向关系</div>
          </div>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="bg-yellow-100 p-3 rounded-full mr-3">
            <NodeIndexOutlined class="text-yellow-600 text-lg" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ statistics.totalCount }}</div>
            <div class="text-sm text-gray-500">总关系数</div>
          </div>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="bg-red-100 p-3 rounded-full mr-3">
            <ExclamationCircleOutlined class="text-red-600 text-lg" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ statistics.inactiveCount }}</div>
            <div class="text-sm text-gray-500">非激活关系</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 关系列表 -->
    <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">关系列表</h3>
          <div class="flex items-center gap-2">
            <a-input-search
              v-model:value="searchKeyword"
              placeholder="搜索关系..."
              style="width: 250px"
              @search="handleSearch"
              allow-clear
            />
            <a-button type="text" @click="showBatchOperations" v-if="selectedRowKeys.length > 0">
              批量操作 ({{ selectedRowKeys.length }})
            </a-button>
          </div>
        </div>
      </div>

      <a-table
        :columns="tableColumns"
        :data-source="relationList"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        row-key="id"
        size="middle"
        @change="handleTableChange"
        class="relation-table"
      >
        <!-- 关系方向 -->
        <template #relationDirection="{ record }">
          <div class="flex items-center">
            <a-tag :color="getDirectionColor(record)">
              {{ getDirectionText(record) }}
            </a-tag>
            <ArrowRightOutlined v-if="record.isOutgoing" class="mx-2 text-blue-500" />
            <ArrowLeftOutlined v-else class="mx-2 text-green-500" />
          </div>
        </template>

        <!-- 关联CI -->
        <template #relatedCi="{ record }">
          <div class="flex items-center">
            <a-avatar :size="24" class="mr-2" style="background-color: #1890ff">
              {{ getRelatedCiName(record).charAt(0) }}
            </a-avatar>
            <div>
              <div class="font-medium">{{ getRelatedCiName(record) }}</div>
              <div class="text-xs text-gray-500">ID: {{ getRelatedCiId(record) }}</div>
            </div>
          </div>
        </template>

        <!-- 关系类型 -->
        <template #relationType="{ record }">
          <a-tag color="purple">{{ record.relationTypeName }}</a-tag>
        </template>

        <!-- 关系强度 -->
        <template #relationStrength="{ record }">
          <a-tag :color="getStrengthColor(record.relationStrength)">
            {{ getStrengthText(record.relationStrength) }}
          </a-tag>
        </template>

        <!-- 状态 -->
        <template #status="{ record }">
          <a-tag :color="record.status === 'active' ? 'green' : 'gray'">
            {{ record.status === 'active' ? '激活' : '非激活' }}
          </a-tag>
        </template>

        <!-- 操作 -->
        <template #action="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="viewRelationDetail(record)">
              详情
            </a-button>
            <a-button type="text" size="small" @click="editRelation(record)">
              编辑
            </a-button>
            <a-popconfirm
              title="确定删除这个关系吗？"
              @confirm="deleteRelation(record)"
              ok-text="确定"
              cancel-text="取消"
            >
              <a-button type="text" size="small" danger>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 关系表单模态框 -->
    <CiRelationFormModal
      v-model:open="formModalVisible"
      :edit-data="editData"
      :source-ci-id="selectedCiId"
      @success="handleFormSuccess"
    />

    <!-- 批量操作抽屉 -->
    <a-drawer
      v-model:open="batchDrawerVisible"
      title="批量操作"
      width="400"
      :destroy-on-close="true"
    >
      <div class="space-y-4">
        <div>
          <h4 class="mb-2">已选择 {{ selectedRowKeys.length }} 个关系</h4>
          <div class="max-h-48 overflow-auto border rounded p-2">
            <div v-for="id in selectedRowKeys" :key="id" class="text-sm py-1">
              关系 ID: {{ id }}
            </div>
          </div>
        </div>

        <a-divider />

        <div class="space-y-3">
          <a-button block @click="batchUpdateStatus('active')" type="primary">
            批量激活
          </a-button>
          <a-button block @click="batchUpdateStatus('inactive')">
            批量停用
          </a-button>
          <a-button block @click="batchUpdateStrength" type="dashed">
            批量修改强度
          </a-button>
          <a-button block @click="batchDelete" danger>
            批量删除
          </a-button>
        </div>
      </div>
    </a-drawer>

    <!-- 关系详情抽屉 -->
    <a-drawer
      v-model:open="detailDrawerVisible"
      title="关系详情"
      width="600"
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
            <a-tag :color="getStrengthColor(selectedRelation.relationStrength)">
              {{ getStrengthText(selectedRelation.relationStrength) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="selectedRelation.status === 'active' ? 'green' : 'gray'">
              {{ selectedRelation.status === 'active' ? '激活' : '非激活' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="发现来源" v-if="selectedRelation.discoverySource">
            {{ getDiscoverySourceText(selectedRelation.discoverySource) }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ formatDateTime(selectedRelation.createdAt) }}
          </a-descriptions-item>
          <a-descriptions-item label="更新时间">
            {{ formatDateTime(selectedRelation.updatedAt) }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 关系属性 -->
        <div v-if="selectedRelation.properties" class="mt-4">
          <h4 class="mb-2">关系属性</h4>
          <pre class="bg-gray-100 p-3 rounded text-sm">{{ JSON.stringify(selectedRelation.properties, null, 2) }}</pre>
        </div>

        <!-- 属性映射 -->
        <div v-if="selectedRelation.attributeMappings && selectedRelation.attributeMappings.length > 0" class="mt-4">
          <h4 class="mb-2">属性映射</h4>
          <a-table
            :dataSource="selectedRelation.attributeMappings"
            :columns="mappingColumns"
            :pagination="false"
            size="small"
          />
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import {
  PlusOutlined,
  ReloadOutlined,
  PartitionOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  NodeIndexOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons-vue';

// 组件导入
import CiRelationFormModal from './components/CiRelationFormModal.vue';

// API导入
import { getCisList } from '#/api/cmdb/cis';
import {
  getCiRelationsApi,
  deleteCiRelationApi,
  getRelationTypesApi,
  type CiRelationInfo,
} from '#/api/cmdb/cis/relation';

// 类型定义
interface RelationStatistics {
  outgoingCount: number;
  incomingCount: number;
  totalCount: number;
  inactiveCount: number;
}

// 响应式数据
const router = useRouter();
const loading = ref(false);
const selectedCiId = ref<number>();
const filterRelationType = ref<number>();
const filterStatus = ref<string>();
const searchKeyword = ref('');

// 列表数据
const relationList = ref<CiRelationInfo[]>([]);
const ciOptions = ref<Array<{ label: string; value: number }>>([]);
const relationTypeFilterOptions = ref<Array<{ label: string; value: number }>>([]);

// 统计数据
const statistics = reactive<RelationStatistics>({
  outgoingCount: 0,
  incomingCount: 0,
  totalCount: 0,
  inactiveCount: 0,
});

// 表单相关
const formModalVisible = ref(false);
const editData = ref();

// 批量操作
const selectedRowKeys = ref<number[]>([]);
const batchDrawerVisible = ref(false);

// 详情抽屉
const detailDrawerVisible = ref(false);
const selectedRelation = ref<CiRelationInfo>();

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
});

// 状态筛选选项
const statusFilterOptions = [
  { label: '激活', value: 'active' },
  { label: '非激活', value: 'inactive' },
];

// 表格列配置
const tableColumns = [
  {
    title: '关系方向',
    dataIndex: 'direction',
    key: 'direction',
    width: 120,
    slots: { customRender: 'relationDirection' },
  },
  {
    title: '关联CI',
    dataIndex: 'relatedCi',
    key: 'relatedCi',
    width: 200,
    slots: { customRender: 'relatedCi' },
  },
  {
    title: '关系类型',
    dataIndex: 'relationTypeName',
    key: 'relationTypeName',
    width: 120,
    slots: { customRender: 'relationType' },
  },
  {
    title: '关系强度',
    dataIndex: 'relationStrength',
    key: 'relationStrength',
    width: 100,
    slots: { customRender: 'relationStrength' },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    slots: { customRender: 'status' },
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 160,
    customRender: ({ text }: any) => formatDateTime(text),
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    slots: { customRender: 'action' },
  },
];

// 属性映射表格列
const mappingColumns = [
  { title: '源属性', dataIndex: 'sourceAttrName', key: 'sourceAttrName' },
  { title: '目标属性', dataIndex: 'targetAttrName', key: 'targetAttrName' },
  { title: '同步状态', dataIndex: 'syncStatus', key: 'syncStatus' },
  { title: '最后同步', dataIndex: 'lastSyncAt', key: 'lastSyncAt' },
];

// 行选择配置
const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: number[]) => {
    selectedRowKeys.value = keys;
  },
  getCheckboxProps: (record: any) => ({
    disabled: record.status === 'system', // 禁用系统关系
  }),
};

// 方法
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

const formatDateTime = (dateTime: string) => {
  return dateTime ? dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss') : '-';
};

const getDirectionColor = (record: any) => {
  return record.isOutgoing ? 'blue' : 'green';
};

const getDirectionText = (record: any) => {
  return record.isOutgoing ? '出向' : '入向';
};

const getRelatedCiName = (record: any) => {
  return record.isOutgoing ? record.targetCiName : record.sourceCiName;
};

const getRelatedCiId = (record: any) => {
  return record.isOutgoing ? record.targetCiId : record.sourceCiId;
};

const getStrengthColor = (strength: string) => {
  const colorMap: Record<string, string> = {
    'strong': 'red',
    'normal': 'blue',
    'weak': 'orange',
  };
  return colorMap[strength] || 'default';
};

const getStrengthText = (strength: string) => {
  const textMap: Record<string, string> = {
    'strong': '强',
    'normal': '正常',
    'weak': '弱',
  };
  return textMap[strength] || strength;
};

const getDiscoverySourceText = (source: string) => {
  const textMap: Record<string, string> = {
    'manual': '手动创建',
    'auto_discovery': '自动发现',
    'import': '数据导入',
    'api': 'API接口',
  };
  return textMap[source] || source;
};

// 加载CI列表
const loadCiList = async () => {
  try {
    const response = await getCisList({ current: 1, size: 1000 });
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

// 加载关系类型筛选选项
const loadRelationTypeFilters = async () => {
  try {
    const response = await getRelationTypesApi({ page: 1, pageSize: 1000 });
    let list: any[] = [];
    if (Array.isArray(response)) {
      list = response;
    } else if (Array.isArray((response as any)?.data?.data)) {
      list = (response as any).data.data;
    } else if (Array.isArray((response as any)?.data)) {
      list = (response as any).data;
    } else if (Array.isArray((response as any)?.list)) {
      list = (response as any).list;
    }
    relationTypeFilterOptions.value = list.map((type: any) => ({
      label: type.name,
      value: type.id,
    }));
  } catch (error) {
    console.error('加载关系类型失败:', error);
  }
};

// 处理CI变化
const handleCiChange = (ciId: number) => {
  selectedCiId.value = ciId;
  loadRelationList();
};

// 加载关系列表
const loadRelationList = async () => {
  if (!selectedCiId.value) {
    relationList.value = [];
    updateStatistics([]);
    return;
  }

  loading.value = true;
  try {
    const relationData = await getCiRelationsApi({
      id: selectedCiId.value,
      relationTypes: filterRelationType.value ? [filterRelationType.value] : undefined,
      includeInactive: true,
    });

    if (relationData) {
      const allRelations: CiRelationInfo[] = [];
      
      // 处理出向关系
      (relationData.sourceRelations ?? []).forEach((relation) => {
        allRelations.push({
          ...relation,
          isOutgoing: true,
        });
      });
      
      // 处理入向关系
      (relationData.targetRelations ?? []).forEach((relation) => {
        allRelations.push({
          ...relation,
          isOutgoing: false,
        });
      });

      // 应用筛选
      let filteredRelations = allRelations;
      if (filterStatus.value) {
        filteredRelations = filteredRelations.filter(r => r.status === filterStatus.value);
      }
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        filteredRelations = filteredRelations.filter(r =>
          r.relationTypeName?.toLowerCase().includes(keyword) ||
          r.sourceCiName?.toLowerCase().includes(keyword) ||
          r.targetCiName?.toLowerCase().includes(keyword)
        );
      }

      relationList.value = filteredRelations;
      updateStatistics(allRelations);
      pagination.total = filteredRelations.length;
    }
  } catch (error) {
    console.error('加载关系列表失败:', error);
    message.error('加载关系列表失败');
  } finally {
    loading.value = false;
  }
};

// 更新统计信息
const updateStatistics = (relations: CiRelationInfo[]) => {
  statistics.outgoingCount = relations.filter(r => r.isOutgoing).length;
  statistics.incomingCount = relations.filter(r => !r.isOutgoing).length;
  statistics.totalCount = relations.length;
  statistics.inactiveCount = relations.filter(r => r.status !== 'active').length;
};

// 搜索处理
const handleSearch = () => {
  loadRelationList();
};

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
};

// 显示创建模态框
const showCreateModal = () => {
  editData.value = undefined;
  formModalVisible.value = true;
};

// 编辑关系
const editRelation = (record: any) => {
  editData.value = record;
  formModalVisible.value = true;
};

// 查看关系详情
const viewRelationDetail = (record: any) => {
  selectedRelation.value = record;
  detailDrawerVisible.value = true;
};

// 删除关系
const deleteRelation = async (record: any) => {
  try {
    await deleteCiRelationApi({ relationIds: [record.id] });
    message.success('关系删除成功');
    loadRelationList();
  } catch (error) {
    console.error('删除关系失败:', error);
    message.error('删除关系失败');
  }
};

// 表单成功处理
const handleFormSuccess = () => {
  loadRelationList();
};

// 显示批量操作
const showBatchOperations = () => {
  batchDrawerVisible.value = true;
};

// 批量更新状态
const batchUpdateStatus = async (status: string) => {
  Modal.confirm({
    title: `确定要批量${status === 'active' ? '激活' : '停用'}选中的关系吗？`,
    content: `将对 ${selectedRowKeys.value.length} 个关系执行操作`,
    onOk: async () => {
      try {
        // 这里应该调用批量更新API
        message.success(`批量${status === 'active' ? '激活' : '停用'}成功`);
        batchDrawerVisible.value = false;
        selectedRowKeys.value = [];
        loadRelationList();
      } catch (error) {
        message.error('批量操作失败');
      }
    },
  });
};

// 批量修改强度
const batchUpdateStrength = () => {
  // 这里可以打开一个选择强度的模态框
  message.info('批量修改强度功能开发中');
};

// 批量删除
const batchDelete = () => {
  Modal.confirm({
    title: '确定要批量删除选中的关系吗？',
    content: `将删除 ${selectedRowKeys.value.length} 个关系，此操作不可恢复`,
    onOk: async () => {
      try {
        await deleteCiRelationApi({ relationIds: selectedRowKeys.value });
        message.success('批量删除成功');
        batchDrawerVisible.value = false;
        selectedRowKeys.value = [];
        loadRelationList();
      } catch (error) {
        console.error('批量删除失败:', error);
        message.error('批量删除失败');
      }
    },
  });
};

// 显示图形视图
const showGraphView = () => {
  if (selectedCiId.value) {
    router.push({
      name: 'CiRelationGraph',
      query: { ciId: selectedCiId.value },
    });
  }
};

// 生命周期
onMounted(async () => {
  await loadCiList();
  await loadRelationTypeFilters();
});
</script>

<style scoped>
.ci-relation-management {
  background-color: #f5f5f5;
}

:deep(.relation-table .ant-table-tbody > tr > td) {
  padding: 12px 16px;
}

:deep(.relation-table .ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 600;
  width: 120px;
}
</style>
