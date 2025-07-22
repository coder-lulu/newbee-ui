<script setup lang="ts">
import type {
  AllocateIpReq,
  BatchAllocateIpReq,
  BatchReleaseIpReq,
  IpAllocationRecord,
  ReleaseIpReq,
  SubnetStatsData,
} from '../../../../api/ipam/ip-business';
import type { IpamSubnet } from '../../../../api/ipam/types';

import { onMounted, reactive, ref, watch } from 'vue';

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Progress,
  Radio,
  Row,
  Space,
  Statistic,
  Tag,
} from 'ant-design-vue';

import { IpBusinessApi } from '../../../../api/ipam/ip-business';
import CiSelector from '../../../cmdb/cis/components/CiSelector.vue';

interface Props {
  subnetId?: number;
  subnet?: IpamSubnet;
}

const props = defineProps<Props>();

// 响应式数据
const loading = ref(false);
const allocateLoading = ref(false);
const batchAllocateLoading = ref(false);

const ipAllocations = ref<IpAllocationRecord[]>([]);
const stats = ref<SubnetStatsData>();
const currentSubnet = ref<IpamSubnet>();

// 模态框状态
const allocateModalVisible = ref(false);
const batchAllocateModalVisible = ref(false);
const ipDetailModalVisible = ref(false);
const batchReleaseModalVisible = ref(false);

// 资产选择器状态
const assetSelectorVisible = ref(false);
const selectedAsset = ref<any>(null);
const assetSelectorMode = ref<'batch' | 'single'>('single'); // 区分单个分配还是批量分配

// IP详情和回收相关状态
const currentIpDetail = ref<IpAllocationRecord | null>(null);
const releaseLoading = ref(false);
const batchReleaseLoading = ref(false);
const selectedIpIds = ref<number[]>([]);
const showBatchActions = ref(false);

// 表单数据
const allocateForm = reactive({
  allocationType: 'auto',
  ipAddr: '',
  assetId: '',
  remark: '',
});

const batchAllocateForm = reactive({
  count: 1,
  assetId: '',
  remark: '',
});

const batchReleaseForm = reactive({
  remark: '',
});

// 表单引用
const allocateFormRef = ref();
const batchAllocateFormRef = ref();
const batchReleaseFormRef = ref();

// 表单验证规则

const batchAllocateRules = {
  count: [
    { required: true, message: '请输入分配数量' },
    {
      min: 1,
      max: 100,
      message: '分配数量必须在1-100之间',
      type: 'number' as const,
    },
  ],
};

// 工具函数
const getStatusColor = (status: string) => {
  const colors = {
    allocated: 'success',
    available: 'default',
    reserved: 'warning',
    conflict: 'error',
  };
  return colors[status as keyof typeof colors] || 'default';
};

const getStatusText = (status: string) => {
  const texts = {
    allocated: '已分配',
    available: '可用',
    reserved: '保留',
    conflict: '冲突',
  };
  return texts[status as keyof typeof texts] || status;
};

// 移除未使用的函数

// 数据加载
async function loadIpAllocations() {
  if (!props.subnetId) return;

  try {
    loading.value = true;
    const response = await IpBusinessApi.getIpAllocationList({
      page: 1,
      pageSize: 1000,
      subnetId: props.subnetId,
    });
    ipAllocations.value = response.records || [];
  } catch (error) {
    console.error('加载IP分配记录失败:', error);
  } finally {
    loading.value = false;
  }
}

async function loadSubnetStats() {
  if (!props.subnetId) return;

  try {
    const response = await IpBusinessApi.getSubnetStats({
      subnetId: props.subnetId,
    });

    stats.value = response;
  } catch (error) {
    console.error('加载网段统计失败:', error);
  }
}

// 刷新数据
function handleRefresh() {
  loadIpAllocations();
  loadSubnetStats();
}

// IP分配
function showAllocateModal() {
  console.log('showAllocateModal called');
  allocateModalVisible.value = true;
  console.log('allocateModalVisible set to:', allocateModalVisible.value);
}

