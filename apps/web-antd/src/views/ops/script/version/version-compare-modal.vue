<script lang="ts" setup>
import { computed, ref } from 'vue';

import type { ScriptVersion } from '#/api/ops/script/script-version-model';

import { MonacoDiff, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { getLanguageFromType } from '../script/data';

const leftVersion = ref<ScriptVersion | undefined>(undefined);
const rightVersion = ref<ScriptVersion | undefined>(undefined);

const language = computed(() => {
  return getLanguageFromType(leftVersion.value?.scriptType || 'shell');
});

const [BasicModal, modalApi] = useVbenModal({
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData() as {
        leftVersion: ScriptVersion;
        rightVersion: ScriptVersion;
      };
      leftVersion.value = data?.leftVersion;
      rightVersion.value = data?.rightVersion;
    } else {
      leftVersion.value = undefined;
      rightVersion.value = undefined;
    }
  },
});
</script>

<template>
  <BasicModal :title="$t('ops.script.version.compare')" class="w-[1200px]">
    <div class="flex flex-col">
      <div class="mb-4 flex items-center justify-between px-2">
        <div class="flex items-center gap-2">
          <span class="font-semibold">{{ $t('ops.script.version.version') }}: {{ leftVersion?.version || '-' }}</span>
          <span class="text-sm text-gray-500">
            {{ leftVersion?.createdAt ? new Date(leftVersion.createdAt * 1000).toLocaleString() : '-' }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-semibold">{{ $t('ops.script.version.version') }}: {{ rightVersion?.version || '-' }}</span>
          <span class="text-sm text-gray-500">
            {{ rightVersion?.createdAt ? new Date(rightVersion.createdAt * 1000).toLocaleString() : '-' }}
          </span>
        </div>
      </div>

      <MonacoDiff
        :original-value="leftVersion?.content || ''"
        :modified-value="rightVersion?.content || ''"
        :language="language"
        height="700px"
      />
    </div>
  </BasicModal>
</template>
