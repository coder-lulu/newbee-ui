<script setup lang="ts">
import type { CisInfo } from '#/api/cmdb/cis/model';
import type { OpsCommand, OpsExecCommandResp } from '#/api/ops/command/model';
import type { OpsCommandExecHistorySimple } from '#/api/ops/exec-history/model';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Card, message, Modal, Spin } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getCisById } from '#/api/cmdb/cis';
import {
  executeOpsCommand,
  getOpsCommandById,
  getOpsCommandList,
} from '#/api/ops/command';
import { ExecuteResultUtils } from '#/api/ops/command/model';
import { getOpsCommandExecHistorySimpleList } from '#/api/ops/exec-history';
import { getOpsHostCredentialList } from '#/api/ops/host-credential';
// 引入CMDB资产选择组件
import CiSelector from '#/views/cmdb/cis/components/CiSelector.vue';

defineEmits<{ reload: [] }>();

interface DrawerProps {
  commandId: string;
  commandName: string;
}

// 状态管理
const commandInfo = ref<any>(null);
const isExecuting = ref(false);
const executionOutput = ref('');
const executionHistory = ref<OpsCommandExecHistorySimple[]>([]);
const selectedAssets = ref<any[]>([]);
const hostList = ref<any[]>([]);

// CMDB资产选择相关
const showAssetSelector = ref(false);
const showCommandSelector = ref(false);
const commandList = ref<OpsCommand[]>([]);
const credentialList = ref<any[]>([]);

// CodeMirror 表单配置
const [OutputForm, outputFormApi] = useVbenForm({
  schema: [
    {
      component: 'CodeMirror',
      fieldName: 'output',
      label: '', // 设置空label
      componentProps: {
        language: 'shell',
        placeholder: '输入可执行的命令',
        class: 'terminal-editor',
        style: { height: '100%', minHeight: '500px', width: '100%' },
        lineNumbers: false,
        lineWrapping: true,
      },
    },
  ],
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'h-full w-full',
    },
  },
  // 全局配置不显示label
  layout: 'vertical',
});

// 表单配置
const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  schema: [
    {
      component: 'Select',
      fieldName: 'selectedHosts',
      label: '执行主机',
      rules: 'required',
      componentProps: {
        mode: 'multiple',
        placeholder: '选择主机',
        options: computed(() =>
          hostList.value.map((host) => ({
            label: `${host.name} (${host.ip})`,
            value: host.id,
          })),
        ),
      },
    },
    {
      component: 'Select',
      fieldName: 'credentialId',
      label: '执行凭证',
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
    {
      component: 'Textarea',
      fieldName: 'description',
      label: '执行描述',
      componentProps: {
        placeholder: '请输入执行描述',
        rows: 3,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'timeout',
      label: '超时时间',
      componentProps: {
        placeholder: '0',
        addonAfter: '秒',
        min: 0,
      },
      defaultValue: 0,
    },
  ],
  showDefaultActions: false,
});

const [BasicDrawer, drawerApi] = useVbenDrawer({
  footer: false, // 隐藏底部按钮
  onClosed: handleClosed,
  async onOpenChange(isOpen) {
    if (!isOpen) return;

    drawerApi.drawerLoading(true);

    try {
      const { commandId } = drawerApi.getData() as DrawerProps;

      if (commandId) {
        // 获取命令详情
        const commandData = await getOpsCommandById({ id: commandId });
        commandInfo.value = commandData;
        // 初始化输出区域
        executionOutput.value =
          commandData.data?.commandContent || '输入可执行的命令';
      } else {
        executionOutput.value = '输入可执行的命令';
      }

      await outputFormApi.setFieldValue('output', executionOutput.value);

      // 加载执行历史
      await loadExecutionHistory();

      // 加载凭证列表
      await loadCredentialList();
    } catch (error) {
      console.error('加载命令信息失败:', error);
      message.error('加载命令信息失败');
    } finally {
      drawerApi.drawerLoading(false);
    }
  },
});

