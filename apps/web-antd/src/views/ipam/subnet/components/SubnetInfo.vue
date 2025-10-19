<script setup lang="ts">
import type { IpamSubnet } from '../../../../api/ipam/types';

import { computed } from 'vue';

import { Card, Descriptions, Tag } from 'ant-design-vue';

interface Props {
  subnet?: IpamSubnet;
}

const props = defineProps<Props>();

// 格式化时间
function formatTime(timestamp?: number) {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleString();
}

// 计算分配策略文本
const allocationStrategyText = computed(() => {
  switch (props.subnet?.allocationStrategy) {
    case 'random': {
      return '随机分配';
    }
    case 'sequential': {
      return '顺序分配';
    }
    default: {
      return props.subnet?.allocationStrategy || '-';
    }
  }
});

// 计算分配策略颜色
const allocationStrategyColor = computed(() => {
  switch (props.subnet?.allocationStrategy) {
    case 'random': {
      return 'green';
    }
    case 'sequential': {
      return 'blue';
    }
    default: {
      return 'default';
    }
  }
});

// 计算状态文本
const statusText = computed(() => {
  return props.subnet?.status === 1 ? '正常' : '禁用';
});

// 计算状态颜色
const statusColor = computed(() => {
  return props.subnet?.status === 1 ? 'success' : 'default';
});
</script>

<script lang="ts">
export default {
  name: 'SubnetInfo',
};
</script>

<template>
  <div class="subnet-info">
    <Card title="基础信息">
      <Descriptions :column="3" bordered>
        <Descriptions.Item label="网段名称">
          {{ subnet?.name || '-' }}
        </Descriptions.Item>
        <Descriptions.Item label="CIDR地址">
          <Tag color="blue">{{ subnet?.cidr }}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="网关地址">
          {{ subnet?.gateway || '-' }}
        </Descriptions.Item>
        <Descriptions.Item label="所属网域">
          {{ subnet?.domainName || '-' }}
        </Descriptions.Item>
        <Descriptions.Item label="VLAN">
          {{ subnet?.vlanName || '-' }}
        </Descriptions.Item>
        <Descriptions.Item label="分配策略">
          <Tag :color="allocationStrategyColor">
            {{ allocationStrategyText }}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag :color="statusColor">
            {{ statusText }}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {{ formatTime(subnet?.createdAt) }}
        </Descriptions.Item>
        <Descriptions.Item label="描述">
          {{ subnet?.description || '-' }}
        </Descriptions.Item>
      </Descriptions>
    </Card>

    <!-- 统计信息 -->
    <Card title="统计信息" class="mt-4" v-if="subnet?.statistics">
      <Descriptions :column="3" bordered>
        <Descriptions.Item label="总IP地址数">
          <span class="font-semibold text-blue-600">
            {{ subnet.statistics.totalIps }}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="已分配">
          <span class="font-semibold text-green-600">
            {{ subnet.statistics.allocatedIps }}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="可用">
          <span class="font-semibold text-purple-600">
            {{ subnet.statistics.availableIps }}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="保留">
          <span class="font-semibold text-orange-600">
            {{ subnet.statistics.reservedIps }}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="冲突">
          <span class="font-semibold text-red-600">
            {{ subnet.statistics.conflictIps }}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="分配率">
          <span
            class="font-semibold"
            :class="[
              subnet.statistics.allocationRate > 0.8
                ? 'text-red-600'
                : subnet.statistics.allocationRate > 0.6
                  ? 'text-orange-600'
                  : 'text-green-600',
            ]"
          >
            {{ Math.round(subnet.statistics.allocationRate) }}%
          </span>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  </div>
</template>

<style scoped>
.subnet-info .mt-4 {
  margin-top: 16px;
}

.subnet-info .text-blue-600 {
  color: #1890ff;
}

.subnet-info .text-green-600 {
  color: #52c41a;
}

.subnet-info .text-purple-600 {
  color: #722ed1;
}

.subnet-info .text-orange-600 {
  color: #fa8c16;
}

.subnet-info .text-red-600 {
  color: #ff4d4f;
}

.subnet-info .font-semibold {
  font-weight: 600;
}
</style>
