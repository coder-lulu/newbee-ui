<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import {
  createOauthProvider,
  getOauthProviderById,
  updateOauthProvider,
} from '#/api/system/oauth';

import { modalSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 80,
  },
  schema: modalSchema(),
  showDefaultActions: false,
});

// async function setupCategorySelect() {
//   const listData = await categoryList();
//   const treeData = listToTree(listData, {
//     id: 'categoryId',
//     pid: 'parentId',
//   });
//   addFullName(treeData, 'categoryName', ' / ');
//   formApi.updateSchema([
//     {
//       fieldName: 'parentId',
//       componentProps: {
//         treeData,
//         treeLine: { showLeafIcon: false },
//         fieldNames: { label: 'categoryName', value: 'categoryId' },
//         treeDefaultExpandAll: true,
//         treeNodeLabelProp: 'fullName',
//         getPopupContainer,
//       },
//     },
//   ]);
// }

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
      const record = await getOauthProviderById(id);
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
    await (isUpdate.value
      ? updateOauthProvider(data)
      : createOauthProvider(data));
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
  <BasicModal
    :close-on-click-modal="false"
    :title="title"
    class="min-h-[500px]"
  >
    <BasicForm />
  </BasicModal>
</template>
