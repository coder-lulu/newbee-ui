<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, nextTick, ref } from 'vue';
import {
  Modal as AModal,
  message,
  InputNumber as AInputNumber,
  Switch as ASwitch,
} from 'ant-design-vue';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue';

import { Page } from '@vben/common-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
  createProxyGroup,
  updateProxyGroup,
  deleteProxyGroups,
  listProxyGroups,
  getProxyGroupById,
  updateGroupMembers,
  type ProxyGroupItem,
  type CreateProxyGroupReq,
  type UpdateProxyGroupReq,
} from '#/api/ops-center/proxy-group';

import { listProxies, type ProxyItem } from '#/api/ops-center/proxy';

// ==================== 筛选表单配置 ====================
const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 80 },
  schema: [
    {
      fieldName: 'name',
      label: '分组名称',
      component: 'Input',
      componentProps: { allowClear: true, placeholder: '搜索分组名称' },
    },
    {
      fieldName: 'status',
      label: '状态',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
      },
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
};

// ==================== 表格列配置 ====================
const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { type: 'seq', width: 60, title: '#' },
  { field: 'name', title: '分组名称', minWidth: 160 },
  { field: 'description', title: '描述', minWidth: 200 },
  {
    field: 'selectionStrategy',
    title: '负载均衡策略',
    minWidth: 140,
    formatter: ({ cellValue }) => {
      const strategies: Record<string, string> = {
        round_robin: '轮询',
        least_connections: '最少连接',
        weighted: '加权轮询',
        random: '随机',
        consistent_hash: '一致性哈希',
      };
      return strategies[cellValue] || cellValue;
    },
  },
  {
    field: 'memberCount',
    title: '成员数量',
    minWidth: 100,
    formatter: ({ row }) => `${row.onlineCount} / ${row.memberCount}`,
  },
  {
    field: 'totalWeight',
    title: '总权重',
    minWidth: 90,
  },
  {
    field: 'healthCheckInterval',
    title: '健康检查间隔',
    minWidth: 120,
    formatter: ({ cellValue }) => `${cellValue}秒`,
  },
  {
    field: 'autoFailover',
    title: '自动故障转移',
    minWidth: 110,
    slots: { default: 'autoFailover' },
  },
  {
    field: 'status',
    title: '状态',
    minWidth: 80,
    slots: { default: 'status' },
  },
  {
    field: 'action',
    title: '操作',
    width: 280,
    fixed: 'right',
    slots: { default: 'action' },
  },
];

// ==================== 表格配置 ====================
const gridOptions: VxeGridProps = {
  id: 'ops-center-worker-groups',
  columns,
  height: 'auto',
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async (_params, formValues = {}) => {
        const page = _params?.page?.currentPage ?? 1;
        const pageSize = _params?.page?.pageSize ?? 20;
        return listProxyGroups({ ...formValues, page, pageSize });
      },
    },
  },
  pagerConfig: { enabled: true, pageSize: 20 },
  rowConfig: { keyField: 'id' },
  checkboxConfig: { reserve: true, highlight: true },
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

// ==================== 创建/编辑表单 ====================
const formModalVisible = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const formData = ref<Partial<CreateProxyGroupReq | UpdateProxyGroupReq>>({
  name: '',
  description: '',
  selectionStrategy: 'round_robin',
  healthCheckInterval: 30,
  autoFailover: true,
  maxRetryCount: 3,
  minHealthyWorkers: 1,
});

const formTitle = computed(() => (formMode.value === 'create' ? '创建分组' : '编辑分组'));

function handleCreate() {
  formMode.value = 'create';
  formData.value = {
    name: '',
    description: '',
    selectionStrategy: 'round_robin',
    healthCheckInterval: 30,
    autoFailover: true,
    maxRetryCount: 3,
    minHealthyWorkers: 1,
  };
  formModalVisible.value = true;
}

function handleEdit(row: ProxyGroupItem) {
  formMode.value = 'edit';
  formData.value = { ...row };
  formModalVisible.value = true;
}

