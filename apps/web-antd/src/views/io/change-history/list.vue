<script setup lang="ts">
import type { TablePaginationConfig } from "ant-design-vue";

import type {
  ChangeHistoryInfo,
  ChangeHistoryListReq,
} from "#/api/io/change-history";

import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { message, Modal } from "ant-design-vue";
import dayjs from "dayjs";

import { getChangeHistoryList } from "#/api/io/change-history";

const router = useRouter();
const loading = ref(false);
const tableData = ref<ChangeHistoryInfo[]>([]);
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
});
const query = reactive<
  Omit<Partial<ChangeHistoryListReq>, "needsApproval"> & {
    needsApproval?: "false" | "true";
  }
>({});

function getOperationTypeColor(type: string): string {
  const colors: Record<string, string> = {
    create: "green",
    update: "blue",
    delete: "red",
    batch_create: "green",
    batch_update: "orange",
    batch_delete: "red",
    import: "purple",
  };
  return colors[type] || "default";
}

function getOperationTypeText(type: string): string {
  const texts: Record<string, string> = {
    create: "创建",
    update: "更新",
    delete: "删除",
    batch_create: "批量创建",
    batch_update: "批量更新",
    batch_delete: "批量删除",
    import: "导入",
  };
  return texts[type] || type;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "default",
    success: "success",
    failed: "error",
    rollback: "warning",
  };
  return colors[status] || "default";
}

function getApprovalColor(isApproved?: boolean): string {
  if (isApproved === undefined) return "default";
  return isApproved ? "success" : "error";
}

function getApprovalText(isApproved?: boolean): string {
  if (isApproved === undefined) return "待审批";
  return isApproved ? "已通过" : "已拒绝";
}

function formatDate(date: string): string {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
}

async function fetchData() {
  loading.value = true;
  try {
    const { needsApproval, ...filters } = query;
    const res = await getChangeHistoryList({
      ...filters,
      ...(needsApproval === undefined
        ? {}
        : { needsApproval: needsApproval === "true" }),
      page: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? 10,
    });
    tableData.value = res.data;
    pagination.total = res.total;
  } catch {
    message.error("加载失败");
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  Object.keys(query).forEach((key) => delete (query as any)[key]);
  pagination.current = 1;
  fetchData();
}

function onTableChange(pag: TablePaginationConfig) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchData();
}

function goDetail(id: number) {
  router.push({
    name: "ChangeHistoryDetail" as any,
    params: { id: String(id) },
  });
}

function viewChanges(id: number) {
  // 打开变更对比弹窗或跳转到对比页面
  router.push({
    name: "ChangeHistoryDetail" as any,
    params: { id: String(id) },
    query: { tab: "compare" },
  });
}

function handleRollback(_id: number) {
  Modal.confirm({
    title: "确认回滚",
    content: "此操作将回滚该删除操作，重新创建被删除的CI。确定继续吗？",
    okText: "确认",
    cancelText: "取消",
    async onOk() {
      try {
        // TODO: 调用回滚API
        // await rollbackChange(id);
        message.success("回滚成功");
        fetchData();
      } catch {
        message.error("回滚失败");
      }
    },
  });
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>CI变更历史</template>
      <a-form layout="inline" :model="query" @submit.prevent>
        <a-form-item label="CI ID">
          <a-input-number
            v-model:value="query.ciId"
            placeholder="输入CI ID"
            allow-clear
            style="width: 160px"
          />
        </a-form-item>
        <a-form-item label="操作类型">
          <a-select
            v-model:value="query.operationType"
            allow-clear
            style="width: 160px"
          >
            <a-select-option value="create">创建</a-select-option>
            <a-select-option value="update">更新</a-select-option>
            <a-select-option value="delete">删除</a-select-option>
            <a-select-option value="batch_create">批量创建</a-select-option>
            <a-select-option value="batch_update">批量更新</a-select-option>
            <a-select-option value="batch_delete">批量删除</a-select-option>
            <a-select-option value="import">导入</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="操作人">
          <a-input
            v-model:value="query.operatorName"
            placeholder="操作人姓名"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="数据来源">
          <a-select
            v-model:value="query.source"
            allow-clear
            style="width: 160px"
          >
            <a-select-option value="manual">手动</a-select-option>
            <a-select-option value="discovery">自动发现</a-select-option>
            <a-select-option value="import">导入</a-select-option>
            <a-select-option value="api">API</a-select-option>
            <a-select-option value="script">脚本</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="query.status"
            allow-clear
            style="width: 120px"
          >
            <a-select-option value="pending">待处理</a-select-option>
            <a-select-option value="success">成功</a-select-option>
            <a-select-option value="failed">失败</a-select-option>
            <a-select-option value="rollback">已回滚</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="需要审批">
          <a-select
            v-model:value="query.needsApproval"
            allow-clear
            style="width: 100px"
          >
            <a-select-option value="true">是</a-select-option>
            <a-select-option value="false">否</a-select-option>
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
        <a-table-column title="操作ID" data-index="operationId" width="180" />
        <a-table-column title="CI ID" data-index="ciId" width="100" />
        <a-table-column title="操作类型" data-index="operationType" width="120">
          <template #default="{ record }">
            <a-tag :color="getOperationTypeColor(record.operationType)">
              {{ getOperationTypeText(record.operationType) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="操作人" data-index="operatorName" width="120" />
        <a-table-column title="数据来源" data-index="source" width="100">
          <template #default="{ record }">
            <a-tag>{{ record.source }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="状态" data-index="status" width="100">
          <template #default="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column
          title="影响记录数"
          data-index="affectedCount"
          width="110"
          align="center"
        />
        <a-table-column
          title="变更原因"
          data-index="changeReason"
          width="200"
          :ellipsis="true"
        />
        <a-table-column title="审批" width="80" align="center">
          <template #default="{ record }">
            <a-tag
              v-if="record.needsApproval"
              :color="getApprovalColor(record.isApproved)"
            >
              {{ getApprovalText(record.isApproved) }}
            </a-tag>
            <span v-else>—</span>
          </template>
        </a-table-column>
        <a-table-column title="操作时间" data-index="createdAt" width="180">
          <template #default="{ record }">
            {{ formatDate(record.createdAt) }}
          </template>
        </a-table-column>
        <a-table-column title="操作" width="200" fixed="right">
          <template #default="{ record }">
            <a-space>
              <a-button size="small" type="link" @click="goDetail(record.id)">
                详情
              </a-button>
              <a-button
                size="small"
                type="link"
                @click="viewChanges(record.id)"
              >
                变更对比
              </a-button>
              <a-button
                v-if="record.operationType === 'delete' && record.canRollback"
                size="small"
                type="link"
                danger
                @click="handleRollback(record.id)"
              >
                回滚
              </a-button>
            </a-space>
          </template>
        </a-table-column>
      </a-table>
    </a-card>
  </div>
</template>

<style scoped>
.code-block {
  max-height: 400px;
  padding: 12px;
  overflow-y: auto;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
