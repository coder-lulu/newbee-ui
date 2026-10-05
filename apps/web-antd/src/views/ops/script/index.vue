<script lang="ts" setup>
import { onUnmounted } from 'vue';

import { Page } from '@vben/common-ui';

import ScriptCategoryPanel from './category/index.vue';
import { emitter } from './mitt';
import ScriptListPanel from './script/index.vue';

onUnmounted(() => {
  emitter.off('categorySelected');
  emitter.off('scriptUpdated');
  emitter.off('categoryUpdated');
});
</script>

<template>
  <Page :auto-content-height="true" title="脚本管理" description="管理和组织脚本，支持分类、版本管理和代码编辑">
    <div class="flex h-full min-h-0 flex-col gap-4 lg:flex-row">
      <ScriptCategoryPanel class="w-full shrink-0 overflow-hidden lg:w-[280px]" />
      <ScriptListPanel class="flex-1 min-h-0 overflow-hidden" />
    </div>
  </Page>
</template>
