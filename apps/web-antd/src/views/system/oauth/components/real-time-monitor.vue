<template>
  <div class="real-time-monitor">
    <div class="monitor-header mb-4">
      <h3 class="text-lg font-medium">实时监控</h3>
      <div class="monitor-controls">
        <a-switch 
          v-model:checked="isMonitoring"
          checked-children="开启"
          un-checked-children="关闭"
          @change="toggleMonitoring"
        />
        <span class="ml-2 text-sm text-gray-500">
          {{ isMonitoring ? '监控中' : '已暂停' }}
        </span>
        <a-badge 
          :count="isMonitoring ? '' : 0"
          :dot="isMonitoring"
          :color="isMonitoring ? '#52c41a' : '#d9d9d9'"
          class="ml-2"
        />
      </div>
    </div>

    <!-- 实时统计卡片 -->
    <Row :gutter="16" class="mb-4">
      <Col :span="8">
        <Card size="small">
          <Statistic
            title="实时登录"
            :value="realtimeStats.currentLogins"
            :value-style="{ color: '#1890ff', fontSize: '20px' }"
          >
            <template #suffix>
              <span class="text-xs">/min</span>
            </template>
          </Statistic>
          <div class="text-xs text-gray-500 mt-1">
            较上分钟 {{ realtimeStats.loginChange >= 0 ? '+' : '' }}{{ realtimeStats.loginChange }}
          </div>
        </Card>
      </Col>
      <Col :span="8">
        <Card size="small">
          <Statistic
            title="在线用户"
            :value="realtimeStats.onlineUsers"
            :value-style="{ color: '#52c41a', fontSize: '20px' }"
          />
          <div class="text-xs text-gray-500 mt-1">
            活跃会话: {{ realtimeStats.activeSessions }}
          </div>
        </Card>
      </Col>
      <Col :span="8">
        <Card size="small">
          <Statistic
            title="平均响应"
            :value="realtimeStats.avgResponseTime"
            suffix="ms"
            :value-style="{ 
              color: realtimeStats.avgResponseTime > 200 ? '#ff4d4f' : '#52c41a',
              fontSize: '20px'
            }"
          />
          <div class="text-xs text-gray-500 mt-1">
            延迟状态: {{ getLatencyStatus(realtimeStats.avgResponseTime) }}
          </div>
        </Card>
      </Col>
    </Row>

    <!-- 活动日志 -->
    <Card title="活动日志" size="small">
      <div class="activity-log" ref="logContainer">
        <div 
          v-for="log in activityLogs" 
          :key="log.id"
          class="log-item"
          :class="getLogItemClass(log.type)"
        >
          <div class="log-time">{{ formatTime(log.timestamp) }}</div>
          <div class="log-content">
            <a-tag :color="getLogColor(log.type)" size="small">
              {{ log.type }}
            </a-tag>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
        <div v-if="activityLogs.length === 0" class="empty-logs">
          暂无活动记录
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Card, Row, Col, Statistic, Switch, Badge } from 'ant-design-vue';

interface RealtimeStats {
  currentLogins: number;
  loginChange: number;
  onlineUsers: number;
  activeSessions: number;
  avgResponseTime: number;
}

interface ActivityLog {
  id: string;
  timestamp: number;
  type: 'login' | 'logout' | 'error' | 'register' | 'test';
  message: string;
  provider?: string;
  userId?: string;
}

interface Emits {
  (e: 'statsUpdate', stats: RealtimeStats): void;
}

const emit = defineEmits<Emits>();

const isMonitoring = ref(true);
const realtimeStats = ref<RealtimeStats>({
  currentLogins: 0,
  loginChange: 0,
  onlineUsers: 0,
  activeSessions: 0,
  avgResponseTime: 0,
});

const activityLogs = ref<ActivityLog[]>([]);
const logContainer = ref<HTMLDivElement>();

let updateInterval: number | null = null;
let logUpdateInterval: number | null = null;

// 获取延迟状态
function getLatencyStatus(responseTime: number): string {
  if (responseTime <= 100) return '优秀';
  if (responseTime <= 200) return '良好';
  if (responseTime <= 500) return '一般';
  return '较慢';
}

// 获取日志项样式类
function getLogItemClass(type: string): string {
  return `log-${type}`;
}

