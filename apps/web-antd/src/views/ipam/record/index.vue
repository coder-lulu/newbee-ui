<script setup lang="ts">
import type { ActionType, IpamIPRecord } from '../../../api/ipam/types';

import { onMounted, ref } from 'vue';

import {
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  DatePicker,
  Input,
  message,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { IPRecordApi } from '../../../api/ipam/record';
import RecordModal from './components/RecordModal.vue';

// 响应式数据
const loading = ref(false);
const dataSource = ref<IpamIPRecord[]>([]);
const searchValue = ref('');
const showModal = ref(false);
const viewingRecord = ref<IpamIPRecord>();

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
    title: 'IP地址',
    dataIndex: 'ipAddr',
    key: 'ipAddr',
    width: 120,
  },
  {
    title: '操作类型',
    dataIndex: 'action',
    key: 'action',
    width: 120,
  },
  {
    title: '操作人',
    dataIndex: 'operator',
    key: 'operator',
    width: 100,
  },
  {
    title: '资产ID',
    dataIndex: 'assetId',
    key: 'assetId',
    width: 100,
  },
  {
    title: '网域',
    dataIndex: 'domainName',
    key: 'domainName',
    width: 120,
  },
  {
    title: '网段',
    dataIndex: 'subnetName',
    key: 'subnetName',
    width: 120,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 200,
    ellipsis: true,
  },
  {
    title: '操作时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
  },
  {
    title: '操作',
    key: 'operation',
    width: 100,
    fixed: 'right' as const,
  },
];

// 操作类型颜色映射
const actionColors: Record<ActionType, string> = {
  allocate: 'blue',
  release: 'orange',
  batch_allocate: 'purple',
  batch_release: 'red',
};

const actionText: Record<ActionType, string> = {
  allocate: '分配',
  release: '回收',
  batch_allocate: '批量分配',
  batch_release: '批量回收',
};

// 加载操作记录数据
async function loadData() {
  try {
    loading.value = true;
    const listData = await IPRecordApi.list({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      operator: searchValue.value || undefined,
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

// 查看记录详情
function handleView(record: IpamIPRecord) {
  viewingRecord.value = record;
  showModal.value = true;
}

// 分页变化
function handleTableChange(paginationInfo: any) {
  pagination.value.current = paginationInfo.current;
  pagination.value.pageSize = paginationInfo.pageSize;
  loadData();
}

// 格式化时间
function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

// 组件挂载时加载数据
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="record-page">
    <Card>
      <!-- 操作栏 -->
      <div class="toolbar">
        <div class="left">
          <Input
            v-model="searchValue"
            placeholder="搜索操作人"
            style="width: 200px; margin-right: 8px"
            @press-enter="handleSearch"
          >
            <template #suffix>
              <SearchOutlined @click="handleSearch" />
            </template>
          </Input>
          <DatePicker.RangePicker
            style="width: 300px"
            :placeholder="['开始时间', '结束时间']"
          />
        </div>
        <div class="right">
          <Space>
            <Button @click="handleRefresh">
              <ReloadOutlined />
              刷新
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
          <template v-if="column.key === 'action'">
            <Tag :color="actionColors[record.action]">
              {{ actionText[record.action] }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'assetId'">
            <span>{{ record.assetId || '-' }}</span>
          </template>
          <template v-else-if="column.key === 'remark'">
            <Tooltip :title="record.remark">
              <span>{{ record.remark || '-' }}</span>
            </Tooltip>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatTime(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'operation'">
            <Button type="text" size="small" @click="handleView(record)">
              <EyeOutlined />
              查看
            </Button>
          </template>
        </template>
      </Table>
    </Card>

    <!-- 记录详情模态框 -->
    <RecordModal
      :visible="showModal"
      :record="viewingRecord"
      @update:visible="(v) => (showModal = v)"
    />
  </div>
</template>

<style scoped>
.record-page {
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
