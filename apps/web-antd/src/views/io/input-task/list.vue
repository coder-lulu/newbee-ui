<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>输入任务</template>
      <a-form layout="inline" :model="query" @submit.prevent>
        <a-form-item label="名称">
          <a-input v-model:value="query.name" placeholder="输入名称搜索" allow-clear />
        </a-form-item>
        <a-form-item label="类型">
          <a-select v-model:value="query.taskType" allow-clear style="width: 160px">
            <a-select-option value="file">file</a-select-option>
            <a-select-option value="api">api</a-select-option>
            <a-select-option value="sdk">sdk</a-select-option>
            <a-select-option value="builtin">builtin</a-select-option>
            <a-select-option value="manual">manual</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="query.taskStatus" allow-clear style="width: 160px">
            <a-select-option value="pending">pending</a-select-option>
            <a-select-option value="running">running</a-select-option>
            <a-select-option value="completed">completed</a-select-option>
            <a-select-option value="failed">failed</a-select-option>
            <a-select-option value="cancelled">cancelled</a-select-option>
            <a-select-option value="paused">paused</a-select-option>
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
            <a-button :disabled="!selectedRowKeys.length" @click="batchDelete">批量删除</a-button>
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
      >
        <a-table-column title="ID" data-index="id" width="80" />
        <a-table-column title="名称" data-index="name" />
        <a-table-column title="类型" data-index="taskType" width="110" />
        <a-table-column title="状态" data-index="taskStatus" width="110" />
        <a-table-column title="进度" width="120">
          <template #default="{ record }">
            <a-progress :percent="record.progressPercent || 0" size="small" />
          </template>
        </a-table-column>
        <a-table-column title="处理(成功/失败)" width="200">
          <template #default="{ record }">
            {{ record.processedRecords }} ({{ record.successRecords }}/{{ record.failedRecords }})
          </template>
        </a-table-column>
        <a-table-column title="操作" width="260">
          <template #default="{ record }">
            <a-space>
              <a-button size="small" type="link" @click="goDetail(record.id)">详情</a-button>
              <a-button size="small" type="link" @click="goEdit(record.id)">编辑</a-button>
              <a-button size="small" type="link" @click="handleStart(record.id)">启动</a-button>
              <a-button size="small" type="link" @click="handlePause(record.id)">暂停</a-button>
              <a-button size="small" type="link" @click="handleCancel(record.id)">取消</a-button>
            </a-space>
          </template>
        </a-table-column>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import { Modal, message } from 'ant-design-vue';
import { useRouter } from 'vue-router';

import { getInputTaskList, deleteInputTask, startInputTask, pauseInputTask, cancelInputTask } from '#/api/io/input-task';
import type { InputTaskInfo, InputTaskListReq } from '#/api/io/model';

const router = useRouter();
const loading = ref(false);
const tableData = ref<InputTaskInfo[]>([]);
const selectedRowKeys = ref<(number | string)[]>([]);
const pagination = reactive<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });
const query = reactive<Partial<InputTaskListReq>>({});

async function fetchData() {
  loading.value = true;
  try {
    const res = await getInputTaskList({
      page: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
      name: query.name,
      taskType: query.taskType as any,
      taskStatus: query.taskStatus as any,
    } as any);
    tableData.value = (res?.data as any) || res?.rows || (res as any).data || [];
    if ((res as any).total !== undefined) pagination.total = (res as any).total;
    else if ((res as any).data?.total !== undefined) pagination.total = (res as any).data.total;
  } catch {}
  finally { loading.value = false; }
}

function onTableChange(p: TablePaginationConfig) {
  pagination.current = p.current;
  pagination.pageSize = p.pageSize;
  fetchData();
}

function resetQuery() {
  Object.assign(query, { name: undefined, taskType: undefined, taskStatus: undefined });
  pagination.current = 1;
  fetchData();
}

function safePushByName(name: string, params?: Record<string, any>) {
  // 后端驱动路由：若未注册对应路由，引导用户先在菜单中添加或执行初始化
  if (!router.hasRoute(name as any)) {
    message.warning(`未找到路由 ${name}，请先在菜单中添加或执行「初始化数据库」`);
    return;
  }
  router.push({ name: name as any, params });
}

function goCreate() { safePushByName('InputTaskEdit'); }
function goEdit(id?: number) { if (id) safePushByName('InputTaskEdit', { id: String(id) }); }
function goDetail(id?: number) { if (id) safePushByName('InputTaskDetail', { id: String(id) }); }

function batchDelete() {
  if (!selectedRowKeys.value.length) return;
  Modal.confirm({
    title: '批量删除确认',
    content: `确认删除选中的 ${selectedRowKeys.value.length} 个任务？`,
    onOk: async () => {
      try {
        await deleteInputTask(selectedRowKeys.value as any);
        message.success('删除成功');
        selectedRowKeys.value = [];
        fetchData();
      } catch {}
    },
  });
}

const rowSelection = { selectedRowKeys: selectedRowKeys.value, onChange: (k: (string|number)[]) => selectedRowKeys.value = k };

onMounted(fetchData);

async function handleStart(id?: number) {
  if (!id) return;
  Modal.confirm({ title: '启动确认', onOk: async () => { try { await startInputTask(id); message.success('已启动'); fetchData(); } catch {} } });
}
async function handlePause(id?: number) {
  if (!id) return;
  Modal.confirm({ title: '暂停确认', onOk: async () => { try { await pauseInputTask(id); message.success('已暂停'); fetchData(); } catch {} } });
}
async function handleCancel(id?: number) {
  if (!id) return;
  Modal.confirm({ title: '取消确认', onOk: async () => { try { await cancelInputTask(id); message.success('已取消'); fetchData(); } catch {} } });
}
</script>

<style scoped>
.mt-4 { margin-top: 16px; }
</style>
