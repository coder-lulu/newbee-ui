<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>
        <a-space>
          <span>变更详情</span>
          <a-tag :color="getOperationTypeColor(data?.operationType || '')">
            {{ getOperationTypeText(data?.operationType || '') }}
          </a-tag>
        </a-space>
      </template>

      <a-tabs v-model:activeKey="activeTab">
        <!-- 基本信息 -->
        <a-tab-pane key="basic" tab="基本信息">
          <a-descriptions :column="2" bordered :label-style="{ width: '160px' }">
            <a-descriptions-item label="记录ID">{{ data?.id }}</a-descriptions-item>
            <a-descriptions-item label="操作ID">{{ data?.operationId }}</a-descriptions-item>
            <a-descriptions-item label="CI ID">{{ data?.ciId || '—' }}</a-descriptions-item>
            <a-descriptions-item label="CI类型ID">{{ data?.ciTypeId || '—' }}</a-descriptions-item>
            <a-descriptions-item label="操作类型">
              <a-tag :color="getOperationTypeColor(data?.operationType || '')">
                {{ getOperationTypeText(data?.operationType || '') }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="getStatusColor(data?.status || '')">{{ data?.status }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="操作人">{{ data?.operatorName }}</a-descriptions-item>
            <a-descriptions-item label="操作人ID">{{ data?.operatorId }}</a-descriptions-item>
            <a-descriptions-item label="数据来源">
              <a-tag>{{ data?.source }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="来源详情">{{ data?.sourceDetail || '—' }}</a-descriptions-item>
            <a-descriptions-item label="影响记录数">{{ data?.affectedCount }}</a-descriptions-item>
            <a-descriptions-item label="操作耗时">{{ data?.durationMs }}ms</a-descriptions-item>
            <a-descriptions-item label="操作IP">{{ data?.ipAddress || '—' }}</a-descriptions-item>
            <a-descriptions-item label="User Agent" :span="2">
              <div class="truncate">{{ data?.userAgent || '—' }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="变更原因" :span="2">
              {{ data?.changeReason || '—' }}
            </a-descriptions-item>
            <a-descriptions-item label="操作时间" :span="2">
              {{ formatDate(data?.createdAt) }}
            </a-descriptions-item>
          </a-descriptions>

          <!-- 审批信息 -->
          <a-divider orientation="left">审批信息</a-divider>
          <a-descriptions :column="2" bordered :label-style="{ width: '160px' }">
            <a-descriptions-item label="需要审批">
              <a-tag :color="data?.needsApproval ? 'orange' : 'default'">
                {{ data?.needsApproval ? '是' : '否' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="审批状态" v-if="data?.needsApproval">
              <a-tag :color="getApprovalColor(data?.isApproved)">
                {{ getApprovalText(data?.isApproved) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="审批人" v-if="data?.needsApproval">
              {{ data?.approvedByName || '—' }}
            </a-descriptions-item>
            <a-descriptions-item label="审批时间" v-if="data?.needsApproval">
              {{ data?.approvedAt ? formatDate(data.approvedAt) : '—' }}
            </a-descriptions-item>
            <a-descriptions-item label="审批意见" :span="2" v-if="data?.needsApproval">
              {{ data?.approvalComment || '—' }}
            </a-descriptions-item>
          </a-descriptions>

          <!-- 回滚信息 -->
          <a-divider orientation="left">回滚信息</a-divider>
          <a-descriptions :column="2" bordered :label-style="{ width: '160px' }">
            <a-descriptions-item label="可回滚">
              <a-tag :color="data?.canRollback ? 'success' : 'default'">
                {{ data?.canRollback ? '是' : '否' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="是否回滚操作">
              <a-tag :color="data?.isRollback ? 'warning' : 'default'">
                {{ data?.isRollback ? '是' : '否' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="回滚来源记录ID" :span="2">
              {{ data?.rollbackFromId || '—' }}
            </a-descriptions-item>
          </a-descriptions>
        </a-tab-pane>

        <!-- 变更对比 -->
        <a-tab-pane key="compare" tab="变更对比" v-if="data?.operationType === 'update'">
          <a-alert
            message="变更字段对比"
            description="以下展示了本次操作变更的所有字段及其前后值对比"
            type="info"
            show-icon
            class="mb-4"
          />

          <a-table
            :data-source="changedFieldsList"
            :pagination="false"
            :scroll="{ y: 500 }"
            row-key="field"
          >
            <a-table-column title="字段名" data-index="field" width="200" />
            <a-table-column title="变更前" data-index="oldValue" width="300">
              <template #default="{ record }">
                <a-tag color="red">{{ formatValue(record.oldValue) }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="变更后" data-index="newValue" width="300">
              <template #default="{ record }">
                <a-tag color="green">{{ formatValue(record.newValue) }}</a-tag>
              </template>
            </a-table-column>
          </a-table>

          <a-divider />
          <a-row :gutter="16">
            <a-col :span="12">
              <a-card size="small" title="变更前完整数据">
                <pre class="code-block">{{ pretty(data?.oldValues) }}</pre>
              </a-card>
            </a-col>
            <a-col :span="12">
              <a-card size="small" title="变更后完整数据">
                <pre class="code-block">{{ pretty(data?.newValues) }}</pre>
              </a-card>
            </a-col>
          </a-row>
        </a-tab-pane>

        <!-- 数据快照 -->
        <a-tab-pane key="snapshot" tab="数据快照" v-if="data?.operationType !== 'update'">
          <a-row :gutter="16">
            <a-col :span="12" v-if="data?.oldValues">
              <a-card size="small" title="旧数据快照（删除前/更新前）">
                <pre class="code-block">{{ pretty(data?.oldValues) }}</pre>
              </a-card>
            </a-col>
            <a-col :span="12" v-if="data?.newValues">
              <a-card size="small" title="新数据快照（创建后/更新后）">
                <pre class="code-block">{{ pretty(data?.newValues) }}</pre>
              </a-card>
            </a-col>
            <a-col :span="24" v-if="!data?.oldValues && !data?.newValues">
              <a-empty description="暂无数据快照" />
            </a-col>
          </a-row>
        </a-tab-pane>

        <!-- 元数据 -->
        <a-tab-pane key="metadata" tab="元数据" v-if="data?.metadata">
          <a-card size="small">
            <pre class="code-block">{{ pretty(data?.metadata) }}</pre>
          </a-card>
        </a-tab-pane>
      </a-tabs>

      <a-divider />
      <a-space>
        <a-button
          v-if="data?.operationType === 'delete' && data?.canRollback && !data?.isRollback"
          type="primary"
          danger
          @click="handleRollback"
        >
          回滚删除
        </a-button>
        <a-button @click="goList">返回列表</a-button>
      </a-space>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Modal, message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';

// TODO: 创建对应的API
// import { getChangeHistoryById, rollbackChange } from '#/api/io/change-history';
// import type { ChangeHistoryInfo } from '#/api/io/model';

interface ChangeHistoryInfo {
  id: number;
  operationId: string;
  ciId?: number;
  ciTypeId?: number;
  operationType: string;
  operationName?: string;
  operatorId?: number;
  operatorName?: string;
  source?: string;
  sourceDetail?: string;
  oldValues?: string;
  newValues?: string;
  changedFields?: string;
  changeReason?: string;
  status: string;
  affectedCount: number;
  durationMs: number;
  ipAddress?: string;
  userAgent?: string;
  needsApproval: boolean;
  isApproved?: boolean;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: string;
  approvalComment?: string;
  canRollback: boolean;
  isRollback: boolean;
  rollbackFromId?: number;
  metadata?: string;
  createdAt: string;
}

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const activeTab = ref(route.query.tab as string || 'basic');
const data = ref<ChangeHistoryInfo>();

const changedFieldsList = computed(() => {
  if (!data.value?.changedFields) return [];
  try {
    const fields = JSON.parse(data.value.changedFields);
    return Array.isArray(fields) ? fields : [];
  } catch {
    return [];
  }
});

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

function getApprovalColor(isApproved?: boolean): string {
  if (isApproved === undefined) return 'default';
  return isApproved ? 'success' : 'error';
}

function getApprovalText(isApproved?: boolean): string {
  if (isApproved === undefined) return '待审批';
  return isApproved ? '已通过' : '已拒绝';
}

function formatDate(date?: string): string {
  if (!date) return '—';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return '(空)';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
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
    // data.value = await getChangeHistoryById(id);

    // Mock data for demonstration
    message.info('API接口待实现');
  } catch (error) {
    message.error('加载失败');
  }
}

function handleRollback() {
  Modal.confirm({
    title: '确认回滚',
    content: '此操作将回滚该删除操作，重新创建被删除的CI。确定继续吗？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        // TODO: 调用回滚API
        // await rollbackChange(id);
        message.success('回滚成功');
        goList();
      } catch (error) {
        message.error('回滚失败');
      }
    },
  });
}

function goList() {
  if (router.hasRoute('ChangeHistoryList' as any)) {
    router.push({ name: 'ChangeHistoryList' as any });
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
  max-height: 600px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.truncate {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