// 获取日志颜色
function getLogColor(type: string): string {
  const colors: Record<string, string> = {
    login: 'green',
    logout: 'blue',
    error: 'red',
    register: 'purple',
    test: 'orange',
  };
  return colors[type] || 'default';
}

// 格式化时间
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

// 生成模拟统计数据
function generateRealtimeStats(): RealtimeStats {
  const baseLogins = 15;
  const variation = Math.floor(Math.random() * 10) - 5;
  const currentLogins = Math.max(0, baseLogins + variation);
  
  return {
    currentLogins,
    loginChange: variation,
    onlineUsers: Math.floor(Math.random() * 500) + 100,
    activeSessions: Math.floor(Math.random() * 300) + 50,
    avgResponseTime: Math.floor(Math.random() * 200) + 50,
  };
}

// 生成模拟活动日志
function generateActivityLog(): ActivityLog {
  const types: Array<ActivityLog['type']> = ['login', 'logout', 'error', 'register', 'test'];
  const providers = ['Google', 'GitHub', '微信', 'QQ', 'Facebook'];
  const messages = {
    login: (provider: string) => `用户通过 ${provider} 成功登录`,
    logout: (provider: string) => `用户从 ${provider} 会话登出`,
    error: (provider: string) => `${provider} 连接出现错误`,
    register: (provider: string) => `新用户通过 ${provider} 注册`,
    test: (provider: string) => `管理员测试 ${provider} 连接`,
  };

  const type = types[Math.floor(Math.random() * types.length)];
  const provider = providers[Math.floor(Math.random() * providers.length)];

  return {
    id: `log_${Date.now()}_${Math.random()}`,
    timestamp: Date.now(),
    type,
    message: messages[type](provider),
    provider,
    userId: `user_${Math.floor(Math.random() * 1000)}`,
  };
}

// 更新实时统计
function updateRealtimeStats() {
  if (!isMonitoring.value) return;
  
  const newStats = generateRealtimeStats();
  realtimeStats.value = newStats;
  emit('statsUpdate', newStats);
}

// 添加活动日志
function addActivityLog() {
  if (!isMonitoring.value) return;
  
  const newLog = generateActivityLog();
  activityLogs.value.unshift(newLog);
  
  // 保持最多50条日志
  if (activityLogs.value.length > 50) {
    activityLogs.value = activityLogs.value.slice(0, 50);
  }
  
  // 滚动到最新日志
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = 0;
    }
  });
}

// 切换监控状态
function toggleMonitoring(checked: boolean) {
  isMonitoring.value = checked;
  
  if (checked) {
    startMonitoring();
  } else {
    stopMonitoring();
  }
}

// 开始监控
function startMonitoring() {
  updateInterval = window.setInterval(updateRealtimeStats, 5000); // 每5秒更新一次统计
  logUpdateInterval = window.setInterval(addActivityLog, 3000); // 每3秒添加一条日志
  
  // 立即更新一次
  updateRealtimeStats();
}

// 停止监控
function stopMonitoring() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  if (logUpdateInterval) {
    clearInterval(logUpdateInterval);
    logUpdateInterval = null;
  }
}

onMounted(() => {
  if (isMonitoring.value) {
    startMonitoring();
  }
});

onUnmounted(() => {
  stopMonitoring();
});
</script>

<style scoped>
.real-time-monitor {
  background: #fff;
  border-radius: 8px;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monitor-header h3 {
  margin: 0;
  color: #262626;
}

.monitor-controls {
  display: flex;
  align-items: center;
}

.activity-log {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 4px;
  transition: background-color 0.2s ease;
}

.log-item:hover {
  background-color: #f5f5f5;
}

.log-time {
  font-size: 11px;
  color: #8c8c8c;
  white-space: nowrap;
  min-width: 60px;
}

.log-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-message {
  font-size: 12px;
  color: #595959;
}

.log-login {
  border-left: 3px solid #52c41a;
}

.log-logout {
  border-left: 3px solid #1890ff;
}

.log-error {
  border-left: 3px solid #ff4d4f;
}

.log-register {
  border-left: 3px solid #722ed1;
}

.log-test {
  border-left: 3px solid #fa8c16;
}

.empty-logs {
  text-align: center;
  color: #8c8c8c;
  padding: 40px 0;
  font-size: 14px;
}

/* 滚动条样式 */
.activity-log::-webkit-scrollbar {
  width: 4px;
}

.activity-log::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.activity-log::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.activity-log::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>