// 加载执行历史
async function loadExecutionHistory() {
  try {
    const result = await getOpsCommandExecHistorySimpleList({
      page: 1,
      pageSize: 15,
    });
    executionHistory.value = result.data || [];
  } catch (error) {
    console.error('加载执行历史失败:', error);
  }
}

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
  selectedAssets.value = assets;
  showAssetSelector.value = false;

  // 处理选中的资产，获取详细信息
  const hostInfoPromises = assets.map(async (asset) => {
    try {
      const cisInfo = await getCisById({ id: asset.id });
      return processCisInfo(cisInfo.data || cisInfo);
    } catch (error) {
      console.error('获取资产详情失败:', error);
      return null;
    }
  });

  const hostInfos = await Promise.all(hostInfoPromises);
  hostList.value = hostInfos.filter(Boolean);

  // 更新表单选项 - 使用主机ID而不是IP
  await formApi.setFieldValue(
    'selectedHosts',
    hostList.value.map((h) => h.ip),
  );

  message.success(`已选择 ${hostList.value.length} 台主机`);
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

// 打开命令选择器
async function openCommandSelector() {
  try {
    showCommandSelector.value = true;
    const result = await getOpsCommandList({
      page: 1,
      pageSize: 100,
      // status: 1, // 正常状态
      // isApproved: true, // 已审核
    });
    commandList.value = result.data || [];
  } catch (error) {
    console.error('加载命令列表失败:', error);
    message.error('加载命令列表失败');
  }
}

// 选择命令
async function selectCommand(command: OpsCommand) {
  try {
    executionOutput.value = command.commandContent || '';
    await outputFormApi.setFieldValue('output', executionOutput.value);
    showCommandSelector.value = false;
    message.success(`已选择命令: ${command.name}`);
  } catch (error) {
    console.error('选择命令失败:', error);
  }
}

// 执行命令
async function executeCommand() {
  try {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const formData = await formApi.getValues();
    const selectedHosts = formData.selectedHosts || [];
    const credentialId = formData.credentialId;

    if (selectedHosts.length === 0) {
      message.warning('请选择要执行的主机');
      return;
    }

    if (!credentialId) {
      message.warning('请选择执行凭证');
      return;
    }

    isExecuting.value = true;
    executionOutput.value = '';

    // 调用真实的后端API执行命令
    await executeRealCommand(formData);
  } catch (error) {
    console.error('命令执行失败:', error);
    message.error('命令执行失败');
  } finally {
    isExecuting.value = false;
  }
}

