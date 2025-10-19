<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listProfiles, createProfile, updateProfile, type AccessProfile } from '#/api/ops-center/profile';
import { ref } from 'vue';
import { message } from 'ant-design-vue';

const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 80 },
  schema: [
    {
      fieldName: 'ciId',
      label: 'CI ID',
      component: 'Input',
      componentProps: { allowClear: true, placeholder: '如 ci-123' },
    },
    {
      fieldName: 'preferProxy',
      label: '首选代理',
      component: 'Input',
      componentProps: { allowClear: true },
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const columns: VxeGridProps['columns'] = [
  { type: 'seq', width: 60, title: '#' },
  { field: 'ciId', title: 'CI', minWidth: 160 },
  { field: 'credentialRef', title: '凭证引用', minWidth: 200 },
  { field: 'preferProxy', title: '首选代理', minWidth: 160 },
  {
    field: 'capabilities',
    title: '能力',
    minWidth: 180,
    formatter: ({ cellValue }) => (cellValue ? (cellValue as string[]).join(',') : ''),
  },
  { field: 'action', title: '操作', width: 160, slots: { default: 'action' } },
];

const gridOptions: VxeGridProps = {
  id: 'ops-center-profiles',
  columns,
  height: 'auto',
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async () => {
        return listProfiles();
      },
    },
  },
  pagerConfig: { enabled: false },
  rowConfig: { keyField: 'ciId' },
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

const drawerOpen = ref(false);
const editing = ref(false);
const formModel = ref<AccessProfile>({
  ciId: '',
  credentialRef: '',
  preferProxy: '',
  capabilities: [],
  ports: {},
  jumpChain: [],
  tags: {},
});

function openCreate() {
  editing.value = false;
  formModel.value = { ciId: '', credentialRef: '', preferProxy: '', capabilities: [], ports: {}, jumpChain: [], tags: {} };
  drawerOpen.value = true;
}

function openEdit(row: AccessProfile) {
  editing.value = true;
  formModel.value = { ...row } as AccessProfile;
  drawerOpen.value = true;
}

async function handleSubmit() {
  const payload = { accessProfile: formModel.value };
  if (!formModel.value.ciId) {
    message.warning('请填写 CI ID');
    return;
  }
  if (editing.value) {
    await updateProfile(payload);
    message.success('更新成功');
  } else {
    await createProfile(payload);
    message.success('创建成功');
  }
  drawerOpen.value = false;
  await tableApi.query();
}
</script>

<template>
  <Page :auto-content-height="true">
    <template #header>
      <a-button type="primary" @click="openCreate">新建访问配置</a-button>
    </template>
    <BasicTable>
      <template #action="{ row }">
        <a-button type="link" @click="openEdit(row)">编辑</a-button>
      </template>
    </BasicTable>
  </Page>

  <a-drawer v-model:open="drawerOpen" :title="editing ? '编辑访问配置' : '新建访问配置'" width="520">
    <a-form layout="vertical">
      <a-form-item label="CI ID" required>
        <a-input v-model:value="formModel.ciId" placeholder="ci-123" :disabled="editing" />
      </a-form-item>
      <a-form-item label="凭证引用">
        <a-input v-model:value="(formModel.credentialRef as any)" placeholder="如: vault:path/to/secret" />
      </a-form-item>
      <a-form-item label="首选代理">
        <a-input v-model:value="(formModel.preferProxy as any)" placeholder="proxy-1" />
      </a-form-item>
      <a-form-item label="能力(逗号分隔)">
        <a-input
          :value="(formModel.capabilities || []).join(',')"
          @change="(e:any)=>{ formModel.capabilities = (e?.target?.value || '').split(',').map((s:string)=>s.trim()).filter(Boolean) }"
        />
      </a-form-item>
      <a-form-item label="跳转链(逗号分隔)">
        <a-input
          :value="(formModel.jumpChain || []).join(',')"
          @change="(e:any)=>{ formModel.jumpChain = (e?.target?.value || '').split(',').map((s:string)=>s.trim()).filter(Boolean) }"
        />
      </a-form-item>
      <a-form-item label="端口映射(JSON)">
        <a-input-textarea
          :value="JSON.stringify(formModel.ports || {}, null, 2)"
          :rows="4"
          placeholder='{"ssh":22,"rdp":3389}'
          @change="(e:any)=>{ try { formModel.ports = JSON.parse(e?.target?.value || '{}') } catch {} }"
        />
      </a-form-item>
      <a-form-item label="标签(JSON)">
        <a-input-textarea
          :value="JSON.stringify(formModel.tags || {}, null, 2)"
          :rows="4"
          placeholder='{"env":"prod"}'
          @change="(e:any)=>{ try { formModel.tags = JSON.parse(e?.target?.value || '{}') } catch {} }"
        />
      </a-form-item>
      <div class="mt-2 text-right">
        <a-space>
          <a-button @click="drawerOpen=false">取消</a-button>
          <a-button type="primary" @click="handleSubmit">保存</a-button>
        </a-space>
      </div>
    </a-form>
  </a-drawer>
</template>
