<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>配置中心</template>
      <a-form layout="inline" :model="query" @submit.prevent>
        <a-form-item label="关键字">
          <a-input v-model:value="query.keyword" placeholder="输入配置键搜索" allow-clear style="width: 200px" />
        </a-form-item>
        <a-form-item label="服务名称">
          <a-input v-model:value="query.serviceName" placeholder="输入服务名称" allow-clear style="width: 160px" />
        </a-form-item>
        <a-form-item label="分类">
          <a-select v-model:value="query.category" placeholder="选择分类" allow-clear style="width: 160px">
            <a-select-option value="database">数据库</a-select-option>
            <a-select-option value="redis">Redis</a-select-option>
            <a-select-option value="mq">消息队列</a-select-option>
            <a-select-option value="api">API</a-select-option>
            <a-select-option value="system">系统</a-select-option>
            <a-select-option value="business">业务</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="配置组">
          <a-input v-model:value="query.configGroup" placeholder="输入配置组" allow-clear style="width: 160px" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="fetchData">查询</a-button>
            <a-button @click="resetQuery">重置</a-button>
          </a-space>
        </a-form-item>
        <a-form-item style="margin-left: auto">
          <a-space>
            <a-button type="primary" @click="goCreate">新建配置</a-button>
            <a-button @click="goAuditLog">审计日志</a-button>
          </a-space>
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
        :scroll="{ x: 1500 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'configKey'">
            <a-typography-text :copyable="true">{{ record.configKey }}</a-typography-text>
          </template>
          <template v-else-if="column.key === 'configValue'">
            <a-tooltip v-if="record.isSensitive">
              <template #title>敏感信息已隐藏</template>
              <span>******</span>
            </a-tooltip>
            <a-tooltip v-else-if="record.configValue && record.configValue.length > 50">
              <template #title>{{ record.configValue }}</template>
              <span>{{ record.configValue.substring(0, 50) }}...</span>
            </a-tooltip>
            <span v-else>{{ record.configValue }}</span>
          </template>
          <template v-else-if="column.key === 'valueType'">
            <a-tag :color="getValueTypeColor(record.valueType)">{{ record.valueType }}</a-tag>
          </template>
          <template v-else-if="column.key === 'scope'">
            <a-tag>{{ record.scope }}</a-tag>
          </template>
          <template v-else-if="column.key === 'isReadonly'">
            <a-tag :color="record.isReadonly ? 'red' : 'green'">
              {{ record.isReadonly ? '只读' : '可写' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'version'">
            <a-badge :count="record.version" :number-style="{ backgroundColor: '#52c41a' }" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="viewHistory(record)">历史</a>
              <a @click="goEdit(record)" :disabled="record.isReadonly">编辑</a>
              <a-popconfirm
                title="确定要删除此配置吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record)"
                :disabled="record.isReadonly"
              >
                <a :class="{ disabled: record.isReadonly }">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 历史记录对话框 -->
    <a-modal
      v-model:open="historyVisible"
      title="配置历史"
      width="900px"
      :footer="null"
      :z-index="1000"
      :mask="true"
      :maskClosable="true"
      :destroyOnClose="true"
      centered
    >
      <a-timeline v-if="historyData.length > 0" class="mt-4">
        <a-timeline-item
          v-for="item in historyData"
          :key="item.id"
          :color="getChangeTypeColor(item.changeType)"
        >
          <template #dot>
            <span class="text-lg">{{ getChangeTypeIcon(item.changeType) }}</span>
          </template>
          <div class="history-item">
            <div class="history-header">
              <span class="font-semibold">{{ item.changeType }}</span>
              <span class="text-gray-500 ml-2">by {{ item.changedByName || 'System' }}</span>
              <span class="text-gray-400 ml-2">
                {{ formatDateTime(item.createdAt) }}
              </span>
              <a-tag v-if="item.isRollback" color="orange" class="ml-2">回滚</a-tag>
            </div>
            <div class="history-content mt-2">
              <div v-if="item.oldValue" class="mb-1">
                <span class="text-gray-600">旧值: </span>
                <span class="text-red-600">{{ item.oldValue }}</span>
              </div>
              <div v-if="item.newValue" class="mb-1">
                <span class="text-gray-600">新值: </span>
                <span class="text-green-600">{{ item.newValue }}</span>
              </div>
              <div v-if="item.changeReason" class="mb-1">
                <span class="text-gray-600">原因: </span>
                <span>{{ item.changeReason }}</span>
              </div>
              <div class="mt-2">
                <a-button
                  v-if="item.oldValue && item.changeType !== 'create'"
                  size="small"
                  type="link"
                  @click="handleRollback(item)"
                >
                  回滚到此版本
                </a-button>
              </div>
            </div>
          </div>
        </a-timeline-item>
      </a-timeline>
      <a-empty v-else description="暂无历史记录" />
    </a-modal>
    
    <!-- 新建配置对话框（当后端未下发新建路由时作为兜底） -->
    <a-modal
      v-model:open="createVisible"
      title="新建配置"
      width="720px"
      @ok="handleCreateSubmit"
      :confirm-loading="createSubmitting"
      :z-index="1001"
      :mask="true"
      :maskClosable="true"
      :destroyOnClose="true"
      centered
    >
      <a-form ref="createFormRef" :model="createForm" :rules="createRules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-item label="配置键" name="configKey">
          <a-input v-model:value="createForm.configKey" placeholder="如: database.host" />
        </a-form-item>
        <a-form-item label="配置值" name="configValue">
          <a-textarea v-model:value="createForm.configValue" :rows="3" placeholder="请输入配置值" />
        </a-form-item>
        <a-form-item label="值类型" name="valueType">
          <a-select v-model:value="createForm.valueType">
            <a-select-option value="string">string</a-select-option>
            <a-select-option value="number">number</a-select-option>
            <a-select-option value="boolean">boolean</a-select-option>
            <a-select-option value="json">json</a-select-option>
            <a-select-option value="array">array</a-select-option>
            <a-select-option value="object">object</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="服务名称" name="serviceName">
          <a-input v-model:value="createForm.serviceName" placeholder="如: unified-io" />
        </a-form-item>
        <a-form-item label="分类" name="category">
          <a-select v-model:value="createForm.category">
            <a-select-option value="database">数据库</a-select-option>
            <a-select-option value="redis">Redis</a-select-option>
            <a-select-option value="mq">消息队列</a-select-option>
            <a-select-option value="api">API</a-select-option>
            <a-select-option value="system">系统</a-select-option>
            <a-select-option value="business">业务</a-select-option>
            <a-select-option value="other">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="配置组" name="configGroup">
          <a-input v-model:value="createForm.configGroup" placeholder="如: discovery-pool" />
        </a-form-item>
        <a-form-item label="作用域" name="scope">
          <a-select v-model:value="createForm.scope">
            <a-select-option value="global">global</a-select-option>
            <a-select-option value="service">service</a-select-option>
            <a-select-option value="instance">instance</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="createForm.description" :rows="2" />
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 17, offset: 5 }">
          <a-space>
            <a-checkbox v-model:checked="createForm.isReadonly">只读</a-checkbox>
            <a-checkbox v-model:checked="createForm.isSensitive">敏感</a-checkbox>
          </a-space>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import type { FormInstance, Rule } from 'ant-design-vue/es/form';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

import {
  getConfigList,
  deleteConfig,
  getConfigHistory,
  rollbackConfig,
  createConfig,
} from '#/api/io/config';
import type {
  ConfigItem,
  ConfigAuditLog,
  ListConfigReq,
  CreateConfigReq,
} from '#/api/io/model';

const router = useRouter();
// 使用 a-typography-text 直接在模板中渲染可复制文本

const loading = ref(false);
const tableData = ref<ConfigItem[]>([]);
const pagination = reactive<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });

