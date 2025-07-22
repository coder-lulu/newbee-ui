<script setup lang="ts" name="TerminalHeader">
import { computed, ref } from 'vue';

import { message } from 'ant-design-vue';

import TerminalSettingModal from './TerminalSettingModal.vue';

interface Machine {
  username?: string;
  host?: string;
  port?: number;
  status?: string;
}

interface TerminalHeaderProps {
  machineId?: number;
  machine?: Machine;
}

const props = withDefaults(defineProps<TerminalHeaderProps>(), {
  machineId: 0,
  machine: () => ({}),
});

const emit = defineEmits<{
  dispose: [];
  openSftp: [];
  reload: [];
  sendCommand: [command: string];
}>();

// 终端状态枚举
const TERMINAL_STATUS = {
  NOT_CONNECT: { value: 'NOT_CONNECT', label: '未连接', color: '#ff4d4f' },
  CONNECTING: { value: 'CONNECTING', label: '连接中', color: '#faad14' },
  CONNECTED: { value: 'CONNECTED', label: '已连接', color: '#52c41a' },
  DISCONNECTED: { value: 'DISCONNECTED', label: '已断开', color: '#ff4d4f' },
  ERROR: { value: 'ERROR', label: '错误', color: '#ff4d4f' },
};

const settingModal = ref();
const commandInput = ref('');
const isFullScreen = ref(false);

// 计算属性
const statusLabel = computed(() => {
  const status = props.machine?.status || TERMINAL_STATUS.NOT_CONNECT.value;
  const statusObj = Object.values(TERMINAL_STATUS).find(
    (s) => s.value === status,
  );
  return statusObj?.label || '未知';
});

const statusStyle = computed(() => {
  const status = props.machine?.status || TERMINAL_STATUS.NOT_CONNECT.value;
  const statusObj = Object.values(TERMINAL_STATUS).find(
    (s) => s.value === status,
  );
  return {
    backgroundColor: statusObj?.color || '#ff4d4f',
    cursor: 'pointer',
    userSelect: 'none',
    marginRight: '16px',
  };
});

const copySshCommand = async () => {
  if (
    !props.machine?.username ||
    !props.machine?.host ||
    !props.machine?.port
  ) {
    message.error('SSH信息不完整');
    return;
  }
  const command = `ssh ${props.machine.username}@${props.machine.host} -p ${props.machine.port}`;
  try {
    await navigator.clipboard.writeText(command);
    message.success('SSH命令已复制到剪贴板');
  } catch {
    message.error('复制失败，请检查剪贴板权限');
  }
};

const copyHost = async () => {
  if (!props.machine?.host) {
    message.error('主机信息不存在');
    return;
  }
  try {
    await navigator.clipboard.writeText(props.machine.host);
    message.success('主机地址已复制到剪贴板');
  } catch {
    message.error('复制失败，请检查剪贴板权限');
  }
};

const sendCommand = () => {
  if (!commandInput.value.trim()) {
    return;
  }
  emit('sendCommand', commandInput.value);
  commandInput.value = '';
};

const confirmStatus = () => {
  if (props.machine?.status === TERMINAL_STATUS.CONNECTED.value) {
    emit('dispose');
  } else {
    emit('reload');
  }
};

const fullscreen = () => {
  if (isFullScreen.value) {
    document.exitFullscreen?.();
  } else {
    document.documentElement.requestFullscreen?.();
  }
  isFullScreen.value = !isFullScreen.value;
};

const openSftp = () => {
  emit('openSftp');
};

const openSetting = () => {
  settingModal.value?.openSetting();
};
</script>

<template>
  <div class="terminal-header-container">
    <div class="terminal-header-main">
      <!-- 左侧菜单 -->
      <div class="terminal-header-fixed-left">
        <!-- ssh信息 -->
        <div class="terminal-ssh">
          <span v-if="machine.username">
            <a-tooltip title="复制ssh">
              <span @click="copySshCommand">{{ machine.username }}@</span>
            </a-tooltip>
            <a-tooltip title="复制ip">
              <span @click="copyHost"
                >{{ machine.host }}:{{ machine.port }}</span
              >
            </a-tooltip>
          </span>
        </div>
        <!-- 命令输入框 -->
        <div class="terminal-command-input-wrapper">
          <a-input-search
            placeholder="command"
            :disabled="machine.status !== TERMINAL_STATUS.CONNECTED.value"
            v-model="commandInput"
            @search="sendCommand"
          >
            <template #enterButton>
              <a-icon type="forward" />
            </template>
          </a-input-search>
        </div>
      </div>
      <!-- 右侧菜单 -->
      <div class="terminal-header-fixed-right">
        <!-- 状态 -->
        <a-popconfirm
          placement="bottom"
          ok-text="确认"
          cancel-text="取消"
          @confirm="confirmStatus"
        >
          <template #title>
            <p v-if="machine.status === TERMINAL_STATUS.CONNECTED.value">
              确认断开?
            </p>
            <p v-else>确认重新连接?</p>
          </template>
          <a-badge :count="statusLabel" :number-style="statusStyle" />
        </a-popconfirm>
        <!-- 提示 -->
        <a-popover placement="bottom">
          <template #content>
            <div style="font-size: 15px; line-height: 26px">
              <span>ctrl + insert (复制)</span><br />
              <span>ctrl + shift + c (复制)</span><br />
              <span>shift + insert (粘贴)</span><br />
              <span>ctrl + shift + v (粘贴)</span><br />
              <span>ctrl + shift + f (搜索)</span><br />
              <span>shift + 鼠标滚轮 (快速移动)</span><br />
              <span>alt + 鼠标左键 (批量选择)</span>
            </div>
          </template>
          <a-icon class="trigger-icon" type="question-circle" />
        </a-popover>
        <!-- 全屏 -->
        <a-icon
          id="terminal-screen-icon"
          class="trigger-icon"
          :type="isFullScreen ? 'fullscreen-exit' : 'fullscreen'"
          :title="isFullScreen ? '退出全屏' : '全屏'"
          @click="fullscreen"
        />
        <!-- 设置 -->
        <a-icon
          id="terminal-setting-icon"
          class="trigger-icon"
          title="设置"
          type="setting"
          @click="openSetting"
        />
        <!-- sftp -->
        <a-button
          id="sftp-trigger"
          :disabled="machine.status !== TERMINAL_STATUS.CONNECTED.value"
          type="primary"
          @click="openSftp"
        >
          文件管理器
        </a-button>
      </div>
    </div>
    <!-- 设置模态框 -->
    <TerminalSettingModal ref="settingModal" :machine-id="machineId" />
  </div>
</template>

<style lang="less" scoped>
.terminal-header-main {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #e9ecef;

  .terminal-header-fixed-left {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .terminal-ssh {
      max-width: 300px;
      margin: 0 16px 0 8px;
      cursor: pointer;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 500;
      font-size: 15px;
    }

    .terminal-command-input-wrapper {
      width: 400px;
    }
  }

  .terminal-header-fixed-right {
    display: flex;
    align-items: center;

    #sftp-trigger {
      margin-right: 8px;
    }

    .trigger-icon {
      cursor: pointer;
      font-size: 22px;
      margin-right: 15px;
      transition: color 0.3s;
    }

    .trigger-icon:hover {
      color: #1c7ed6;
    }
  }
}
</style>
