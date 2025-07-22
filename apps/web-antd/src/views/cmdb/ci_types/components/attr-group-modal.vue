<script setup lang="ts">
import { computed, defineExpose, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import {
  createAttributeGroup,
  getAttributeGroupById,
  updateAttributeGroup,
} from '#/api/cmdb/ci_types';

import { ciAttributeGroupModalSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 80,
  },
  schema: ciAttributeGroupModalSchema(),
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

    const { id, typeId } = modalApi.getData() as {
      id?: number | string;
      typeId?: number | string;
    };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await getAttributeGroupById(id);
      await formApi.setValues(record);
    } else {
      formApi.setValues({
        typeId: Number(typeId),
      });
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
    await (isUpdate.value
      ? updateAttributeGroup(data)
      : createAttributeGroup(data));
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

// 暴露modalApi和方法供外部使用
defineExpose({
  setData: modalApi.setData,
  open: modalApi.open,
  close: modalApi.close,
});
</script>

<script lang="ts">
export default {
  name: 'CiAttributeGroupEditModal',
};
</script>

<template>
  <BasicModal :close-on-click-modal="false" :title="title" class="w-[550px]">
    <BasicForm />
  </BasicModal>
</template>
