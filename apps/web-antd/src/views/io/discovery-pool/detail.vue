<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>发现池详情</template>
      <a-descriptions :column="2" bordered :label-style="{ width: '160px' }">
        <a-descriptions-item label="ID">{{ data?.id }}</a-descriptions-item>
        <a-descriptions-item label="名称">{{ data?.name }}</a-descriptions-item>
        <a-descriptions-item label="类型">{{ data?.discoveryType }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-badge :status="statusBadge(data?.poolStatus)" :text="data?.poolStatus" />
        </a-descriptions-item>
        <a-descriptions-item label="调度">{{ data?.schedule || '—' }}</a-descriptions-item>
        <a-descriptions-item label="并发限制">{{ data?.concurrentLimit }}</a-descriptions-item>
        <a-descriptions-item label="批处理大小">{{ data?.batchSize }}</a-descriptions-item>
        <a-descriptions-item label="重试(次数/间隔)">
          {{ data?.maxRetry }} / {{ data?.retryInterval }}s
        </a-descriptions-item>
        <a-descriptions-item label="最后执行">{{ formatTime(data?.lastRunAt) || '—' }}</a-descriptions-item>
        <a-descriptions-item label="统计">
          {{ data?.totalRuns }} / {{ data?.successRuns }} / {{ data?.failedRuns }}
        </a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">{{ data?.description || '—' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />
      <a-space>
        <a-button type="primary" @click="refreshStats">刷新统计</a-button>
        <a-button @click="goEdit">编辑</a-button>
        <a-button @click="goList">返回列表</a-button>
      </a-space>

      <a-divider />
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card size="small" title="发现配置(JSON)">
            <pre class="code-block">{{ pretty(data?.discoveryConfig) }}</pre>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card size="small" title="字段映射(JSON)">
            <pre class="code-block">{{ pretty(data?.fieldMapping) }}</pre>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card size="small" title="元数据(JSON)">
            <pre class="code-block">{{ pretty(data?.metadata) }}</pre>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDiscoveryPoolById, getDiscoveryPoolStats } from '#/api/io/discovery-pool';
import type { DiscoveryPoolInfo } from '#/api/io/model';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const data = ref<DiscoveryPoolInfo>();

function statusBadge(status?: string) {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'default';
    case 'error':
      return 'error';
    case 'maintain':
      return 'warning';
    default:
      return 'default';
  }
}

function formatTime(ts?: number | null) {
  if (!ts) return '';
  const d = new Date((ts as number) * 1000);
  return d.toLocaleString();
}

function pretty(str?: string) {
  if (!str) return '—';
  try {
    const obj = typeof str === 'string' ? JSON.parse(str) : str;
    return JSON.stringify(obj, null, 2);
  } catch {
    return str;
  }
}

async function refresh() {
  const res = await getDiscoveryPoolById(id);
  data.value = res;
}

async function refreshStats() {
  try {
    await getDiscoveryPoolStats(id);
    await refresh();
  } catch {}
}

function goEdit() {
  router.push({ name: 'DiscoveryPoolEdit', params: { id: String(id) } });
}

function goList() {
  router.push({ name: 'DiscoveryPoolList' });
}

onMounted(refresh);
</script>

<style scoped>
.code-block {
  max-height: 260px;
  overflow: auto;
  background: var(--vben-color-fill-secondary, #fafafa);
  border-radius: 6px;
  padding: 12px;
}
</style>

