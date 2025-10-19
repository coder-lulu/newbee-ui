<script setup lang="ts">
import type { CisInfo } from '#/api/cmdb/cis/model';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Card, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getCisById } from '#/api/cmdb/cis';
import { getOpsHostCredentialList } from '#/api/ops/host-credential';
// 引入CMDB资产选择组件
import CiSelector from '#/views/cmdb/cis/components/CiSelector.vue';

// 引入Terminal组件
import Terminal from './components/Terminal.vue';

// 状态管理
const selectedAsset = ref<any>(null);
const hostInfo = ref<any>(null);
const credentialList = ref<any[]>([]);
const showAssetSelector = ref(false);
const isConnected = ref(false);
const terminalRef = ref();

// 表单配置
const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  schema: [
    {
      component: 'Input',
      fieldName: 'hostDisplay',
      label: '选择主机',
      rules: 'required',
      componentProps: {
        readonly: true,
        placeholder: '点击选择主机',
        onClick: openAssetSelector,
        style: { cursor: 'pointer' },
      },
    },
    {
      component: 'Select',
      fieldName: 'credentialId',
      label: '选择凭证',
      rules: 'required',
      componentProps: {
        placeholder: '选择执行凭证',
        options: computed(() =>
          credentialList.value.map((credential) => ({
            label: `${credential.name} (${credential.username}@${credential.hostPattern})`,
            value: credential.id,
          })),
        ),
      },
    },
  ],
  showDefaultActions: false,
});

const [BasicDrawer, drawerApi] = useVbenDrawer({
  footer: false,
  onClosed: handleClosed,
  async onOpenChange(isOpen) {
    if (!isOpen) return;

    drawerApi.drawerLoading(true);

    try {
      // 加载凭证列表
      await loadCredentialList();
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    } finally {
      drawerApi.drawerLoading(false);
    }
  },
});

// 加载凭证列表
async function loadCredentialList() {
  try {
    const result = await getOpsHostCredentialList({
      page: 1,
      pageSize: 100,
      status: 1, // 只获取正常状态的凭证
    });
    credentialList.value = result.data || [];
  } catch (error) {
    console.error('加载凭证列表失败:', error);
  }
}

// 打开资产选择器
function openAssetSelector() {
  showAssetSelector.value = true;
}

// 资产选择确认
async function handleAssetSelect(assets: any[]) {
  if (assets.length === 0) return;

  selectedAsset.value = assets[0]; // 只选择第一个
  showAssetSelector.value = false;

  try {
    const cisInfo = await getCisById({ id: selectedAsset.value.id });
    hostInfo.value = processCisInfo(cisInfo.data || cisInfo);

    // 更新表单显示
    await formApi.setFieldValue(
      'hostDisplay',
      `${hostInfo.value.name} (${hostInfo.value.ip})`,
    );

    message.success(`已选择主机: ${hostInfo.value.name}`);
  } catch (error) {
    console.error('获取资产详情失败:', error);
    message.error('获取资产详情失败');
  }
}

// 处理CIS信息，提取主机名和IP
function processCisInfo(cisInfo: CisInfo) {
  const attributes = cisInfo.attributes || [];

  // 查找IP地址
  const mgmtIpAttr = attributes.find((attr) => attr.attrName === 'mgmt_ip');
  const ip = mgmtIpAttr?.value || '';

  // 查找主机名
  const hostnameAttr = attributes.find((attr) => attr.attrName === 'hostname');
  const hostname = hostnameAttr?.value || `主机-${cisInfo.id}`;

  return {
    id: cisInfo.id,
    name: hostname,
    ip,
    status: cisInfo.available ? 'success' : 'failed',
  };
}

// 连接SSH
async function connectSSH() {
  try {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const formData = await formApi.getValues();
    const credentialId = formData.credentialId;

    if (!hostInfo.value) {
      message.warning('请选择要连接的主机');
      return;
    }

    if (!credentialId) {
      message.warning('请选择连接凭证');
      return;
    }

    // 获取凭证信息
    const credential = credentialList.value.find((c) => c.id === credentialId);
    if (!credential) {
      message.error('凭证信息不存在');
      return;
    }

    // 构建SSH连接配置
    const sshConfig: any = {
      target: hostInfo.value.ip,
      port: 22,
      username: credential.username,
      auth_type: credential.authType,
      cols: 80,
      rows: 24,
      session_id: `ssh_${Date.now()}_${hostInfo.value.id}`,
    };

    // 根据认证类型添加认证数据
    switch (credential.authType) {
      case 'key': {
        sshConfig.private_key = credential.authData;
        break;
      }
      case 'mixed': {
        sshConfig.password = credential.authData;
        sshConfig.private_key = credential.authData; // 这里需要根据实际情况分离密码和密钥
        break;
      }
      case 'password': {
        sshConfig.password = credential.authData;
        break;
      }
      // No default
    }

    // 连接SSH
    await terminalRef.value?.connect(sshConfig);
    isConnected.value = true;
    message.success('SSH连接成功');
  } catch (error) {
    console.error('SSH连接失败:', error);
    message.error('SSH连接失败');
  }
}

