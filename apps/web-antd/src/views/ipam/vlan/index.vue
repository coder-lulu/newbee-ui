<script setup lang="ts">
import type { IpamVlan } from '../../../api/ipam/types';

import { onMounted, ref } from 'vue';

import {
  DeleteOutlined,
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

import { VlanApi } from '#/api/ipam/vlan';

import VlanModal from './components/VlanModal.vue';

// 响应式数据
const loading = ref(false);
const dataSource = ref<IpamVlan[]>([]);
const searchValue = ref('');
const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const editingRecord = ref<IpamVlan>();

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
    title: 'VLAN ID',
    dataIndex: 'vlanId',
    key: 'vlanId',
    width: 100,
  },
  {
    title: 'VLAN名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: '所属网域',
    dataIndex: 'domainName',
    key: 'domainName',
    width: 150,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 300,
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
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
    width: 200,
    fixed: 'right' as const,
  },
];

// 加载VLAN数据
async function loadData() {
  try {
    loading.value = true;
    const listData = await VlanApi.list({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      name: searchValue.value || undefined,
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

// 新建VLAN
function handleCreate() {
  modalMode.value = 'create';
  editingRecord.value = undefined;
  showModal.value = true;
}

// 编辑VLAN
function handleEdit(record: any) {
  modalMode.value = 'edit';
  editingRecord.value = record as IpamVlan;
  showModal.value = true;
}

// 删除VLAN
async function handleDelete(record: any) {
  try {
    await VlanApi.delete({ ids: [record.id] });
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
function formatTime(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString();
}

// 组件挂载时加载数据
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="vlan-page">
    <Card>
      <!-- 操作栏 -->
      <div class="toolbar">
        <div class="left">
          <Input
            v-model:value="searchValue"
            placeholder="搜索VLAN名称或ID"
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
              新建VLAN
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
        :scroll="{ x: 1200 }"
        row-key="id"
        size="small"
        @change="handleTableChange"
      >
        <!-- 自定义列渲染 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'vlanId'">
            <Tag color="blue">{{ record.vlanId }}</Tag>
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

    <!-- VLAN模态框 -->
    <VlanModal
      :visible="showModal"
      :mode="modalMode"
      :record="editingRecord"
      @update:visible="(v) => (showModal = v)"
      @success="handleSuccess"
    />
  </div>
</template>

<style scoped>
.vlan-page {
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
