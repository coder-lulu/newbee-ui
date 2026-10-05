<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>配置审计日志</template>
      <a-form layout="inline" :model="query" @submit.prevent>
        <a-form-item label="配置键">
          <a-input v-model:value="query.configKey" placeholder="输入配置键搜索" allow-clear style="width: 200px" />
        </a-form-item>
        <a-form-item label="操作类型">
          <a-select v-model:value="query.changeType" placeholder="选择操作类型" allow-clear style="width: 160px">
            <a-select-option value="create">创建</a-select-option>
            <a-select-option value="update">更新</a-select-option>
            <a-select-option value="delete">删除</a-select-option>
            <a-select-option value="rollback">回滚</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="时间范围">
          <a-range-picker
            v-model:value="dateRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            :placeholder="['开始时间', '结束时间']"
            @change="onDateRangeChange"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="fetchData">查询</a-button>
            <a-button @click="resetQuery">重置</a-button>
          </a-space>
        </a-form-item>
        <a-form-item style="margin-left: auto">
          <a-button @click="goBack">返回配置列表</a-button>
        </a-form-item>
      </a-form>

      <a-table
        class="mt-4"
        row-key="id"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        @change="onTableChange"
        :columns="columns"
        :scroll="{ x: 1800 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'configKey'">
            <a-typography-text copyable>{{ record.configKey }}</a-typography-text>
          </template>
          <template v-else-if="column.key === 'changeType'">
            <a-tag :color="getChangeTypeColor(record.changeType)">
              {{ getChangeTypeText(record.changeType) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'oldValue'">
            <a-tooltip v-if="record.oldValue && record.oldValue.length > 30">
              <template #title>{{ record.oldValue }}</template>
              <span class="text-red-600">{{ record.oldValue.substring(0, 30) }}...</span>
            </a-tooltip>
            <span v-else class="text-red-600">{{ record.oldValue || '-' }}</span>
          </template>
          <template v-else-if="column.key === 'newValue'">
            <a-tooltip v-if="record.newValue && record.newValue.length > 30">
              <template #title>{{ record.newValue }}</template>
              <span class="text-green-600">{{ record.newValue.substring(0, 30) }}...</span>
            </a-tooltip>
            <span v-else class="text-green-600">{{ record.newValue || '-' }}</span>
          </template>
          <template v-else-if="column.key === 'isRollback'">
            <a-tag v-if="record.isRollback" color="orange">回滚操作</a-tag>
            <span v-else>-</span>
          </template>
          <template v-else-if="column.key === 'version'">
            <a-space>
              <a-badge
                v-if="record.oldVersion"
                :count="`v${record.oldVersion}`"
                :number-style="{ backgroundColor: '#ff4d4f' }"
              />
              <span v-if="record.oldVersion && record.newVersion">→</span>
              <a-badge
                v-if="record.newVersion"
                :count="`v${record.newVersion}`"
                :number-style="{ backgroundColor: '#52c41a' }"
              />
            </a-space>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatDateTime(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="viewDetail(record)">详情</a>
              <a-popconfirm
                v-if="record.changeType !== 'create' && record.oldValue"
                title="确定要回滚到此版本吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleRollback(record)"
              >
                <a>回滚</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 详情对话框 -->
    <a-modal
      v-model:open="detailVisible"
      title="审计日志详情"
      width="900px"
      :footer="null"
    >
      <a-descriptions v-if="currentRecord" :column="2" bordered>
        <a-descriptions-item label="日志ID">
          {{ currentRecord.id }}
        </a-descriptions-item>
        <a-descriptions-item label="配置键">
          <a-typography-text copyable>{{ currentRecord.configKey }}</a-typography-text>
        </a-descriptions-item>
        <a-descriptions-item label="操作类型" :span="2">
          <a-tag :color="getChangeTypeColor(currentRecord.changeType)">
            {{ getChangeTypeText(currentRecord.changeType) }}
          </a-tag>
          <a-tag v-if="currentRecord.isRollback" color="orange" class="ml-2">
            回滚操作
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="旧值" :span="2">
          <pre class="bg-gray-100 p-2 rounded">{{ currentRecord.oldValue || '-' }}</pre>
        </a-descriptions-item>
        <a-descriptions-item label="新值" :span="2">
          <pre class="bg-gray-100 p-2 rounded">{{ currentRecord.newValue || '-' }}</pre>
        </a-descriptions-item>
        <a-descriptions-item label="旧版本">
          v{{ currentRecord.oldVersion || 0 }}
        </a-descriptions-item>
        <a-descriptions-item label="新版本">
          v{{ currentRecord.newVersion || 0 }}
        </a-descriptions-item>
        <a-descriptions-item label="操作人">
          {{ currentRecord.changedByName || 'System' }} (ID: {{ currentRecord.changedBy || '-' }})
        </a-descriptions-item>
        <a-descriptions-item label="操作时间">
          {{ formatDateTime(currentRecord.createdAt) }}
        </a-descriptions-item>
        <a-descriptions-item label="服务名称">
          {{ currentRecord.serviceName || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="分类">
          {{ currentRecord.category || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="配置组">
          {{ currentRecord.configGroup || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="IP地址">
          {{ currentRecord.ipAddress || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="变更原因" :span="2">
          {{ currentRecord.changeReason || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="User-Agent" :span="2">
          <div class="text-xs break-all">{{ currentRecord.userAgent || '-' }}</div>
        </a-descriptions-item>
        <a-descriptions-item v-if="currentRecord.rollbackFromLogId" label="回滚来源日志ID" :span="2">
          {{ currentRecord.rollbackFromLogId }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import dayjs, { type Dayjs } from 'dayjs';

import {
  getAuditLogList,
  rollbackConfig,
} from '#/api/io/config';
import type {
  ConfigAuditLog,
  ListAuditLogReq,
  ChangeType,
} from '#/api/io/model';

const router = useRouter();

const loading = ref(false);
const tableData = ref<ConfigAuditLog[]>([]);
const pagination = reactive<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });

const query = reactive<Partial<ListAuditLogReq>>({});
const dateRange = ref<[Dayjs, Dayjs]>();

// 详情对话框
const detailVisible = ref(false);
const currentRecord = ref<ConfigAuditLog>();

// 表格列配置
const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '配置键', dataIndex: 'configKey', width: 200, key: 'configKey' },
  { title: '操作类型', dataIndex: 'changeType', width: 100, key: 'changeType' },
  { title: '旧值', dataIndex: 'oldValue', width: 200, key: 'oldValue', ellipsis: true },
  { title: '新值', dataIndex: 'newValue', width: 200, key: 'newValue', ellipsis: true },
  { title: '版本变更', key: 'version', width: 150 },
  { title: '操作人', dataIndex: 'changedByName', width: 100 },
  { title: '服务名称', dataIndex: 'serviceName', width: 120 },
  { title: '分类', dataIndex: 'category', width: 100 },
  { title: '回滚标记', key: 'isRollback', width: 100 },
  { title: '操作时间', dataIndex: 'createdAt', width: 180, key: 'createdAt' },
  { title: '操作', key: 'action', width: 150, fixed: 'right' },
];

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getAuditLogList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...query,
    });
    tableData.value = data?.data || [];
    pagination.total = data?.total || 0;
  } catch (error) {
    message.error('获取审计日志失败');
  } finally {
    loading.value = false;
  }
};

// 表格分页变化
const onTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchData();
};

// 时间范围变化
const onDateRangeChange = (dates: [Dayjs, Dayjs] | null) => {
  if (dates) {
    query.startTime = dates[0].unix();
    query.endTime = dates[1].unix();
  } else {
    delete query.startTime;
    delete query.endTime;
  }
};

// 重置查询
const resetQuery = () => {
  Object.keys(query).forEach(key => {
    delete query[key];
  });
  dateRange.value = undefined;
  pagination.current = 1;
  fetchData();
};

// 返回配置列表
const goBack = () => {
  router.push({ name: 'io-config-list' });
};

// 查看详情
const viewDetail = (record: ConfigAuditLog) => {
  currentRecord.value = record;
  detailVisible.value = true;
};

// 回滚配置
const handleRollback = async (record: ConfigAuditLog) => {
  try {
    await rollbackConfig({ auditLogId: record.id! });
    message.success('回滚成功');
    fetchData();
  } catch (error) {
    message.error('回滚失败');
  }
};

// 工具函数
const getChangeTypeColor = (type?: ChangeType) => {
  const colors: Record<string, string> = {
    create: 'green',
    update: 'blue',
    delete: 'red',
    rollback: 'orange',
  };
  return colors[type || 'update'] || 'blue';
};

const getChangeTypeText = (type?: ChangeType) => {
  const texts: Record<string, string> = {
    create: '创建',
    update: '更新',
    delete: '删除',
    rollback: '回滚',
  };
  return texts[type || 'update'] || type || '-';
};

const formatDateTime = (timestamp?: number) => {
  if (!timestamp) return '-';
  return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  max-height: 300px;
  overflow: auto;
}
</style>
