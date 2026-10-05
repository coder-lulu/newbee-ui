<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { VbenFormProps } from '@vben/common-ui';

import { h, onMounted, onUnmounted, ref, watch } from 'vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import type { Script } from '#/api/ops/script/script-model';
import { scriptList, scriptRemove } from '#/api/ops/script/script';
import { getVxePopupContainer } from '@vben/utils';

import {
  DeleteOutlined,
  HistoryOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import { message, Modal, Popconfirm, Tag } from 'ant-design-vue';
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { emitter } from '../mitt';
import {
  getRiskLevelColor,
  getScriptTypeColor,
  scriptColumns,
  scriptQuerySchema,
} from './data';
import ScriptDrawer from './script-drawer.vue';
import VersionListModal from '../version/version-list-modal.vue';

// 风险级别映射函数
function getRiskLevelLabel(level: string) {
  const map: Record<string, string> = {
    low: 'ops.script.riskLevelLow',
    medium: 'ops.script.riskLevelMedium',
    high: 'ops.script.riskLevelHigh',
    critical: 'ops.script.riskLevelCritical',
  };
  return $t(map[level] || map.low);
}

const currentCategoryId = ref<number | undefined>(undefined);

// 表单配置
const formOptions: VbenFormProps = {
  schema: scriptQuerySchema,
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

// 表格配置 - 参照CI types实现
const gridOptions: VxeGridProps = {
  id: 'ops-script-index',
  columns: scriptColumns,
  height: 'auto',
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        // 直接在query函数内读取currentCategoryId，与CI types一致
        if (currentCategoryId.value) {
          formValues.categoryId = currentCategoryId.value;
        }

        return scriptList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  pagerConfig: {},
  rowConfig: { keyField: 'id', isHover: true },
  checkboxConfig: { reserve: true, highlight: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

// 加载脚本列表 - 参照CI types的loadCiModels
async function loadScripts() {
  try {
    // 检查grid是否已初始化
    if (gridApi.grid && gridApi.grid.commitProxy) {
      await gridApi.query();
    }
  } catch (error) {
    console.error('加载脚本列表失败:', error);
  }
}

const [ScriptEditDrawer, scriptEditDrawerApi] = useVbenDrawer({
  connectedComponent: ScriptDrawer,
});

const [VersionModal, versionModalApi] = useVbenModal({
  connectedComponent: VersionListModal,
});

async function handleDelete(row: Script) {
  if (!row.id) return;

  try {
    await scriptRemove({ ids: [row.id!] });
    message.success($t('common.deleteSuccess'));
    emitter.emit('scriptUpdated');
  } catch (error: any) {
    message.error(error.message || $t('common.deleteFailed'));
  }
}

async function handleBatchDelete() {
  const selected = gridApi.grid.getCheckboxRecords();
  if (selected.length === 0) {
    message.warning($t('common.selectAtLeastOne'));
    return;
  }

  Modal.confirm({
    content: $t('common.confirmBatchDelete'),
    okText: $t('common.ok'),
    okType: 'danger',
    onOk: async () => {
      try {
        const ids = selected.map((item: any) => item.id!).filter(Boolean);
        await scriptRemove({ ids });
        message.success($t('common.deleteSuccess'));
        emitter.emit('scriptUpdated');
      } catch (error: any) {
        message.error(error.message || $t('common.deleteFailed'));
      }
    },
    title: $t('common.tip'),
  });
}

function handleAdd() {
  scriptEditDrawerApi.setData({
    scriptId: undefined,
    categoryId: currentCategoryId.value,
  });
  scriptEditDrawerApi.open();
}

function handleEdit(_row: Script) {
  if (_row?.id) {
    scriptEditDrawerApi.setData({ scriptId: _row.id });
  }
  scriptEditDrawerApi.open();
}

function handleViewVersions(row: Script) {
  if (!row.id) return;

  versionModalApi.setData({ scriptId: row.id });
  versionModalApi.open();
}

// 监听分类选择变化
watch(
  () => currentCategoryId.value,
  async () => {
    await loadScripts();
  },
);

onMounted(() => {
  // 监听分类选择事件
  emitter.on('categorySelected', (categoryId) => {
    currentCategoryId.value = categoryId;
  });

  // 监听脚本更新事件
  emitter.on('scriptUpdated', () => {
    loadScripts();
  });

  // 首次加载数据
  loadScripts();
});

onUnmounted(() => {
  emitter.off('categorySelected');
  emitter.off('scriptUpdated');
});
</script>

<template>
  <div class="h-full flex flex-col">
    <Grid class="flex-1" :table-title="$t('ops.script.title')">
      <template #toolbar-tools>
        <div class="flex gap-2">
          <a-button
            danger
            type="primary"
            @click="handleBatchDelete"
          >
            {{ $t('common.batchDelete') }}
          </a-button>
          <a-button type="primary" @click="handleAdd">
            {{ $t('common.add') }}
          </a-button>
        </div>
      </template>

      <template #scriptType="{ row }">
        <Tag :color="getScriptTypeColor(row.scriptType)">
          {{ row.scriptType }}
        </Tag>
      </template>

      <template #riskLevel="{ row }">
        <Tag :color="getRiskLevelColor(row.riskLevel)">
          {{ getRiskLevelLabel(row.riskLevel) }}
        </Tag>
      </template>

      <template #action="{ row }">
        <ghost-button size="small" type="link" @click="handleEdit(row)">
          {{ $t('common.edit') }}
        </ghost-button>
        <ghost-button
          size="small"
          type="link"
          @click="handleViewVersions(row)"
        >
          {{ $t('ops.script.versions') }}
        </ghost-button>
        <Popconfirm
          :get-popup-container="getVxePopupContainer"
          placement="left"
          :title="$t('common.confirmDelete')"
          @confirm="handleDelete(row)"
        >
          <ghost-button
            danger
            size="small"
            type="link"
            @click.stop=""
          >
            {{ $t('common.delete') }}
          </ghost-button>
        </Popconfirm>
      </template>
    </Grid>

    <ScriptEditDrawer />
    <VersionModal />
  </div>
</template>
