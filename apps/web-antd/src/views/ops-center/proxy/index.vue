<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Modal as AModal, message } from 'ant-design-vue';
import { EditOutlined } from '@ant-design/icons-vue';
import { useIntervalFn } from '@vueuse/core';

import { Page } from '@vben/common-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
  activateProxy,
  deactivateProxy,
  deleteProxies,
  listProxies,
  updateProxyWeight,
  type ProxyItem,
} from '#/api/ops-center/proxy';

import ProxyDetailDrawer from './ProxyDetailDrawer.vue';

const router = useRouter();

// ==================== 筛选表单配置 ====================
const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 80 },
  schema: [
    {
      fieldName: 'name',
      label: '名称',
      component: 'Input',
      componentProps: { allowClear: true, placeholder: '搜索Worker名称' },
    },
    {
      fieldName: 'workerStatus',
      label: 'Worker状态',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '在线 (Online)', value: 'online' },
          { label: '降级 (Degraded)', value: 'degraded' },
          { label: '离线 (Offline)', value: 'offline' },
        ],
      },
    },
    {
      fieldName: 'region',
      label: '地区',
      component: 'Input',
      componentProps: { allowClear: true, placeholder: '如 cn-shanghai' },
    },
    {
      fieldName: 'zone',
      label: '可用区',
      component: 'Input',
      componentProps: { allowClear: true, placeholder: '如 az-1' },
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

// ==================== 表格列配置 ====================
const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { type: 'seq', width: 60, title: '#' },
  { field: 'workerId', title: 'Worker ID', minWidth: 160 },
  { field: 'name', title: '名称', minWidth: 140 },
  {
    field: 'ip',
    title: 'IP:Port',
    minWidth: 140,
    formatter: ({ row }) => `${row.ip}:${row.port}`,
  },
  {
    field: 'region',
    title: '地区/可用区',
    minWidth: 140,
    formatter: ({ row }) => `${row.region} / ${row.zone}`,
  },
  {
    field: 'workerStatus',
    title: 'Worker状态',
    minWidth: 100,
    slots: { default: 'workerStatus' },
  },
  {
    field: 'cpuUsage',
    title: 'CPU使用率',
    minWidth: 120,
    slots: { default: 'cpuUsage' },
  },
  {
    field: 'memoryUsage',
    title: '内存使用率',
    minWidth: 120,
    slots: { default: 'memoryUsage' },
  },
  {
    field: 'activeSessions',
    title: '活跃会话',
    minWidth: 100,
    formatter: ({ row }) => `${row.activeSessions} / ${row.maxSessions}`,
  },
  {
    field: 'successRate',
    title: '成功率',
    minWidth: 90,
    formatter: ({ row }) => {
      const total = row.totalRequests;
      if (total === 0) return '-';
      const rate = (row.successCount / total) * 100;
      return `${rate.toFixed(1)}%`;
    },
  },
  {
    field: 'lastHeartbeat',
    title: '最后心跳',
    minWidth: 140,
    formatter: ({ cellValue }) => formatRelativeTime(cellValue),
  },
  {
    field: 'weight',
    title: '权重',
    minWidth: 100,
    slots: { default: 'weight' },
  },
  {
    field: 'action',
    title: '操作',
    width: 200,
    fixed: 'right',
    slots: { default: 'action' },
  },
];

// ==================== 表格配置 ====================
const gridOptions: VxeGridProps = {
  id: 'ops-center-workers',
  columns,
  height: 'auto',
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async (_params, formValues = {}) => {
        const page = _params?.page?.currentPage ?? 1;
        const pageSize = _params?.page?.pageSize ?? 20;
        return listProxies({ ...formValues, page, pageSize });
      },
    },
  },
  pagerConfig: { enabled: true, pageSize: 20 },
  rowConfig: { keyField: 'id' },
  checkboxConfig: { reserve: true, highlight: true },
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

