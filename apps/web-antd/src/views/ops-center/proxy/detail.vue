<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

import { getProxyById, type ProxyDetail } from '#/api/ops-center/proxy';

const route = useRoute();
const workerId = ref(Number(route.params.id));
const workerDetail = ref<ProxyDetail | null>(null);
const loading = ref(false);

async function fetchProxyDetail() {
  loading.value = true;
  try {
    workerDetail.value = await getProxyById(workerId.value);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchProxyDetail();
});
</script>

<template>
  <Page :loading="loading" title="Worker详情">
    <a-row :gutter="16">
      <!-- 左侧基本信息 -->
      <a-col :span="6">
        <a-card title="基本信息" :bordered="false">
          <a-descriptions :column="1" size="small" bordered>
            <a-descriptions-item label="Worker ID">
              {{ workerDetail?.workerId }}
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ workerDetail?.name }}
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-badge
                :status="
                  workerDetail?.workerStatus === 'online'
                    ? 'success'
                    : workerDetail?.workerStatus === 'degraded'
                      ? 'warning'
                      : 'error'
                "
                :text="workerDetail?.workerStatus"
              />
            </a-descriptions-item>
            <a-descriptions-item label="版本">
              {{ workerDetail?.version }}
            </a-descriptions-item>
            <a-descriptions-item label="IP">
              {{ workerDetail?.ip }}
            </a-descriptions-item>
            <a-descriptions-item label="端口">
              {{ workerDetail?.port }}
            </a-descriptions-item>
            <a-descriptions-item label="地区">
              {{ workerDetail?.region }}
            </a-descriptions-item>
            <a-descriptions-item label="可用区">
              {{ workerDetail?.zone }}
            </a-descriptions-item>
          </a-descriptions>

          <a-divider />

          <div>
            <div style="margin-bottom: 8px"><strong>Capabilities:</strong></div>
            <a-space wrap>
              <a-tag
                v-for="cap in workerDetail?.capabilities"
                :key="cap"
                color="blue"
              >
                {{ cap }}
              </a-tag>
            </a-space>
          </div>

          <a-divider />

          <div>
            <div style="margin-bottom: 8px"><strong>Tags:</strong></div>
            <a-space wrap>
              <a-tag v-for="tag in workerDetail?.tags" :key="tag">
                {{ tag }}
              </a-tag>
            </a-space>
          </div>
        </a-card>
      </a-col>

      <!-- 右侧Tab面板 -->
      <a-col :span="18">
        <a-tabs default-active-key="overview">
          <!-- Tab 1: 概览 -->
          <a-tab-pane key="overview" tab="概览">
            <a-row :gutter="[16, 16]">
              <!-- 实时资源使用率 -->
              <a-col :span="12">
                <a-card title="CPU使用率" :bordered="false">
                  <div style="display: flex; justify-content: center">
                    <a-progress
                      type="circle"
                      :percent="workerDetail?.cpuUsage"
                      :stroke-color="
                        workerDetail && workerDetail.cpuUsage > 90
                          ? '#ff4d4f'
                          : workerDetail && workerDetail.cpuUsage > 80
                            ? '#faad14'
                            : '#52c41a'
                      "
                    />
                  </div>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="内存使用率" :bordered="false">
                  <div style="display: flex; justify-content: center">
                    <a-progress
                      type="circle"
                      :percent="workerDetail?.memoryUsage"
                      :stroke-color="
                        workerDetail && workerDetail.memoryUsage > 90
                          ? '#ff4d4f'
                          : workerDetail && workerDetail.memoryUsage > 80
                            ? '#faad14'
                            : '#52c41a'
                      "
                    />
                  </div>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="磁盘使用率" :bordered="false">
                  <div style="display: flex; justify-content: center">
                    <a-progress
                      type="circle"
                      :percent="workerDetail?.diskUsage"
                      :stroke-color="
                        workerDetail && workerDetail.diskUsage > 90
                          ? '#ff4d4f'
                          : workerDetail && workerDetail.diskUsage > 80
                            ? '#faad14'
                            : '#52c41a'
                      "
                    />
                  </div>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="会话统计" :bordered="false">
                  <a-statistic
                    title="活跃会话"
                    :value="workerDetail?.activeSessions"
                    :suffix="`/ ${workerDetail?.maxSessions}`"
                  />
                  <a-divider />
                  <a-statistic
                    title="总请求数"
                    :value="workerDetail?.totalRequests"
                  />
                  <a-divider />
                  <a-statistic
                    title="成功数"
                    :value="workerDetail?.successCount"
                    :value-style="{ color: '#3f8600' }"
                  />
                  <a-statistic
                    title="失败数"
                    :value="workerDetail?.failureCount"
                    :value-style="{ color: '#cf1322' }"
                  />
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="网络流量" :bordered="false">
                  <a-statistic
                    title="入站流量"
                    :value="workerDetail?.networkIn"
                    suffix="bytes"
                  />
                  <a-divider />
                  <a-statistic
                    title="出站流量"
                    :value="workerDetail?.networkOut"
                    suffix="bytes"
                  />
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="健康检查" :bordered="false">
                  <a-descriptions :column="1" bordered size="small">
                    <a-descriptions-item label="URL">
                      {{ workerDetail?.healthCheckUrl || '-' }}
                    </a-descriptions-item>
                    <a-descriptions-item label="失败次数">
                      {{ workerDetail?.healthCheckFailures }}
                    </a-descriptions-item>
                    <a-descriptions-item label="最后检查">
                      {{
                        workerDetail?.lastHealthCheck
                          ? new Date(
                              workerDetail.lastHealthCheck * 1000,
                            ).toLocaleString()
                          : '-'
                      }}
                    </a-descriptions-item>
                  </a-descriptions>
                </a-card>
              </a-col>
            </a-row>
          </a-tab-pane>

          <!-- Tab 2: 配置详情 -->
          <a-tab-pane key="config" tab="配置详情">
            <a-descriptions bordered :column="2">
              <a-descriptions-item label="权重">
                {{ workerDetail?.weight }}
              </a-descriptions-item>
              <a-descriptions-item label="优先级">
                {{ workerDetail?.priority }}
              </a-descriptions-item>
              <a-descriptions-item label="本地IP">
                {{ workerDetail?.localIp || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="公网IP">
                {{ workerDetail?.publicIp || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="网络段" :span="2">
                <a-space wrap>
                  <a-tag
                    v-for="segment in workerDetail?.networkSegments"
                    :key="segment"
                    color="blue"
                  >
                    {{ segment }}
                  </a-tag>
                </a-space>
              </a-descriptions-item>
              <a-descriptions-item label="健康检查URL" :span="2">
                {{ workerDetail?.healthCheckUrl || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="Endpoints" :span="2">
                <pre>{{ JSON.stringify(workerDetail?.endpoints, null, 2) }}</pre>
              </a-descriptions-item>
              <a-descriptions-item label="Metadata" :span="2">
                <pre>{{ JSON.stringify(workerDetail?.metadata, null, 2) }}</pre>
              </a-descriptions-item>
              <a-descriptions-item label="注册时间" :span="2">
                {{
                  workerDetail?.registerTime
                    ? new Date(
                        workerDetail.registerTime * 1000,
                      ).toLocaleString()
                    : '-'
                }}
              </a-descriptions-item>
              <a-descriptions-item label="最后心跳" :span="2">
                {{
                  workerDetail?.lastHeartbeat
                    ? new Date(
                        workerDetail.lastHeartbeat * 1000,
                      ).toLocaleString()
                    : '-'
                }}
              </a-descriptions-item>
            </a-descriptions>
          </a-tab-pane>
        </a-tabs>
      </a-col>
    </a-row>
  </Page>
</template>
