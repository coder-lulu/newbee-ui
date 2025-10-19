<script setup lang="ts">
import { ref } from 'vue';

import { Button, Card, message, Space, Tag } from 'ant-design-vue';

import CiSelector from './CiSelector.vue';

// 选择器状态
const selectorVisible = ref(false);
const selectorMultiple = ref(false);
const selectorTitle = ref('选择配置项');
const allowedTypes = ref<number[]>([]);

// 已选择的CI列表
const selectedCis = ref<any[]>([]);

// 打开单选选择器
const openSingleSelector = () => {
  selectorMultiple.value = false;
  selectorTitle.value = '选择一个配置项';
  selectorVisible.value = true;
};

// 打开多选选择器
const openMultipleSelector = () => {
  selectorMultiple.value = true;
  selectorTitle.value = '选择多个配置项';
  selectorVisible.value = true;
};

// 打开限制类型的选择器
const openRestrictedSelector = () => {
  selectorMultiple.value = true;
  selectorTitle.value = '选择服务器或网络设备';
  allowedTypes.value = [1, 2]; // 假设1是服务器，2是网络设备
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
  name: 'CiSelectorExample',
};
</script>

<template>
  <div class="ci-selector-example">
    <Card title="CI选择器使用示例" class="example-card">
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <Space size="middle">
          <Button type="primary" @click="openSingleSelector"> 单选CI </Button>
          <Button type="primary" @click="openMultipleSelector"> 多选CI </Button>
          <Button type="primary" @click="openRestrictedSelector">
            限制类型选择
          </Button>
          <Button v-if="selectedCis.length > 0" danger @click="clearSelection">
            清空选择
          </Button>
        </Space>
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
          <div class="empty-icon">📋</div>
          <div class="empty-text">暂未选择任何配置项</div>
          <div class="empty-desc">点击上方按钮开始选择配置项</div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="usage-info">
        <Card size="small" title="使用说明">
          <ul class="usage-list">
            <li><strong>多选模式：</strong>可以选择多个CI，支持跨类型选择</li>
            <li><strong>限制类型：</strong>可以限制只能选择特定类型的CI</li>
            <li><strong>搜索功能：</strong>支持基础搜索和高级过滤</li>
            <li><strong>分页支持：</strong>大数据量时自动分页显示</li>
          </ul>
        </Card>
      </div>
    </Card>

    <!-- CI选择器组件 -->
    <CiSelector
      :open="selectorVisible"
      :multiple="selectorMultiple"
      :title="selectorTitle"
      :selected-cis="selectedCis"
      :allowed-types="allowedTypes"
      @update:open="(value) => (selectorVisible = value)"
      @confirm="handleSelectorConfirm"
      @cancel="handleSelectorCancel"
    />
  </div>
</template>

<style scoped>
/* 响应式设计 */
@media (max-width: 768px) {
  .ci-selector-example {
    padding: 16px;
  }

  .action-buttons {
    padding: 12px;
  }

  .selected-list {
    gap: 8px;
  }

  .ci-tag {
    padding: 6px 8px;
  }

  .ci-tag-content {
    gap: 1px;
  }

  .ci-type {
    font-size: 11px;
  }

  .ci-name {
    font-size: 13px;
  }

  .ci-id {
    font-size: 10px;
  }
}

.ci-selector-example {
  padding: 24px;
}

.example-card {
  max-width: 1200px;
  margin: 0 auto;
}

.action-buttons {
  padding: 16px;
  margin-bottom: 24px;
  background: #f9f9f9;
  border-radius: 6px;
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

.usage-info {
  margin-top: 24px;
}

.usage-list {
  padding-left: 20px;
  margin: 0;
}

.usage-list li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.usage-list strong {
  color: #1890ff;
}
</style>
