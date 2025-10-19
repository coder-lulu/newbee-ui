<script setup lang="ts">
import type {
  DomainType,
  IpamDomain,
  Status,
} from '../../../../api/ipam/types';

import { nextTick, reactive, ref, watch } from 'vue';

import { Form, Input, message, Modal, Select, Switch } from 'ant-design-vue';

import { DomainApi } from '../../../../api/ipam/domain';

interface Props {
  visible: boolean;
  mode: 'create' | 'edit';
  record?: IpamDomain;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单数据
const formData = reactive({
  name: '',
  type: '业务域' as DomainType,
  cidrRanges: '',
  description: '',
  status: 1 as Status,
});

// 表单规则
const rules = {
  name: [
    { required: true, message: '请输入网域名称' },
    { min: 2, max: 50, message: '网域名称长度为2-50个字符' },
  ],
  type: [{ required: true, message: '请选择网域类型' }],
  cidrRanges: [
    { required: true, message: '请输入CIDR范围' },
    {
      validator: (_rule: any, value: string) => {
        if (!value) return Promise.resolve();
        try {
          const ranges = value.split(',').map((r) => r.trim());
          const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
          const valid = ranges.every((range) => cidrRegex.test(range));
          return valid
            ? Promise.resolve()
            : Promise.reject('CIDR格式不正确，多个CIDR用逗号分隔');
        } catch {
          return Promise.reject('CIDR格式不正确');
        }
      },
    },
  ],
};

// 网域类型选项
const typeOptions = [
  { label: '安全域', value: '安全域' },
  { label: '业务域', value: '业务域' },
  { label: '自定义', value: '自定义' },
];

const loading = ref(false);
const formRef = ref();

// 重置表单
function resetForm() {
  formData.name = '';
  formData.type = '业务域' as DomainType;
  formData.cidrRanges = '';
  formData.description = '';
  formData.status = 1;
}

// 监听visible变化
watch(
  () => props.visible,
  async (visible) => {
    if (visible) {
      if (props.mode === 'edit' && props.record) {
        // 编辑模式，填充数据
        formData.name = props.record.name;
        formData.type = props.record.type;
        formData.description = props.record.description || '';
        formData.status = props.record.status;
        // 解析CIDR范围
        try {
          const ranges = JSON.parse(props.record.cidrRanges || '[]');
          formData.cidrRanges = ranges.join(', ');
        } catch {
          formData.cidrRanges = props.record.cidrRanges || '';
        }
      } else {
        // 新建模式，重置表单
        resetForm();
      }

      // 在下一个tick清除验证状态，确保数据已经更新
      await nextTick();
      formRef.value?.clearValidate();
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

    // 处理CIDR范围数据
    const cidrRanges = formData.cidrRanges
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const submitData = {
      name: formData.name,
      type: formData.type,
      cidrRanges: JSON.stringify(cidrRanges),
      description: formData.description,
      status: formData.status,
    };

    if (props.mode === 'create') {
      await DomainApi.create(submitData);
      message.success('创建成功');
      emit('success');
      emit('update:visible', false);
    } else {
      await DomainApi.update({
        ...submitData,
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
    :title="mode === 'create' ? '新建网域' : '编辑网域'"
    :confirm-loading="loading"
    width="600px"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <Form ref="formRef" :model="formData" :rules="rules" layout="vertical">
      <Form.Item label="网域名称" name="name">
        <Input v-model:value="formData.name" placeholder="请输入网域名称" />
      </Form.Item>

      <Form.Item label="网域类型" name="type">
        <Select
          v-model:value="formData.type"
          :options="typeOptions"
          placeholder="请选择网域类型"
        />
      </Form.Item>

      <Form.Item label="CIDR范围" name="cidrRanges">
        <Input.TextArea
          v-model:value="formData.cidrRanges"
          :rows="3"
          placeholder="请输入CIDR范围，多个用逗号分隔，例如：192.168.1.0/24, 10.0.0.0/8"
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
