<script setup lang="ts">
import type {
  OauthStatistics,
  ProviderStatistic,
} from "#/api/system/oauth/model";

import { computed, onMounted, ref } from "vue";

import { Page } from "@vben/common-ui";

import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Statistic,
  Table,
} from "ant-design-vue";

import { getOauthStatistics } from "#/api/system/oauth";

import LoginChart from "./components/login-chart.vue";
import ProviderUsage from "./components/provider-usage.vue";

const statistics = ref<OauthStatistics>();
const loading = ref(false);
const errorMessage = ref("");
const providers = computed(() =>
  [...(statistics.value?.providerStats ?? [])].sort(
    (a, b) => b.totalUsage - a.totalUsage,
  ),
);
const columns = [
  { title: "提供商", dataIndex: "displayName" },
  { title: "标识", dataIndex: "providerName" },
  { title: "类型", dataIndex: "type" },
  {
    title: "累计认证次数",
    dataIndex: "totalUsage",
    sorter: (a: ProviderStatistic, b: ProviderStatistic) =>
      a.totalUsage - b.totalUsage,
  },
  { title: "成功次数", dataIndex: "successCount" },
  { title: "失败次数", dataIndex: "failureCount" },
  {
    title: "成功率",
    dataIndex: "successRate",
    customRender: ({ text }: { text: number }) => `${text.toFixed(1)}%`,
  },
  {
    title: "最后使用时间",
    dataIndex: "lastUsed",
    customRender: ({ text }: { text?: number }) =>
      text ? new Date(text).toLocaleString() : "无记录",
  },
];
async function fetchData() {
  loading.value = true;
  errorMessage.value = "";
  statistics.value = undefined;
  try {
    statistics.value = await getOauthStatistics();
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "认证统计读取失败";
  } finally {
    loading.value = false;
  }
}
onMounted(fetchData);
</script>
<template>
  <Page title="OAuth 认证统计">
    <Alert
      class="mb-4"
      type="info"
      show-icon
      message="统计来自当前租户认证提供商的已保存累计计数，包含停用提供商。演示提供商的计数是演示历史，不代表真实登录事件。"
    />
    <Alert
      class="mb-4"
      type="info"
      show-icon
      message="尚无按事件时间统计的数据：今日登录、趋势、用户去重、增长率及响应延迟暂不可用；图表中的延迟 0 为未统计。"
    />
    <Alert
      v-if="errorMessage"
      class="mb-4"
      type="error"
      show-icon
      :message="errorMessage"
    />
    <div class="mb-4">
      <Button :loading="loading" @click="fetchData">刷新统计</Button>
    </div>
    <template v-if="statistics">
      <Row :gutter="16" class="mb-4">
        <Col :xs="24" :md="8">
          <Card>
            <Statistic title="认证提供商" :value="statistics.totalProviders" />
          </Card>
        </Col>
        <Col :xs="24" :md="8">
          <Card>
            <Statistic title="累计认证次数" :value="statistics.totalLogins" />
          </Card>
        </Col>
        <Col :xs="24" :md="8">
          <Card>
            <Statistic
              title="累计成功率"
              :value="statistics.successRate"
              :precision="1"
              suffix="%"
            />
          </Card>
        </Col>
      </Row>
      <Card title="提供商累计统计" class="mb-4">
        <Table
          :columns="columns"
          :data-source="providers"
          row-key="providerId"
          :pagination="{ pageSize: 20, showSizeChanger: false }"
          :scroll="{ x: 1100 }"
        />
      </Card>
      <Card title="累计使用分布" class="mb-4">
        <ProviderUsage
          v-if="providers.length > 0"
          :usage-data="providers"
          @refresh="fetchData"
        />
        <Empty v-else description="暂无认证提供商" />
      </Card>
      <Card title="登录事件趋势">
        <LoginChart
          v-if="statistics.loginTrend.length > 0"
          :chart-data="statistics.loginTrend"
        />
        <Empty v-else description="尚无可按时间汇总的登录事件记录" />
      </Card>
    </template>
  </Page>
</template>
