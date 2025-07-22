<script setup lang="ts">
import type { IpamSubnet } from '../../../api/ipam/types';

import { onMounted, ref } from 'vue';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Input,
  message,
  Modal,
  Progress,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { SubnetApi } from '../../../api/ipam/subnet';
import SubnetDetail from './components/SubnetDetail.vue';
import SubnetModal from './components/SubnetModal.vue';

// 响应式数据
const loading = ref(false);
const dataSource = ref<IpamSubnet[]>([]);
const searchValue = ref('');
const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const editingRecord = ref<IpamSubnet>();
const showDetail = ref(false);
const detailSubnetId = ref<number>();
// const showIpManagement = ref(false);
// const ipManagementSubnetId = ref<number>();

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
});

// 表格列定义
const columns = [
  {
    title: '网段名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
  },
  {
    title: 'CIDR',
    dataIndex: 'cidr',
    key: 'cidr',
    width: 150,
  },
  {
    title: '网关',
    dataIndex: 'gateway',
    key: 'gateway',
    width: 120,
  },
  {
    title: 'VLAN ID',
    dataIndex: 'vlanId',
    key: 'vlanId',
    width: 100,
  },
  {
    title: '分配策略',
    dataIndex: 'allocationStrategy',
    key: 'allocationStrategy',
    width: 120,
  },
  {
    title: '地址数',
    dataIndex: 'totalIPs',
    key: 'totalIPs',
    width: 100,
  },
  {
    title: '使用率',
    dataIndex: 'usage',
    key: 'usage',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 200,
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 240,
    fixed: 'right' as const,
  },
];

// 分配策略颜色映射
const strategyColors: Record<string, string> = {
  sequential: 'blue',
  random: 'green',
  custom: 'orange',
};

const strategyText: Record<string, string> = {
  sequential: '顺序分配',
  random: '随机分配',
  custom: '自定义',
};

// 加载网段数据
async function loadData() {
  try {
    loading.value = true;
    const listData = await SubnetApi.list({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      ...(searchValue.value && { cidr: searchValue.value }),
    });

    dataSource.value = listData.data;
    pagination.value.total = listData.total;
  } catch (error) {
    console.error('加载数据失败:', error);
    message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

// 搜索功能
function handleSearch() {
  pagination.value.current = 1;
  loadData();
}

// 刷新数据
function handleRefresh() {
  loadData();
}

// 新建网段
function handleCreate() {
  modalMode.value = 'create';
  editingRecord.value = undefined;
  showModal.value = true;
}

// 编辑网段
function handleEdit(record: any) {
  modalMode.value = 'edit';
  editingRecord.value = record as IpamSubnet;
  showModal.value = true;
}

// 查看网段详情
function handleViewDetail(record: any) {
  console.log(record);
  detailSubnetId.value = record.id;
  showDetail.value = true;
}

// IP管理 (暂时未使用)
// function handleIpManagement(record: any) {
//   ipManagementSubnetId.value = record.id;
//   showIpManagement.value = true;
// }

// 删除网段
function handleDelete(record: any) {
  Modal.confirm({
    title: '确认删除网段',
    content: `确定要删除网段 "${record.name || record.cidr}" 吗？删除后将无法恢复，且该网段下的所有IP分配记录也将被清除。`,
    okText: '确认删除',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        await SubnetApi.delete({ ids: [record.id] });
        message.success('网段删除成功');
        loadData();
      } catch (error) {
        console.error('删除失败:', error);
        message.error('删除失败');
      }
    },
  });
}

// 分页变化
function handleTableChange(paginationInfo: any) {
  pagination.value.current = paginationInfo.current;
  pagination.value.pageSize = paginationInfo.pageSize;
  loadData();
}

// 操作成功后的回调
function handleSuccess() {
  loadData();
}

// 格式化时间
function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

// 计算网段地址数
function calculateTotalIPs(cidr: string) {
  try {
    const parts = cidr.split('/');
    if (parts.length !== 2) return 0;
    const maskBits = Number.parseInt(parts[1] || '0');
    return 2 ** (32 - maskBits);
  } catch {
    return 0;
  }
}

// 计算使用率（临时使用随机值，实际应该从后端获取）
// function getUsageRate() {
//   return Math.floor(Math.random() * 100);
// }

// 组件挂载时加载数据
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="subnet-page">
    <Card>
      <!-- 操作栏 -->
      <div class="toolbar">
        <div class="left">
          <Input
            v-model="searchValue"
            placeholder="搜索CIDR地址"
            style="width: 300px"
            @press-enter="handleSearch"
          >
            <template #suffix>
              <SearchOutlined @click="handleSearch" />
            </template>
          </Input>
        </div>
        <div class="right">
          <Space>
            <Button @click="handleRefresh">
              <ReloadOutlined />
              刷新
            </Button>
            <Button type="primary" @click="handleCreate">
              <PlusOutlined />
              新建网段
            </Button>
          </Space>
        </div>
      </div>

      <!-- 表格 -->
      <Table
        :data-source="dataSource"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 1400 }"
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
          <template v-else-if="column.key === 'allocationStrategy'">
            <Tag :color="strategyColors[record.allocationStrategy]">
              {{ strategyText[record.allocationStrategy] }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'totalIPs'">
            {{ calculateTotalIPs(record.cidr) }}
          </template>
          <template v-else-if="column.key === 'usage'">
            <Progress
              :percent="Math.round(record.statistics.allocationRate)"
              size="small"
              :status="
                record.statistics.onlineRate > 80 ? 'exception' : 'normal'
              "
            />
          </template>
          <template v-else-if="column.key === 'status'">
            <Tag :color="record.status === 1 ? 'success' : 'default'">
              {{ record.status === 1 ? '正常' : '禁用' }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'description'">
            <Tooltip :title="record.description">
              <span>{{ record.description || '-' }}</span>
            </Tooltip>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatTime(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <Space size="small">
              <Button
                type="text"
                size="small"
                @click="handleViewDetail(record)"
              >
                <EyeOutlined />
                详情
              </Button>
              <!-- <Button
                type="text"
                size="small"
                @click="handleIpManagement(record)"
              >
                <ThunderboltOutlined />
                IP管理
              </Button> -->
              <Button type="text" size="small" @click="handleEdit(record)">
                <EditOutlined />
                编辑
              </Button>
              <Button
                type="text"
                size="small"
                danger
                @click="handleDelete(record)"
              >
                <DeleteOutlined />
                删除
              </Button>
            </Space>
          </template>
        </template>
      </Table>
    </Card>

    <!-- 网段模态框 -->
    <SubnetModal
      :visible="showModal"
      :mode="modalMode"
      :record="editingRecord"
      @update:visible="(v) => (showModal = v)"
      @success="handleSuccess"
    />

    <!-- 网段详情抽屉 -->
    <SubnetDetail
      :visible="showDetail"
      :subnet-id="detailSubnetId"
      @update:visible="showDetail = false"
    />
  </div>
</template>

<style scoped>
.subnet-page {
  padding: 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.toolbar .left {
  display: flex;
  gap: 8px;
  align-items: center;
}

.toolbar .right {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