// ==================== 工具函数 ====================
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = Math.floor((now - timestamp * 1000) / 1000); // seconds
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86_400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86_400)}天前`;
}

// ==================== 操作函数 ====================
const drawerOpen = ref(false);
const currentDetailWorker = ref<ProxyItem | null>(null);

function handleDetail(row: ProxyItem) {
  currentDetailWorker.value = row;
  drawerOpen.value = true;
}

const weightModalVisible = ref(false);
const currentWorker = ref<ProxyItem | null>(null);
const newWeight = ref(500);

function handleEditWeight(row: ProxyItem) {
  currentWorker.value = row;
  newWeight.value = row.weight;
  weightModalVisible.value = true;
}

async function handleUpdateWeight() {
  if (!currentWorker.value) return;
  await updateProxyWeight({
    id: currentWorker.value.id,
    weight: newWeight.value,
  });
  weightModalVisible.value = false;
  await tableApi.query();
}

function handleActivate(row: ProxyItem) {
  AModal.confirm({
    title: `确认激活 Worker ${row.name}?`,
    onOk: async () => {
      await activateProxy(row.id);
      await tableApi.query();
    },
  });
}

function handleDeactivate(row: ProxyItem) {
  AModal.confirm({
    title: `确认停用 Worker ${row.name}?`,
    onOk: async () => {
      await deactivateProxy(row.id);
      await tableApi.query();
    },
  });
}

function handleDelete(row: ProxyItem) {
  AModal.confirm({
    title: `确认删除 Worker ${row.name}?`,
    content: '此操作不可恢复',
    onOk: async () => {
      await deleteProxies([row.id]);
      await tableApi.query();
    },
  });
}

function handleBatchDelete() {
  const selected = tableApi.getCheckboxRecords();
  if (selected.length === 0) {
    message.warning('请先选择要删除的Worker');
    return;
  }
  AModal.confirm({
    title: `确认删除 ${selected.length} 个Worker?`,
    content: '此操作不可恢复',
    onOk: async () => {
      await deleteProxies(selected.map((r) => r.id));
      await tableApi.query();
    },
  });
}

// ==================== 自动刷新 ====================
const { pause, resume } = useIntervalFn(() => {
  tableApi.query();
}, 30_000); // 30秒刷新

onMounted(() => resume());
onUnmounted(() => pause());
</script>

<template>
  <Page :auto-content-height="true">
    <!-- Worker自动注册说明 -->
    <a-alert
      message="Worker自动注册"
      description="Worker由独立的Agent程序通过PSK认证自动注册到系统，无需手动创建。您可以通过此页面管理已注册的Worker节点。"
      type="info"
      show-icon
      closable
      style="margin-bottom: 16px"
    />

    <BasicTable>
      <!-- Worker状态徽章 -->
      <template #workerStatus="{ row }">
        <a-badge
          :status="
            row.workerStatus === 'online'
              ? 'success'
              : row.workerStatus === 'degraded'
                ? 'warning'
                : 'error'
          "
          :text="
            row.workerStatus === 'online'
              ? '在线'
              : row.workerStatus === 'degraded'
                ? '降级'
                : '离线'
          "
        />
      </template>

      <!-- CPU使用率进度条 -->
      <template #cpuUsage="{ row }">
        <a-progress
          :percent="Number(row.cpuUsage || 0)"
          :stroke-color="
            row.cpuUsage > 90
              ? '#ff4d4f'
              : row.cpuUsage > 80
                ? '#faad14'
                : '#52c41a'
          "
          size="small"
        />
        <span>{{ Number(row.cpuUsage || 0).toFixed(2) }}%</span>
      </template>

      <!-- 内存使用率进度条 -->
      <template #memoryUsage="{ row }">
        <a-progress
          :percent="Number(row.memoryUsage || 0)"
          :stroke-color="
            row.memoryUsage > 90
              ? '#ff4d4f'
              : row.memoryUsage > 80
                ? '#faad14'
                : '#52c41a'
          "
          size="small"
        />
        <span>{{ Number(row.memoryUsage || 0).toFixed(2) }}%</span>
      </template>

      <!-- 权重标签 -->
      <template #weight="{ row }">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <a-tag color="blue">{{ row.weight }}</a-tag>
          <a-button type="link" size="small" @click="handleEditWeight(row)">
            <EditOutlined />
          </a-button>
        </div>
      </template>

      <!-- 操作按钮 -->
      <template #action="{ row }">
        <a-space>
          <a-button type="link" size="small" @click="handleDetail(row)">
            详情
          </a-button>
          <a-button
            type="link"
            size="small"
            :danger="row.status === 1"
            @click="
              row.status === 1 ? handleDeactivate(row) : handleActivate(row)
            "
          >
            {{ row.status === 1 ? '停用' : '激活' }}
          </a-button>
          <a-button type="link" size="small" danger @click="handleDelete(row)">
            删除
          </a-button>
        </a-space>
      </template>

      <!-- 表格工具栏 -->
      <template #toolbar_buttons>
        <a-space>
          <a-button type="primary" danger @click="handleBatchDelete">
            批量删除
          </a-button>
          <a-button @click="() => tableApi.query()">刷新</a-button>
        </a-space>
      </template>
    </BasicTable>
  </Page>

  <!-- 编辑权重模态框 -->
  <a-modal
    v-model:open="weightModalVisible"
    title="编辑Worker权重"
    width="500px"
    :destroy-on-close="true"
    @ok="handleUpdateWeight"
  >
    <a-form layout="vertical">
      <a-form-item label="权重值 (范围: 1-1000)">
        <a-slider
          v-model:value="newWeight"
          :min="1"
          :max="1000"
          :marks="{ 1: '1', 500: '500', 1000: '1000' }"
        />
        <a-input-number
          v-model:value="newWeight"
          :min="1"
          :max="1000"
          style="margin-top: 16px; width: 100%"
          placeholder="输入1-1000的整数"
        />
      </a-form-item>
    </a-form>
  </a-modal>

  <ProxyDetailDrawer
    v-model:open="drawerOpen"
    :worker="currentDetailWorker"
  />
</template>
