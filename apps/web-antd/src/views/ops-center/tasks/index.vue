<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import { createTask, getTaskStatus, getTaskResult, type CreateTaskReq } from '#/api/ops-center/task';
import { message } from 'ant-design-vue';

const form = ref<CreateTaskReq>({
  name: '',
  ciIds: [],
  executor: 'agent',
  command: { content: '', timeout: 30 },
});

const submitting = ref(false);
const lastTaskId = ref('');
const lastStatus = ref('');
const lastOutput = ref('');
const router = useRouter();

async function handleCreateTask() {
  if (!form.value.name || !form.value.command?.content) {
    message.warning('请输入任务名称与命令内容');
    return;
  }
  submitting.value = true;
  try {
    const resp = await createTask(form.value);
    lastTaskId.value = resp.taskId;
    lastStatus.value = resp.status;
    message.success('任务创建成功');
  } finally {
    submitting.value = false;
  }
}

async function handleRefreshStatus() {
  if (!lastTaskId.value) return;
  const s = await getTaskStatus(lastTaskId.value);
  lastStatus.value = s.status;
}

async function handleFetchResult() {
  if (!lastTaskId.value) return;
  const r = await getTaskResult(lastTaskId.value);
  lastStatus.value = r.status;
  lastOutput.value = r.output || r.error || '';
}

function goDetail() {
  if (!lastTaskId.value) return;
  router.push({ path: '/ops-center/tasks/detail', query: { taskId: lastTaskId.value } });
}
</script>

<template>
  <Page :auto-content-height="false">
    <div class="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <div class="card p-4">
        <h3 class="text-base font-semibold mb-3">创建任务</h3>
        <div class="grid gap-3">
          <a-input v-model:value="form.name" placeholder="任务名称" />
          <a-select v-model:value="form.executor" :options="[{label:'agent',value:'agent'},{label:'ssh',value:'ssh'}]" />
          <a-input v-model:value="(form.ciIds as any)" placeholder="CI ID 列表，逗号分隔" @change="(e:any)=>{ form.ciIds = (e?.target?.value||'').split(',').map((s:string)=>s.trim()).filter(Boolean) }" />
          <a-input.TextArea v-model:value="form.command.content" :rows="6" placeholder="命令内容" />
          <div class="flex items-center gap-2">
            <a-input-number v-model:value="form.command.timeout" :min="1" :max="3600" />
            <span>超时(秒)</span>
          </div>
          <a-button type="primary" :loading="submitting" @click="handleCreateTask">提交</a-button>
        </div>
      </div>
      <div class="card p-4">
        <h3 class="text-base font-semibold mb-3">任务状态与结果</h3>
        <div class="mb-2">Task ID: <span class="font-mono">{{ lastTaskId || '-' }}</span></div>
        <div class="mb-3">状态: <a-tag v-if="lastStatus" color="blue">{{ lastStatus }}</a-tag></div>
        <div class="flex gap-2 mb-3">
          <a-button :disabled="!lastTaskId" @click="handleRefreshStatus">刷新状态</a-button>
          <a-button :disabled="!lastTaskId" @click="handleFetchResult">获取结果</a-button>
          <a-button :disabled="!lastTaskId" type="link" @click="goDetail">查看详情</a-button>
        </div>
        <a-textarea v-model:value="lastOutput" :rows="12" placeholder="结果输出..." />
      </div>
    </div>
  </Page>
</template>
