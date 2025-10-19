<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Page } from '@vben/common-ui';
import { getTaskStatus, getTaskResult, type TaskStatusResp, type TaskResultResp } from '#/api/ops-center/task';

const route = useRoute();
const taskId = ref<string>('');
const status = ref<TaskStatusResp | null>(null);
const result = ref<TaskResultResp | null>(null);
const loading = ref(false);

async function fetchStatus() {
  if (!taskId.value) return;
  loading.value = true;
  try {
    status.value = await getTaskStatus(taskId.value);
  } finally {
    loading.value = false;
  }
}

async function fetchResult() {
  if (!taskId.value) return;
  loading.value = true;
  try {
    result.value = await getTaskResult(taskId.value);
  } finally {
    loading.value = false;
  }
}

function initFromRoute() {
  const id = (route.params as any)?.taskId || (route.query?.taskId as string) || '';
  if (id && id !== taskId.value) {
    taskId.value = id as string;
    fetchStatus();
    fetchResult();
  }
}

onMounted(initFromRoute);
watch(() => route.fullPath, initFromRoute);
</script>

<template>
  <Page :auto-content-height="false">
    <div class="card p-4">
      <div class="flex items-end gap-3 mb-4">
        <a-input v-model:value="taskId" placeholder="输入 Task ID" style="max-width: 420px" />
        <a-button type="primary" :loading="loading" @click="fetchStatus">刷新状态</a-button>
        <a-button :loading="loading" @click="fetchResult">获取结果</a-button>
      </div>
      <a-descriptions bordered title="任务信息" size="small" :column="1">
        <a-descriptions-item label="Task ID">{{ taskId || '-' }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ status?.status || '-' }}</a-descriptions-item>
      </a-descriptions>

      <div class="mt-4">
        <h4 class="text-base font-semibold mb-2">输出内容</h4>
        <a-textarea
          :value="result?.output || result?.error || ''"
          :rows="14"
          placeholder="结果输出..."
          readonly
        />
      </div>
    </div>
  </Page>
</template>

