<template>
  <a-tag :color="operationConfig[operationType]?.color || 'default'">
    {{ operationConfig[operationType]?.label || operationType }}
  </a-tag>
</template>

<script setup lang="ts">
import { Tag as ATag } from 'ant-design-vue';

interface Props {
  operationType: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
}

defineProps<Props>();

const operationConfig = {
  CREATE: { label: '创建', color: 'success' },
  READ: { label: '查看', color: 'processing' },
  UPDATE: { label: '更新', color: 'warning' },
  DELETE: { label: '删除', color: 'error' },
};
</script>