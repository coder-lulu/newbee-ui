<script setup lang="ts">
import type { IpamSubnet } from '../../../../api/ipam/types';

import { ref, watch } from 'vue';

import { Drawer, Tabs } from 'ant-design-vue';

import { SubnetApi } from '../../../../api/ipam/subnet';
import AllocationHistory from './AllocationHistory.vue';
import IpManagement from './IpManagement.vue';
import SubnetInfo from './SubnetInfo.vue';

interface Props {
  visible: boolean;
  subnetId?: number;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const loading = ref(false);
const subnetDetail = ref<IpamSubnet>();
const activeTab = ref('info');

// 加载网段详情
async function loadSubnetDetail() {
  if (!props.subnetId) return;

  try {
    loading.value = true;
    const response = await SubnetApi.detail({ id: props.subnetId });
    subnetDetail.value = response;
  } catch (error) {
    console.error('加载网段详情失败:', error);
  } finally {
    loading.value = false;
  }
}

// 监听visible变化
watch(
  () => props.visible,
  (visible) => {
    if (visible && props.subnetId) {
      loadSubnetDetail();
      activeTab.value = 'info'; // 重置到第一个Tab
    }
  },
);

// 关闭抽屉
function handleClose() {
  emit('update:visible', false);
}

// 刷新数据
function handleRefresh() {
  loadSubnetDetail();
}
</script>

<script lang="ts">
export default {
  name: 'SubnetDetail',
};
</script>

<template>
  <Drawer
    :open="visible"
    :title="`网段详情 - ${subnetDetail?.name || subnetDetail?.cidr}`"
    :width="1200"
    placement="right"
    @close="handleClose"
  >
    <div v-if="subnetDetail" class="subnet-detail">
      <Tabs
        :active-key="activeTab"
        @change="(key) => (activeTab = key)"
        type="card"
      >
        <!-- 网段详情Tab -->
        <Tabs.TabPane key="info" tab="网段详情">
          <SubnetInfo :subnet="subnetDetail" />
        </Tabs.TabPane>

        <!-- IP地址分配情况Tab -->
        <Tabs.TabPane key="ip-management" tab="IP地址分配情况">
          <IpManagement :subnet-id="props.subnetId" :subnet="subnetDetail" />
        </Tabs.TabPane>

        <!-- 分配记录Tab -->
        <Tabs.TabPane key="allocation-history" tab="分配记录">
          <AllocationHistory :subnet-id="props.subnetId" />
        </Tabs.TabPane>
      </Tabs>
    </div>
  </Drawer>
</template>

<style scoped>
/* 响应式设计 */
@media (max-width: 1400px) {
  :deep(.ip-grid .grid-container) {
    grid-template-columns: repeat(18, 1fr);
  }
}

@media (max-width: 1200px) {
  :deep(.ip-grid .grid-container) {
    grid-template-columns: repeat(15, 1fr);
  }
}

@media (max-width: 1000px) {
  :deep(.ip-grid .grid-container) {
    grid-template-columns: repeat(12, 1fr);
  }
}

@media (max-width: 800px) {
  :deep(.ip-grid .grid-container) {
    grid-template-columns: repeat(10, 1fr);
  }
}

.subnet-detail :deep(.mb-4) {
  margin-bottom: 16px;
}

.subnet-detail :deep(.mt-4) {
  margin-top: 16px;
}

.subnet-detail :deep(.mt-2) {
  margin-top: 8px;
}

.subnet-detail :deep(.mt-1) {
  margin-top: 4px;
}

.subnet-detail :deep(.text-sm) {
  font-size: 12px;
}

.subnet-detail :deep(.text-gray-500) {
  color: #8c8c8c;
}

.subnet-detail {
  height: calc(100vh - 120px);
  overflow: auto;
}

.subnet-detail :deep(.ant-tabs-content-holder) {
  height: calc(100% - 46px);
}

.subnet-detail :deep(.ant-tabs-tabpane) {
  height: 100%;
  overflow: auto;
}
</style>