// 调用真实后端API执行命令
async function executeRealCommand(formData: any) {
  try {
    // 获取选中的凭证信息
    const credential = credentialList.value.find(
      (c) => c.id === formData.credentialId,
    );
    // 获取当前命令内容（从CodeMirror编辑器中获取）
    const formValues = await outputFormApi.getValues();
    const commandContent = formValues.output;

    // 验证命令内容
    if (
      !commandContent ||
      commandContent.trim() === '' ||
      commandContent.trim() === '输入可执行的命令'
    ) {
      message.warning('请输入要执行的命令内容');
      return;
    }

    // 添加执行开始信息
    addExecutionOutput(`=== 开始执行命令 ===`);
    addExecutionOutput(`执行时间: ${new Date().toLocaleString()}`);
    addExecutionOutput(`执行主机: ${formData.selectedHosts.length} 台主机`);
    addExecutionOutput(
      `执行凭证: ${credential?.name || '未知凭证'} (${credential?.username || 'unknown'})`,
    );
    addExecutionOutput(`超时时间: ${formData.timeout || 0} 秒`);
    addExecutionOutput(`执行描述: ${formData.description || '无'}`);
    addExecutionOutput(`命令内容: ${commandContent}`);
    addExecutionOutput('');

    // 构造API请求参数
    const executeRequest = {
      targetHosts: formData.selectedHosts,
      commandContent: commandContent || '',
      credentialId: formData.credentialId,
      description: formData.description,
      timeout: formData.timeout || 0,
      params: {},
      envVars: {},
      workingDir: commandInfo.value?.data?.workingDir || '',
      useCustomParams: false,
    };

    addExecutionOutput('正在向后端发送执行请求...');

    // 调用后端API
    const results: OpsExecCommandResp = await executeOpsCommand(executeRequest);
    console.log(results);
    addExecutionOutput('后端响应已收到，开始处理执行结果...');
    addExecutionOutput('');

    // 处理执行结果
    if (results && results.length > 0) {
      let successCount = 0;
      let failedCount = 0;

      for (const result of results) {
        const hostInfo = hostList.value.find((h) => h.ip === result.hostIp) || {
          name: result.hostIp,
          ip: result.hostIp,
        };

        addExecutionOutput(
          `> 主机: ${hostInfo.name} (${result.hostIp || 'unknown'})`,
        );

        // 显示执行状态
        const statusText = ExecuteResultUtils.formatStatus(result);
        addExecutionOutput(`状态: ${statusText}`);

        // 显示执行时间
        if (result.startTime && result.endTime) {
          const duration = ExecuteResultUtils.calculateDuration(result);
          addExecutionOutput(`耗时: ${duration}ms`);
        }

        // 显示退出代码
        if (result.exitCode !== undefined) {
          addExecutionOutput(`退出代码: ${result.exitCode}`);
        }

        // 显示标准输出
        const output = ExecuteResultUtils.getPrimaryOutput(result);
        if (output) {
          addExecutionOutput('标准输出:');
          addExecutionOutput(output);
        }

        // 显示错误信息
        const errorMsg = ExecuteResultUtils.getErrorMessage(result);
        if (errorMsg) {
          addExecutionOutput('错误输出:');
          addExecutionOutput(errorMsg);
        }

        // 统计成功失败数量
        if (ExecuteResultUtils.isSuccess(result)) {
          successCount++;
        } else {
          failedCount++;
        }

        addExecutionOutput('');
      }

      // 显示执行总结
      addExecutionOutput(`=== 命令执行完成 ===`);
      addExecutionOutput(`总主机数: ${results.length}`);
      addExecutionOutput(`成功: ${successCount} 台`);
      addExecutionOutput(`失败: ${failedCount} 台`);
    } else {
      addExecutionOutput('没有收到执行结果');
    }

    // 刷新执行历史
    await loadExecutionHistory();

    message.success('命令执行完成');
  } catch (error: any) {
    console.error('调用执行API失败:', error);
    addExecutionOutput('');
    addExecutionOutput(`=== 执行失败 ===`);
    addExecutionOutput(`错误信息: ${error.message || '未知错误'}`);
    addExecutionOutput(`错误详情: ${JSON.stringify(error, null, 2)}`);

    message.error(`命令执行失败: ${error.message || '未知错误'}`);
    throw error;
  }
}

// 添加执行输出
function addExecutionOutput(text: string) {
  executionOutput.value += `${text}\n`;

  // 更新 CodeMirror 内容
  nextTick(async () => {
    try {
      await outputFormApi.setFieldValue('output', executionOutput.value);
    } catch (error) {
      console.warn('更新CodeMirror内容失败:', error);
    }
  });
}

// 重置表单
function resetForm() {
  formApi.resetForm();
  hostList.value = [];
  selectedAssets.value = [];
  executionOutput.value = '';
  outputFormApi.setFieldValue('output', '输入可执行的命令');
}

// 关闭处理
async function handleClosed() {
  await formApi.resetForm();
  executionOutput.value = '';
  executionHistory.value = [];
  commandInfo.value = null;
  hostList.value = [];
  selectedAssets.value = [];
  await outputFormApi.setFieldValue('output', '');
}

// 历史记录点击
function onHistoryClick(history: OpsCommandExecHistorySimple) {
  executionOutput.value = history.commandContent || '无命令内容';
  outputFormApi.setFieldValue('output', executionOutput.value);
}
</script>

