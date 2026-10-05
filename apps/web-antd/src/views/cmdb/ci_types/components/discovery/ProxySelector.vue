<script lang="ts" setup>
import type { DiscoveryMethod } from './DiscoveryMethodSelector.vue';

import { computed, onMounted, ref } from 'vue';

import {
  CheckCircleOutlined,
  DesktopOutlined,
  InfoCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue';
import { Alert, Card, Col, Empty, message, Radio, Row, Spin, Tag, Tabs } from 'ant-design-vue';
import { listProxies, type ProxyItem } from '#/api/ops-center/proxy';
import { listProxyGroups, type ProxyGroupItem } from '#/api/ops-center/proxy-group';

interface Props {
  selectedAgentId: string | null;
  method: DiscoveryMethod | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  agentSelected: [agentId: string, agentInfo: any];
}>();

// 选择模式：worker（单个Worker）或 group（Worker分组）
const selectionMode = ref<'worker' | 'group'>('worker');

// Worker列表
const workersLoading = ref(false);
const workers = ref<ProxyItem[]>([]);
const selectedWorker = ref<string | null>(null);

// ProxyGroup列表
const groupsLoading = ref(false);
const workerGroups = ref<ProxyGroupItem[]>([]);
const selectedGroup = ref<number | null>(null);

// 加载Worker列表
const loadWorkers = async () => {
  try {
    workersLoading.value = true;

    // 调用ops-center API获取Worker列表
    const response = await listProxies({
      page: 1,
      pageSize: 100,
      // workerStatus: 'online', // 只获取在线的Worker
    });

    workers.value = response.data || [];

    if (workers.value.length === 0) {
      message.warning('暂无在线Worker，请先启动Worker服务');
    }
  } catch (error) {
    console.error('加载Worker失败:', error);
    message.error('加载Worker列表失败');
    workers.value = [];
  } finally {
    workersLoading.value = false;
  }
};

// 加载ProxyGroup列表
const loadWorkerGroups = async () => {
  try {
    groupsLoading.value = true;

    const response = await listProxyGroups({
      page: 1,
      pageSize: 100,
      status: 1, // 只获取启用状态的分组
    });

    workerGroups.value = response.data || [];

    if (workerGroups.value.length === 0) {
      message.warning('暂无Proxy分组，请先创建分组');
    }
  } catch (error) {
    console.error('加载Proxy分组失败:', error);
    message.error('加载Proxy分组列表失败');
    workerGroups.value = [];
  } finally {
    groupsLoading.value = false;
  }
};

// 选择Worker
const handleSelectWorker = (workerId: string) => {
  selectedWorker.value = workerId;
  selectedGroup.value = null;
  const workerInfo = workers.value.find((w) => w.workerId === workerId);

  // 发送选择事件，传递worker信息
  emit('agentSelected', workerId, {
    type: 'worker',
    workerId: workerId,
    name: workerInfo?.name,
    ip: workerInfo?.ip,
    port: workerInfo?.port,
  });
};

// 选择WorkerGroup
const handleSelectGroup = (groupId: number) => {
  selectedGroup.value = groupId;
  selectedWorker.value = null;
  const groupInfo = workerGroups.value.find((g) => g.id === groupId);

  // 发送选择事件，传递分组信息
  emit('agentSelected', `group:${groupId}`, {
    type: 'group',
    groupId: groupId,
    name: groupInfo?.name,
    memberCount: groupInfo?.memberCount,
    onlineCount: groupInfo?.onlineCount,
  });
};

// 切换选择模式
const handleModeChange = () => {
  selectedWorker.value = null;
  selectedGroup.value = null;
};

// 是否有选择
const hasSelection = computed(() => {
  return selectedWorker.value !== null || selectedGroup.value !== null;
});

onMounted(() => {
  loadWorkers();
  loadWorkerGroups();
});
</script>

<template>
  <div class="worker-selector">
    <div class="selector-header">
      <h3>选择执行代理</h3>
      <p>选择一个Worker或Worker分组来执行发现任务</p>
    </div>

    <Alert
      message="代理说明"
      description="Worker需要能够访问目标系统。选择单个Worker可以精确控制，选择分组可以实现负载均衡和高可用。"
      type="info"
      show-icon
      closable
      style="margin-bottom: 24px"
    />

    <Tabs v-model:activeKey="selectionMode" @change="handleModeChange">
      <Tabs.TabPane key="worker" tab="单个Worker">
        <Spin :spinning="workersLoading">
          <div class="workers-list">
            <Row :gutter="[16, 16]">
              <Col
                v-for="worker in workers"
                :key="worker.workerId"
                :xs="24"
                :sm="12"
                :md="8"
              >
                <Card
                  hoverable
                  :class="['worker-card', { selected: selectedWorker === worker.workerId }]"
                  @click="handleSelectWorker(worker.workerId)"
                >
                  <div class="worker-header">
                    <DesktopOutlined style="font-size: 24px; color: #1890ff" />
                    <Tag
                      :color="
                        worker.workerStatus === 'online'
                          ? 'success'
                          : worker.workerStatus === 'degraded'
                            ? 'warning'
                            : 'default'
                      "
                      style="margin-left: auto"
                    >
                      {{
                        worker.workerStatus === 'online'
                          ? '在线'
                          : worker.workerStatus === 'degraded'
                            ? '降级'
                            : '离线'
                      }}
                    </Tag>
                  </div>
                  <div class="worker-info">
                    <h4>{{ worker.name }}</h4>
                    <div class="info-row">
                      <span class="label">主机:</span>
                      <span class="value">{{ worker.ip }}:{{ worker.port }}</span>
                    </div>
                    <div class="info-row" v-if="worker.region">
                      <span class="label">区域:</span>
                      <span class="value">{{ worker.region }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">负载:</span>
                      <span class="value"
                        >CPU: {{ worker.cpuUsage?.toFixed(1) || 0 }}% / MEM:
                        {{ worker.memoryUsage?.toFixed(1) || 0 }}%</span
                      >
                    </div>
                    <div class="info-row">
                      <span class="label">会话:</span>
                      <span class="value"
                        >{{ worker.activeSessions || 0 }} / {{ worker.maxSessions || 0 }}</span
                      >
                    </div>
                  </div>
                  <CheckCircleOutlined
                    v-if="selectedWorker === worker.workerId"
                    class="selected-icon"
                    style="font-size: 24px; color: #52c41a"
                  />
                </Card>
              </Col>
            </Row>

            <Empty v-if="!workersLoading && workers.length === 0" description="暂无可用Worker">
              <p style="margin-top: 16px; color: #999">请先在OPS-Center中部署和激活Worker</p>
            </Empty>
          </div>
        </Spin>
      </Tabs.TabPane>

      <Tabs.TabPane key="group" tab="Worker分组">
        <Spin :spinning="groupsLoading">
          <div class="groups-list">
            <Row :gutter="[16, 16]">
              <Col
                v-for="group in workerGroups"
                :key="group.id"
                :xs="24"
                :sm="12"
                :md="8"
              >
                <Card
                  hoverable
                  :class="['group-card', { selected: selectedGroup === group.id }]"
                  @click="handleSelectGroup(group.id)"
                >
                  <div class="group-header">
                    <TeamOutlined style="font-size: 24px; color: #722ed1" />
                    <Tag
                      :color="group.onlineCount > 0 ? 'success' : 'default'"
                      style="margin-left: auto"
                    >
                      {{ group.onlineCount }} / {{ group.memberCount }} 在线
                    </Tag>
                  </div>
                  <div class="group-info">
                    <h4>{{ group.name }}</h4>
                    <div class="info-row" v-if="group.description">
                      <span class="label">描述:</span>
                      <span class="value">{{ group.description }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">策略:</span>
                      <span class="value">
                        {{
                          group.selectionStrategy === 'round_robin'
                            ? '轮询'
                            : group.selectionStrategy === 'least_connections'
                              ? '最少连接'
                              : group.selectionStrategy === 'weighted'
                                ? '加权'
                                : group.selectionStrategy
                        }}
                      </span>
                    </div>
                    <div class="info-row">
                      <span class="label">成员:</span>
                      <span class="value">{{ group.memberCount }} 个Worker</span>
                    </div>
                    <div class="info-row">
                      <span class="label">自动故障转移:</span>
                      <span class="value">{{ group.autoFailover ? '启用' : '禁用' }}</span>
                    </div>
                  </div>
                  <CheckCircleOutlined
                    v-if="selectedGroup === group.id"
                    class="selected-icon"
                    style="font-size: 24px; color: #52c41a"
                  />
                </Card>
              </Col>
            </Row>

            <Empty
              v-if="!groupsLoading && workerGroups.length === 0"
              description="暂无Worker分组"
            >
              <p style="margin-top: 16px; color: #999">请先在OPS-Center中创建Worker分组</p>
            </Empty>
          </div>
        </Spin>
      </Tabs.TabPane>
    </Tabs>
  </div>
</template>

<style scoped lang="less">
.worker-selector {
  .selector-header {
    margin-bottom: 16px;
    text-align: center;

    h3 {
      margin-bottom: 4px;
      font-size: 16px;
      font-weight: 500;
    }

    p {
      color: #666;
      font-size: 13px;
    }
  }

  :deep(.ant-alert) {
    margin-bottom: 12px;
  }

  .workers-list,
  .groups-list {
    .worker-card,
    .group-card {
      position: relative;
      height: 220px;
      transition: all 0.3s;
      cursor: pointer;
      box-shadow: 0 1px 2px rgb(0 0 0 / 5%);

      &:hover {
        border-color: #1890ff;
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
      }

      &.selected {
        border-color: #52c41a;
        background: #f6ffed;
        box-shadow: 0 4px 12px rgba(82, 196, 26, 0.25);
      }

      :deep(.ant-card-body) {
        height: 100%;
        padding: 14px;
      }

      .worker-header,
      .group-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
      }

      .worker-info,
      .group-info {
        h4 {
          margin-bottom: 10px;
          font-size: 15px;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .info-row {
          display: flex;
          margin-bottom: 6px;
          font-size: 12px;

          .label {
            min-width: 50px;
            color: #666;
            flex-shrink: 0;
          }

          .value {
            color: #333;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }

      .selected-icon {
        position: absolute;
        top: 14px;
        right: 14px;
      }
    }
  }
}
</style>
