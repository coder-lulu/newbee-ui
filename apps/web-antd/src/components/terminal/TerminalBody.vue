<script setup lang="ts" name="TerminalBody">
import { nextTick, ref, watch } from 'vue';

import { Icon } from '@iconify/vue';
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';

import TerminalSearch from './TerminalSearch.vue';

import 'xterm/css/xterm.css';

interface TerminalBodyProps {
  height?: string;
}

interface TerminalOptions {
  accessToken: string;
  backgroundColor: string;
  fontColor: string;
  fontSize: number;
  fontFamily: string;
  enableWebLink: number;
}

const props = withDefaults(defineProps<TerminalBodyProps>(), {
  height: '100%',
});

const emit = defineEmits<{
  changeStatus: [status: string];
}>();

// 终端状态枚举
const TERMINAL_STATUS = {
  NOT_CONNECT: { value: 'NOT_CONNECT', label: '未连接', color: '#ff4d4f' },
  CONNECTING: { value: 'CONNECTING', label: '连接中', color: '#faad14' },
  CONNECTED: { value: 'CONNECTED', label: '已连接', color: '#52c41a' },
  DISCONNECTED: { value: 'DISCONNECTED', label: '已断开', color: '#ff4d4f' },
  ERROR: { value: 'ERROR', label: '错误', color: '#ff4d4f' },
};

// WebSocket协议枚举
const WS_PROTOCOL = {
  OK: { value: '0' },
  CONNECTED: { value: '1' },
  PING: { value: '2' },
};

// 客户端操作枚举
const TERMINAL_CLIENT_OPERATOR = {
  CONNECT: { value: '0' },
  COMMAND: { value: '1' },
  RESIZE: { value: '2' },
  PING: { value: '3' },
  PONG: { value: '4' },
};

/**
 * 默认配置
 */
const options = ref({
  cursorStyle: 'bar' as const,
  cursorBlink: true,
  fastScrollModifier: 'shift' as const,
  fontSize: 14,
  rendererType: 'canvas' as const,
  fontFamily: 'courier-new, courier, monospace',
  theme: {
    foreground: '#FFFFFF',
    background: '#212529',
  },
});

// 响应式数据
const terminal = ref<HTMLElement>();
const search = ref();
const term = ref<Terminal>();
const client = ref<WebSocket>();
const plugin = ref({
  fit: null as FitAddon | null,
  search: null,
  links: null as null | WebLinksAddon,
});
const status = ref<string>(TERMINAL_STATUS.NOT_CONNECT.value);
const pingThread = ref<NodeJS.Timeout | null>(null);
const accessToken = ref<string>('');
const enableWebLink = ref<number>(0);
const visibleRightMenu = ref(false);

// 防抖的窗口大小调整函数
const debouncedWindowResize = debounce(() => {
  fitTerminal();
}, 100);

// 监听状态变化
watch(status, (newStatus) => {
  emit('changeStatus', newStatus);
});

/**
 * 客户端操作处理器
 */
const clientHandler = {
  onopen() {
    // 发送认证信息 xx|cols|rows|loginToken
    const loginToken = localStorage.getItem('loginToken') || '';
    const body = `${TERMINAL_CLIENT_OPERATOR.CONNECT.value}|${term.value?.cols}|${term.value?.rows}|${loginToken}`;
    client.value?.send(body);
  },
  onmessage({ data: msg }: { data: string }) {
    // 解析协议
    if (!term.value) {
      return;
    }
    const code = msg.slice(0, 1);
    const len = msg.length;
    switch (code) {
      case WS_PROTOCOL.CONNECTED.value: {
        onConnected();
        break;
      }
      case WS_PROTOCOL.OK.value: {
        term.value.write(msg.substring(2, len));
        break;
      }
      case WS_PROTOCOL.PING.value: {
        sendPong();
        break;
      }
      default: {
        break;
      }
    }
  },
  onerror() {
    status.value = TERMINAL_STATUS.ERROR.value;
    message.error('无法连接至服务器', 2);
    term.value?.write('\r\n\u001B[91mfailed to establish connection\u001B[0m');
  },
  onclose(e: CloseEvent) {
    status.value = TERMINAL_STATUS.DISCONNECTED.value;
    term.value?.write(`\r\n\u001B[91m${e.reason}\u001B[0m`);
    term.value?.options && (term.value.options.cursorBlink = false);
    // 关闭窗口大小监听器
    window.removeEventListener('resize', debouncedWindowResize);
    // 关闭心跳
    if (pingThread.value) {
      clearInterval(pingThread.value);
      pingThread.value = null;
    }
  },
};

