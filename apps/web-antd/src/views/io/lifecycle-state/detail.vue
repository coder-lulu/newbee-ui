<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>
        <a-space>
          <span>生命周期状态详情</span>
          <a-tag :color="getStateColor(data?.stateType || '')">
            {{ getStateText(data?.stateType || '') }}
          </a-tag>
          <a-tag v-if="data?.isCurrent" color="blue">当前状态</a-tag>
          <a-tag v-if="data?.isFinal" color="success">最终状态</a-tag>
        </a-space>
      </template>

      <a-descriptions :column="2" bordered :label-style="{ width: '160px' }">
        <a-descriptions-item label="记录ID">{{ data?.id }}</a-descriptions-item>
        <a-descriptions-item label="状态ID">{{ data?.stateId }}</a-descriptions-item>
        <a-descriptions-item label="CI ID">{{ data?.ciId }}</a-descriptions-item>
        <a-descriptions-item label="CI类型ID">{{ data?.ciTypeId }}</a-descriptions-item>
        <a-descriptions-item label="状态名称">{{ data?.stateName }}</a-descriptions-item>
        <a-descriptions-item label="状态类型">
          <a-tag :color="getStateColor(data?.stateType || '')">
            {{ getStateText(data?.stateType || '') }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="上一个状态">
          <a-tag v-if="data?.previousState" color="default">
            {{ getStateText(data.previousState) }}
          </a-tag>
          <span v-else>—</span>
        </a-descriptions-item>
        <a-descriptions-item label="操作ID">{{ data?.operationId || '—' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider orientation="left">时间信息</a-divider>
      <a-descriptions :column="2" bordered :label-style="{ width: '160px' }">
        <a-descriptions-item label="进入时间">
          {{ formatDate(data?.enteredAt) }}
        </a-descriptions-item>
        <a-descriptions-item label="退出时间">
          {{ data?.exitedAt ? formatDate(data.exitedAt) : '—' }}
        </a-descriptions-item>
        <a-descriptions-item label="预期退出时间">
          {{ data?.expectedExitAt ? formatDate(data.expectedExitAt) : '—' }}
        </a-descriptions-item>
        <a-descriptions-item label="停留时长">
          <span class="text-lg font-semibold">{{ formatDuration(data?.durationSeconds) }}</span>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider orientation="left">触发信息</a-divider>
      <a-descriptions :column="2" bordered :label-style="{ width: '160px' }">
        <a-descriptions-item label="触发方式">
          <a-tag>{{ data?.triggerType }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="触发人">
          {{ data?.triggeredByName || '—' }}
        </a-descriptions-item>
        <a-descriptions-item label="触发人ID">
          {{ data?.triggeredBy || '—' }}
        </a-descriptions-item>
      </a-descriptions>

      <a-divider orientation="left">状态标记</a-divider>
      <a-descriptions :column="2" bordered :label-style="{ width: '160px' }">
        <a-descriptions-item label="是否当前状态">
          <a-tag :color="data?.isCurrent ? 'blue' : 'default'">
            {{ data?.isCurrent ? '是' : '否' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="是否最终状态">
          <a-tag :color="data?.isFinal ? 'success' : 'default'">
            {{ data?.isFinal ? '是' : '否' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="是否超时">
          <a-tag :color="data?.isTimeout ? 'error' : 'success'">
            {{ data?.isTimeout ? '是' : '否' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="是否有错误">
          <a-tag :color="data?.hasError ? 'error' : 'success'">
            {{ data?.hasError ? '是' : '否' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="可以重试">
          <a-tag :color="data?.canRetry ? 'success' : 'default'">
            {{ data?.canRetry ? '是' : '否' }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>

      <!-- 错误信息 -->
      <a-divider orientation="left" v-if="data?.hasError">错误信息</a-divider>
      <a-alert
        v-if="data?.hasError"
        type="error"
        show-icon
        :message="data?.errorMessage || '未知错误'"
        class="mb-4"
      />

      <!-- 重试信息 -->
      <a-divider orientation="left" v-if="data?.canRetry">重试信息</a-divider>
      <a-descriptions :column="2" bordered :label-style="{ width: '160px' }" v-if="data?.canRetry">
        <a-descriptions-item label="重试次数">
          {{ data?.retryCount || 0 }}
        </a-descriptions-item>
        <a-descriptions-item label="最大重试次数">
          {{ data?.maxRetryCount || 0 }}
        </a-descriptions-item>
        <a-descriptions-item label="最后重试时间" :span="2">
          {{ data?.lastRetryAt ? formatDate(data.lastRetryAt) : '—' }}
        </a-descriptions-item>
      </a-descriptions>

      <!-- 状态数据 -->
      <a-divider orientation="left" v-if="data?.stateData">状态数据</a-divider>
      <a-card size="small" v-if="data?.stateData">
        <pre class="code-block">{{ pretty(data?.stateData) }}</pre>
      </a-card>

      <!-- 元数据 -->
      <a-divider orientation="left" v-if="data?.metadata">元数据</a-divider>
      <a-card size="small" v-if="data?.metadata">
        <pre class="code-block">{{ pretty(data?.metadata) }}</pre>
      </a-card>

      <!-- 备注 -->
      <a-divider orientation="left" v-if="data?.comment">备注</a-divider>
      <a-typography-paragraph v-if="data?.comment">
        {{ data?.comment }}
      </a-typography-paragraph>

      <a-divider />
      <a-space>
        <a-button type="primary" @click="viewTimeline">查看时间线</a-button>
        <a-button @click="goList">返回列表</a-button>
      </a-space>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

// TODO: 创建对应的API
// import { getLifecycleStateById } from '#/api/io/lifecycle-state';
// import type { LifecycleStateInfo } from '#/api/io/model';

interface LifecycleStateInfo {
  id: number;
  stateId: string;
  ciId?: number;
  ciTypeId?: number;
  stateName: string;
  stateType: string;
  previousState?: string;
  enteredAt: string;
  exitedAt?: string;
  expectedExitAt?: string;
  durationSeconds: number;
  triggerType: string;
  triggeredBy?: number;
  triggeredByName?: string;
  operationId?: string;
  isCurrent: boolean;
  isFinal: boolean;
  isTimeout: boolean;
  hasError: boolean;
  errorMessage?: string;
  errorCode?: string;
  canRetry: boolean;
  retryCount?: number;
  maxRetryCount?: number;
  lastRetryAt?: string;
  stateData?: string;
  metadata?: string;
  comment?: string;
}

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const data = ref<LifecycleStateInfo>();

function getStateColor(state: string): string {
  const colors: Record<string, string> = {
    draft: 'default',
    submitted: 'processing',
    validated: 'cyan',
    approved: 'blue',
    executed: 'geekblue',
    completed: 'success',
    cancelled: 'error',
    expired: 'warning',
  };
  return colors[state] || 'default';
}

function getStateText(state: string): string {
  const texts: Record<string, string> = {
    draft: '草稿',
    submitted: '已提交',
    validated: '已验证',
    approved: '已审批',
    executed: '已执行',
    completed: '已完成',
    cancelled: '已取消',
    expired: '已过期',
  };
  return texts[state] || state;
}

function formatDate(date?: string): string {
  if (!date) return '—';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds === 0) return '—';
  const d = dayjs.duration(seconds, 'seconds');
  const days = Math.floor(d.asDays());
  const hours = d.hours();
  const minutes = d.minutes();
  const secs = d.seconds();

  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);
  if (secs > 0 && parts.length < 2) parts.push(`${secs}秒`);

  return parts.join(' ') || '—';
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
  try {
    // TODO: 调用实际API
    // data.value = await getLifecycleStateById(id);
    message.info('API接口待实现');
  } catch (error) {
    message.error('加载失败');
  }
}

function viewTimeline() {
  if (data.value?.ciId) {
    router.push({
      name: 'LifecycleStateTimeline' as any,
      params: { ciId: String(data.value.ciId) },
    });
  } else {
    message.warning('缺少CI ID');
  }
}

function goList() {
  if (router.hasRoute('LifecycleStateList' as any)) {
    router.push({ name: 'LifecycleStateList' as any });
  } else {
    router.back();
  }
}

onMounted(() => {
  refresh();
});
</script>

<style scoped>
.code-block {
  max-height: 400px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.text-lg {
  font-size: 16px;
}

.font-semibold {
  font-weight: 600;
}
</style>
