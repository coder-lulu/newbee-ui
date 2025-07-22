<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Row,
  Statistic,
} from 'ant-design-vue';

import DomainTree from './components/DomainTree.vue';
import SubnetModal from './components/SubnetModal.vue';
import SubnetTable from './components/SubnetTable.vue';

// 响应式数据
const loading = ref(false);
const selectedDomainId = ref<null | number>(null);
const selectedDomainName = ref<string>('');
const searchKeyword = ref<string>('');
const showSubnetModal = ref(false);
const subnetModalMode = ref<'create' | 'edit'>('create');
const editingSubnet = ref();

// 统计数据
const statistics = ref({
  totalDomains: 3,
  totalSubnets: 8,
  totalIPs: 512,
  allocatedIPs: 123,
  availableIPs: 389,
  onlineIPs: 87,
  offlineIPs: 36,
});

// 左侧面板宽度
const leftWidth = ref(250);
const isResizing = ref(false);

// 组件引用
const subnetTableRef = ref();
const domainTreeRef = ref();

// 计算统计数据的百分比
const allocationRate = computed(() => {
  const total = statistics.value.allocatedIPs + statistics.value.availableIPs;
  if (total === 0) return 0;
  return Math.round((statistics.value.allocatedIPs / total) * 100);
});

const onlineRate = computed(() => {
  const total = statistics.value.onlineIPs + statistics.value.offlineIPs;
  if (total === 0) return 0;
  return Math.round((statistics.value.onlineIPs / total) * 100);
});

// 处理网域选择
function handleDomainSelect(domainId: number, domainName: string) {
  selectedDomainId.value = domainId;
  selectedDomainName.value = domainName;
  console.log('选择网域:', domainName, domainId);
}

// 加载统计数据
async function loadStatistics() {
  try {
    loading.value = true;

    // 模拟异步延迟
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 使用模拟数据，后续可替换为真实API调用
    statistics.value = {
      totalDomains: 3,
      totalSubnets: 8,
      totalIPs: 512,
      allocatedIPs: 123,
      availableIPs: 389,
      onlineIPs: 87,
      offlineIPs: 36,
    };

    console.log('统计数据已加载:', statistics.value);
  } catch (error) {
    console.error('加载统计数据失败:', error);
    message.error('加载统计数据失败');
  } finally {
    loading.value = false;
  }
}

// 刷新数据
function handleRefresh() {
  console.log('刷新数据');
  loadStatistics();
  if (domainTreeRef.value?.loadDomains) {
    domainTreeRef.value.loadDomains();
  }
  if (subnetTableRef.value?.loadData) {
    subnetTableRef.value.loadData();
  }
}

// 新建网段
function handleCreateSubnet() {
  if (!selectedDomainId.value) {
    message.warning('请先选择网域');
    return;
  }
  subnetModalMode.value = 'create';
  editingSubnet.value = undefined;
  showSubnetModal.value = true;
}

// 搜索功能
function handleSearch() {
  console.log('搜索关键词:', searchKeyword.value);
  if (subnetTableRef.value?.searchData) {
    subnetTableRef.value.searchData(searchKeyword.value);
  }
}

// 设置功能
function handleSettings() {
  console.log('打开设置面板');
  // TODO: 实现设置功能
}

// 查看网段详情
function handleViewSubnet(record: any) {
  console.log('查看网段详情:', record);
  // TODO: 实现查看网段详情功能
}

// 编辑网段
function handleEditSubnet(record: any) {
  console.log('编辑网段:', record);
  subnetModalMode.value = 'edit';
  editingSubnet.value = record;
  showSubnetModal.value = true;
}

// 网段操作成功后的回调
function handleSubnetSuccess() {
  // 刷新网段表格和统计数据
  if (subnetTableRef.value?.loadData) {
    subnetTableRef.value.loadData();
  }
  loadStatistics();
}

// 处理拖拽调整宽度
function handleMouseDown(event: MouseEvent) {
  isResizing.value = true;
  const startX = event.clientX;
  const startWidth = leftWidth.value;

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) return;
    const deltaX = e.clientX - startX;
    const newWidth = Math.max(200, Math.min(400, startWidth + deltaX));
    leftWidth.value = newWidth;
  };

  const handleMouseUp = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
}

// 自动刷新定时器
let refreshTimer: NodeJS.Timeout | null = null;

// 启动自动刷新
function startAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  // 每30秒自动刷新一次统计数据
  refreshTimer = setInterval(() => {
    loadStatistics();
  }, 30_000);
}

