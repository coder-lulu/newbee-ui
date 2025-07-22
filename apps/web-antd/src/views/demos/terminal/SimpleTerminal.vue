<script setup lang="ts" name="SimpleTerminal">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';

import { message } from 'ant-design-vue';

interface TerminalProps {
  height?: string;
  width?: string;
}

interface SSHConfig {
  target: string;
  port: number;
  username: string;
  password?: string;
  private_key?: string;
  auth_type: string;
  cols: number;
  rows: number;
  session_id: string;
}

const props = withDefaults(defineProps<TerminalProps>(), {
  height: '400px',
  width: '100%',
});

const emit = defineEmits<{
  connectionChange: [connected: boolean];
}>();

// 使用动态导入xterm相关库
let Terminal: any;
let FitAddon: any;

const terminalContainer = ref<HTMLElement>();
const terminal = ref<any>();
const fitAddon = ref<any>();
const websocket = ref<WebSocket>();
const isConnected = ref(false);
const isConnecting = ref(false);

// 监听窗口大小变化
let resizeObserver: null | ResizeObserver = null;

onMounted(async () => {
  await initTerminal();

  // 设置窗口大小变化监听
  if (terminalContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      nextTick(() => {
        fitAddon.value?.fit();
      });
    });
    resizeObserver.observe(terminalContainer.value);
  }
});

onUnmounted(() => {
  cleanup();
  resizeObserver?.disconnect();
});

// 初始化终端
async function initTerminal() {
  try {
    // 动态加载xterm CSS
    if (!document.querySelector('link[href*="xterm.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/xterm@4.14.1/css/xterm.css';
      document.head.append(link);
    }

    // 动态导入xterm相关库
    const xtermModule = await import('xterm');
    const fitAddonModule = await import('xterm-addon-fit');

    Terminal = xtermModule.Terminal;
    FitAddon = fitAddonModule.FitAddon;

    // 创建终端实例
    terminal.value = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
      theme: {
        background: '#0c0c0c',
        foreground: '#00ff00',
        cursor: '#00ff00',
      },
      convertEol: true,
      scrollback: 1000,
      allowProposedApi: true,
      disableStdin: false,
    });

    // 创建适配器
    fitAddon.value = new FitAddon();

    // 加载插件
    terminal.value.loadAddon(fitAddon.value);

    // 打开终端
    if (terminalContainer.value) {
      terminal.value.open(terminalContainer.value);

      // 延迟调用fit确保容器已经渲染完成
      setTimeout(() => {
        fitAddon.value.fit();
        console.log(
          'Terminal size after fit:',
          terminal.value.cols,
          'x',
          terminal.value.rows,
        );
      }, 100);

      // 额外的调整确保终端正确渲染
      setTimeout(() => {
        fitAddon.value.fit();
        terminal.value.focus();
      }, 300);
    }

    // 显示欢迎信息
    terminal.value.writeln('=== NewBee SSH Terminal ===');
    terminal.value.writeln('请点击"连接主机"按钮开始SSH连接');
    terminal.value.writeln('');

    // 监听用户输入
    terminal.value.onData((data: string) => {
      if (
        websocket.value &&
        isConnected.value &&
        websocket.value.readyState === WebSocket.OPEN
      ) {
        console.log('Sending data to SSH:', JSON.stringify(data));
        websocket.value.send(data);
      } else {
        console.log(
          'Cannot send data - WebSocket state:',
          websocket.value?.readyState,
          'isConnected:',
          isConnected.value,
        );
        if (!isConnected.value) {
          terminal.value?.writeln('\r\n连接已断开，请重新连接');
        }
      }
    });
  } catch (error) {
    console.error('初始化终端失败:', error);
    message.error('终端初始化失败，请检查网络连接');
  }
}

