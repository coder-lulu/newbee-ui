<script setup lang="ts">
import { ref, watch } from 'vue';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons-vue';
import { Button, message, Progress, Space, Table, Tag } from 'ant-design-vue';

interface SubnetRecord {
  id: number;
  domainId: number;
  name: string;
  cidr: string;
  gateway: string;
  vlanId?: number;
  description?: string;
  status: string;
  createdAt: number;
}

interface Props {
  domainId?: null | number;
}

interface Emits {
  (e: 'view', record: SubnetRecord): void;
  (e: 'edit', record: SubnetRecord): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const loading = ref(false);
const dataSource = ref<SubnetRecord[]>([]);
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
});

// 模拟数据
const mockSubnets: SubnetRecord[] = [
  {
    id: 1,
    domainId: 1,
    name: '公网网段1',
    cidr: '192.168.1.0/24',
    gateway: '192.168.1.1',
    vlanId: 100,
    description: '主要公网段',
    status: 'active',
    createdAt: Date.now() / 1000,
  },
  {
    id: 2,
    domainId: 1,
    name: '公网网段2',
    cidr: '192.168.2.0/24',
    gateway: '192.168.2.1',
    vlanId: 101,
    description: '备用公网段',
    status: 'active',
    createdAt: Date.now() / 1000,
  },
  {
    id: 3,
    domainId: 2,
    name: '内网网段1',
    cidr: '10.0.1.0/24',
    gateway: '10.0.1.1',
    vlanId: 200,
    description: '办公网段',
    status: 'active',
    createdAt: Date.now() / 1000,
  },
  {
    id: 4,
    domainId: 3,
    name: '测试网段1',
    cidr: '172.16.1.0/24',
    gateway: '172.16.1.1',
    vlanId: 300,
    description: '测试环境',
    status: 'active',
    createdAt: Date.now() / 1000,
  },
];

// 表格列定义
const columns = [
  {
    title: '子网名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: 'CIDR',
    dataIndex: 'cidr',
    key: 'cidr',
    width: 150,
  },
  {
    title: 'VLAN ID',
    dataIndex: 'vlanId',
    key: 'vlanId',
    width: 80,
  },
  {
    title: '网关',
    dataIndex: 'gateway',
    key: 'gateway',
    width: 120,
  },
  {
    title: '在线率',
    dataIndex: 'onlineRate',
    key: 'onlineRate',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 160,
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right' as const,
  },
];

// 加载网段数据
async function loadData() {
  try {
    loading.value = true;

    // 模拟异步延迟
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 过滤数据
    const filteredData = props.domainId
      ? mockSubnets.filter((subnet) => subnet.domainId === props.domainId)
      : [];

    dataSource.value = filteredData;
    pagination.value.total = filteredData.length;
  } catch (error) {
    console.error('加载网段数据失败:', error);
    message.error('加载网段数据失败');
  } finally {
    loading.value = false;
  }
}

// 删除网段
async function handleDelete(_record: SubnetRecord) {
  try {
    message.success('删除成功');
    loadData();
  } catch (error) {
    console.error('删除失败:', error);
    message.error('删除失败');
  }
}

// 分页变化处理
function handleTableChange(paginationInfo: any) {
  pagination.value.current = paginationInfo.current;
  pagination.value.pageSize = paginationInfo.pageSize;
  loadData();
}

// 搜索数据
function searchData(keyword: string) {
  console.log('搜索关键词:', keyword);
  // TODO: 实现搜索功能
}

// 监听domainId变化
watch(
  () => props.domainId,
  () => {
    if (props.domainId) {
      pagination.value.current = 1;
      loadData();
    } else {
      dataSource.value = [];
      pagination.value.total = 0;
    }
  },
  { immediate: true },
);

// 暴露方法给父组件
defineExpose({
  loadData,
  searchData,
});
</script>

<template>
  <div class="subnet-table">
    <Table
      :data-source="dataSource"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      :scroll="{ x: 1000 }"
      row-key="id"
      size="small"
      @change="handleTableChange"
    >
      <!-- 自定义列渲染 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'vlanId'">
          <Tag v-if="record.vlanId" color="blue">
            VLAN {{ record.vlanId }}
          </Tag>
          <span v-else>-</span>
        </template>
        <template v-else-if="column.key === 'onlineRate'">
          <Progress
            :percent="Math.floor(Math.random() * 100)"
            size="small"
            :status="Math.random() > 0.5 ? 'success' : 'normal'"
          />
        </template>
        <template v-else-if="column.key === 'status'">
          <Tag color="success">正常</Tag>
        </template>
        <template v-else-if="column.key === 'createdAt'">
          {{ new Date(record.createdAt * 1000).toLocaleString() }}
        </template>
        <template v-else-if="column.key === 'action'">
          <Space size="small">
            <Button
              type="text"
              size="small"
              :icon="EyeOutlined"
              @click="emit('view', record as SubnetRecord)"
            >
              查看
            </Button>
            <Button
              type="text"
              size="small"
              :icon="EditOutlined"
              @click="emit('edit', record as SubnetRecord)"
            >
              编辑
            </Button>
            <Button
              type="text"
              size="small"
              danger
              :icon="DeleteOutlined"
              @click="handleDelete(record as SubnetRecord)"
            >
              删除
            </Button>
          </Space>
        </template>
      </template>
    </Table>
  </div>
</template>

<style scoped>
.subnet-table {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.subnet-table :deep(.ant-table-wrapper) {
  flex: 1;
}

.subnet-table :deep(.ant-table-tbody) > tr > td {
  padding: 8px 16px;
}

.subnet-table :deep(.ant-table-thead) > tr > th {
  padding: 12px 16px;
  background: #fafafa;
}
</style>