// 停止自动刷新
function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadStatistics();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<template>
  <div class="ipam-page">
    <!-- 统计卡片区域 -->
    <div class="statistics-section">
      <Row :gutter="16">
        <Col :span="6">
          <Card size="small">
            <Statistic
              title="网域统计"
              :value="statistics.totalDomains"
              :loading="loading"
              class="statistic-card"
            >
              <template #suffix>
                <span class="statistic-unit">个</span>
              </template>
            </Statistic>
            <div class="statistic-desc">
              <span class="status-dot status-normal"></span>
              总数 {{ statistics.totalDomains }}
            </div>
          </Card>
        </Col>
        <Col :span="6">
          <Card size="small">
            <Statistic
              title="地址段统计"
              :value="statistics.totalSubnets"
              :loading="loading"
              class="statistic-card"
            >
              <template #suffix>
                <span class="statistic-unit">个</span>
              </template>
            </Statistic>
            <div class="statistic-desc">总数 {{ statistics.totalSubnets }}</div>
          </Card>
        </Col>
        <Col :span="6">
          <Card size="small">
            <Statistic
              title="分配统计"
              :value="statistics.allocatedIPs"
              :loading="loading"
              class="statistic-card allocation"
            >
              <template #suffix>
                <span class="statistic-unit">个</span>
              </template>
            </Statistic>
            <div class="statistic-desc">已分配 {{ allocationRate }}%</div>
          </Card>
        </Col>
        <Col :span="6">
          <Card size="small">
            <Statistic
              title="在线统计"
              :value="statistics.onlineIPs"
              :loading="loading"
              class="statistic-card online"
            >
              <template #suffix>
                <span class="statistic-unit">个</span>
              </template>
            </Statistic>
            <div class="statistic-desc">在线 {{ onlineRate }}%</div>
          </Card>
        </Col>
      </Row>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧网域树 -->
      <div class="left-panel" :style="{ width: `${leftWidth}px` }">
        <div class="panel-header">
          <span class="panel-title">网域</span>
        </div>
        <div class="panel-content">
          <DomainTree ref="domainTreeRef" @select="handleDomainSelect" />
        </div>
      </div>

      <!-- 拖拽分割条 -->
      <div
        class="resize-handle"
        :class="{ active: isResizing }"
        @mousedown="handleMouseDown"
      >
        <div class="resize-line"></div>
      </div>

      <!-- 右侧网段表格 -->
      <div class="right-panel">
        <div class="panel-header">
          <div class="header-left">
            <span class="panel-title">子网在线统计</span>
            <span v-if="selectedDomainName" class="domain-name">
              - {{ selectedDomainName }}
            </span>
          </div>
          <div class="header-right">
            <Input
              v-model="searchKeyword"
              placeholder="搜索子网名称或CIDR"
              size="small"
              style="width: 200px; margin-right: 8px"
              @press-enter="handleSearch"
            >
              <template #suffix>
                <SearchOutlined @click="handleSearch" />
              </template>
            </Input>
            <Button size="small" @click="handleRefresh">
              <ReloadOutlined />
            </Button>
            <Button
              type="primary"
              size="small"
              :disabled="!selectedDomainId"
              @click="handleCreateSubnet"
            >
              <PlusOutlined />
              新建
            </Button>
            <Button size="small" @click="handleSettings">
              <SettingOutlined />
            </Button>
          </div>
        </div>
        <div class="panel-content">
          <SubnetTable
            ref="subnetTableRef"
            :domain-id="selectedDomainId"
            @view="handleViewSubnet"
            @edit="handleEditSubnet"
          />
        </div>
      </div>
    </div>

    <!-- 网段模态框 -->
    <SubnetModal
      :visible="showSubnetModal"
      :mode="subnetModalMode"
      :domain-id="selectedDomainId || undefined"
      :record="editingSubnet"
      @update:visible="(v) => (showSubnetModal = v)"
      @success="handleSubnetSuccess"
    />
  </div>
</template>

<style scoped>
.ipam-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  background: #f5f5f5;
}

.statistics-section {
  margin-bottom: 16px;
}

.statistic-card {
  text-align: center;
}

.statistic-card :deep(.ant-statistic-title) {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.statistic-card :deep(.ant-statistic-content) {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
}

.statistic-card.allocation :deep(.ant-statistic-content) {
  color: #52c41a;
}

.statistic-card.online :deep(.ant-statistic-content) {
  color: #13c2c2;
}

.statistic-unit {
  margin-left: 4px;
  font-size: 14px;
  color: #999;
}

.statistic-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 4px;
  background-color: #52c41a;
  border-radius: 50%;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: #fff;
  border-radius: 6px;
}

.left-panel {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  max-width: 400px;
  border-right: 1px solid #f0f0f0;
}

.right-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  align-items: center;
}

.panel-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.domain-name {
  margin-left: 4px;
  font-size: 12px;
  color: #1890ff;
}

.header-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.panel-content {
  flex: 1;
  overflow: hidden;
}

.resize-handle {
  position: relative;
  width: 4px;
  cursor: col-resize;
  background: transparent;
  transition: background-color 0.2s ease;
}

.resize-handle:hover,
.resize-handle.active {
  background: #1890ff;
}

.resize-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 20px;
  background: #d9d9d9;
  border-radius: 1px;
  transform: translate(-50%, -50%);
}

.resize-handle:hover .resize-line,
.resize-handle.active .resize-line {
  background: #fff;
}
</style>
