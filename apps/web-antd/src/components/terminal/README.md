# Terminal 组件

基于 Vue 3 和 xterm.js 的终端组件集合，支持SSH连接和终端操作。

## 组件结构

- `TerminalView.vue` - 主终端视图组件
- `TerminalBody.vue` - 终端主体，负责渲染和交互
- `TerminalHeader.vue` - 终端头部，包含控制按钮和状态显示
- `TerminalSearch.vue` - 终端搜索功能
- `TerminalSettingModal.vue` - 终端设置模态框

## 使用方式

### 基本使用

```vue
<script setup>
import { ref } from 'vue';
import TerminalView from '@/components/terminal/TerminalView.vue';

const terminal = ref();

const initTerminal = () => {
  const machine = {
    id: 1,
    machineName: 'localhost',
    host: 'localhost',
    port: 22,
    username: 'root'
  };
  
  terminal.value?.init(machine);
};
</script>

<template>
  <TerminalView ref="terminal" terminal-height="500px" />
</template>
```

### 集成使用

如果需要完整的SSH连接功能，可以使用 `@/views/ops/exec-history/components/Terminal.vue` 组件：

```vue
<script setup>
import { ref } from 'vue';
import Terminal from '@/views/ops/exec-history/components/Terminal.vue';

const terminal = ref();

const connectSSH = () => {
  const sshConfig = {
    target: 'localhost',
    port: 22,
    username: 'root',
    password: 'password',
    auth_type: 'password',
    cols: 80,
    rows: 24,
    session_id: Date.now().toString()
  };
  
  terminal.value?.connect(sshConfig);
};
</script>

<template>
  <Terminal 
    ref="terminal" 
    height="500px" 
    @connection-change="onConnectionChange"
  />
</template>
```

## API

### TerminalView Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| terminalHeight | string | '100%' | 终端高度 |

### TerminalView Methods

| 方法名 | 参数 | 说明 |
|--------|------|------|
| init | machine: Machine | 初始化终端连接 |
| dispose | - | 销毁终端连接 |
| reload | - | 重新连接 |
| sendCommand | command: string | 发送命令 |
| fitTerminal | - | 调整终端大小 |
| focus | - | 聚焦到终端 |

### Terminal (集成组件) Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| height | string | '400px' | 终端高度 |
| width | string | '100%' | 终端宽度 |

### Terminal (集成组件) Methods

| 方法名 | 参数 | 说明 |
|--------|------|------|
| connect | sshConfig: SSHConfig | 连接SSH |
| disconnect | - | 断开连接 |
| clear | - | 清空终端 |
| fit | - | 调整终端大小 |

### Terminal (集成组件) Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| connection-change | connected: boolean | 连接状态变化 |

## 类型定义

```typescript
interface Machine {
  id: number;
  machineName: string;
  host: string;
  port: number;
  username: string;
  status?: string;
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
```

## 功能特性

- ✅ SSH连接支持
- ✅ 终端命令执行
- ✅ 复制粘贴操作
- ✅ 搜索功能
- ✅ 右键菜单
- ✅ 快捷键支持
- ✅ 全屏模式
- ✅ 自适应窗口大小
- ✅ WebSocket通信
- ⚠️ SFTP文件传输 (暂未实现)

## 快捷键

- `Ctrl + Shift + C` - 复制选中内容
- `Ctrl + Shift + V` - 粘贴内容
- `Ctrl + Shift + F` - 打开搜索

## 注意事项

1. 组件依赖 `xterm`、`xterm-addon-fit`、`xterm-addon-web-links` 等包
2. WebSocket连接需要后端支持
3. 复制粘贴功能需要浏览器剪贴板权限
4. 全屏功能需要用户手势触发

## 演示页面

访问 `/terminal/demo` 查看完整的使用示例。 
