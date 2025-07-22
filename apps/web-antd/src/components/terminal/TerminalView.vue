<script setup lang="ts" name="TerminalView">
import { nextTick, ref } from 'vue';

// import MachineSftpDrawer from '#/components/sftp/MachineSftpDrawer';
import { message } from 'ant-design-vue';

import TerminalBody from './TerminalBody.vue';
import TerminalHeader from './TerminalHeader.vue';

interface Machine {
  id: number;
  machineName: string;
  host: string;
  port: number;
  username: string;
  status?: string;
}

interface TerminalViewProps {
  terminalHeight?: string;
}

const props = withDefaults(defineProps<TerminalViewProps>(), {
  terminalHeight: '100%',
});

// 终端状态枚举
const TERMINAL_STATUS = {
  NOT_CONNECT: { value: 'NOT_CONNECT', label: '未连接', color: '#ff4d4f' },
  CONNECTING: { value: 'CONNECTING', label: '连接中', color: '#faad14' },
  CONNECTED: { value: 'CONNECTED', label: '已连接', color: '#52c41a' },
  DISCONNECTED: { value: 'DISCONNECTED', label: '已断开', color: '#ff4d4f' },
  ERROR: { value: 'ERROR', label: '错误', color: '#ff4d4f' },
};

const terminal = ref();
const machine = ref<Machine>({
  id: 0,
  machineName: '',
  host: '',
  port: 22,
  username: '',
  status: TERMINAL_STATUS.NOT_CONNECT.value,
});
const machineId = ref<number>(0);

const init = async (machineData: Machine) => {
  machine.value = {
    ...machineData,
    status: TERMINAL_STATUS.NOT_CONNECT.value,
  };
  machineId.value = machineData.id;

  const loading = message.loading('建立连接中...', 0);

  try {
    // 模拟API调用 - 需要根据实际API进行调整
    const data = {
      accessToken: 'dummy-token',
      backgroundColor: '#0c0c0c',
      fontColor: '#00ff00',
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
      enableWebLink: 1,
    };

    loading();
    await nextTick();
    terminal.value?.init(data);
  } catch (error: any) {
    loading();
    message.error(error.message || '初始化失败');
  }
};

const sendCommand = (command: string) => {
  terminal.value?.sendKey(command);
};

const dispose = () => {
  terminal.value?.dispose();
};

const reload = () => {
  dispose();
  init(machine.value);
};

const changeStatus = (status: string) => {
  machine.value.status = status;
};

const openSftp = () => {
  // SFTP功能暂未实现
  message.info('SFTP功能暂未实现');
};

const fitTerminal = () => {
  terminal.value?.fitTerminal();
};

const toTop = () => {
  terminal.value?.term?.scrollToTop();
};

const toBottom = () => {
  terminal.value?.term?.scrollToBottom();
};

const focus = () => {
  terminal.value?.focus();
};

// 暴露方法给父组件
defineExpose({
  init,
  sendCommand,
  dispose,
  reload,
  changeStatus,
  openSftp,
  fitTerminal,
  toTop,
  toBottom,
  focus,
});
</script>

<template>
  <div class="terminal-container">
    <!-- 头部 -->
    <TerminalHeader
      :machine-id="machineId"
      :machine="machine"
      @send-command="sendCommand"
      @reload="reload"
      @dispose="dispose"
      @open-sftp="openSftp"
    />
    <!-- terminal 主体 -->
    <TerminalBody
      ref="terminal"
      :height="terminalHeight"
      @change-status="changeStatus"
    />
  </div>
</template>

<style scoped>
.terminal-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
</style>
