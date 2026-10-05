<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>CI生命周期状态</template>
      <a-form layout="inline" :model="query" @submit.prevent>
        <a-form-item label="CI ID">
          <a-input-number v-model:value="query.ciId" placeholder="输入CI ID" allow-clear style="width: 160px" />
        </a-form-item>
        <a-form-item label="状态类型">
          <a-select v-model:value="query.stateType" allow-clear style="width: 160px">
            <a-select-option value="draft">草稿</a-select-option>
            <a-select-option value="submitted">已提交</a-select-option>
            <a-select-option value="validated">已验证</a-select-option>
            <a-select-option value="approved">已审批</a-select-option>
            <a-select-option value="executed">已执行</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="cancelled">已取消</a-select-option>
            <a-select-option value="expired">已过期</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="触发方式">
          <a-select v-model:value="query.triggerType" allow-clear style="width: 120px">
            <a-select-option value="manual">手动</a-select-option>
            <a-select-option value="auto">自动</a-select-option>
            <a-select-option value="scheduled">定时</a-select-option>
            <a-select-option value="event">事件</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="是否当前">
          <a-select v-model:value="query.isCurrent" allow-clear style="width: 100px">
            <a-select-option :value="true">是</a-select-option>
            <a-select-option :value="false">否</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="超时">
          <a-select v-model:value="query.isTimeout" allow-clear style="width: 100px">
            <a-select-option :value="true">是</a-select-option>
            <a-select-option :value="false">否</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="错误">
          <a-select v-model:value="query.hasError" allow-clear style="width: 100px">
            <a-select-option :value="true">是</a-select-option>
            <a-select-option :value="false">否</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="fetchData">查询</a-button>
            <a-button @click="resetQuery">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table
        class="mt-4"
        row-key="id"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 1600 }"
        @change="onTableChange"
      >
        <a-table-column title="ID" data-index="id" width="80" fixed="left" />
        <a-table-column title="状态ID" data-index="stateId" width="180" />
        <a-table-column title="CI ID" data-index="ciId" width="100" />
        <a-table-column title="状态类型" data-index="stateType" width="120">
          <template #default="{ record }">
            <a-tag :color="getStateColor(record.stateType)">
              {{ getStateText(record.stateType) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="上一状态" data-index="previousState" width="120">
          <template #default="{ record }">
            <a-tag v-if="record.previousState" color="default" size="small">
              {{ getStateText(record.previousState) }}
            </a-tag>
            <span v-else>—</span>
          </template>
        </a-table-column>
        <a-table-column title="触发方式" data-index="triggerType" width="100">
          <template #default="{ record }">
            <a-tag size="small">{{ record.triggerType }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="触发人" data-index="triggeredByName" width="120" />
        <a-table-column title="进入时间" data-index="enteredAt" width="180">
          <template #default="{ record }">
            {{ formatDate(record.enteredAt) }}
          </template>
        </a-table-column>
        <a-table-column title="退出时间" data-index="exitedAt" width="180">
          <template #default="{ record }">
            {{ record.exitedAt ? formatDate(record.exitedAt) : '—' }}
          </template>
        </a-table-column>
        <a-table-column title="停留时长" data-index="durationSeconds" width="110" align="center">
          <template #default="{ record }">
            {{ formatDuration(record.durationSeconds) }}
          </template>
        </a-table-column>
        <a-table-column title="状态标记" width="150">
          <template #default="{ record }">
            <a-space wrap>
              <a-tag v-if="record.isCurrent" color="blue" size="small">当前</a-tag>
              <a-tag v-if="record.isFinal" color="success" size="small">最终</a-tag>
              <a-tag v-if="record.isTimeout" color="error" size="small">超时</a-tag>
              <a-tag v-if="record.hasError" color="error" size="small">错误</a-tag>
            </a-space>
          </template>
        </a-table-column>
        <a-table-column title="操作" width="200" fixed="right">
          <template #default="{ record }">
            <a-space>
              <a-button size="small" type="link" @click="goDetail(record.id)">详情</a-button>
              <a-button size="small" type="link" @click="viewTimeline(record.ciId)">时间线</a-button>
              <a-button
                v-if="record.isCurrent && !record.isFinal"
                size="small"
                type="link"
                @click="handleTransition(record)"
              >
                转换状态
              </a-button>
            </a-space>
          </template>
        </a-table-column>
      </a-table>
    </a-card>

    <!-- 状态转换弹窗 -->
    <a-modal
      v-model:open="transitionModalVisible"
      title="状态转换"
      @ok="confirmTransition"
      :confirm-loading="transitioning"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="当前状态">
          <a-tag :color="getStateColor(selectedState?.stateType || '')">
            {{ getStateText(selectedState?.stateType || '') }}
          </a-tag>
        </a-form-item>
        <a-form-item label="目标状态" required>
          <a-select v-model:value="targetState" style="width: 100%">
            <a-select-option
              v-for="state in getAllowedNextStates(selectedState?.stateType)"
              :key="state"
              :value="state"
            >
              <a-tag :color="getStateColor(state)">{{ getStateText(state) }}</a-tag>
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="transitionComment" :rows="3" placeholder="可选：填写状态转换原因" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

// TODO: 创建对应的API
// import { getLifecycleStateList, updateLifecycleState } from '#/api/io/lifecycle-state';
// import type { LifecycleStateInfo, LifecycleStateListReq } from '#/api/io/model';

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
  durationSeconds: number;
  triggerType: string;
  triggeredBy?: number;
  triggeredByName?: string;
  isCurrent: boolean;
  isFinal: boolean;
  isTimeout: boolean;
  hasError: boolean;
  errorMessage?: string;
  canRetry: boolean;
}

interface LifecycleStateListReq {
  page: number;
  pageSize: number;
  ciId?: number;
  stateType?: string;
  triggerType?: string;
  isCurrent?: boolean;
  isTimeout?: boolean;
  hasError?: boolean;
}

const router = useRouter();
const loading = ref(false);
const tableData = ref<LifecycleStateInfo[]>([]);
const pagination = reactive<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });
const query = reactive<Partial<LifecycleStateListReq>>({});

