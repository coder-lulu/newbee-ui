<script lang="ts" setup>
import { computed, h, nextTick, ref } from 'vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import type { ScriptVersion } from '#/api/ops/script/script-version-model';
import { scriptVersionList } from '#/api/ops/script/script-version';

import { EyeOutlined, SwapOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { versionColumns } from './data';
import VersionCompareModal from './version-compare-modal.vue';

const scriptId = ref<number | undefined>(undefined);

// 表格配置 - 参照主脚本列表的配置方式
const gridOptions = {
  id: 'ops-script-version-list',
  loading: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        // 如果没有scriptId，返回空数据
        if (!scriptId.value) {
          return {
            data: [],
            total: 0,
          };
        }

        const resp = await scriptVersionList({
          page: page.currentPage,
          pageSize: page.pageSize,
          scriptId: scriptId.value,
        });

        return {
          data: resp.data,
          total: resp.total,
        };
      },
    },
    autoLoad: false,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  columns: versionColumns,
  gridOptions,
});

const [CompareModal, compareModalApi] = useVbenModal({
  connectedComponent: VersionCompareModal,
});

// 计算选中的版本数量
const checkedCount = computed(() => {
  try {
    return gridApi?.grid?.getCheckboxRecords?.()?.length ?? 0;
  } catch {
    return 0;
  }
});

function handleViewContent(row: ScriptVersion) {
  // Show content in a simple modal
  Modal.info({
    content: h('pre', { class: 'max-h-[500px] overflow-auto' }, row.content),
    okText: $t('common.close'),
    title: $t('ops.script.version.viewContent'),
    width: 800,
  });
}

function handleCompareVersions() {
  const checked = gridApi.grid.getCheckboxRecords();
  if (checked.length !== 2) {
    message.warning($t('ops.script.version.selectTwoVersions'));
    return;
  }

  // 传递选中的两个版本到对比模态框
  compareModalApi.setData({
    leftVersion: checked[0],
    rightVersion: checked[1],
  });
  compareModalApi.open();
}

const [BasicModal, modalApi] = useVbenModal({
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData() as { scriptId?: number };
      scriptId.value = data?.scriptId;
      if (scriptId.value) {
        // 等待 Grid 组件完全挂载后再查询
        await nextTick();
        // 添加安全检查
        if (gridApi?.grid?.commitProxy) {
          gridApi.query();
        } else {
          console.warn('[Version List] Grid not ready, retrying...');
          // 如果还没准备好，再等待一下
          setTimeout(() => {
            if (gridApi?.grid?.commitProxy) {
              gridApi.query();
            } else {
              console.error('[Version List] Grid failed to initialize');
            }
          }, 100);
        }
      }
    } else {
      scriptId.value = undefined;
    }
  },
});
</script>

<template>
  <BasicModal :title="$t('ops.script.versions')" class="w-[800px]">
    <div class="h-[600px] flex flex-col">
      <div class="mb-2 flex items-center justify-end">
        <a-button
          :disabled="checkedCount !== 2"
          :icon="h(SwapOutlined)"
          size="small"
          type="primary"
          @click="handleCompareVersions"
        >
          {{ $t('ops.script.version.compare') }}
        </a-button>
      </div>

      <Grid
        :checkbox-config="{ highlight: true }"
        class="flex-1"
      >
        <template #action="{ row }">
          <a-button
            :icon="h(EyeOutlined)"
            size="small"
            type="link"
            @click="handleViewContent(row)"
          >
            {{ $t('ops.script.version.viewContent') }}
          </a-button>
        </template>
      </Grid>

      <CompareModal />
    </div>
  </BasicModal>
</template>
