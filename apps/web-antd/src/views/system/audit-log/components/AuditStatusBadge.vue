<template>
  <a-badge :status="statusType" :text="statusText" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Badge as ABadge } from 'ant-design-vue';

interface Props {
  status: number;
}

const props = defineProps<Props>();

const statusType = computed(() => {
  if (props.status >= 200 && props.status < 300) return 'success';
  if (props.status >= 300 && props.status < 400) return 'warning';
  if (props.status >= 400 && props.status < 500) return 'error';
  if (props.status >= 500) return 'error';
  return 'default';
});

const statusText = computed(() => {
  const statusMap: Record<number, string> = {
    200: '200 成功',
    201: '201 已创建',
    204: '204 无内容',
    301: '301 永久重定向',
    302: '302 临时重定向',
    400: '400 请求错误',
    401: '401 未授权',
    403: '403 禁止访问',
    404: '404 未找到',
    422: '422 验证失败',
    500: '500 服务器错误',
    502: '502 网关错误',
    503: '503 服务不可用',
  };
  
  return statusMap[props.status] || `${props.status}`;
});
</script>