function resetAllocateForm() {
  allocateForm.allocationType = 'auto';
  allocateForm.ipAddr = '';
  allocateForm.assetId = '';
  allocateForm.remark = '';
  selectedAsset.value = null;
  allocateFormRef.value?.clearValidate();
}

function closeAllocateModal() {
  allocateModalVisible.value = false;
  resetAllocateForm();
}

async function handleAllocate() {
  try {
    await allocateFormRef.value.validate();
    allocateLoading.value = true;

    const request: AllocateIpReq = {
      subnetId: props.subnetId!,
      assetId: allocateForm.assetId ? Number(allocateForm.assetId) : undefined,
      remark: allocateForm.remark,
    };

    if (allocateForm.allocationType === 'manual') {
      request.ipAddr = allocateForm.ipAddr;
    }

    const response = await IpBusinessApi.allocateIp(request);

    message.success(`IP地址 ${response.ipAddr} 分配成功`);
    closeAllocateModal();
    handleRefresh();
  } catch (error) {
    console.error('分配IP失败:', error);
    message.error('分配IP失败');
  } finally {
    allocateLoading.value = false;
  }
}

// 批量分配
function showBatchAllocateModal() {
  batchAllocateModalVisible.value = true;
}

function resetBatchAllocateForm() {
  batchAllocateForm.count = 1;
  batchAllocateForm.assetId = '';
  batchAllocateForm.remark = '';
  selectedAsset.value = null;
  batchAllocateFormRef.value?.clearValidate();
}

// 资产选择器相关方法
function openAssetSelector(mode: 'batch' | 'single') {
  assetSelectorMode.value = mode;
  assetSelectorVisible.value = true;
}

function handleAssetConfirm(selectedCis: any[]) {
  if (selectedCis.length > 0) {
    const asset = selectedCis[0]; // 单选模式
    selectedAsset.value = asset;

    if (assetSelectorMode.value === 'single') {
      allocateForm.assetId = String(asset.id);
    } else {
      batchAllocateForm.assetId = String(asset.id);
    }

    message.success(`已选择资产: ${asset.displayName}`);
  }
}

function handleAssetCancel() {
  // 什么也不做，保持原有选择
}

function removeSelectedAsset() {
  selectedAsset.value = null;
  if (assetSelectorMode.value === 'single') {
    allocateForm.assetId = '';
  } else {
    batchAllocateForm.assetId = '';
  }
  message.success('已移除选中的资产');
}

function closeBatchAllocateModal() {
  batchAllocateModalVisible.value = false;
  resetBatchAllocateForm();
}

async function handleBatchAllocate() {
  try {
    await batchAllocateFormRef.value.validate();
    batchAllocateLoading.value = true;

    const request: BatchAllocateIpReq = {
      subnetId: props.subnetId!,
      count: batchAllocateForm.count,
      assetId: batchAllocateForm.assetId
        ? Number(batchAllocateForm.assetId)
        : undefined,
      remark: batchAllocateForm.remark,
    };

    const response = await IpBusinessApi.batchAllocateIp(request);

    message.success(`批量分配成功，共分配 ${response.ips.length} 个IP地址`);
    closeBatchAllocateModal();
    handleRefresh();
  } catch (error) {
    console.error('批量分配IP失败:', error);
    message.error('批量分配IP失败');
  } finally {
    batchAllocateLoading.value = false;
  }
}

// 移除未使用的handleRelease函数

// 移除未使用的函数

// IP网格单元格点击处理
function handleIpCellClick(ip: IpAllocationRecord) {
  if (ip.status === 'available') {
    // 可用IP，弹出分配对话框
    allocateForm.allocationType = 'manual';
    allocateForm.ipAddr = ip.ipAddr;
    showAllocateModal();
  } else if (ip.status === 'allocated') {
    // 已分配IP，显示详细信息
    showIpDetail(ip);
  } else {
    // 其他状态IP，显示简单信息
    message.info(
      `IP: ${ip.ipAddr}\n状态: ${getStatusText(ip.status)}\n${ip.assetName ? `资产: ${ip.assetName}` : ''}\n${ip.hostname ? `主机名: ${ip.hostname}` : ''}`,
    );
  }
}

