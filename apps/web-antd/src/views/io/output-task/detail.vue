<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>任务详情</template>
      <a-descriptions :column="2" bordered :label-style="{ width: '160px' }">
        <a-descriptions-item label="ID">{{ data?.id }}</a-descriptions-item>
        <a-descriptions-item label="名称">{{ data?.name }}</a-descriptions-item>
        <a-descriptions-item label="类型">{{ data?.outputType }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ data?.taskStatus }}</a-descriptions-item>
        <a-descriptions-item label="优先级">{{ data?.priority }}</a-descriptions-item>
        <a-descriptions-item label="超时(秒)">{{ data?.timeoutSeconds }}</a-descriptions-item>
        <a-descriptions-item label="进度" :span="2">
          <a-progress :percent="data?.progressPercent || 0" />
          <div class="mt-2">{{ data?.progressMessage || '—' }}</div>
        </a-descriptions-item>
        <a-descriptions-item label="吞吐/耗时(s)" :span="2">
          {{ data?.throughputRate }} / {{ data?.durationSeconds }}
        </a-descriptions-item>
        <a-descriptions-item label="错误信息" :span="2">{{ data?.errorMessage || '—' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />
      <a-space>
        <a-button @click="goEdit">编辑</a-button>
        <a-button @click="goList">返回列表</a-button>
      </a-space>

      <a-divider />
      <a-row :gutter="16">
        <a-col :span="12">
          <a-card size="small" title="数据源(JSON)"><pre class="code-block">{{ pretty(data?.dataSource) }}</pre></a-card>
        </a-col>
        <a-col :span="12">
          <a-card size="small" title="转换配置(JSON)"><pre class="code-block">{{ pretty(data?.transformConfig) }}</pre></a-card>
        </a-col>
      </a-row>
      <a-row :gutter="16" class="mt-4">
        <a-col :span="24">
          <a-card size="small" title="推送目标(JSON Array)"><pre class="code-block">{{ pretty(data?.pushTargets) }}</pre></a-card>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getOutputTaskById } from '#/api/io/output-task';
import type { OutputTaskInfo } from '#/api/io/model';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const data = ref<OutputTaskInfo>();

function pretty(str?: string) { if (!str) return '—'; try { const obj = typeof str === 'string' ? JSON.parse(str) : str; return JSON.stringify(obj, null, 2); } catch { return str; } }
async function refresh() { try { data.value = await getOutputTaskById(id); } catch {} }
function goEdit() { router.push({ name: 'OutputTaskEdit', params: { id: String(id) } }); }
function goList() { router.push({ name: 'OutputTaskList' }); }

onMounted(refresh);
</script>

<style scoped>
.code-block { max-height: 260px; overflow: auto; background: var(--vben-color-fill-secondary, #fafafa); border-radius: 6px; padding: 12px; }
.mt-4 { margin-top: 16px; }
.mt-2 { margin-top: 8px; }
</style>

