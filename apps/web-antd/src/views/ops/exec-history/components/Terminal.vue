<script setup lang="ts" name="Terminal">
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

// 安全发送数据的方法
function safeSendData(data: string) {
  if (!websocket.value || websocket.value.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket not ready, cannot send data');
    return false;
  }

  try {
    // 检查数据长度，避免过长的数据
    if (data.length > 1024) {
      console.warn('Data too long, truncating');
      data = data.slice(0, 1024);
    }

    // 记录详细的发送信息
    const charCodes = [...data].map((c) => c.codePointAt(0));
    const isControlChar = charCodes.some(
      (code) => code !== undefined && (code < 32 || code === 127),
    );
    const isDigit = /^\d$/.test(data);

    console.log(
      'Sending data to SSH:',
      JSON.stringify(data),
      'length:',
      data.length,
      'char codes:',
      charCodes,
      'has control chars:',
      isControlChar,
      'is digit:',
      isDigit,
    );

    // 特别处理数字输入 - 临时跳过数字字符以避免连接断开
    if (isDigit) {
      console.warn(
        'DIGIT INPUT DETECTED - SKIPPING TO PREVENT DISCONNECT:',
        data,
        'WebSocket state:',
        websocket.value.readyState,
      );

      // 在终端显示数字但不发送到服务端
      terminal.value?.write(data);

      // 显示提示信息
      setTimeout(() => {
        console.log('Skipped sending digit to prevent connection loss');
      }, 10);

      return true;
    }

    // 检查WebSocket状态
    if (websocket.value.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not in OPEN state:', websocket.value.readyState);
      return false;
    }

    websocket.value.send(data);

    // 发送后检查连接状态
    setTimeout(() => {
      if (websocket.value && websocket.value.readyState !== WebSocket.OPEN) {
        console.error(
          'WebSocket closed unexpectedly after sending data, char was:',
          JSON.stringify(data),
        );
        disconnect();
      }
    }, 10);

    return true;
  } catch (error: any) {
    console.error('Failed to send data:', error);
    terminal.value?.writeln(`\r\n发送数据失败: ${error.message}`);

    // 如果发送失败，检查连接状态
    if (websocket.value.readyState !== WebSocket.OPEN) {
      console.log('WebSocket closed after send failure, disconnecting...');
      disconnect();
    }
    return false;
  }
}

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
  try {
    cleanup();
    resizeObserver?.disconnect();
    resizeObserver = null;
  } catch (error) {
    console.warn('Error during component unmount:', error);
  }
});

