<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>发现池</template>
      <a-form layout="inline" :model="query" @submit.prevent>
        <a-form-item label="名称">
          <a-input v-model:value="query.name" placeholder="输入名称搜索" allow-clear />
        </a-form-item>
        <a-form-item label="类型">
          <a-select v-model:value="query.discoveryType" allow-clear style="width: 160px">
            <a-select-option value="file">file</a-select-option>
            <a-select-option value="api">api</a-select-option>
            <a-select-option value="sdk">sdk</a-select-option>
            <a-select-option value="builtin">builtin</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="query.poolStatus" allow-clear style="width: 160px">
            <a-select-option value="active">active</a-select-option>
            <a-select-option value="inactive">inactive</a-select-option>
            <a-select-option value="error">error</a-select-option>
            <a-select-option value="maintain">maintain</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="fetchData">查询</a-button>
            <a-button @click="resetQuery">重置</a-button>
          </a-space>
        </a-form-item>
        <a-form-item style="margin-left: auto">
          <a-space>
            <a-button type="primary" @click="goCreate">新建</a-button>
            <a-button :disabled="!selectedRowKeys.length" @click="batchDisable">批量禁用</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table
        class="mt-4"
        row-key="id"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        @change="onTableChange"
        :row-selection="rowSelection"
        :columns="columns"
      ></a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, h } from 'vue';
import { message, Modal } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';

import {
  disableDiscoveryPool,
  enableDiscoveryPool,
  getDiscoveryPoolList,
  triggerDiscoveryPool,
} from '#/api/io/discovery-pool';
import type { DiscoveryPoolInfo, DiscoveryPoolListReq } from '#/api/io/model';
import { useRouter } from 'vue-router';

const router = useRouter();

const loading = ref(false);
const tableData = ref<DiscoveryPoolInfo[]>([]);
const selectedRowKeys = ref<(number | string)[]>([]);
const pagination = reactive<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });

const query = reactive<Partial<DiscoveryPoolListReq>>({});

// 表格列配置
const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '名称', dataIndex: 'name' },
  { title: '类型', dataIndex: 'discoveryType', width: 100 },
  {
    title: '状态',
    width: 110,
    customRender: ({ record }: { record: DiscoveryPoolInfo }) => {
      return h('a-badge', {
        status: statusBadge(record.poolStatus),
        text: record.poolStatus
      });
    }
  },
  {
    title: '总执行/成功/失败',
    width: 200,
    customRender: ({ record }: { record: DiscoveryPoolInfo }) => {
      return `${record.totalRuns || 0} / ${record.successRuns || 0} / ${record.failedRuns || 0}`;
    }
  },
  {
    title: '最后执行',
    width: 200,
    customRender: ({ record }: { record: DiscoveryPoolInfo }) => {
      return record.lastRunAt ? formatTime(record.lastRunAt) : '—';
    }
  },
  {
    title: '操作',
    width: 320,
    customRender: ({ record }: { record: DiscoveryPoolInfo }) => {
      return h('a-space', {}, [
        h('a-button', { size: 'small', type: 'link', onClick: () => goDetail(record.id) }, '详情'),
        h('a-button', { size: 'small', type: 'link', onClick: () => goEdit(record.id) }, '编辑'),
        h('a-button', { 
          size: 'small', 
          type: 'link', 
          onClick: () => toggleEnable(record) 
        }, record.poolStatus === 'active' ? '禁用' : '启用'),
        h('a-button', { size: 'small', type: 'link', onClick: () => handleTrigger(record.id) }, '触发'),
        h('a-button', { 
          size: 'small', 
          type: 'link', 
          danger: true,
          onClick: () => handleDelete(record.id) 
        }, '删除'),
      ]);
    }
  }
];

function statusBadge(status?: string) {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'default';
    case 'error':
      return 'error';
    case 'maintain':
      return 'warning';
    default:
      return 'default';
  }
}

function formatTime(ts?: number | null) {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  return d.toLocaleString();
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await getDiscoveryPoolList({
      page: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
      name: query.name,
      discoveryType: query.discoveryType as any,
      poolStatus: query.poolStatus as any,
    } as any);
    tableData.value = (res?.data as any) || (res as any).data || [];
    // 兼容 PageResult 结构
    if ((res as any).total !== undefined) {
      pagination.total = (res as any).total;
    } else if ((res as any).data?.total !== undefined) {
      pagination.total = (res as any).data.total;
    }
  } catch (e) {
    // 已统一错误提示
  } finally {
    loading.value = false;
  }
}

function onTableChange(p: TablePaginationConfig) {
  pagination.current = p.current;
  pagination.pageSize = p.pageSize;
  fetchData();
}

function resetQuery() {
  Object.assign(query, { name: undefined, discoveryType: undefined, poolStatus: undefined });
  pagination.current = 1;
  fetchData();
}

function goCreate() {
  router.push({ name: 'DiscoveryPoolEdit' });
}

function goEdit(id: number | undefined) {
  if (!id) return;
  router.push({ name: 'DiscoveryPoolEdit', params: { id: String(id) } });
}

function goDetail(id: number | undefined) {
  if (!id) return;
  router.push({ name: 'DiscoveryPoolDetail', params: { id: String(id) } });
}

async function toggleEnable(record: DiscoveryPoolInfo) {
  if (!record.id) return;
  try {
    if (record.poolStatus === 'active') {
      await disableDiscoveryPool(record.id);
      message.success('已禁用');
    } else {
      await enableDiscoveryPool(record.id);
      message.success('已启用');
    }
    fetchData();
  } catch {}
}

async function handleTrigger(id?: number) {
  if (!id) return;
  try {
    await triggerDiscoveryPool(id);
    message.success('已触发执行');
  } catch {}
}

const rowSelection = {
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => (selectedRowKeys.value = keys),
};

function batchDisable() {
  Modal.confirm({
    title: '批量禁用确认',
    content: `确认禁用选中的 ${selectedRowKeys.value.length} 个发现池？`,
    onOk: async () => {
      for (const id of selectedRowKeys.value) {
        try {
          await disableDiscoveryPool(id as number);
        } catch {}
      }
      selectedRowKeys.value = [];
      fetchData();
    },
  });
}

onMounted(fetchData);

function handleDelete(id?: number) {
  if (!id) return;
  Modal.confirm({
    title: '删除确认',
    content: '确定删除该发现池？',
    onOk: async () => {
      try {
        const { deleteDiscoveryPool } = await import('#/api/io/discovery-pool');
        await deleteDiscoveryPool([id] as any);
        message.success('删除成功');
        fetchData();
      } catch {}
    },
  });
}
</script>

<style scoped>
.mt-4 {
  margin-top: 16px;
}
</style>
