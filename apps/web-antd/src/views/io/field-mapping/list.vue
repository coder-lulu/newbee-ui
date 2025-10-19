<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>字段映射</template>
      <a-form layout="inline" :model="query" @submit.prevent>
        <a-form-item label="映射名称">
          <a-input v-model:value="query.mappingName" placeholder="输入名称搜索" allow-clear />
        </a-form-item>
        <a-form-item label="类型">
          <a-select v-model:value="query.mappingType" allow-clear style="width: 160px">
            <a-select-option value="input">input</a-select-option>
            <a-select-option value="output">output</a-select-option>
            <a-select-option value="transform">transform</a-select-option>
            <a-select-option value="validation">validation</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="启用">
          <a-select v-model:value="query.isActive" allow-clear style="width: 120px">
            <a-select-option :value="true">是</a-select-option>
            <a-select-option :value="false">否</a-select-option>
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
        <a-table-column title="名称" data-index="mappingName" />
        <a-table-column title="类型" data-index="mappingType" width="110" />
        <a-table-column title="源→目标">
          <template #default="{ record }">
            <span>{{ record.sourceField }} → {{ record.targetField }}</span>
          </template>
        </a-table-column>
        <a-table-column title="源类型" data-index="sourceDataType" width="110" />
        <a-table-column title="目标类型" data-index="targetDataType" width="110" />
        <a-table-column title="转换" data-index="transformType" width="110" />
        <a-table-column title="启用" width="90">
          <template #default="{ record }">
            <a-switch :checked="record.isActive" disabled />
          </template>
        </a-table-column>
        <a-table-column title="优先级/排序" width="150">
          <template #default="{ record }">
            {{ record.priority }} / {{ record.sortOrder }}
          </template>
        </a-table-column>
        <a-table-column title="操作" width="280">
          <template #default="{ record }">
            <a-space>
              <a-button size="small" type="link" @click="goDetail(record.id)">详情</a-button>
              <a-button size="small" type="link" @click="goEdit(record.id)">编辑</a-button>
              <a-button size="small" type="link" danger @click="handleDelete(record.id)">删除</a-button>
            </a-space>
          </template>
        </a-table-column>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Modal, message } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import { useRouter } from 'vue-router';

import { getFieldMappingList, deleteFieldMapping } from '#/api/io/field-mapping';
import type { FieldMappingInfo, FieldMappingListReq } from '#/api/io/model';

const router = useRouter();
const loading = ref(false);
const tableData = ref<FieldMappingInfo[]>([]);
const selectedRowKeys = ref<(number | string)[]>([]);
const pagination = reactive<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });
const query = reactive<Partial<FieldMappingListReq>>({});

async function fetchData() {
  loading.value = true;
  try {
    const res = await getFieldMappingList({
      page: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
      mappingName: query.mappingName,
      mappingType: query.mappingType as any,
      isActive: query.isActive,
    } as any);
    tableData.value = (res?.data as any) || res?.rows || (res as any).data || [];
    if ((res as any).total !== undefined) pagination.total = (res as any).total;
    else if ((res as any).data?.total !== undefined) pagination.total = (res as any).data.total;
  } catch (e) {
    // ignore
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
  Object.assign(query, { mappingName: undefined, mappingType: undefined, isActive: undefined });
  pagination.current = 1;
  fetchData();
}

function goCreate() {
  router.push({ name: 'FieldMappingEdit' });
}

function goEdit(id?: number) {
  if (!id) return;
  router.push({ name: 'FieldMappingEdit', params: { id: String(id) } });
}

function goDetail(id?: number) {
  if (!id) return;
  router.push({ name: 'FieldMappingDetail', params: { id: String(id) } });
}

function batchDelete() {
  if (!selectedRowKeys.value.length) return;
  Modal.confirm({
    title: '批量删除确认',
    content: `确认删除选中的 ${selectedRowKeys.value.length} 条映射？`,
    onOk: async () => {
      try {
        await deleteFieldMapping(selectedRowKeys.value as any);
        message.success('删除成功');
        selectedRowKeys.value = [];
        fetchData();
      } catch {}
    },
  });
}

const rowSelection = {
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => (selectedRowKeys.value = keys),
};

onMounted(fetchData);

async function handleDelete(id?: number) {
  if (!id) return;
  Modal.confirm({ title: '删除确认', onOk: async () => {
    try {
      const { deleteFieldMapping } = await import('#/api/io/field-mapping');
      await deleteFieldMapping([id] as any);
      message.success('删除成功');
      fetchData();
    } catch {}
  } });
}
</script>

<style scoped>
.mt-4 {
  margin-top: 16px;
}
</style>
