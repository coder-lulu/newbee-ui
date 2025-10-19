<template>
  <div class="flex items-center gap-2">
    <a-badge 
      :status="badgeStatus" 
      :text="statusText"
      class="status-indicator"
    />
    <a-switch
      v-if="showToggle"
      :checked="enabled"
      :loading="loading"
      size="small"
      @change="handleToggle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BadgeProps } from 'ant-design-vue';

interface Props {
  enabled?: boolean;
  status?: 'active' | 'inactive' | 'error';
  showToggle?: boolean;
  loading?: boolean;
}

interface Emits {
  (e: 'toggle', value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  enabled: false,
  status: 'inactive',
  showToggle: true,
  loading: false,
});

const emit = defineEmits<Emits>();

const badgeStatus = computed((): BadgeProps['status'] => {
  if (!props.enabled) return 'default';
  
  switch (props.status) {
    case 'active':
      return 'success';
    case 'error':
      return 'error';
    case 'inactive':
    default:
      return 'warning';
  }
});

const statusText = computed(() => {
  if (!props.enabled) return '已禁用';
  
  switch (props.status) {
    case 'active':
      return '正常';
    case 'error':
      return '异常';
    case 'inactive':
    default:
      return '未知';
  }
});

function handleToggle(checked: boolean) {
  emit('toggle', checked);
}
</script>

<style scoped>
.status-indicator :deep(.ant-badge-status-text) {
  font-size: 12px;
}
</style>