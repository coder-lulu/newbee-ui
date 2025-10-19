<script setup lang="ts">
import type { ActionType, IpamIPRecord } from '../../../../api/ipam/types';

import { computed } from 'vue';

import { Descriptions, Modal, Tag } from 'ant-design-vue';

interface Props {
  visible: boolean;
  record?: IpamIPRecord;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 操作类型颜色映射
const actionColors: Record<ActionType, string> = {
  allocate: 'blue',
  release: 'orange',
  batch_allocate: 'purple',
  batch_release: 'red',
};

const actionText: Record<ActionType, string> = {
  allocate: '分配',
  release: '回收',
  batch_allocate: '批量分配',
  batch_release: '批量回收',
};

// 格式化时间
const formattedTime = computed(() => {
  if (!props.record?.createdAt) return '-';
  return new Date(props.record.createdAt * 1000).toLocaleString();
});

// 关闭模态框
function handleCancel() {
  emit('update:visible', false);
}
</script>

<template>
  <Modal
    :open="visible"
    title="操作记录详情"
    :footer="null"
    width="600px"
    @cancel="handleCancel"
  >
    <Descriptions v-if="record" :column="2" bordered>
      <Descriptions.Item label="IP地址" :span="2">
        {{ record.ipAddr || '-' }}
      </Descriptions.Item>

      <Descriptions.Item label="操作类型">
        <Tag :color="actionColors[record.action]">
          {{ actionText[record.action] }}
        </Tag>
      </Descriptions.Item>

      <Descriptions.Item label="操作人">
        {{ record.operator }}
      </Descriptions.Item>

      <Descriptions.Item label="资产ID">
        {{ record.assetId || '-' }}
      </Descriptions.Item>

      <Descriptions.Item label="网域">
        {{ record.domainName || record.domainId }}
      </Descriptions.Item>

      <Descriptions.Item label="网段">
        {{ record.subnetName || record.subnetId }}
      </Descriptions.Item>

      <Descriptions.Item label="IP记录ID">
        {{ record.ipId }}
      </Descriptions.Item>

      <Descriptions.Item label="操作时间" :span="2">
        {{ formattedTime }}
      </Descriptions.Item>

      <Descriptions.Item label="备注" :span="2">
        {{ record.remark || '-' }}
      </Descriptions.Item>
    </Descriptions>
  </Modal>
</template>