// 显示IP详情
function showIpDetail(ip: IpAllocationRecord) {
  currentIpDetail.value = ip;
  ipDetailModalVisible.value = true;
}

// 关闭IP详情模态框
function closeIpDetailModal() {
  ipDetailModalVisible.value = false;
  currentIpDetail.value = null;
}

// 单个IP回收
async function handleSingleRelease(ip: IpAllocationRecord) {
  Modal.confirm({
    title: '确认回收IP地址',
    content: `确定要回收IP地址 ${ip.ipAddr} 吗？回收后该IP将变为可用状态。`,
    okText: '确认回收',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        releaseLoading.value = true;
        const request: ReleaseIpReq = {
          ipId: ip.id,
          remark: '手动回收',
        };

        await IpBusinessApi.releaseIp(request);
        message.success(`IP地址 ${ip.ipAddr} 回收成功`);
        closeIpDetailModal();
        handleRefresh();
      } catch (error) {
        console.error('回收IP失败:', error);
        message.error('回收IP失败');
      } finally {
        releaseLoading.value = false;
      }
    },
  });
}

// 批量选择相关方法
function toggleBatchMode() {
  showBatchActions.value = !showBatchActions.value;
  if (!showBatchActions.value) {
    selectedIpIds.value = [];
  }
}

function handleIpSelect(ipId: number, checked: boolean) {
  if (checked) {
    selectedIpIds.value.push(ipId);
  } else {
    const index = selectedIpIds.value.indexOf(ipId);
    if (index !== -1) {
      selectedIpIds.value.splice(index, 1);
    }
  }
}

function selectAllAllocatedIps() {
  const allocatedIps = ipAllocations.value
    .filter((ip) => ip.status === 'allocated')
    .map((ip) => ip.id);
  selectedIpIds.value = allocatedIps;
}

function clearSelection() {
  selectedIpIds.value = [];
}

// 显示批量回收模态框
function showBatchReleaseModal() {
  if (selectedIpIds.value.length === 0) {
    message.warning('请先选择要回收的IP地址');
    return;
  }
  batchReleaseModalVisible.value = true;
}

// 关闭批量回收模态框
function closeBatchReleaseModal() {
  batchReleaseModalVisible.value = false;
  batchReleaseForm.remark = '';
  batchReleaseFormRef.value?.clearValidate();
}

// 批量回收IP
async function handleBatchRelease() {
  try {
    batchReleaseLoading.value = true;

    const request: BatchReleaseIpReq = {
      ipIds: selectedIpIds.value,
      remark: batchReleaseForm.remark || '批量回收',
    };

    await IpBusinessApi.batchReleaseIp(request);
    message.success(
      `批量回收成功，共回收 ${selectedIpIds.value.length} 个IP地址`,
    );

    closeBatchReleaseModal();
    toggleBatchMode(); // 退出批量模式
    handleRefresh();
  } catch (error) {
    console.error('批量回收IP失败:', error);
    message.error('批量回收IP失败');
  } finally {
    batchReleaseLoading.value = false;
  }
}

