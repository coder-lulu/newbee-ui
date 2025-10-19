<script setup lang="ts">
import type {
  IpamDomain,
  IpamSubnet,
  IpamVlan,
  Status,
} from '../../../../api/ipam/types';

import { reactive, ref, watch } from 'vue';

import { Form, Input, message, Modal, Select, Switch } from 'ant-design-vue';

import { DomainApi } from '../../../../api/ipam/domain';
import { SubnetApi } from '../../../../api/ipam/subnet';
import { VlanApi } from '../../../../api/ipam/vlan';

interface Props {
  visible: boolean;
  mode: 'create' | 'edit';
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
  domainId: undefined as number | undefined,
  cidr: '',
  vlanId: undefined as number | undefined,
  name: '',
  gateway: '',
  allocationStrategy: 'sequential' as any,
  description: '',
  status: 1 as Status,
});

// 表单规则
const rules = {
  domainId: [{ required: true, message: '请选择网域' }],
  cidr: [
    { required: true, message: '请输入CIDR地址' },
    { pattern: /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/, message: 'CIDR格式不正确' },
    { validator: validateCidrInDomain, trigger: 'blur' },
  ],
  name: [{ required: true, message: '请输入网段名称' }],
  gateway: [
    { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: 'IP地址格式不正确' },
  ],
};

// 选项数据
const domainOptions = ref<
  { cidrRanges: string; label: string; value: number }[]
>([]);
const vlanOptions = ref<{ label: string; value: number }[]>([]);
const allocationStrategyOptions = [
  { label: '顺序分配', value: 'sequential' },
  { label: '随机分配', value: 'random' },
  { label: '自定义', value: 'custom' },
];

const loading = ref(false);
const formRef = ref();

// 验证CIDR是否在网域范围内
async function validateCidrInDomain(_rule: any, value: string) {
  if (!value || !formData.domainId) return;

  const selectedDomain = domainOptions.value.find(
    (d) => d.value === formData.domainId,
  );
  if (!selectedDomain) return;

  try {
    const cidrRanges = JSON.parse(selectedDomain.cidrRanges || '[]');
    if (!cidrRanges || cidrRanges.length === 0) return;

    // 简单的CIDR范围验证（这里应该使用更严格的IP网络验证）
    const isInRange = cidrRanges.some((range: string) => {
      const rangeParts = range.split('/');
      const valueParts = value.split('/');
      const rangeNetwork = rangeParts[0];
      const inputNetwork = valueParts[0];

      if (!rangeNetwork || !inputNetwork) return false;

      // 简化验证：检查网络地址是否以相同前缀开始
      return inputNetwork.startsWith(
        rangeNetwork.split('.').slice(0, 2).join('.'),
      );
    });

    if (!isInRange) {
      throw new Error(`CIDR地址必须在网域范围${cidrRanges.join(', ')}内`);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

// 加载网域选项
async function loadDomainOptions() {
  try {
    const listData = await DomainApi.list({ page: 1, pageSize: 100 });
    domainOptions.value = listData.data.map((domain: IpamDomain) => ({
      label: domain.name,
      value: domain.id,
      cidrRanges: domain.cidrRanges,
    }));
  } catch (error) {
    console.error('加载网域选项失败:', error);
  }
}

// 加载VLAN选项
async function loadVlanOptions() {
  try {
    if (!formData.domainId) {
      vlanOptions.value = [];
      return;
    }

    const listData = await VlanApi.list({
      page: 1,
      pageSize: 100,
      domainId: formData.domainId,
      status: 1, // 只显示正常状态的VLAN
    });
    if (listData.data) {
      vlanOptions.value = listData.data.map((vlan: IpamVlan) => ({
        label: `VLAN ${vlan.vlanId} - ${vlan.name}`,
        value: vlan.vlanId,
      }));
    }
  } catch (error) {
    console.error('加载VLAN选项失败:', error);
  }
}

// 监听网域变化，重新加载VLAN选项
watch(
  () => formData.domainId,
  (newDomainId) => {
    if (newDomainId) {
      loadVlanOptions();
      // 重新验证CIDR
      if (formData.cidr && formRef.value) {
        formRef.value.validateFields(['cidr']);
      }
    } else {
      vlanOptions.value = [];
      formData.vlanId = undefined;
    }
  },
);

// 重置表单
function resetForm() {
  formData.domainId = 0;
  formData.cidr = '';
  formData.vlanId = undefined;
  formData.name = '';
  formData.gateway = '';
  formData.allocationStrategy = 'sequential';
  formData.description = '';
  formData.status = 1;
  vlanOptions.value = [];
}

// 监听visible变化
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      // 每次打开模态框时清除验证状态
      formRef.value?.clearValidate();

      loadDomainOptions();
      if (props.mode === 'edit' && props.record) {
        // 编辑模式，填充数据
        Object.assign(formData, props.record);
        // 加载对应网域的VLAN选项
        if (formData.domainId) {
          loadVlanOptions();
        }
      } else {
        // 新建模式，重置表单
        resetForm();
      }
    } else {
      // 关闭时也清除验证状态
      formRef.value?.clearValidate();
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
      await SubnetApi.create(formData);
      message.success('创建成功');
      emit('success');
      emit('update:visible', false);
    } else {
      await SubnetApi.update({
        ...formData,
        id: props.record!.id,
      });
      message.success('更新成功');
      emit('success');
      emit('update:visible', false);
    }
  } catch (error) {
    console.error('操作失败:', error);
  } finally {
    loading.value = false;
  }
}

// 导出组件
defineExpose({});
</script>

<script lang="ts">
export default {
  name: 'SubnetModal',
};
</script>

<!-- eslint-disable vue/no-v-model-argument -->
<template>
  <Modal
    :open="visible"
    :title="mode === 'create' ? '新建网段' : '编辑网段'"
    :confirm-loading="loading"
    width="600px"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <Form ref="formRef" :model="formData" :rules="rules" layout="vertical">
      <Form.Item label="网域" name="domainId">
        <Select
          v-model:value="formData.domainId"
          :options="domainOptions"
          placeholder="请选择网域"
        />
      </Form.Item>

      <Form.Item label="网段名称" name="name">
        <Input v-model:value="formData.name" placeholder="请输入网段名称" />
      </Form.Item>

      <Form.Item label="CIDR地址" name="cidr">
        <Input
          v-model:value="formData.cidr"
          placeholder="例如：192.168.1.0/24"
        />
        <div style="margin-top: 4px; font-size: 12px; color: #666">
          网段CIDR必须在所选网域的CIDR范围内
        </div>
      </Form.Item>

      <Form.Item label="网关地址" name="gateway">
        <Input
          v-model:value="formData.gateway"
          placeholder="例如：192.168.1.1"
        />
      </Form.Item>

      <Form.Item label="VLAN" name="vlanId">
        <Select
          v-model:value="formData.vlanId"
          :options="vlanOptions"
          placeholder="请选择VLAN（可选）"
          allow-clear
          :disabled="!formData.domainId"
        />
        <div
          v-if="!formData.domainId"
          style="margin-top: 4px; font-size: 12px; color: #999"
        >
          请先选择网域以加载对应的VLAN选项
        </div>
      </Form.Item>

      <Form.Item label="分配策略" name="allocationStrategy">
        <Select
          v-model:value="formData.allocationStrategy"
          :options="allocationStrategyOptions"
          placeholder="请选择分配策略"
        />
      </Form.Item>

      <Form.Item label="状态" name="status">
        <Switch
          v-model:checked="formData.status"
          :checked-value="1"
          :un-checked-value="2"
          checked-children="正常"
          un-checked-children="禁用"
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
