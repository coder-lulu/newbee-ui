<script lang="ts" setup>
import type { DiscoveryMethod } from './DiscoveryMethodSelector.vue';

import { onMounted, ref } from 'vue';

import { CheckCircleOutlined, DesktopOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import { Alert, Card, Col, Empty, message, Radio, Row, Spin, Tag } from 'ant-design-vue';

interface Props {
  selectedAgentId: string | null;
  method: DiscoveryMethod | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  agentSelected: [agentId: string, agentInfo: any];
}>();

// 代理列表
const loading = ref(false);
const agents = ref<any[]>([]);
const selectedAgent = ref<string | null>(props.selectedAgentId);

// 加载代理列表
const loadAgents = async () => {
  try {
    loading.value = true;
    // TODO: 调用ops-center API获取代理列表
    // const response = await getAgentList({ status: 'online' });

    // 模拟数据
    agents.value = [
      {
        id: 'agent-001',
        name: 'OPS-Agent-Beijing-01',
        host: '10.0.1.10',
        status: 'online',
        os: 'Linux',
        version: '1.0.5',
        tags: ['生产环境', '华北'],
      },
      {
        id: 'agent-002',
        name: 'OPS-Agent-Shanghai-01',
        host: '10.0.2.10',
        status: 'online',
        os: 'Linux',
        version: '1.0.5',
        tags: ['生产环境', '华东'],
      },
      {
        id: 'agent-003',
        name: 'OPS-Agent-Guangzhou-01',
        host: '10.0.3.10',
        status: 'online',
        os: 'Linux',
        version: '1.0.4',
        tags: ['测试环境', '华南'],
      },
    ];
  } catch (error) {
    console.error('加载代理失败:', error);
    message.error('加载代理列表失败');
  } finally {
    loading.value = false;
  }
};

// 选择代理
const handleSelectAgent = (agentId: string) => {
  selectedAgent.value = agentId;
  const agentInfo = agents.value.find((a) => a.id === agentId);
  emit('agentSelected', agentId, agentInfo);
};

onMounted(() => {
  loadAgents();
});
</script>

<template>
  <div class="agent-selector">
    <div class="selector-header">
      <h3>选择执行代理</h3>
      <p>选择一个OPS-Center代理来执行发现任务</p>
    </div>

    <Alert
      message="代理说明"
      description="代理需要能够访问目标系统。请选择网络连通性好、负载较低的代理。"
      type="info"
      show-icon
      closable
      style="margin-bottom: 24px"
    />

    <Spin :spinning="loading">
      <div class="agents-list">
        <Row :gutter="[16, 16]">
          <Col v-for="agent in agents" :key="agent.id" :xs="24" :sm="12" :md="8">
            <Card
              hoverable
              :class="['agent-card', { selected: selectedAgent === agent.id }]"
              @click="handleSelectAgent(agent.id)"
            >
              <div class="agent-header">
                <DesktopOutlined style="font-size: 24px; color: #1890ff" />
                <Tag :color="agent.status === 'online' ? 'success' : 'default'" style="margin-left: auto">
                  {{ agent.status === 'online' ? '在线' : '离线' }}
                </Tag>
              </div>
              <div class="agent-info">
                <h4>{{ agent.name }}</h4>
                <div class="info-row">
                  <span class="label">主机:</span>
                  <span class="value">{{ agent.host }}</span>
                </div>
                <div class="info-row">
                  <span class="label">系统:</span>
                  <span class="value">{{ agent.os }}</span>
                </div>
                <div class="info-row">
                  <span class="label">版本:</span>
                  <span class="value">{{ agent.version }}</span>
                </div>
                <div class="agent-tags">
                  <Tag v-for="tag in agent.tags" :key="tag" size="small">{{ tag }}</Tag>
                </div>
              </div>
              <CheckCircleOutlined
                v-if="selectedAgent === agent.id"
                class="selected-icon"
                style="font-size: 24px; color: #52c41a"
              />
            </Card>
          </Col>
        </Row>

        <Empty v-if="!loading && agents.length === 0" description="暂无可用代理">
          <p style="margin-top: 16px; color: #999">
            请先在OPS-Center中部署和激活代理
          </p>
        </Empty>
      </div>
    </Spin>
  </div>
</template>

<style scoped lang="less">
.agent-selector {
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

  .agents-list {
    .agent-card {
      position: relative;
      height: 200px;
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

      .agent-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
      }

      .agent-info {
        h4 {
          margin-bottom: 10px;
          font-size: 15px;
          font-weight: 500;
        }

        .info-row {
          display: flex;
          margin-bottom: 6px;
          font-size: 12px;

          .label {
            min-width: 50px;
            color: #666;
          }

          .value {
            color: #333;
            font-family: 'Courier New', monospace;
          }
        }

        .agent-tags {
          margin-top: 10px;
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
