<script lang="ts" setup>
import { ref } from 'vue';

import { ApiOutlined, NodeIndexOutlined } from '@ant-design/icons-vue';
import { Tabs } from 'ant-design-vue';

import AttributeDiscoveryNew from './AttributeDiscoveryNew.vue';
import RelationDiscovery from './discovery/RelationDiscovery.vue';

interface Props {
  typeId: number;
}

const props = defineProps<Props>();

const activeTab = ref('attribute');
</script>

<template>
  <div class="discovery-tabs">
    <Tabs v-model:activeKey="activeTab">
      <Tabs.TabPane key="attribute">
        <template #tab>
          <span>
            <ApiOutlined />
            属性自动发现
          </span>
        </template>
        <AttributeDiscoveryNew :type-id="props.typeId" />
      </Tabs.TabPane>

      <Tabs.TabPane key="relation">
        <template #tab>
          <span>
            <NodeIndexOutlined />
            关系自动发现
          </span>
        </template>
        <RelationDiscovery :type-id="props.typeId" />
      </Tabs.TabPane>
    </Tabs>
  </div>
</template>

<style scoped lang="less">
.discovery-tabs {
  :deep(.ant-tabs-content) {
    padding: 0;
  }
}
</style>