// 监听props变化并初始化数据
watch(
  () => [props.subnetId, props.subnet],
  ([newSubnetId, newSubnet]) => {
    if (newSubnetId && newSubnet && typeof newSubnet === 'object') {
      const subnet = newSubnet as IpamSubnet;
      currentSubnet.value = subnet;

      // 直接使用传入的subnet数据
      if (subnet.ipAllocations) {
        // 将IpAllocation转换为IpAllocationRecord格式
        ipAllocations.value = subnet.ipAllocations.map((ip) => ({
          id: ip.id,
          ipAddr: ip.ipAddr,
          subnetId: newSubnetId as number,
          status: ip.status as
            | 'allocated'
            | 'available'
            | 'conflict'
            | 'reserved',
          onlineStatus: ip.onlineStatus as 'offline' | 'online' | 'unknown',
          macAddr: ip.macAddr,
          hostname: ip.hostname,
          assetId: ip.assetId,
          assetName: ip.assetName,
          assetType: ip.assetType,
          assignedAt: ip.assignedAt,
          lastPingAt: ip.lastPingAt,
          operator: '', // 这个字段在IpAllocation中没有
          remark: ip.description || '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }));
      }

      // 使用subnet的statistics数据
      if (subnet.statistics) {
        stats.value = {
          subnetId: newSubnetId as number,
          cidr: subnet.cidr,
          totalIps: subnet.statistics.totalIps,
          allocatedIps: subnet.statistics.allocatedIps,
          availableIps: subnet.statistics.availableIps,
          reservedIps: subnet.statistics.reservedIps,
          conflictIps: subnet.statistics.conflictIps,
          usageRate: subnet.statistics.allocationRate,
        };
      }
    }
  },
  { immediate: true },
);

// 组件挂载时不再自动调用handleRefresh，因为数据会通过watch获取
onMounted(() => {
  // 移除自动刷新，数据通过props传入
});
</script>

<script lang="ts">
export default {
  name: 'IpManagement',
};
</script>

<template>
  <div class="ip-management">
    <!-- 操作工具栏 -->
    <Card class="mb-4">
      <template #title>
        <Space>
          <span>IP地址管理</span>
          <Tag v-if="currentSubnet" color="blue">
            {{ currentSubnet.name || currentSubnet.cidr }}
          </Tag>
        </Space>
      </template>

      <template #extra>
        <Space>
          <Button @click="handleRefresh" :loading="loading">
            <ReloadOutlined />
            刷新
          </Button>
          <Button type="primary" @click="showAllocateModal">
            <PlusOutlined />
            分配IP
          </Button>
          <Button @click="showBatchAllocateModal">
            <ThunderboltOutlined />
            批量分配
          </Button>
          <Button
            :type="showBatchActions ? 'primary' : 'default'"
            @click="toggleBatchMode"
          >
            <EditOutlined />
            {{ showBatchActions ? '退出批量' : '批量管理' }}
          </Button>
          <!-- <Button @click="handlePingTest" :loading="pingLoading">
            <SyncOutlined />
            连通性检测
          </Button>
          <Button @click="handleConflictDetect" :loading="conflictLoading">
            <WarningOutlined />
            冲突检测
          </Button> -->
        </Space>
      </template>

      <!-- 统计信息 -->
      <Row :gutter="16" class="mb-4">
        <Col :span="4">
          <Statistic
            title="总IP地址"
            :value="stats?.totalIps || 0"
            :value-style="{ color: '#1890ff' }"
          />
        </Col>
        <Col :span="4">
          <Statistic
            title="已分配"
            :value="stats?.allocatedIps || 0"
            :value-style="{ color: '#52c41a' }"
          />
        </Col>
        <Col :span="4">
          <Statistic
            title="可用地址"
            :value="stats?.availableIps || 0"
            :value-style="{ color: '#722ed1' }"
          />
        </Col>
        <Col :span="4">
          <Statistic
            title="保留地址"
            :value="stats?.reservedIps || 0"
            :value-style="{ color: '#fa8c16' }"
          />
        </Col>
        <Col :span="4">
          <Statistic
            title="冲突地址"
            :value="stats?.conflictIps || 0"
            :value-style="{ color: '#ff4d4f' }"
          />
        </Col>
        <Col :span="4">
          <div class="usage-rate">
            <div class="usage-label">使用率</div>
            <Progress
              :percent="Math.round(stats?.usageRate || 0)"
              :status="(stats?.usageRate || 0) > 80 ? 'exception' : 'normal'"
            />
          </div>
        </Col>
      </Row>
    </Card>

    <!-- 批量操作工具栏 -->
    <Card v-if="showBatchActions" class="mb-4">
      <template #title>
        <Space>
          <span>批量操作</span>
          <Tag color="blue">已选择 {{ selectedIpIds.length }} 个IP</Tag>
        </Space>
      </template>

      <template #extra>
        <Space>
          <Button size="small" @click="selectAllAllocatedIps">
            全选已分配
          </Button>
          <Button size="small" @click="clearSelection"> 清空选择 </Button>
          <Button
            type="primary"
            danger
            size="small"
            :disabled="selectedIpIds.length === 0"
            @click="showBatchReleaseModal"
          >
            <DeleteOutlined />
            批量回收
          </Button>
        </Space>
      </template>
    </Card>

    <!-- IP地址网格显示面板 -->
    <Card title="IP地址分配情况" class="mb-4">
      <div class="ip-grid">
        <div class="grid-header mb-3">
          <Space>
            <span class="legend-item">
              <span class="legend-color allocated"></span>
              <span>已分配</span>
            </span>
            <span class="legend-item">
              <span class="legend-color available"></span>
              <span>可用</span>
            </span>
            <span class="legend-item">
              <span class="legend-color reserved"></span>
              <span>保留</span>
            </span>
            <span class="legend-item">
              <span class="legend-color conflict"></span>
              <span>冲突</span>
            </span>
          </Space>
        </div>

        <div class="grid-container">
          <div
            v-for="ip in ipAllocations"
            :key="ip.id"
            class="ip-cell"
            :class="[
              ip.status,
              ip.onlineStatus,
              { selected: selectedIpIds.includes(ip.id) },
            ]"
            :title="`IP: ${ip.ipAddr}\n状态: ${getStatusText(ip.status)}\n在线状态: ${ip.onlineStatus}\n${ip.assetName ? `资产: ${ip.assetName}` : ''}`"
            @click="handleIpCellClick(ip)"
          >
            <!-- 批量选择模式下的复选框 -->
            <div
              v-if="showBatchActions && ip.status === 'allocated'"
              class="ip-checkbox"
              @click.stop="
                handleIpSelect(ip.id, !selectedIpIds.includes(ip.id))
              "
            >
              <Checkbox :checked="selectedIpIds.includes(ip.id)" size="small" />
            </div>

            <div class="ip-content">
              <div class="ip-number">
                {{ ip.ipAddr.split('.').pop() }}
              </div>
              <div v-if="ip.onlineStatus === 'online'" class="online-indicator">
                ●
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- IP分配模态框 -->
    <Modal
      :open="allocateModalVisible"
      title="分配IP地址"
      :confirm-loading="allocateLoading"
      @ok="handleAllocate"
      @cancel="closeAllocateModal"
    >
      <Form ref="allocateFormRef" :model="allocateForm" layout="vertical">
        <Form.Item label="分配方式" name="allocationType">
          <Radio.Group v-model:value="allocateForm.allocationType">
            <Radio value="auto">自动分配</Radio>
            <Radio value="manual">指定IP</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          v-if="allocateForm.allocationType === 'manual'"
          label="IP地址"
          name="ipAddr"
        >
          <Input
            v-model="allocateForm.ipAddr"
            placeholder="例如：192.168.1.100"
          />
        </Form.Item>

        <Form.Item label="关联资产" name="assetId">
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
              @click="openAssetSelector('single')"
            >
              <PlusOutlined />
              选择关联资产
            </Button>

            <!-- 更换按钮 -->
            <Button
              v-else
              type="link"
              size="small"
              @click="openAssetSelector('single')"
            >
              更换资产
            </Button>
          </div>
        </Form.Item>

        <Form.Item label="备注" name="remark">
          <Input.TextArea
            v-model:value="allocateForm.remark"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </Form.Item>
      </Form>
    </Modal>

    <!-- 批量分配模态框 -->
    <Modal
      :open="batchAllocateModalVisible"
      title="批量分配IP地址"
      :confirm-loading="batchAllocateLoading"
      @ok="handleBatchAllocate"
      @cancel="closeBatchAllocateModal"
    >
      <Form
        ref="batchAllocateFormRef"
        :model="batchAllocateForm"
        :rules="batchAllocateRules"
        layout="vertical"
      >
        <Form.Item label="分配数量" name="count">
          <InputNumber
            v-model:value="batchAllocateForm.count"
            :min="1"
            :max="100"
            style="width: 100%"
            placeholder="请输入分配数量"
          />
        </Form.Item>

        <!-- <Form.Item label="关联资产" name="assetId">
          <div class="asset-selector">
            <div v-if="selectedAsset" class="selected-asset">
              <Tag closable class="asset-tag" @close="removeSelectedAsset">
                <div class="asset-info">
                  <div class="asset-type">{{ selectedAsset.typeName }}</div>
                  <div class="asset-name">{{ selectedAsset.displayName }}</div>
                  <div class="asset-id">ID: {{ selectedAsset.id }}</div>
                </div>
              </Tag>
            </div>

            <Button
              v-if="!selectedAsset"
              type="dashed"
              block
              @click="openAssetSelector('batch')"
            >
              <PlusOutlined />
              选择关联资产
            </Button>

            <Button
              v-else
              type="link"
              size="small"
              @click="openAssetSelector('batch')"
            >
              更换资产
            </Button>
          </div>
        </Form.Item> -->

        <Form.Item label="备注" name="remark">
          <Input.TextArea
            v-model:value="batchAllocateForm.remark"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </Form.Item>
      </Form>
    </Modal>

    <!-- IP详情模态框 -->
    <Modal
      :open="ipDetailModalVisible"
      title="IP地址详情"
      width="600px"
      :footer="null"
      @cancel="closeIpDetailModal"
    >
      <div v-if="currentIpDetail">
        <Descriptions :column="2" bordered>
          <Descriptions.Item label="IP地址">
            {{ currentIpDetail.ipAddr }}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag :color="getStatusColor(currentIpDetail.status)">
              {{ getStatusText(currentIpDetail.status) }}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="在线状态">
            <Tag
              :color="
                currentIpDetail.onlineStatus === 'online' ? 'green' : 'red'
              "
            >
              {{ currentIpDetail.onlineStatus === 'online' ? '在线' : '离线' }}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="MAC地址">
            {{ currentIpDetail.macAddr || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="主机名">
            {{ currentIpDetail.hostname || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="关联资产">
            {{ currentIpDetail.assetName || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="资产类型">
            {{ currentIpDetail.assetType || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="分配时间">
            {{
              currentIpDetail.updatedAt
                ? new Date(currentIpDetail.updatedAt * 1000).toLocaleString()
                : '-'
            }}
          </Descriptions.Item>
          <Descriptions.Item label="最后检测" :span="2">
            {{
              currentIpDetail.lastPingAt
                ? new Date(currentIpDetail.lastPingAt * 1000).toLocaleString()
                : '-'
            }}
          </Descriptions.Item>
          <Descriptions.Item label="备注" :span="2">
            {{ currentIpDetail.remark || '-' }}
          </Descriptions.Item>
        </Descriptions>

        <div class="mt-4 text-center">
          <Space>
            <Button @click="closeIpDetailModal"> 关闭 </Button>
            <Button
              type="primary"
              danger
              :loading="releaseLoading"
              @click="handleSingleRelease(currentIpDetail)"
            >
              <DeleteOutlined />
              回收IP
            </Button>
          </Space>
        </div>
      </div>
    </Modal>

    <!-- 批量回收模态框 -->
    <Modal
      :open="batchReleaseModalVisible"
      title="批量回收IP地址"
      :confirm-loading="batchReleaseLoading"
      @ok="handleBatchRelease"
      @cancel="closeBatchReleaseModal"
    >
      <div class="mb-4">
        <p>
          确定要回收以下
          <strong>{{ selectedIpIds.length }}</strong> 个IP地址吗？
        </p>
        <div class="selected-ips">
          <Tag
            v-for="ip in ipAllocations.filter((item) =>
              selectedIpIds.includes(item.id),
            )"
            :key="ip.id"
            color="blue"
            class="mb-2"
          >
            {{ ip.ipAddr }}
          </Tag>
        </div>
      </div>

      <Form
        ref="batchReleaseFormRef"
        :model="batchReleaseForm"
        layout="vertical"
      >
        <Form.Item label="回收备注" name="remark">
          <Input.TextArea
            v-model:value="batchReleaseForm.remark"
            :rows="3"
            placeholder="请输入回收备注（可选）"
          />
        </Form.Item>
      </Form>
    </Modal>

    <!-- 资产选择器 -->
    <CiSelector
      v-if="assetSelectorVisible"
      :open="assetSelectorVisible"
      :multiple="false"
      title="选择关联资产"
      :selected-cis="selectedAsset ? [selectedAsset] : []"
      @update:open="(value) => (assetSelectorVisible = value)"
      @confirm="handleAssetConfirm"
      @cancel="handleAssetCancel"
    />
  </div>
</template>

<style scoped>
/* 响应式设计 */
@media (max-width: 1400px) {
  .ip-grid .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  }

  .ip-grid .ip-cell {
    width: 45px;
    height: 45px;
  }
}

@media (max-width: 1200px) {
  .ip-grid .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  }

  .ip-grid .ip-cell {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 768px) {
  .ip-grid .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(35px, 1fr));
  }

  .ip-grid .ip-cell {
    width: 35px;
    height: 35px;
    font-size: 9px;
  }
}

.ip-management .mb-4 {
  margin-bottom: 16px;
}

.ip-management .mb-3 {
  margin-bottom: 12px;
}

.ip-management .usage-rate .usage-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.ip-management .font-medium {
  font-weight: 500;
}

.ip-management .font-mono {
  font-family: Consolas, Monaco, 'Courier New', monospace;
}

.ip-management .text-sm {
  font-size: 12px;
}

.ip-management .text-gray-400 {
  color: #a1a1aa;
}

.ip-management .text-gray-500 {
  color: #6b7280;
}

/* IP网格样式 */
.ip-grid .legend-item {
  display: flex;
  gap: 4px;
  align-items: center;
}

.ip-grid .legend-color {
  width: 12px;
  height: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
}

.ip-grid .legend-color.allocated {
  background-color: #52c41a;
}

.ip-grid .legend-color.available {
  background-color: #f5f5f5;
}

.ip-grid .legend-color.reserved {
  background-color: #faad14;
}

.ip-grid .legend-color.conflict {
  background-color: #ff4d4f;
}

.ip-grid .grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 4px;
  max-width: 100%;
}

.ip-grid .ip-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  font-size: 10px;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.2s;
}

.ip-grid .ip-cell:hover {
  z-index: 10;
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  transform: scale(1.05);
}

.ip-grid .ip-cell.allocated {
  color: white;
  background-color: #52c41a;
  border-color: #52c41a;
}

.ip-grid .ip-cell.available {
  color: #8c8c8c;
  background-color: #f5f5f5;
}

.ip-grid .ip-cell.reserved {
  color: white;
  background-color: #faad14;
  border-color: #faad14;
}

.ip-grid .ip-cell.conflict {
  color: white;
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}

/* 资产选择器样式 */
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

.ip-grid .ip-cell.offline {
  opacity: 0.7;
}

.ip-grid .ip-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.ip-grid .ip-number {
  font-weight: 500;
  line-height: 1;
}

.ip-grid .online-indicator {
  margin-top: 2px;
  font-size: 6px;
  color: #52c41a;
}

/* IP选择相关样式 */
.ip-grid .ip-cell.selected {
  box-shadow: 0 0 0 2px #1890ff;
  transform: scale(1.05);
}

.ip-grid .ip-checkbox {
  position: absolute;
  top: 2px;
  left: 2px;
  z-index: 10;
  padding: 1px;
  background: rgb(255 255 255 / 90%);
  border-radius: 2px;
}

/* 批量回收模态框样式 */
.selected-ips {
  max-height: 200px;
  padding: 8px;
  overflow-y: auto;
  background: #f5f5f5;
  border-radius: 4px;
}

.selected-ips .ant-tag {
  margin: 2px 4px 2px 0;
}

/* 工具类 */
.mt-4 {
  margin-top: 16px;
}

.mb-2 {
  margin-bottom: 8px;
}

.text-center {
  text-align: center;
}
</style>
