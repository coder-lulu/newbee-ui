<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { addFullName, cloneDeep, listToTree } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { deptList } from '#/api/system/dept';
import { postAdd, postInfo, postUpdate } from '#/api/system/post';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { drawerSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    formItemClass: 'col-span-2',
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 80,
  },
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

async function setupDeptSelect() {
  const deptData = await deptList();
  for (const item of deptData) {
    // 如果 status = 1则 disabled = false
    item.disabled = item.status !== 1;
  }
  const deptTreeData = listToTree(deptData, { id: 'id', pid: 'parentId' });
  // 选中后显示在输入框的值 即父节点 / 子节点
  addFullName(deptTreeData, 'name', ' / ');
  formApi.updateSchema([
    {
      componentProps: {
        fieldNames: { label: 'name', value: 'id' },
        treeData: deptTreeData,
        treeDefaultExpandAll: true,
        treeLine: { showLeafIcon: false },
        // 选中后显示在输入框的值
        treeNodeLabelProp: 'fullName',
      },
      fieldName: 'deptId',
    },
  ]);
}

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
      return null;
    }
    drawerApi.drawerLoading(true);
    const { id } = drawerApi.getData() as { id?: number | string };
    isUpdate.value = !!id;
    // 初始化
    await setupDeptSelect();
    // 更新 && 赋值
    if (isUpdate.value && id) {
      const record = await postInfo(id);
      await formApi.setValues(record);
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
    await (isUpdate.value ? postUpdate(data) : postAdd(data));
    resetInitialized();
    emit('reload');
    drawerApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.resetForm();
  resetInitialized();
}
</script>

<template>
  <BasicDrawer :title="title" class="w-[600px]">
    <BasicForm />
  </BasicDrawer>
</template>
