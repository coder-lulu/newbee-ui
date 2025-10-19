<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { Recordable } from '@vben/types';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { OauthProviderInfo } from '#/api/system/oauth/model';

import { ref } from 'vue';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';
import { $t } from '@vben/locales';

import { Button, Divider, Modal, Popconfirm, Space, Tag, message } from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';

// 使用composables
import { useOauthProviders, useOauthUtils } from './composables/useOauth';

import { columns, querySchema } from './data';
import OauthProviderDrawer from './oauth-provider-drawer.vue';

// 导入组件
import ProviderCard from './components/provider-card.vue';
import StatusIndicator from './components/status-indicator.vue';
import StatisticsWidget from './components/statistics-widget.vue';
import TestConnection from './components/test-connection.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  // 日期选择格式化
  fieldMappingTime: [
    [
      'createTime',
      ['params[beginTime]', 'params[endTime]'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await getOauthProviderList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'id',
  },
  id: 'system-config-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});
const [ConfigDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: OauthProviderDrawer,
});

// 使用OAuth composables
const { deleteProviders, updateProvider, batchToggleStatus } = useOauthProviders();
const { getProviderTypeColor } = useOauthUtils();

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: Recordable<any>) {
  drawerApi.setData({ id: record.id });
  drawerApi.open();
}

async function handleDelete(row: Recordable<any>) {
  const success = await deleteProviders([row.id]);
  if (success) {
    await tableApi.query();
  }
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      const success = await deleteProviders(ids);
      if (success) {
        await tableApi.query();
      }
    },
  });
}

// 切换启用状态
async function handleToggleStatus(record: OauthProviderInfo, enabled: boolean) {
  const success = await updateProvider({ 
    ...record, 
    enabled 
  });
  if (success) {
    await tableApi.query();
  }
}

// 批量启用/禁用
function handleBatchToggle(enabled: boolean) {
  const rows = tableApi.grid.getCheckboxRecords();
  if (rows.length === 0) {
    message.warning('请先选择要操作的记录');
    return;
  }
  
  Modal.confirm({
    title: '批量操作确认',
    content: `确认要${enabled ? '启用' : '禁用'}选中的${rows.length}个提供商吗？`,
    onOk: async () => {
      const success = await batchToggleStatus(rows, enabled);
      if (success) {
        await tableApi.query();
      }
    },
  });
}

// 获取Provider类型标签颜色已在composable中定义
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="OAuth提供商管理">
      <template #toolbar-tools>
        <Space>
          <Button
            :disabled="!vxeCheckboxChecked(tableApi)"
            @click="handleBatchToggle(true)"
            v-access:code="['system:oauth:update']"
          >
            批量启用
          </Button>
          <Button
            :disabled="!vxeCheckboxChecked(tableApi)"
            @click="handleBatchToggle(false)"
            v-access:code="['system:oauth:update']"
          >
            批量禁用
          </Button>
          <Divider type="vertical" />
          <Button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            v-access:code="['system:oauth:delete']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </Button>
          <Button
            type="primary"
            v-access:code="['system:oauth:create']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </Button>
        </Space>
      </template>

      <!-- Provider信息列 -->
      <template #provider-info="{ row }">
        <ProviderCard :provider="row" />
      </template>

      <!-- Provider类型列 -->
      <template #provider-type="{ row }">
        <Tag :color="getProviderTypeColor(row.type)">
          {{ row.type || '未知' }}
        </Tag>
      </template>

      <!-- 状态列 -->
      <template #status="{ row }">
        <StatusIndicator
          :enabled="row.enabled"
          :status="row.status"
          @toggle="(enabled) => handleToggleStatus(row, enabled)"
        />
      </template>

      <!-- 统计列 -->
      <template #statistics="{ row }">
        <StatisticsWidget
          :success-count="row.successCount"
          :failure-count="row.failureCount"
        />
      </template>

      <!-- 操作列 -->
      <template #action="{ row }">
        <Space>
          <TestConnection 
            :provider-id="row.id"
            v-access:code="['system:oauth:test']"
          />
          <Divider type="vertical" />
          <ghost-button
            v-access:code="['system:oauth:update']"
            @click.stop="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </ghost-button>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <ghost-button
              danger
              v-access:code="['system:oauth:delete']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <ConfigDrawer @reload="tableApi.query()" />
  </Page>
</template>
