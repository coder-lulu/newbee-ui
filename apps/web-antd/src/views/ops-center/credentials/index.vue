<script setup lang="ts">
import { ref } from 'vue';
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  listCredential,
  createCredential,
  updateCredential,
  deleteCredential,
  type CredentialRef,
} from '#/api/ops-center/credential';
import { Modal, message } from 'ant-design-vue';

const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 80 },
  schema: [
    { fieldName: 'provider', label: '提供者', component: 'Input', componentProps: { allowClear: true } },
    { fieldName: 'scope', label: '作用域', component: 'Input', componentProps: { allowClear: true } },
  ],
};

const columns: VxeGridProps['columns'] = [
  { type: 'seq', width: 60, title: '#' },
  { field: 'id', title: 'ID', minWidth: 200 },
  { field: 'provider', title: '提供者', minWidth: 120 },
  { field: 'ref', title: '引用', minWidth: 180 },
  { field: 'scope', title: '作用域', minWidth: 120 },
  { field: 'createdBy', title: '创建人', minWidth: 120 },
  { field: 'tags', title: '标签', minWidth: 160, formatter: ({ cellValue }) => cellValue ? Object.entries(cellValue).map(([k,v])=>`${k}=${v}`).join('; ') : '' },
  { field: 'action', title: '操作', width: 180, slots: { default: 'action' } },
];

const gridOptions: VxeGridProps = {
  id: 'ops-center-credentials',
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: { enabled: false },
  proxyConfig: {
    ajax: {
      query: async () => listCredential(),
    },
  },
  rowConfig: { keyField: 'id' },
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

const modalVisible = ref(false);
const editing = ref(false);
const formModel = ref<CredentialRef>({ provider: '', ref: '', scope: '', tags: {} });

function openCreate() {
  editing.value = false;
  formModel.value = { provider: '', ref: '', scope: '', tags: {} };
  modalVisible.value = true;
}

function openEdit(row: CredentialRef) {
  editing.value = true;
  formModel.value = { ...row };
  modalVisible.value = true;
}

async function handleOk() {
  const payload = { credential: formModel.value };
  if (editing.value) {
    await updateCredential(payload);
    message.success('更新成功');
  } else {
    await createCredential(payload);
    message.success('创建成功');
  }
  modalVisible.value = false;
  await tableApi.query();
}

async function handleDelete(row: CredentialRef) {
  Modal.confirm({
    title: '确认删除该凭证？',
    onOk: async () => {
      if (!row.id) return;
      await deleteCredential(row.id);
      message.success('删除成功');
      await tableApi.query();
    },
  });
}
</script>

<template>
  <Page :auto-content-height="true">
    <template #header>
      <a-button type="primary" @click="openCreate">新建凭证</a-button>
    </template>
    <BasicTable>
      <template #action="{ row }">
        <a-space>
          <a-button type="link" @click="openEdit(row)">编辑</a-button>
          <a-button type="link" danger @click="handleDelete(row)">删除</a-button>
        </a-space>
      </template>
    </BasicTable>
  </Page>

  <a-modal v-model:open="modalVisible" :title="editing ? '编辑凭证' : '新建凭证'" @ok="handleOk">
    <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-form-item label="提供者">
        <a-input v-model:value="formModel.provider" placeholder="如: vault/secret" />
      </a-form-item>
      <a-form-item label="引用">
        <a-input v-model:value="formModel.ref" placeholder="如: path/to/secret" />
      </a-form-item>
      <a-form-item label="作用域">
        <a-input v-model:value="formModel.scope" placeholder="如: tenant/global" />
      </a-form-item>
      <a-form-item label="标签(JSON)">
        <a-input-textarea
          v-model:value="(formModel.tags as any) as unknown as string"
          :rows="4"
          placeholder='{"env":"prod"}'
          @change="(e:any)=>{ try { formModel.tags = JSON.parse(e?.target?.value || '{}') } catch {} }"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