// 断开连接
function disconnectSSH() {
  terminalRef.value?.disconnect();
  isConnected.value = false;
  message.info('已断开SSH连接');
}

// 重置表单
function resetForm() {
  formApi.resetForm();
  selectedAsset.value = null;
  hostInfo.value = null;
  isConnected.value = false;
  // 完全重置终端状态
  terminalRef.value?.clear();
  // 强制重新适配终端大小
  nextTick(() => {
    setTimeout(() => {
      terminalRef.value?.fit();
    }, 100);
  });
}

// 连接状态变化处理
function onConnectionChange(connected: boolean) {
  isConnected.value = connected;

  // 连接成功后强制调整终端大小
  if (connected) {
    nextTick(() => {
      // 多次调整确保终端正确显示
      setTimeout(() => {
        terminalRef.value?.fit();
        console.log('Drawer: First fit after connection');
      }, 100);

      setTimeout(() => {
        terminalRef.value?.fit();
        console.log('Drawer: Second fit after connection');
      }, 300);

      setTimeout(() => {
        terminalRef.value?.fit();
        console.log('Drawer: Final fit after connection');
      }, 600);
    });
  }
}

// 抽屉关闭处理
function handleClosed() {
  resetForm();
}

// 暴露方法给父组件
defineExpose({
  open: () => drawerApi.open(),
  close: () => drawerApi.close(),
  resetForm,
  connectSSH,
  disconnectSSH,
});
</script>

<template>
  <BasicDrawer title="连接终端" class="w-[1400px]">
    <div class="flex h-[calc(100vh-120px)] gap-4 overflow-hidden">
      <!-- 左侧连接配置区域 -->
      <div class="terminal-left-panel">
        <Card title="连接配置" size="small" class="flex-1">
          <BasicForm />

          <div class="mt-4 flex gap-2">
            <Button
              type="primary"
              :disabled="isConnected"
              :loading="false"
              @click="connectSSH"
            >
              连接主机
            </Button>
            <Button danger :disabled="!isConnected" @click="disconnectSSH">
              断开连接
            </Button>
          </div>

          <div class="mt-4 flex gap-2">
            <Button block @click="resetForm">重置</Button>
          </div>

          <!-- 连接状态显示 -->
          <div class="mt-4">
            <div class="mb-2 text-sm font-medium">连接状态</div>
            <div class="flex items-center gap-2">
              <div
                class="h-3 w-3 rounded-full"
                :class="[isConnected ? 'bg-green-500' : 'bg-red-500']"
              ></div>
              <span class="text-sm">
                {{ isConnected ? '已连接' : '未连接' }}
              </span>
            </div>
            <div
              v-if="hostInfo && isConnected"
              class="mt-2 text-xs text-gray-500"
            >
              {{ hostInfo.name }} ({{ hostInfo.ip }})
            </div>
          </div>
        </Card>
      </div>

      <!-- 右侧终端区域 -->
      <div class="flex min-w-0 flex-1 flex-col">
        <Card
          title="SSH终端"
          size="small"
          class="terminal-card flex-1"
          :body-style="{ padding: '0', height: '100%', overflow: 'hidden' }"
        >
          <Terminal
            ref="terminalRef"
            height="100%"
            width="100%"
            @connection-change="onConnectionChange"
          />
        </Card>
      </div>
    </div>

    <!-- CMDB资产选择弹窗 -->
    <CiSelector
      :open="showAssetSelector"
      :multiple="false"
      title="选择连接主机"
      @confirm="handleAssetSelect"
      @cancel="showAssetSelector = false"
    />
  </BasicDrawer>
</template>

<style scoped>
/* Card样式优化 */
.terminal-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

:deep(.terminal-card .ant-card-body) {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 0;
  overflow: hidden;
}

/* 左侧面板样式 */
.terminal-left-panel {
  display: flex;
  flex-direction: column;
  min-width: 300px;
  max-width: 300px;
}

/* 强制终端充满空间 */
:deep(.terminal-wrapper) {
  display: flex !important;
  flex: 1 !important;
  flex-direction: column !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
}

:deep(.terminal-container) {
  flex: 1 !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
}
</style>
