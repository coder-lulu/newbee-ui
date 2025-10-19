<script setup lang="ts">
import type { AllocationStrategy, IpamSubnet, Status } from '#/api/ipam';

import { reactive, ref, watch } from 'vue';

import {
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
} from 'ant-design-vue';

import { SubnetApi } from '#/api/ipam';

interface Props {
  visible: boolean;
  mode: 'create' | 'edit';
  domainId?: number;
  record?: IpamSubnet;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单数据
const formData = reactive({
  domainId: 0,
  cidr: '',
  vlanId: undefined as number | undefined,
  name: '',
  gateway: '',
  allocationStrategy: 'sequential' as AllocationStrategy,
  description: '',
  status: 1 as Status,
});

// 表单规则
const rules = {
  cidr: [
    { required: true, message: '请输入CIDR地址' },
    { pattern: /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/, message: 'CIDR格式不正确' },
  ],
  name: [{ required: true, message: '请输入网段名称' }],
  gateway: [
    { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: 'IP地址格式不正确' },
  ],
};

// 分配策略选项
const strategyOptions = [
  { label: '顺序分配', value: 'sequential' },
  { label: '随机分配', value: 'random' },
  { label: '自定义', value: 'custom' },
];

// 状态选项
const statusOptions = [
  { label: '正常', value: 1 },
  { label: '禁用', value: 2 },
];

const loading = ref(false);
const formRef = ref();

// 重置表单
function resetForm() {
  formData.domainId = props.domainId || 0;
  formData.cidr = '';
  formData.vlanId = undefined;
  formData.name = '';
  formData.gateway = '';
  formData.allocationStrategy = 'sequential';
  formData.description = '';
  formData.status = 1;
}

// 监听visible变化
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      if (props.mode === 'edit' && props.record) {
        // 编辑模式，填充数据
        Object.assign(formData, props.record);
      } else {
        // 新建模式，重置表单
        resetForm();
      }
    }
  },
);

// 关闭模态框
function handleCancel() {
  emit('update:visible', false);
}

// 提交表单
async function handleOk() {
  try {
    await formRef.value.validate();
    loading.value = true;

    if (props.mode === 'create') {
      const response = await SubnetApi.create(formData);
      if (response.code === 0) {
        message.success('创建成功');
        emit('success');
        emit('update:visible', false);
      } else {
        message.error(response.msg || '创建失败');
      }
    } else {
      const response = await SubnetApi.update({
        ...formData,
        id: props.record!.id,
      });
      if (response.code === 0) {
        message.success('更新成功');
        emit('success');
        emit('update:visible', false);
      } else {
        message.error(response.msg || '更新失败');
      }
    }
  } catch (error) {
    console.error('操作失败:', error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Modal
    :open="visible"
    :title="mode === 'create' ? '新建网段' : '编辑网段'"
    :confirm-loading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <Form ref="formRef" :model="formData" :rules="rules" layout="vertical">
      <Form.Item label="网段名称" name="name">
        <Input v-model:value="formData.name" placeholder="请输入网段名称" />
      </Form.Item>

      <Form.Item label="CIDR地址" name="cidr">
        <Input
          v-model:value="formData.cidr"
          placeholder="例如：192.168.1.0/24"
        />
      </Form.Item>

      <Form.Item label="网关地址" name="gateway">
        <Input
          v-model:value="formData.gateway"
          placeholder="例如：192.168.1.1"
        />
      </Form.Item>

      <Form.Item label="VLAN ID" name="vlanId">
        <InputNumber
          v-model:value="formData.vlanId"
          :min="1"
          :max="4094"
          placeholder="请输入VLAN ID"
          style="width: 100%"
        />
      </Form.Item>

      <Form.Item label="分配策略" name="allocationStrategy">
        <Select
          v-model:value="formData.allocationStrategy"
          :options="strategyOptions"
          placeholder="请选择分配策略"
        />
      </Form.Item>

      <Form.Item label="状态" name="status">
        <Select
          v-model:value="formData.status"
          :options="statusOptions"
          placeholder="请选择状态"
        />
      </Form.Item>

      <Form.Item label="描述" name="description">
        <Input.TextArea
          v-model:value="formData.description"
          :rows="3"
          placeholder="请输入描述信息"
        />
      </Form.Item>
    </Form>
  </Modal>
</template>
