<script lang="ts" setup>
import { computed } from 'vue';

import { AuthPageLayout } from '@vben/layouts';
import { preferences } from '@vben/preferences';

const appName = computed(() => preferences.app.name);
const logo = computed(() => preferences.logo.source);
</script>

<template>
  <AuthPageLayout
    :app-name="appName"
    :logo="logo"
    page-description="专业运维管理平台"
    page-title="专业运维管理平台"
  >
    <!-- 自定义工具栏 -->
    <!-- <template #toolbar></template> -->
  </AuthPageLayout>
</template>
