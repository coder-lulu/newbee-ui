<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>
        <a-space>
          <span>CI生命周期状态流转时间线</span>
          <a-tag>CI ID: {{ ciId }}</a-tag>
        </a-space>
      </template>

      <!-- 状态流转图（可视化状态机） -->
      <a-alert
        message="状态流转路径"
        description="以下展示该CI的完整生命周期状态流转路径"
        type="info"
        show-icon
        class="mb-6"
      />

      <!-- 状态流转步骤条 -->
      <div class="state-flow-container mb-8" v-if="timelineData.length > 0">
        <a-steps
          progress-dot
          :current="currentStateIndex"
          status="process"
          :items="stepItems"
          class="custom-steps"
        />
      </div>

      <!-- 时间线详情 -->
      <a-timeline v-if="timelineData.length > 0">
        <a-timeline-item
          v-for="(item, index) in timelineData"
          :key="item.id"
          :color="getStateColor(item.stateType)"
        >
          <template #dot>
            <component
              :is="getStateIcon(item.stateType)"
              :style="{
                fontSize: '18px',
                color: item.isCurrent ? '#1890ff' : undefined,
              }"
            />
          </template>

          <a-card
            size="small"
            :class="{ 'current-state-card': item.isCurrent }"
            :hoverable="true"
            @click="goDetail(item.id)"
          >
            <template #title>
              <a-space>
                <a-tag :color="getStateColor(item.stateType)" class="text-base">
                  {{ getStateText(item.stateType) }}
                </a-tag>
                <a-tag v-if="item.isCurrent" color="blue">当前</a-tag>
                <a-tag v-if="item.isFinal" color="success">最终</a-tag>
                <a-badge
                  v-if="item.isTimeout"
                  status="error"
                  text="超时"
                  class="ml-2"
                />
                <a-badge
                  v-if="item.hasError"
                  status="error"
                  text="错误"
                  class="ml-2"
                />
              </a-space>
            </template>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-statistic
                  title="进入时间"
                  :value="formatDate(item.enteredAt)"
                  :value-style="{ fontSize: '14px' }"
                />
              </a-col>
              <a-col :span="12">
                <a-statistic
                  title="退出时间"
                  :value="item.exitedAt ? formatDate(item.exitedAt) : '—'"
                  :value-style="{ fontSize: '14px' }"
                />
              </a-col>
            </a-row>

            <a-divider style="margin: 12px 0" />

            <a-descriptions size="small" :column="2">
              <a-descriptions-item label="停留时长">
                <span class="font-semibold">{{ formatDuration(item.durationSeconds) }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="触发方式">
                <a-tag size="small">{{ item.triggerType }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="触发人">
                {{ item.triggeredByName || '—' }}
              </a-descriptions-item>
              <a-descriptions-item label="操作ID">
                <span class="text-xs">{{ item.operationId || '—' }}</span>
              </a-descriptions-item>
            </a-descriptions>

            <!-- 上一个状态 -->
            <div class="mt-2" v-if="item.previousState">
              <a-typography-text type="secondary">从状态：</a-typography-text>
              <a-tag size="small" color="default">{{ getStateText(item.previousState) }}</a-tag>
              <ArrowRightOutlined class="mx-2" />
              <a-tag size="small" :color="getStateColor(item.stateType)">
                {{ getStateText(item.stateType) }}
              </a-tag>
            </div>

            <!-- 错误信息 -->
            <a-alert
              v-if="item.hasError && item.errorMessage"
              type="error"
              :message="item.errorMessage"
              show-icon
              class="mt-2"
            />

            <!-- 重试信息 -->
            <div class="mt-2" v-if="item.canRetry && item.retryCount > 0">
              <a-space>
                <RetweetOutlined />
                <span>重试: {{ item.retryCount }} / {{ item.maxRetryCount }}</span>
              </a-space>
            </div>
          </a-card>
        </a-timeline-item>
      </a-timeline>

      <a-empty v-else description="暂无状态流转记录" />

      <a-divider />
      <a-space>
        <a-button @click="refresh">刷新</a-button>
        <a-button @click="goList">返回列表</a-button>
      </a-space>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  FileTextOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  RocketOutlined,
  FlagOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  RetweetOutlined,
} from '@ant-design/icons-vue';
import type { StepsProps } from 'ant-design-vue';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

// TODO: 创建对应的API
// import { getLifecycleStateTimeline } from '#/api/io/lifecycle-state';

interface TimelineItem {
  id: number;
  stateId: string;
  stateType: string;
  previousState?: string;
  enteredAt: string;
  exitedAt?: string;
  durationSeconds: number;
  triggerType: string;
  triggeredByName?: string;
  operationId?: string;
  isCurrent: boolean;
  isFinal: boolean;
  isTimeout: boolean;
  hasError: boolean;
  errorMessage?: string;
  canRetry: boolean;
  retryCount: number;
  maxRetryCount: number;
}

const route = useRoute();
const router = useRouter();
const ciId = Number(route.params.ciId || route.query.ciId);
const timelineData = ref<TimelineItem[]>([]);
const loading = ref(false);

const currentStateIndex = computed(() => {
  return timelineData.value.findIndex(item => item.isCurrent);
});

const stepItems = computed<StepsProps['items']>(() => {
  return timelineData.value.map(item => ({
    title: getStateText(item.stateType),
    description: item.exitedAt
      ? `停留${formatDuration(item.durationSeconds)}`
      : '当前状态',
    status: item.isCurrent
      ? 'process'
      : item.hasError
        ? 'error'
        : item.isFinal
          ? 'finish'
          : 'wait',
  }));
});

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

function getStateIcon(state: string) {
  const icons: Record<string, any> = {
    draft: FileTextOutlined,
    submitted: SendOutlined,
    validated: CheckCircleOutlined,
    approved: CheckSquareOutlined,
    executed: RocketOutlined,
    completed: FlagOutlined,
    cancelled: CloseCircleOutlined,
    expired: ClockCircleOutlined,
  };
  return icons[state] || FileTextOutlined;
}

function formatDate(date: string): string {
  return dayjs(date).format('MM-DD HH:mm:ss');
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return '—';
  const d = dayjs.duration(seconds, 'seconds');
  const days = Math.floor(d.asDays());
  const hours = d.hours();
  const minutes = d.minutes();

  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);

  return parts.join(' ') || `${seconds}秒`;
}

