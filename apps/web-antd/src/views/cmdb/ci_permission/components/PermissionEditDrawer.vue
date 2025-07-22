<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import {
  createPermission,
  getPermissionInfo,
  updatePermission,
} from '#/api/cmdb/ci-permission';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { drawerSchema } from '../data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? '编辑权限' : '新增权限';
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-1',
    labelWidth: 100,
  },
  layout: 'vertical',
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2 gap-x-4',
});

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(formApi),
    currentGetter: defaultFormValueGetter(formApi),
  },
);

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onBeforeClose,
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }
    drawerApi.drawerLoading(true);

    const { id } = drawerApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    // 更新 && 赋值
    if (isUpdate.value && id) {
      try {
        const record = await getPermissionInfo(id);

        // 转换时间戳为dayjs对象
        const formData = {
          ...record,
          effective_from: record.effective_from
            ? dayjs(record.effective_from * 1000)
            : undefined,
          effective_to: record.effective_to
            ? dayjs(record.effective_to * 1000)
            : undefined,
        };

        await formApi.setValues(formData);
      } catch (error) {
        console.error('获取权限信息失败:', error);
      }
    }

    await markInitialized();
    drawerApi.drawerLoading(false);
  },
});

async function handleConfirm() {
  try {
    drawerApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }

    const data = cloneDeep(await formApi.getValues());

    // 转换dayjs对象为时间戳
    if (data.effective_from) {
      data.effective_from = dayjs(data.effective_from).unix();
    }
    if (data.effective_to) {
      data.effective_to = dayjs(data.effective_to).unix();
    }

    await (isUpdate.value ? updatePermission(data) : createPermission(data));
    resetInitialized();
    emit('reload');
    drawerApi.close();
  } catch (error) {
    console.error('保存权限失败:', error);
  } finally {
    drawerApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.resetForm();
  resetInitialized();
}

// 定义开放的API
defineExpose({
  open: (id?: number | string) => {
    drawerApi.setData({ id });
    drawerApi.open();
  },
});
</script>

<template>
  <BasicDrawer :title="title" class="w-[800px]">
    <BasicForm />
  </BasicDrawer>
</template>