<template>
  <BasicDrawer title="执行命令" class="w-[1400px]">
    <div class="flex h-[80vh] gap-4 overflow-hidden">
      <!-- 左侧参数配置区域 -->
      <div class="flex w-[280px] flex-col">
        <Card title="执行参数" size="small" class="flex-1">
          <div class="mb-4">
            <div class="mb-2 text-sm font-medium">执行主机</div>
            <Button block type="dashed" @click="openAssetSelector">
              选择主机
              {{
                selectedAssets.length > 0
                  ? `(已选${selectedAssets.length}台)`
                  : ''
              }}
            </Button>
            <div v-if="hostList.length > 0" class="mt-2 max-h-32 overflow-auto">
              <div
                v-for="host in hostList"
                :key="host.id"
                class="mb-1 flex items-center justify-between rounded bg-gray-50 px-2 py-1 text-xs"
              >
                <span>{{ host.name }}</span>
                <span class="text-gray-500">{{ host.ip }}</span>
              </div>
            </div>
          </div>

          <BasicForm />
          <div class="mt-4 flex gap-2">
            <Button
              type="primary"
              :loading="isExecuting"
              @click="executeCommand"
            >
              执行
            </Button>
            <Button @click="resetForm">重置</Button>
          </div>
        </Card>
      </div>

      <!-- 中间命令执行区域 -->
      <div class="flex flex-1 flex-col">
        <Card
          title="执行命令"
          size="small"
          class="terminal-card flex-1"
          :body-style="{ padding: '0', height: '100%' }"
        >
          <template #extra>
            <Button size="small" @click="openCommandSelector">
              选择命令
            </Button>
          </template>

          <div class="relative h-full w-full">
            <div
              v-if="isExecuting"
              class="absolute left-2 top-2 z-10 flex items-center gap-2 rounded bg-black bg-opacity-80 px-2 py-1 text-green-400"
            >
              <Spin size="small" />
              <span>正在执行命令...</span>
            </div>

            <!-- 使用CodeMirror组件 -->
            <div class="codemirror-container h-full w-full">
              <OutputForm class="h-full w-full" />
            </div>
          </div>
        </Card>
      </div>

      <!-- 右侧执行历史区域 -->
      <div class="flex w-[280px] flex-col">
        <Card size="small" class="flex-1">
          <template #title>
            <div class="flex items-center justify-between">
              <span>执行历史</span>
              <span class="text-xs text-gray-500">最近近15条执行记录</span>
            </div>
          </template>

          <div class="max-h-[600px] space-y-2 overflow-auto">
            <div
              v-for="(item, index) in executionHistory"
              :key="item.id || index"
              class="flex cursor-pointer items-center justify-between rounded bg-blue-50 p-2 hover:bg-blue-100"
              @click="onHistoryClick(item)"
            >
              <div class="flex min-w-0 flex-1 items-center gap-2">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded bg-blue-500 text-xs text-white"
                >
                  {{ index + 1 }}
                </div>
                <span
                  class="truncate text-sm"
                  :title="item.commandContent || '未知命令'"
                >
                  {{
                    item.commandContent && item.commandContent.length > 15
                      ? `${item.commandContent.substring(0, 15)}...`
                      : item.commandContent || '未知命令'
                  }}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- CMDB资产选择弹窗 -->
    <CiSelector
      :open="showAssetSelector"
      :multiple="true"
      title="选择执行主机"
      @confirm="handleAssetSelect"
      @cancel="showAssetSelector = false"
    />

    <!-- 命令选择弹窗 -->
    <Modal
      :open="showCommandSelector"
      title="选择命令"
      width="800px"
      :footer="null"
      @cancel="showCommandSelector = false"
    >
      <div class="max-h-96 overflow-auto">
        <div
          v-for="command in commandList"
          :key="command.id"
          class="mb-2 cursor-pointer rounded border p-3 hover:bg-gray-50"
          @click="selectCommand(command)"
        >
          <div class="font-medium">{{ command.name }}</div>
          <div class="text-sm text-gray-500">{{ command.description }}</div>
          <div class="mt-2 text-xs text-gray-400">
            分类: {{ command.commandCategory }} | 类型:
            {{ command.commandType }}
          </div>
        </div>
      </div>
    </Modal>
  </BasicDrawer>
