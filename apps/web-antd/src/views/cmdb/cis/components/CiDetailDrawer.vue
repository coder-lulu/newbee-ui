<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { SettingOutlined } from '@ant-design/icons-vue';
import { Drawer, Tabs } from 'ant-design-vue';

// @ts-ignore
import CiAttributesTab from './CiAttributesTab.vue';
import CiTopologyTab from './CiTopologyTab.vue';

interface Props {
  open: boolean;
  ciId?: number;
  typeId?: number;
  typeName?: string;
  stackSize?: number;
}

interface Emits {
  (e: 'update:open', value: boolean): void;
  (e: 'view-ci', payload: { ciId: number; typeId?: number }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 当前激活的Tab
const activeTab = ref('attributes');

// 抽屉标题
const drawerTitle = computed(() => {
  const typeName = props.typeName || 'CI';
  return `${typeName} 详情`;
});

// Tab配置
const tabItems = [
  {
    key: 'attributes',
    label: '资产详情',
  },
  {
    key: 'relations',
    label: '关联关系',
    disabled: false, // 已实现拓扑显示
  },
  {
    key: 'history',
    label: '变更历史',
    disabled: true, // 暂未实现
  },
];

// 关闭抽屉
const handleClose = () => {
  emit('update:open', false);
  // 重置Tab到默认页面
  activeTab.value = 'attributes';
};

// 处理Tab切换
const handleTabChange = (key: any) => {
  activeTab.value = String(key);
};

const handleViewRelatedCi = (payload: { ciId: number; typeId?: number }) => {
  emit('view-ci', payload);
};

// 监听抽屉打开状态
watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      // 抽屉打开时重置到属性页面
      activeTab.value = 'attributes';
    }
  },
);
</script>

<script lang="ts">
export default {
  name: 'CiDetailDrawer',
};
</script>

<template>
  <Drawer
    :open="open"
    :title="drawerTitle"
    width="80%"
    placement="right"
    :closable="true"
    :class="['ci-detail-drawer', { 'has-stack': (props.stackSize ?? 1) > 1 }]"
    @close="handleClose"
  >
    <div class="ci-detail-content">
      <!-- Tab内容区域 -->
      <div class="ci-detail-tabs">
        <Tabs
          :active-key="activeTab"
          @change="handleTabChange"
          class="detail-tabs"
        >
          <Tabs.TabPane
            v-for="tab in tabItems"
            :key="tab.key"
            :tab="tab.label"
            :disabled="tab.disabled"
          >
            <!-- 属性信息Tab -->
            <div v-if="tab.key === 'attributes'" class="tab-content">
              <CiAttributesTab
                :ci-id="ciId"
                :type-id="typeId"
                :type-name="typeName"
                :visible="activeTab === 'attributes' && open"
                @view-ci="handleViewRelatedCi"
              />
            </div>

            <!-- 关联关系Tab -->
            <div v-else-if="tab.key === 'relations'" class="tab-content">
              <CiTopologyTab
                :ci-id="ciId"
                :type-id="typeId"
                :type-name="typeName"
                :visible="activeTab === 'relations' && open"
                @view-ci="handleViewRelatedCi"
              />
            </div>

            <!-- 变更历史Tab（占位） -->
            <div v-else-if="tab.key === 'history'" class="tab-content">
              <div class="placeholder-content">
                <SettingOutlined class="placeholder-icon" />
                <p class="placeholder-text">变更历史功能开发中...</p>
              </div>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  </Drawer>
</template>

<style>
/* 响应式设计 */
@media (max-width: 768px) {
  .ci-detail-drawer .ant-drawer {
    width: 100% !important;
  }

  .tab-content {
    padding: 8px 0;
  }
}

.ci-detail-drawer .ant-drawer-body {
  padding: 8px 16px 16px !important;
  background: #fff !important;
}

.ci-detail-content {
  width: 100%;
  height: 100%;
}

/* Tab区域 */
.ci-detail-tabs {
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 4px;
}

.ci-detail-drawer.has-stack .ant-drawer-content {
  border-left: 6px solid rgba(59, 130, 246, 0.35);
  box-shadow: -12px 0 24px rgba(37, 99, 235, 0.12);
}

.detail-tabs {
  height: 100%;
}

.detail-tabs .ant-tabs-content-holder {
  height: calc(100% - 46px);
}

.detail-tabs .ant-tabs-tabpane {
  height: 100%;
  overflow-y: auto;
}

.tab-content {
  height: 100%;
  padding: 0;
}

/* 占位内容样式 */
.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #8c8c8c;
}

.placeholder-icon {
  margin-bottom: 16px;
  font-size: 48px;
  color: #d9d9d9;
}

.placeholder-text {
  margin: 0;
  font-size: 16px;
}

/* 抽屉样式 - 使用全局样式确保生效 */
</style>
