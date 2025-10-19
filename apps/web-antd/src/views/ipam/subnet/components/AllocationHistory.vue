<script setup lang="ts">
import type { ActionType, IpamIPRecord } from '../../../../api/ipam/types';

import { ref, watch } from 'vue';

import { ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue';
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

import { IPRecordApi } from '../../../../api/ipam/record';

interface Props {
  subnetId?: number;
}

const props = defineProps<Props>();

// 响应式数据
const loading = ref(false);
const dataSource = ref<IpamIPRecord[]>([]);
const searchValue = ref('');

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

// 加载分配记录数据
async function loadData() {
  if (!props.subnetId) return;

  try {
    loading.value = true;
    const listData = await IPRecordApi.list({
      subnetId: props.subnetId,
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      operator: searchValue.value || undefined,
    });
    console.log(listData);
    dataSource.value = listData.data || [];
    pagination.value.total = listData.total;
  } catch (error) {
    console.error('加载分配记录失败:', error);
    message.error('加载分配记录失败');
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

// 分页变化
function handleTableChange(paginationInfo: any) {
  pagination.value.current = paginationInfo.current;
  pagination.value.pageSize = paginationInfo.pageSize;
  loadData();
}

// 格式化时间
function formatTime(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString();
}

// 监听subnetId变化
watch(
  () => props.subnetId,
  (newSubnetId) => {
    if (newSubnetId) {
      pagination.value.current = 1;
      loadData();
    }
  },
  { immediate: true },
);
</script>

<script lang="ts">
export default {
  name: 'AllocationHistory',
};
</script>

<template>
  <div class="allocation-history">
    <Card>
      <template #title>
        <Space>
          <span>分配记录</span>
        </Space>
      </template>

      <template #extra>
        <Space>
          <Input
            v-model="searchValue"
            placeholder="搜索操作人..."
            style="width: 200px"
            allow-clear
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <Button type="text" size="small" @click="handleSearch">
                <SearchOutlined />
              </Button>
            </template>
          </Input>
          <Button @click="handleRefresh" :loading="loading">
            <ReloadOutlined />
            刷新
          </Button>
        </Space>
      </template>

      <Table
        :data-source="dataSource"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 800 }"
        row-key="id"
        size="small"
        @change="handleTableChange"
      >
        <!-- 自定义列渲染 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'ipAddr'">
            <Tag color="blue">{{ record.ipAddr || '-' }}</Tag>
          </template>

          <template v-else-if="column.key === 'action'">
            <Tag :color="actionColors[record.action]">
              {{ actionText[record.action] }}
            </Tag>
          </template>

          <template v-else-if="column.key === 'assetId'">
            {{ record.assetId || '-' }}
          </template>

          <template v-else-if="column.key === 'remark'">
            <Tooltip
              v-if="record.remark && record.remark.length > 20"
              :title="record.remark"
            >
              {{ record.remark.substring(0, 20) }}...
            </Tooltip>
            <span v-else>{{ record.remark || '-' }}</span>
          </template>

          <template v-else-if="column.key === 'createdAt'">
            {{ formatTime(record.createdAt) }}
          </template>
        </template>
      </Table>
    </Card>
  </div>
</template>

<style scoped>
.allocation-history {
  height: 100%;
}
</style>