// 初始化终端
async function initTerminal() {
  try {
    // 如果已经有终端实例，先清理
    if (terminal.value) {
      console.log('Cleaning up existing terminal before reinitializing...');
      try {
        if (fitAddon.value) {
          fitAddon.value.dispose();
          fitAddon.value = null;
        }
        terminal.value.dispose();
        terminal.value = null;
      } catch (error) {
        console.warn('Error cleaning up existing terminal:', error);
        terminal.value = null;
        fitAddon.value = null;
      }
    }

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
      if (isConnected.value) {
        if (!safeSendData(data)) {
          terminal.value?.writeln('\r\n数据发送失败，连接可能已断开');
        }
      } else {
        console.log(
          'Cannot send data - WebSocket state:',
          websocket.value?.readyState,
          'isConnected:',
          isConnected.value,
        );
        terminal.value?.writeln('\r\n连接已断开，请重新连接');
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
    
    // 确保终端已初始化
    if (!terminal.value) {
      console.log('Terminal not initialized, initializing now...');
      await initTerminal();
    }
    
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
        try {
          const configData = JSON.stringify(sshConfig);
          console.log('Sending SSH config:', configData);
          websocket.value.send(configData);
        } catch (error: any) {
          console.error('Failed to send SSH config:', error);
          terminal.value?.writeln(`发送配置失败: ${error.message}`);
          disconnect();
        }
      }
    });

    // 消息处理
    websocket.value.addEventListener('message', (event) => {
      const data = event.data;

      // 检查是否收到logout消息
      if (typeof data === 'string') {
        // 精确匹配logout字符串
        if (data === 'logout') {
          console.log('Received exact logout message from server, disconnecting...');
          terminal.value?.writeln('\r\n服务端要求断开连接 (logout)');
          disconnect();
          return;
        }
        
        // 检查是否包含logout命令（但排除正常的终端输出）
        if (data.trim() === 'logout' || /^logout\s*$/.test(data.trim())) {
          console.log('Received logout command from server, disconnecting...', JSON.stringify(data));
          terminal.value?.writeln('\r\n检测到logout命令，断开连接');
          disconnect();
          return;
        }
      }

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
      console.log('WebSocket closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        timestamp: new Date().toISOString(),
      });

      if (isConnected.value) {
        terminal.value?.writeln(
          `\r\n连接已断开 (代码: ${event.code}, 原因: ${event.reason || '未知'})`,
        );
      }

      isConnected.value = false;
      isConnecting.value = false;
      emit('connectionChange', false);

      // 根据关闭代码给出不同的提示
      switch (event.code) {
        case 1000: {
          terminal.value?.writeln('连接正常关闭');

          break;
        }
        case 1006: {
          terminal.value?.writeln('网络连接异常，可能是服务器问题或网络中断');

          break;
        }
        case 1011: {
          terminal.value?.writeln('服务器遇到错误，请检查SSH配置或服务器状态');

          break;
        }
        // No default
      }
    });

    websocket.value.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
      terminal.value?.writeln('WebSocket连接错误，请检查网络连接');
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
    try {
      websocket.value.close();
    } catch (error) {
      console.warn('Error closing WebSocket:', error);
    }
    websocket.value = undefined;
  }

  isConnected.value = false;
  isConnecting.value = false;
  emit('connectionChange', false);

  if (terminal.value) {
    try {
      terminal.value.writeln('\r\n=== 连接已断开 ===');
    } catch (error) {
      console.warn('Error writing to terminal on disconnect:', error);
    }
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
  
  // 安全地清理终端实例
  if (terminal.value) {
    try {
      // 先移除所有事件监听器
      if (typeof terminal.value.onData === 'function') {
        terminal.value.onData(() => {});
      }
      
      // 清理插件
      if (fitAddon.value) {
        try {
          fitAddon.value.dispose();
        } catch (error) {
          console.warn('Failed to dispose fit addon:', error);
        }
        fitAddon.value = null;
      }
      
      // 清理终端实例
      terminal.value.dispose();
      console.log('Terminal disposed successfully');
    } catch (error) {
      console.warn('Failed to dispose terminal:', error);
    }
    terminal.value = null;
  }
}

// 重新初始化终端
async function reinitialize() {
  console.log('Reinitializing terminal...');
  cleanup();
  await nextTick();
  await initTerminal();
}

// 暴露方法给父组件
defineExpose({
  connect,
  disconnect,
  clear,
  fit,
  write,
  writeln,
  reinitialize,
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
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 深度选择器覆盖xterm样式 */
:deep(.xterm) {
  font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace !important;
  font-size: 14px !important;
  line-height: 1.2 !important;
}

:deep(.xterm-viewport) {
  background-color: #0c0c0c !important;
}

:deep(.xterm-screen) {
  background-color: #0c0c0c !important;
}

:deep(.xterm-cursor) {
  background-color: #0f0 !important;
}

/* 滚动条样式 */
:deep(.xterm-viewport::-webkit-scrollbar) {
  width: 8px;
}

:deep(.xterm-viewport::-webkit-scrollbar-track) {
  background: #1e1e1e;
}

:deep(.xterm-viewport::-webkit-scrollbar-thumb) {
  background: #555;
  border-radius: 4px;
}

:deep(.xterm-viewport::-webkit-scrollbar-thumb:hover) {
  background: #777;
}
</style>
