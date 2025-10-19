<script setup lang="ts">
import { ref } from 'vue';
import { Page } from '@vben/common-ui';
import { pickProxy, type PickProxyResp } from '#/api/ops-center/proxy';

const picking = ref(false);
const picked = ref<PickProxyResp | null>(null);

async function handlePick() {
  picking.value = true;
  try {
    picked.value = await pickProxy();
  } finally {
    picking.value = false;
  }
}
</script>

<template>
  <Page :auto-content-height="false">
    <div class="card p-4">
      <h3 class="text-base font-semibold mb-3">代理选择</h3>
      <a-button type="primary" :loading="picking" @click="handlePick">挑选代理</a-button>
      <div v-if="picked" class="mt-4">
        <div>Proxy ID：<span class="font-mono">{{ picked?.proxyId }}</span></div>
        <div>Endpoint：<span class="font-mono">{{ picked?.endpoint }}</span></div>
      </div>
    </div>
  </Page>
</template>