const query = reactive<Partial<ListConfigReq>>({});

// 历史记录对话框
const historyVisible = ref(false);
const historyData = ref<ConfigAuditLog[]>([]);
const currentConfigKey = ref('');

// 新建配置对话框（后端未下发新建路由时兜底）
const createVisible = ref(false);
const createSubmitting = ref(false);
const createFormRef = ref<FormInstance>();
const createForm = reactive<Partial<CreateConfigReq>>({
  configKey: '',
  configValue: '',
  valueType: 'string',
  serviceName: '',
  category: '',
  configGroup: '',
  scope: 'service',
  defaultValue: '',
  description: '',
  isReadonly: false,
  isSensitive: false,
});

const createRules: Record<string, Rule[]> = {
  configKey: [
    { required: true, message: '请输入配置键', trigger: 'blur' },
    { min: 3, max: 100, message: '配置键长度应为3-100个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9._-]+$/, message: '只能包含字母、数字、点、下划线和横线', trigger: 'blur' },
  ],
  configValue: [{ required: true, message: '请输入配置值', trigger: 'blur' }],
  valueType: [{ required: true, message: '请选择值类型', trigger: 'change' }],
  serviceName: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
};

// 表格列配置
const columns = [
  { title: 'ID', dataIndex: 'id', width: 70, fixed: 'left' },
  { title: '配置键', dataIndex: 'configKey', width: 200, key: 'configKey', fixed: 'left' },
  { title: '配置值', dataIndex: 'configValue', width: 250, key: 'configValue', ellipsis: true },
  { title: '类型', dataIndex: 'valueType', width: 100, key: 'valueType' },
  { title: '服务名称', dataIndex: 'serviceName', width: 120 },
  { title: '分类', dataIndex: 'category', width: 100 },
  { title: '配置组', dataIndex: 'configGroup', width: 120 },
  { title: '作用域', dataIndex: 'scope', width: 100, key: 'scope' },
  { title: '权限', dataIndex: 'isReadonly', width: 80, key: 'isReadonly' },
  { title: '版本', dataIndex: 'version', width: 80, key: 'version' },
  { title: '描述', dataIndex: 'description', width: 200, ellipsis: true },
  { title: '操作', key: 'action', width: 180, fixed: 'right' },
];

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getConfigList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...query,
    });
    tableData.value = data?.data || [];
    pagination.total = data?.total || 0;
  } catch (error) {
    message.error('获取配置列表失败');
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

// 重置查询
const resetQuery = () => {
  Object.keys(query).forEach(key => {
    delete query[key];
  });
  pagination.current = 1;
  fetchData();
};

// 后端动态路由：安全跳转封装，避免未注册命名路由导致的运行时异常
const safePushByName = async (name: string, params?: Record<string, any>) => {
  try {
    // 通过 router.resolve 判断是否存在匹配的路由，避免依赖 hasRoute 兼容问题
    const target = router.resolve({ name: name as any, params });
    if (!target || !target.matched || target.matched.length === 0) {
      message.warning(`未找到路由 ${name}，请先在菜单中添加或联系管理员`);
      return;
    }
    await router.push({ name: name as any, params });
  } catch (e: any) {
    message.error(e?.message || '页面跳转失败');
    // eslint-disable-next-line no-console
    console.error('Router push error:', e);
  }
};

// 跳转创建页面（若未下发命名路由，则弹出内联新建对话框）
const goCreate = async () => {
  try {
    const target = router.resolve({ name: 'io-config-create' as any });
    if (!target || !target.matched || target.matched.length === 0) {
      createVisible.value = true;
      return;
    }
    // 命名路由存在时正常跳转
    await router.push({ name: 'io-config-create' as any });
  } catch (e: any) {
    // 如果路由跳转失败，显示内联新建对话框作为备选
    console.warn('路由跳转失败，使用内联新建对话框:', e);
    createVisible.value = true;
  }
};

// 跳转编辑页面
const goEdit = (record: ConfigItem) => safePushByName('io-config-edit', { key: record.configKey });

// 跳转审计日志页面
const goAuditLog = () => safePushByName('io-config-audit-log');

// 删除配置
const handleDelete = async (record: ConfigItem) => {
  try {
    await deleteConfig({ configKey: record.configKey });
    message.success('删除成功');
    fetchData();
  } catch (error) {
    message.error('删除失败');
  }
};

// 查看历史
const viewHistory = async (record: ConfigItem) => {
  currentConfigKey.value = record.configKey;
  historyVisible.value = true;
  try {
    const { data } = await getConfigHistory({ configKey: record.configKey });
    historyData.value = data?.data || [];
  } catch (error) {
    message.error('获取历史记录失败');
  }
};

// 回滚配置
const handleRollback = async (item: ConfigAuditLog) => {
  try {
    await rollbackConfig({ auditLogId: item.id! });
    message.success('回滚成功');
    historyVisible.value = false;
    fetchData();
  } catch (error) {
    message.error('回滚失败');
  }
};

// 工具函数
const getValueTypeColor = (type?: string) => {
  const colors: Record<string, string> = {
    string: 'blue',
    number: 'green',
    boolean: 'orange',
    json: 'purple',
    array: 'cyan',
    object: 'magenta',
  };
  return colors[type || 'string'] || 'default';
};

const getChangeTypeColor = (type?: string) => {
  const colors: Record<string, string> = {
    create: 'green',
    update: 'blue',
    delete: 'red',
    rollback: 'orange',
  };
  return colors[type || 'update'] || 'blue';
};

const getChangeTypeIcon = (type?: string) => {
  const icons: Record<string, string> = {
    create: '➕',
    update: '✏️',
    delete: '🗑️',
    rollback: '↩️',
  };
  return icons[type || 'update'] || '•';
};

const formatDateTime = (timestamp?: number) => {
  if (!timestamp) return '-';
  return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

onMounted(() => {
  fetchData();
});

// 提交新建配置
const handleCreateSubmit = async () => {
  try {
    await createFormRef.value?.validate();
    createSubmitting.value = true;
    await createConfig(createForm as CreateConfigReq);
    message.success('创建成功');
    createVisible.value = false;
    // 重置表单
    Object.assign(createForm, {
      configKey: '',
      configValue: '',
      valueType: 'string',
      serviceName: '',
      category: '',
      configGroup: '',
      scope: 'service',
      defaultValue: '',
      description: '',
      isReadonly: false,
      isSensitive: false,
    });
    fetchData();
  } catch (e) {
    // 校验失败或接口异常忽略
  } finally {
    createSubmitting.value = false;
  }
};
</script>

<style scoped>
.history-item {
  padding: 8px 0;
}

.history-header {
  display: flex;
  align-items: center;
}

.history-content {
  padding-left: 16px;
  line-height: 1.8;
}

.disabled {
  color: rgba(0, 0, 0, 0.25);
  cursor: not-allowed;
  pointer-events: none;
}

/* 确保Modal内容正确显示 */
:deep(.ant-modal) {
  position: relative;
}

:deep(.ant-modal-mask) {
  background-color: rgba(0, 0, 0, 0.45);
}

:deep(.ant-modal-wrap) {
  overflow: auto;
}
</style>
