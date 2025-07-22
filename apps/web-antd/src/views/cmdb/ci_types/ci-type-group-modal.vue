<script setup lang="ts">
import { computed, ref } from 'vue';

// @ts-ignore
import { useVbenModal } from '@vben/common-ui';
// @ts-ignore
import { $t } from '@vben/locales';
// @ts-ignore
import { cloneDeep } from '@vben/utils';

// @ts-ignore
import { useVbenForm } from '#/adapter/form';
// @ts-ignore
import {
  createCiTypeGroup,
  getCiTypeGroupById,
  updateCiTypeGroup,
} from '#/api/cmdb/ci_types';

import { ciTypeGroupModalSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 80,
  },
  schema: ciTypeGroupModalSchema(),
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onCancel: handleCancel,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    modalApi.modalLoading(true);

    const { id } = modalApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await getCiTypeGroupById(id);
      await formApi.setValues(record);
    }

    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.modalLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = cloneDeep(await formApi.getValues());
    await (isUpdate.value ? updateCiTypeGroup(data) : createCiTypeGroup(data));
    emit('reload');
    await handleCancel();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.modalLoading(false);
  }
}

async function handleCancel() {
  modalApi.close();
  await formApi.resetForm();
}
</script>

<template>
  <BasicModal :close-on-click-modal="false" :title="title" class="w-[550px]">
    <BasicForm />
  </BasicModal>
</template>