async function refresh() {
  loading.value = true;
  try {
    // TODO: 调用实际API
    // timelineData.value = await getLifecycleStateTimeline(ciId);
    message.info('API接口待实现');
  } catch (error) {
    message.error('加载失败');
  } finally {
    loading.value = false;
  }
}

function goDetail(id: number) {
  router.push({ name: 'LifecycleStateDetail' as any, params: { id: String(id) } });
}

function goList() {
  if (router.hasRoute('LifecycleStateList' as any)) {
    router.push({ name: 'LifecycleStateList' as any });
  } else {
    router.back();
  }
}

onMounted(() => {
  if (!ciId) {
    message.error('缺少CI ID参数');
    return;
  }
  refresh();
});
</script>

<style scoped>
.state-flow-container {
  padding: 24px;
  background: linear-gradient(to bottom, #f0f2f5 0%, #ffffff 100%);
  border-radius: 8px;
}

.custom-steps :deep(.ant-steps-item-title) {
  font-weight: 600;
}

.current-state-card {
  border: 2px solid #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.text-base {
  font-size: 14px;
  padding: 4px 12px;
}

.text-xs {
  font-size: 12px;
  font-family: monospace;
}

.font-semibold {
  font-weight: 600;
  color: #1890ff;
}

.ml-2 {
  margin-left: 8px;
}

.mx-2 {
  margin: 0 8px;
}

.mt-2 {
  margin-top: 8px;
}

:deep(.ant-timeline-item-content) {
  margin-left: 28px;
}

:deep(.ant-card-small > .ant-card-head) {
  padding: 8px 12px;
}

:deep(.ant-card-small > .ant-card-body) {
  padding: 12px;
}
</style>