/**
 * 右键菜单操作
 */
const rightMenuHandler: Record<string, () => void> = {
  selectAll() {
    term.value?.selectAll();
    term.value?.focus();
  },
  copy() {
    doCopy();
  },
  async paste() {
    try {
      const clipText = await navigator.clipboard.readText();
      term.value?.paste(clipText);
      term.value?.focus();
    } catch {
      message.error('粘贴失败，请检查剪贴板权限');
    }
  },
  clear() {
    term.value?.clear();
    term.value?.clearSelection();
    term.value?.focus();
  },
  toTop() {
    term.value?.scrollToTop();
    term.value?.focus();
  },
  toBottom() {
    term.value?.scrollToBottom();
    term.value?.focus();
  },
  openSearch() {
    search.value?.open();
  },
};

// 方法定义
const init = (terminalOptions: TerminalOptions) => {
  // terminal选项
  status.value = TERMINAL_STATUS.NOT_CONNECT.value;
  options.value.theme.background = terminalOptions.backgroundColor;
  options.value.theme.foreground = terminalOptions.fontColor;
  options.value.fontSize = terminalOptions.fontSize;
  options.value.fontFamily = terminalOptions.fontFamily;
  accessToken.value = terminalOptions.accessToken;
  enableWebLink.value = terminalOptions.enableWebLink;

  // 初始化
  nextTick(() => {
    // 打开terminal
    term.value = new Terminal(options.value);
    if (terminal.value) {
      term.value.open(terminal.value);
    }

    // 注册自适应组件
    plugin.value.fit = new FitAddon();
    term.value.loadAddon(plugin.value.fit);

    // 注册 url link组件
    if (enableWebLink.value === 1) {
      plugin.value.links = new WebLinksAddon();
      term.value.loadAddon(plugin.value.links);
    }

    fitTerminal();
    // 建立连接
    initSocket();
  });
};

const initSocket = () => {
  // 打开websocket - 简化为本地WebSocket连接
  const wsUrl = `ws://localhost:8889/ws/terminal?token=${accessToken.value}`;
  client.value = new WebSocket(wsUrl);

  client.value.addEventListener('open', (event) => {
    clientHandler.onopen();
  });
  client.value.onerror = (event) => {
    clientHandler.onerror();
  };
  client.value.addEventListener('close', (event) => {
    clientHandler.onclose(event);
  });
  client.value.onmessage = (event) => {
    clientHandler.onmessage(event);
  };
};

const fitTerminal = () => {
  const dimensions = plugin.value.fit?.proposeDimensions();
  if (!dimensions) {
    return;
  }
  if (dimensions?.cols && dimensions?.rows) {
    term.value?.resize(dimensions.cols, dimensions.rows);
  }
};

const onConnected = () => {
  status.value = TERMINAL_STATUS.CONNECTED.value;
  // 注册心跳
  pingThread.value = setInterval(() => sendPing(), 15_000);
  // 注册 terminal 事件
  term.value?.onResize((event) => sendResize(event.cols, event.rows));
  term.value?.onData((event) => sendKey(event));

  // 注册自定义快捷键
  term.value?.attachCustomKeyEventHandler((event) => {
    // 搜索键 ctrl + shift + f
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyF') {
      search.value?.open();
      return false;
    }
    // 复制键 ctrl + shift + c
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyC') {
      doCopy();
      return false;
    }
    // 粘贴键 ctrl + shift + v
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyV') {
      rightMenuHandler.paste();
      return false;
    }
    return true;
  });

  // 注册窗口大小监听器
  window.addEventListener('resize', debouncedWindowResize);
};

const sendPing = () => {
  if (client.value?.readyState === WebSocket.OPEN) {
    client.value.send(TERMINAL_CLIENT_OPERATOR.PING.value);
  }
};

