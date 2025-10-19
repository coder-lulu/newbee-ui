<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { Recordable } from '@vben/types';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { getPopupContainer } from '@vben/utils';

import {
  Modal,
  Popconfirm,
  Space,
  message,
} from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  deleteAuditLog,
  getAuditLogList,
} from '#/api/system/audit-log';

import { columns, querySchema } from './data';
import AuditOperationTag from './components/AuditOperationTag.vue';
import AuditStatusBadge from './components/AuditStatusBadge.vue';
import ResponseTimeIndicator from './components/ResponseTimeIndicator.vue';
import AuditLogDetailDrawer from './components/AuditLogDetailDrawer.vue';

/**
 * 权限控制
 */
const { hasAccessByCodes } = useAccess();

/**
 * 详情抽屉
 */
const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: AuditLogDetailDrawer,
});

/**
 * 表单配置
 */
const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
      size: 'default',
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  // 提交时清除空值
  transformValues: (values: Record<string, any>) => {
    const result: Record<string, any> = {};
    Object.keys(values).forEach((key) => {
      if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
        result[key] = values[key];
      }
    });
    return result;
  },
  // 日期选择格式化
  fieldMappingTime: [
    [
      'createdAt',
      ['params[beginTime]', 'params[endTime]'],
      ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm:ss'],
    ],
  ],
};

/**
 * 表格配置
 */
const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {
    perfect: true,
    pageSize: 20,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await getAuditLogList({
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
  sortConfig: {
    multiple: false,
    defaultSort: { field: 'createdAt', order: 'desc' },
  },
  id: 'system-audit-log-index',
};

/**
 * 表格实例
 */
const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

/**
 * 查看详情
 */
function handleView(row: any) {
  detailDrawerApi.setData(row);
  detailDrawerApi.open();
}

/**
 * 删除单条记录
 */
async function handleDelete(row: Recordable<any>) {
  await deleteAuditLog([row.id]);
  await tableApi.query();
}

/**
 * 批量删除
 */
function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await deleteAuditLog(ids);
      await tableApi.query();
    },
  });
}

/**
 * 导出数据
 */
async function handleExport() {
  const formData = tableApi.formApi.form.values;
  const queryParams = {
    ...formData,
    page: 1,
    pageSize: 10000, // 导出更多数据
  };

  try {
    const result = await getAuditLogList(queryParams);
    const exportData = result.data || [];
    
    // 简单的CSV导出
    const csvContent = [
      ['用户名', '操作类型', '资源类型', '请求方法', '请求路径', '响应状态', '耗时(ms)', 'IP地址', '操作时间'].join(','),
      ...exportData.map((item: any) => [
        item.userName || '',
        item.operationType || '',
        item.resourceType || '',
        item.requestMethod || '',
        item.requestPath || '',
        item.responseStatus || '',
        item.durationMs || '',
        item.ipAddress || '',
        item.createdAt ? new Date(item.createdAt).toLocaleString() : ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `审计日志_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    message.success('导出成功');
  } catch (error) {
    message.error('导出失败');
  }
}

/**
 * 获取请求方法颜色
 */
function getMethodColor(method: string): string {
  const methodColors: Record<string, string> = {
    GET: '#52c41a',
    POST: '#1890ff',
    PUT: '#fa8c16',
    DELETE: '#ff4d4f',
    PATCH: '#722ed1',
  };
  return methodColors[method] || '#666';
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="审计日志">
      <template #toolbar-tools>
        <Space>
          <a-button
            v-if="hasAccessByCodes(['sys:audit-log:export'])"
            @click="handleExport"
          >
            导出
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            v-if="hasAccessByCodes(['sys:audit-log:delete'])"
            @click="handleMultiDelete"
          >
            批量删除
          </a-button>
        </Space>
      </template>

      <!-- 操作类型列 -->
      <template #operationType="{ row }">
        <AuditOperationTag :operation-type="row.operationType" />
      </template>

      <!-- 请求方法列 -->
      <template #requestMethod="{ row }">
        <span :style="{ color: getMethodColor(row.requestMethod) }">
          {{ row.requestMethod }}
        </span>
      </template>

      <!-- 响应状态列 -->
      <template #responseStatus="{ row }">
        <AuditStatusBadge :status="row.responseStatus" />
      </template>

      <!-- 响应时间列 -->
      <template #duration="{ row }">
        <ResponseTimeIndicator :duration="row.durationMs || 0" />
      </template>

      <!-- 操作列 -->
      <template #action="{ row }">
        <Space>
          <ghost-button
            @click.stop="handleView(row)"
          >
            详情
          </ghost-button>
          <Popconfirm
            v-if="hasAccessByCodes(['sys:audit-log:delete'])"
            :get-popup-container="getPopupContainer"
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <ghost-button
              danger
              @click.stop=""
            >
              删除
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>

    <!-- 详情抽屉 -->
    <DetailDrawer class="w-[800px]" @reload="tableApi.query()" />
  </Page>
</template>

<style scoped>
/* 确保页面布局正常 */
.audit-log-page {
  width: 100%;
  height: 100%;
}

/* 移除可能的异常样式 */
:deep(.vxe-table) {
  background: transparent;
}

:deep(.vxe-table .vxe-body--column) {
  background: #fff;
}

/* 修复下拉选择器的显示问题 */
:deep(.ant-select-dropdown) {
  z-index: 9999 !important;
  position: fixed !important;
}

:deep(.ant-picker-dropdown) {
  z-index: 9999 !important;
  position: fixed !important;
}

/* 确保表单下拉框正确显示 */
:deep(.vben-form .ant-select) {
  width: 100%;
}

:deep(.vben-form .ant-select-selector) {
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

/* 修复可能的滚动和定位问题 */
:deep(.ant-select-dropdown .ant-select-item) {
  padding: 5px 12px;
  line-height: 22px;
}

:deep(.ant-select-dropdown .ant-select-item-option-content) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>