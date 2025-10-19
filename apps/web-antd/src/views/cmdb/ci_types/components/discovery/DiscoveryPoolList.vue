<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Button, Card, Empty, message, Space, Table, Tag, Popconfirm } from 'ant-design-vue';
import { PlayCircleOutlined, EditOutlined, DeleteOutlined, PlusOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons-vue';
import DiscoveryWizardModal from './DiscoveryWizardModal.vue';
import { 
  getDiscoveryPoolList, 
  deleteDiscoveryPool, 
  enableDiscoveryPool, 
  disableDiscoveryPool, 
  triggerDiscoveryPool 
} from '#/api/io/discovery-pool';

interface Props {
  typeId: number;
}

const props = defineProps<Props>();

const pools = ref<any[]>([]);
const loading = ref(false);
const wizardModalRef = ref<InstanceType<typeof DiscoveryWizardModal> | null>(null);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
});

const columns = [
  { title: '发现池名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '发现方式', dataIndex: 'discovery_type', key: 'discovery_type', width: 120 },
  { title: '池状态', dataIndex: 'pool_status', key: 'pool_status', width: 100 },
  { title: '最后运行', dataIndex: 'last_run_at', key: 'last_run_at', width: 180 },
  { title: '成功/总数', key: 'stats', width: 120 },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '操作', key: 'action', width: 250, fixed: 'right' },
];

const loadPools = async () => {
  loading.value = true;
  try {
    const res = await getDiscoveryPoolList({
      page: pagination.value.current,
      page_size: pagination.value.pageSize,
      // 可以根据需要添加过滤条件
    });
    
    if (res && res.data) {
      pools.value = res.data.data || [];
      pagination.value.total = Number(res.data.total) || 0;
    } else {
      pools.value = [];
      pagination.value.total = 0;
    }
  } catch (error) {
    console.error('加载发现池列表失败:', error);
    message.error('加载发现池列表失败');
    pools.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

const handleCreateNew = () => {
  wizardModalRef.value?.open();
};

const handleEdit = (record: any) => {
  console.log('编辑发现池:', record);
  // TODO: 实现编辑功能
  message.info('编辑功能开发中');
};

const handleRun = async (record: any) => {
  try {
    await triggerDiscoveryPool(record.id);
    message.success('发现任务已触发');
    loadPools(); // 刷新列表
  } catch (error) {
    console.error('触发发现失败:', error);
    message.error('触发发现失败');
  }
};

const handleDelete = async (record: any) => {
  try {
    await deleteDiscoveryPool([record.id]);
    message.success('删除成功');
    loadPools(); // 刷新列表
  } catch (error) {
    console.error('删除失败:', error);
    message.error('删除失败');
  }
};

const handleToggleStatus = async (record: any, enable: boolean) => {
  try {
    if (enable) {
      await enableDiscoveryPool(record.id);
      message.success('已启用发现池');
    } else {
      await disableDiscoveryPool(record.id);
      message.success('已禁用发现池');
    }
    loadPools(); // 刷新列表
  } catch (error) {
    console.error('操作失败:', error);
    message.error('操作失败');
  }
};

// 分页变化处理
const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  loadPools();
};

// 格式化时间显示
const formatTime = (timestamp: number | null) => {
  if (!timestamp) return '-';
  return new Date(timestamp * 1000).toLocaleString();
};

// 获取状态标签样式
const getStatusTagProps = (status: string) => {
  switch (status) {
    case 'active':
      return { color: 'success', text: '启用' };
    case 'inactive':
      return { color: 'default', text: '禁用' };
    case 'error':
      return { color: 'error', text: '错误' };
    case 'maintain':
      return { color: 'warning', text: '维护' };
    default:
      return { color: 'default', text: status };
  }
};

const handleWizardSaved = () => {
  loadPools();
};

onMounted(() => {
  loadPools();
});
</script>

<template>
  <div class="discovery-pool-list">
    <div class="pool-header">
      <Button type="primary" @click="handleCreateNew">
        <template #icon><PlusOutlined /></template>
        新增发现配置
      </Button>
    </div>

    <div class="pool-content">
      <Table
        :columns="columns"
        :data-source="pools"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 1200 }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'pool_status'">
            <Tag :color="getStatusTagProps(record.pool_status).color">
              {{ getStatusTagProps(record.pool_status).text }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'discovery_type'">
            <Tag color="blue">{{ record.discovery_type }}</Tag>
          </template>
          <template v-else-if="column.key === 'last_run_at'">
            {{ formatTime(record.last_run_at) }}
          </template>
          <template v-else-if="column.key === 'stats'">
            <span>{{ record.success_runs || 0 }} / {{ record.total_runs || 0 }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <Space>
              <Button 
                type="link" 
                size="small" 
                :disabled="record.pool_status !== 'active'"
                @click="handleRun(record)"
              >
                <template #icon><PlayCircleOutlined /></template>
                执行
              </Button>
              <Button type="link" size="small" @click="handleEdit(record)">
                <template #icon><EditOutlined /></template>
                编辑
              </Button>
              <Button 
                v-if="record.pool_status === 'active'"
                type="link" 
                size="small" 
                @click="handleToggleStatus(record, false)"
              >
                <template #icon><StopOutlined /></template>
                禁用
              </Button>
              <Button 
                v-else
                type="link" 
                size="small" 
                @click="handleToggleStatus(record, true)"
              >
                <template #icon><CheckCircleOutlined /></template>
                启用
              </Button>
              <Popconfirm
                title="确定要删除这个发现池吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <Button type="link" size="small" danger>
                  <template #icon><DeleteOutlined /></template>
                  删除
                </Button>
              </Popconfirm>
            </Space>
          </template>
        </template>
      </Table>

      <Empty v-if="!loading && pools.length === 0" description="暂无发现池配置" style="padding: 60px 0">
        <Button type="primary" @click="handleCreateNew">
          <template #icon><PlusOutlined /></template>
          创建第一个发现池
        </Button>
      </Empty>
    </div>

    <DiscoveryWizardModal
      ref="wizardModalRef"
      :type-id="props.typeId"
      @saved="handleWizardSaved"
    />
  </div>
</template>

<style scoped lang="less">
.discovery-pool-list {
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;

  .pool-header {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 16px;
  }

  .pool-content {
    :deep(.ant-table) {
      background-color: #fff;
    }

    :deep(.ant-table-thead > tr > th) {
      padding: 12px 16px;
      font-weight: 500;
      background-color: #f7f9fc;
    }

    :deep(.ant-table-tbody > tr > td) {
      padding: 12px 16px;
    }
  }
}
</style>
