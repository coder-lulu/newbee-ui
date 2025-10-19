<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>监控与指标</template>
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card size="small" title="系统状态" :loading="loading.status">
            <div>{{ statusText }}</div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card size="small" title="健康检查" :loading="loading.health">
            <div>{{ healthText }}</div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card size="small" title="性能报告(摘要)" :loading="loading.performance">
            <pre class="code-block">{{ performanceText }}</pre>
          </a-card>
        </a-col>
      </a-row>

      <a-divider />
      <a-space>
        <a-button @click="refreshAll" :loading="isRefreshing">刷新</a-button>
      </a-space>

      <a-divider />
      <a-card size="small" title="原始 Metrics (可能为 Prometheus 格式)">
        <pre class="code-block metrics">{{ metricsText }}</pre>
      </a-card>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getIoHealth, getIoMetrics, getIoPerformance, getIoStatus } from '#/api/io/monitor';

const loading = { status: ref(false), health: ref(false), performance: ref(false), metrics: ref(false) } as const;
const statusText = ref('—');
const healthText = ref('—');
const performanceText = ref('—');
const metricsText = ref('—');
const isRefreshing = ref(false);

async function refreshStatus() { loading.status.value = true; try { const r = await getIoStatus(); statusText.value = JSON.stringify(r, null, 2); } catch { statusText.value = '未获取到状态'; } finally { loading.status.value = false; } }
async function refreshHealth() { loading.health.value = true; try { const r = await getIoHealth(); healthText.value = JSON.stringify(r, null, 2); } catch { healthText.value = '未获取到健康信息'; } finally { loading.health.value = false; } }
async function refreshPerformance() { loading.performance.value = true; try { const r = await getIoPerformance(); performanceText.value = JSON.stringify(r, null, 2); } catch { performanceText.value = '未获取到性能信息'; } finally { loading.performance.value = false; } }
async function refreshMetrics() { loading.metrics.value = true; try { const r: any = await getIoMetrics(); metricsText.value = typeof r === 'string' ? r : JSON.stringify(r, null, 2); } catch { metricsText.value = '未获取到 metrics'; } finally { loading.metrics.value = false; } }

async function refreshAll() { isRefreshing.value = true; await Promise.allSettled([refreshStatus(), refreshHealth(), refreshPerformance(), refreshMetrics()]); isRefreshing.value = false; }

refreshAll();
</script>

<style scoped>
.code-block { max-height: 320px; overflow: auto; background: var(--vben-color-fill-secondary, #fafafa); border-radius: 6px; padding: 12px; }
.metrics { white-space: pre; }
</style>

