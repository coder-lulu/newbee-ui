<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';

import { Page } from '@vben/common-ui';

import {
  pickProxy,
  type WorkerPickReq,
  type WorkerPickResp,
} from '#/api/ops-center/proxy';

const formData = ref<WorkerPickReq>({
  strategy: 'least_connections',
  requiredCapabilities: [],
  requiredTags: [],
  minWeight: 1,
});

const result = ref<WorkerPickResp | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function handleSubmit() {
  loading.value = true;
  error.value = null;
  result.value = null;
  try {
    result.value = await pickProxy(formData.value);
    message.success('选择成功');
  } catch (err: any) {
    error.value = err.message || '选择失败';
    message.error(error.value);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  formData.value = {
    strategy: 'least_connections',
    requiredCapabilities: [],
    requiredTags: [],
    minWeight: 1,
  };
  result.value = null;
  error.value = null;
}
</script>

<template>
  <Page title="Worker选择测试">
    <a-row :gutter="24">
      <!-- 左侧配置表单 -->
      <a-col :span="12">
        <a-card title="选择配置">
          <a-form :model="formData" layout="vertical">
            <a-form-item label="选择策略">
              <a-select v-model:value="formData.strategy">
                <a-select-option value="least_connections">
                  最少连接 (Least Connections)
                </a-select-option>
                <a-select-option value="round_robin">
                  轮询 (Round Robin)
                </a-select-option>
                <a-select-option value="weighted_round_robin">
                  加权轮询 (Weighted Round Robin)
                </a-select-option>
                <a-select-option value="consistent_hash">
                  一致性哈希 (Consistent Hash)
                </a-select-option>
                <a-select-option value="geo_nearest">
                  地理最近 (Geo Nearest)
                </a-select-option>
                <a-select-option value="priority">
                  优先级 (Priority)
                </a-select-option>
                <a-select-option value="random">
                  随机 (Random)
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="必需能力 (Required Capabilities)">
              <a-select
                v-model:value="formData.requiredCapabilities"
                mode="multiple"
                placeholder="选择必需的Worker能力"
              >
                <a-select-option value="ssh">SSH</a-select-option>
                <a-select-option value="telnet">Telnet</a-select-option>
                <a-select-option value="rdp">RDP</a-select-option>
                <a-select-option value="vnc">VNC</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="必需标签 (Required Tags)">
              <a-select
                v-model:value="formData.requiredTags"
                mode="tags"
                placeholder="输入或选择标签"
              >
                <a-select-option value="production">
                  Production
                </a-select-option>
                <a-select-option value="staging">Staging</a-select-option>
                <a-select-option value="development">
                  Development
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="首选地区 (Preferred Region)">
              <a-input
                v-model:value="formData.preferredRegion"
                placeholder="如 cn-shanghai"
                allow-clear
              />
            </a-form-item>

            <a-form-item label="首选可用区 (Preferred Zone)">
              <a-input
                v-model:value="formData.preferredZone"
                placeholder="如 az-1"
                allow-clear
              />
            </a-form-item>

            <a-form-item label="最小权重 (Min Weight)">
              <a-slider
                v-model:value="formData.minWeight"
                :min="1"
                :max="1000"
                :marks="{ 1: '1', 500: '500', 1000: '1000' }"
              />
              <a-input-number
                v-model:value="formData.minWeight"
                :min="1"
                :max="1000"
                style="margin-top: 8px; width: 100%"
              />
            </a-form-item>

            <a-form-item
              v-if="formData.strategy === 'consistent_hash'"
              label="会话ID (Session ID)"
            >
              <a-input
                v-model:value="formData.sessionId"
                placeholder="用于一致性哈希的会话标识"
                allow-clear
              />
            </a-form-item>

            <a-form-item label="排除Worker ID (Exclude Worker IDs)">
              <a-select
                v-model:value="formData.excludeWorkerIds"
                mode="tags"
                placeholder="输入要排除的Worker ID"
              />
            </a-form-item>

            <a-form-item>
              <a-space>
                <a-button
                  type="primary"
                  :loading="loading"
                  @click="handleSubmit"
                >
                  执行选择
                </a-button>
                <a-button @click="handleReset">重置</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>

      <!-- 右侧结果展示 -->
      <a-col :span="12">
        <a-card title="选择结果">
          <a-result v-if="result" status="success" title="选择成功">
            <template #subTitle>
              <a-descriptions bordered :column="1">
                <a-descriptions-item label="Worker ID">
                  {{ result.workerId }}
                </a-descriptions-item>
                <a-descriptions-item label="名称">
                  {{ result.name }}
                </a-descriptions-item>
                <a-descriptions-item label="IP">
                  {{ result.ip }}
                </a-descriptions-item>
                <a-descriptions-item label="端口">
                  {{ result.port }}
                </a-descriptions-item>
                <a-descriptions-item label="Endpoints">
                  <pre>{{ JSON.stringify(result.endpoints, null, 2) }}</pre>
                </a-descriptions-item>
              </a-descriptions>
            </template>
          </a-result>

          <a-result v-else-if="error" status="error" :title="error">
            <template #subTitle>
              请检查您的选择条件，或确保有符合条件的Worker可用
            </template>
          </a-result>

          <a-empty
            v-else
            description="请配置选择条件并执行选择"
            :image="undefined"
          >
            <template #description>
              <p>配置左侧的选择策略和参数</p>
              <p>点击"执行选择"按钮测试Worker选择算法</p>
            </template>
          </a-empty>
        </a-card>
      </a-col>
    </a-row>
  </Page>
</template>
