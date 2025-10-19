<script setup lang="ts">
import type { IpamVlan, Status } from '../../../../api/ipam/types';

import { reactive, ref, watch } from 'vue';

import {
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Switch,
} from 'ant-design-vue';

import { DomainApi } from '#/api/ipam/domain';
import { VlanApi } from '#/api/ipam/vlan';

interface Props {
  visible: boolean;
  mode: 'create' | 'edit';
  record?: IpamVlan;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单数据
const formData = reactive({
  vlanId: undefined as number | undefined,
  name: '',
  domainId: undefined as number | undefined,
  description: '',
  status: 1 as Status,
});

// 表单规则
const rules = {
  vlanId: [
    { required: true, message: '请输入VLAN ID' },
    { type: 'number', min: 1, max: 4094, message: 'VLAN ID范围为1-4094' },
  ],
  name: [{ required: true, message: '请输入VLAN名称' }],
  domainId: [{ required: true, message: '请选择网域' }],
};

// 选项数据
const domainOptions = ref<{ label: string; value: number }[]>([]);

const loading = ref(false);
const formRef = ref();

// 加载网域选项
async function loadDomainOptions() {
  try {
    const listData = await DomainApi.list({ page: 1, pageSize: 100 });
    domainOptions.value = listData.data.map((domain) => ({
      label: domain.name,
      value: domain.id,
    }));
  } catch (error) {
    console.error('加载网域选项失败:', error);
  }
}

// 重置表单
function resetForm() {
  formData.vlanId = undefined;
  formData.name = '';
  formData.domainId = undefined;
  formData.description = '';
  formData.status = 1;
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
      await VlanApi.create({
        ...formData,
        domainId: formData.domainId!,
      });
      message.success('创建成功');
      emit('success');
      emit('update:visible', false);
    } else {
      await VlanApi.update({
        ...formData,
        domainId: formData.domainId!,
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
</script>

<template>
  <Modal
    :open="visible"
    :title="mode === 'create' ? '新建VLAN' : '编辑VLAN'"
    :confirm-loading="loading"
    width="600px"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <Form ref="formRef" :model="formData" :rules="rules" layout="vertical">
      <Form.Item label="VLAN ID" name="vlanId">
        <InputNumber
          v-model:value="formData.vlanId"
          :min="1"
          :max="4094"
          placeholder="请输入VLAN ID (1-4094)"
          style="width: 100%"
        />
      </Form.Item>

      <Form.Item label="VLAN名称" name="name">
        <Input v-model:value="formData.name" placeholder="请输入VLAN名称" />
      </Form.Item>

      <Form.Item label="所属网域" name="domainId">
        <Select
          v-model:value="formData.domainId"
          :options="domainOptions"
          placeholder="请选择网域"
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
