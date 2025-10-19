<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>任务详情</template>
      <a-descriptions :column="2" bordered :label-style="{ width: '160px' }">
        <a-descriptions-item label="ID">{{ data?.id }}</a-descriptions-item>
        <a-descriptions-item label="名称">{{ data?.name }}</a-descriptions-item>
        <a-descriptions-item label="类型">{{ data?.taskType }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ data?.taskStatus }}</a-descriptions-item>
        <a-descriptions-item label="优先级">{{ data?.priority }}</a-descriptions-item>
        <a-descriptions-item label="超时(秒)">{{ data?.timeoutSeconds }}</a-descriptions-item>
        <a-descriptions-item label="进度" :span="2">
          <a-progress :percent="data?.progressPercent || 0" />
          <div class="mt-2">{{ data?.progressMessage || '—' }}</div>
        </a-descriptions-item>
        <a-descriptions-item label="处理(成功/失败)" :span="2">
          {{ data?.processedRecords }} / {{ data?.successRecords }} / {{ data?.failedRecords }}
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
          <a-card size="small" title="任务配置(JSON)"><pre class="code-block">{{ pretty(data?.taskConfig) }}</pre></a-card>
        </a-col>
        <a-col :span="12">
          <a-card size="small" title="校验配置(JSON)"><pre class="code-block">{{ pretty(data?.validationConfig) }}</pre></a-card>
        </a-col>
      </a-row>
      <a-row :gutter="16" class="mt-4">
        <a-col :span="24">
          <a-card size="small" title="输出目标(JSON Array)"><pre class="code-block">{{ pretty(data?.outputTargets) }}</pre></a-card>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import { getInputTaskById } from '#/api/io/input-task';
import type { InputTaskInfo } from '#/api/io/model';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const data = ref<InputTaskInfo>();

function pretty(str?: string) {
  if (!str) return '—';
  try { const obj = typeof str === 'string' ? JSON.parse(str) : str; return JSON.stringify(obj, null, 2); } catch { return str; }
}

async function refresh() { try { data.value = await getInputTaskById(id); } catch {} }
function safePushByName(name: string, params?: Record<string, any>) {
  if (!router.hasRoute(name as any)) {
    message.warning(`未找到路由 ${name}，请先在菜单中添加或执行「初始化数据库」`);
    return;
  }
  router.push({ name: name as any, params });
}

function goEdit() { safePushByName('InputTaskEdit', { id: String(id) }); }
function goList() {
  // 列表路由也可能尚未注册，做容错处理
  if (router.hasRoute('InputTaskList' as any)) {
    router.push({ name: 'InputTaskList' as any });
  } else {
    // 退回上一页，避免抛错
    router.back();
  }
}

onMounted(refresh);
</script>

<style scoped>
.code-block { max-height: 260px; overflow: auto; background: var(--vben-color-fill-secondary, #fafafa); border-radius: 6px; padding: 12px; }
.mt-4 { margin-top: 16px; }
.mt-2 { margin-top: 8px; }
</style>
