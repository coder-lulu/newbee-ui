<script setup lang="ts">
import { ref } from 'vue';

import { Button, Card, message, Space } from 'ant-design-vue';

import IPModal from './IPModal.vue';

const modalVisible = ref(false);
const showAssetSelector = ref(true);

const openSingleAllocation = () => {
  showAssetSelector.value = true;
  modalVisible.value = true;
};

const openBatchAllocation = () => {
  showAssetSelector.value = false;
  modalVisible.value = true;
};

const handleSuccess = () => {
  message.success('成功');
};
</script>

<template>
  <div class="test">
    <Card title="测试">
      <Space>
        <Button type="primary" @click="openSingleAllocation"> 单个分配 </Button>
        <Button @click="openBatchAllocation"> 批量分配 </Button>
      </Space>
      <p>showAssetSelector: {{ showAssetSelector }}</p>
    </Card>

    <IPModal
      :visible="modalVisible"
      mode="create"
      :show-asset-selector="showAssetSelector"
      @update:visible="(v) => (modalVisible = v)"
      @success="handleSuccess"
    />
  </div>
</template>

<style scoped>
.test {
  padding: 20px;
}
</style>
