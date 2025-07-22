<script setup lang="ts">
import type { IpamIP, IPStatus, OnlineStatus } from '../../../api/ipam/types';

import { onMounted, ref } from 'vue';

import {
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Input,
  message,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { IPApi } from '../../../api/ipam/ip';
import IPModal from './components/IPModal.vue';

// 响应式数据
const loading = ref(false);
const dataSource = ref<IpamIP[]>([]);
const searchValue = ref('');
const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const editingRecord = ref<IpamIP>();

const pagination = ref({
  current: 1,
  pageSize: 50,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
});

// 表格列定义
const columns = [
  {
    title: 'IP地址',
    dataIndex: 'ipAddr',
    key: 'ipAddr',
    width: 150,
    fixed: 'left' as const,
  },
  {
    title: 'MAC地址',
    dataIndex: 'macAddr',
    key: 'macAddr',
    width: 150,
    ellipsis: true,
  },
  {
    title: '资产ID',
    dataIndex: 'assetId',
    key: 'assetId',
    width: 100,
  },
  {
    title: 'IP状态',
    dataIndex: 'ipStatus',
    key: 'ipStatus',
    width: 100,
  },
  {
    title: '在线状态',
    dataIndex: 'onlineStatus',
    key: 'onlineStatus',
    width: 100,
  },
  {
    title: '最后ping时间',
    dataIndex: 'lastPingAt',
    key: 'lastPingAt',
    width: 160,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 200,
    ellipsis: true,
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
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right' as const,
  },
];

// IP状态颜色映射
const ipStatusColors: Record<IPStatus, string> = {
  allocated: 'blue',
  free: 'green',
  reserved: 'orange',
  recycling: 'purple',
  conflict: 'red',
};

// 在线状态颜色映射
const onlineStatusColors: Record<OnlineStatus, string> = {
  online: 'success',
  offline: 'default',
  unknown: 'warning',
};

// 状态文本映射
const ipStatusText: Record<IPStatus, string> = {
  allocated: '已分配',
  free: '空闲',
  reserved: '保留',
  recycling: '回收中',
  conflict: '冲突',
};

const onlineStatusText: Record<OnlineStatus, string> = {
  online: '在线',
  offline: '离线',
  unknown: '未知',
};

// 加载IP数据
async function loadData() {
  try {
    loading.value = true;
    const listData = await IPApi.list({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      ipAddr: searchValue.value || undefined,
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

// 新建IP
function handleCreate() {
  modalMode.value = 'create';
  editingRecord.value = undefined;
  showModal.value = true;
}

// 编辑IP
function handleEdit(record: IpamIP) {
  modalMode.value = 'edit';
  editingRecord.value = record;
  showModal.value = true;
}

// 删除IP
async function handleDelete(record: IpamIP) {
  try {
    await IPApi.delete({ ids: [record.id] });
    message.success('删除成功');
    loadData();
  } catch (error) {
    console.error('删除失败:', error);
    message.error('删除失败');
  }
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
function formatTime(timestamp?: number) {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleString();
}

// 组件挂载时加载数据
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="ip-page">
    <Card>
      <!-- 操作栏 -->
      <div class="toolbar">
        <div class="left">
          <Input
            v-model:value="searchValue"
            placeholder="搜索IP地址或MAC地址"
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
              新建IP
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
          <template v-if="column.key === 'macAddr'">
            <Tooltip :title="record.macAddr">
              <span>{{ record.macAddr || '-' }}</span>
            </Tooltip>
          </template>
          <template v-else-if="column.key === 'assetId'">
            <span>{{ record.assetId || '-' }}</span>
          </template>
          <template v-else-if="column.key === 'ipStatus'">
            <Tag :color="ipStatusColors[record.ipStatus]">
              {{ ipStatusText[record.ipStatus] }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'onlineStatus'">
            <Tag :color="onlineStatusColors[record.onlineStatus]">
              {{ onlineStatusText[record.onlineStatus] }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'lastPingAt'">
            {{ formatTime(record.lastPingAt) }}
          </template>
          <template v-else-if="column.key === 'description'">
            <Tooltip :title="record.description">
              <span>{{ record.description || '-' }}</span>
            </Tooltip>
          </template>
          <template v-else-if="column.key === 'status'">
            <Tag :color="record.status === 1 ? 'success' : 'default'">
              {{ record.status === 1 ? '正常' : '禁用' }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatTime(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <Space size="small">
              <Button type="text" size="small" @click="handleEdit(record)">
                <EditOutlined />
                编辑
              </Button>
              <!-- <Button
                type="text"
                size="small"
                danger
                @click="handleDelete(record)"
              >
                <DeleteOutlined />
                删除
              </Button> -->
            </Space>
          </template>
        </template>
      </Table>
    </Card>

    <!-- IP模态框 -->
    <IPModal
      :visible="showModal"
      :mode="modalMode"
      :record="editingRecord"
      @update:visible="(v) => (showModal = v)"
      @success="handleSuccess"
    />
  </div>
</template>

<style scoped>
.ip-page {
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