async function handleFormSubmit() {
  try {
    if (formMode.value === 'create') {
      await createProxyGroup(formData.value as CreateProxyGroupReq);
      message.success('创建成功');
    } else {
      await updateProxyGroup(formData.value as UpdateProxyGroupReq);
      message.success('更新成功');
    }
    formModalVisible.value = false;
    await tableApi.query();
  } catch (error) {
    message.error('操作失败');
  }
}

// ==================== 删除操作 ====================
function handleDelete(row: ProxyGroupItem) {
  AModal.confirm({
    title: `确认删除分组 ${row.name}?`,
    content: '此操作不可恢复',
    onOk: async () => {
      await deleteProxyGroups([row.id]);
      await tableApi.query();
    },
  });
}

function handleBatchDelete() {
  const selected = tableApi.getCheckboxRecords();
  if (selected.length === 0) {
    message.warning('请先选择要删除的分组');
    return;
  }
  AModal.confirm({
    title: `确认删除 ${selected.length} 个分组?`,
    content: '此操作不可恢复',
    onOk: async () => {
      await deleteProxyGroups(selected.map((r) => r.id));
      await tableApi.query();
    },
  });
}

// ==================== 管理成员 ====================
const memberModalVisible = ref(false);
const currentGroup = ref<ProxyGroupItem | null>(null);
const availableWorkers = ref<ProxyItem[]>([]);
const selectedWorkerIds = ref<string[]>([]); // 存储workerId（唯一标识符）
const memberWeight = ref(100);
const memberPriority = ref(0);

async function handleManageMembers(row: ProxyGroupItem) {
  currentGroup.value = row;
  memberWeight.value = 100;
  memberPriority.value = 0;
  selectedWorkerIds.value = [];

  try {
    // 加载可用的Workers（显示所有启用状态的Worker）
    const result = await listProxies({ page: 1, pageSize: 1000 });
    // 只过滤掉已删除的worker (status !== 2)，显示启用和禁用的
    availableWorkers.value = result.data.filter(w => w.status !== 2);

    // 先打开对话框，让Select组件开始渲染
    memberModalVisible.value = true;

    // 获取当前分组的成员详情，用于回填已选择的workers
    const groupDetail = await getProxyGroupById(row.id);

    if (groupDetail.members && groupDetail.members.length > 0) {
      // 提取已有成员的workerId进行回填（workerId是唯一的字符串标识符）
      const memberWorkerIds = groupDetail.members.map(m => m.workerId);

      // 使用nextTick确保Select选项已完全渲染后再设置选中值
      await nextTick();
      selectedWorkerIds.value = memberWorkerIds;
    }
  } catch (error) {
    message.error('加载分组成员信息失败');
    console.error('Failed to load worker group members:', error);
  }
}

async function handleUpdateMembers() {
  if (!currentGroup.value) {
    message.warning('分组信息缺失');
    return;
  }

  try {
    // 将选中的workerId转换为数字ID
    const workerIds = availableWorkers.value
      .filter(w => selectedWorkerIds.value.includes(w.workerId))
      .map(w => w.id);

    if (workerIds.length === 0 && selectedWorkerIds.value.length > 0) {
      message.warning('未找到有效的Worker');
      return;
    }

    // 一次请求完成更新（后端自动处理增删）
    const response = await updateGroupMembers({
      groupId: currentGroup.value.id,
      workerIds: workerIds,
      weight: memberWeight.value,
      priority: memberPriority.value,
    });

    const { addedCount, removedCount } = response.data;
    const msg = addedCount > 0 || removedCount > 0
      ? `成员更新成功：新增${addedCount}个，删除${removedCount}个`
      : '成员列表无变更';

    message.success(msg);
    memberModalVisible.value = false;
    await tableApi.query();
  } catch (error) {
    message.error('成员更新失败');
    console.error('Failed to update members:', error);
  }
}

// ==================== 选择策略选项 ====================
const strategyOptions = [
  { label: '轮询 (Round Robin)', value: 'round_robin' },
  { label: '最少连接 (Least Connections)', value: 'least_connections' },
  { label: '加权轮询 (Weighted)', value: 'weighted' },
  { label: '随机 (Random)', value: 'random' },
  { label: '一致性哈希 (Consistent Hash)', value: 'consistent_hash' },
];
</script>

