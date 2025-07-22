<script setup lang="ts">
import { ref } from 'vue';

import { Button, Card, message, Space, Tag } from 'ant-design-vue';

import IPModal from './IPModal.vue';

// 模态框状态
const modalVisible = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const editRecord = ref<any>(null);
const showAssetSelector = ref(true);

// 打开单个IP分配
const openSingleAllocation = () => {
  modalMode.value = 'create';
  editRecord.value = null;
  showAssetSelector.value = true; // 显示资产选择器
  modalVisible.value = true;
};

// 打开批量IP分配
const openBatchAllocation = () => {
  modalMode.value = 'create';
  editRecord.value = null;
  showAssetSelector.value = false; // 隐藏资产选择器
  modalVisible.value = true;
};

// 处理成功回调
const handleSuccess = () => {
  message.success('IP地址分配成功');
};
</script>

<script lang="ts">
export default {
  name: 'IPAllocationDemo',
};
</script>

<template>
  <div class="ip-allocation-demo">
    <Card title="IP地址分配演示" class="demo-card">
      <!-- 操作按钮 -->
      <div class="action-section">
        <Space size="large">
          <div class="allocation-option">
            <div class="option-title">单个IP分配</div>
            <div class="option-desc">包含资产选择功能</div>
            <Button type="primary" @click="openSingleAllocation">
              分配单个IP
            </Button>
          </div>

          <div class="allocation-option">
            <div class="option-title">批量IP分配</div>
            <div class="option-desc">隐藏资产选择，提高效率</div>
            <Button type="default" @click="openBatchAllocation">
              批量分配IP
            </Button>
          </div>
        </Space>
      </div>

      <!-- 功能说明 -->
      <div class="feature-section">
        <Card size="small" title="功能对比">
          <div class="comparison-table">
            <div class="comparison-row header">
              <div class="comparison-cell">分配模式</div>
              <div class="comparison-cell">资产选择器</div>
              <div class="comparison-cell">使用场景</div>
            </div>
            <div class="comparison-row">
              <div class="comparison-cell">
                <Tag color="blue">单个分配</Tag>
              </div>
              <div class="comparison-cell">
                <Tag color="green">显示</Tag>
              </div>
              <div class="comparison-cell">精确关联特定资产</div>
            </div>
            <div class="comparison-row">
              <div class="comparison-cell">
                <Tag color="orange">批量分配</Tag>
              </div>
              <div class="comparison-cell">
                <Tag color="red">隐藏</Tag>
              </div>
              <div class="comparison-cell">快速批量创建IP</div>
            </div>
          </div>
        </Card>
      </div>
    </Card>

    <!-- IP分配模态框 -->
    <IPModal
      :visible="modalVisible"
      :mode="modalMode"
      :record="editRecord"
      :show-asset-selector="showAssetSelector"
      @update:visible="(value) => (modalVisible = value)"
      @success="handleSuccess"
    />
  </div>
</template>

<style scoped>
.ip-allocation-demo {
  padding: 24px;
}

.demo-card {
  max-width: 800px;
  margin: 0 auto;
}

.action-section {
  padding: 24px;
  margin-bottom: 24px;
  background: #f9f9f9;
  border-radius: 8px;
}

.allocation-option {
  padding: 16px;
  text-align: center;
}

.option-title {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.option-desc {
  margin-bottom: 16px;
  font-size: 14px;
  color: #8c8c8c;
}

.feature-section {
  margin-top: 24px;
}

.comparison-table {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
}

.comparison-row {
  display: flex;
}

.comparison-row.header {
  font-weight: 600;
  background: #fafafa;
}

.comparison-cell {
  flex: 1;
  padding: 12px 16px;
  text-align: center;
  border-right: 1px solid #e8e8e8;
}

.comparison-cell:last-child {
  border-right: none;
}

.comparison-row:not(.header) {
  border-top: 1px solid #e8e8e8;
}

.comparison-row:not(.header):nth-child(even) {
  background: #fafafa;
}
</style>