const sendPong = () => {
  if (client.value?.readyState === WebSocket.OPEN) {
    client.value.send(TERMINAL_CLIENT_OPERATOR.PONG.value);
  }
};

const sendResize = (cols: number, rows: number) => {
  if (client.value?.readyState === WebSocket.OPEN) {
    const body = `${TERMINAL_CLIENT_OPERATOR.RESIZE.value}|${cols}|${rows}`;
    client.value.send(body);
  }
};

const sendKey = (key: string) => {
  if (client.value?.readyState === WebSocket.OPEN) {
    const body = `${TERMINAL_CLIENT_OPERATOR.COMMAND.value}|${key}`;
    client.value.send(body);
  }
};

const doCopy = async () => {
  const selection = term.value?.getSelection();
  if (selection) {
    try {
      await navigator.clipboard.writeText(selection);
      message.success('复制成功');
    } catch {
      message.error('复制失败，请检查剪贴板权限');
    }
  }
};

const clickTerminal = () => {
  term.value?.focus();
};

const clickRightMenuItem = ({ key }: { key: string }) => {
  const handler = rightMenuHandler[key];
  if (handler) {
    handler();
  }
  visibleRightMenu.value = false;
};

const dispose = () => {
  // 关闭连接
  client.value?.close();
  client.value = undefined;

  // 关闭心跳
  if (pingThread.value) {
    clearInterval(pingThread.value);
    pingThread.value = null;
  }

  // 关闭窗口监听器
  window.removeEventListener('resize', debouncedWindowResize);

  // 销毁终端
  term.value?.dispose();
  term.value = undefined;

  status.value = TERMINAL_STATUS.NOT_CONNECT.value;
};

const focus = () => {
  term.value?.focus();
};

// 暴露方法给父组件
defineExpose({
  init,
  dispose,
  fitTerminal,
  focus,
  sendKey,
  term: term.value,
});
</script>

<template>
  <div
    class="terminal-body"
    :style="{ height, background: options.theme.background }"
  >
    <!-- 右键菜单 -->
    <a-dropdown v-model="visibleRightMenu" :trigger="['contextmenu']">
      <!-- 终端 -->
      <div ref="terminal" class="terminal" @click="clickTerminal"></div>
      <!-- 下拉菜单 -->
      <template #overlay>
        <a-menu @click="clickRightMenuItem">
          <a-menu-item key="selectAll">
            <span class="right-menu-item">
              <Icon icon="ant-design:profile-outlined" />
              全选
            </span>
          </a-menu-item>
          <a-menu-item key="copy">
            <span class="right-menu-item">
              <Icon icon="ant-design:copy-outlined" />
              复制
            </span>
          </a-menu-item>
          <a-menu-item key="paste">
            <span class="right-menu-item">
              <Icon icon="ant-design:snippets-outlined" />
              粘贴
            </span>
          </a-menu-item>
          <a-menu-item key="clear">
            <span class="right-menu-item">
              <Icon icon="ant-design:stop-outlined" />
              清空
            </span>
          </a-menu-item>
          <a-menu-item key="openSearch">
            <span class="right-menu-item">
              <Icon icon="ant-design:search-outlined" />
              搜索
            </span>
          </a-menu-item>
          <a-menu-item key="toTop">
            <span class="right-menu-item">
              <Icon icon="ant-design:vertical-align-top-outlined" />
              去顶部
            </span>
          </a-menu-item>
          <a-menu-item key="toBottom">
            <span class="right-menu-item">
              <Icon icon="ant-design:vertical-align-bottom-outlined" />
              去底部
            </span>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    <!-- 搜索框 -->
    <TerminalSearch
      ref="search"
      :search-plugin="plugin.search"
      @close="focus"
    />
  </div>
</template>

<style scoped>
.terminal-body {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.terminal {
  width: 100%;
  height: 100%;
}

.right-menu-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

:deep(.xterm) {
  padding: 8px;
}

:deep(.xterm-viewport) {
  overflow-y: auto;
}

:deep(.xterm-screen canvas) {
  outline: none;
}
</style>