</template>

<style scoped>
.execution-output {
  font-family: 'Courier New', monospace;
  color: #0f0;
  background-color: #000;
}

.execution-output::-webkit-scrollbar {
  width: 8px;
}

.execution-output::-webkit-scrollbar-track {
  background: #333;
}

.execution-output::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 4px;
}

.execution-output::-webkit-scrollbar-thumb:hover {
  background: #888;
}

/* CodeMirror 容器样式 */
.codemirror-container {
  width: 100%;
  height: calc(80vh - 150px) !important;
  min-height: 480px !important;
}

/* Card样式优化 */
.terminal-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.terminal-card .ant-card-body) {
  flex: 1;
  height: calc(80vh - 100px); /* 使用视口高度减去其他元素高度 */
  min-height: 500px; /* 增大最小高度 */
  padding: 8px;
  overflow: hidden;
}

/* Vben表单样式 */
:deep(.vben-form) {
  height: 100%;
}

:deep(.vben-form .ant-form) {
  height: 100%;
}

:deep(.vben-form .ant-form-item) {
  display: flex !important;
  flex-direction: row !important;
  align-items: stretch !important;
  height: 100%;
  margin-bottom: 0;
}

/* 完全移除label的空间占用 - 使用更强的选择器覆盖内联样式 */
:deep(.vben-form .ant-form-item-label) {
  display: none !important;
  flex-shrink: 1 !important;
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  margin-right: 0 !important;
}

/* 更具体的选择器来覆盖内联样式 */
:deep(.vben-form .ant-form-item label[style*='width']) {
  display: none !important;
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
}

/* 针对具体的class组合进行覆盖 */
:deep(.vben-form label.text-sm.font-medium) {
  display: none !important;
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 让control占满整个宽度 */
:deep(.vben-form .ant-form-item-control) {
  flex: 1 !important;
  max-width: 100% !important;
  height: 100%;
  margin-left: 0 !important;
}

:deep(.vben-form .ant-form-item-control-input) {
  height: 100%;
}

:deep(.vben-form .ant-form-item-control-input-content) {
  height: 100%;
}

/* CodeMirror编辑器样式 */
:deep(.cm-editor) {
  width: 100% !important;
  height: calc(80vh - 150px) !important; /* 使用视口高度，减去更多空间 */
  min-height: 480px !important;
  font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace !important;
  color: #0f0 !important;
  background-color: #000 !important;
  border: 1px solid #333 !important;
  border-radius: 4px !important;
}

:deep(.cm-content) {
  height: 100% !important;
  min-height: 480px !important;
  padding: 12px !important;
  font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace !important;
  color: #0f0 !important;
  background-color: #000 !important;
}

:deep(.cm-scroller) {
  height: 100% !important;
  font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace !important;
  background-color: #000 !important;
}

:deep(.cm-focused) {
  outline: none !important;
}

:deep(.cm-line) {
  color: #0f0 !important;
}

/* 移除行号 */
:deep(.cm-lineNumbers) {
  display: none !important;
}

:deep(.cm-gutters) {
  display: none !important;
}

/* 活动行样式 */
:deep(.cm-activeLine) {
  background-color: rgb(255 255 255 / 5%) !important;
}

:deep(.cm-activeLineGutter) {
  background-color: rgb(255 255 255 / 5%) !important;
}

/* 强制容器高度 - 额外保险 */

/* 确保中间区域占满空间 */
:deep(.flex-1) {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
}
</style>
