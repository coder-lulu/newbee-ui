<script setup lang="ts">
import { ref } from 'vue';

import { message } from 'ant-design-vue';

import Terminal from './SimpleTerminal.vue';

const terminal = ref();
const isConnected = ref(false);

const sshForm = ref({
  target: 'localhost',
  port: 22,
  username: 'root',
  password: '',
  auth_type: 'password',
});

const connectTerminal = () => {
  if (!sshForm.value.target || !sshForm.value.username) {
    message.error('请填写完整的SSH连接信息');
    return;
  }

  const sshConfig = {
    target: sshForm.value.target,
    port: sshForm.value.port,
    username: sshForm.value.username,
    password: sshForm.value.password,
    auth_type: sshForm.value.auth_type,
    cols: 80,
    rows: 24,
    session_id: Date.now().toString(),
  };

  terminal.value?.connect(sshConfig);
};

const disconnectTerminal = () => {
  terminal.value?.disconnect();
};

const clearTerminal = () => {
  terminal.value?.clear();
};

const onConnectionChange = (connected: boolean) => {
  isConnected.value = connected;
  if (connected) {
    message.success('终端连接成功');
  } else {
    message.info('终端连接已断开');
  }
};
</script>

<template>
  <div class="terminal-demo">
    <div class="demo-header">
      <h2>SSH终端演示</h2>
      <div class="connection-form">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-input
              v-model="sshForm.target"
              placeholder="主机地址"
              :disabled="isConnected"
            />
          </a-col>
          <a-col :span="4">
            <a-input-number
              v-model="sshForm.port"
              placeholder="端口"
              :min="1"
              :max="65535"
              :disabled="isConnected"
            />
          </a-col>
          <a-col :span="6">
            <a-input
              v-model="sshForm.username"
              placeholder="用户名"
              :disabled="isConnected"
            />
          </a-col>
          <a-col :span="6">
            <a-input-password
              v-model="sshForm.password"
              placeholder="密码"
              :disabled="isConnected"
            />
          </a-col>
          <a-col :span="2">
            <a-button
              v-if="!isConnected"
              type="primary"
              @click="connectTerminal"
            >
              连接
            </a-button>
            <a-button v-else danger @click="disconnectTerminal">
              断开
            </a-button>
          </a-col>
        </a-row>
      </div>
      <div class="toolbar">
        <a-button @click="clearTerminal" :disabled="!isConnected">
          清空终端
        </a-button>
        <a-tag :color="isConnected ? 'green' : 'red'">
          {{ isConnected ? '已连接' : '未连接' }}
        </a-tag>
      </div>
    </div>

    <div class="terminal-container">
      <Terminal
        ref="terminal"
        height="500px"
        @connection-change="onConnectionChange"
      />
    </div>
  </div>
</template>

<style scoped>
.terminal-demo {
  padding: 20px;
}

.demo-header {
  margin-bottom: 20px;
}

.connection-form {
  margin: 16px 0;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.terminal-container {
  overflow: hidden;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

h2 {
  margin-bottom: 16px;
  color: #1890ff;
}
</style>
