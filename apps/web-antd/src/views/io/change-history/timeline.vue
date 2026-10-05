<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>
        <a-space>
          <span>CI变更时间线</span>
          <a-tag>CI ID: {{ ciId }}</a-tag>
        </a-space>
      </template>

      <a-form layout="inline" :model="filters" class="mb-4">
        <a-form-item label="操作类型">
          <a-select v-model:value="filters.operationType" allow-clear style="width: 160px" @change="fetchData">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="create">创建</a-select-option>
            <a-select-option value="update">更新</a-select-option>
            <a-select-option value="delete">删除</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="数据来源">
          <a-select v-model:value="filters.source" allow-clear style="width: 160px" @change="fetchData">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="manual">手动</a-select-option>
            <a-select-option value="discovery">自动发现</a-select-option>
            <a-select-option value="import">导入</a-select-option>
            <a-select-option value="api">API</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>

      <a-timeline mode="left" v-if="timelineData.length > 0">
        <a-timeline-item
          v-for="item in timelineData"
          :key="item.id"
          :color="getTimelineColor(item.operationType)"
        >
          <template #dot>
            <component :is="getTimelineIcon(item.operationType)" style="font-size: 16px" />
          </template>

          <a-card size="small" :hoverable="true" @click="goDetail(item.id)">
            <template #title>
              <a-space>
                <a-tag :color="getOperationTypeColor(item.operationType)">
                  {{ getOperationTypeText(item.operationType) }}
                </a-tag>
                <span class="text-gray-600">{{ item.operatorName }}</span>
              </a-space>
            </template>
            <template #extra>
              <span class="text-gray-500 text-sm">{{ formatDate(item.createdAt) }}</span>
            </template>

            <a-descriptions size="small" :column="2">
              <a-descriptions-item label="操作ID">
                <span class="text-xs">{{ item.operationId }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="数据来源">
                <a-tag size="small">{{ item.source }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="状态">
                <a-tag size="small" :color="getStatusColor(item.status)">
                  {{ item.status }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="耗时">{{ item.durationMs }}ms</a-descriptions-item>
            </a-descriptions>

            <div class="mt-2" v-if="item.changeReason">
              <a-typography-text type="secondary">变更原因：</a-typography-text>
              <a-typography-text>{{ item.changeReason }}</a-typography-text>
            </div>

            <!-- 变更字段预览 (仅更新操作) -->
            <div class="mt-2" v-if="item.operationType === 'update' && item.changedFieldsPreview">
              <a-typography-text type="secondary">变更字段：</a-typography-text>
              <a-space wrap>
                <a-tag
                  v-for="field in item.changedFieldsPreview.slice(0, 5)"
                  :key="field"
                  size="small"
                  color="blue"
                >
                  {{ field }}
                </a-tag>
                <a-tag v-if="item.changedFieldsPreview.length > 5" size="small">
                  +{{ item.changedFieldsPreview.length - 5 }}
                </a-tag>
              </a-space>
            </div>

            <!-- 审批状态 -->
            <div class="mt-2" v-if="item.needsApproval">
              <a-space>
                <CheckCircleOutlined v-if="item.isApproved" style="color: #52c41a" />
                <CloseCircleOutlined v-else-if="item.isApproved === false" style="color: #ff4d4f" />
                <ClockCircleOutlined v-else style="color: #faad14" />
                <span>
                  审批: {{ getApprovalText(item.isApproved) }}
                  <span v-if="item.approvedByName"> by {{ item.approvedByName }}</span>
                </span>
              </a-space>
            </div>
          </a-card>
        </a-timeline-item>
      </a-timeline>

      <a-empty v-else description="暂无变更记录" />

      <div class="mt-4 text-center" v-if="hasMore">
        <a-button @click="loadMore" :loading="loading">加载更多</a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';

// TODO: 创建对应的API
// import { getChangeHistoryTimeline } from '#/api/io/change-history';

interface TimelineItem {
  id: number;
  operationId: string;
  operationType: string;
  operatorName: string;
  source: string;
  status: string;
  changeReason?: string;
  changedFieldsPreview?: string[];
  durationMs: number;
  needsApproval: boolean;
  isApproved?: boolean;
  approvedByName?: string;
  createdAt: string;
}

const route = useRoute();
const router = useRouter();
const ciId = Number(route.params.ciId || route.query.ciId);
const loading = ref(false);
const timelineData = ref<TimelineItem[]>([]);
const page = ref(1);
const pageSize = 20;
const hasMore = ref(true);

const filters = reactive({
  operationType: '',
  source: '',
});

function getTimelineColor(type: string): string {
  const colors: Record<string, string> = {
    create: 'green',
    update: 'blue',
    delete: 'red',
  };
  return colors[type] || 'gray';
}

function getTimelineIcon(type: string) {
  const icons: Record<string, any> = {
    create: PlusCircleOutlined,
    update: EditOutlined,
    delete: DeleteOutlined,
  };
  return icons[type] || EditOutlined;
}

function getOperationTypeColor(type: string): string {
  const colors: Record<string, string> = {
    create: 'green',
    update: 'blue',
    delete: 'red',
    batch_create: 'green',
    batch_update: 'orange',
    batch_delete: 'red',
    import: 'purple',
  };
  return colors[type] || 'default';
}

function getOperationTypeText(type: string): string {
  const texts: Record<string, string> = {
    create: '创建',
    update: '更新',
    delete: '删除',
    batch_create: '批量创建',
    batch_update: '批量更新',
    batch_delete: '批量删除',
    import: '导入',
  };
  return texts[type] || type;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'default',
    success: 'success',
    failed: 'error',
    rollback: 'warning',
  };
  return colors[status] || 'default';
}

function getApprovalText(isApproved?: boolean): string {
  if (isApproved === undefined) return '待审批';
  return isApproved ? '已通过' : '已拒绝';
}

function formatDate(date: string): string {
  const now = dayjs();
  const target = dayjs(date);
  const diff = now.diff(target, 'day');

  if (diff === 0) {
    return target.format('HH:mm:ss');
  } else if (diff === 1) {
    return `昨天 ${target.format('HH:mm')}`;
  } else if (diff < 7) {
    return `${diff}天前`;
  } else {
    return target.format('YYYY-MM-DD HH:mm');
  }
}

async function fetchData(reset = false) {
  if (reset) {
    page.value = 1;
    timelineData.value = [];
  }

  loading.value = true;
  try {
    // TODO: 调用实际API
    // const res = await getChangeHistoryTimeline({
    //   ciId,
    //   page: page.value,
    //   pageSize,
    //   ...filters,
    // });
    // if (reset) {
    //   timelineData.value = res.data;
    // } else {
    //   timelineData.value.push(...res.data);
    // }
    // hasMore.value = res.data.length === pageSize;

    // Mock data
    timelineData.value = [];
    hasMore.value = false;
    message.info('API接口待实现');
  } catch (error) {
    message.error('加载失败');
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  page.value++;
  fetchData();
}

function goDetail(id: number) {
  router.push({ name: 'ChangeHistoryDetail' as any, params: { id: String(id) } });
}

onMounted(() => {
  if (!ciId) {
    message.error('缺少CI ID参数');
    return;
  }
  fetchData(true);
});
</script>

<style scoped>
:deep(.ant-timeline-item-content) {
  margin-left: 24px;
}

.text-gray-600 {
  color: rgba(0, 0, 0, 0.65);
}

.text-gray-500 {
  color: rgba(0, 0, 0, 0.45);
}

.text-xs {
  font-size: 12px;
  font-family: monospace;
}
</style>
