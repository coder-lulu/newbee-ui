<script setup lang="ts">
import type { IpamIP, IPStatus, OnlineStatus, Status } from '#/api/ipam';

import { reactive, ref, watch, withDefaults } from 'vue';

import { PlusOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Switch,
  Tag,
} from 'ant-design-vue';

import { IPApi, SubnetApi } from '#/api/ipam';

import CiSelector from '../../../cmdb/cis/components/CiSelector.vue';

interface Props {
  visible: boolean;
  mode: 'create' | 'edit';
  record?: IpamIP;
  showAssetSelector?: boolean; // 是否显示资产选择器，默认true
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  showAssetSelector: true,
  record: undefined,
});
const emit = defineEmits<Emits>();

// 表单数据
const formData = reactive({
  subnetId: 0,
  ipAddr: '',
  macAddr: '',
  assetId: undefined as number | undefined,
  ipStatus: 'free' as IPStatus,
  onlineStatus: 'unknown' as OnlineStatus,
  description: '',
  status: 1 as Status,
});

// 表单规则
const rules = {
  subnetId: [{ required: true, message: '请选择网段' }],
  ipAddr: [
    { required: true, message: '请输入IP地址' },
    { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: 'IP地址格式不正确' },
  ],
  macAddr: [
    {
      pattern: /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i,
      message: 'MAC地址格式不正确',
    },
  ],
};

// 选项数据
const subnetOptions = ref<{ label: string; value: number }[]>([]);
const ipStatusOptions = [
  { label: '空闲', value: 'free' },
  { label: '已分配', value: 'allocated' },
  { label: '保留', value: 'reserved' },
  { label: '回收中', value: 'recycling' },
  { label: '冲突', value: 'conflict' },
];

const onlineStatusOptions = [
  { label: '未知', value: 'unknown' },
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' },
];

const loading = ref(false);
const formRef = ref();

// 资产选择器相关状态
const ciSelectorVisible = ref(false);
const selectedAsset = ref<any>(null);

// 加载网段选项
async function loadSubnetOptions() {
  try {
    const response = await SubnetApi.list({ page: 1, pageSize: 100 });
    subnetOptions.value = response.data.map((subnet) => ({
      label: `${subnet.name} (${subnet.cidr})`,
      value: subnet.id,
    }));
  } catch (error) {
    console.error('加载网段选项失败:', error);
  }
}

// 重置表单
function resetForm() {
  formData.subnetId = 0;
  formData.ipAddr = '';
  formData.macAddr = '';
  formData.assetId = undefined;
  formData.ipStatus = 'free';
  formData.onlineStatus = 'unknown';
  formData.description = '';
  formData.status = 1;
  selectedAsset.value = null;
}

// 打开资产选择器
function openAssetSelector() {
  ciSelectorVisible.value = true;
}

// 处理资产选择确认
function handleAssetConfirm(selectedCis: any[]) {
  if (selectedCis.length > 0) {
    const asset = selectedCis[0]; // 单选模式，只取第一个
    selectedAsset.value = asset;
    formData.assetId = asset.id;
    message.success(`已选择资产: ${asset.displayName}`);
  }
}

// 处理资产选择取消
function handleAssetCancel() {
  // 什么也不做，保持原有选择
}

// 移除选中的资产
function removeSelectedAsset() {
  selectedAsset.value = null;
  formData.assetId = undefined;
  message.success('已移除选中的资产');
}

// 监听visible变化
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      loadSubnetOptions();
      if (props.mode === 'edit' && props.record) {
        // 编辑模式，填充数据
        Object.assign(formData, props.record);
        // 如果有资产ID，创建一个简单的资产对象用于显示
        if (props.record.assetId) {
          selectedAsset.value = {
            id: props.record.assetId,
            displayName: `资产-${props.record.assetId}`,
            typeName: '未知类型',
            typeId: 0,
          };
        }
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

    const submitData = {
      ...formData,
      lastPingAt:
        props.mode === 'create' ? Date.now() / 1000 : formData.lastPingAt,
    };

    if (props.mode === 'create') {
      await IPApi.create(submitData);
      message.success('创建成功');
      emit('success');
      emit('update:visible', false);
    } else {
      await IPApi.update({
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

<script lang="ts">
export default {
  name: 'IPModal',
};
</script>

<template>
  <Modal
    :open="visible"
    :title="mode === 'create' ? '新建IP地址' : '编辑IP地址'"
    :confirm-loading="loading"
    width="600px"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <Form ref="formRef" :model="formData" :rules="rules" layout="vertical">
      <Form.Item label="网段" name="subnetId">
        <Select
          v-model:value="formData.subnetId"
          :disabled="mode === 'edit'"
          :options="subnetOptions"
          placeholder="请选择网段"
        />
      </Form.Item>

      <Form.Item label="IP地址" name="ipAddr">
        <Input v-model:value="formData.ipAddr" placeholder="请输入IP地址" />
      </Form.Item>

      <Form.Item label="MAC地址" name="macAddr">
        <Input v-model:value="formData.macAddr" placeholder="请输入MAC地址" />
      </Form.Item>

      <Form.Item v-if="props.showAssetSelector" label="关联资产" name="assetId">
        <div class="asset-selector">
          <!-- 已选择的资产显示 -->
          <div v-if="selectedAsset" class="selected-asset">
            <Tag closable class="asset-tag" @close="removeSelectedAsset">
              <div class="asset-info">
                <div class="asset-type">{{ selectedAsset.typeName }}</div>
                <div class="asset-name">{{ selectedAsset.displayName }}</div>
                <div class="asset-id">ID: {{ selectedAsset.id }}</div>
              </div>
            </Tag>
          </div>

          <!-- 选择按钮 -->
          <Button
            v-if="!selectedAsset"
            type="dashed"
            block
            @click="openAssetSelector"
          >
            <PlusOutlined />
            选择关联资产
          </Button>

          <!-- 更换按钮 -->
          <Button v-else type="link" size="small" @click="openAssetSelector">
            更换资产
          </Button>
        </div>
      </Form.Item>

      <Form.Item label="IP状态" name="ipStatus">
        <Select
          v-model:value="formData.ipStatus"
          :options="ipStatusOptions"
          placeholder="请选择IP状态"
        />
      </Form.Item>

      <Form.Item label="在线状态" name="onlineStatus">
        <Select
          v-model:value="formData.onlineStatus"
          :options="onlineStatusOptions"
          placeholder="请选择在线状态"
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

    <!-- 资产选择器 -->
    <CiSelector
      :open="ciSelectorVisible"
      :multiple="false"
      title="选择关联资产"
      :selected-cis="selectedAsset ? [selectedAsset] : []"
      @update:open="(value) => (ciSelectorVisible = value)"
      @confirm="handleAssetConfirm"
      @cancel="handleAssetCancel"
    />
  </Modal>
</template>

<style scoped>
.asset-selector {
  min-height: 40px;
}

.selected-asset {
  margin-bottom: 8px;
}

.asset-tag {
  padding: 8px 12px;
  margin: 0;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

.asset-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.asset-type {
  font-size: 12px;
  font-weight: 600;
  color: #1890ff;
}

.asset-name {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.asset-id {
  font-size: 11px;
  color: #8c8c8c;
}
</style>
