<script lang="ts">
import { defineComponent, ref } from 'vue';

import { Tabs } from 'ant-design-vue';

import AttributeProperties from './components/AttributeProperties.vue';
import DiscoveryTabs from './components/DiscoveryTabs.vue';
import ModelRelations from './components/ModelRelations.vue';

export default defineComponent({
  name: 'TabContent',
  components: {
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    AttributeProperties,
    ModelRelations,
    DiscoveryTabs,
  },
  props: {
    typeId: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const activeKey = ref('properties');

    const handleTabChange = (key: any) => {
      activeKey.value = key;
    };

    return {
      activeKey,
      handleTabChange,
    };
  },
});
</script>

<template>
  <div class="tab-content">
    <ATabs v-model="activeKey" @change="handleTabChange">
      <ATabPane key="properties" tab="模型属性">
        <AttributeProperties :type-id="typeId" />
      </ATabPane>
      <ATabPane key="relations" tab="模型关系">
        <ModelRelations :type-id="typeId" />
      </ATabPane>
      <ATabPane key="discovery" tab="自动发现">
        <DiscoveryTabs :type-id="typeId" />
      </ATabPane>
      <ATabPane key="trigger" tab="触发器">
        <div class="empty-placeholder">触发器功能开发中...</div>
      </ATabPane>
      <ATabPane key="permission" tab="权限配置">
        <div class="empty-placeholder">权限配置功能开发中...</div>
      </ATabPane>
    </ATabs>
  </div>
</template>

<style scoped>
.tab-content {
  width: 100%;
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
}

.empty-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  font-size: 16px;
  color: #999;
  background-color: #f7f9fc;
  border-radius: 4px;
}
</style>
