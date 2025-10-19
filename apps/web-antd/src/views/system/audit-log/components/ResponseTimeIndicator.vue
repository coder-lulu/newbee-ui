<template>
  <a-tag :color="timeColor">
    {{ formatDuration(duration) }}
  </a-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Tag as ATag } from 'ant-design-vue';

interface Props {
  duration: number; // 毫秒
}

const props = defineProps<Props>();

const timeColor = computed(() => {
  if (props.duration < 100) return 'green';
  if (props.duration < 500) return 'blue';
  if (props.duration < 1000) return 'orange';
  if (props.duration < 3000) return 'red';
  return 'purple';
});

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
};
</script>