<template>
  <Page
    :auto-content-height="true"
    title="Worker分组管理"
    description="管理Worker负载均衡分组，支持多种负载均衡策略"
  >
    <template #extra>
      <a-space>
        <a-button type="primary" @click="handleCreate">
          <PlusOutlined />
          创建分组
        </a-button>
        <a-button danger @click="handleBatchDelete">
          <DeleteOutlined />
          批量删除
        </a-button>
      </a-space>
    </template>

    <BasicTable>
      <template #status="{ row }">
        <a-tag :color="row.status === 1 ? 'green' : 'red'">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </a-tag>
      </template>

      <template #autoFailover="{ row }">
        <a-tag :color="row.autoFailover ? 'green' : 'default'">
          {{ row.autoFailover ? '是' : '否' }}
        </a-tag>
      </template>

      <template #action="{ row }">
        <a-space>
          <a-button type="link" size="small" @click="handleEdit(row)">
            <EditOutlined />
            编辑
          </a-button>
          <a-button type="link" size="small" @click="handleManageMembers(row)">
            <TeamOutlined />
            管理成员
          </a-button>
          <a-button type="link" size="small" danger @click="handleDelete(row)">
            <DeleteOutlined />
            删除
          </a-button>
        </a-space>
      </template>
    </BasicTable>

    <!-- 创建/编辑表单 -->
    <a-modal
      v-model:open="formModalVisible"
      :title="formTitle"
      width="700px"
      :destroy-on-close="true"
      :body-style="{ maxHeight: '60vh', overflowY: 'auto' }"
      @ok="handleFormSubmit"
      :getContainer="false"
    >
      <a-form :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="分组名称" required>
          <a-input v-model:value="formData.name" placeholder="请输入分组名称" />
        </a-form-item>

        <a-form-item label="描述">
          <a-textarea
            v-model:value="formData.description"
            placeholder="请输入分组描述"
            :rows="3"
          />
        </a-form-item>

        <a-form-item label="负载均衡策略" required>
          <a-select v-model:value="formData.selectionStrategy" :options="strategyOptions" />
        </a-form-item>

        <a-form-item label="健康检查间隔">
          <a-input-number
            v-model:value="formData.healthCheckInterval"
            :min="5"
            :max="300"
            addon-after="秒"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="自动故障转移">
          <a-switch v-model:checked="formData.autoFailover" />
        </a-form-item>

        <a-form-item label="最大重试次数">
          <a-input-number
            v-model:value="formData.maxRetryCount"
            :min="1"
            :max="10"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="最小健康节点数">
          <a-input-number
            v-model:value="formData.minHealthyWorkers"
            :min="1"
            :max="100"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 管理成员 -->
    <a-modal
      v-model:open="memberModalVisible"
      :title="`管理分组成员 - ${currentGroup?.name}`"
      width="750px"
      :destroy-on-close="true"
      :body-style="{ maxHeight: '70vh', overflowY: 'auto' }"
      @ok="handleUpdateMembers"
      :getContainer="false"
    >
      <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="分组成员">
          <a-select
            v-model:value="selectedWorkerIds"
            mode="multiple"
            placeholder="请选择Workers（取消勾选即删除，勾选新的即添加）"
            style="width: 100%"
            show-search
            :filter-option="
              (input: string, option: any) =>
                option.label.toLowerCase().includes(input.toLowerCase())
            "
          >
            <a-select-option
              v-for="worker in availableWorkers"
              :key="worker.workerId"
              :value="worker.workerId"
              :label="`${worker.name} (${worker.ip}:${worker.port})`"
            >
              {{ worker.name }} ({{ worker.ip }}:{{ worker.port }})
              <a-tag
                :color="worker.workerStatus === 'online' ? 'green' : 'red'"
                size="small"
                style="margin-left: 8px"
              >
                {{ worker.workerStatus }}
              </a-tag>
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="权重">
          <a-input-number
            v-model:value="memberWeight"
            :min="1"
            :max="1000"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="优先级">
          <a-input-number
            v-model:value="memberPriority"
            :min="0"
            :max="100"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>

      <a-alert
        message="提示"
        description="权重值越大，被选中的概率越高。优先级相同时按权重分配，优先级不同时优先选择高优先级节点。"
        type="info"
        show-icon
        style="margin-top: 16px"
      />
    </a-modal>
  </Page>
</template>
