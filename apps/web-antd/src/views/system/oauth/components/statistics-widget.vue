<template>
  <div class="statistics-widget flex items-center justify-between">
    <div class="stats-main">
      <div class="stats-numbers flex items-center gap-2">
        <span class="success-count text-green-600 font-medium">
          {{ successCount }}
        </span>
        <span class="separator text-gray-400">/</span>
        <span class="failure-count text-red-500 font-medium">
          {{ failureCount }}
        </span>
      </div>
      <div class="stats-rate text-xs text-gray-500">
        成功率: {{ successRate }}%
      </div>
    </div>
    
    <div class="stats-visual">
      <a-progress 
        :percent="successRate"
        :show-info="false"
        :stroke-width="6"
        :stroke-color="progressColor"
        type="circle" 
        :width="32"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  successCount?: number;
  failureCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  successCount: 0,
  failureCount: 0,
});

const totalCount = computed(() => props.successCount + props.failureCount);

const successRate = computed(() => {
  if (totalCount.value === 0) return 0;
  return Math.round((props.successCount / totalCount.value) * 100);
});

const progressColor = computed(() => {
  const rate = successRate.value;
  if (rate >= 90) return '#52c41a'; // green
  if (rate >= 70) return '#faad14'; // yellow
  return '#ff4d4f'; // red
});
</script>

<style scoped>
.statistics-widget {
  min-width: 100px;
}

.stats-numbers {
  font-size: 14px;
  line-height: 1.2;
}

.stats-rate {
  margin-top: 2px;
  line-height: 1;
}

.success-count {
  font-weight: 600;
}

.failure-count {
  font-weight: 600;
}
</style>