// WebSocket连接SSH
async function connect(sshConfig: SSHConfig) {
  if (isConnecting.value || isConnected.value) {
    return;
  }

  try {
    isConnecting.value = true;
    terminal.value?.clear();
    terminal.value?.writeln('正在建立WebSocket连接...');

    // 建立WebSocket连接
    const wsUrl = 'ws://localhost:8889/ws/ssh';
    websocket.value = new WebSocket(wsUrl);

    websocket.value.addEventListener('open', () => {
      terminal.value?.writeln('WebSocket连接已建立');
      terminal.value?.writeln('正在进行SSH握手...');

      // 发送SSH连接配置
      if (websocket.value) {
        websocket.value.send(JSON.stringify(sshConfig));
      }
    });

    // 消息处理
    websocket.value.addEventListener('message', (event) => {
      const data = event.data;

      // 尝试解析为JSON（连接响应）
      try {
        const response = JSON.parse(data);
        if (response.success) {
          isConnected.value = true;
          emit('connectionChange', true);

          // 清空终端内容，但不重置状态
          terminal.value?.clear();

          // 调整终端大小
          setTimeout(() => {
            fitAddon.value?.fit();
            console.log(
              'Terminal fitted to:',
              terminal.value.cols,
              'x',
              terminal.value.rows,
            );
          }, 100);
        } else {
          terminal.value?.writeln(`SSH连接失败: ${response.message}`);
          terminal.value?.writeln('');
          disconnect();
        }
      } catch {
        // 普通终端输出数据
        if (
          isConnected.value &&
          websocket.value?.readyState === WebSocket.OPEN
        ) {
          console.log('SSH Data received:', JSON.stringify(data));
          terminal.value?.write(data);

          setTimeout(() => {
            const cursorY = terminal.value?.buffer?.active?.cursorY;
            const rows = terminal.value?.rows;

            if (cursorY >= rows - 1) {
              console.log('Content beyond viewport, scrolling to bottom');
              terminal.value?.scrollToBottom();
            }

            terminal.value?.focus();
          }, 10);
        }
      }
    });

    websocket.value.addEventListener('close', (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      if (isConnected.value) {
        terminal.value?.writeln('\r\n连接已断开');
      }
      isConnected.value = false;
      isConnecting.value = false;
      emit('connectionChange', false);
    });

    websocket.value.addEventListener('error', () => {
      terminal.value?.writeln('WebSocket连接错误');
      isConnected.value = false;
      isConnecting.value = false;
      emit('connectionChange', false);
    });
  } catch (error: any) {
    console.error('连接失败:', error);
    terminal.value?.writeln(`连接失败: ${error.message || '未知错误'}`);
    isConnecting.value = false;
    message.error('SSH连接失败');
  }
}

// 断开连接
function disconnect() {
  if (websocket.value) {
    websocket.value.close();
    websocket.value = undefined;
  }

  isConnected.value = false;
  isConnecting.value = false;
  emit('connectionChange', false);

  if (terminal.value) {
    terminal.value.writeln('\r\n=== 连接已断开 ===');
  }
}

// 清空终端
function clear() {
  terminal.value?.clear();
  terminal.value?.writeln('=== NewBee SSH Terminal ===');
  terminal.value?.writeln('请点击"连接主机"按钮开始SSH连接');
  terminal.value?.writeln('');
}

// 适配终端大小
function fit() {
  fitAddon.value?.fit();
}

// 写入数据到终端
function write(data: string) {
  terminal.value?.write(data);
}

// 写入一行到终端
function writeln(data: string) {
  terminal.value?.writeln(data);
}

// 清理资源
function cleanup() {
  disconnect();
  if (terminal.value) {
    terminal.value.dispose();
  }
}

// 暴露方法给父组件
defineExpose({
  connect,
  disconnect,
  clear,
  fit,
  write,
  writeln,
  isConnected,
  isConnecting,
});
</script>

<template>
  <div
    class="terminal-wrapper"
    :style="{ height: props.height, width: props.width }"
  >
    <div
      ref="terminalContainer"
      class="terminal-container"
      :style="{ height: '100%', width: '100%' }"
    ></div>
  </div>
</template>

<style scoped>
.terminal-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background-color: #0c0c0c;
  border-radius: 4px;
}

.terminal-container {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* 确保xterm样式正确加载 */
:deep(.xterm) {
  position: relative;
  width: 100% !important;
  height: 100% !important;
  font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace;
}

:deep(.xterm-viewport) {
  width: 100% !important;
  height: 100% !important;
  overflow-y: auto !important;
}

:deep(.xterm-screen) {
  position: relative;
  height: 100% !important;
}

:deep(.xterm-rows) {
  position: relative;
}

:deep(.xterm-helper-textarea) {
  position: absolute;
  top: 0;
  left: -9999em;
  pointer-events: none;
  opacity: 0;
}
</style>
