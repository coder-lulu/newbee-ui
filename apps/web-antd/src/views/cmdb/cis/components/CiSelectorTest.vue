<script setup lang="ts">
import { ref } from 'vue';

import { Button, Card, message, Space, Tag } from 'ant-design-vue';

import CiSelector from './CiSelector.vue';

// 选择器状态
const selectorVisible = ref(false);
const selectedCis = ref<any[]>([]);

// 打开选择器
const openSelector = () => {
  selectorVisible.value = true;
};

// 处理选择确认
const handleSelectorConfirm = (cis: any[]) => {
  selectedCis.value = cis;
  message.success(`已选择 ${cis.length} 个配置项`);
  console.log('选择的CI:', cis);
};

// 处理选择取消
const handleSelectorCancel = () => {
  message.info('已取消选择');
};

// 移除选中的CI
const removeSelectedCi = (ciId: number, typeId: number) => {
  selectedCis.value = selectedCis.value.filter(
    (ci) => !(ci.id === ciId && ci.typeId === typeId),
  );
};

// 清空选择
const clearSelection = () => {
  selectedCis.value = [];
  message.success('已清空选择');
};
</script>

<script lang="ts">
export default {
  name: 'CiSelectorTest',
};
</script>

<template>
  <div class="ci-selector-test">
    <Card title="CiSelector 修复测试" class="test-card">
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <Space size="middle">
          <Button type="primary" @click="openSelector">打开资产选择器</Button>
          <Button v-if="selectedCis.length > 0" danger @click="clearSelection">
            清空选择
          </Button>
        </Space>
      </div>

      <!-- 测试说明 -->
      <div class="test-info">
        <Card size="small" title="测试要点">
          <ul>
            <li>
              <strong>CI类型加载：</strong>检查左侧是否正确显示CI类型列表（交换机、虚拟机、物理机）
            </li>
            <li>
              <strong>中文显示：</strong>确认显示的是中文名称而不是英文name
            </li>
            <li>
              <strong>数据结构：</strong>验证API返回的 {total, data}
              结构是否正确处理
            </li>
            <li><strong>选择功能：</strong>测试选择CI项是否正常工作</li>
          </ul>
        </Card>
      </div>

      <!-- 已选择的CI展示 -->
      <div v-if="selectedCis.length > 0" class="selected-section">
        <div class="section-title">
          已选择的配置项 ({{ selectedCis.length }})
        </div>
        <div class="selected-list">
          <Tag
            v-for="ci in selectedCis"
            :key="`${ci.typeId}-${ci.id}`"
            closable
            class="ci-tag"
            @close="removeSelectedCi(ci.id, ci.typeId)"
          >
            <div class="ci-tag-content">
              <div class="ci-type">{{ ci.typeName }}</div>
              <div class="ci-name">{{ ci.displayName }}</div>
              <div class="ci-id">ID: {{ ci.id }}</div>
            </div>
          </Tag>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-content">
          <div class="empty-icon">🔧</div>
          <div class="empty-text">暂未选择任何配置项</div>
          <div class="empty-desc">点击"打开资产选择器"开始测试</div>
        </div>
      </div>

      <!-- 调试信息 -->
      <div class="debug-info">
        <Card size="small" title="调试信息">
          <pre>{{ JSON.stringify(selectedCis, null, 2) }}</pre>
        </Card>
      </div>
    </Card>

    <!-- CI选择器组件 -->
    <CiSelector
      :open="selectorVisible"
      :multiple="true"
      title="测试资产选择器"
      :selected-cis="selectedCis"
      @update:open="(value) => (selectorVisible = value)"
      @confirm="handleSelectorConfirm"
      @cancel="handleSelectorCancel"
    />
  </div>
</template>

<style scoped>
.ci-selector-test {
  padding: 24px;
}

.test-card {
  max-width: 1200px;
  margin: 0 auto;
}

.action-buttons {
  padding: 16px;
  margin-bottom: 24px;
  background: #f9f9f9;
  border-radius: 6px;
}

.test-info {
  margin-bottom: 24px;
}

.test-info ul {
  padding-left: 20px;
  margin: 0;
}

.test-info li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.test-info strong {
  color: #1890ff;
}

.selected-section {
  margin-bottom: 24px;
}

.section-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.ci-tag {
  padding: 8px 12px;
  margin: 0;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

.ci-tag-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ci-type {
  font-size: 12px;
  font-weight: 600;
  color: #1890ff;
}

.ci-name {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.ci-id {
  font-size: 11px;
  color: #8c8c8c;
}

.empty-state {
  padding: 60px 20px;
  margin-bottom: 24px;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.empty-icon {
  font-size: 48px;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  color: #8c8c8c;
}

.empty-desc {
  font-size: 14px;
  color: #bfbfbf;
}

.debug-info {
  margin-top: 24px;
}

.debug-info pre {
  max-height: 300px;
  padding: 12px;
  overflow-y: auto;
  font-size: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