// 状态转换相关
const transitionModalVisible = ref(false);
const selectedState = ref<LifecycleStateInfo>();
const targetState = ref<string>();
const transitionComment = ref('');
const transitioning = ref(false);

// 状态机：定义允许的状态转换
const stateTransitions: Record<string, string[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['validated', 'draft', 'cancelled'],
  validated: ['approved', 'submitted', 'cancelled'],
  approved: ['executed', 'cancelled'],
  executed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  expired: [],
};

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

function formatDate(date: string): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return '—';
  const d = dayjs.duration(seconds, 'seconds');
  const hours = Math.floor(d.asHours());
  const minutes = d.minutes();
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

function getAllowedNextStates(currentState?: string): string[] {
  if (!currentState) return [];
  return stateTransitions[currentState] || [];
}

async function fetchData() {
  loading.value = true;
  try {
    // TODO: 调用实际API
    // const res = await getLifecycleStateList({
    //   page: pagination.current!,
    //   pageSize: pagination.pageSize!,
    //   ...query,
    // });
    // tableData.value = res.data;
    // pagination.total = res.total;

    // Mock data
    tableData.value = [];
    pagination.total = 0;
    message.info('API接口待实现');
  } catch (error) {
    message.error('加载失败');
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  Object.keys(query).forEach(key => delete (query as any)[key]);
  pagination.current = 1;
  fetchData();
}

function onTableChange(pag: TablePaginationConfig) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchData();
}

function goDetail(id: number) {
  router.push({ name: 'LifecycleStateDetail' as any, params: { id: String(id) } });
}

function viewTimeline(ciId: number) {
  router.push({ name: 'LifecycleStateTimeline' as any, params: { ciId: String(ciId) } });
}

function handleTransition(state: LifecycleStateInfo) {
  selectedState.value = state;
  targetState.value = undefined;
  transitionComment.value = '';
  transitionModalVisible.value = true;
}

async function confirmTransition() {
  if (!targetState.value) {
    message.warning('请选择目标状态');
    return;
  }

  transitioning.value = true;
  try {
    // TODO: 调用状态转换API
    // await updateLifecycleState(selectedState.value!.stateId, {
    //   targetState: targetState.value,
    //   comment: transitionComment.value,
    // });
    message.success('状态转换成功');
    transitionModalVisible.value = false;
    fetchData();
  } catch (error) {
    message.error('状态转换失败');
  } finally {
    transitioning.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* 添加必要的样式 */
</style>
